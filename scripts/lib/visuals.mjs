export const VISUAL_STANDARD_EFFECTIVE_DATE='2026-09-18';

const countTables=text=>{
  const lines=String(text||'').replace(/\r/g,'').split('\n');let n=0;
  for(let i=0;i<lines.length-1;i++){
    if(!lines[i].includes('|'))continue;
    if(!/^\|?\s*:?-{3,}/.test(lines[i+1].trim()))continue;
    n++;i++;
    while(i+1<lines.length&&lines[i+1].trim()&&lines[i+1].includes('|'))i++;
  }
  return n;
};
const countFence=(text,re)=>(String(text||'').match(re)||[]).length;

export function visualStats(text=''){
  const table=countTables(text);
  const chart=countFence(text,/^```chart\s*$/gmi);
  const flow=countFence(text,/^```flow\s*$/gmi);
  const mindmap=countFence(text,/^```mindmap\s*$/gmi);
  const map=countFence(text,/^```map\s*$/gmi);
  const diagram=countFence(text,/^```(?:diagram|text|ascii)\s*$/gmi);
  const structural=flow+mindmap+map+diagram;
  return {table,chart,flow,mindmap,map,diagram,structural,total:table+chart+structural};
}

export const visualSignature=text=>{
  const s=visualStats(text);
  return {table:s.table,chart:s.chart,flow:s.flow,mindmap:s.mindmap,map:s.map,diagram:s.diagram};
};

export function visualPolicyApplies(item={}){
  const date=String(item.date||'').slice(0,10);
  return Boolean(date&&date>=VISUAL_STANDARD_EFFECTIVE_DATE);
}

export function visualIssues(text,item={},file='research'){
  if(!visualPolicyApplies(item))return[];
  const s=visualStats(text),issues=[],format=item.format||'research';
  if(format==='data-note'){
    if(s.table+s.chart<1)issues.push(`${file}: visual standard exige ao menos uma tabela ou chart explícito`);
    return issues;
  }
  if(s.table<1)issues.push(`${file}: visual standard exige ao menos uma tabela`);
  if(s.chart<1)issues.push(`${file}: visual standard exige ao menos um chart explícito`);
  if(s.structural<1)issues.push(`${file}: visual standard exige ao menos um visual estrutural (flow, mindmap, map ou diagram)`);
  const minTotal=format==='brief'?3:4;
  if(s.total<minTotal)issues.push(`${file}: visual standard exige ao menos ${minTotal} visuais para format=${format}; encontrados ${s.total}`);
  return issues;
}
