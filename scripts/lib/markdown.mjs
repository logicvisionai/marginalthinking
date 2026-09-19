import {esc, slug, inline} from './markup.mjs';
import {renderVisual, renderTable, renderFlow} from './research-visuals.mjs';
export {esc, slug} from './markup.mjs';

function split(line=''){let s=line.trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(x=>x.trim());}
function separator(line=''){const c=split(line);return c.length>1&&c.every(x=>/^:?-{3,}:?$/.test(x));}
function block(lines,i){const l=(lines[i]||'').trim(),n=(lines[i+1]||'').trim();return !l||/^#{1,4}\s/.test(l)||/^[-*_]{3,}$/.test(l)||/^>\s?/.test(l)||/^[-+*]\s+/.test(l)||/^\d+[.)]\s+/.test(l)||/^```/.test(l)||(l.includes('|')&&separator(n));}
export function renderMarkdown(md='',options={}){
  const locale=options.locale||'en',notes=new Map(),lines=[];
  for(const line of md.replace(/\r/g,'').split('\n')){const m=line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);m?notes.set(m[1],m[2]):lines.push(line);}
  const out=[],toc=[];let i=0,seenH1=false,sectionTitle='';
  while(i<lines.length){const l=lines[i].trim();if(!l){i++;continue;}
    const f=l.match(/^```([^\s]*)\s*$/);if(f){const c=[];i++;while(i<lines.length&&!/^```\s*$/.test(lines[i].trim()))c.push(lines[i++]);i++;out.push(renderVisual(f[1].toLowerCase(),c,locale));continue;}
    const h=l.match(/^(#{1,4})\s+(.+)$/);if(h){let level=h[1].length;const text=h[2].trim();if(level===1){if(!seenH1){seenH1=true;i++;continue;}level=2;}sectionTitle=text;const id=slug(text);if(level===2)toc.push({id,text});out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);i++;continue;}
    if(/^[-*_]{3,}$/.test(l)){out.push('<hr>');i++;continue;}
    if(l.includes('|')&&separator((lines[i+1]||'').trim())){const heads=split(l),rows=[];i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].includes('|'))rows.push(split(lines[i++]));out.push(renderTable(heads,rows,locale,''));continue;}
    if(/^>\s?/.test(l)){const q=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim()))q.push(lines[i++].trim().replace(/^>\s?/,''));out.push(`<blockquote>${q.map(x=>`<p>${inline(x)}</p>`).join('')}</blockquote>`);continue;}
    if(/^[-+*]\s+/.test(l)){const a=[];while(i<lines.length&&/^[-+*]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^[-+*]\s+/,''));out.push(`<ul>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`);continue;}
    if(/^\d+[.)]\s+/.test(l)){const a=[];while(i<lines.length&&/^\d+[.)]\s+/.test(lines[i].trim()))a.push(lines[i++].trim().replace(/^\d+[.)]\s+/,''));out.push(`<ol>${a.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`);continue;}
    const p=[l];i++;while(i<lines.length&&!block(lines,i))p.push(lines[i++].trim());const joined=p.filter(Boolean).join(' ');out.push((joined.match(/(?:→|->)/g)||[]).length>=2&&joined.length<420?renderFlow([joined],locale):`<p>${inline(joined)}</p>`);
  }
  if(notes.size){const title=locale==='pt-BR'?'Notas':'Notes';out.push(`<section class="footnotes"><h2 id="notes">${title}</h2><ol>${[...notes].map(([id,t])=>`<li id="fn-${slug(id)}">${inline(t)} <a class="footnote-back" href="#fnref-${slug(id)}">↩</a></li>`).join('')}</ol></section>`);toc.push({id:'notes',text:title});}
  let html=out.join('\n');html=html.replace(/(<h2[^>]*>.*?<\/h2>)([\s\S]*?)(?=<h2|$)/g,'<section class="report-section">$1$2</section>');return{html,toc};
}
