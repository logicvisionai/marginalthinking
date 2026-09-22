import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist');

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

const seriesCopy={
  en:[
    {id:'energy-materials-industrial-systems',eyebrow:'CONTROLLED RESEARCH SERIES',title:'Energy, Materials & Industrial Systems',text:'Electricity systems, fuels and energy carriers, strategic and advanced materials, and the industrial capacity required to turn resources and technology into operating systems.',action:'Open series'},
    {id:'global-monetary-financial-institutions',eyebrow:'CONTROLLED RESEARCH SERIES',title:'Global Monetary & Financial Institutions',text:'Central-bank decisions, multilateral finance, sovereign-debt frameworks, financial stability, reserves and the public infrastructure used to move and settle money across borders.',action:'Open series'}
  ],
  'pt-BR':[
    {id:'energy-materials-industrial-systems',eyebrow:'SÉRIE DE PESQUISA CONTROLADA',title:'Energia, Materiais & Sistemas Industriais',text:'Sistemas elétricos, combustíveis e vetores energéticos, materiais estratégicos e avançados e a capacidade industrial necessária para transformar recursos e tecnologia em sistemas operacionais.',action:'Abrir série'},
    {id:'global-monetary-financial-institutions',eyebrow:'SÉRIE DE PESQUISA CONTROLADA',title:'Instituições Monetárias & Financeiras Globais',text:'Decisões de bancos centrais, finanças multilaterais, marcos de dívida soberana, estabilidade financeira, reservas e a infraestrutura pública usada para movimentar e liquidar dinheiro entre países.',action:'Abrir série'}
  ]
};

for(const locale of ['en','pt-BR']){
  const file=path.join(out,locale==='en'?'index.html':'pt-br/index.html');
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  const prefix=locale==='en'?'':'/pt-br';
  const cards=copy[locale].map(([n,title,text,id])=>`<article class="research-program"><span>${n}</span><h3><a href="${prefix}/research/${id}/">${title}</a></h3><p>${text}</p></article>`).join('');
  const replacement=`<div class="research-programs">${cards}</div>`;
  const re=/<div class="research-programs">[\s\S]*?<\/div>/;
  if(re.test(html))html=html.replace(re,replacement);

  for(const s of seriesCopy[locale])html=html.replace(new RegExp('<section class="section research-standard" data-home-series="'+s.id+'">[\\s\\S]*?<\\/section>','g'),'');
  const marker='<section class="section research-standard">';
  const features=seriesCopy[locale].map(s=>{
    const href=`${prefix}/series/${s.id}/`;
    return `<section class="section research-standard" data-home-series="${s.id}"><div class="container research-standard-grid"><div><div class="eyebrow dark">${s.eyebrow}</div><h2>${s.title}</h2></div><p>${s.text} <a href="${href}">${s.action} →</a></p></div></section>`;
  }).join('');
  if(html.includes(marker))html=html.replace(marker,`${features}${marker}`);
  else if(html.includes('</main>'))html=html.replace('</main>',`${features}</main>`);
  else throw new Error(`Homepage insertion point not found for ${locale}`);
  fs.writeFileSync(file,html);
}

console.log('Homepage aligned to four canonical programs and controlled research series.');
