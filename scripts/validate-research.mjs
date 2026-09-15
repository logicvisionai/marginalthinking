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
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(text))fail.push(`${file}: referência binária proibida`);
  validateTables(lines,file);validateCustomBlocks(lines,file);
}

if(exists('.packed-assets'))fail.push('.packed-assets não deve existir');
for(const p of walk('reports').filter(p=>/\.(pdf|docx|xlsx)$/i.test(p)))fail.push(`${p}: formato binário proibido`);
let cfg={},i18n={};
try{cfg=JSON.parse(read('site.config.json'));}catch(e){fail.push(`site.config.json inválido: ${e.message}`);}
try{i18n=JSON.parse(read('data/i18n.json'));}catch(e){fail.push(`data/i18n.json inválido: ${e.message}`);}
for(const key of ['site_name','site_url','publisher','institution','default_locale','locales','default_author'])if(!cfg[key])fail.push(`site.config.json sem ${key}`);
if(cfg.site_url&&!/^https:\/\//.test(cfg.site_url))fail.push('site.config.json: site_url deve usar HTTPS');
if(cfg.default_locale&&!cfg.locales?.[cfg.default_locale])fail.push('site.config.json: default_locale não existe em locales');
for(const code of Object.keys(cfg.locales||{})){if(!i18n[code])fail.push(`data/i18n.json sem locale ${code}`);for(const key of ['lang','label','date_locale','og_locale'])if(!cfg.locales[code]?.[key])fail.push(`site.config.json: locales.${code} sem ${key}`);}
if(cfg.default_author)for(const key of ['name','slug','email'])if(!cfg.default_author[key])fail.push(`site.config.json: default_author sem ${key}`);

let reports=[];try{reports=collectReports(root);}catch(e){fail.push(`coleta de pesquisas falhou: ${e.message}`);}
const ids=new Set(),urls=new Set();
for(const item of reports){
  for(const key of ['id','date','kind','title','deck','url','markdown_url'])if(!item[key])fail.push(`research: ${item.id||'entrada'} sem ${key}`);
  if(ids.has(item.id))fail.push(`research: id duplicado ${item.id}`);ids.add(item.id);if(urls.has(item.url))fail.push(`research: URL duplicada ${item.url}`);urls.add(item.url);
  if(!/^\/reports\/.+\.html$/.test(item.url||''))fail.push(`${item.id}: url deve ser HTML em /reports/`);
  const source=item.source_locale||cfg.legacy_source_locale;if(!cfg.locales?.[source])warn.push(`${item.id}: source_locale '${source}' não configurado`);
  for(const locale of availableLocales(item)){
    const v=reportView(item,locale),md=localPath(v?.markdown_url);if(!md||!exists(md))fail.push(`${item.id}/${locale}: Markdown ausente (${md||'sem caminho'})`);else scanMarkdown(md);
    if((v?.deck||'').length>320)warn.push(`${item.id}/${locale}: deck muito longo para meta description`);
  }
  if(item._bundle){if(source!=='en')warn.push(`${item.id}: bundle novo deveria usar English como source_locale`);for(const required of ['en','pt-BR'])if(!availableLocales(item).includes(required))fail.push(`${item.id}: bundle multilíngue precisa de ${required}`);}
  if(item.source_locale==='en'&&!availableLocales(item).includes('pt-BR'))fail.push(`${item.id}: publicação English-first precisa de tradução pt-BR`);
}
for(const file of ['assets/css/styles.css','assets/css/research-static.css','assets/js/app.js','scripts/render-site.mjs','scripts/lib/markdown.mjs'])if(!exists(file))fail.push(`${file}: ausente`);
if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Research validation OK: ${reports.length} publications; ${Object.keys(cfg.locales||{}).length} locales; canonical Markdown; recoverable formatting normalized.`);
