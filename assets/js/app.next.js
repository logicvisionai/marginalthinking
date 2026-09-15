const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function escapeHtml(value=''){
  const d=document.createElement('div');
  d.textContent=String(value);
  return d.innerHTML;
}

function safeHref(raw=''){
  const href=String(raw).trim();
  if(/^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(href)) return escapeHtml(href);
  return '#';
}

function inlineMd(raw=''){
  let text=escapeHtml(raw);
  const code=[];
  text=text.replace(/`([^`]+)`/g,(_,v)=>{code.push(`<code>${v}</code>`);return `\u0000C${code.length-1}\u0000`;});
  text=text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g,(_,label,href)=>`<a href="${safeHref(href)}" rel="noopener noreferrer">${label}</a>`);
  text=text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  text=text.replace(/__(.+?)__/g,'<strong>$1</strong>');
  text=text.replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,;:!?])/g,'$1<em>$2</em>');
  text=text.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,;:!?])/g,'$1<em>$2</em>');
  text=text.replace(/(^|\s)(https?:\/\/[^\s<]+)/g,(m,prefix,url)=>`${prefix}<a href="${safeHref(url.replace(/[),.;]+$/,''))}" rel="noopener noreferrer">${url}</a>`);
  text=text.replace(/\u0000C(\d+)\u0000/g,(_,i)=>code[Number(i)]||'');
  return text;
}

function slugify(text=''){
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'secao';
}

function initMobileNav(){
  const btn=$('.menu-toggle'),menu=$('#mobile-menu');
  if(!btn||!menu)return;
  const close=()=>{btn.setAttribute('aria-expanded','false');menu.classList.remove('open');document.body.classList.remove('menu-open');};
  btn.addEventListener('click',()=>{const next=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(next));menu.classList.toggle('open',next);document.body.classList.toggle('menu-open',next);});
  $$('a',menu).forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  window.addEventListener('resize',()=>{if(innerWidth>860)close();},{passive:true});
}

function formatDateLabel(iso=''){
  const [y,m,d]=iso.split('-');
  const months=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return y&&m&&d?`${d} ${months[Number(m)-1]} ${y}`:iso;
}

const kindLabels={'daily-macro':'Global Macro','weekly-wealth-flow':'Monitor Semanal','monthly-wealth-power':'Pesquisa Mensal','annual-wealth-power-map':'Pesquisa Anual'};

async function getReports(){const r=await fetch('/data/reports.json',{cache:'no-store'});if(!r.ok)throw new Error('arquivo de pesquisas indisponível');return r.json();}

function reportCard(item,featured=false){
  const tags=(item.tags||[]).slice(0,featured?5:3).map(t=>`<span>${escapeHtml(t)}</span>`).join('');
  return `<article class="research-card${featured?' featured':''}"><div class="research-card-meta"><span>${escapeHtml(kindLabels[item.kind]||'Pesquisa')}</span><time datetime="${escapeHtml(item.date)}">${formatDateLabel(item.date)}</time></div><div class="chips">${tags}</div><h3><a href="${safeHref(item.url)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.deck||'')}</p><div class="research-card-actions"><a href="${safeHref(item.url)}">Ler em HTML <span aria-hidden="true">→</span></a>${item.markdown_url?`<a href="${safeHref(item.markdown_url)}">Markdown</a>`:''}</div></article>`;
}

async function initHome(){const featured=$('#home-feature'),list=$('#home-research-list');if(!featured&&!list)return;try{const data=await getReports();if(!data.length)return;if(featured)featured.innerHTML=reportCard(data[0],true);if(list)list.innerHTML=data.slice(1,5).map(x=>reportCard(x)).join('');}catch(e){console.error(e);}}

