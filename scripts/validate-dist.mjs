import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist'),fail=[],warn=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
if(!fs.existsSync(root)){console.error('FAIL dist ausente');process.exit(1);}
const files=walk(root),html=files.filter(x=>x.endsWith('.html'));
for(const file of html){
  const rel=path.relative(root,file).split(path.sep).join('/'),s=fs.readFileSync(file,'utf8');
  if(!/<html\s+lang="[^"]+"/i.test(s))fail.push(`${rel}: html lang ausente`);
  if(!/<meta\s+name="viewport"/i.test(s))fail.push(`${rel}: viewport ausente`);
  if(!/<h1[\s>]/i.test(s)&&!rel.endsWith('404.html'))fail.push(`${rel}: H1 ausente`);
  if(/Carregando pesquisa|Loading research/i.test(s))fail.push(`${rel}: conteúdo dependente de client-side renderer`);
  if(/\.(pdf|docx|xlsx)(?:\?|["'\s<)])/i.test(s))fail.push(`${rel}: referência binária proibida`);
  if(rel.includes('reports/')&&!rel.endsWith('404.html')){
    if(!/rel="canonical"/i.test(s))fail.push(`${rel}: canonical ausente`);
    if(!/application\/ld\+json/i.test(s))fail.push(`${rel}: JSON-LD ausente`);
    if(!/author-signature/i.test(s)&&!/noindex,follow/i.test(s))fail.push(`${rel}: assinatura editorial ausente`);
    const visible=s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<pre[\s\S]*?<\/pre>/gi,'').replace(/<code[\s\S]*?<\/code>/gi,'');
    if(/\*\*[^<\n]*$|__[^<\n]*$/m.test(visible))warn.push(`${rel}: possível marcador markdown residual`);
  }
}
for(const required of ['sitemap.xml','robots.txt','feed.xml','index.html','reports.html','pt-br/index.html','pt-br/reports.html'])if(!fs.existsSync(path.join(root,required)))fail.push(`${required}: artefato gerado ausente`);
if(warn.length)console.warn(warn.map(x=>`WARN ${x}`).join('\n'));
if(fail.length){console.error(fail.map(x=>`FAIL ${x}`).join('\n'));process.exit(1);}
console.log(`Rendered output validation OK: ${html.length} HTML pages.`);
