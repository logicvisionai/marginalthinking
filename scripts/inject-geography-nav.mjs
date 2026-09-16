import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const out=path.join(root,'dist');
const walk=dir=>!fs.existsSync(dir)?[]:fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

function addAfterResearch(body,locale){
  const href=locale==='pt-BR'?'/pt-br/regions/':'/regions/';
  const label=locale==='pt-BR'?'Países & Regiões':'Countries & Regions';
  if(body.includes(`href="${href}"`))return body;
  const reportHref=locale==='pt-BR'?'/pt-br/reports.html':'/reports.html';
  const re=new RegExp(`(<a href="${reportHref.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*>[^<]*<\\/a>)`);
  return body.replace(re,`$1<a href="${href}">${label}</a>`);
}

for(const file of walk(out).filter(p=>p.endsWith('.html'))){
  let html=fs.readFileSync(file,'utf8');
  const locale=/<html\s+lang="pt-BR"/i.test(html)?'pt-BR':'en';
  html=html.replace(/<nav class="nav"([^>]*)>([\s\S]*?)<\/nav>/,(m,attrs,body)=>`<nav class="nav"${attrs}>${addAfterResearch(body,locale)}</nav>`);
  html=html.replace(/(<div class="mobile-menu"[\s\S]*?<nav>)([\s\S]*?)(<\/nav>[\s\S]*?<\/div>)/,(m,start,body,end)=>`${start}${addAfterResearch(body,locale)}${end}`);
  fs.writeFileSync(file,html);
}
console.log('Countries & Regions navigation injected into rendered EN and pt-BR pages.');
