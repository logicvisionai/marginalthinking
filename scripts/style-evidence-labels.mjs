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

function classFor(label=''){
  const s=label.toLocaleLowerCase('pt-BR');
  if(/fato observado|observed fact/.test(s))return'evidence-fact';
  if(/infer[eê]ncia|inference/.test(s))return'evidence-inference';
  if(/cen[aá]rio|scenario/.test(s))return'evidence-scenario';
  return'evidence-note';
}

function splitLabel(raw=''){
  const clean=raw.trim().replace(/[.。]\s*$/,'');
  const parts=clean.split(/\s*[·•]\s*/).map(x=>x.trim()).filter(Boolean);
  if(parts.length>1)return{type:parts.shift(),confidence:parts.join(' · ')};
  return{type:clean,confidence:''};
}

function transform(html){
  let changed=false;
  const paragraph=/<p><strong>([^<]*(?:confian[cç]a|confidence)[^<]*?)<\/strong>\s*([\s\S]*?)<\/p>/gi;
  html=html.replace(paragraph,(full,label,body)=>{
    changed=true;
    const {type,confidence}=splitLabel(label);
    const cssClass=classFor(type);
    const meta=confidence
      ? `<span class="evidence-meta"><span class="evidence-type">${type}</span><span class="evidence-separator" aria-hidden="true"></span><span class="evidence-confidence">${confidence}</span></span>`
      : `<span class="evidence-meta"><span class="evidence-type">${type}</span></span>`;
    return `<p class="evidence-statement ${cssClass}">${meta}<span class="evidence-body">${body.trim()}</span></p>`;
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

console.log(`Evidence labels styled: ${statementsChanged} statement(s) across ${filesChanged} HTML file(s).`);
