export const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'item';
const href=raw=>/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(String(raw).trim())?esc(String(raw).trim()):'#';
const tok=(prefix,i)=>`\u0000${prefix}${i}\u0000`;

function inline(raw=''){
  let text=esc(raw);const code=[],links=[];
  text=text.replace(/`([^`]+)`/g,(_,v)=>{code.push(`<code>${v}</code>`);return tok('C',code.length-1);});
  text=text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,(_,label,url)=>{links.push(`<a href="${href(url)}" rel="noopener noreferrer">${label}</a>`);return tok('L',links.length-1);});
  text=text.replace(/\[\^([^\]]+)\]/g,(_,id)=>`<sup class="footnote-ref"><a href="#fn-${slug(id)}" id="fnref-${slug(id)}">${esc(id)}</a></sup>`);
  text=text.replace(/(^|\s)(https?:\/\/[^\s<]+)/g,(m,prefix,url)=>{const clean=url.replace(/[),.;]+$/,'');links.push(`<a href="${href(clean)}" rel="noopener noreferrer">${esc(clean)}</a>`);return `${prefix}${tok('L',links.length-1)}${url.slice(clean.length)}`;});
  text=text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__(.+?)__/g,'<strong>$1</strong>');
  text=text.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,;:!?])/g,'$1<em>$2</em>').replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,;:!?])/g,'$1<em>$2</em>');
  text=text.replace(/\*\*/g,'').replace(/__/g,'');
  return text.replace(/\u0000L(\d+)\u0000/g,(_,i)=>links[+i]||'').replace(/\u0000C(\d+)\u0000/g,(_,i)=>code[+i]||'');
}

function split(line=''){let s=line.trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(x=>x.trim());}
function separator(line=''){const c=split(line);return c.length>1&&c.every(x=>/^:?-{3,}:?$/.test(x));}
function block(lines,i){const l=(lines[i]||'').trim(),n=(lines[i+1]||'').trim();return !l||/^#{1,4}\s/.test(l)||/^[-*_]{3,}$/.test(l)||/^>\s?/.test(l)||/^[-+*]\s+/.test(l)||/^\d+[.)]\s+/.test(l)||/^```/.test(l)||(l.includes('|')&&separator(n));}
function number(raw=''){const s=String(raw).trim().replace(/\s/g,'').replace(/%/g,'');let n=s;if(/^[-+]?\d{1,3}(?:\.\d{3})*,\d+$/.test(s))n=s.replace(/\./g,'').replace(',','.');else if(/^[-+]?\d+,\d+$/.test(s))n=s.replace(',','.');n=n.replace(/[^\d+\-.]/g,'');const v=Number(n);return Number.isFinite(v)?v:null;}
const numLocale=(v,locale)=>v.toLocaleString(locale==='pt-BR'?'pt-BR':'en-US',{maximumFractionDigits:2});

function lineChart(title,unit,rows,locale='en'){
  const vals=rows.map(([l,v])=>[l,Number(v)]).filter(([,v])=>Number.isFinite(v));if(vals.length<2)return'';
  const w=680,h=250,p=30,min=Math.min(...vals.map(([,v])=>v)),max=Math.max(...vals.map(([,v])=>v)),span=(max-min)||1,step=(w-p*2)/Math.max(1,vals.length-1);
  const pt=(v,i)=>`${(p+i*step).toFixed(1)},${(h-p-((v-min)/span)*(h-p*2)).toFixed(1)}`;
  const grid=[0,.25,.5,.75,1].map(t=>{const y=(h-p-(h-p*2)*t).toFixed(1),label=numLocale(min+span*t,locale);return `<line x1="${p}" y1="${y}" x2="${w-p}" y2="${y}"/><text x="4" y="${+y+4}">${esc(label)}${esc(unit||'')}</text>`;}).join('');
  const dots=vals.map(([l,v],i)=>{const [x,y]=pt(v,i).split(',');return `<g class="chart-dot"><circle cx="${x}" cy="${y}" r="4"></circle><title>${esc(l)}: ${esc(numLocale(v,locale))}${esc(unit||'')}</title></g>`;}).join('');
  return `<figure class="research-chart line-chart"><figcaption>${inline(title||'Series')}</figcaption><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title||'Series')}"><g class="chart-grid">${grid}</g><polyline class="chart-line" fill="none" points="${vals.map(([,v],i)=>pt(v,i)).join(' ')}"></polyline>${dots}</svg><div class="chart-xlabels">${vals.map(([l])=>`<div>${esc(l)}</div>`).join('')}</div></figure>`;
}
function barChart(title,unit,rows,locale='en'){
  const vals=rows.map(([l,v])=>[l,Number(v)]).filter(([,v])=>Number.isFinite(v));if(!vals.length)return'';
  const max=Math.max(...vals.map(([,v])=>Math.abs(v)),1e-9);
  return `<figure class="research-chart"><figcaption>${inline(title||'Chart')}</figcaption><div class="chart-rows">${vals.map(([l,v])=>{const pct=Math.max(1.5,Math.abs(v)/max*49),pos=v>=0?`left:50%;width:${pct}%`:`right:50%;width:${pct}%`;return `<div class="chart-row"><div class="chart-label">${esc(l)}</div><div class="chart-track"><span class="chart-zero"></span><span class="chart-bar ${v>=0?'positive':'negative'}" style="${pos}"></span></div><div class="chart-value">${v>0?'+':''}${esc(numLocale(v,locale))}${esc(unit||'')}</div></div>`;}).join('')}</div></figure>`;
}
function chart(title,unit,rows,type='bar',locale='en'){return String(type).toLowerCase()==='line'?lineChart(title,unit,rows,locale):barChart(title,unit,rows,locale);}

