import fs from 'node:fs';
import path from 'node:path';
import {collectReports,availableLocales} from './lib/reports.mjs';

const cwd=process.cwd(),root=path.join(cwd,'dist'),fail=[],warn=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
if(!fs.existsSync(root)){console.error('FAIL dist ausente');process.exit(1);}
const cfg=JSON.parse(fs.readFileSync(path.join(cwd,'site.config.json'),'utf8'));
const reports=collectReports(cwd);
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const relFile=p=>String(p).replace(/^\//,'').replace(/\/$/,'/index.html');
const files=walk(root),html=files.filter(x=>x.endsWith('.html'));
const editorialBlockers=[
  /quem controla os gargalos necessários/i,
  /controle de gargalos/i,
  /funil causal/i,
  /preço de controle do sistema/i,
  /gargalo marginal/i,
  /principal reservatório financeiro/i,
  /claims bancários cross-border/i,
  /\bcollateral\b/i,
  /\bmidstream\b/i,
  /captura desigual do valor/i,
  /poder de captura de renda/i
];
for(const file of html){
  const rel=path.relative(root,file).split(path.sep).join('/'),s=fs.readFileSync(file,'utf8');
  if(!/<html\s+lang="[^"]+"/i.test(s))fail.push(`${rel}: html lang ausente`);
  if(!/<meta\s+name="viewport"/i.test(s))fail.push(`${rel}: viewport ausente`);
  for(const css of ['language-switch.css','layout-guardrails.css','mobile-nav-fix.css'])if(!new RegExp(`<link\\s+rel="stylesheet"\\s+href="\\/assets\\/css\\/${css.replace('.','\\.')}`,'i').test(s))fail.push(`${rel}: stylesheet ${css} ausente`);
  if(!/<div class="language-switch"/i.test(s)&&!rel.endsWith('404.html'))fail.push(`${rel}: seletor de idioma ausente`);
  if(!/<h1[\s>]/i.test(s)&&!rel.endsWith('404.html'))fail.push(`${rel}: H1 ausente`);
  if(/Carregando pesquisa|Loading research/i.test(s))fail.push(`${rel}: conteúdo dependente de client-side renderer`);
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(s))fail.push(`${rel}: referência binária proibida`);
  if(/<ol(?:\s[^>]*)?>[\s\S]*?<li[^>]*>\s*\d+[.)]\s+/i.test(s))fail.push(`${rel}: marcador numérico duplicado em lista ordenada`);
  if(/<ul(?:\s[^>]*)?>[\s\S]*?<li[^>]*>\s*[-+*•]\s+/i.test(s))fail.push(`${rel}: marcador duplicado em lista não ordenada`);
  if(rel.includes('reports/')&&!rel.endsWith('404.html')){
    if(!/rel="canonical"/i.test(s))fail.push(`${rel}: canonical ausente`);
    if(!/application\/ld\+json/i.test(s))fail.push(`${rel}: JSON-LD ausente`);
    if(!/hreflang="en"/i.test(s))fail.push(`${rel}: hreflang en ausente`);
    if(!/hreflang="pt-BR"/i.test(s))fail.push(`${rel}: hreflang pt-BR ausente`);
    if(!/author-signature/i.test(s)&&!/noindex,follow/i.test(s))fail.push(`${rel}: assinatura editorial ausente`);
    const visible=s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<pre[\s\S]*?<\/pre>/gi,'').replace(/<code[\s\S]*?<\/code>/gi,'');
    if(/\*\*[^<\n]*$|__[^<\n]*$/m.test(visible))warn.push(`${rel}: possível marcador markdown residual`);
    if(rel.startsWith('pt-br/reports/'))for(const rx of editorialBlockers)if(rx.test(visible))fail.push(`${rel}: formulação editorial bloqueada (${rx})`);
  }
}
for(const required of ['sitemap.xml','robots.txt','feed.xml','index.html','reports.html','pt-br/index.html','pt-br/reports.html','assets/css/language-switch.css','assets/css/layout-guardrails.css','assets/css/mobile-nav-fix.css'])if(!fs.existsSync(path.join(root,required)))fail.push(`${required}: artefato gerado ausente`);
for(const item of reports){
  const locales=availableLocales(item);
  for(const locale of ['en','pt-BR']){
    if(!locales.includes(locale)){fail.push(`${item.id}: edição ${locale} ausente no source`);continue;}
    const expected=path.join(root,relFile(pagePath(locale,item.url)));
    if(!fs.existsSync(expected))fail.push(`${item.id}/${locale}: HTML gerado ausente (${path.relative(root,expected)})`);
  }
}
for(const file of files.filter(x=>x.endsWith('.md')&&!x.endsWith('/en.md'))){
  const rel=path.relative(root,file).split(path.sep).join('/'),s=fs.readFileSync(file,'utf8');
  for(const rx of editorialBlockers)if(rx.test(s))fail.push(`${rel}: formulação editorial bloqueada no Markdown público (${rx})`);
}
const languageCss=path.join(root,'assets/css/language-switch.css');
if(fs.existsSync(languageCss)){
  const css=fs.readFileSync(languageCss,'utf8');
  for(const selector of ['.header-row>.language-switch','.mobile-language .language-switch','.mobile-menu .mobile-language .language-switch a'])if(!css.includes(selector))fail.push(`language-switch.css: regra responsiva ausente ${selector}`);
}
const guardCss=path.join(root,'assets/css/layout-guardrails.css');
if(fs.existsSync(guardCss)){
  const css=fs.readFileSync(guardCss,'utf8');
  for(const token of ['overflow-wrap:anywhere','.citation-actions','.md-table-wrap'])if(!css.replace(/\s+/g,'').includes(token.replace(/\s+/g,'')))fail.push(`layout-guardrails.css: proteção ausente ${token}`);
}
const navCss=path.join(root,'assets/css/mobile-nav-fix.css');
if(fs.existsSync(navCss)){
  const css=fs.readFileSync(navCss,'utf8').replace(/\s+/g,'');
  for(const token of ['.mobile-menu{position:fixed','top:var(--mobile-menu-top','body.menu-open{overflow:visible'])if(!css.includes(token.replace(/\s+/g,'')))fail.push(`mobile-nav-fix.css: proteção ausente ${token}`);
}
if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Rendered output validation OK: ${html.length} HTML pages; ${reports.length} bilingual reports; editorial language and layout guardrails present.`);
