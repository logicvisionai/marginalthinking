import fs from 'node:fs';
import path from 'node:path';
import {canonicalizePublicUrl} from './lib/public-url.mjs';

const root=process.cwd(),out=path.join(root,'dist');
if(!fs.existsSync(out)){console.error('FAIL dist ausente para validação de URLs públicas');process.exit(1);}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8')),site=cfg.site_url.replace(/\/$/,'');
const baseHost=new URL(site).hostname.toLowerCase().replace(/^www\./,'');
const hostRx=baseHost.replace(/[.*+?^\${}()|[\\]\\]/g,'\\$&');
const absoluteRx=new RegExp(`https?:\\/\\/(?:www\\.)?${hostRx}(?::\\d+)?(?:\\/[^\\s"'<>)]*)?`,'gi');
const quotedRootHtmlRx=/(["'])(\/[^"'<>]*?\.html(?:[?#][^"'<>]*)?)\1/g;
const textExtensions=new Set(['.html','.xml','.json','.txt']),fail=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const files=walk(out);

for(const file of files){
  if(!textExtensions.has(path.extname(file).toLowerCase()))continue;
  const rel=path.relative(out,file).split(path.sep).join('/'),text=fs.readFileSync(file,'utf8');
  for(const raw of text.match(absoluteRx)||[]){
    const canonical=canonicalizePublicUrl(raw,site);
    if(canonical!==raw)fail.push(`${rel}: referência first-party não canônica ${raw} -> ${canonical}`);
  }
  if(quotedRootHtmlRx.test(text))fail.push(`${rel}: referência pública root-relative ainda usa .html`);
  quotedRootHtmlRx.lastIndex=0;
}

function publicRoute(rel){
  if(rel==='index.html')return'/';
  if(rel.endsWith('/index.html'))return`/${rel.slice(0,-'index.html'.length)}`;
  if(rel.endsWith('.html'))return`/${rel.slice(0,-'.html'.length)}`;
  return null;
}
function canonicalHref(html){
  for(const m of html.matchAll(/<link\b[^>]*>/gi)){
    const tag=m[0],rel=tag.match(/\brel=(["'])([^"']*)\1/i)?.[2]||'';
    if(!rel.split(/\s+/).some(x=>x.toLowerCase()==='canonical'))continue;
    return tag.match(/\bhref=(["'])([^"']+)\1/i)?.[2]||'';
  }
  return'';
}

for(const file of files.filter(x=>x.endsWith('.html'))){
  const rel=path.relative(out,file).split(path.sep).join('/');
  if(rel==='404.html'||rel.endsWith('/404.html'))continue;
  const route=publicRoute(rel),html=fs.readFileSync(file,'utf8'),canonical=canonicalHref(html);
  if(!route)continue;
  const expected=`${site}${route}`;
  if(!canonical)fail.push(`${rel}: canonical ausente no artefato final`);
  else if(canonical!==expected)fail.push(`${rel}: canonical ${canonical} deveria ser ${expected}`);
}

const sitemapFile=path.join(out,'sitemap.xml');
if(!fs.existsSync(sitemapFile))fail.push('sitemap.xml ausente');
else{
  const xml=fs.readFileSync(sitemapFile,'utf8'),locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  const seen=new Set();
  for(const loc of locs){
    const canonical=canonicalizePublicUrl(loc,site);
    if(loc!==canonical)fail.push(`sitemap.xml: URL não canônica ${loc}`);
    if(seen.has(loc))fail.push(`sitemap.xml: URL duplicada após normalização ${loc}`);
    seen.add(loc);
  }
}

if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log('Public URL validation OK: HTTPS apex host, Cloudflare extensionless HTML routes, self-canonicals and sitemap are consistent.');
