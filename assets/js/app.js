const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

function initTheme(){
  const root=document.documentElement;
  const storageKey='marginal-thinking-theme';
  const systemDark=window.matchMedia?.('(prefers-color-scheme: dark)');
  const isPt=root.lang.toLowerCase().startsWith('pt');

  let saved=null;
  try{saved=localStorage.getItem(storageKey);}catch{}
  if(saved!=='light'&&saved!=='dark')saved=null;

  const preferred=()=>saved||(systemDark?.matches?'dark':'light');
  const themeLink=document.createElement('link');
  themeLink.rel='stylesheet';
  themeLink.href='/assets/css/theme.css';
  themeLink.dataset.themeStyles='true';
  document.head.appendChild(themeLink);

  const updateMetaColor=theme=>{
    let meta=$('meta[name="theme-color"]');
    if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta);}
    meta.content=theme==='dark'?'#0a1015':'#f5f7f8';
  };

  const syncButton=(btn,theme)=>{
    if(!btn)return;
    const next=theme==='dark'?'light':'dark';
    const label=isPt
      ?(next==='dark'?'Ativar modo escuro':'Ativar modo claro')
      :(next==='dark'?'Switch to dark mode':'Switch to light mode');
    btn.setAttribute('aria-label',label);
    btn.setAttribute('title',label);
    btn.setAttribute('aria-pressed',String(theme==='dark'));
  };

  let button=null;
  const apply=(theme,{persist=false}={})=>{
    root.dataset.theme=theme;
    root.style.colorScheme=theme;
    root.style.backgroundColor=theme==='dark'?'#0a1015':'#f5f7f8';
    updateMetaColor(theme);
    syncButton(button,theme);
    if(persist){
      saved=theme;
      try{localStorage.setItem(storageKey,theme);}catch{}
    }
  };

  apply(preferred());

  const row=$('.header-row');
  const menu=$('.menu-toggle');
  if(row){
    let actions=$('.header-actions',row);
    if(!actions){
      actions=document.createElement('div');
      actions.className='header-actions';
      if(menu){row.insertBefore(actions,menu);actions.appendChild(menu);}else row.appendChild(actions);
    }
    button=document.createElement('button');
    button.type='button';
    button.className='theme-toggle';
    button.innerHTML='<span class="theme-icon theme-icon-moon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 14.1A8.7 8.7 0 0 1 9.9 3.5 8.7 8.7 0 1 0 20.5 14.1Z"/></svg></span><span class="theme-icon theme-icon-sun" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.6"/><path d="M12 2.5v2M12 19.5v2M4.1 4.1l1.4 1.4M18.5 18.5l1.4 1.4M2.5 12h2M19.5 12h2M4.1 19.9l1.4-1.4M18.5 5.5l1.4-1.4"/></svg></span>';
    actions.insertBefore(button,actions.firstChild);
    syncButton(button,root.dataset.theme);
    button.addEventListener('click',()=>apply(root.dataset.theme==='dark'?'light':'dark',{persist:true}));
  }

  systemDark?.addEventListener?.('change',()=>{if(!saved)apply(preferred());});
}

function initMobileNav(){
  const btn=$('.menu-toggle'),menu=$('#mobile-menu');if(!btn||!menu)return;
  const header=btn.closest('.site-header');
  const isOpen=()=>btn.getAttribute('aria-expanded')==='true';
  const syncMenuTop=()=>{
    if(!header)return;
    const rect=header.getBoundingClientRect();
    const top=Math.max(0,Math.min(window.innerHeight,rect.bottom));
    menu.style.setProperty('--mobile-menu-top',`${Math.round(top)}px`);
  };
  const close=(restoreFocus=false)=>{
    if(!isOpen()&&!menu.classList.contains('open'))return;
    btn.setAttribute('aria-expanded','false');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    if(restoreFocus)btn.focus({preventScroll:true});
  };
  const open=()=>{
    syncMenuTop();
    btn.setAttribute('aria-expanded','true');
    menu.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>$('.mobile-menu-inner a',menu)?.focus({preventScroll:true}));
  };
  document.body.appendChild(menu);
  menu.setAttribute('aria-hidden','true');
  btn.addEventListener('click',e=>{e.stopPropagation();isOpen()?close():open();});
  $$('a',menu).forEach(a=>a.addEventListener('click',()=>close()));
  document.addEventListener('click',e=>{if(isOpen()&&!menu.contains(e.target)&&!btn.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())close(true);});
  addEventListener('resize',()=>{if(innerWidth>860)close();else if(isOpen())syncMenuTop();},{passive:true});
  addEventListener('scroll',()=>{if(isOpen())syncMenuTop();},{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{if(isOpen())syncMenuTop();},{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>{if(isOpen())syncMenuTop();},{passive:true});
}

function initAnchorPositioning(){
  const root=document.documentElement,header=$('.site-header');
  if(!header)return;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const syncOffset=()=>{
    const height=Math.ceil(header.getBoundingClientRect().height);
    if(height>0)root.style.setProperty('--anchor-offset',`${height}px`);
    return height;
  };
  const targetFromHash=()=>{
    if(!location.hash)return null;
    try{return document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return null;}
  };
  const position=(target,behavior='auto')=>{
    if(!target)return;
    const offset=syncOffset();
    const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset);
    window.scrollTo({top,behavior:reduced?'auto':behavior});
  };

  syncOffset();
  if(location.hash){
    requestAnimationFrame(()=>requestAnimationFrame(()=>position(targetFromHash(),'auto')));
    addEventListener('load',()=>position(targetFromHash(),'auto'),{once:true});
  }

  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href*="#"]');if(!a)return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
    let target=null;try{target=document.getElementById(decodeURIComponent(url.hash.slice(1)));}catch{}
    if(!target)return;
    e.preventDefault();
    history.pushState(null,'',url.hash);
    position(target,'smooth');
  });

  addEventListener('hashchange',()=>position(targetFromHash(),'auto'));
  addEventListener('popstate',()=>{if(location.hash)position(targetFromHash(),'auto');});
  addEventListener('resize',()=>syncOffset(),{passive:true});
}

