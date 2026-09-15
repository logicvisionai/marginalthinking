export const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'item';
const href=raw=>/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(String(raw).trim())?esc(String(raw).trim()):'#';

function inline(raw=''){
  let text=esc(raw);const code=[],links=[];
  text=text.replace(/`([^`]+)`/g,(_,v)=>{code.push(`<code>${v}</code>`);return `\u0000C${code.length-1}\u0000`;});
  text=text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,(_,label,url)=>{links.push(`<a href="${href(url)}" rel="noopener noreferrer">${label}</a>`);return `\u0000L${links.length-1}\u0000`;});
  text=text.replace(/\[\^([^\]]+)\]/g,(_,id)=>`<sup class="footnote-ref"><a href="#fn-${slug(id)}" id="fnref-${slug(id)}">${esc(id)}</a></sup>`);
  text=text.replace(/(^|\s)(https?:\/\/[^\s<]+)/g,(m,prefix,url)=>{const clean=url.replace(/[),.;]+$/,'');links.push(`<a href="${href(clean)}" rel="noopener noreferrer">${esc(clean)}</a>`);return `${prefix}\u0000L${links.length-1}\u0000${url.slice(clean.length)}`;});
  text=text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__(.+?)__/g,'<strong>$1</strong>');
  text=text.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,;:!?])/g,'$1<em>$2</em>').replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,;:!?])/g,'$1<em>$2</em>');
  return text.replace(/\u0000L(\d+)\u0000/g,(_,i)=>links[+i]||'').replace(/\u0000C(\d+)\u0000/g,(_,i)=>code[+i]||'');
}
function split(line=''){let s=line.trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(x=>x.trim());}
function separator(line=''){const c=split(line);return c.length>1&&c.every(x=>/^:?-{3,}:?$/.test(x));}
function block(lines,i){const l=(lines[i]||'').trim(),n=(lines[i+1]||'').trim();return !l||/^#{1,4}\s/.test(l)||/^[-*_]{3,}$/.test(l)||/^>\s?/.test(l)||/^[-+*]\s+/.test(l)||/^\d+[.)]\s+/.test(l)||/^```/.test(l)||(l.includes('|')&&separator(n));}
function number(raw=''){const s=String(raw).trim().replace(/\s/g,'').replace(/%/g,'');let n=s;if(/^[-+]?\d{1,3}(?:\.\d{3})*,\d+$/.test(s))n=s.replace(/\./g,'').replace(',','.');else if(/^[-+]?\d+,\d+$/.test(s))n=s.replace(',','.');n=n.replace(/[^\d+\-.]/g,'');const v=Number(n);return Number.isFinite(v)?v:null;}
function table(headers,rows){const numeric=headers.map((_,i)=>rows.filter(r=>number(r[i])!==null).length>=Math.max(2,Math.ceil(rows.length*.6)));return `<div class="md-table-wrap" role="region" aria-label="Tabela de dados" tabindex="0"><table class="md-table"><thead><tr>${headers.map((h,i)=>`<th scope="col"${numeric[i]?' class="numeric"':''}>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${headers.map((_,i)=>`<td${numeric[i]?' class="numeric"':''}>${inline(r[i]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function flow(raw){const steps=raw.join(' ').split(/\s*(?:→|->)\s*/).map(x=>x.trim()).filter(Boolean);if(steps.length<2)return `<pre class="code-block"><code>${esc(raw.join('\n'))}</code></pre>`;return `<div class="flow-diagram" role="group" aria-label="Cadeia causal">${steps.map((x,i)=>`<div class="flow-node"><span>${i+1}</span><strong>${inline(x)}</strong></div>${i<steps.length-1?'<div class="flow-arrow" aria-hidden="true">→</div>':''}`).join('')}</div>`;}
function chart(title,unit,rows){const vals=rows.map(([l,v])=>[l,Number(v)]).filter(([,v])=>Number.isFinite(v));if(!vals.length)return'';const max=Math.max(...vals.map(([,v])=>Math.abs(v)),1e-9);return `<figure class="research-chart"><figcaption>${inline(title||'Visualização')}</figcaption><div class="chart-rows">${vals.map(([l,v])=>{const pct=Math.max(1.5,Math.abs(v)/max*49),pos=v>=0?`left:50%;width:${pct}%`:`right:50%;width:${pct}%`;return `<div class="chart-row"><div class="chart-label">${esc(l)}</div><div class="chart-track"><span class="chart-bar ${v>=0?'positive':'negative'}" style="${pos}"></span></div><div class="chart-value">${v>0?'+':''}${v.toLocaleString('pt-BR',{maximumFractionDigits:2})}${esc(unit||'')}</div></div>`;}).join('')}</div></figure>`;}
function fence(lang,content){if(lang==='flow')return flow(content);if(lang==='chart'){let title='Visualização',unit='';const rows=[];for(const raw of content){const l=raw.trim();if(!l)continue;if(/^title\s*:/i.test(l)){title=l.replace(/^title\s*:/i,'').trim();continue;}if(/^unit\s*:/i.test(l)){unit=l.replace(/^unit\s*:/i,'').trim();continue;}const p=l.split('|').map(x=>x.trim()),v=number(p[1]);if(p.length>1&&v!==null)rows.push([p[0],v]);}return chart(title,unit,rows);}return `<pre class="code-block"><code>${esc(content.join('\n'))}</code></pre>`;}

export function renderMarkdown(md=''){
  const notes=new Map(),lines=[];for(const line of md.replace(/\r/g,'').split('\n')){const m=line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);m?notes.set(m[1],m[2]):lines.push(line);}
  const out=[],toc=[];let i=0,skipH1=false;
  while(i<lines.length){const l=lines[i].trim();if(!l){i++;continue;}
    const f=l.match(/^```([^\s]*)\s*$/);if(f){const c=[];i++;while(i<lines.length&&!/^```\s*$/.test(lines[i].trim()))c.push(lines[i++]);i++;out.push(fence(f[1].toLowerCase(),c));continue;}
    const h=l.match(/^(#{1,4})\s+(.+)$/);if(h){const level=h[1].length,text=h[2].trim();if(level===1){if(!skipH1){skipH1=true;i++;continue;}const id=slug(text);toc.push({id,text});out.push(`<h2 id="${id}">${inline(text)}</h2>`);i++;continue;}const id=slug(text);if(level===2)toc.push({id,text});out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);i++;continue;}
    if(/^[-*_]{3,}$/.test(l)){out.push('<hr>');i++;continue;}
    if(l.includes('|')&&separator((lines[i+1]||'').trim())){const heads=split(l),rows=[];i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].includes('|'))rows.push(split(lines[i++]));out.push(table(heads,rows));continue;}
    if(/^>\s?/.test(l)){const q=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))q.push(lines[i++].trim().replace(/^>\s?/,''));out.push(`<blockquote>${q.map(x=>`<p>${inline(x)}</p>`).join('')}</blockquote>`);continue;}
    if(/^[-+*]\s+/.test(l)){const a=[];while(i<lines.length&&/^[-+*]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^[-+*]\s+/,''));out.push(`<ul>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`);continue;}
    if(/^\d+[.)]\s+/.test(l)){const a=[];while(i<lines.length&&/^\d+[.)]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^\d+[.)]\s+/,''));out.push(`<ol>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`);continue;}
    const p=[l];i++;while(i<lines.length&&!block(lines,i))p.push(lines[i++].trim());const joined=p.filter(Boolean).join(' ');out.push((joined.match(/(?:→|->)/g)||[]).length>=2&&joined.length<420?flow([joined]):`<p>${inline(joined)}</p>`);
  }
  if(notes.size){out.push(`<section class="footnotes"><h2 id="notas">Notas</h2><ol>${[...notes].map(([id,t])=>`<li id="fn-${slug(id)}">${inline(t)} <a class="footnote-back" href="#fnref-${slug(id)}">↩</a></li>`).join('')}</ol></section>`);toc.push({id:'notas',text:'Notas'});}
  let html=out.join('\n');html=html.replace(/(<h2[^>]*>.*?<\/h2>)([\s\S]*?)(?=<h2|$)/g,'<section class="report-section">$1$2</section>');return{html,toc};
}