function autoChart(headers,rows,locale='en'){
  if(rows.length<3||rows.length>12||headers.length<2)return'';
  const pattern=/(change|variation|share|growth|return|yield|rate|move|delta|varia|mudan|participa|crescimento|retorno|taxa|movimento|%)/i;
  let col=-1;
  for(let i=1;i<headers.length;i++){
    if(!pattern.test(headers[i]))continue;
    const numeric=rows.map(r=>number(r[i])).filter(v=>v!==null);
    if(numeric.length/rows.length>=.75){col=i;break;}
  }
  if(col<0)return'';
  const vals=rows.map(r=>[r[0],number(r[col])]).filter(([,v])=>v!==null);if(vals.length<3)return'';
  const unit=rows.some(r=>String(r[col]||'').includes('%'))||/%|share|participa/i.test(headers[col])?'%':'';
  return barChart(`${headers[0]} · ${headers[col]}`,unit,vals,locale);
}
function table(headers,rows,locale='en'){
  const numeric=headers.map((_,i)=>rows.filter(r=>number(r[i])!==null).length>=Math.max(2,Math.ceil(rows.length*.6)));
  const html=`<div class="md-table-wrap" role="region" aria-label="${locale==='pt-BR'?'Tabela de dados':'Data table'}" tabindex="0"><table class="md-table"><thead><tr>${headers.map((h,i)=>`<th scope="col"${numeric[i]?' class="numeric"':''}>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${headers.map((_,i)=>`<td${numeric[i]?' class="numeric"':''}>${inline(r[i]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return html+autoChart(headers,rows,locale);
}

function flow(raw,locale='en'){
  const steps=raw.join(' ').split(/\s*(?:→|->)\s*/).map(x=>x.trim()).filter(Boolean);
  if(steps.length<2)return `<pre class="code-block"><code>${esc(raw.join('\n'))}</code></pre>`;
  const label=locale==='pt-BR'?'Cadeia causal':'Causal chain';
  return `<div class="flow-diagram" role="group" aria-label="${label}">${steps.map((x,i)=>`<div class="flow-item"><div class="flow-node"><span class="flow-index">${i+1}</span><strong>${inline(x)}</strong></div>${i<steps.length-1?'<div class="flow-arrow" aria-hidden="true">→</div>':''}</div>`).join('')}</div>`;
}
function cleanDiagramLine(line=''){return line.replace(/\*\*/g,'').replace(/__/g,'');}
function dependencyMap(raw,locale='en'){
  const stages=[];let current=null;
  const heading=s=>{const x=s.replace(/[│├└┬┴┼─►▼→]/g,'').trim();return x.length>2&&x.length<90&&/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(x)&&x===x.toUpperCase()&&!/\d/.test(x);};
  for(const source of raw){const rawLine=cleanDiagramLine(source),trim=rawLine.trim();if(!trim||/^[│▼]+$/.test(trim))continue;
    if(heading(trim)){current={title:trim.replace(/[│├└┬┴┼─►▼→]/g,'').trim(),relations:[],notes:[]};stages.push(current);continue;}
    if(!current)continue;
    if(/[►→]/.test(trim)){const parts=trim.split(/[►→]/);const left=(parts.shift()||'').replace(/^[│├└┬┴┼─\s]+/,'').replace(/[─\s]+$/,'').trim();const right=parts.join('→').replace(/^[─\s]+/,'').trim();if(left&&right)current.relations.push([left,right]);continue;}
    const note=trim.replace(/^[│├└┬┴┼─\s]+/,'').trim();if(note&&!/^[-─]+$/.test(note))current.notes.push(note);
  }
  if(stages.length<2)return'';
  const label=locale==='pt-BR'?'Mapa de dependências':'Dependency map';
  return `<figure class="dependency-map" role="group" aria-label="${label}"><figcaption>${label}</figcaption><div class="dependency-stages">${stages.map((s,i)=>`<section class="dependency-stage"><div class="dependency-stage-index">${String(i+1).padStart(2,'0')}</div><h4>${inline(s.title)}</h4>${s.relations.length?`<div class="dependency-links">${s.relations.map(([a,b])=>`<div class="dependency-rel"><span>${inline(a)}</span><b aria-hidden="true">→</b><strong>${inline(b)}</strong></div>`).join('')}</div>`:''}${s.notes.length?`<div class="dependency-notes">${s.notes.map(n=>`<span>${inline(n)}</span>`).join('')}</div>`:''}</section>${i<stages.length-1?'<div class="dependency-arrow" aria-hidden="true">↓</div>':''}`).join('')}</div></figure>`;
}
function textDiagram(raw,locale='en'){
  const dep=dependencyMap(raw,locale);if(dep)return dep;
  const label=locale==='pt-BR'?'Diagrama':'Diagram';
  return `<figure class="text-diagram"><figcaption>${label}</figcaption><pre class="text-diagram-pre">${esc(raw.map(cleanDiagramLine).join('\n'))}</pre></figure>`;
}
function mindmap(raw,locale='en'){
  const lines=raw.filter(x=>x.trim());if(!lines.length)return'';
  const root=lines[0].trim().replace(/^[-*]\s*/,''),branches=[];let current=null;
  for(const source of lines.slice(1)){const indent=(source.match(/^\s*/)||[''])[0].replace(/\t/g,'    ').length,l=source.trim();if(!/^[-*]\s+/.test(l)){if(current)current.leaves.push(l);continue;}const value=l.replace(/^[-*]\s+/,'');if(indent<2){current={title:value,leaves:[]};branches.push(current);}else if(current)current.leaves.push(value);}
  if(!branches.length)return textDiagram(raw,locale);
  return `<figure class="mindmap" role="group" aria-label="${locale==='pt-BR'?'Mapa mental':'Mind map'}"><figcaption>${inline(root)}</figcaption><div class="mindmap-grid">${branches.map(b=>`<section class="mind-branch"><h4>${inline(b.title)}</h4>${b.leaves.length?`<ul>${b.leaves.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`:''}</section>`).join('')}</div></figure>`;
}
function regionClass(region=''){
  const s=slug(region);
  if(/north-amer|america-do-norte|estados-unidos|canada/.test(s))return'na';
  if(/latin|south-amer|america-latina|america-do-sul|brasil|brazil/.test(s))return'la';
  if(/europ/.test(s))return'eu';if(/afric/.test(s))return'af';if(/middle-east|oriente-medio|gulf|golfo/.test(s))return'me';if(/asia|china|india|japan|japao|korea|coreia/.test(s))return'as';if(/oceania|australia|pacific|pacifico/.test(s))return'oc';return'other';
}
function mapBlock(raw,locale='en'){
  let title=locale==='pt-BR'?'Mapa regional':'Regional map',unit='';const rows=[];
  for(const line of raw){const l=line.trim();if(!l)continue;if(/^title\s*:/i.test(l)){title=l.replace(/^title\s*:/i,'').trim();continue;}if(/^unit\s*:/i.test(l)){unit=l.replace(/^unit\s*:/i,'').trim();continue;}const p=l.split('|').map(x=>x.trim());if(p.length>=2)rows.push({region:p[0],value:p[1],note:p.slice(2).join(' | ')});}
  if(!rows.length)return'';
  return `<figure class="geo-map" role="group" aria-label="${esc(title)}"><figcaption>${inline(title)}</figcaption><div class="geo-map-board">${rows.map(r=>`<article class="geo-card region-${regionClass(r.region)}"><div class="geo-region">${inline(r.region)}</div><div class="geo-value">${inline(r.value)}${unit?`<span>${esc(unit)}</span>`:''}</div>${r.note?`<p>${inline(r.note)}</p>`:''}</article>`).join('')}</div></figure>`;
}
function fence(lang,content,locale='en'){
  if(lang==='flow')return flow(content,locale);if(lang==='mindmap')return mindmap(content,locale);if(lang==='map')return mapBlock(content,locale);if(lang==='text'||lang==='diagram'||lang==='ascii')return textDiagram(content,locale);
  if(lang==='chart'){
    let title=locale==='pt-BR'?'Visualização':'Chart',unit='',type='bar';const rows=[];
    for(const raw of content){const l=raw.trim();if(!l)continue;if(/^title\s*:/i.test(l)){title=l.replace(/^title\s*:/i,'').trim();continue;}if(/^unit\s*:/i.test(l)){unit=l.replace(/^unit\s*:/i,'').trim();continue;}if(/^type\s*:/i.test(l)){type=l.replace(/^type\s*:/i,'').trim();continue;}const p=l.split('|').map(x=>x.trim()),v=number(p[1]);if(p.length>1&&v!==null)rows.push([p[0],v]);}
    return chart(title,unit,rows,type,locale);
  }
  return `<pre class="code-block"><code>${esc(content.join('\n'))}</code></pre>`;
}

export function renderMarkdown(md='',options={}){
  const locale=options.locale||'en',notes=new Map(),lines=[];
  for(const line of md.replace(/\r/g,'').split('\n')){const m=line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);m?notes.set(m[1],m[2]):lines.push(line);}
  const out=[],toc=[];let i=0,seenH1=false;
  while(i<lines.length){const l=lines[i].trim();if(!l){i++;continue;}
    const f=l.match(/^```([^\s]*)\s*$/);if(f){const c=[];i++;while(i<lines.length&&!/^```\s*$/.test(lines[i].trim()))c.push(lines[i++]);i++;out.push(fence(f[1].toLowerCase(),c,locale));continue;}
    const h=l.match(/^(#{1,4})\s+(.+)$/);if(h){let level=h[1].length;const text=h[2].trim();if(level===1){if(!seenH1){seenH1=true;i++;continue;}level=2;}const id=slug(text);if(level===2)toc.push({id,text});out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);i++;continue;}
    if(/^[-*_]{3,}$/.test(l)){out.push('<hr>');i++;continue;}
    if(l.includes('|')&&separator((lines[i+1]||'').trim())){const heads=split(l),rows=[];i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].includes('|'))rows.push(split(lines[i++]));out.push(table(heads,rows,locale));continue;}
    if(/^>\s?/.test(l)){const q=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))q.push(lines[i++].trim().replace(/^>\s?/,''));out.push(`<blockquote>${q.map(x=>`<p>${inline(x)}</p>`).join('')}</blockquote>`);continue;}
    if(/^[-+*]\s+/.test(l)){const a=[];while(i<lines.length&&/^[-+*]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^[-+*]\s+/,''));out.push(`<ul>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`);continue;}
    if(/^\d+[.)]\s+/.test(l)){const a=[];while(i<lines.length&&/^\d+[.)]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^\d+[.)]\s+/,''));out.push(`<ol>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`);continue;}
    const p=[l];i++;while(i<lines.length&&!block(lines,i))p.push(lines[i++].trim());const joined=p.filter(Boolean).join(' ');out.push((joined.match(/(?:→|->)/g)||[]).length>=2&&joined.length<420?flow([joined],locale):`<p>${inline(joined)}</p>`);
  }
  if(notes.size){const title=locale==='pt-BR'?'Notas':'Notes';out.push(`<section class="footnotes"><h2 id="notes">${title}</h2><ol>${[...notes].map(([id,t])=>`<li id="fn-${slug(id)}">${inline(t)} <a class="footnote-back" href="#fnref-${slug(id)}">↩</a></li>`).join('')}</ol></section>`);toc.push({id:'notes',text:title});}
  let html=out.join('\n');html=html.replace(/(<h2[^>]*>.*?<\/h2>)([\s\S]*?)(?=<h2|$)/g,'<section class="report-section">$1$2</section>');return{html,toc};
}
