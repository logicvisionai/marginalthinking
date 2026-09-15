import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist ausente para limpeza editorial final');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

// Final safety net for public research output.
// The goal is not literal translation: use standard economic/strategic language and
// distinguish strategic assets/capabilities from actual capacity constraints.
const ptRules=[
  [/O preço de controle do sistema/g,'A principal referência para o custo de capital'],
  [/o preço de controle do sistema/g,'a principal referência para o custo de capital'],
  [/preço de controle do sistema/gi,'referência principal para o custo de capital'],
  [/quem controla os gargalos necessários(?: para produzir riqueza futura)?/gi,'quem controla os ativos, a infraestrutura e as capacidades críticas necessários para a produção futura'],
  [/controle de gargalos/gi,'controle de ativos e capacidades críticas'],
  [/concentração de gargalos/gi,'concentração de ativos e capacidades críticas'],
  [/gargalos concentrados na Ásia/gi,'ativos e capacidades críticas concentrados na Ásia'],
  [/gargalos tecnológicos específicos/gi,'ativos e capacidades tecnológicas críticas'],
  [/gargalos tecnológicos/gi,'capacidades tecnológicas críticas'],
  [/gargalos produtivos/gi,'capacidades produtivas críticas'],
  [/gargalos físicos/gi,'infraestrutura física e capacidades críticas'],
  [/gargalo difícil de substituir/gi,'ativo ou capacidade crítica de difícil substituição'],
  [/gargalo mineral/gi,'principal concentração da cadeia mineral'],
  [/gargalo marginal/gi,'restrição dominante'],
  [/O gargalo passa a ser/gi,'A restrição passa a estar em'],
  [/o gargalo passa a ser/gi,'a restrição passa a estar em'],
  [/o gargalo pode migrar/gi,'a restrição dominante pode migrar'],
  [/gargalos de infraestrutura/gi,'restrições de capacidade de infraestrutura'],
  [/gargalos de capacidade/gi,'restrições de capacidade'],
  [/\bgargalos\b/gi,'restrições críticas'],
  [/\bgargalo\b/gi,'restrição crítica'],
  [/funil causal/gi,'cadeia de transmissão'],
  [/\bfunil do regime\b/gi,'mecanismo de transmissão do regime'],
  [/principal reservatório financeiro/gi,'principal centro financeiro'],
  [/reservatório financeiro/gi,'centro financeiro'],
  [/reservatório global equivalente/gi,'destino global de poupança com função equivalente'],
  [/reservatório de riqueza/gi,'estoque de riqueza'],
  [/claims bancários cross-border/gi,'ativos bancários transfronteiriços'],
  [/claims cross-border/gi,'ativos transfronteiriços'],
  [/\bclaims\b/gi,'ativos ou direitos financeiros'],
  [/\bclaim\b/gi,'ativo ou direito financeiro'],
  [/\bcollateral\b/gi,'garantias financeiras'],
  [/acesso a clearing/gi,'acesso a sistemas de liquidação financeira'],
  [/\bclearing\b/gi,'liquidação financeira'],
  [/\bmidstream\b/gi,'processamento intermediário'],
  [/\bupstream\b/gi,'exploração e produção'],
  [/\bdownstream\b/gi,'distribuição e etapas finais da cadeia'],
  [/captura desigual do valor/gi,'distribuição desigual da renda gerada'],
  [/poder de captura de renda/gi,'capacidade de receber uma parcela maior da renda'],
  [/cadeia de captura de renda/gi,'distribuição da renda ao longo da cadeia'],
  [/canais de captura da renda/gi,'mecanismos de apropriação de lucros, juros, tarifas e royalties'],
  [/captura de renda futura/gi,'apropriação de renda futura'],
  [/captura de valor/gi,'apropriação de valor econômico'],
  [/captura de margem/gi,'retenção de margens'],
  [/\bcross-asset\b/gi,'entre classes de ativos'],
  [/\bfunding\b/gi,'financiamento'],
  [/\brepricing\b/gi,'reprecificação'],
  [/\bterm premium\b/gi,'prêmio de prazo'],
  [/\bsmall caps\b/gi,'ações de empresas de menor capitalização'],
  [/\bprivate credit\b/gi,'crédito privado'],
  [/\butilities\b/gi,'empresas de serviços públicos'],
  [/\bdividend yield\b/gi,'rendimento de dividendos'],
  [/\byields reais\/nominais\b/gi,'juros reais e nominais'],
  [/\byields? longos\b/gi,'juros de longo prazo'],
  [/\byields\b/gi,'juros de mercado'],
  [/\byield\b/gi,'juro de mercado'],
  [/\bvaluation\b/gi,'avaliação de mercado'],
  [/\bvaluations\b/gi,'avaliações de mercado'],
  [/\bhedge\b/gi,'proteção'],
  [/\bbuffers?\b/gi,'reservas de segurança'],
  [/\bcustodians?\b/gi,'instituições de custódia'],
  [/\brents\b/gi,'rendas econômicas'],
  [/\bmarket cap\b/gi,'capitalização de mercado'],
  [/\blead times\b/gi,'prazos de entrega'],
  [/\binventories\b/gi,'estoques'],
  [/\btreatment charges\b/gi,'taxas de tratamento'],
  [/\bcarregar duration\b/gi,'manter exposição ao risco de prazo'],
  [/\bduration alta\b/gi,'alta sensibilidade aos juros de longo prazo'],
  [/\bmaior duration\b/gi,'maior sensibilidade aos juros de longo prazo'],
  [/\bmenor duration\b/gi,'menor sensibilidade aos juros de longo prazo'],
  [/\bcarry trade\b/gi,'estratégia baseada no diferencial de juros'],
  [/\bcarry elevado\b/gi,'diferencial de juros elevado'],
  [/\bfornecem carry\b/gi,'oferecem diferencial de juros'],
  [/\bnovo delta material\b/gi,'nova mudança material'],
  [/\bsem novo delta\b/gi,'sem mudança material adicional'],
  [/\bO delta de hoje\b/gi,'A principal mudança de hoje'],
  [/\bDelta\.\b/gi,'Mudança desde a edição anterior.']
];

