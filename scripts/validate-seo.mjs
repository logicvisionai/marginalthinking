import fs from 'node:fs';
import path from 'node:path';
import {collectReports,availableLocales} from './lib/reports.mjs';

const root=process.cwd(),out=path.join(root,'dist');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
const seoOverrides=JSON.parse(fs.readFileSync(path.join(root,'data/seo-overrides.json'),'utf8'));
const reports=collectReports(root),site=cfg.site_url.replace(/\/$/,''),locales=Object.keys(cfg.locales||{}),fail=[];
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const fileForUrl=u=>{let p=String(u).replace(/^\/+/, '');if(!p||p.endsWith('/'))p+='index.html';return path.join(out,p);};
const localeSlug=locale=>locale.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const socialSlug=item=>path.basename(String(item.url||item.id||'research').replace(/\/$/,''),'.html').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
const socialPath=(item,locale)=>`/assets/og/${socialSlug(item)}-${localeSlug(locale)}.png`;
const institutionalSocialPath=locale=>`/assets/og/marginal-thinking-${localeSlug(locale)}.png`;
const contentAttr=(html,kind,key)=>html.match(new RegExp(`<meta\\s+${kind}="${key}"\\s+content="([^"]*)"`,'i'))?.[1]||'';
const sitemap=fs.existsSync(path.join(out,'sitemap.xml'))?fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'):'';
const htmlTitle=html=>html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'';
const normalizeEntities=s=>String(s||'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').trim();


