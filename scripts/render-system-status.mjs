import fs from 'node:fs';
import path from 'node:path';
import {makeLayout} from './lib/layout.mjs';
import {esc} from './lib/markdown.mjs';
import {collectReports} from './lib/reports.mjs';
import {computeSystemFreshness} from './lib/system-freshness.mjs';

const root=process.cwd(),out=path.join(root,'dist'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cfg=JSON.parse(read('site.config.json')),i18n=JSON.parse(read('data/i18n.json')),registry=JSON.parse(read('data/system-registry.json')),ledger=JSON.parse(read('data/reconciliation-ledger.json')),reports=collectReports(root);
const site=cfg.site_url.replace(/\/$/,''),locales=Object.keys(cfg.locales),author=cfg.default_author;
const pagePath=(l,p)=>`${cfg.locales[l]?.path?'/'+cfg.locales[l].path:''}${p}`.replace(/\/+/g,'/');
const layout=l=>makeLayout({cfg,i18n,site,author,social:site+cfg.social_image,locale:l,reportPath:()=>'',pagePath});
const write=(p,s)=>{const f=path.join(out,p.replace(/^\//,''));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
const latestRun=(ledger.runs||[]).slice().sort((a,b)=>String(b.reconciled_at||'').localeCompare(String(a.reconciled_at||'')))[0]||{};
const now=new Date(),assets=computeSystemFreshness({root,registry,ledger,reports,now});
const payload={schema_version:1,generated_at:now.toISOString(),latest_reconciliation:latestRun.reconciled_at||null,asset_count:assets.length,assets};
fs.mkdirSync(path.join(out,'data'),{recursive:true});fs.writeFileSync(path.join(out,'data/research-system-status.json'),JSON.stringify(payload,null,2)+'\n');

for(const locale of locales){
 const L=layout(locale),pt=locale==='pt-BR',canonical=pagePath(locale,'/system-status/'),alts=Object.fromEntries(locales.map(x=>[x,pagePath(x,'/system-status/')]));
 const title=pt?'Registro & atualização do sistema':'System registry & freshness';
 const desc=pt?'Inventário permanente das linhas editoriais, ferramentas e camadas de acesso, com estado de atualização e reconciliação.':'Permanent inventory of editorial lines, tools and access layers with freshness and reconciliation state.';
 const label=s=>s==='current'?(pt?'ATUAL':'CURRENT'):s==='review_due'?(pt?'REVISÃO DEVIDA':'REVIEW DUE'):s==='missing_activity'?(pt?'SEM ATIVIDADE':'NO ACTIVITY'):(pt?'SEM SLA':'NO SLA');
 const rows=assets.map(a=>`<tr><td><strong>${esc(a.id)}</strong><br><small>${esc(a.type)}</small></td><td>${esc(a.update_mode)}</td><td>${esc(a.last_activity||'—')}</td><td>${esc(a.last_modified||'—')}</td><td><span class="badge">${esc(label(a.state))}</span>${a.freshness_sla_hours!=null?`<br><small>SLA ${a.freshness_sla_hours}h</small>`:''}</td><td>${a.public_route?`<a href="${pagePath(locale,a.public_route)}">${pt?'Abrir':'Open'} →</a>`:'—'}</td></tr>`).join('');
 const body=`<!doctype html><html lang="${L.loc.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/css/styles.css">${L.baseHead(title+' — '+cfg.site_name,desc,canonical,'CollectionPage',alts)}<title>${esc(title)} — ${esc(cfg.site_name)}</title></head><body>${L.nav('research',alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${pt?'GOVERNANÇA DO PRODUTO':'PRODUCT GOVERNANCE'}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p><div class="chips"><span>${assets.length} ${pt?'ativos registrados':'registered assets'}</span><span>${assets.filter(a=>a.freshness_sla_hours!=null).length} ${pt?'com SLA':'with SLA'}</span><span>${pt?'última reconciliação':'last reconciliation'}: ${esc(String(latestRun.reconciled_at||'—').slice(0,16).replace('T',' '))}</span></div></div></section><section class="section"><div class="container"><div class="md-table-wrap"><table><thead><tr><th>${pt?'Ativo':'Asset'}</th><th>${pt?'Atualização':'Update mode'}</th><th>${pt?'Última atividade':'Last activity'}</th><th>${pt?'Conteúdo alterado':'Content modified'}</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div><p class="small">${pt?'Atividade editorial vem da última publicação da linha/programa/série. Ferramentas cumulativas usam a última reconciliação explícita. O conteúdo só é marcado como alterado quando o dataset canônico muda.':'Editorial activity comes from the latest publication in the line/program/series. Cumulative tools use the latest explicit reconciliation. Content modification changes only when the canonical dataset changes.'}</p></div></section></main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
 write(canonical+'index.html',body);
}
console.log('System status rendered:',assets.length,'assets.');
