import {researchItem,updateResearch,storageAvailable} from './research-store.js';
const pt=document.documentElement.lang.toLowerCase().startsWith('pt');
let timer;
export function announce(message){const status=document.getElementById('product-notice');if(!status)return;clearTimeout(timer);status.textContent=message;timer=setTimeout(()=>{status.textContent='';},4500);}
function syncButtons(){
  for(const button of document.querySelectorAll('[data-save-research]')){
    const saved=researchItem(button.dataset.saveResearch).saved;
    button.hidden=false;button.setAttribute('aria-pressed',String(saved));
    const text=saved?(pt?'Salvo':'Saved'):(pt?'Salvar':'Save');
    (button.querySelector('span')||button).textContent=text;
    button.setAttribute('aria-label',`${saved?(pt?'Remover dos salvos':'Remove from saved'):(pt?'Salvar pesquisa':'Save research')}: ${button.dataset.researchTitle||button.dataset.saveResearch}`);
  }
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-save-research]');if(!button)return;
  const id=button.dataset.saveResearch,saved=!researchItem(id).saved;
  if(!updateResearch(id,{saved}))return;
  announce(!storageAvailable()?(pt?'Armazenamento indisponível. As alterações duram apenas nesta página; exporte suas notas no caderno.':'Storage unavailable. Changes last only on this page; export your notes in the workspace.'):(saved?(pt?'Pesquisa salva no seu caderno, neste navegador.':'Research saved to your workspace in this browser.'):(pt?'Pesquisa removida dos salvos. As notas foram preservadas.':'Research removed from saved. Notes were preserved.')));
});
addEventListener('research:changed',syncButtons);
document.addEventListener('research:rendered',syncButtons);
syncButtons();
