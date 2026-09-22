import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const distMode=process.argv.includes('--dist');
const fail=[];
const warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const walk=(dir,name='metadata.json')=>!exists(dir)?[]:fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p,name):(e.name===name?[p]:[]);});

let taxonomy={},cfg={};
try{taxonomy=JSON.parse(read('data/taxonomy.json'));}catch(e){fail.push(`data/taxonomy.json inválido: ${e.message}`);}
try{cfg=JSON.parse(read('site.config.json'));}catch(e){fail.push(`site.config.json inválido: ${e.message}`);}

const series=taxonomy.series||{};
for(const [id,s] of Object.entries(series)){
  if(!taxonomy.programs?.[s.program])fail.push(`series ${id}: programa pai inválido (${s.program||'ausente'})`);
  if(!s.en||!s['pt-BR'])fail.push(`series ${id}: labels EN/PT-BR obrigatórios`);
  if(!s.domains||!Object.keys(s.domains).length)fail.push(`series ${id}: domains ausente/vazio`);
  for(const [domain,d] of Object.entries(s.domains||{}))if(!d.en||!d['pt-BR'])fail.push(`series ${id}/${domain}: labels EN/PT-BR obrigatórios`);
  if(s.validation){
    const min=Number(s.validation.min_relevant_topics||0),pool=s.validation.topic_pool;
    if(!Number.isInteger(min)||min<1)fail.push(`series ${id}: validation.min_relevant_topics inválido`);
    if(!Array.isArray(pool)||!pool.length)fail.push(`series ${id}: validation.topic_pool ausente/vazio`);
    else for(const topic of pool)if(!taxonomy.topics?.[topic])fail.push(`series ${id}: validation.topic_pool contém tópico inválido (${topic})`);
  }
}
if(!series['energy-materials-industrial-systems'])fail.push('series controlada energy-materials-industrial-systems ausente');
if(!series['global-monetary-financial-architecture'])fail.push('series controlada global-monetary-financial-architecture ausente');
if(taxonomy.governance?.series_creation!=='human-editorial-change-only')fail.push('governance.series_creation deve ser human-editorial-change-only');
if(taxonomy.governance?.series_domain_creation!=='human-editorial-change-only')fail.push('governance.series_domain_creation deve ser human-editorial-change-only');

let seriesReports=0;
const domainCounts=new Map();
for(const file of walk('reports')){
  let item;try{item=JSON.parse(read(file));}catch(e){fail.push(`${file}: metadata inválido: ${e.message}`);continue;}
  if(item.series_domain&&!item.series)fail.push(`${file}: series_domain sem series`);
  if(!item.series)continue;
  seriesReports++;
  const s=series[item.series];
  if(!s){fail.push(`${file}: series inválida (${item.series})`);continue;}
  if(item.program!==s.program)fail.push(`${file}: programa ${item.program||'ausente'} difere do pai ${s.program}`);
  if(!item.series_domain||!s.domains?.[item.series_domain])fail.push(`${file}: series_domain inválido ou ausente (${item.series_domain||'ausente'})`);
  else domainCounts.set(item.series_domain,(domainCounts.get(item.series_domain)||0)+1);
  const pool=new Set(s.validation?.topic_pool||[]);
  const min=Number(s.validation?.min_relevant_topics||0);
  const topicCount=(item.topics||[]).filter(t=>pool.has(t)).length;
  if(min&&topicCount<min)fail.push(`${file}: série ${item.series} exige ao menos ${min} tópicos materiais do seu pool controlado`);
  if(!['assessment','research-report','monitor','data-note','brief'].includes(item.format))warn.push(`${file}: formato ${item.format} é incomum para a série`);
  if(!item.locales?.en||!item.locales?.['pt-BR'])fail.push(`${file}: série exige edições en e pt-BR`);
}

if(distMode){
  const out=path.join(root,'dist');
  const pref=(locale,p)=>`${cfg.locales?.[locale]?.path?`/${cfg.locales[locale].path}`:''}${p}`.replace(/\/+/g,'/');
  for(const [id,s] of Object.entries(series))for(const locale of Object.keys(cfg.locales||{})){
    const rootPage=path.join(out,pref(locale,`/series/${id}/index.html`).replace(/^\//,''));
    if(!fs.existsSync(rootPage))fail.push(`${locale}: landing da série ausente (${id})`);
    for(const domain of Object.keys(s.domains||{})){
      const domainPage=path.join(out,pref(locale,`/series/${id}/${domain}/index.html`).replace(/^\//,''));
      if(!fs.existsSync(domainPage))fail.push(`${locale}: domínio da série ausente (${id}/${domain})`);
    }
    const home=path.join(out,pref(locale,'/index.html').replace(/^\//,''));
    if(fs.existsSync(home)&&!fs.readFileSync(home,'utf8').includes(pref(locale,`/series/${id}/`)))fail.push(`${locale}: home sem link contextual para série ${id}`);
  }
}

if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Series validation OK: ${Object.keys(series).length} controlled series; ${seriesReports} public series reports; domains ${[...domainCounts.entries()].map(([k,v])=>`${k}=${v}`).join(', ')||'none'}.${distMode?' Dist output verified.':''}`);
