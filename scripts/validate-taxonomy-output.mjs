import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist');
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const fail=[];
const exists=p=>fs.existsSync(path.join(out,String(p).replace(/^\//,'')));
const pref=(locale,p)=>`${cfg.locales[locale]?.path?`/${cfg.locales[locale].path}`:''}${p}`.replace(/\/+/g,'/');

for(const locale of Object.keys(cfg.locales||{})){
  for(const p of ['/research/index.html','/regions/index.html'])if(!exists(pref(locale,p)))fail.push(`${locale}: coleção ausente ${pref(locale,p)}`);
  for(const id of Object.keys(taxonomy.programs||{}))if(!exists(pref(locale,`/research/${id}/index.html`)))fail.push(`${locale}: programa ausente ${id}`);
  for(const id of Object.keys(taxonomy.regions||{}))if(!exists(pref(locale,`/regions/${id}/index.html`)))fail.push(`${locale}: região ausente ${id}`);
  for(const id of Object.keys(taxonomy.topics||{}))if(!exists(pref(locale,`/topics/${id}/index.html`)))fail.push(`${locale}: tópico controlado ausente ${id}`);
  const home=path.join(out,pref(locale,'/index.html').replace(/^\//,''));
  if(fs.existsSync(home)){
    const html=fs.readFileSync(home,'utf8');
    const href=locale==='pt-BR'?'/pt-br/regions/':'/regions/';
    if(!html.includes(`href="${href}"`))fail.push(`${locale}: navegação sem Countries & Regions (${href})`);
  }
}
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Taxonomy output validation OK: ${Object.keys(taxonomy.programs||{}).length} programs, ${Object.keys(taxonomy.regions||{}).length} regions, ${Object.keys(taxonomy.topics||{}).length} controlled topics across ${Object.keys(cfg.locales||{}).length} locales.`);
