import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const failures=[];
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const json=(p)=>JSON.parse(read(p));
const exists=(p)=>fs.existsSync(path.join(root,p));
const checks=(p)=>(p.date>'2026-10-12'||(p.date==='2026-10-12'&&Number(p.revision||0)>=1));
const stripFences=(s)=>s.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm,'');
const sourceUrls=(s)=>[...new Set((s.match(/https?:\/\/[^\s)\]]+/g)||[]).map(v=>v.replace(/[.,;]+$/,'')))];
const chartData=(s)=>[...s.matchAll(/^```chart\s*\n([\s\S]*?)^```/gm)].map(m=>m[1].split('\n').filter(l=>l.includes('|')).map(l=>l.split('|').slice(-1)[0].trim()));
const wordCount=(s)=>stripFences(s).replace(/https?:\/\/[^\s)]+/g,' ').split(/\s+/).filter(Boolean).length;
const visualCounts=(s)=>({chart:(s.match(/^```chart$/gm)||[]).length,flow:(s.match(/^```flow$/gm)||[]).length,map:(s.match(/^```map$/gm)||[]).length,table:(s.match(/^\|\s*[^\n]+\|$/gm)||[]).length});
const walk=(dir)=>!exists(dir)?[]:fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.posix.join(dir,e.name)):(e.name==='metadata.json'?[path.posix.join(dir,e.name)]:[]));
const tasks=[];
for(const f of fs.readdirSync(path.join(root,'data/pending')).filter(x=>x.endsWith('.json'))){
  const p=json('data/pending/'+f);
  if(!checks(p))continue;
  // Only reviewed/approved work belongs to the production-build contract.
  // The independent editorial-audit workflow checks all drafts in strict mode.
  if(process.env.MT_VALIDATE_ALL_PENDING!=='1'){
    const qaPath='data/approved/'+p.slug+'.json';
    if(!exists(qaPath))continue;
    const qa=json(qaPath);
    if(qa.qa_status!=='approved' || Number(qa.publication?.revision??0)!==Number(p.revision??0))continue;
  }
  const dir='staging/research/'+p.date.slice(0,4)+'/'+p.date.slice(5,7)+'/'+p.slug;
  tasks.push({p,dir,mode:'staged'});
}
for(const f of walk('reports')){
  const p=json(f);
  if(!checks(p))continue;
  tasks.push({p,dir:path.posix.dirname(f),mode:'public'});
}
for(const {p,dir,mode} of tasks){
  const isWeekly=p.cadence==='weekly';
  const minWords=isWeekly?2200:1700;
  const minCharts=isWeekly?3:2;
  const mdPath=(loc)=>mode==='staged'?p.sources?.[loc]?.markdown:path.posix.join(dir,p.locales?.[loc]?.markdown||'');
  const data={};
  for(const loc of ['en','pt-BR']){
    const file=mdPath(loc);
    if(!file||!exists(file)){failures.push(p.id+' '+mode+' '+loc+': missing Markdown');continue;}
    const content=read(file);data[loc]=content;
    const words=wordCount(content),visual=visualCounts(content),links=sourceUrls(content);
    const domains=new Set(links.map(u=>{try{return new URL(u).hostname;}catch{return 'invalid';}}));
    const headings=(content.match(/^## /gm)||[]).length;
    if(words<minWords)failures.push(p.id+' '+mode+' '+loc+': research too short ('+words+' < '+minWords+' substantive words)');
    if(links.length<(isWeekly?7:8))failures.push(p.id+' '+mode+' '+loc+': insufficient referenced source URLs ('+links.length+')');
    if(domains.size<4)failures.push(p.id+' '+mode+' '+loc+': fewer than four distinct source hosts');
    if(visual.chart<minCharts||visual.flow<1||visual.map<1||visual.table<3)failures.push(p.id+' '+mode+' '+loc+': research visual evidence budget missing');
    if(headings<6)failures.push(p.id+' '+mode+' '+loc+': insufficient analytical sections');
    if(!/(scenario|cen[aá]rio|hypothes|hip[oó]tes|conditional|condicional|test|evid[eê]ncia)/i.test(stripFences(content)))failures.push(p.id+' '+mode+' '+loc+': no explicit falsifiable interpretation');
    if(!/\b(2026|2025)\b/.test(content))failures.push(p.id+' '+mode+' '+loc+': observation dates absent');
  }
  if(data.en&&data['pt-BR']){
    const en=chartData(data.en),pt=chartData(data['pt-BR']);
    if(JSON.stringify(en)!==JSON.stringify(pt))failures.push(p.id+' '+mode+': chart numeric series not equivalent across languages');
  }
  if(mode==='public'){
    const approval='data/approved/'+p.slug+'.json';
    if(!exists(approval))failures.push(p.id+': approval absent');
    else{
      const qa=json(approval);
      if(qa.publication?.revision!==p.revision)failures.push(p.id+': approved revision mismatch');
      for(const key of ['research_depth','evidence_traceability','counterfactual_review']){
        if(qa.checks?.[key]?.result!=='passed')failures.push(p.id+': QA missing passed '+key);
      }
    }
  }
}
if(failures.length){console.error('Editorial depth validation failed:\n- '+failures.join('\n- '));process.exit(1)}
console.log('Editorial depth validation OK:',tasks.length,'revised and future research artifacts; text, sources, visual equivalence and QA gates checked.');