for(const item of reports)for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
  const file=fileForUrl(reportPath(item,locale));if(!fs.existsSync(file)){fail.push(`${item.id}/${locale}: HTML ausente`);continue;}const html=fs.readFileSync(file,'utf8');
  const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'';if(!title||title.length>90)fail.push(`${item.id}/${locale}: title SEO ausente ou longo (${title.length})`);
  const description=contentAttr(html,'name','description');if(!description||description.length>170)fail.push(`${item.id}/${locale}: meta description ausente ou longa (${description.length})`);
  const og=contentAttr(html,'property','og:image'),expected=`${site}${socialPath(item,locale)}`;if(og!==expected)fail.push(`${item.id}/${locale}: og:image não é PNG específico`);
  if(contentAttr(html,'property','og:image:type')!=='image/png')fail.push(`${item.id}/${locale}: og:image:type deve ser image/png`);
  if(contentAttr(html,'property','og:image:width')!=='1200'||contentAttr(html,'property','og:image:height')!=='630')fail.push(`${item.id}/${locale}: dimensões Open Graph incorretas`);
  if(!contentAttr(html,'property','og:description'))fail.push(`${item.id}/${locale}: og:description ausente`);
  const card=path.join(out,socialPath(item,locale).replace(/^\//,''));if(!fs.existsSync(card)||fs.statSync(card).size<5000)fail.push(`${item.id}/${locale}: social card PNG ausente/inválido`);
  if(!html.includes('"@type":"ScholarlyArticle"')||!html.includes(expected))fail.push(`${item.id}/${locale}: JSON-LD não referencia imagem específica`);
  if(/\.svg(?:"|\?|$)/i.test(og))fail.push(`${item.id}/${locale}: LinkedIn social image não pode permanecer SVG`);
}


for(const [route,byLocale] of Object.entries(seoOverrides.pages||{}))for(const [locale,expected] of Object.entries(byLocale||{})){
  if(!cfg.locales[locale])continue;
  const file=fileForUrl(pagePath(locale,route));if(!fs.existsSync(file)){fail.push(`SEO override page missing: ${locale} ${route}`);continue;}
  const html=fs.readFileSync(file,'utf8'),title=normalizeEntities(htmlTitle(html)),description=normalizeEntities(contentAttr(html,'name','description'));
  if(title!==expected.title)fail.push(`${locale}${route}: SEO override title mismatch (${title})`);
  if(description!==expected.description)fail.push(`${locale}${route}: SEO override description mismatch`);
  if(normalizeEntities(contentAttr(html,'property','og:title'))!==expected.title)fail.push(`${locale}${route}: og:title does not match SEO override`);
  if(normalizeEntities(contentAttr(html,'property','og:description'))!==expected.description)fail.push(`${locale}${route}: og:description does not match SEO override`);
}
for(const [id,byLocale] of Object.entries(seoOverrides.reports||{})){
  const item=reports.find(x=>x.id===id);if(!item){fail.push(`SEO override report missing: ${id}`);continue;}
  for(const [locale,expected] of Object.entries(byLocale||{})){
    if(!cfg.locales[locale])continue;
    const file=fileForUrl(reportPath(item,locale));if(!fs.existsSync(file)){fail.push(`${id}/${locale}: SEO override HTML missing`);continue;}
    const html=fs.readFileSync(file,'utf8'),title=normalizeEntities(htmlTitle(html)),description=normalizeEntities(contentAttr(html,'name','description'));
    const expectedTitle=`${expected.title} | ${cfg.site_name}`;
    if(title!==expectedTitle)fail.push(`${id}/${locale}: SEO override title mismatch (${title})`);
    if(description!==expected.description)fail.push(`${id}/${locale}: SEO override description mismatch`);
    if(normalizeEntities(contentAttr(html,'property','og:title'))!==expected.title)fail.push(`${id}/${locale}: og:title does not match SEO override`);
  }
}

for(const locale of locales){
  const expected=`${site}${institutionalSocialPath(locale)}`,card=path.join(out,institutionalSocialPath(locale).replace(/^\//,''));
  if(!fs.existsSync(card)||fs.statSync(card).size<5000)fail.push(`${locale}: card institucional PNG ausente/inválido`);
  for(const canonical of ['/','/reports.html','/about.html','/methodology.html','/what-is-marginal-thinking/']){
    const file=fileForUrl(pagePath(locale,canonical));if(!fs.existsSync(file))continue;const html=fs.readFileSync(file,'utf8');
    if(contentAttr(html,'property','og:image')!==expected)fail.push(`${pagePath(locale,canonical)}: og:image institucional incorreto`);
    if(contentAttr(html,'property','og:image:type')!=='image/png')fail.push(`${pagePath(locale,canonical)}: og:image:type institucional incorreto`);
    const desc=contentAttr(html,'property','og:description');if(!desc||!desc.toLowerCase().includes('marginal thinking'))fail.push(`${pagePath(locale,canonical)}: descrição institucional Open Graph ausente`);
    if(contentAttr(html,'name','twitter:image')!==expected)fail.push(`${pagePath(locale,canonical)}: twitter:image institucional incorreto`);
  }
}

const checkCollection=(canonical,items)=>{for(const locale of locales){const url=pagePath(locale,canonical),file=fileForUrl(url),abs=`${site}${url}`;if(!fs.existsSync(file))return;const html=fs.readFileSync(file,'utf8');if(!items.length){if(!/name="robots" content="noindex,follow"/i.test(html))fail.push(`${url}: coleção vazia sem noindex`);if(sitemap.includes(`<loc>${abs}</loc>`))fail.push(`${url}: coleção vazia presente no sitemap`);}else if(!sitemap.includes(`<loc>${abs}</loc>`))fail.push(`${url}: coleção ativa ausente do sitemap`);}};
for(const id of Object.keys(taxonomy.programs||{}))checkCollection(`/research/${id}/`,reports.filter(r=>r.program===id));
for(const id of Object.keys(taxonomy.regions||{}))checkCollection(`/regions/${id}/`,reports.filter(r=>(r.geography?.regions||[]).includes(id)));
for(const id of Object.keys(taxonomy.topics||{}))checkCollection(`/topics/${id}/`,reports.filter(r=>(r.topics||[]).includes(id)));
for(const [id,s] of Object.entries(taxonomy.series||{})){checkCollection(`/series/${id}/`,reports.filter(r=>r.series===id));for(const domain of Object.keys(s.domains||{}))checkCollection(`/series/${id}/${domain}/`,reports.filter(r=>r.series===id&&r.series_domain===domain));}

const headers=fs.existsSync(path.join(out,'_headers'))?fs.readFileSync(path.join(out,'_headers'),'utf8'):'';if(!/\/reports\/\*\.md[\s\S]*X-Robots-Tag:\s*noindex, follow/i.test(headers))fail.push('_headers: Markdown noindex ausente');
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}console.log(`SEO validation OK: ${reports.length} research bundles with PNG social cards, institutional Open Graph descriptions and empty-collection index control.`);
