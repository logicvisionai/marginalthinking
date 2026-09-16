import fs from 'node:fs';
import path from 'node:path';
import {collectReports,availableLocales} from './lib/reports.mjs';

const root=process.cwd(),out=path.join(root,'dist');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
const reports=collectReports(root),site=cfg.site_url.replace(/\/$/,''),locales=Object.keys(cfg.locales||{}),fail=[];
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const fileForUrl=u=>path.join(out,String(u).replace(/^\//,'').replace(/\/$/,'/index.html'));
const socialSlug=item=>path.basename(String(item.url||item.id||'research').replace(/\/$/,''),'.html').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
const socialPath=(item,locale)=>`/assets/og/${socialSlug(item)}-${locale.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.svg`;
const contentAttr=(html,kind,key)=>html.match(new RegExp(`<meta\\s+${kind}="${key}"\\s+content="([^"]*)"`,'i'))?.[1]||'';
const sitemap=fs.existsSync(path.join(out,'sitemap.xml'))?fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'):'';

for(const item of reports)for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
  const file=fileForUrl(reportPath(item,locale));if(!fs.existsSync(file)){fail.push(`${item.id}/${locale}: HTML ausente`);continue;}const html=fs.readFileSync(file,'utf8');
  const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'';if(!title||title.length>90)fail.push(`${item.id}/${locale}: title SEO ausente ou longo (${title.length})`);
  const description=contentAttr(html,'name','description');if(!description||description.length>170)fail.push(`${item.id}/${locale}: meta description ausente ou longa (${description.length})`);
  const og=contentAttr(html,'property','og:image'),expected=`${site}${socialPath(item,locale)}`;if(og!==expected)fail.push(`${item.id}/${locale}: og:image não é card específico`);
  const card=path.join(out,socialPath(item,locale).replace(/^\//,''));if(!fs.existsSync(card))fail.push(`${item.id}/${locale}: social card ausente`);
  if(!html.includes('"@type":"ScholarlyArticle"')||!html.includes(expected))fail.push(`${item.id}/${locale}: JSON-LD não referencia imagem específica`);
}

const checkCollection=(canonical,items)=>{for(const locale of locales){const url=pagePath(locale,canonical),file=fileForUrl(url),abs=`${site}${url}`;if(!fs.existsSync(file))return;const html=fs.readFileSync(file,'utf8');if(!items.length){if(!/name="robots" content="noindex,follow"/i.test(html))fail.push(`${url}: coleção vazia sem noindex`);if(sitemap.includes(`<loc>${abs}</loc>`))fail.push(`${url}: coleção vazia presente no sitemap`);}else if(!sitemap.includes(`<loc>${abs}</loc>`))fail.push(`${url}: coleção ativa ausente do sitemap`);}};
for(const id of Object.keys(taxonomy.programs||{}))checkCollection(`/research/${id}/`,reports.filter(r=>r.program===id));
for(const id of Object.keys(taxonomy.regions||{}))checkCollection(`/regions/${id}/`,reports.filter(r=>(r.geography?.regions||[]).includes(id)));
for(const id of Object.keys(taxonomy.topics||{}))checkCollection(`/topics/${id}/`,reports.filter(r=>(r.topics||[]).includes(id)));
for(const [id,s] of Object.entries(taxonomy.series||{})){checkCollection(`/series/${id}/`,reports.filter(r=>r.series===id));for(const domain of Object.keys(s.domains||{}))checkCollection(`/series/${id}/${domain}/`,reports.filter(r=>r.series===id&&r.series_domain===domain));}

const headers=fs.existsSync(path.join(out,'_headers'))?fs.readFileSync(path.join(out,'_headers'),'utf8'):'';if(!/\/reports\/\*\.md[\s\S]*X-Robots-Tag:\s*noindex, follow/i.test(headers))fail.push('_headers: Markdown noindex ausente');
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}console.log(`SEO validation OK: ${reports.length} research bundles, localized social cards, concise metadata and empty-collection index control.`);
