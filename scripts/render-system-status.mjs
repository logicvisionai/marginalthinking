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
const latestRun=(ledger.runs||[]).reduce((best,run)=>!best||String(run.reconciled_at||'')>=String(best.reconciled_at||'')?run:best,null)||{};
const now=new Date(),assets=computeSystemFreshness({root,registry,ledger,reports,now});
const jsonFiles=dir=>fs.existsSync(path.join(root,dir))?fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.json')):[];
const publicSlugs=new Set(reports.filter(r=>r._bundle).map(r=>r.slug||String(r.url||'').split('/').pop()?.replace(/\.html$/,'')));
const legacyIndex=JSON.parse(read('data/reports.json'));
const pending=jsonFiles('data/pending').map(x=>x.replace(/\.json$/,'')),approved=jsonFiles('data/approved').map(x=>x.replace(/\.json$/,'')),rejected=jsonFiles('data/rejected').map(x=>x.replace(/\.json$/,''));
const pipeline={
  public_bundles:publicSlugs.size,
  backward_index_entries:legacyIndex.length,
  pending_records:pending.length,
  approved_records:approved.length,
  rejected_records:rejected.length,
  pending_unpublished:pending.filter(x=>!publicSlugs.has(x)),
  approved_unpublished:approved.filter(x=>!publicSlugs.has(x))
};
const queue=pipeline.pending_unpublished.map(slug=>({
  slug,
  state:pipeline.approved_unpublished.includes(slug)?'approved':rejected.includes(slug)?'needs-revision':'awaiting-qa'
}));
const reviewDue=assets.filter(a=>a.state==='review_due').map(a=>({
  id:a.id,type:a.type,update_mode:a.update_mode,age_hours:a.age_hours,freshness_sla_hours:a.freshness_sla_hours,
  latest_report_id:a.latest_report_id||null,latest_report_date:a.latest_report_date||null,public_route:a.public_route||null
}));
const stateCounts=Object.fromEntries(['current','review_due','missing_activity','no_sla'].map(s=>[s,assets.filter(a=>a.state===s).length]));
const payload={schema_version:1,generated_at:now.toISOString(),registry_updated_at:registry.updated_at||null,latest_reconciliation:latestRun.reconciled_at||null,asset_count:assets.length,state_counts:stateCounts,review_due:reviewDue,publication_queue:queue,pipeline,assets};
fs.mkdirSync(path.join(out,'data'),{recursive:true});fs.writeFileSync(path.join(out,'data/research-system-status.json'),JSON.stringify(payload,null,2)+'\n');

const groups=[
 ['editorial-line','Editorial lines','Linhas editoriais'],
 ['cumulative-tool','Cumulative tools','Ferramentas cumulativas'],
 ['research-program','Research programs','Programas de pesquisa'],
 ['editorial-series','Controlled series','Séries controladas'],
 ['discovery-tool','Discovery surfaces','Superfícies de descoberta'],
 ['reader-tool','Reader tools','Ferramentas de leitura'],
 ['access-layer','Access layers','Camadas de acesso']
];

