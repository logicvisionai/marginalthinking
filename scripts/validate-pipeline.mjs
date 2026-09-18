import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {visualIssues,visualSignature,visualPolicyApplies} from './lib/visuals.mjs';

const root=process.cwd();
const fail=[];
const warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const json=p=>JSON.parse(read(p));
const walk=(dir,name)=>!exists(dir)?[]:fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p,name):(!name||e.name===name?[p]:[]);});
const blobSha=text=>crypto.createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex');

let taxonomy={};
try{taxonomy=json('data/taxonomy.json');}catch(e){fail.push(`data/taxonomy.json inválido: ${e.message}`);}

const publicIds=new Set();
for(const file of walk('reports','metadata.json')){
  try{
    const item=json(file);
    if(item.id)publicIds.add(item.id);
    const dir=path.posix.dirname(file);
    for(const [locale,v] of Object.entries(item.locales||{})){
      const md=v?.markdown||v?.markdown_file;
      if(!md)continue;
      const resolved=path.posix.normalize(path.posix.join(dir,md));
      if(resolved.startsWith('staging/'))fail.push(`${file}/${locale}: bundle público não pode apontar para staging (${resolved})`);
      if(!resolved.startsWith('reports/'))fail.push(`${file}/${locale}: Markdown público deve resolver dentro de reports/ (${resolved})`);
      if(!exists(resolved))fail.push(`${file}/${locale}: Markdown público ausente (${resolved})`);
    }
  }catch(e){fail.push(`${file}: metadata inválido: ${e.message}`);}
}