async function initArchive(){
  const root=$('#archive-app');if(!root)return;
  const list=$('#archive-list'),search=$('#search-input'),yearSelect=$('#year-select'),kindSelect=$('#kind-select'),pager=$('#pager'),count=$('#results-count');
  const params=new URLSearchParams(location.search);let currentPage=Math.max(1,parseInt(params.get('page')||'1',10)||1);const data=await getReports();
  const years=[...new Set(data.map(x=>x.date?.slice(0,4)).filter(Boolean))];yearSelect.innerHTML='<option value="">Todos os anos</option>'+years.map(y=>`<option value="${y}">${y}</option>`).join('');
  if(kindSelect){const kinds=[...new Set(data.map(x=>x.kind).filter(Boolean))];kindSelect.innerHTML='<option value="">Todos os formatos</option>'+kinds.map(k=>`<option value="${escapeHtml(k)}">${escapeHtml(kindLabels[k]||k)}</option>`).join('');}
  search.value=params.get('q')||'';yearSelect.value=params.get('year')||'';if(kindSelect)kindSelect.value=params.get('kind')||'';const perPage=10;
  function render(){
    const q=search.value.trim().toLowerCase(),year=yearSelect.value,kind=kindSelect?.value||'';
    const filtered=data.filter(item=>{const blob=[item.title,item.deck,item.regime,item.key_risk,item.search_text,...(item.tags||[]),...(item.keywords||[])].join(' ').toLowerCase();return(!year||item.date?.startsWith(year))&&(!kind||item.kind===kind)&&(!q||blob.includes(q));});
    const pages=Math.max(1,Math.ceil(filtered.length/perPage));currentPage=Math.min(currentPage,pages);if(count)count.textContent=`${filtered.length} pesquisa${filtered.length===1?'':'s'}`;const start=(currentPage-1)*perPage;
    list.innerHTML=filtered.slice(start,start+perPage).map(item=>`<article class="archive-item"><div class="archive-date"><time datetime="${escapeHtml(item.date)}">${formatDateLabel(item.date)}</time><span>${escapeHtml(kindLabels[item.kind]||'Pesquisa')}</span></div><div><div class="tags">${(item.tags||[]).slice(0,5).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div><h3><a href="${safeHref(item.url)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.deck||'')}</p></div><div class="archive-actions"><a class="text-link" href="${safeHref(item.url)}">HTML →</a>${item.markdown_url?`<a class="text-link muted-link" href="${safeHref(item.markdown_url)}">Markdown</a>`:''}</div></article>`).join('');
    pager.innerHTML='';for(let i=1;i<=pages;i++){const b=document.createElement('button');b.type='button';b.textContent=i;b.className='page-btn'+(i===currentPage?' active':'');b.addEventListener('click',()=>{currentPage=i;render();scrollTo({top:root.offsetTop-120,behavior:'smooth'});});pager.appendChild(b);}
    const next=new URLSearchParams();if(q)next.set('q',search.value.trim());if(year)next.set('year',year);if(kind)next.set('kind',kind);if(currentPage>1)next.set('page',currentPage);history.replaceState(null,'',location.pathname+(next.toString()?`?${next}`:''));
  }
  search.addEventListener('input',()=>{currentPage=1;render();});yearSelect.addEventListener('change',()=>{currentPage=1;render();});kindSelect?.addEventListener('change',()=>{currentPage=1;render();});render();
}

