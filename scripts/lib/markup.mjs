export const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'item';
const href=raw=>/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(String(raw).trim())?esc(String(raw).trim()):'#';
const tok=(prefix,i)=>`\u0000${prefix}${i}\u0000`;

export function inline(raw=''){
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

