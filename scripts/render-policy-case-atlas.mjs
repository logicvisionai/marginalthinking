import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';
import {collectReports,reportView} from './lib/reports.mjs';

const root=process.cwd();
const out=path.join(root,'dist');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('data/policy-cases.json'));
const taxonomy=JSON.parse(read('data/taxonomy.json'));
const cfg=JSON.parse(read('site.config.json'));
const i18n=JSON.parse(read('data/i18n.json'));
const reports=collectReports(root);
const byId=new Map(reports.map(r=>[r.id,r]));
const site=cfg.site_url.replace(/\/$/,'');
const locales=Object.keys(cfg.locales);
const pagePath=(locale,p)=>`${cfg.locales[locale]?.path?'/'+cfg.locales[locale].path:''}${p}`.replace(/\/+/g,'/');
const layout=locale=>makeLayout({cfg,i18n,site,author:cfg.default_author,social:site+cfg.social_image,locale,reportPath:()=>'',pagePath});
const pick=(value,locale)=>value?.[locale]||value?.en||'';
const write=(p,content)=>{const file=path.join(out,p.replace(/^\//,''));fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content);};
const series=taxonomy.series['policy-experiments-institutional-transitions'];

function dateLabel(value,locale){
  if(!value)return'—';
  if(/^\d{4}$/.test(value))return value;
  const normalized=/^\d{4}-\d{2}$/.test(value)?value+'-01':value;
  const d=new Date(normalized+'T12:00:00Z');
  if(Number.isNaN(d.getTime()))return value;
  return new Intl.DateTimeFormat(locale==='pt-BR'?'pt-BR':'en-US',{year:'numeric',month:'short',day:/^\d{4}-\d{2}-\d{2}$/.test(value)?'2-digit':undefined,timeZone:'UTC'}).format(d);
}
function periodLabel(item,locale){
  const start=dateLabel(item.period?.start,locale);
  const end=item.period?.end?dateLabel(item.period.end,locale):(locale==='pt-BR'?'continuidade institucional':'institutional aftermath');
  return `${start} – ${end}`;
}
function relatedLinks(item,locale){
  return (item.related_research_ids||[]).map(id=>{
    const report=byId.get(id);
    if(!report)return'';
    const view=reportView(report,locale)||reportView(report,report.source_locale)||report;
    return `<a class="policy-research-link" href="${pagePath(locale,report.url)}"><span>${esc(view.title||id)}</span><b aria-hidden="true">→</b></a>`;
  }).filter(Boolean).join('');
}
function searchText(item,locale){
  return [
    pick(item.country?.name,locale),item.country?.code,pick(item.intervention,locale),
    pick(item.problem,locale),pick(item.mechanism,locale),pick(series.domains[item.domain],locale)
  ].filter(Boolean).join(' ').toLowerCase();
}
function matrixRow(item,locale){
  const pt=locale==='pt-BR';
  const country=pick(item.country.name,locale);
  const research=(item.related_research_ids||[]).some(id=>byId.has(id));
  return `<tr data-policy-row data-domain="${esc(item.domain)}" data-policy-search="${esc(searchText(item,locale))}">
    <td data-label="${pt?'País':'Country'}"><a href="${pagePath(locale,'/countries/'+item.country.slug+'/')}"><strong>${esc(country)}</strong></a><small>${esc(item.country.code)}</small></td>
    <td data-label="${pt?'Intervenção':'Intervention'}">${esc(pick(item.intervention,locale))}</td>
    <td data-label="${pt?'Lançamento':'Launch'}">${esc(dateLabel(item.period?.launch||item.period?.start,locale))}</td>
    <td data-label="${pt?'Domínio':'Domain'}">${esc(pick(series.domains[item.domain],locale))}</td>
    <td data-label="${pt?'Evidência':'Evidence'}"><span class="policy-evidence verified">${pt?'Verificado':'Verified'}</span></td>
    <td data-label="${pt?'Estudo profundo':'Deep study'}">${research?'<span class="policy-matrix-yes">'+(pt?'Disponível':'Available')+'</span>':'—'}</td>
  </tr>`;
}
function caseCard(item,locale,index){
  const pt=locale==='pt-BR';
  const country=pick(item.country.name,locale);
  const domain=pick(series.domains[item.domain],locale);
  const research=relatedLinks(item,locale);
  const sources=(item.sources||[]).map(s=>`<li><a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.name)}</a><span>${esc(String(s.type||'source').replace(/-/g,' '))}</span></li>`).join('');
  return `<article class="policy-case-card" id="${esc(item.id)}" data-policy-card data-domain="${esc(item.domain)}" data-policy-search="${esc(searchText(item,locale))}">
    <header class="policy-case-header">
      <div class="policy-case-index">${String(index+1).padStart(2,'0')}</div>
      <div class="policy-case-heading">
        <div class="policy-case-meta"><span>${esc(domain)}</span><span>${esc(periodLabel(item,locale))}</span><span>${esc(item.last_verified)}</span></div>
        <h2>${esc(pick(item.intervention,locale))}</h2>
        <p><a href="${pagePath(locale,'/countries/'+item.country.slug+'/')}">${esc(country)}</a></p>
      </div>
    </header>
    <div class="policy-case-analysis">
      <section><h3>${pt?'Problema inicial':'Initial problem'}</h3><p>${esc(pick(item.problem,locale))}</p></section>
      <section><h3>${pt?'Mecanismo':'Mechanism'}</h3><p>${esc(pick(item.mechanism,locale))}</p></section>
      <section><h3>${pt?'Resultado observado':'Observed outcome'}</h3><p>${esc(pick(item.outcome_summary,locale))}</p></section>
      <section><h3>${pt?'Limites de transferência':'Transfer limits'}</h3><p>${esc(pick(item.transfer_limits,locale))}</p></section>
    </div>
    <footer class="policy-case-footer">
      <div class="policy-case-links">${research||`<span class="policy-no-study">${pt?'Estudo aprofundado ainda não publicado':'Deep study not yet published'}</span>`}</div>
      <details class="policy-sources"><summary>${pt?'Fontes verificadas':'Verified sources'} <span>${(item.sources||[]).length}</span></summary><ul>${sources}</ul></details>
    </footer>
  </article>`;
}

fs.mkdirSync(path.join(out,'data'),{recursive:true});
fs.copyFileSync(path.join(root,'data/policy-cases.json'),path.join(out,'data/policy-cases.json'));

for(const locale of locales){
  const L=layout(locale),pt=locale==='pt-BR';
  const canonical=pagePath(locale,'/policy-cases/');
  const alternates=Object.fromEntries(locales.map(l=>[l,pagePath(l,'/policy-cases/')]));
  const title=pt?'Atlas de Casos de Política':'Policy Case Atlas';
  const description=pick(data.disclaimer,locale);
  const domains=[...new Set(data.cases.map(x=>x.domain))];
  const countries=new Set(data.cases.map(x=>x.country.code)).size;
  const deepStudies=data.cases.filter(x=>(x.related_research_ids||[]).some(id=>byId.has(id))).length;
  const domainOptions=domains.map(id=>`<option value="${esc(id)}">${esc(pick(series.domains[id],locale))}</option>`).join('');
  const matrixRows=data.cases.map(x=>matrixRow(x,locale)).join('');
  const cards=data.cases.map((x,i)=>caseCard(x,locale,i)).join('');
  const chain=pick(series.analytical_chain,locale).split('→').map(x=>x.trim()).filter(Boolean).map((x,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x)}</b></li>`).join('');
  const matrixNote=pt?'Em telas pequenas, cada linha da matriz se reorganiza verticalmente.':'On small screens, each matrix row reorganizes vertically.';

  const html=`<!doctype html><html lang="${esc(L.loc.lang)}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#09131a">
    <meta name="description" content="${esc(description)}"><link rel="icon" href="/assets/brand/favicon.svg">
    <link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/research-static.css"><link rel="stylesheet" href="/assets/css/layout-guardrails.css"><link rel="stylesheet" href="/assets/css/policy-case-atlas.css">
    ${L.baseHead(title+' — '+cfg.site_name,description,canonical,'CollectionPage',alternates)}
    <title>${esc(title)} — ${esc(cfg.site_name)}</title>
  </head><body>${L.nav('policy-cases',alternates)}<main>
    <section class="page-hero policy-atlas-hero"><div class="container">
      <div class="eyebrow dark">${pt?'POLÍTICA PÚBLICA · EVIDÊNCIA COMPARATIVA':'PUBLIC POLICY · COMPARATIVE EVIDENCE'}</div>
      <h1>${esc(title)}</h1><p>${esc(description)}</p>
      <div class="policy-atlas-stats">
        <div><strong>${data.cases.length}</strong><span>${pt?'casos verificados':'verified cases'}</span></div>
        <div><strong>${countries}</strong><span>${pt?'países':'countries'}</span></div>
        <div><strong>${domains.length}</strong><span>${pt?'domínios ativos':'active domains'}</span></div>
        <div><strong>${deepStudies}</strong><span>${pt?'estudos profundos':'deep studies'}</span></div>
      </div>
    </div></section>

    <section class="policy-method"><div class="container">
      <div class="policy-section-head"><div><div class="eyebrow">${pt?'MÉTODO':'METHOD'}</div><h2>${pt?'Comparar mecanismos, não rótulos':'Compare mechanisms, not labels'}</h2><p>${pt?'Cada caso preserva sequência, contexto, efeitos distributivos e limites de transferência. O atlas não atribui uma nota geral de sucesso ou fracasso.':'Each case preserves sequencing, context, distributional effects and transfer limits. The atlas does not assign an overall success/failure score.'}</p></div></div>
      <ol class="policy-chain">${chain}</ol>
    </div></section>

    <section class="section policy-matrix-section"><div class="container">
      <div class="policy-section-head"><div><div class="eyebrow">${pt?'MATRIZ':'MATRIX'}</div><h2>${pt?'Comparação estrutural dos casos':'Structural case comparison'}</h2><p>${pt?'A matriz contém apenas campos comparáveis. A interpretação completa aparece nos dossiês abaixo.':'The matrix contains only comparable fields. Full interpretation appears in the case dossiers below.'}</p></div><output id="policy-results-count" aria-live="polite">${data.cases.length}</output></div>
      <div class="policy-toolbar"><label><span>${pt?'Buscar':'Search'}</span><input id="policy-search" type="search" autocomplete="off" placeholder="${pt?'País, intervenção, problema ou mecanismo':'Country, intervention, problem or mechanism'}"></label><label><span>${pt?'Domínio':'Domain'}</span><select id="policy-domain"><option value="">${pt?'Todos os domínios':'All domains'}</option>${domainOptions}</select></label></div>
      <div class="policy-matrix-wrap" role="region" aria-label="${pt?'Matriz comparativa de casos':'Comparative case matrix'}" tabindex="0">
        <table class="policy-matrix"><thead><tr><th>${pt?'País':'Country'}</th><th>${pt?'Intervenção':'Intervention'}</th><th>${pt?'Lançamento':'Launch'}</th><th>${pt?'Domínio':'Domain'}</th><th>${pt?'Evidência':'Evidence'}</th><th>${pt?'Estudo profundo':'Deep study'}</th></tr></thead><tbody>${matrixRows}</tbody></table>
      </div><p class="policy-matrix-note">${esc(matrixNote)}</p>
    </div></section>

    <section class="section policy-cases-section"><div class="container">
      <div class="policy-section-head"><div><div class="eyebrow">${pt?'CASOS':'CASES'}</div><h2>${pt?'Mecanismo, resultado e transferibilidade':'Mechanism, outcome and transferability'}</h2><p>${pt?'Cada bloco mantém separados o problema enfrentado, o desenho da intervenção, o resultado observado e as condições que limitam sua replicação.':'Each block keeps separate the initial problem, intervention design, observed outcome and the conditions that limit replication.'}</p></div></div>
      <div class="policy-case-list" id="policy-case-list">${cards}</div>
      <div class="policy-empty" id="policy-empty" hidden>${pt?'Nenhum caso corresponde aos filtros atuais.':'No case matches the current filters.'}</div>
    </div></section>
  </main>${L.footer()}<script src="/assets/js/app.js"></script><script src="/assets/js/policy-case-atlas.js"></script></body></html>`;

  write(canonical+'index.html',html);
}
console.log('Policy Case Atlas rendered:',data.cases.length,'cases.');