const requiredTaxonomy=['taxonomy_version','program','related_programs','dimensions','geography','topics','format','cadence'];
const pendingFiles=walk('data/pending').filter(p=>p.endsWith('.json'));
let active=0,approvedCount=0,legacyPublished=0;
for(const file of pendingFiles){
  let p;
  try{p=json(file);}catch(e){fail.push(`${file}: JSON inválido: ${e.message}`);continue;}
  if(!p?.id){fail.push(`${file}: id ausente`);continue;}
  if(publicIds.has(p.id)){if((p.schema_version||1)<2)legacyPublished++;continue;}
  active++;
  if(p.schema_version!==2)fail.push(`${file}: item ainda não publicado deve usar schema_version 2`);
  for(const key of ['ready','id','slug','date','published_at','kind','priority','source_locale','sources',...requiredTaxonomy])if(p[key]===undefined||p[key]===null)fail.push(`${file}: ${key} ausente`);
  if(p.ready!==true)fail.push(`${file}: ready deve ser true quando o sidecar é gravado`);
  if(p.source_locale!=='en')fail.push(`${file}: source_locale deve ser en`);
  if(p.taxonomy_version!==taxonomy.version)fail.push(`${file}: taxonomy_version deve ser ${taxonomy.version}`);
  if(!taxonomy.programs?.[p.program])fail.push(`${file}: program inválido (${p.program||'ausente'})`);
  if(!taxonomy.formats?.[p.format])fail.push(`${file}: format inválido (${p.format||'ausente'})`);
  if(!taxonomy.cadences?.includes(p.cadence))fail.push(`${file}: cadence inválida (${p.cadence||'ausente'})`);
  if(!Array.isArray(p.dimensions)||!p.dimensions.length)fail.push(`${file}: dimensions ausente/vazio`);else for(const d of p.dimensions)if(!taxonomy.dimensions?.[d])fail.push(`${file}: dimension inválida (${d})`);
  if(p.program==='strategic-transitions')for(const d of ['economy','politics','society'])if(!(p.dimensions||[]).includes(d))fail.push(`${file}: Strategic Transitions exige ${d}`);
  if(p.kind==='weekly-technology-signal'){
    if(p.program!=='technology-production-society')fail.push(`${file}: weekly-technology-signal exige program technology-production-society`);
    if(p.format!=='assessment')fail.push(`${file}: weekly-technology-signal exige format assessment`);
    if(p.cadence!=='weekly')fail.push(`${file}: weekly-technology-signal exige cadence weekly`);
    for(const d of ['economy','politics','society'])if(!(p.dimensions||[]).includes(d))fail.push(`${file}: weekly-technology-signal exige dimensão ${d}`);
    const sr=p.signal_rationale;
    if(!sr||typeof sr!=='object')fail.push(`${file}: weekly-technology-signal exige signal_rationale`);
    else for(const key of ['delta','evidence','scale_path','transmission','falsifier'])if(!String(sr[key]||'').trim())fail.push(`${file}: signal_rationale.${key} ausente`);
  }
  if(!Array.isArray(p.related_programs))fail.push(`${file}: related_programs deve ser array`);else for(const rp of p.related_programs)if(!taxonomy.programs?.[rp]||rp===p.program)fail.push(`${file}: related_program inválido (${rp})`);
  if(!Array.isArray(p.topics)||p.topics.length<2)fail.push(`${file}: topics deve ter ao menos dois itens`);else for(const t of p.topics)if(!taxonomy.topics?.[t])fail.push(`${file}: topic inválido (${t})`);
  if(p.phenomena!==undefined){
    if(!Array.isArray(p.phenomena))fail.push(`${file}: phenomena deve ser array quando presente`);
    else{
      if(new Set(p.phenomena).size!==p.phenomena.length)fail.push(`${file}: phenomena contém duplicação`);
      for(const ph of p.phenomena)if(!taxonomy.phenomena?.[ph])fail.push(`${file}: phenomenon inválido (${ph})`);
    }
  }
  const g=p.geography||{};
  if(!taxonomy.geography_levels?.includes(g.level))fail.push(`${file}: geography.level inválido (${g.level||'ausente'})`);
  for(const r of g.regions||[])if(!taxonomy.regions?.[r])fail.push(`${file}: região inválida (${r})`);
  for(const s of g.subregions||[])if(!taxonomy.subregions?.[s])fail.push(`${file}: sub-região inválida (${s})`);
  for(const c of g.countries||[])if(!/^[A-Z]{2}$/.test(c?.code||'')||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c?.slug||''))fail.push(`${file}: país inválido; use {code: ISO alpha-2, slug: kebab-case}`);
  const visualTexts={};
  for(const locale of ['en','pt-BR']){
    const s=p.sources?.[locale];
    if(!s){fail.push(`${file}: sources.${locale} ausente`);continue;}
    for(const key of ['markdown','title','deck','tags','keywords'])if(s[key]===undefined)fail.push(`${file}: sources.${locale}.${key} ausente`);
    const md=String(s.markdown||'').replace(/^\//,'');
    if(!md.startsWith(`staging/research/`))fail.push(`${file}: sources.${locale}.markdown deve ficar em staging/research/`);
    if(md&&!exists(md))fail.push(`${file}: fonte ausente (${md})`);
    if(md&&exists(md)){
      visualTexts[locale]=read(md);
      for(const issue of visualIssues(visualTexts[locale],p,`${file}/${locale}`))fail.push(issue);
    }
  }
  if(visualPolicyApplies(p)&&visualTexts.en&&visualTexts['pt-BR']){
    const en=visualSignature(visualTexts.en),pt=visualSignature(visualTexts['pt-BR']);
    if(JSON.stringify(en)!==JSON.stringify(pt))fail.push(`${file}: EN/PT-BR divergem na assinatura visual (${JSON.stringify(en)} vs ${JSON.stringify(pt)})`);
  }
  const approval=file.replace('data/pending/','data/approved/');
  if(exists(approval)){
    try{
      const a=json(approval);
      if(a.qa_status==='approved'){
        approvedCount++;
        if(a.schema_version!==2)fail.push(`${approval}: aprovação de item v2 deve usar schema_version 2`);
        if(a.id!==p.id)fail.push(`${approval}: id difere do pending`);
        if(a.pending_blob_sha&&a.pending_blob_sha!==blobSha(read(file)))fail.push(`${approval}: pending_blob_sha não coincide`);
        for(const locale of ['en','pt-BR']){
          const md=String(p.sources?.[locale]?.markdown||'').replace(/^\//,'');
          if(md&&exists(md)&&a.source_blob_shas?.[locale]!==blobSha(read(md)))fail.push(`${approval}: SHA da fonte ${locale} não coincide`);
        }
        if(a.taxonomy_check!=='passed')fail.push(`${approval}: taxonomy_check deve ser passed`);
        if(a.translation_check!=='passed')fail.push(`${approval}: translation_check deve ser passed`);
        if(!a.publication||a.publication.id!==p.id)fail.push(`${approval}: snapshot publication ausente ou inválido`);
      }
    }catch(e){fail.push(`${approval}: JSON inválido: ${e.message}`);}
  }
}

// Internal Technology Signal Intelligence ledger. It is operational memory, never public evidence.
if(!exists('TECHNOLOGY-SIGNALS.md'))fail.push('TECHNOLOGY-SIGNALS.md: ausente');
if(!exists('data/schemas/technology-signals-v1.json'))fail.push('data/schemas/technology-signals-v1.json: ausente');
if(!exists('data/technology-signals.json'))fail.push('data/technology-signals.json: ausente');
else{
  try{
    const ledger=json('data/technology-signals.json');
    const allowedStates=new Set(['watch','strengthening','publishable','promoted','weakening','retired']);
    const allowedStages=new Set(['claimed','demonstrated','deployed','scaled']);
    const allowedClasses=new Set([
      'capability-delta','replication-validation','reliability-yield-throughput',
      'cost-resource-constraint','prototype-to-deployment','deployment-to-scale',
      'enabling-infrastructure','manufacturing-supply-chain',
      'procurement-standards-regulation','economic-social-transmission','contrary-evidence'
    ]);
    if(ledger.schema_version!==1)fail.push('data/technology-signals.json: schema_version deve ser 1');
    if(!(ledger.updated_at===null||typeof ledger.updated_at==='string'))fail.push('data/technology-signals.json: updated_at deve ser string ou null');
    if(!Array.isArray(ledger.signals))fail.push('data/technology-signals.json: signals deve ser array');
    else{
      if(ledger.signals.length>40)fail.push('data/technology-signals.json: ledger excede 40 sinais; faça pruning/merge');
      const slugs=new Set();
      let activeSignals=0;
      for(const [i,s] of ledger.signals.entries()){
        const label=`data/technology-signals.json: signals[${i}]`;
        if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s?.slug||''))fail.push(`${label}.slug inválido`);
        else if(slugs.has(s.slug))fail.push(`${label}.slug duplicado (${s.slug})`); else slugs.add(s.slug);
        if(!allowedStates.has(s?.state))fail.push(`${label}.state inválido`);
        if(!['retired'].includes(s?.state))activeSignals++;
        if(!allowedStages.has(s?.evidence_stage))fail.push(`${label}.evidence_stage inválido`);
        if(!String(s?.what_changed||'').trim())fail.push(`${label}.what_changed ausente`);
        if(!Array.isArray(s?.signal_classes))fail.push(`${label}.signal_classes deve ser array`);
        else for(const k of s.signal_classes)if(!allowedClasses.has(k))fail.push(`${label}: signal_class inválido (${k})`);
        for(const key of ['constraints','transmission','contrary_evidence','falsifiers','related_research_ids','evidence_refs'])if(!Array.isArray(s?.[key]))fail.push(`${label}.${key} deve ser array`);
        const e=s?.entities;
        if(!e||typeof e!=='object')fail.push(`${label}.entities ausente`);
        else for(const key of ['researchers','universities_labs','institutions','companies'])if(!Array.isArray(e[key]))fail.push(`${label}.entities.${key} deve ser array`);
      }
      if(activeSignals>24)warn.push(`data/technology-signals.json: ${activeSignals} sinais ativos; TECHNOLOGY-SIGNALS.md recomenda ledger enxuto (~20)`);
    }
  }catch(e){fail.push(`data/technology-signals.json: JSON inválido (${e.message})`);}
}

if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Pipeline validation OK: ${publicIds.size} public bundles; ${active} unpublished pending; ${approvedCount} approved unpublished; ${legacyPublished} legacy pending already public.`);
