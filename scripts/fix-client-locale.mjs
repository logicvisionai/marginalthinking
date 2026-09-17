import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const file=path.join(root,'dist','assets','js','app.js');
if(!fs.existsSync(file))throw new Error('dist/assets/js/app.js ausente');

let js=fs.readFileSync(file,'utf8');
const helper=`function localizedResearchData(data){
  const code=isPt()?'pt-BR':'en',prefix=code==='pt-BR'?'/pt-br':'';
  return data.map(r=>{
    const view=r.locale_views?.[code]||(r.source_locale===code?r:r.translations?.[code]);
    if(!view)return null;
    const rawUrl=view.html_url||r.url||'';
    const url=view.html_url||(prefix&&rawUrl.startsWith('/')&&!rawUrl.startsWith(prefix+'/')?prefix+rawUrl:rawUrl);
    return {...r,...view,url,markdown_url:view.markdown_url||r.markdown_url};
  }).filter(Boolean);
}
`;

if(!js.includes('function localizedResearchData(data){')){
  const anchor='async function loadResearchIndex(){';
  if(!js.includes(anchor))throw new Error('loadResearchIndex não encontrado em app.js');
  js=js.replace(anchor,helper+anchor);
}

const parse="data=await res.json();if(!Array.isArray(data))throw new Error('schema');";
const localized=`${parse}data=localizedResearchData(data);`;
if(!js.includes('data=localizedResearchData(data);')){
  if(!js.includes(parse))throw new Error('ponto de localização do índice não encontrado em app.js');
  js=js.replace(parse,localized);
}

fs.writeFileSync(file,js);
console.log('Client research index localized before dynamic rendering.');
