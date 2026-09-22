import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist');
const taxonomy=JSON.parse(fs.readFileSync(path.join(root,'data/taxonomy.json'),'utf8'));

const copy={
  en:[
    ['01','Global System & Power','Capital, reserves, resources, productive capacity and changes in the international system.','global-system-power'],
    ['02','Political Economy & Markets','Macroeconomics, fiscal and monetary policy, institutions, markets and cross-asset transmission.','political-economy-markets'],
    ['03','Strategic Transitions','Material country and regional changes where economic, political and social structures are moving faster than consensus attention.','strategic-transitions'],
    ['04','Technology, Production & Society','Technologies moving from demonstrated capability into production, capital allocation, institutions and social change.','technology-production-society']
  ],
  'pt-BR':[
    ['01','Sistema Global & Poder','Capital, reservas, recursos, capacidade produtiva e mudanças na estrutura do sistema internacional.','global-system-power'],
    ['02','Economia Política & Mercados','Macroeconomia, política fiscal e monetária, instituições, mercados e transmissão entre classes de ativos.','political-economy-markets'],
    ['03','Transições Estratégicas','Mudanças materiais em países e regiões nas quais estruturas econômicas, políticas e sociais avançam mais rapidamente do que a atenção do consenso.','strategic-transitions'],
    ['04','Tecnologia, Produção & Sociedade','Tecnologias que passam de capacidade demonstrada para produção, alocação de capital, instituições e mudança social.','technology-production-society']
  ]
};

const label=(obj,locale,fallback)=>obj?.[locale]||obj?.en||fallback;
const featured=Object.entries(taxonomy.series||{})
  .filter(([,s])=>s.homepage?.featured)
  .sort((a,b)=>(a[1].homepage?.order||100)-(b[1].homepage?.order||100));

for(const locale of ['en','pt-BR']){
  const file=path.join(out,locale==='en'?'index.html':'pt-br/index.html');
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  const prefix=locale==='en'?'':'/pt-br';
  const cards=copy[locale].map(([n,title,text,id])=>`<article class="research-program"><span>${n}</span><h3><a href="${prefix}/research/${id}/">${title}</a></h3><p>${text}</p></article>`).join('');
  const replacement=`<div class="research-programs">${cards}</div>`;
  const re=/<div class="research-programs">[\s\S]*?<\/div>/;
  if(!re.test(html))throw new Error(`Homepage research-programs block not found for ${locale}`);
  html=html.replace(re,replacement);

  html=html.replace(/<section class="section research-standard" data-home-series="[^"]+">[\s\S]*?<\/section>/g,'');
  const marker='<section class="section research-standard">';
  if(!html.includes(marker))throw new Error(`Homepage standard block not found for ${locale}`);
  const features=featured.map(([id,s])=>{
    const title=label(s,locale,id),text=label(s.homepage,locale,label(s.description,locale,'')),href=`${prefix}/series/${id}/`;
    const eyebrow=locale==='pt-BR'?'SÉRIE DE PESQUISA':'RESEARCH SERIES';
    const action=locale==='pt-BR'?'Abrir série':'Open series';
    return `<section class="section research-standard" data-home-series="${id}"><div class="container research-standard-grid"><div><div class="eyebrow dark">${eyebrow}</div><h2>${title}</h2></div><p>${text} <a href="${href}">${action} →</a></p></div></section>`;
  }).join('');
  html=html.replace(marker,`${features}${marker}`);
  fs.writeFileSync(file,html);
}

console.log(`Homepage aligned to four canonical programs and ${featured.length} featured controlled series.`);
