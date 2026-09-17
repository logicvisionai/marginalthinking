import fs from 'node:fs';
import path from 'node:path';
import {collectReports,reportView} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
if(!fs.existsSync(out))throw new Error('dist ausente');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const reports=collectReports(root);
const locales=Object.keys(cfg.locales||{});
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rx=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function localizedCard(block,locale){
  const item=reports.find(r=>block.includes(r.url));
  if(!item)return block;
  const view=reportView(item,locale);
  if(!view)return block;
  const href=reportPath(item,locale),lang=cfg.locales[locale]?.lang||locale;
  const reportSuffix=item.url.replace(/^\//,'');
  block=block.replace(new RegExp(`href="(?:/pt-br)?/${rx(reportSuffix)}"`,'g'),`href="${href}"`);
  block=block.replace(/<h3><a\b([^>]*)>[\s\S]*?<\/a><\/h3>/i,(m,attrs)=>{
    let a=attrs.replace(/\s+href="[^"]*"/i,'').replace(/\s+lang="[^"]*"/i,'');
    return `<h3><a${a} href="${href}" lang="${esc(lang)}">${esc(view.title||item.id)}</a></h3>`;
  });
  // Cards may contain badges or metadata nodes between the heading and the deck.
  // The first paragraph in these report-card article types is the canonical deck.
  block=block.replace(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/i,`<p>${esc(view.deck||'')}</p>`);
  const tags=(view.tags||[]).slice(0,5);
  if(tags.length){
    const archiveTags=tags.map(x=>`<span class="tag">${esc(x)}</span>`).join('');
    const chips=tags.map(x=>`<span>${esc(x)}</span>`).join('');
    block=block.replace(/<div class="tags">[\s\S]*?<\/div>/i,`<div class="tags">${archiveTags}</div>`);
    block=block.replace(/<div class="chips">[\s\S]*?<\/div>/i,`<div class="chips">${chips}</div>`);
  }
  if(view.markdown_url)block=block.replace(/href="[^"]+\.md"/g,`href="${esc(view.markdown_url)}"`);
  block=block.replace(/<span class="language-badge">[\s\S]*?<\/span>/gi,'');
  const search=[view.title,view.deck,view.regime,view.key_risk,...(view.tags||[]),...(view.keywords||[])].filter(Boolean).join(' ').toLowerCase();
  block=block.replace(/data-search="[^"]*"/i,`data-search="${esc(search)}"`);
  return block;
}

function fixCards(html,locale){
  return html.replace(/<article class="(?:archive-item|research-card(?: featured)?|related-card)"[\s\S]*?<\/article>/gi,m=>localizedCard(m,locale));
}

function setAnchor(body,href,active){
  const re=new RegExp(`<a href="${rx(href)}"([^>]*)>`,'g');
  return body.replace(re,(m,attrs)=>{
    let a=attrs.replace(/\s+class="active"/g,'').replace(/\s+aria-current="page"/g,'');
    if(active)a+=' class="active" aria-current="page"';
    return `<a href="${href}"${a}>`;
  });
}
function fixGeographyNav(html,locale,isGeo){
  if(!isGeo)return html;
  const research=pagePath(locale,'/reports.html'),regions=pagePath(locale,'/regions/');
  const patch=body=>setAnchor(setAnchor(body,research,false),regions,true);
  html=html.replace(/<nav class="nav"([^>]*)>([\s\S]*?)<\/nav>/i,(m,attrs,body)=>`<nav class="nav"${attrs}>${patch(body)}</nav>`);
  html=html.replace(/(<div class="mobile-menu"[\s\S]*?<nav>)([\s\S]*?)(<\/nav>[\s\S]*?<\/div>)/i,(m,start,body,end)=>`${start}${patch(body)}${end}`);
  return html;
}

let changed=0;
for(const file of walk(out).filter(f=>f.endsWith('.html'))){
  const rel=path.relative(out,file).split(path.sep).join('/');
  const locale=rel.startsWith('pt-br/')?'pt-BR':'en';
  if(!locales.includes(locale))continue;
  const isGeo=/^(?:pt-br\/)?(?:regions|countries)\//.test(rel);
  const before=fs.readFileSync(file,'utf8');
  let html=fixCards(before,locale);
  html=fixGeographyNav(html,locale,isGeo);
  if(html!==before){fs.writeFileSync(file,html);changed++;}
}
console.log(`Localized UI finalized: ${changed} HTML file(s) normalized for locale cards/navigation.`);
