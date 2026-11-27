import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';
import {canonicalizePublicUrl} from './lib/public-url.mjs';
const root=process.cwd(),dist=path.join(root,'dist'),cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8')),site=cfg.site_url.replace(/\/$/,'');
const route='research-exchange/v1/',months=new Map(),seen=new Set();
const save=(file,data)=>{const p=path.join(dist,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(data));};
const strings=x=>Array.isArray(x)?x.filter(v=>typeof v==='string'):[];
const str=x=>typeof x==='string'?x:undefined;
function localUrl(item,locale){const u=new URL(item.url,site);assert(u.origin===site&&u.pathname.startsWith('/reports/'),'Invalid research URL '+item.id);const prefix=cfg.locales[locale]?.path;return canonicalizePublicUrl(site+(prefix?'/'+prefix:'')+u.pathname,site);}
function markdownUrl(view){if(!view.markdown_url)return undefined;const u=new URL(view.markdown_url,site);assert(u.origin===site&&u.pathname.startsWith('/reports/')&&u.pathname.endsWith('.md'),'Invalid public Markdown path');return u.href;}
const reports=collectReports(root).filter(x=>x._bundle&&x.qa_status==='approved');
for(const item of reports){
 assert(item.id&&!seen.has(item.id),'Duplicate research ID');seen.add(item.id);
 const day=String(item.date||'').slice(0,10);assert(/^\d{4}-\d{2}-\d{2}$/.test(day),'Invalid research date '+item.id);
 const views={};
 for(const locale of availableLocales(item).filter(l=>Object.hasOwn(cfg.locales,l))){
  const v=reportView(item,locale);if(!v?.title)continue;
  views[locale]={url:localUrl(item,locale),markdown:markdownUrl(v),title:v.title,abstract:str(v.deck),watch:strings(v.watch),regime:str(v.regime),keyRisk:str(v.key_risk),tags:strings(v.tags)};
 }
 assert(Object.keys(views).length>0,'No published locale '+item.id);
 const geography=item.geography||{},countries=Array.isArray(geography.countries)?geography.countries.map(c=>typeof c==='string'?c:c?.code).filter(Boolean):[];
 const row={id:item.id,date:day,published:item.published_at||day,modified:item.updated_at||item.published_at||day,sourceLocale:item.source_locale,program:str(item.program),relatedPrograms:strings(item.related_programs),topics:strings(item.topics),phenomena:strings(item.phenomena),dimensions:strings(item.dimensions),format:str(item.format),cadence:str(item.cadence),geography:{level:str(geography.level),regions:strings(geography.regions),subregions:strings(geography.subregions),countries},confidence:str(item.assessment_confidence),locales:views};
 const month=day.slice(0,7);if(!months.has(month))months.set(month,[]);months.get(month).push(row);
}
const manifest={schema:'marginalthinking.research-exchange',version:1,role:'structural-research-discovery-not-independent-evidence',scope:'approved canonical public bundles; legacy records remain in the public archive',languages:Object.keys(cfg.locales),reports:reports.length,partner:'https://www.sharpex.com.br/research-exchange/v1/index.json',shards:[]};
for(const [month,items] of [...months].sort((a,b)=>b[0].localeCompare(a[0]))){
 const file=route+month+'.json';save(file,{schema:manifest.schema,version:1,month,reports:items});manifest.shards.push({month,url:site+'/'+file,reports:items.length,revision:items.map(x=>x.modified).sort().at(-1)});
}
assert(manifest.shards.reduce((n,x)=>n+x.reports,0)===manifest.reports,'Exchange count mismatch');
save(route+'index.json',manifest);
console.log('Research exchange: '+manifest.reports+' approved research bundles in '+manifest.shards.length+' monthly shards.');