const enRules=[
  [/physically dependent on bottlenecks concentrated in Asia/gi,'dependent on critical processing and manufacturing assets concentrated in Asia'],
  [/control of bottlenecks/gi,'control over critical assets and capabilities'],
  [/concentration of bottlenecks/gi,'concentration in critical assets and capabilities'],
  [/technological bottlenecks/gi,'critical technological capabilities'],
  [/production bottlenecks/gi,'critical production constraints'],
  [/physical bottlenecks/gi,'critical physical infrastructure and processing capacity'],
  [/mineral bottleneck/gi,'concentration in mineral processing and refining'],
  [/marginal bottleneck/gi,'binding constraint'],
  [/the bottleneck shifts to/gi,'the binding constraint shifts to'],
  [/the bottleneck becomes/gi,'the binding constraint becomes'],
  [/\bbottlenecks\b/gi,'critical constraints'],
  [/\bbottleneck\b/gi,'binding constraint'],
  [/causal funnel/gi,'transmission mechanism'],
  [/regime funnel/gi,'regime transmission mechanism'],
  [/system['’]s control price/gi,'key benchmark for financing conditions'],
  [/control price/gi,'financing benchmark'],
  [/financial reservoir/gi,'major financial center'],
  [/reservoir of wealth/gi,'stock of wealth'],
  [/global reservoir/gi,'global destination for savings and investment'],
  [/income-capture chain/gi,'distribution of income along the value chain'],
  [/income capture/gi,'income distribution'],
  [/value capture/gi,'where profits and income accrue'],
  [/layered maps of power/gi,'different dimensions of wealth and economic capacity'],
  [/marginal flow of economic power/gi,'shift in strategic investment and economic influence'],
  [/marginal constraint/gi,'binding constraint']
];

const apply=(text,rules)=>rules.reduce((out,[rx,to])=>out.replace(rx,to),text);

function cleanHtml(text,rules){
  const protectedBlock=/(<(?:script|style|pre|code)\b[\s\S]*?<\/(?:script|style|pre|code)>|<[^>]+>)/gi;
  return text.split(protectedBlock).map(part=>part.startsWith('<')?part:apply(part,rules)).join('');
}

function cleanMarkdown(text,rules){
  return text.split(/(```[\s\S]*?```)/g).map(part=>{
    if(part.startsWith('```')) return part;
    return part.split(/(https?:\/\/[^\s<>"')\]]+)/g).map(piece=>/^https?:\/\//.test(piece)?piece:apply(piece,rules)).join('');
  }).join('');
}

function localeFor(rel,text){
  if(rel.startsWith('pt-br/')&&rel.endsWith('.html')) return 'pt-BR';
  if(rel.endsWith('.html')&&/<html\s+lang=["']en(?:-[^"']*)?["']/i.test(text)) return 'en';
  if(/^reports\/\d{4}\/\d{2}\/[^/]+\.md$/i.test(rel)) return 'pt-BR';
  if(rel.endsWith('/pt-BR.md')) return 'pt-BR';
  if(rel.endsWith('/en.md')) return 'en';
  return null;
}

let changed=0;
for(const file of walk(root)){
  const rel=path.relative(root,file).split(path.sep).join('/');
  if(!rel.endsWith('.html')&&!rel.endsWith('.md')) continue;
  const before=fs.readFileSync(file,'utf8');
  const locale=localeFor(rel,before);
  if(!locale) continue;
  const rules=locale==='pt-BR'?ptRules:enRules;
  const after=rel.endsWith('.html')?cleanHtml(before,rules):cleanMarkdown(before,rules);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}

console.log(`Final editorial cleanup OK: ${changed} public research files adjusted.`);
