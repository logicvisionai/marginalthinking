import fs from 'node:fs';
import path from 'node:path';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';

const root=process.cwd(),dist=path.join(root,'dist');
if(!fs.existsSync(dist)){console.error('FAIL dist ausente');process.exit(1);}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const reports=collectReports(root),fail=[];
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const fileFor=u=>path.join(dist,String(u).replace(/^\//,'').replace(/\/$/,'/index.html'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

for(const locale of Object.keys(cfg.locales||{})){
  const archive=fileFor(pagePath(locale,'/reports.html'));
  if(!fs.existsSync(archive)){fail.push(`${locale}: arquivo de pesquisas ausente`);continue;}
  const html=fs.readFileSync(archive,'utf8');
  for(const item of reports){
    const v=reportView(item,locale);if(!v)continue;
    const title=esc(v.title||'');
    const href=reportPath(item,locale);
    if(title&&!html.includes(`>${title}</a>`))fail.push(`${item.id}/${locale}: título localizado ausente do arquivo`);
    if(!html.includes(`href="${href}"`))fail.push(`${item.id}/${locale}: link localizado ausente do arquivo (${href})`);
    const page=fileFor(href);
    if(!fs.existsSync(page)){fail.push(`${item.id}/${locale}: página localizada ausente (${href})`);continue;}
    const pageHtml=fs.readFileSync(page,'utf8');
    if(title&&!pageHtml.includes(`<h1>${title}</h1>`))fail.push(`${item.id}/${locale}: H1 não corresponde ao metadata localizado`);
    const declared=`<html lang="${cfg.locales[locale]?.lang||locale}"`;
    if(!pageHtml.includes(declared))fail.push(`${item.id}/${locale}: html lang incorreto`);
  }
}

const searchFile=path.join(dist,'data','search-index.json');
if(fs.existsSync(searchFile)){
  const search=JSON.parse(fs.readFileSync(searchFile,'utf8'));
  for(const locale of Object.keys(cfg.locales||{})){
    const entries=new Map((search.locales?.[locale]||[]).filter(x=>x.type==='report').map(x=>[x.id,x]));
    for(const item of reports){
      if(!availableLocales(item).includes(locale))continue;
      const v=reportView(item,locale),entry=entries.get(item.id);
      if(!entry)fail.push(`${item.id}/${locale}: ausente do índice de busca localizado`);
      else if(entry.title!==v.title)fail.push(`${item.id}/${locale}: título incorreto no índice de busca`);
    }
  }
}

if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Localized output OK: ${reports.length} reports verified across ${Object.keys(cfg.locales||{}).length} locales.`);
