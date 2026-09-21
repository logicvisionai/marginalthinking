import fs from 'node:fs';
import path from 'node:path';
import {collectReports,availableLocales,reportView} from './lib/reports.mjs';
import {visualIssues,visualSignature,visualPolicyApplies} from './lib/visuals.mjs';
import {visualNumber} from './lib/research-visuals.mjs';

const root=process.cwd(),fail=[],warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const localPath=url=>String(url||'').replace(/^\//,'').split('?')[0];
const walk=dir=>!exists(dir)?[]:fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{const p=path.posix.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const stripFences=text=>text.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm,'');


function validateEditorialIntegrity(text,file,item={}){
  const prose=stripFences(text).replace(/https?:\/\/[^\s)\]]+/g,' ');
  const blockers=[
    ['metalinguagem de ferramenta',/\b(?:a|esta|essa)\s+ferramenta(?:\s+p[uú]blica)?\s+(?:usa|registra|mostra|permite|conecta|come[cç]a)\b/i],
    ['product meta-language',/\b(?:the|this)\s+(?:public\s+)?(?:tool|platform)\s+(?:uses|records|shows|allows|connects|begins)\b/i],
    ['metalinguagem de sistema',/\b(?:o\s+sistema|the\s+system)\s+(?:come[cç]a\s+a\s+responder|begins\s+to\s+answer)\b/i],
    ['versão de produto dentro da análise',/\b(?:nesta|nessa|in\s+this|for\s+this)\s+(?:primeira\s+|first\s+)?(?:vers[aã]o|version|release)\b/i],
    ['seção de implementação dentro da análise',/^##\s+(?:Implica[cç][aã]o|Implica[cç][oõ]es|Implication|Implications)\s+(?:para|for)\s+(?:o|a|the)?\s*(?:mapa|matriz|ferramenta|rede|sistema|map|matrix|tool|network|system)\b/im],
    ['roadmap editorial dentro da pesquisa',/^##\s+(?:O que deve entrar em seguida|What should enter next)\b/im],
    ['instrução de manutenção do produto',/\b(?:Atores Estrat[eé]gicos|Strategic Actors)\s+(?:deve\s+ser\s+atualizado|should\s+be\s+updated)\b/i],
    ['agenda editorial dentro da análise',/\b(?:a pr[oó]xima unidade de trabalho|the next unit of work)\b/i],
    ['produto descrito dentro da própria pesquisa',/\b(?:o resultado [ée] um produto de pesquisa|the result is a different research product)\b/i],
    ['prescrição editorial em voz institucional',/\bMarginal Thinking\s+(?:deve|should)\b/i]
  ];
  for(const [label,re] of blockers){
    const m=prose.match(re);
    if(m)fail.push(file+': '+label+'; pesquisa publicada deve analisar o objeto, não descrever como construir ou operar o produto (trecho: "'+m[0]+'")');
  }
  if(item.kind==='conflict-system'){
    const toneBlockers=[
      ['abertura metalinguística',/\b(?:esta|this)\s+(?:avalia[cç][aã]o|assessment|an[aá]lise|analysis|pesquisa|research)\s+(?:reconstr[oó]i|reconstructs|separa|separates|mostra|shows|preserva|preserves)\b/i],
      ['objetivo explicado ao leitor',/\b(?:o objetivo [ée]|the purpose is)\b/i],
      ['conclusão anunciada de forma formulaica',/\b(?:a principal conclus[aã]o [ée]|the central finding is)\b/i],
      ['transição conversacional',/\b(?:a distin[cç][aã]o importa|this distinction matters|uma distin[cç][aã]o [uú]til|one useful distinction|a pergunta correta [ée]|the correct question is|isso n[aã]o significa|that does not mean)\b/i],
      ['julgamento de enquadramento em voz editorial',/\b(?:esse [ée] o enquadramento adequado|that is the correct frame|o valor anal[ií]tico [ée] outro|their analytical value is different)\b/i],
      ['comentário sobre monitor ou método em vez do objeto',/\b(?:um monitor s[eé]rio|a serious monitor)\b/i],
      ['seção editorial interna',/^##\s+(?:Implica[cç][oõ]es para a pesquisa|Research implications)\b/im]
    ];
    for(const [label,re] of toneBlockers){
      const m=prose.match(re);
      if(m)fail.push(file+': '+label+'; conflito publicado exige prosa institucional e substantiva, sem comentários de bastidor ou instruções ao leitor (trecho: "'+m[0]+'")');
    }
  }
  const selfRefs=(prose.match(/\b(?:este|esta|this)\s+(?:artigo|relat[oó]rio|an[aá]lise|avalia[cç][aã]o|article|report|analysis|assessment)\b/gi)||[]).length;
  if(selfRefs>3)warn.push(file+': excesso de autorreferência editorial ('+selfRefs+'); prefira afirmar a evidência e o mecanismo diretamente');
  const ptTransitions=(prose.match(/\b(?:portanto|porém|nesse sentido|em outras palavras|a distin[cç][aã]o importa)\b/gi)||[]).length;
  const enTransitions=(prose.match(/\b(?:therefore|however|in other words|the distinction matters)\b/gi)||[]).length;
  if(ptTransitions>10||enTransitions>10)warn.push(file+': conectores discursivos repetitivos; revisar fluidez e evitar prosa formulaica');
}

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
      if(!rows.length)fail.push(`${file}: chart sem dados`);
      for(const row of body.filter(x=>x.trim()&&!/^(title|unit|type)\s*:/i.test(x.trim()))){
        const cells=row.split('|').map(x=>x.trim());
        if(cells.length!==2||!cells[0]||visualNumber(cells[1])===null)fail.push(`${file}: chart exige rótulo e número explícito, sem intervalos ou prosa: ${row}`);
      }
      const chartType=body.find(x=>/^type\s*:/i.test(x.trim()))?.split(':').slice(1).join(':').trim();
      if(chartType&&!['bar','line'].includes(chartType.toLowerCase()))fail.push(`${file}: chart type '${chartType}' não reconhecido`);
    }
    if(type==='flow'&&(body.join(' ').match(/(?:→|->)/g)||[]).length<1)warn.push(`${file}: flow sem seta; renderer fará fallback seguro`);
    if(type==='map'&&!body.some(x=>x.includes('|')||/(?:→|->)/.test(x)))warn.push(`${file}: map sem comparação regional ou rota; conteúdo preservado como notas`);
  }
}
function scanMarkdown(file,item={}){
  const text=read(file),lines=text.replace(/\r/g,'').split('\n');
  if(text.includes('\uFFFD'))fail.push(`${file}: caractere Unicode de substituição (�)`);
  const fences=(text.match(/^```/gm)||[]).length;if(fences%2)fail.push(`${file}: bloco de código sem fechamento`);
  const h1=(text.match(/^#\s+/gm)||[]).length,h2=(text.match(/^##\s+/gm)||[]).length;
  if(h1<1)fail.push(`${file}: deve conter ao menos um H1`);if(h1>1)warn.push(`${file}: ${h1} H1 encontrados; os adicionais serão normalizados para H2`);if(h2<2)warn.push(`${file}: menos de dois H2`);
  const prose=stripFences(text),bold=(prose.match(/(^|[^\\])\*\*/g)||[]).length,strong=(prose.match(/(^|[^\\])__/g)||[]).length;
  if(bold%2)warn.push(`${file}: marcador ** órfão; renderer removerá o marcador residual`);if(strong%2)warn.push(`${file}: marcador __ órfão; renderer removerá o marcador residual`);
  if(/^\s*\d+[.)]\s+\d+[.)]\s+/m.test(prose))warn.push(`${file}: marcador numérico duplicado; pós-processamento normalizará sem bloquear o build`);
  if(/^\s*[-+*•]\s+[-+*•]\s+/m.test(prose))warn.push(`${file}: marcador de lista duplicado; pós-processamento normalizará sem bloquear o build`);
  const textWithoutExternalUrls=text.replace(/https?:\/\/[^\s)\]]+/gi,' ');
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(textWithoutExternalUrls))fail.push(`${file}: referência binária interna proibida`);
  validateEditorialIntegrity(text,file,item);
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
for(const key of ['topics','formats','regions','subregions','phenomena','cross_cutting_lenses'])if(!taxonomy[key]||typeof taxonomy[key]!=='object')fail.push(`data/taxonomy.json sem ${key}`);
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
  if(item.kind==='weekly-technology-signal'){
    if(item.program!=='technology-production-society')fail.push(`${id}: weekly-technology-signal exige program technology-production-society`);
    if(item.format!=='assessment')fail.push(`${id}: weekly-technology-signal exige format assessment`);
    if(item.cadence!=='weekly')fail.push(`${id}: weekly-technology-signal exige cadence weekly`);
    for(const d of expectedDimensions)if(!(item.dimensions||[]).includes(d))fail.push(`${id}: weekly-technology-signal exige dimensão ${d}`);
    const sr=item.signal_rationale;
    if(!sr||typeof sr!=='object')fail.push(`${id}: weekly-technology-signal exige signal_rationale`);
    else for(const key of ['delta','evidence','scale_path','transmission','falsifier'])if(!String(sr[key]||'').trim())fail.push(`${id}: signal_rationale.${key} ausente`);
  }
  if(!taxonomy.formats?.[item.format])fail.push(`${id}: format inválido (${item.format||'ausente'})`);
  if(!taxonomy.cadences?.includes(item.cadence))fail.push(`${id}: cadence inválida (${item.cadence||'ausente'})`);
  if(!Array.isArray(item.topics)||item.topics.length<2)fail.push(`${id}: topics deve conter ao menos dois tópicos controlados`);
  if(new Set(item.topics||[]).size!==(item.topics||[]).length)fail.push(`${id}: topics contém duplicação`);
  for(const t of item.topics||[])if(!taxonomy.topics?.[t])fail.push(`${id}: topic inválido (${t})`);
  if(item.phenomena!==undefined){
    if(!Array.isArray(item.phenomena))fail.push(`${id}: phenomena deve ser array quando presente`);
    else{
      if(new Set(item.phenomena).size!==item.phenomena.length)fail.push(`${id}: phenomena contém duplicação`);
      for(const ph of item.phenomena)if(!taxonomy.phenomena?.[ph])fail.push(`${id}: phenomenon inválido (${ph})`);
    }
  }
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
  const locales=availableLocales(item),visualTexts={};
  for(const required of ['en','pt-BR'])if(!locales.includes(required))fail.push(`${item.id}: publicação pública precisa de edição ${required}`);
  for(const locale of locales){
    const v=reportView(item,locale),md=localPath(v?.markdown_url);
    if(!md||!exists(md))fail.push(`${item.id}/${locale}: Markdown ausente (${md||'sem caminho'})`);
    else{
      scanMarkdown(md,item);
      visualTexts[locale]=read(md);
      for(const issue of visualIssues(visualTexts[locale],item,`${item.id}/${locale}`))fail.push(issue);
    }
    if(!(v?.title||'').trim())fail.push(`${item.id}/${locale}: título ausente`);
    if(!(v?.deck||'').trim())fail.push(`${item.id}/${locale}: deck ausente`);
    if((v?.deck||'').length>320)warn.push(`${item.id}/${locale}: deck muito longo para meta description`);
  }
  if(visualPolicyApplies(item)&&visualTexts.en&&visualTexts['pt-BR']){
    const en=visualSignature(visualTexts.en),pt=visualSignature(visualTexts['pt-BR']);
    if(JSON.stringify(en)!==JSON.stringify(pt))fail.push(`${item.id}: EN/PT-BR divergem na assinatura visual (${JSON.stringify(en)} vs ${JSON.stringify(pt)})`);
  }
}
for(const file of ['RESEARCH-VISUALS.md','EDITORIAL-ARCHITECTURE.md','TECHNOLOGY-SIGNALS.md','CONFLICT-SECURITY-SOCIAL-CHANGE.md','data/taxonomy.json','assets/css/styles.css','assets/css/research-static.css','assets/css/language-switch.css','assets/css/layout-guardrails.css','assets/js/app.js','scripts/render-site.mjs','scripts/harden-output.mjs','scripts/lib/markdown.mjs'])if(!exists(file))fail.push(`${file}: ausente`);
if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Research validation OK: ${reports.length} bilingual publications; editorial architecture ${taxonomy.version}; ${Object.keys(taxonomy.programs||{}).length} programs; controlled taxonomy; English-first.`);