for(const locale of locales){
 const L=layout(locale),pt=locale==='pt-BR',canonical=pagePath(locale,'/system-status/'),alts=Object.fromEntries(locales.map(x=>[x,pagePath(x,'/system-status/')]));
 const title=pt?'Registro, cadência & estado do sistema':'System registry, cadence & status';
 const desc=pt?'Inventário operacional das linhas editoriais, ferramentas, cobertura do pipeline e camadas de acesso, separando revisão recente de alteração factual dos datasets.':'Operational inventory of editorial lines, tools, pipeline coverage and access layers, separating recent review from factual dataset modification.';
 const label=s=>s==='current'?(pt?'ATUAL':'CURRENT'):s==='review_due'?(pt?'REVISÃO DEVIDA':'REVIEW DUE'):s==='missing_activity'?(pt?'SEM ATIVIDADE':'NO ACTIVITY'):(pt?'POR EVENTO':'EVENT-DRIVEN');
 const row=a=>`<tr><td><strong>${esc(a.id)}</strong><br><small>${esc(a.type)}</small></td><td>${esc(a.update_mode)}</td><td>${esc(a.latest_report_id||a.last_activity||'—')}${a.latest_report_date?`<br><small>${esc(a.latest_report_date)}</small>`:''}</td><td>${esc(a.last_reconciled||'—')}${a.decision?`<br><small>${esc(a.decision)}</small>`:''}</td><td>${esc(a.last_modified||'—')}</td><td><span class="badge">${esc(label(a.state))}</span>${a.freshness_sla_hours!=null?`<br><small>SLA ${a.freshness_sla_hours}h · ${a.age_hours??'—'}h</small>`:''}${a.decision_note?`<br><small>${esc(a.decision_note)}</small>`:''}</td><td>${a.public_route?`<a href="${pagePath(locale,a.public_route)}">${pt?'Abrir':'Open'} →</a>`:'—'}</td></tr>`;
 const tables=groups.map(([type,en,br])=>{const xs=assets.filter(a=>a.type===type);if(!xs.length)return'';return `<section class="section"><div class="container"><div class="section-head"><h2>${esc(pt?br:en)}</h2><span>${xs.length}</span></div><div class="md-table-wrap"><table><thead><tr><th>${pt?'Ativo':'Asset'}</th><th>${pt?'Cadência':'Cadence'}</th><th>${pt?'Última publicação/atividade':'Latest publication/activity'}</th><th>${pt?'Última reconciliação':'Last reconciliation'}</th><th>${pt?'Dataset alterado':'Dataset modified'}</th><th>Status</th><th></th></tr></thead><tbody>${xs.map(row).join('')}</tbody></table></div></div></section>`;}).join('');
 const summary=`<div class="research-programs"><article class="research-program"><span>${assets.length}</span><h3>${pt?'Ativos registrados':'Registered assets'}</h3><p>${pt?'Programas, linhas, séries, ferramentas e camadas de acesso.':'Programs, lines, series, tools and access layers.'}</p></article><article class="research-program"><span>${stateCounts.review_due}</span><h3>${pt?'Revisões vencidas':'Reviews due'}</h3><p>${pt?'Ativos com SLA cuja última atividade excedeu a janela definida.':'SLA-bound assets whose latest activity exceeds the defined window.'}</p></article><article class="research-program"><span>${pipeline.public_bundles}</span><h3>${pt?'Pesquisas públicas':'Public research bundles'}</h3><p>${pt?`Índice retrocompatível: ${pipeline.backward_index_entries} registros.`:`Backward-compatible index: ${pipeline.backward_index_entries} entries.`}</p></article><article class="research-program"><span>${pipeline.approved_unpublished.length}</span><h3>${pt?'Aprovadas não publicadas':'Approved, unpublished'}</h3><p>${esc(pipeline.approved_unpublished.join(', ')|| (pt?'Nenhuma.':'None.'))}</p></article></div>`;
 const queueRows=queue.map(q=>`<tr><td><code>${esc(q.slug)}</code></td><td><span class="badge">${esc(q.state==='approved'?(pt?'APROVADA':'APPROVED'):q.state==='needs-revision'?(pt?'PRECISA REVISÃO':'NEEDS REVISION'):(pt?'AGUARDA QA':'AWAITING QA'))}</span></td></tr>`).join('');
 const dueRows=reviewDue.map(a=>`<tr><td><strong>${esc(a.id)}</strong></td><td>${esc(a.update_mode)}</td><td>${esc(a.latest_report_id||'—')}${a.latest_report_date?`<br><small>${esc(a.latest_report_date)}</small>`:''}</td><td>${a.age_hours??'—'}h / ${a.freshness_sla_hours??'—'}h</td><td>${a.public_route?`<a href="${pagePath(locale,a.public_route)}">${pt?'Abrir':'Open'} →</a>`:'—'}</td></tr>`).join('');
 const priorities=`<section class="section"><div class="container"><div class="section-head"><h2>${pt?'Prioridades operacionais':'Operational priorities'}</h2><span>${reviewDue.length+queue.length}</span></div>${reviewDue.length?`<h3>${pt?'Linhas com revisão vencida':'Editorial lines due for review'}</h3><div class="md-table-wrap"><table><thead><tr><th>${pt?'Linha':'Line'}</th><th>${pt?'Cadência':'Cadence'}</th><th>${pt?'Última publicação':'Latest publication'}</th><th>${pt?'Idade / SLA':'Age / SLA'}</th><th></th></tr></thead><tbody>${dueRows}</tbody></table></div>`:''}${queue.length?`<h3>${pt?'Fila não publicada':'Unpublished queue'}</h3><div class="md-table-wrap"><table><thead><tr><th>ID</th><th>Status</th></tr></thead><tbody>${queueRows}</tbody></table></div>`:''}${!reviewDue.length&&!queue.length?`<p>${pt?'Nenhuma prioridade operacional aberta.':'No open operational priorities.'}</p>`:''}</div></section>`;
 const pipe=`<section class="section"><div class="container"><div class="section-head"><h2>${pt?'Pipeline editorial':'Editorial pipeline'}</h2><span>${pt?'estado derivado do Git':'Git-derived state'}</span></div><div class="chips"><span>${pipeline.pending_records} pending</span><span>${pipeline.approved_records} approved</span><span>${pipeline.rejected_records} rejected</span><span>${pipeline.pending_unpublished.length} ${pt?'pendentes não públicas':'unpublished pending'}</span></div><p class="small">${pt?'“Reconciliado” significa que a publicação mais recente foi comparada com as ferramentas cumulativas; “dataset alterado” muda apenas quando uma relação, registro ou estado canônico realmente muda. Linhas sem SLA são acompanhadas por evento e não devem aparecer como atrasadas apenas pela passagem do tempo.':'“Reconciled” means the latest publication was checked against cumulative tools; “dataset modified” changes only when a canonical relationship, record or state actually changes. Lines without an SLA are event-driven and are not considered overdue merely because time passed.'}</p></div></section>`;
 const body=`<!doctype html><html lang="${L.loc.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/assets/css/styles.css">${L.baseHead(title+' — '+cfg.site_name,desc,canonical,'CollectionPage',alts)}<title>${esc(title)} — ${esc(cfg.site_name)}</title></head><body>${L.nav('research',alts)}<main><section class="page-hero"><div class="container"><div class="eyebrow dark">${pt?'GOVERNANÇA DO PRODUTO':'PRODUCT GOVERNANCE'}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p><div class="chips"><span>${pt?'registry':'registry'}: ${esc(registry.updated_at||'—')}</span><span>${pt?'última reconciliação':'last reconciliation'}: ${esc(String(latestRun.reconciled_at||'—').slice(0,16).replace('T',' '))}</span></div></div></section><section class="section"><div class="container">${summary}</div></section>${pipe}${priorities}${tables}</main>${L.footer()}<script src="/assets/js/app.js"></script></body></html>`;
 write(canonical+'index.html',body);
}
console.log('System status rendered:',assets.length,'assets; pipeline',JSON.stringify(pipeline));
