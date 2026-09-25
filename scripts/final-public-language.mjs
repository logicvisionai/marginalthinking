import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist missing');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const escAttr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function parseLabel(raw=''){
  const clean=raw.trim().replace(/^\[|\]$/g,'').replace(/[.。]\s*$/,'');
  const parts=clean.split(/\s*[·•]\s*/).map(x=>x.trim()).filter(Boolean);
  return{type:parts[0]||'',confidence:parts.slice(1).join(' · ')};
}
function englishOf(type='',confidence=''){return /observed fact|inference|analysis|scenario|confidence|\bhigh\b|\bmedium\b|\blow\b/i.test(`${type} ${confidence}`);}
function kindOf(type='',en=false){
  const s=type.toLocaleLowerCase('pt-BR');
  if(/fato observado|observed fact|^fato$|^fact$|^dado$|^data$/.test(s))return en?'Data':'Dado';
  if(/infer[eê]ncia|inference|an[aá]lise|analysis/.test(s))return en?'Analysis':'Análise';
  if(/cen[aá]rio|scenario/.test(s))return en?'Scenario':'Cenário';
  return type.trim();
}
function levelOf(confidence='',en=false){
  let s=confidence.toLocaleLowerCase('pt-BR').replace(/^confian[cç]a\s*/i,'').replace(/^confidence\s*/i,'').replace(/\s*confidence$/i,'').trim();
  if(/m[eé]dia[- ]alta|medium[- ]high/.test(s))return en?'medium-high':'média-alta';
  if(/m[eé]dia[- ]baixa|medium[- ]low/.test(s))return en?'medium-low':'média-baixa';
  if(/alta|high/.test(s))return en?'high':'alta';
  if(/m[eé]dia|medium/.test(s))return en?'medium':'média';
  if(/baixa|low/.test(s))return en?'low':'baixa';
  return s;
}
function hintOf(type='',confidence='',en=false){
  const s=type.toLocaleLowerCase('pt-BR'),level=levelOf(confidence,en);
  const suffix=level?(en?` Confidence level: ${level}.`:` Grau de confiança: ${level}.`):'';
  if(/fato observado|observed fact|^fato$|^fact$|^dado$|^data$/.test(s))return en?`Data reported by a source cited in the report.${suffix}`:`Dado sustentado por fonte citada no relatório.${suffix}`;
  if(/infer[eê]ncia|inference|an[aá]lise|analysis/.test(s))return en?`Analytical interpretation based on the cited data and sources.${suffix}`:`Interpretação analítica baseada nos dados e nas fontes citadas.${suffix}`;
  if(/cen[aá]rio|scenario/.test(s))return en?`Conditional scenario used for analysis; it is not a forecast.${suffix}`:`Cenário condicional usado na análise; não é uma previsão.${suffix}`;
  return en?`Editorial note.${suffix}`:`Nota editorial.${suffix}`;
}
function badge(label=''){
  const {type,confidence}=parseLabel(label),en=englishOf(type,confidence),kind=kindOf(type,en),level=levelOf(confidence,en),hint=hintOf(type,confidence,en);
  return `<span class="evidence-badge" tabindex="0" role="note" aria-label="${escAttr(hint)}" title="${escAttr(hint)}" data-hint="${escAttr(hint)}">${[kind,level].filter(Boolean).join(' · ')}</span>`;
}

