import fs from 'node:fs';
import path from 'node:path';

const posix=p=>p.split(path.sep).join('/');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

function walk(dir,name='metadata.json'){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const p=path.join(dir,e.name);
    if(e.isDirectory())return walk(p,name);
    return e.name===name?[p]:[];
  });
}
function publicPath(root,file){return `/${posix(path.relative(root,file))}`;}
function normalizeBundle(root,file,raw){
  const dir=path.dirname(file),relDir=posix(path.relative(path.join(root,'reports'),dir));
  const source=raw.source_locale||'en',locales=raw.locales||{};
  if(!locales[source])throw new Error(`${posix(path.relative(root,file))}: locales.${source} ausente`);
  const resolveLocale=(code,value={})=>{
    const markdown=value.markdown||value.markdown_file;
    if(!markdown)throw new Error(`${posix(path.relative(root,file))}: locale ${code} sem markdown`);
    const markdownFile=path.join(dir,markdown);
    return {...value,markdown_url:publicPath(root,markdownFile)};
  };
  const src=resolveLocale(source,locales[source]);
  const translations={};
  for(const [code,value] of Object.entries(locales))if(code!==source)translations[code]=resolveLocale(code,value);
  const url=raw.url||`/reports/${relDir}.html`;
  return {...raw,...src,url,source_locale:source,translations,bundle_metadata:publicPath(root,file),_bundle:true};
}

export function collectReports(root=process.cwd()){
  const legacyPath=path.join(root,'data','reports.json');
  const legacy=fs.existsSync(legacyPath)?readJson(legacyPath):[];
  if(!Array.isArray(legacy))throw new Error('data/reports.json deve ser um array');
  const map=new Map(legacy.map(x=>[x.id,{...x,source_locale:x.source_locale||'pt-BR',_legacy:true}]));
  for(const file of walk(path.join(root,'reports'))){
    const item=normalizeBundle(root,file,readJson(file));
    if(!item.id)throw new Error(`${posix(path.relative(root,file))}: id ausente`);
    map.set(item.id,item);
  }
  return [...map.values()].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||(a.priority??99)-(b.priority??99)||String(a.id).localeCompare(String(b.id)));
}

export function reportView(item,locale){
  const source=item.source_locale||'pt-BR';
  if(locale===source)return {...item,locale,available:true};
  const tr=item.translations?.[locale];
  if(tr?.markdown_url)return {...item,...tr,locale,available:true};
  return null;
}

export function availableLocales(item){
  const out=new Set([item.source_locale||'pt-BR']);
  for(const [code,v] of Object.entries(item.translations||{}))if(v?.markdown_url)out.add(code);
  return [...out];
}
