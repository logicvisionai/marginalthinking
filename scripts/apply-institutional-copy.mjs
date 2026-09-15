import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const basePath=path.join(root,'data','i18n.json');
const overridePath=path.join(root,'data','institutional-copy.json');
const base=JSON.parse(fs.readFileSync(basePath,'utf8'));
const overrides=JSON.parse(fs.readFileSync(overridePath,'utf8'));

function merge(target, source){
  for(const [key,value] of Object.entries(source)){
    if(value && typeof value==='object' && !Array.isArray(value)){
      target[key]=merge(target[key]&&typeof target[key]==='object'&&!Array.isArray(target[key])?target[key]:{},value);
    }else{
      target[key]=value;
    }
  }
  return target;
}

for(const [locale,copy] of Object.entries(overrides)){
  if(!base[locale]) throw new Error(`Unknown locale in institutional copy: ${locale}`);
  merge(base[locale],copy);
}

const serialized=JSON.stringify(base);
const banned=[
  'Uma análise deve mostrar os limites do próprio raciocínio',
  'Analysis should show its reasoning boundary',
  'controle de gargalos',
  'control of bottlenecks',
  'disciplined uncertainty reduction',
  'reduzir incerteza de maneira disciplinada',
  'separate signal from noise',
  'separar sinal de ruído',
  'stocks show where the system is',
  'estoques mostram onde o sistema está',
  'structure and conjuncture',
  'estrutura e conjuntura',
  'forces that redistribute wealth',
  'forças que redistribuem riqueza',
  'headline speed',
  'velocidade da manchete',
  'flattening complexity',
  'achatar a complexidade'
];
const found=banned.filter(x=>serialized.toLowerCase().includes(x.toLowerCase()));
if(found.length) throw new Error(`Institutional copy still contains banned editorial patterns: ${found.join(', ')}`);

fs.writeFileSync(basePath,JSON.stringify(base,null,2)+'\n','utf8');
console.log('Institutional copy applied to EN and pt-BR.');