function fixEvidence(html){
  let count=0;
  html=html.replace(/<li([^>]*)><strong>\s*\[([^\]]*(?:confian[cç]a|confidence)[^\]]*)\]\s*([\s\S]*?)<\/strong>\s*([\s\S]*?)<\/li>/gi,(m,attrs,label,headline,rest)=>{
    count++;
    const cls=/\bclass\s*=/.test(attrs)?attrs.replace(/class=(["'])(.*?)\1/i,(_,q,v)=>`class=${q}${v} evidence-statement${q}`):`${attrs} class="evidence-statement"`;
    const body=`${headline.trim()?`<strong>${headline.trim()}</strong>${rest.trim()?' ':''}`:''}${rest.trim()}`;
    return `<li${cls}>${body}${body?' ':''}${badge(label)}</li>`;
  });
  html=html.replace(/<li([^>]*)><strong>\s*([^<]*(?:confian[cç]a|confidence)[^<]*?)<\/strong>\s*([\s\S]*?)<\/li>/gi,(m,attrs,label,body)=>{
    count++;
    const cls=/\bclass\s*=/.test(attrs)?attrs.replace(/class=(["'])(.*?)\1/i,(_,q,v)=>`class=${q}${v} evidence-statement${q}`):`${attrs} class="evidence-statement"`;
    return `<li${cls}>${body.trim()} ${badge(label)}</li>`;
  });
  html=html.replace(/<span class="evidence-badge"[^>]*>(Fato|Fact|Infer[eê]ncia|Inference|Dado|Data|An[aá]lise|Analysis|Cen[aá]rio|Scenario)(?:\s*·\s*([^<]+))?<\/span>/gi,(m,type,level='')=>{
    const en=/Fact|Inference|Data|Analysis|Scenario/i.test(type);
    const normalizedLevel=level.trim();
    const confidence=en?(normalizedLevel?`${normalizedLevel} confidence`:''):(normalizedLevel?`confiança ${normalizedLevel}`:'');
    return badge(`${type}${confidence?` · ${confidence}`:''}`);
  });
  return{html,count};
}

const ptPairs=[
  [/\bInfer[eê]ncia\b/g,'Análise'],[/\binfer[eê]ncia\b/g,'análise'],
  [/\bDelta\b/g,'Mudança'],[/\bdelta\b/g,'mudança'],
  [/\bgargalos\b/gi,'restrições'],[/\bgargalo\b/gi,'restrição'],
  [/\bmidstream\b/gi,'processamento intermediário'],
  [/\bgreenfield\b/gi,'novos projetos de investimento'],
  [/\bcross-border\b/gi,'transfronteiriço'],
  [/\bfunding\b/gi,'financiamento'],
  [/\bhedge\b/gi,'proteção'],
  [/\bduration\b/gi,'sensibilidade aos juros de longo prazo'],
  [/\byields\b/gi,'rendimentos'],[/\byield\b/gi,'rendimento'],
  [/\bequities\b/gi,'ações'],
  [/\bvaluation\b/gi,'precificação'],
  [/\bbuffers\b/gi,'reservas'],[/\bbuffer\b/gi,'reserva'],
  [/\bcapex\b/gi,'investimento de capital'],
  [/\bproxy\b/gi,'indicador aproximado'],
  [/\brepricing\b/gi,'ajuste de preços de mercado'],
  [/\btail risks?\b/gi,'riscos extremos'],
  [/\bsecond-order effects?\b/gi,'efeitos indiretos'],
  [/\bFDI\b/g,'investimento estrangeiro direto'],
  [/\bSWFs?\b/g,'fundos soberanos'],
  [/\bUST 10Y\b/g,'título do Tesouro dos EUA de 10 anos'],
  [/\bTreasury de 10 anos\b/gi,'título do Tesouro dos EUA de 10 anos'],
  [/\bTreasuries\b/gi,'títulos do Tesouro dos EUA'],
  [/\bdata centers\b/gi,'centros de dados'],
  [/\bRegime de 2025\b/g,'Contexto econômico de 2025'],
  [/\bregime de 2025\b/g,'contexto econômico de 2025'],
  [/\bregime atual\b/gi,'cenário atual'],
  [/\bregime macroecon[oô]mico\b/gi,'cenário macroeconômico'],
  [/\bregime de mercado\b/gi,'ambiente de mercado']
];
const enPairs=[
  [/\bInference\b/g,'Analysis'],[/\binference\b/g,'analysis'],
  [/\bDelta\b/g,'Change'],[/\bdelta\b/g,'change'],
  [/\bbottlenecks\b/gi,'constraints'],[/\bbottleneck\b/gi,'constraint'],
  [/\bmidstream\b/gi,'processing and intermediate manufacturing'],
  [/\bgreenfield\b/gi,'new investment projects'],
  [/\bfunding\b/gi,'financing'],
  [/\bhedge\b/gi,'protection'],
  [/\bcapex\b/gi,'capital investment'],
  [/\b2025 regime\b/gi,'2025 economic setting'],
  [/\bmarket regime\b/gi,'market environment']
];
function applyPairs(text,pairs){let out=text;for(const [re,to] of pairs)out=out.replace(re,to);return out;}
function visibleText(html){return html.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ');}
function normalizeHtml(text,en){
  const protectedBlocks=[];
  let work=text.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi,m=>{const token=`___MT_PROTECTED_${protectedBlocks.length}___`;protectedBlocks.push(m);return token;});
  work=work.split(/(<[^>]+>)/g).map(part=>part.startsWith('<')?part:applyPairs(part,en?enPairs:ptPairs)).join('');
  return work.replace(/___MT_PROTECTED_(\d+)___/g,(_,n)=>protectedBlocks[Number(n)]);
}
function normalizeMarkdown(text,en){return text.split(/(```[\s\S]*?```|https?:\/\/[^\s)\]]+)/g).map(part=>(part.startsWith('```')||/^https?:\/\//.test(part))?part:applyPairs(part,en?enPairs:ptPairs)).join('');}
function markdownCheckText(text){
  return text
    .replace(/```[\s\S]*?```/g,' ')
    .replace(/https?:\/\/[^\s)\]]+/g,' ');
}

const forbiddenPt=[/\binfer[eê]ncia\b/i,/\bdelta\b/i,/\bgargalo\b/i,/\bmidstream\b/i,/\bgreenfield\b/i,/\bfunding\b/i,/\bhedge\b/i,/\bduration\b/i,/\bvaluation\b/i];
// Keep standard finance terms such as duration, repricing and tail risk intact: broad
// word-level paraphrases can break grammar and precision in otherwise valid analysis.
const forbiddenEn=[/\binference\b/i,/\bdelta\b/i,/\bbottleneck\b/i,/\bmidstream\b/i,/\bgreenfield\b/i,/\bfunding\b/i];

let changed=0,evidenceFixed=0;
const failures=[];
for(const file of walk(root)){
  if(!/\.(html|md)$/i.test(file))continue;
  const rel=path.relative(root,file).split(path.sep).join('/');
  const before=fs.readFileSync(file,'utf8');
  const isHtml=file.endsWith('.html');
  const en=isHtml?/<html\s+lang=["']en(?:-[^"']*)?["']/i.test(before):/\/en\.md$/i.test(rel);
  const pt=isHtml?/<html\s+lang=["']pt(?:-BR)?["']/i.test(before):(/^reports\/\d{4}\/\d{2}\/[^/]+\.md$/i.test(rel)||/\/pt-BR\.md$/i.test(rel));
  if(!en&&!pt)continue;
  let work=before;
  if(isHtml){const fixed=fixEvidence(work);work=fixed.html;evidenceFixed+=fixed.count;work=normalizeHtml(work,en);}else work=normalizeMarkdown(work,en);
  if(work!==before){fs.writeFileSync(file,work);changed++;}
  const check=isHtml?visibleText(work):markdownCheckText(work);
  for(const re of en?forbiddenEn:forbiddenPt)if(re.test(check))failures.push(`${rel}: unresolved public-language term ${re}`);
}
if(failures.length){console.error(failures.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Final public-language pass OK: ${changed} file(s) updated; ${evidenceFixed} list evidence label(s) moved to end badges.`);
