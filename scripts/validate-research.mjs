import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const fail=[];
const warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const localPath=url=>String(url||'').replace(/^\//,'').split('?')[0];

function scanMarkdown(file){
  const text=read(file);
  if(text.includes('\uFFFD')) fail.push(`${file}: caractere Unicode de substituição (�)`);
  const fences=(text.match(/^```/gm)||[]).length;
  if(fences%2) fail.push(`${file}: bloco de código sem fechamento`);
  const h1=(text.match(/^#\s+/gm)||[]).length;
  const h2=(text.match(/^##\s+/gm)||[]).length;
  if(h1<1) fail.push(`${file}: deve conter ao menos um H1`);
  if(h1>1) warn.push(`${file}: ${h1} H1 encontrados; apenas o primeiro será título e os demais serão normalizados para H2`);
  if(h2<2) warn.push(`${file}: menos de dois H2`);
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(text)) fail.push(`${file}: referência binária proibida`);
  const lines=text.replace(/\r/g,'').split('\n');
  for(let i=0;i<lines.length-1;i++){
    if(!lines[i].includes('|')) continue;
    const sep=lines[i+1].trim();
    if(!/^\|?\s*:?-{3,}/.test(sep)) continue;
    const cols=s=>s.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').length;
    const expected=cols(lines[i]);
    if(expected!==cols(lines[i+1])) fail.push(`${file}:${i+1}: tabela com cabeçalho/separador incompatíveis`);
    let j=i+2;
    while(j<lines.length&&lines[j].trim()&&lines[j].includes('|')){
      if(cols(lines[j])!==expected) fail.push(`${file}:${j+1}: linha de tabela com número de colunas diferente`);
      j++;
    }
  }
}

function walk(dir){
  if(!exists(dir)) return [];
  return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{
    const p=path.posix.join(dir,e.name);
    return e.isDirectory()?walk(p):[p];
  });
}

if(exists('.packed-assets')) fail.push('.packed-assets não deve existir');
for(const p of walk('reports').filter(p=>/\.(pdf|docx|xlsx)$/i.test(p))) fail.push(`${p}: formato binário proibido`);

let config={};
try{config=JSON.parse(read('site.config.json'));}catch(e){fail.push(`site.config.json inválido: ${e.message}`);}
for(const key of ['site_name','site_url','publisher','institution','language','default_author']) if(!config[key]) fail.push(`site.config.json sem ${key}`);
if(config.site_url&&!/^https:\/\//.test(config.site_url)) fail.push('site.config.json: site_url deve usar HTTPS');
if(config.default_author){for(const key of ['name','slug','email']) if(!config.default_author[key]) fail.push(`site.config.json: default_author sem ${key}`);}

let reports=[];
try{reports=JSON.parse(read('data/reports.json'));}catch(e){fail.push(`data/reports.json inválido: ${e.message}`);}
if(!Array.isArray(reports)) fail.push('data/reports.json deve ser um array');
const ids=new Set(),urls=new Set();
for(const item of reports){
  for(const key of ['id','date','kind','title','deck','url','markdown_url']) if(!item[key]) fail.push(`reports.json: ${item.title||item.id||'entrada'} sem ${key}`);
  if(ids.has(item.id)) fail.push(`reports.json: id duplicado ${item.id}`); ids.add(item.id);
  if(urls.has(item.url)) fail.push(`reports.json: URL duplicada ${item.url}`); urls.add(item.url);
  if(!/^\/reports\/.+\.html$/.test(item.url||'')) fail.push(`${item.id}: url deve ser HTML em /reports/`);
  if(!/^\/reports\/.+\.md$/.test(item.markdown_url||'')) fail.push(`${item.id}: markdown_url inválida`);
  if((item.deck||'').length>320) warn.push(`${item.id}: deck muito longo para meta description`);
  const md=localPath(item.markdown_url);
  if(!exists(md)) fail.push(`${item.id}: Markdown ausente (${md})`); else scanMarkdown(md);
}

for(const file of ['index.html','reports.html','about.html','methodology.html']){
  if(!exists(file)) fail.push(`${file}: ausente`);
  else if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(read(file))) fail.push(`${file}: referência binária proibida`);
}

if(warn.length) console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Research validation OK: ${reports.length} publicações; Markdown canônico; HTML será gerado no build.`);
