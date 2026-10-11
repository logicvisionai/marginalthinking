import fs from 'node:fs';
import path from 'node:path';

const importantRoutes = [
  '/', '/pt-br/', '/about', '/what-is-marginal-thinking/',
  '/reports/2026/09/2026-09-15-global-macro',
  '/reports/2026/09/2026-09-22-global-monetary-institutions',
  '/pt-br/reports/2026/09/2026-09-22-global-monetary-institutions',
  '/reports/2026/09/2026-09-25-global-macro',
  '/reports/2026/10/2026-10-03-global-macro'
];
const tags=(html,tag)=>Array.from(html.matchAll(new RegExp('<'+tag+'\\b[^>]*>','gi')),x=>x[0]);
const attr=(tag,name)=>tag.match(new RegExp('\\b'+name+'\\s*=\\s*(["\\\'])(.*?)\\1','i'))?.[2]||'';
const links=html=>tags(html,'link');
const canonical=html=>links(html).filter(t=>attr(t,'rel').toLowerCase().split(/\s+/).includes('canonical')).map(t=>attr(t,'href'));
const robots=html=>tags(html,'meta').filter(t=>['robots','googlebot'].includes(attr(t,'name').toLowerCase())).map(t=>attr(t,'content')).join(',').toLowerCase();
const alternate=html=>Object.fromEntries(links(html).filter(t=>attr(t,'rel').toLowerCase().split(/\s+/).includes('alternate')&&attr(t,'hreflang')).map(t=>[attr(t,'hreflang').toLowerCase(),attr(t,'href')]));
const htmlFile=(dist,p)=>path.join(dist,p.replace(/^\//,'')+(p.endsWith('/')?'index.html':'.html'));
const localizedLang=p=>p.startsWith('/pt-br/')?'pt-br':'en';

export function auditSearchIndexability({dist,siteUrl,importantPages=importantRoutes}){
  const errors=[];const site=new URL(siteUrl).origin;const sitemap=path.join(dist,'sitemap.xml');
  if(!fs.existsSync(sitemap))return {errors:['sitemap.xml missing'],checked:0};
  const urls=Array.from(fs.readFileSync(sitemap,'utf8').matchAll(/<loc>([^<]+)<\/loc>/g),m=>m[1].replace(/&amp;/g,'&'));
  if(!urls.length)errors.push('sitemap is empty');
  const pages=new Map();
  for(const u of urls){
    if(pages.has(u)){errors.push('duplicate sitemap URL: '+u);continue;}
    let url;
    try{url=new URL(u);}catch{errors.push('invalid sitemap URL: '+u);continue;}
    if(url.origin!==site||url.search||url.hash||url.pathname.endsWith('.html')||url.pathname.endsWith('/index.html')){
      errors.push('noncanonical sitemap URL: '+u);continue;
    }
    const f=htmlFile(dist,url.pathname);
    if(!fs.existsSync(f)){errors.push('missing HTML for sitemap URL: '+u);continue;}
    const html=fs.readFileSync(f,'utf8');const c=canonical(html);
    if(c.length!==1||c[0]!==u)errors.push('canonical mismatch: '+u+' -> '+c.join(','));
    if(/(?:^|[,\s])noindex(?:[,\s]|$)/.test(robots(html)))errors.push('noindex page in sitemap: '+u);
    const lang=attr(html.match(/<html\b[^>]*>/i)?.[0]||'','lang').toLowerCase();
    if(lang!==localizedLang(url.pathname))errors.push('html lang mismatch: '+u+' ('+lang+')');
    if(!/<h1(?:\s|>)/i.test(html))errors.push('missing H1: '+u);
    pages.set(u,{lang,alternate:alternate(html)});
  }
  for(const [u,page] of pages){
    for(const [lang,target] of Object.entries(page.alternate)){
      if(!['en','pt-br'].includes(lang))continue;
      const other=pages.get(target);
      if(!other)errors.push('hreflang target missing from sitemap: '+u+' -> '+target);
      else{
        if(other.lang!==lang)errors.push('hreflang language mismatch: '+u+' -> '+target);
        if(other.alternate[page.lang]!==u)errors.push('nonreciprocal hreflang: '+u+' -> '+target);
      }
    }
  }
  for(const p of importantPages)if(!pages.has(site+p))errors.push('historical Search Console landing page missing: '+site+p);
  return {errors,checked:pages.size,sitemapEntries:urls.length};
}

if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
  const config=JSON.parse(fs.readFileSync('site.config.json','utf8'));
  const result=auditSearchIndexability({dist:path.resolve('dist'),siteUrl:config.site_url});
  for(const error of result.errors)console.error('FAIL '+error);
  console.log('SEO indexability: '+result.checked+'/'+result.sitemapEntries+' valid sitemap entries');
  if(result.errors.length)process.exitCode=1;
}
