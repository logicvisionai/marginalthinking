import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const fail=[];
const warn=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));

function localPath(url=''){
  return url.replace(/^\//,'').split('?')[0];
}

function scanMarkdown(file){
  const text=read(file);
  if(text.includes('\uFFFD')) fail.push(`${file}: caractere Unicode de substituição (�)`);
  const fences=(text.match(/^```/gm)||[]).length;
  if(fences%2) fail.push(`${file}: bloco de código sem fechamento`);
  const h1=(text.match(/^#\s+/gm)||[]).length;
  const h2=(text.match(/^##\s+/gm)||[]).length;
  if(h1!==1) fail.push(`${file}: deve conter exatamente um H1; encontrado ${h1}`);
  if(h2<2) warn.push(`${file}: menos de dois H2`);
  const lines=text.replace(/\r/g,'').split('\n');
  for(let i=0;i<lines.length-1;i++){
    if(!lines[i].includes('|'))continue;
    const sep=lines[i+1].trim();
    if(!/^\|?\s*:?-{3,}/.test(sep))continue;
    const cols=s=>s.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').length;
    const expected=cols(lines[i]);
    const sepCols=cols(lines[i+1]);
    if(expected!==sepCols) fail.push(`${file}:${i+1}: cabeçalho de tabela tem ${expected} colunas e separador ${sepCols}`);
    let j=i+2;
    while(j<lines.length&&lines[j].trim()&&lines[j].includes('|')){
      if(cols(lines[j])!==expected) fail.push(`${file}:${j+1}: linha de tabela com número de colunas diferente do cabeçalho`);
      j++;
    }
  }
}

function walk(dir){
  if(!exists(dir))return[];
  return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>{
    const p=path.posix.join(dir,e.name);
    return e.isDirectory()?walk(p):[p];
  });
}

if(exists('.packed-assets')) fail.push('.packed-assets não deve existir na arquitetura HTML + Markdown');
const binary=walk('reports').filter(p=>/\.(pdf|docx|xlsx)$/i.test(p));
for(const p of binary)fail.push(`${p}: formato binário proibido`);

let reports=[];
try{reports=JSON.parse(read('data/reports.json'));}catch(e){fail.push(`data/reports.json inválido: ${e.message}`);}
if(!Array.isArray(reports))fail.push('data/reports.json deve ser um array');

for(const item of reports){
  for(const key of ['id','date','kind','title','deck','url','markdown_url']) if(!item[key]) fail.push(`reports.json: ${item.title||item.id||'entrada'} sem ${key}`);
  const html=localPath(item.url),md=localPath(item.markdown_url);
  if(!exists(html))fail.push(`${item.id}: HTML ausente (${html})`);
  if(!exists(md))fail.push(`${item.id}: Markdown ausente (${md})`);
  if(exists(md))scanMarkdown(md);
  if(exists(html)){
    const source=read(html);
    if(!source.includes('data-markdown='))fail.push(`${html}: shell sem data-markdown`);
    if(/\.(pdf|docx|xlsx)(?:\?|["'\s<])/i.test(source))fail.push(`${html}: referência binária proibida`);
    if(!source.includes(path.basename(md)))fail.push(`${html}: não referencia ${path.basename(md)}`);
  }
}

for(const file of ['index.html','reports.html','about.html','methodology.html','data/reports.json']){
  if(!exists(file))continue;
  const text=read(file);
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<])/i.test(text))fail.push(`${file}: referência binária proibida`);
}

if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Research validation OK: ${reports.length} publicações, somente HTML + Markdown.`);
