import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist missing for English editorial normalization');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

// Compatibility pass for English editions already in the public archive.
// It changes wording only. Facts, figures, confidence levels and analytical conclusions are preserved.
const replacements=[
  ['## 1. Executive summary — the regime funnel','## 1. Executive summary — how the shock is transmitted'],
  ['The global system is being driven by a relatively clear causal funnel. The first layer is physical: attacks and disruptions to Saudi energy infrastructure reduced the redundancy available to bypass the Strait of Hormuz. The second is nominal: Brent returned to the US$107–108 region and raised the risk of inflation through fuel, freight and production costs. The third is monetary: the 10-year Treasury moved above 5% and markets began treating a 25-basis-point Fed hike as the overwhelmingly dominant scenario. The fourth is financial: the dollar strengthens, technology and small caps suffer from duration and the cost of capital, while gold does not function fully as a hedge because high nominal/real yields compete with the metal. The fifth is political: governments must choose whether to absorb the shock through subsidies/fiscal policy, pass prices through to consumers or tolerate a sharper slowdown.','The transmission mechanism can be described directly. Attacks and disruptions to Saudi energy infrastructure reduced the routes available to bypass the Strait of Hormuz. Brent returned to the US$107–108 range, raising fuel, freight and production costs and increasing inflation risk. Against that backdrop, the 10-year Treasury moved above 5% and markets began treating a 25-basis-point Fed hike as the most likely outcome. Higher interest rates support the dollar and put particular pressure on assets that are sensitive to long-term discount rates. Gold receives less support as a hedge when government bonds offer high nominal and real yields. Governments, meanwhile, must decide whether to allow higher costs to reach consumers, absorb part of the shock through fiscal measures, or accept a sharper slowdown in activity.'],
  ["Today's delta is that","The main change today is that"],
  ['main cross-asset information','most important signal across asset classes'],
  ['generalized funding disruption','broad disruption in funding markets'],
  ['inflation/term-premium repricing','repricing of inflation risk and the term premium'],
  ["The system's control price is the UST 10Y, not the S&P 500.",'The U.S. 10-year Treasury yield has become a key benchmark for global financing conditions, more informative for this analysis than the S&P 500 alone.'],
  ['it reprices equity duration, mortgages, corporate credit, private credit, infrastructure and the economic value of capital-intensive projects simultaneously.','it raises discount rates and financing costs across equities, mortgages, corporate and private credit, infrastructure and other capital-intensive projects.'],
  ['The energy shock has become a transfer of wealth and bargaining power.','The energy shock is redistributing current income and bargaining power.'],
  ['Net importers transfer income to producers and to agents controlling routes, inventories, insurance and logistics capacity','Net importers spend more for the same quantity of energy, increasing current income for producers, exporters and providers of scarce transport, storage and insurance capacity'],
  ['Brazil is caught between two vectors.','Brazil is being pulled by two opposing forces.'],
  ['high duration, credit deterioration and political volatility','greater sensitivity to long-term interest rates, credit deterioration and political volatility'],
  ['provide little valuation benefit','provide little support to valuations'],

  ['financial capital still gravitates toward U.S. assets while states diversify buffers and productive capital migrates toward energy, mineral processing and AI infrastructure.','financial assets remain heavily concentrated in U.S. markets while governments diversify foreign-exchange reserves and new investment increasingly targets energy, mineral processing and AI infrastructure.'],
  ['Each layer is treated as **stock**, **flow**, **valuation** or **change of control**.','Each category is treated as **stock**, **flow**, **valuation** or **change of control**.'],
  ['Asian FX buffers moved in different directions.','Asian foreign-exchange reserves moved in different directions.'],
  ['The mineral bottleneck is more concentrated in processing than in geology.','Concentration in mineral supply chains is greater in processing and refining than in the location of geological reserves.'],
  ['Electricity, grids, chips, cooling, copper and equipment become links in income capture.','The income generated by AI investment is distributed across electricity suppliers, grid operators, chipmakers, cooling providers, copper producers and equipment manufacturers.'],
  ['Asian flows remain divergent.','Financial flows across Asia continue to move in different directions.'],
  ['large external buffer','large stock of foreign-exchange reserves'],
  ['Record buffer','Record reserves'],
  ['Value capture shifted toward the industrial link','A larger share of income accrues to processing and industrial stages'],

  ['global wealth remains financially anchored in U.S. capital markets and the dollar, while the marginal flow of economic power is becoming more state-led, infrastructure-intensive and dependent on physical bottlenecks.','global financial wealth remains heavily concentrated in U.S. capital markets and the dollar, while a larger share of strategic investment is being directed by states and sovereign funds toward infrastructure, energy, mineral processing and computing capacity.'],
  ["The United States remains the world's primary financial reservoir.",'U.S. capital markets remain the world’s largest and most liquid destination for savings and financing.'],
  ['The relevant competition is over financing + energy + processing + compute + intellectual property.','Strategic competition increasingly concerns access to financing, energy, industrial processing, computing capacity and intellectual property.'],
  ['The financial center of gravity remains American.','U.S. financial markets remain at the center of the global system.'],
  ['transmit wealth shocks globally','transmit changes in asset values and financing conditions globally'],
  ['Income captured by a producer depends on','The income received by a producer depends on'],
  ['does not determine value capture','does not by itself determine where profits and other income accrue'],
  ['creates economic power even when','increases China’s influence over the supply chain even when'],
  ['Power analysis must identify who controls each link and which link has the highest barrier to entry.','The analysis must identify who controls each stage and which stages are hardest or most costly to replace.'],
  ['The marginal bottleneck can move quickly from chips to power or grid connection.','The binding constraint can shift quickly from chip availability to electricity supply or grid-connection capacity.'],
  ['Future AI income is likely to be captured by a combination of intellectual property, compute, energy, financing and distribution scale.','Future AI income is likely to accrue to firms and investors that combine intellectual property, computing capacity, energy, financing and distribution scale.'],

  ['physically dependent on bottlenecks concentrated in Asia','dependent on critical processing and manufacturing stages that are concentrated in Asia'],
  ['control of bottlenecks','control over critical stages that are costly or slow to replace'],
  ['controlling the income','receiving the income generated along the chain'],
  ['The income-capture chain runs through','Income generated by AI investment is distributed across'],
  ['the marginal constraint is moving from the algorithm to physical infrastructure','the binding constraint is shifting from access to algorithms toward physical infrastructure'],
  ['industrial scale and midstream control','industrial scale and control over processing and intermediate manufacturing'],
  ['a reservoir of wealth comparable with major physical assets','a major source of economic wealth alongside large physical asset classes'],
  ['concentration of bottlenecks','concentration in critical stages of supply chains'],
  ['layered maps of power','different dimensions of wealth and economic capacity'],
  ['Power reading','Strategic significance'],
  ['**Power shift:**','**Implication:**'],
  ['capital is migrating toward assets that combine physical, technological and regulatory barriers.','investment is increasingly directed toward assets with high physical, technological and regulatory barriers to entry.'],
  ['who captures the margin','where profits and margins ultimately accrue'],
  ['who captures the return','who receives the largest share of the economic return'],
  ['capture rents','receive economic rents'],
  ['income capture','income distribution'],
  ['value capture','where income and profits accrue'],
  ['global reservoir','global destination for savings and investment'],
  ['financial reservoir','major financial center'],
  ['marginal constraint','binding constraint'],
  ['control bottlenecks','control critical stages that are difficult to replace'],
  ['controls bottlenecks','controls critical stages that are difficult to replace']
];

