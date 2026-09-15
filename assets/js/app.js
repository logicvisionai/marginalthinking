const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function initMobileNav(){
  const btn=$('.menu-toggle'),menu=$('#mobile-menu');if(!btn||!menu)return;
  const close=()=>{btn.setAttribute('aria-expanded','false');menu.classList.remove('open');document.body.classList.remove('menu-open');};
  btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')!=='true';btn.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);});
  $$('a',menu).forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  addEventListener('resize',()=>{if(innerWidth>860)close();},{passive:true});
}
function initArchive(){
  const list=$('#archive-list'),search=$('#search-input'),year=$('#year-select'),kind=$('#kind-select'),pager=$('#pager'),count=$('#results-count');if(!list||!search||!year||!kind)return;
  const items=$$('.archive-item',list),perPage=12;let page=1;
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function render(){
    const q=normalize(search.value.trim()),y=year.value,k=kind.value;
    const visible=items.filter(el=>(!y||el.dataset.year===y)&&(!k||el.dataset.kind===k)&&(!q||normalize(el.dataset.search).includes(q)));
    const pages=Math.max(1,Math.ceil(visible.length/perPage));page=Math.min(page,pages);
    items.forEach(el=>{el.hidden=true;});visible.slice((page-1)*perPage,page*perPage).forEach(el=>{el.hidden=false;});
    if(count){const noun=visible.length===1?count.dataset.one:count.dataset.many;count.textContent=`${visible.length} ${noun||''}`;}
    if(pager){pager.innerHTML='';if(pages>1)for(let i=1;i<=pages;i++){const b=document.createElement('button');b.type='button';b.className='page-btn'+(i===page?' active':'');b.textContent=String(i);b.setAttribute('aria-label',`Page ${i}`);b.addEventListener('click',()=>{page=i;render();list.scrollIntoView({behavior:'smooth',block:'start'});});pager.appendChild(b);}}
  }
  for(const el of [search,year,kind])el.addEventListener(el===search?'input':'change',()=>{page=1;render();});render();
}
function initToc(){
  const links=$$('.report-toc a');if(!links.length||!('IntersectionObserver'in window))return;
  const map=new Map(links.map(a=>[decodeURIComponent(a.hash.slice(1)),a]));
  const obs=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(a=>a.classList.remove('active'));map.get(e.target.id)?.classList.add('active');}},{rootMargin:'-20% 0px -68% 0px',threshold:0});
  for(const id of map.keys()){const el=document.getElementById(id);if(el)obs.observe(el);}
}
function initCopyCitation(){
  for(const btn of $$('.copy-citation'))btn.addEventListener('click',async()=>{const target=$(btn.dataset.copyTarget||'');if(!target)return;const original=btn.dataset.label||btn.textContent;try{await navigator.clipboard.writeText(target.textContent.trim());btn.textContent=btn.dataset.copied||'Copied';setTimeout(()=>btn.textContent=original,1600);}catch{btn.textContent=original;}});
}
initMobileNav();initArchive();initToc();initCopyCitation();
