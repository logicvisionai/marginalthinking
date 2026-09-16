import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const DIST=path.join(ROOT,'dist');
const STYLE_HREF='/assets/css/evidence-labels.css';
const STYLE_TAG=`<link rel="stylesheet" href="${STYLE_HREF}">`;

function walk(dir){
  if(!fs.existsSync(dir))return[];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}

function escAttr(value=''){
  return String(value)
    .replace(/&/g,'&amp;')
    .replace(/"/g,'&quot;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function splitLabel(raw=''){
  const clean=raw.trim().replace(/[.。]\s*$/,'');
  const parts=clean.split(/\s*[·•]\s*/).map(x=>x.trim()).filter(Boolean);
  if(parts.length>1)return{type:parts.shift(),confidence:parts.join(' · ')};
  return{type:clean,confidence:''};
}

function compactType(type=''){
  const s=type.toLocaleLowerCase('pt-BR');
  if(/fato observado/.test(s))return'Fato';
  if(/observed fact/.test(s))return'Fact';
  if(/infer[eê]ncia/.test(s))return'Inferência';
  if(/inference/.test(s))return'Inference';
  if(/cen[aá]rio/.test(s))return'Cenário';
  if(/scenario/.test(s))return'Scenario';
  return type.trim();
}

function compactConfidence(confidence=''){
  return confidence
    .replace(/^confian[cç]a\s*/i,'')
    .replace(/^confidence\s*/i,'')
    .replace(/\s+confidence$/i,'')
    .trim()
    .replace(/^alta$/i,'Alta')
    .replace(/^m[eé]dia-alta$/i,'Média-alta')
    .replace(/^m[eé]dia$/i,'Média')
    .replace(/^baixa$/i,'Baixa')
    .replace(/^high$/i,'High')
    .replace(/^medium-high$/i,'Medium-high')
    .replace(/^medium$/i,'Medium')
    .replace(/^low$/i,'Low');
}

function hintFor(type='',confidence=''){
  const english=/observed fact|inference|scenario|confidence/i.test(`${type} ${confidence}`);
  const cleanType=type.trim().replace(/[.。]\s*$/,'');
  const cleanConfidence=confidence.trim().replace(/[.。]\s*$/,'');
  if(english){
    return cleanConfidence
      ? `Method note: ${cleanType}; ${cleanConfidence.toLowerCase()}.`
      : `Method note: ${cleanType}.`;
  }
  return cleanConfidence
    ? `Nota metodológica: ${cleanType}; ${cleanConfidence.toLocaleLowerCase('pt-BR')}.`
    : `Nota metodológica: ${cleanType}.`;
}

function transform(html){
  let changed=false;
  const paragraph=/<p><strong>([^<]*(?:confian[cç]a|confidence)[^<]*?)<\/strong>\s*([\s\S]*?)<\/p>/gi;
  html=html.replace(paragraph,(full,label,body)=>{
    changed=true;
    const {type,confidence}=splitLabel(label);
    const compact=[compactType(type),compactConfidence(confidence)].filter(Boolean).join(' · ');
    const hint=hintFor(type,confidence);
    return `<p class="evidence-statement">${body.trim()} <span class="evidence-badge" tabindex="0" role="note" aria-label="${escAttr(hint)}" title="${escAttr(hint)}" data-hint="${escAttr(hint)}">${compact}</span></p>`;
  });

  if(changed&&!html.includes(STYLE_HREF)){
    html=html.replace('</head>',`${STYLE_TAG}</head>`);
  }
  return{html,changed};
}

let filesChanged=0;
let statementsChanged=0;
for(const file of walk(DIST).filter(f=>f.endsWith('.html'))){
  const before=fs.readFileSync(file,'utf8');
  const count=(before.match(/<p><strong>[^<]*(?:confian[cç]a|confidence)[^<]*?<\/strong>/gi)||[]).length;
  if(!count)continue;
  const result=transform(before);
  if(result.changed&&result.html!==before){
    fs.writeFileSync(file,result.html);
    filesChanged++;
    statementsChanged+=count;
  }
}

console.log(`Evidence badges styled: ${statementsChanged} statement(s) across ${filesChanged} HTML file(s).`);