const apply=text=>{
  let out=text;
  for(const [from,to] of replacements) out=out.split(from).join(to);
  return out;
};

function normalizeMarkdown(text){
  return text.split(/(```[\s\S]*?```)/g).map((part,i)=>i%2?part:apply(part)).join('');
}

function normalizeHtml(text){
  const protectedBlocks=[];
  let work=text.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi,m=>{
    const token=`___MT_EN_PROTECTED_${protectedBlocks.length}___`;
    protectedBlocks.push(m);
    return token;
  });
  work=work.split(/(<[^>]+>)/g).map(part=>part.startsWith('<')?part:apply(part)).join('');
  work=work.replace(/___MT_EN_PROTECTED_(\d+)___/g,(_,n)=>protectedBlocks[Number(n)]);
  return work;
}

const badPatterns=[
  /causal funnel/i,
  /system['’]s control price/i,
  /control of bottlenecks/i,
  /income-capture chain/i,
  /financial reservoir/i,
  /reservoir of wealth/i,
  /layered maps of power/i,
  /marginal bottleneck/i,
  /marginal constraint/i
];

let changed=0;
const failures=[];
for(const file of walk(root)){
  const isEnglishMarkdown=file.endsWith(`${path.sep}en.md`);
  const isHtml=file.endsWith('.html');
  if(!isEnglishMarkdown&&!isHtml)continue;
  const before=fs.readFileSync(file,'utf8');
  if(isHtml&&!/<html\s+lang=["']en(?:-[^"']*)?["']/i.test(before))continue;
  const after=isEnglishMarkdown?normalizeMarkdown(before):normalizeHtml(before);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
  const check=isEnglishMarkdown?after:after.replace(/<[^>]+>/g,' ');
  for(const pattern of badPatterns)if(pattern.test(check))failures.push(`${path.relative(root,file)}: unresolved editorial pattern ${pattern}`);
}

if(failures.length){
  console.error(failures.map(x=>`FAIL ${x}`).join('\n'));
  process.exit(1);
}
console.log(`English editorial normalization OK: ${changed} public files updated.`);
