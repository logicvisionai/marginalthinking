import fs from 'node:fs';
import path from 'node:path';
import {collectReports,availableLocales,reportView} from './lib/reports.mjs';

const root=process.cwd(),fail=[],warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const localPath=url=>String(url||'').replace(/^\//,'').split('?')[0];
const walk=dir=>!exists(dir)?[]:fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const stripFences=text=>text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm,'');

function validateTables(lines,file){
  for(let i=0;i<lines.length-1;i++){
    if(!lines[i].includes('|'))continue;
    const sep=lines[i+1].trim();if(!/^\|?\s*:?-{3,}/.test(sep))continue;
    const cols=s=>s.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').length,expected=cols(lines[i]);
    if(expected!==cols(lines[i+1]))fail.push(`${file}:${i+1}: tabela com cabeçalho/separador incompatíveis`);
    let j=i+2;while(j<lines.length&&lines[j].trim()&&lines[j].includes('|')){if(cols(lines[j])!==expected)fail.push(`${file}:${j+1}: linha de tabela com número de colunas diferente`);j++;}
  }
}
function validateCustomBlocks(lines,file){
  for(let i=0;i<lines.length;i++){
    const m=lines[i].trim().match(/^```(chart|flow|mindmap|map|text|diagram|ascii)\s*$/);if(!m)continue;
    const type=m[1],body=[];i++;while(i<lines.length&&!/^```\s*$/.test(lines[i].trim()))body.push(lines[i++]);
    if(type==='chart'){
      const rows=body.filter(x=>x.includes('|'));
      if(rows.length<2)warn.push(`${file}: chart com menos de duas linhas; renderer fará fallback seguro`);
      const chartType=body.find(x=>/^type\s*:/i.test(x.trim()))?.split(':').slice(1).join(':').trim();
      if(chartType&&!['bar','line'].includes(chartType.toLowerCase()))warn.push(`${file}: chart type '${chartType}' não reconhecido; será tratado como bar`);
    }
    if(type==='flow'&&(body.join(' ').match(/(?:→|->)/g)||[]).length<1)warn.push(`${file}: flow sem seta; renderer fará fallback seguro`);
    if(type==='map'&&body.filter(x=>x.includes('|')).length<1)warn.push(`${file}: map sem regiões estruturadas`);
  }
}
function scanMarkdown(file){
  const text=read(file),lines=text.replace(/\r/g,'').split('\n');
  if(text.includes('\uFFFD'))fail.push(`${file}: caractere Unicode de substituição (�)`);
  const fences=(text.match(/^```/gm)||[]).length;if(fences%2)fail.push(`${file}: bloco de código sem fechamento`);
  const h1=(text.match(/^#\s+/gm)||[]).length,h2=(text.match(/^##\s+/gm)||[]).length;
  if(h1<1)fail.push(`${file}: deve conter ao menos um H1`);if(h1>1)warn.push(`${file}: ${h1} H1 encontrados; os adicionais serão normalizados para H2`);if(h2<2)warn.push(`${file}: menos de dois H2`);
  const prose=stripFences(text),bold=(prose.match(/(^|[^\\])\*\*/g)||[]).length,strong=(prose.match(/(^|[^\\])__/g)||[]).length;
  if(bold%2)warn.push(`${file}: marcador ** órfão; renderer removerá o marcador residual`);if(strong%2)warn.push(`${file}: marcador __ órfão; renderer removerá o marcador residual`);
  if(/^\s*\d+[.)]\s+\d+[.)]\s+/m.test(prose))warn.push(`${file}: marcador numérico duplicado; pós-processamento normalizará sem bloquear o build`);
  if(/^\s*[-+*•]\s+[-+*•]\s+/m.test(prose))warn.push(`${file}: marcador de lista duplicado; pós-processamento normalizará sem bloquear o build`);
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(text))fail.push(`${file}: referência binária proibida`);
  validateTables(lines,file);validateCustomBlocks(lines,file);
}

if(exists('.packed-assets'))fail.push('.packed-assets não deve existir');
for(const p of walk('reports').filter(p=>/\.(pdf|docx|xlsx)$/i.test(p)))fail.push(`${p}: formato binário proibido`);
let cfg={},i18n={},taxonomy={};
try{cfg=JSON.parse(read('site.config.json'));}catch(e){fail.push(`site.config.json inválido: ${e.message}`);}
try{i18n=JSON.parse(read('data/i18n.json'));}catch(e){fail.push(`data/i18n.json inválido: ${e.message}`);}
try{taxonomy=JSON.parse(read(cfg.taxonomy_file||'data/taxonomy.json'));}catch(e){fail.push(`taxonomia inválida: ${e.message}`);}
for(const key of ['site_name','site_url','publisher','institution','default_locale','locales','default_author','editorial_architecture_version','taxonomy_file'])if(!cfg[key])fail.push(`site.config.json sem ${key}`);
if(cfg.default_locale!=='en')fail.push('site.config.json: default_locale deve permanecer en para preservar English-first');
if(cfg.site_url&&!/^https:\/\//.test(cfg.site_url))fail.push('site.config.json: site_url deve usar HTTPS');
if(cfg.default_locale&&!cfg.locales?.[cfg.default_locale])fail.push('site.config.json: default_locale não existe em locales');
for(const code of Object.keys(cfg.locales||{})){if(!i18n[code])fail.push(`data/i18n.json sem locale ${code}`);for(const key of ['lang','label','name','date_locale','og_locale'])if(!cfg.locales[code]?.[key])fail.push(`site.config.json: locales.${code} sem ${key}`);}
for(const code of ['en','pt-BR'])if(!cfg.locales?.[code])fail.push(`site.config.json: locale obrigatório ${code} ausente`);
for(const code of ['en','pt-BR'])for(const key of ['language_label','country','site_description','nav','footer','home','archive','method','about','report','author','topic','not_found'])if(!i18n?.[code]?.[key])fail.push(`data/i18n.json: ${code}.${key} ausente`);
if(cfg.default_author)for(const key of ['name','slug','email'])if(!cfg.default_author[key])fail.push(`site.config.json: default_author sem ${key}`);

const expectedDimensions=['economy','politics','society'];
const expectedPrograms=['global-system-power','political-economy-markets','strategic-transitions','technology-production-society'];
const dimensionKeys=Object.keys(taxonomy.dimensions||{}).sort(),programKeys=Object.keys(taxonomy.programs||{}).sort();
if(taxonomy.version!==cfg.editorial_architecture_version)fail.push(`taxonomia ${taxonomy.version||'sem versão'} difere de editorial_architecture_version ${cfg.editorial_architecture_version}`);
if(taxonomy.status!=='frozen')fail.push('data/taxonomy.json: status deve permanecer frozen');
if(JSON.stringify(dimensionKeys)!==JSON.stringify([...expectedDimensions].sort()))fail.push('data/taxonomy.json: dimensões canônicas devem ser exatamente economy, politics, society');
if(JSON.stringify(programKeys)!==JSON.stringify([...expectedPrograms].sort()))fail.push('data/taxonomy.json: programas canônicos divergiram da arquitetura editorial congelada');
for(const key of ['topics','formats','regions','subregions'])if(!taxonomy[key]||typeof taxonomy[key]!=='object')fail.push(`data/taxonomy.json sem ${key}`);
if(!Array.isArray(taxonomy.geography_levels)||!taxonomy.geography_levels.length)fail.push('data/taxonomy.json sem geography_levels');
if(!Array.isArray(taxonomy.cadences)||!taxonomy.cadences.length)fail.push('data/taxonomy.json sem cadences');
if(taxonomy.governance?.automations_may_extend_taxonomy!==false)fail.push('data/taxonomy.json: automations_may_extend_taxonomy deve ser false');

function validateTaxonomy(item){
  const id=item.id||'research';
  if(item.taxonomy_version!==taxonomy.version)fail.push(`${id}: taxonomy_version deve ser ${taxonomy.version}`);
  if(!taxonomy.programs?.[item.program])fail.push(`${id}: program inválido (${item.program||'ausente'})`);
  const related=Array.isArray(item.related_programs)?item.related_programs:[];
  if(new Set(related).size!==related.length)fail.push(`${id}: related_programs contém duplicação`);
  if(related.includes(item.program))fail.push(`${id}: related_programs não pode repetir o programa primário`);
  for(const p of related)if(!taxonomy.programs?.[p])fail.push(`${id}: related_program inválido (${p})`);
  if(!Array.isArray(item.dimensions)||item.dimensions.length<1)fail.push(`${id}: dimensions deve ter ao menos uma dimensão`);
  for(const d of item.dimensions||[])if(!taxonomy.dimensions?.[d])fail.push(`${id}: dimension inválida (${d})`);
  if(item.program==='strategic-transitions')for(const d of expectedDimensions)if(!(item.dimensions||[]).includes(d))fail.push(`${id}: Strategic Transitions exige dimensão ${d}`);
  if(!taxonomy.formats?.[item.format])fail.push(`${id}: format inválido (${item.format||'ausente'})`);
  if(!taxonomy.cadences?.includes(item.cadence))fail.push(`${id}: cadence inválida (${item.cadence||'ausente'})`);
  if(!Array.isArray(item.topics)||item.topics.length<2)fail.push(`${id}: topics deve conter ao menos dois tópicos controlados`);
  if(new Set(item.topics||[]).size!==(item.topics||[]).length)fail.push(`${id}: topics contém duplicação`);
  for(const t of item.topics||[])if(!taxonomy.topics?.[t])fail.push(`${id}: topic inválido (${t})`);
  const g=item.geography;
  if(!g||typeof g!=='object')return fail.push(`${id}: geography ausente`);
  if(!taxonomy.geography_levels?.includes(g.level))fail.push(`${id}: geography.level inválido (${g.level||'ausente'})`);
  const regions=Array.isArray(g.regions)?g.regions:[],subregions=Array.isArray(g.subregions)?g.subregions:[],countries=Array.isArray(g.countries)?g.countries:[];
  for(const r of regions)if(!taxonomy.regions?.[r])fail.push(`${id}: região inválida (${r})`);
  for(const s of subregions){if(!taxonomy.subregions?.[s])fail.push(`${id}: sub-região inválida (${s})`);else if(regions.length&&!regions.includes(taxonomy.subregions[s].region))fail.push(`${id}: sub-região ${s} não corresponde às regiões declaradas`);}
  for(const c of countries){if(!c||typeof c!=='object'||!/^[A-Z]{2}$/.test(c.code||'')||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug||''))fail.push(`${id}: país deve usar {code: ISO alpha-2, slug: kebab-case}`);}
  if(g.level==='country'&&countries.length<1)fail.push(`${id}: geography.level country exige countries`);
  if(g.level==='region'&&regions.length<1)fail.push(`${id}: geography.level region exige regions`);
  if(item.format==='country-dossier'&&(g.level!=='country'||countries.length<1))fail.push(`${id}: country-dossier exige geography.level country e ao menos um país`);
  if(['assessment','research-report','country-dossier'].includes(item.format)&&new Set(item.dimensions||[]).size<2)warn.push(`${id}: pesquisa profunda deveria conectar ao menos duas dimensões`);
}

let reports=[];try{reports=collectReports(root);}catch(e){fail.push(`coleta de pesquisas falhou: ${e.message}`);}
const ids=new Set(),urls=new Set();
for(const item of reports){
  for(const key of ['id','date','kind','title','deck','url','markdown_url'])if(!item[key])fail.push(`research: ${item.id||'entrada'} sem ${key}`);
  if(ids.has(item.id))fail.push(`research: id duplicado ${item.id}`);ids.add(item.id);if(urls.has(item.url))fail.push(`research: URL duplicada ${item.url}`);urls.add(item.url);
  if(!/^\/reports\/.+\.html$/.test(item.url||''))fail.push(`${item.id}: url deve ser HTML em /reports/`);
  if(!item._bundle)fail.push(`${item.id}: publicação pública ainda usa estrutura legada; migre para metadata.json com en + pt-BR`);
  if((item.source_locale||'')!=='en')fail.push(`${item.id}: source_locale deve ser en`);
  validateTaxonomy(item);
  const locales=availableLocales(item);
  for(const required of ['en','pt-BR'])if(!locales.includes(required))fail.push(`${item.id}: publicação pública precisa de edição ${required}`);
  for(const locale of locales){
    const v=reportView(item,locale),md=localPath(v?.markdown_url);if(!md||!exists(md))fail.push(`${item.id}/${locale}: Markdown ausente (${md||'sem caminho'})`);else scanMarkdown(md);
    if(!(v?.title||'').trim())fail.push(`${item.id}/${locale}: título ausente`);
    if(!(v?.deck||'').trim())fail.push(`${item.id}/${locale}: deck ausente`);
    if((v?.deck||'').length>320)warn.push(`${item.id}/${locale}: deck muito longo para meta description`);
  }
}
for(const file of ['EDITORIAL-ARCHITECTURE.md','data/taxonomy.json','assets/css/styles.css','assets/css/research-static.css','assets/css/language-switch.css','assets/css/layout-guardrails.css','assets/js/app.js','scripts/render-site.mjs','scripts/harden-output.mjs','scripts/lib/markdown.mjs'])if(!exists(file))fail.push(`${file}: ausente`);
if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Research validation OK: ${reports.length} bilingual publications; editorial architecture ${taxonomy.version}; ${Object.keys(taxonomy.programs||{}).length} programs; controlled taxonomy; English-first.`);
