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
const rx=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const archiveBlock=(html,item)=>[...html.matchAll(/<article class="archive-item"[\s\S]*?<\/article>/gi)].map(m=>m[0]).find(x=>x.includes(item.url));

for(const locale of Object.keys(cfg.locales||{})){
  const archive=fileFor(pagePath(locale,'/reports.html'));
  if(!fs.existsSync(archive)){fail.push(`${locale}: arquivo de pesquisas ausente`);continue;}
  const html=fs.readFileSync(archive,'utf8');
  for(const item of reports){
    const v=reportView(item,locale);if(!v)continue;
    const title=esc(v.title||''),deck=esc(v.deck||''),href=reportPath(item,locale);
    const block=archiveBlock(html,item);
    if(!block){fail.push(`${item.id}/${locale}: card ausente do arquivo`);continue;}
    if(title&&!block.includes(`>${title}</a>`))fail.push(`${item.id}/${locale}: título do card não corresponde ao locale selecionado`);
    if(deck&&!block.includes(`<p>${deck}</p>`))fail.push(`${item.id}/${locale}: deck do card não corresponde ao locale selecionado`);
    if(!block.includes(`href="${href}"`))fail.push(`${item.id}/${locale}: link do card não aponta para a edição localizada (${href})`);
    const source=item.source_locale||'en',sourceView=reportView(item,source);
    if(locale!==source&&sourceView?.title&&sourceView.title!==v.title&&block.includes(`>${esc(sourceView.title)}</a>`))fail.push(`${item.id}/${locale}: card contém título do idioma-fonte`);
    const page=fileFor(href);
    if(!fs.existsSync(page)){fail.push(`${item.id}/${locale}: página localizada ausente (${href})`);continue;}
    const pageHtml=fs.readFileSync(page,'utf8');
    if(title&&!pageHtml.includes(`<h1>${title}</h1>`))fail.push(`${item.id}/${locale}: H1 não corresponde ao metadata localizado`);
    const declared=`<html lang="${cfg.locales[locale]?.lang||locale}"`;
    if(!pageHtml.includes(declared))fail.push(`${item.id}/${locale}: html lang incorreto`);
  }

  const geoUrl=pagePath(locale,'/regions/'),geoFile=fileFor(geoUrl);
  if(!fs.existsSync(geoFile))fail.push(`${locale}: página Países & Regiões ausente`);
  else{
    const geo=fs.readFileSync(geoFile,'utf8'),research=pagePath(locale,'/reports.html');
    const geoActive=new RegExp(`<a href="${rx(geoUrl)}"[^>]*class="active"[^>]*aria-current="page"|<a href="${rx(geoUrl)}"[^>]*aria-current="page"[^>]*class="active"`,'g');
    const activeCount=(geo.match(geoActive)||[]).length;
    if(activeCount<2)fail.push(`${locale}: Países & Regiões deve estar ativo no desktop e mobile`);
    const researchActive=new RegExp(`<a href="${rx(research)}"[^>]*(?:class="active"|aria-current="page")`,'i');
    if(researchActive.test(geo))fail.push(`${locale}: Pesquisas não pode permanecer ativo em Países & Regiões`);
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

// The archive is server-rendered correctly, but app.js rebuilds it after first paint.
// Guard against the exact regression where canonical EN data overwrites /pt-br/reports.
const clientFile=path.join(dist,'assets','js','app.js');
if(!fs.existsSync(clientFile))fail.push('cliente: dist/assets/js/app.js ausente');
else{
  const client=fs.readFileSync(clientFile,'utf8');
  const localizeAt=client.indexOf('data=localizedResearchData(data);');
  const renderAt=client.indexOf('renderArchive(data);');
  if(!client.includes("const code=isPt()?'pt-BR':'en'"))fail.push('cliente: seleção explícita do locale ausente');
  if(localizeAt<0)fail.push('cliente: índice de pesquisas não é localizado antes do render dinâmico');
  if(renderAt>=0&&localizeAt>renderAt)fail.push('cliente: renderArchive ocorre antes da localização dos dados');
}

const publicReportsFile=path.join(dist,'data','reports.json');
if(!fs.existsSync(publicReportsFile))fail.push('cliente: dist/data/reports.json ausente');
else{
  const publicReports=JSON.parse(fs.readFileSync(publicReportsFile,'utf8'));
  const byId=new Map(publicReports.map(x=>[x.id,x]));
  for(const item of reports){
    const pub=byId.get(item.id);if(!pub){fail.push(`${item.id}: ausente do índice público`);continue;}
    for(const locale of availableLocales(item).filter(x=>cfg.locales[x])){
      const hasView=Boolean(pub.locale_views?.[locale]||(pub.source_locale===locale)||(pub.translations?.[locale]));
      if(!hasView)fail.push(`${item.id}/${locale}: índice público sem view necessária ao render cliente`);
    }
  }
}

if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Localized output OK: ${reports.length} reports verified across ${Object.keys(cfg.locales||{}).length} locales; static and client-side archive rendering are locale-safe.`);
