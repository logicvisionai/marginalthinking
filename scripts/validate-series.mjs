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
}
if(!series['energy-materials-industrial-systems'])fail.push('series controlada energy-materials-industrial-systems ausente');
if(!series['policy-experiments-institutional-transitions'])fail.push('series controlada policy-experiments-institutional-transitions ausente');
if(taxonomy.governance?.series_creation!=='human-editorial-change-only')fail.push('governance.series_creation deve ser human-editorial-change-only');
if(taxonomy.governance?.series_domain_creation!=='human-editorial-change-only')fail.push('governance.series_domain_creation deve ser human-editorial-change-only');

const topicPolicies={
  'energy-materials-industrial-systems': new Set(['energy','commodities-resources','infrastructure-logistics','industry-production','technology-innovation','trade-investment','capital-markets','geopolitics-security']),
  'global-monetary-financial-institutions': new Set(['macroeconomics','monetary-policy','sovereign-debt','capital-markets','banking-credit','currencies','trade-investment','institutions-governance']),
  'policy-experiments-institutional-transitions': new Set(['macroeconomics','fiscal-policy','monetary-policy','sovereign-debt','banking-credit','currencies','trade-investment','industry-production','institutions-governance','demography-labor','inequality-distribution','social-change'])
};
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
  const topicPolicy=topicPolicies[item.series];
  if(!topicPolicy)fail.push(`${file}: série ${item.series} sem política de tópicos no validador`);
  else if((item.topics||[]).filter(t=>topicPolicy.has(t)).length<2)fail.push(`${file}: série exige ao menos dois tópicos materiais compatíveis com seu domínio`);
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
