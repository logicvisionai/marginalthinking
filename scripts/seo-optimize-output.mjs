import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
if(!fs.existsSync(out))throw new Error('dist ausente para SEO optimization');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
const reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,'');
const locales=Object.keys(cfg.locales||{});
const pagePath=(locale,p)=>{const prefix=cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:'';return `${prefix}${p}`.replace(/\/+/g,'/');};
const reportPath=(item,locale)=>pagePath(locale,item.url);
const fileForUrl=u=>path.join(out,String(u).replace(/^\//,'').replace(/\/$/,'/index.html'));
const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escXml=escHtml;
const rxEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const compact=(value,max)=>{const s=String(value||'').replace(/\s+/g,' ').trim();if(s.length<=max)return s;const slice=s.slice(0,max+1);const cut=slice.lastIndexOf(' ');return `${slice.slice(0,cut>max*.62?cut:max).replace(/[,:;\-–—\s]+$/,'')}…`;};
const seoTitle=value=>compact(value,62);
const seoDescription=value=>compact(value,158);
const dateIso=v=>String(v||'').slice(0,10);
const lastDate=items=>items.map(x=>dateIso(x.updated_at||x.qa_reviewed_at||x.published_at||x.date)).filter(Boolean).sort().at(-1)||'';
const localeSlug=locale=>locale.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const socialSlug=item=>path.basename(String(item.url||item.id||'research').replace(/\/$/,''),'.html').replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
const socialPath=(item,locale)=>`/assets/og/${socialSlug(item)}-${localeSlug(locale)}.png`;
const institutionalSocialPath=locale=>`/assets/og/marginal-thinking-${localeSlug(locale)}.png`;
const institutionalDescription=locale=>cfg.social_descriptions?.[locale]||cfg.social_descriptions?.[cfg.default_locale]||'Marginal Thinking — independent research on economics, politics and society.';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

function wrapText(value,maxChars=38,maxLines=4){
  const words=String(value||'').replace(/\s+/g,' ').trim().split(' ').filter(Boolean),lines=[];let line='';
  for(const word of words){const next=line?`${line} ${word}`:word;if(next.length<=maxChars){line=next;continue;}if(line)lines.push(line);line=word;if(lines.length===maxLines-1)break;}
  if(lines.length<maxLines&&line)lines.push(line);
  const used=lines.join(' ').split(' ').length;
  if(used<words.length&&lines.length)lines[lines.length-1]=lines[lines.length-1].replace(/[.,;:!?\s]+$/,'')+'…';
  return lines.slice(0,maxLines);
}
function brandMark(x=72,y=68){return `<g transform="translate(${x} ${y})"><polygon points="0,8 18,0 18,104 0,96" fill="#0a1b25"/><polygon points="18,0 28,7 28,96 18,104" fill="#1296b5"/><path d="M18 0v104" stroke="#e8e3d7" stroke-opacity=".55"/></g>`;}
function renderSocialCard(item,locale,view){
  const title=wrapText(view.title||item.id,37,4),program=label(taxonomy.programs?.[item.program],locale,item.program||item.kind||'Research'),date=dateIso(item.published_at||item.date),pt=locale==='pt-BR';
  const lines=title.map((x,i)=>`<text x="112" y="${252+i*66}" font-family="Arial,Helvetica,sans-serif" font-size="52" font-weight="600" fill="#101a20">${escXml(x)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">${escXml(view.title||item.id)}</title><desc id="desc">${escXml(view.deck||'Marginal Thinking research')}</desc><rect width="1200" height="630" fill="#f4f1e8"/><rect width="1200" height="14" fill="#09131a"/><path d="M72 194H1128M72 532H1128" stroke="#c8c4ba" stroke-width="1"/>${brandMark(72,54)}<text x="124" y="86" font-family="Arial,Helvetica,sans-serif" font-size="24" letter-spacing="4" font-weight="700" fill="#101a20">MARGINAL THINKING</text><text x="124" y="120" font-family="Arial,Helvetica,sans-serif" font-size="18" letter-spacing="2" fill="#5f6d74">${escXml(pt?'PESQUISA INDEPENDENTE · LOGV RESEARCH':'INDEPENDENT RESEARCH · LOGV RESEARCH')}</text><text x="112" y="174" font-family="Arial,Helvetica,sans-serif" font-size="21" letter-spacing="1.2" fill="#476170">${escXml(program)}</text>${lines}<text x="112" y="582" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#617078">${escXml(date)} · ${escXml(pt?'ECONOMIA · POLÍTICA · SOCIEDADE':'ECONOMICS · POLITICS · SOCIETY')}</text><text x="1088" y="582" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#617078">marginalthinking.org</text></svg>`;
}
function renderInstitutionalCard(locale){
  const pt=locale==='pt-BR',desc=institutionalDescription(locale),lines=wrapText(desc,54,3);
  const text=lines.map((x,i)=>`<text x="112" y="${310+i*58}" font-family="Arial,Helvetica,sans-serif" font-size="38" font-weight="500" fill="#172126">${escXml(x)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">Marginal Thinking</title><desc id="desc">${escXml(desc)}</desc><rect width="1200" height="630" fill="#f4f1e8"/><rect width="1200" height="16" fill="#09131a"/><path d="M72 188H1128M72 528H1128" stroke="#c8c4ba"/>${brandMark(72,56)}<text x="124" y="90" font-family="Arial,Helvetica,sans-serif" font-size="28" letter-spacing="5" font-weight="700" fill="#101a20">MARGINAL THINKING</text><text x="124" y="128" font-family="Arial,Helvetica,sans-serif" font-size="19" letter-spacing="2.4" fill="#5f6d74">${escXml(pt?'PESQUISA INDEPENDENTE · LOGV RESEARCH':'INDEPENDENT RESEARCH · LOGV RESEARCH')}</text><text x="112" y="244" font-family="Arial,Helvetica,sans-serif" font-size="22" letter-spacing="2.2" fill="#476170">${escXml(pt?'ECONOMIA · POLÍTICA · SOCIEDADE':'ECONOMICS · POLITICS · SOCIETY')}</text>${text}<text x="112" y="582" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#617078">${escXml(pt?'Capital · Poder · Mudança estrutural':'Capital · Power · Structural change')}</text><text x="1088" y="582" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#617078">marginalthinking.org</text></svg>`;
}
async function writePng(file,svg){fs.mkdirSync(path.dirname(file),{recursive:true});await sharp(Buffer.from(svg)).png({compressionLevel:9,palette:true}).toFile(file);}
function setMeta(html,key,value,kind='name'){
  const pattern=new RegExp(`<meta\\s+${kind}="${rxEsc(key)}"\\s+content="[^"]*"\\s*>`,'i');
  const tag=`<meta ${kind}="${key}" content="${escHtml(value)}">`;
  return pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',`${tag}</head>`);
}
function contentAttr(html,kind,key){return html.match(new RegExp(`<meta\\s+${kind}="${rxEsc(key)}"\\s+content="([^"]*)"`,'i'))?.[1]||'';}
function updateJsonLd(html,imageUrl){
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(all,json)=>{
    try{
      const data=JSON.parse(json);const nodes=Array.isArray(data?.['@graph'])?data['@graph']:[data];let changed=false;
      for(const node of nodes)if(node?.['@type']==='ScholarlyArticle'){
        node.image={'@type':'ImageObject',url:imageUrl,width:1200,height:630};changed=true;
      }
      return changed?`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`:all;
    }catch{return all;}
  });
}
async function optimizeReports(){
  let count=0;
  for(const item of reports)for(const locale of availableLocales(item).filter(l=>cfg.locales[l])){
    const view=reportView(item,locale);if(!view)continue;
    const url=reportPath(item,locale),file=fileForUrl(url);if(!fs.existsSync(file))continue;
    const card=socialPath(item,locale),cardFile=path.join(out,card.replace(/^\//,''));await writePng(cardFile,renderSocialCard(item,locale,view));
    const title=seoTitle(view.seo_title||view.title||item.id),description=seoDescription(view.seo_description||view.deck||''),imageUrl=`${site}${card}`;
    let html=fs.readFileSync(file,'utf8');
    html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escHtml(title)} | ${escHtml(cfg.site_name)}</title>`);
    html=setMeta(html,'description',description,'name');
    html=setMeta(html,'og:title',title,'property');html=setMeta(html,'og:description',description,'property');html=setMeta(html,'og:image',imageUrl,'property');html=setMeta(html,'og:image:secure_url',imageUrl,'property');
    html=setMeta(html,'og:image:type','image/png','property');html=setMeta(html,'og:image:width','1200','property');html=setMeta(html,'og:image:height','630','property');html=setMeta(html,'og:image:alt',view.title||item.id,'property');
    html=setMeta(html,'twitter:card','summary_large_image','name');html=setMeta(html,'twitter:title',title,'name');html=setMeta(html,'twitter:description',description,'name');html=setMeta(html,'twitter:image',imageUrl,'name');html=setMeta(html,'twitter:image:alt',view.title||item.id,'name');
    html=updateJsonLd(html,imageUrl);
    fs.writeFileSync(file,html);count++;
  }
  return count;
}
async function optimizeInstitutionalPages(){
  const cardByLocale={};
  for(const locale of locales){
    const card=institutionalSocialPath(locale),file=path.join(out,card.replace(/^\//,''));await writePng(file,renderInstitutionalCard(locale));cardByLocale[locale]=`${site}${card}`;
  }
  let count=0;
  for(const file of walk(out).filter(f=>f.endsWith('.html'))){
    const rel=path.relative(out,file).split(path.sep).join('/');
    if(/^(?:pt-br\/)?reports\/\d{4}\/\d{2}\/[^/]+\.html$/.test(rel))continue;
    const locale=rel.startsWith('pt-br/')?'pt-BR':'en';if(!cfg.locales[locale])continue;
    let html=fs.readFileSync(file,'utf8');if(!/property="og:type"\s+content="website"/i.test(html))continue;
    const imageUrl=cardByLocale[locale],description=institutionalDescription(locale),alt=locale==='pt-BR'?'Marginal Thinking — pesquisa independente':'Marginal Thinking — independent research';
    html=setMeta(html,'og:description',description,'property');html=setMeta(html,'og:image',imageUrl,'property');html=setMeta(html,'og:image:secure_url',imageUrl,'property');html=setMeta(html,'og:image:type','image/png','property');html=setMeta(html,'og:image:width','1200','property');html=setMeta(html,'og:image:height','630','property');html=setMeta(html,'og:image:alt',alt,'property');
    html=setMeta(html,'twitter:card','summary_large_image','name');html=setMeta(html,'twitter:description',description,'name');html=setMeta(html,'twitter:image',imageUrl,'name');html=setMeta(html,'twitter:image:alt',alt,'name');
    if(!contentAttr(html,'name','description'))html=setMeta(html,'description',seoDescription(description),'name');
    fs.writeFileSync(file,html);count++;
  }
  return count;
}
function collectionMap(){
  const map=new Map(),put=(p,items)=>map.set(p,items);
  for(const id of Object.keys(taxonomy.programs||{}))put(`/research/${id}/`,reports.filter(r=>r.program===id));
  for(const id of Object.keys(taxonomy.regions||{}))put(`/regions/${id}/`,reports.filter(r=>(r.geography?.regions||[]).includes(id)));
  for(const id of Object.keys(taxonomy.topics||{}))put(`/topics/${id}/`,reports.filter(r=>(r.topics||[]).includes(id)));
  const countries=new Map();for(const r of reports)for(const c of r.geography?.countries||[]){if(!countries.has(c.slug))countries.set(c.slug,[]);countries.get(c.slug).push(r);}for(const [slug,items] of countries)put(`/countries/${slug}/`,items);
  for(const [id,s] of Object.entries(taxonomy.series||{})){put(`/series/${id}/`,reports.filter(r=>r.series===id));for(const domain of Object.keys(s.domains||{}))put(`/series/${id}/${domain}/`,reports.filter(r=>r.series===id&&r.series_domain===domain));}
  return map;
}
function optimizeCollections(){
  const collections=collectionMap(),inactive=new Set(),activeDates=new Map();
  for(const [canonical,items] of collections)for(const locale of locales){const u=pagePath(locale,canonical);if(items.length)activeDates.set(`${site}${u}`,lastDate(items));else inactive.add(u);}
  for(const url of inactive){const file=fileForUrl(url);if(!fs.existsSync(file))continue;let html=fs.readFileSync(file,'utf8');html=setMeta(html,'robots','noindex,follow','name');fs.writeFileSync(file,html);}
  const sitemapFile=path.join(out,'sitemap.xml');if(fs.existsSync(sitemapFile)){
    let xml=fs.readFileSync(sitemapFile,'utf8');
    for(const url of inactive){const abs=`${site}${url}`,rx=new RegExp(`<url><loc>${rxEsc(escXml(abs))}<\\/loc>[\\s\\S]*?<\\/url>`,'g');xml=xml.replace(rx,'');}
    // Collection renderers contribute routes earlier in the pipeline. Reconcile
    // against the canonical collection map here so an omitted entry cannot leave
    // a live, populated collection undiscoverable.
    for(const [abs,date] of activeDates){
      const loc=`<loc>${escXml(abs)}</loc>`;
      if(!xml.includes(loc)&&fs.existsSync(fileForUrl(new URL(abs).pathname)))xml=xml.replace('</urlset>',`<url>${loc}${date?`<lastmod>${date}</lastmod>`:''}</url></urlset>`);
      else if(date){const rx=new RegExp(`(<url><loc>${rxEsc(escXml(abs))}<\\/loc>)(?:<lastmod>[^<]*<\\/lastmod>)?`,'g');xml=xml.replace(rx,`$1<lastmod>${date}</lastmod>`);}
    }
    fs.writeFileSync(sitemapFile,xml);
  }
  const searchFile=path.join(out,'data/search-index.json');if(fs.existsSync(searchFile)){
    const data=JSON.parse(fs.readFileSync(searchFile,'utf8'));for(const locale of locales){const list=data.locales?.[locale];if(Array.isArray(list))data.locales[locale]=list.filter(x=>!inactive.has(x.url));}fs.writeFileSync(searchFile,JSON.stringify(data));
  }
  return {inactive:inactive.size,active:activeDates.size};
}

const reportCount=await optimizeReports();
const institutionalCount=await optimizeInstitutionalPages();
const collections=optimizeCollections();
console.log(`SEO output optimized: ${reportCount} localized reports with PNG social cards; ${institutionalCount} institutional pages with branded social metadata; ${collections.inactive} empty collections noindexed; ${collections.active} active collections retained.`);
