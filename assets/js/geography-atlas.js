
(()=>{
  const search=document.getElementById('atlas-country-search');
  const region=document.getElementById('atlas-region-filter');
  const cards=[...document.querySelectorAll('[data-atlas-card]')];
  if(!cards.length)return;
  const count=document.getElementById('atlas-results-count');
  const empty=document.getElementById('atlas-empty');
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const apply=()=>{
    const q=normalize(search?.value);
    const r=region?.value||'';
    let visible=0;
    for(const card of cards){
      const text=normalize(card.dataset.countrySearch);
      const regions=String(card.dataset.countryRegions||'').split(/\s+/);
      const show=(!q||text.includes(q))&&(!r||regions.includes(r));
      card.hidden=!show;
      if(show)visible++;
    }
    if(count)count.value=String(visible);
    if(empty)empty.hidden=visible!==0;
  };
  search?.addEventListener('input',apply);
  region?.addEventListener('change',apply);
  apply();
})();