function splitTableRow(line=''){let s=line.trim();if(s.startsWith('|'))s=s.slice(1);if(s.endsWith('|'))s=s.slice(0,-1);return s.split('|').map(x=>x.trim());}
function isTableSeparator(line=''){const cells=splitTableRow(line);return cells.length>1&&cells.every(c=>/^:?-{3,}:?$/.test(c.trim()));}
function isBlockStart(lines,i){const line=(lines[i]||'').trim(),next=(lines[i+1]||'').trim();return !line||/^#{1,4}\s/.test(line)||/^[-*_]{3,}$/.test(line)||/^>\s?/.test(line)||/^[-+*]\s+/.test(line)||/^\d+[.)]\s+/.test(line)||/^```/.test(line)||(line.includes('|')&&isTableSeparator(next));}

function renderTable(headers,rows){
  const numeric=headers.map((_,i)=>rows.filter(r=>/^-?[\d.,]+\s*%?$/.test((r[i]||'').replace(/[A-Za-z$€£¥R\s]/g,''))).length>=Math.max(2,Math.ceil(rows.length*.6)));
  return `<div class="md-table-wrap" role="region" aria-label="Tabela de dados" tabindex="0"><table class="md-table"><thead><tr>${headers.map((h,i)=>`<th${numeric[i]?' class="numeric"':''}>${inlineMd(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${headers.map((_,i)=>`<td${numeric[i]?' class="numeric"':''}>${inlineMd(r[i]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function parseNumber(raw=''){const clean=String(raw).replace(/\s/g,'').replace(/%/g,'').replace(/\./g,'').replace(',','.').replace(/[^\d+\-.]/g,'');const n=Number(clean);return Number.isFinite(n)?n:null;}
function renderSignedChart(title,unit,rows){
  const values=rows.map(([label,value])=>[label,Number(value)]).filter(x=>Number.isFinite(x[1]));if(!values.length)return'';const max=Math.max(...values.map(x=>Math.abs(x[1])),1e-9);
  return `<figure class="research-chart"><figcaption>${inlineMd(title||'Visualização')}</figcaption><div class="chart-rows">${values.map(([label,v])=>{const pct=Math.max(1.5,Math.abs(v)/max*49);const style=v>=0?`left:50%;width:${pct}%`:`right:50%;width:${pct}%`;return `<div class="chart-row"><div class="chart-label">${escapeHtml(label)}</div><div class="chart-track"><span class="chart-bar ${v>=0?'positive':'negative'}" style="${style}"></span></div><div class="chart-value">${v>0?'+':''}${v.toLocaleString('pt-BR',{maximumFractionDigits:2})}${escapeHtml(unit||'')}</div></div>`;}).join('')}</div></figure>`;
}

function renderFence(lang,content){
  const type=(lang||'').trim().toLowerCase();
  if(type==='flow'){const steps=content.join(' ').split(/\s*(?:→|->)\s*/).map(x=>x.trim()).filter(Boolean);if(steps.length>1)return `<div class="flow-diagram" role="group" aria-label="Fluxo">${steps.map((x,i)=>`<div class="flow-node"><span>${i+1}</span><strong>${inlineMd(x)}</strong></div>${i<steps.length-1?'<div class="flow-arrow" aria-hidden="true">→</div>':''}`).join('')}</div>`;}
  if(type==='chart'){let title='Visualização',unit='';const rows=[];for(const raw of content){const line=raw.trim();if(!line)continue;if(/^title\s*:/i.test(line)){title=line.replace(/^title\s*:/i,'').trim();continue;}if(/^unit\s*:/i.test(line)){unit=line.replace(/^unit\s*:/i,'').trim();continue;}const parts=line.split('|').map(x=>x.trim());if(parts.length>=2){const n=parseNumber(parts[1]);if(n!==null)rows.push([parts[0],n]);}}return renderSignedChart(title,unit,rows);}
  return `<pre class="code-block"><code>${escapeHtml(content.join('\n'))}</code></pre>`;
}

function maybeFlowParagraph(raw){const arrows=(raw.match(/(?:→|->)/g)||[]).length;if(arrows<2||raw.length>360)return null;const steps=raw.split(/\s*(?:→|->)\s*/).map(x=>x.trim()).filter(Boolean);if(steps.length<3)return null;return `<div class="flow-diagram inline-flow" role="group" aria-label="Cadeia causal">${steps.map((x,i)=>`<div class="flow-node"><span>${i+1}</span><strong>${inlineMd(x)}</strong></div>${i<steps.length-1?'<div class="flow-arrow" aria-hidden="true">→</div>':''}`).join('')}</div>`;}

function renderMarkdown(md=''){
  const lines=md.replace(/\r/g,'').split('\n'),out=[];let i=0,skippedTitle=false;
  while(i<lines.length){const line=lines[i].trim();if(!line){i++;continue;}
    const fence=line.match(/^```([^\s]*)\s*$/);if(fence){const lang=fence[1],content=[];i++;while(i<lines.length&&!/^```\s*$/.test(lines[i].trim())){content.push(lines[i]);i++;}i++;out.push(renderFence(lang,content));continue;}
    const heading=line.match(/^(#{1,4})\s+(.+)$/);if(heading){const level=heading[1].length,text=heading[2].trim();if(level===1&&!skippedTitle){skippedTitle=true;i++;continue;}const tag=`h${Math.min(level,4)}`;out.push(`<${tag}>${inlineMd(text)}</${tag}>`);i++;continue;}
    if(/^[-*_]{3,}$/.test(line)){out.push('<hr>');i++;continue;}
    if(line.includes('|')&&isTableSeparator((lines[i+1]||'').trim())){const headers=splitTableRow(line);i+=2;const rows=[];while(i<lines.length&&lines[i].trim().includes('|')&&lines[i].trim()){rows.push(splitTableRow(lines[i]));i++;}out.push(renderTable(headers,rows));continue;}
    if(/^>\s?/.test(line)){const quote=[];while(i<lines.length&&/^>\s?/.test(lines[i].trim())){quote.push(lines[i].trim().replace(/^>\s?/,''));i++;}out.push(`<blockquote>${quote.map(x=>`<p>${inlineMd(x)}</p>`).join('')}</blockquote>`);continue;}
    if(/^[-+*]\s+/.test(line)){const items=[];while(i<lines.length&&/^[-+*]\s+/.test(lines[i].trim())){items.push(lines[i].trim().replace(/^[-+*]\s+/,''));i++;}out.push(`<ul>${items.map(x=>`<li>${inlineMd(x)}</li>`).join('')}</ul>`);continue;}
    if(/^\d+[.)]\s+/.test(line)){const items=[];while(i<lines.length&&/^\d+[.)]\s+/.test(lines[i].trim())){items.push(lines[i].trim().replace(/^\d+[.)]\s+/,''));i++;}out.push(`<ol>${items.map(x=>`<li>${inlineMd(x)}</li>`).join('')}</ol>`);continue;}
    const para=[line];i++;while(i<lines.length&&!isBlockStart(lines,i)){para.push(lines[i].trim());i++;}const joined=para.filter(Boolean).join(' ');out.push(maybeFlowParagraph(joined)||`<p>${inlineMd(joined)}</p>`);
  }
  return out.join('\n');
}

function sectionize(html){const temp=document.createElement('div');temp.innerHTML=html;const nodes=[...temp.childNodes],frag=document.createDocumentFragment();let section=null;nodes.forEach(node=>{if(node.nodeType===1&&node.tagName==='H2'){section=document.createElement('section');section.className='report-section';node.id=slugify(node.textContent);section.appendChild(node);frag.appendChild(section);}else if(section)section.appendChild(node);else frag.appendChild(node);});temp.innerHTML='';temp.appendChild(frag);return temp.innerHTML;}

function enhancePercentTables(root){$$('.md-table',root).forEach(table=>{const headers=$$('thead th',table).map(x=>x.textContent.trim());const idx=headers.findIndex(h=>/(varia[cç][aã]o|movimento|mudan[cç]a|retorno)/i.test(h));if(idx<0)return;const rows=$$('tbody tr',table).map(tr=>{const cells=$$('td',tr);if(!cells[idx])return null;const raw=cells[idx].textContent.trim();if(!/%/.test(raw))return null;const n=parseNumber(raw);return n===null?null:[cells[0]?.textContent.trim()||'',n];}).filter(Boolean);if(rows.length<3||rows.length>14)return;const figure=document.createElement('div');figure.innerHTML=renderSignedChart(`${headers[idx]} — leitura visual`,'%',rows);table.parentElement.before(figure.firstElementChild);});}

function buildToc(root){const toc=$('#report-toc');if(!toc)return;const headings=$$('.report-section > h2',root);if(!headings.length){toc.closest('.panel')?.remove();return;}toc.innerHTML=headings.map(h=>`<a href="#${h.id}">${escapeHtml(h.textContent)}</a>`).join('');const links=$$('a',toc),map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));const obs=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!visible)return;links.forEach(a=>a.classList.remove('active'));map.get(visible.target.id)?.classList.add('active');},{rootMargin:'-20% 0px -70%'});headings.forEach(h=>obs.observe(h));}

async function initReport(){const root=$('#report-content');if(!root)return;try{const r=await fetch(root.dataset.markdown,{cache:'no-store'});if(!r.ok)throw new Error('Markdown indisponível');root.innerHTML=sectionize(renderMarkdown(await r.text()));enhancePercentTables(root);buildToc(root);}catch(e){root.innerHTML='<div class="report-error"><strong>Não foi possível carregar esta pesquisa.</strong><p>O arquivo Markdown não respondeu corretamente.</p></div>';console.error(e);}}

document.addEventListener('DOMContentLoaded',()=>{initMobileNav();initHome();initArchive().catch(console.error);initReport();});
