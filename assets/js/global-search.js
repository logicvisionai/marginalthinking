(()=>{
  const input=document.querySelector('#global-search-input');
  if(!input)return;
  const form=document.querySelector('#global-search-form'),results=document.querySelector('#global-search-results'),status=document.querySelector('#global-search-status');
  const locale=input.dataset.locale||'en',pt=locale.toLowerCase().startsWith('pt');
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={report:pt?'Pesquisa':'Research',program:pt?'Programa':'Program',region:pt?'Região':'Region',country:pt?'País':'Country',topic:pt?'Tópico':'Topic',series:pt?'Série':'Series','series-domain':pt?'Domínio':'Domain',page:pt?'Página':'Page'};
  let index=[];

  const typeLabel=t=>labels[t]||t;
  const score=(item,q,tokens)=>{
    const title=normalize(item.title),description=normalize(item.description),meta=normalize(item.meta),search=normalize(item.search),whole=normalize(q);
    let n=0;
    if(title===whole)n+=500;
    if(title.startsWith(whole))n+=220;
    if(title.includes(whole))n+=140;
    if(description.includes(whole))n+=70;
    if(meta.includes(whole))n+=55;
    if(search.includes(whole))n+=35;
    for(const token of tokens){
      if(title===token)n+=90;
      else if(title.includes(token))n+=45;
      if(description.includes(token))n+=18;
      if(meta.includes(token))n+=16;
      if(search.includes(token))n+=7;
    }
    if(item.type==='report')n+=5;
    return n;
  };
  const render=(query,{push=false}={})=>{
    const q=String(query||'').trim();
    if(push){const u=new URL(location.href);q?u.searchParams.set('q',q):u.searchParams.delete('q');history.replaceState(null,'',u);}
    if(!q){status.textContent='';results.innerHTML=`<p class="small">${pt?'Digite um termo para pesquisar todo o acervo.':'Enter a term to search the entire corpus.'}</p>`;return;}
    const tokens=normalize(q).split(' ').filter(Boolean);
    const ranked=index.map(item=>({item,n:score(item,q,tokens)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n||String(b.item.date||'').localeCompare(String(a.item.date||''))).slice(0,60);
    status.textContent=pt?`${ranked.length} resultado${ranked.length===1?'':'s'}`:`${ranked.length} result${ranked.length===1?'':'s'}`;
    results.innerHTML=ranked.length?ranked.map(({item})=>`<article class="global-result"><div class="global-result-meta"><span>${esc(typeLabel(item.type))}</span>${item.date?`<time datetime="${esc(item.date)}">${esc(item.date)}</time>`:''}</div><h3><a href="${esc(item.url)}">${esc(item.title)}</a></h3>${item.description?`<p>${esc(item.description)}</p>`:''}${item.meta?`<div class="global-result-taxonomy">${esc(item.meta)}</div>`:''}</article>`).join(''):`<div class="panel"><p>${pt?'Nenhum resultado encontrado. Tente um país, tema, instituição, mercado ou tecnologia.':'No results found. Try a country, topic, institution, market or technology.'}</p></div>`;
  };
  let timer=null;
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(input.value,{push:true}),90);});
  form?.addEventListener('submit',e=>{e.preventDefault();render(input.value,{push:true});});
  fetch(input.dataset.index||'/data/search-index.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json();}).then(data=>{
    index=Array.isArray(data?.locales?.[locale])?data.locales[locale]:[];
    const initial=new URLSearchParams(location.search).get('q')||'';input.value=initial;render(initial);if(initial)input.focus({preventScroll:true});
  }).catch(err=>{console.error('global search',err);status.textContent='';results.innerHTML=`<div class="panel"><p>${pt?'A busca global não pôde ser carregada.':'Global search could not be loaded.'}</p></div>`;});
})();