function initArchive(){
  const list=$('#archive-list'),search=$('#search-input'),year=$('#year-select'),kind=$('#kind-select'),pager=$('#pager'),count=$('#results-count');if(!list||!search||!year||!kind)return;
  const items=$$('.archive-item',list),perPage=12;let page=1;
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const pageWord=document.documentElement.lang.toLowerCase().startsWith('pt')?'Página':'Page';
  function render(){
    const q=normalize(search.value.trim()),y=year.value,k=kind.value;
    const visible=items.filter(el=>(!y||el.dataset.year===y)&&(!k||el.dataset.kind===k)&&(!q||normalize(el.dataset.search).includes(q)));
    const pages=Math.max(1,Math.ceil(visible.length/perPage));page=Math.min(page,pages);
    items.forEach(el=>{el.hidden=true;});visible.slice((page-1)*perPage,page*perPage).forEach(el=>{el.hidden=false;});
    if(count){const noun=visible.length===1?count.dataset.one:count.dataset.many;count.textContent=`${visible.length} ${noun||''}`;}
    if(pager){pager.innerHTML='';if(pages>1)for(let i=1;i<=pages;i++){const b=document.createElement('button');b.type='button';b.className='page-btn'+(i===page?' active':'');b.textContent=String(i);b.setAttribute('aria-label',`${pageWord} ${i}`);b.addEventListener('click',()=>{page=i;render();list.scrollIntoView({behavior:'smooth',block:'start'});});pager.appendChild(b);}}
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

function chartNumber(text=''){
  let s=String(text).trim().replace(/\s+/g,'').replace(/[%$€£¥]/g,'');
  if(!s)return null;
  if(/^[-+]?\d{1,3}(?:\.\d{3})*,\d+$/.test(s))s=s.replace(/\./g,'').replace(',','.');
  else if(/^[-+]?\d+,\d+$/.test(s))s=s.replace(',','.');
  else if(/^[-+]?\d{1,3}(?:,\d{3})+\.\d+$/.test(s))s=s.replace(/,/g,'');
  else s=s.replace(/,/g,'');
  s=s.replace(/[^\d+\-.]/g,'');
  const v=Number(s);return Number.isFinite(v)?v:null;
}
function initResearchCharts(){
  for(const fig of $$('.research-chart')){
    fig.classList.add('chart-premium');
    if(fig.classList.contains('line-chart')){
      $$('.chart-dot',fig).forEach(dot=>{dot.setAttribute('tabindex','0');dot.setAttribute('role','img');});
      continue;
    }
    const items=$$('.chart-row',fig).map(row=>({row,value:chartNumber($('.chart-value',row)?.textContent),bar:$('.chart-bar',row),track:$('.chart-track',row)})).filter(x=>x.value!==null&&x.bar&&x.track);
    if(!items.length)continue;
    const hasPositive=items.some(x=>x.value>0),hasNegative=items.some(x=>x.value<0);
    const mode=hasPositive&&hasNegative?'mixed':hasNegative?'negative':'positive';
    fig.classList.add(`scale-${mode}`);
    const maxAbs=Math.max(...items.map(x=>Math.abs(x.value)),1e-9);
    const maxPositive=Math.max(...items.map(x=>x.value>0?x.value:0),1e-9);
    const maxNegative=Math.max(...items.map(x=>x.value<0?Math.abs(x.value):0),1e-9);
    for(const {row,value,bar,track} of items){
      row.classList.remove('is-positive','is-negative','is-zero');
      const state=value>0?'positive':value<0?'negative':'zero';
      row.classList.add(`is-${state}`);
      track.style.setProperty('--chart-zero',mode==='positive'?'0%':mode==='negative'?'100%':'50%');
      bar.classList.toggle('positive',value>=0);bar.classList.toggle('negative',value<0);
      bar.hidden=value===0;
      bar.style.left='auto';bar.style.right='auto';bar.style.width='0';
      if(value===0)continue;
      if(mode==='positive'){
        bar.style.left='0';bar.style.width=`${Math.max(1.25,value/maxPositive*100)}%`;
      }else if(mode==='negative'){
        bar.style.right='0';bar.style.width=`${Math.max(1.25,Math.abs(value)/maxNegative*100)}%`;
      }else if(value>0){
        bar.style.left='50%';bar.style.width=`${Math.max(1.25,Math.abs(value)/maxAbs*50)}%`;
      }else{
        bar.style.right='50%';bar.style.width=`${Math.max(1.25,Math.abs(value)/maxAbs*50)}%`;
      }
      bar.setAttribute('aria-hidden','true');
    }
  }
}

initTheme();initMobileNav();initAnchorPositioning();initArchive();initToc();initCopyCitation();initResearchCharts();