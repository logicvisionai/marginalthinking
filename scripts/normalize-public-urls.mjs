import fs from 'node:fs';
import path from 'node:path';
import {normalizePublicReferences} from './lib/public-url.mjs';

const root=process.cwd(),out=path.join(root,'dist');
if(!fs.existsSync(out)){console.error('FAIL dist ausente para normalização pública');process.exit(1);}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'site.config.json'),'utf8'));
const textExtensions=new Set(['.html','.xml','.json','.txt']);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

let changed=0;
for(const file of walk(out)){
  if(!textExtensions.has(path.extname(file).toLowerCase()))continue;
  const before=fs.readFileSync(file,'utf8'),after=normalizePublicReferences(before,cfg.site_url);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}
console.log(`Public URL normalization OK: ${changed} generated files aligned with Cloudflare HTML routing.`);
