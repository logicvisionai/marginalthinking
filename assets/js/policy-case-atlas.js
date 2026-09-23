(()=>{
  const search=document.getElementById('policy-search');
  const domain=document.getElementById('policy-domain');
  const cards=[...document.querySelectorAll('[data-policy-card]')];
  const rows=[...document.querySelectorAll('[data-policy-row]')];
  if(!cards.length)return;
  const output=document.getElementById('policy-results-count');
  const empty=document.getElementById('policy-empty');
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const matches=(el,q,d)=>{
    const text=normalize(el.dataset.policySearch);
    return (!q||text.includes(q))&&(!d||el.dataset.domain===d);
  };
  const apply=()=>{
    const q=normalize(search?.value);
    const d=domain?.value||'';
    let visible=0;
    for(const card of cards){
      const show=matches(card,q,d);
      card.hidden=!show;
      if(show)visible++;
    }
    for(const row of rows)row.hidden=!matches(row,q,d);
    if(output)output.value=String(visible);
    if(empty)empty.hidden=visible!==0;
  };
  search?.addEventListener('input',apply);
  domain?.addEventListener('change',apply);
  apply();
})();