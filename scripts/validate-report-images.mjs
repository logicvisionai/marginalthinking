import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {collectReports,reportView} from './lib/reports.mjs';
import {imagePathParts,imageBlocks,supportedKinds,supportedLicenses} from './lib/report-images.mjs';

const root=process.cwd(),distMode=process.argv.includes('--dist'),fail=[],used=new Map(),reports=collectReports(root).filter(x=>x._bundle);
const catalogPath=path.join(root,'data/report-images.json');
const catalog=fs.existsSync(catalogPath)?JSON.parse(fs.readFileSync(catalogPath,'utf8')):{schema_version:1,reports:{}};
const reportIds=new Map(reports.map(x=>[x.id,x]));
const full=p=>path.join(root,p);
const safeHttps=v=>/^https:\/\/[^\s<>"']+$/i.test(String(v||''));
const baseRoot=path.resolve(root,'assets/images/reports');
let referenced=0,checked=0;
if(catalog.schema_version!==1||typeof catalog.reports!=='object'||Array.isArray(catalog.reports))fail.push('data/report-images.json: invalid catalog schema');

function issue(label,msg){fail.push(label+': '+msg);}
function validateMedia(media,label,slug,localized=false){
  if(!media||typeof media!=='object'||media._invalid)return issue(label,'invalid image metadata');
  const parts=imagePathParts(media.src);
  if(!parts||parts.slug!==slug)return issue(label,'src must be a local image under /assets/images/reports/<report-slug>/');
  const file=path.resolve(root,parts.relative);
  if(!file.startsWith(baseRoot+path.sep))return issue(label,'asset path escaped repository image root');
  const width=Number(media.width),height=Number(media.height);
  if(!Number.isInteger(width)||width<64||width>10000||!Number.isInteger(height)||height<64||height>10000)issue(label,'invalid integer width or height');
  if(!supportedKinds.has(media.kind))issue(label,'kind must be a documented editorial-image type');
  if(!supportedLicenses.has(media.license))issue(label,'missing or unsupported SPDX-style image license code');
  if(!['original','third-party'].includes(media.origin))issue(label,'origin must be original or third-party');
  if(media.origin==='original'&&media.credit!=='LOGV / Marginal Thinking')issue(label,'original images must credit LOGV / Marginal Thinking');
  if(media.origin==='third-party'&&!safeHttps(media.source_url))issue(label,'third-party images require an HTTPS source_url');
  if(media.license==='PERMISSION'){
    const ref=String(media.permission_ref||'');
    if(!/^data\/media-permissions\/[a-z0-9/_-]+\.md$/.test(ref)||!fs.existsSync(full(ref)))issue(label,'permission-based image missing reviewed data/media-permissions record');
  }else if(!safeHttps(media.license_url))issue(label,'license_url must be an HTTPS license or public-domain record');
  if(!String(media.credit||'').trim()||String(media.credit).length>220)issue(label,'credit must name the author or rights holder');
  for(const key of ['alt','caption']){
    if(localized){
      if(!media[key]||typeof media[key]!=='object'||!['en','pt-BR'].every(l=>typeof media[key][l]==='string'&&media[key][l].trim().length>=20))issue(label,key+' must contain substantive en and pt-BR text');
    }else if(typeof media[key]!=='string'||media[key].trim().length<20)issue(label,key+' must be substantive prose');
  }
  const allowed=new Set(['src','width','height','kind','origin','alt','caption','credit','license','license_url','source_url','permission_ref']);
  for(const key of Object.keys(media))if(!allowed.has(key))issue(label,'unsupported image property '+key);
  if(!fs.existsSync(file))return issue(label,'missing image file '+parts.relative);
  if(!fs.statSync(file).isFile())return issue(label,'source asset is not a file');
  const size=fs.statSync(file).size;
  if(size>(parts.name.endsWith('.svg')?200000:4000000))issue(label,'image exceeds format-specific file-size budget');
  if(parts.name.endsWith('.svg')){
    const svg=fs.readFileSync(file,'utf8');
    if(!/^\s*<svg\b/.test(svg))issue(label,'invalid SVG root');
    if(/<\s*(?:script|foreignObject|iframe|object|embed|image)\b|(?:^|[\s<])on[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:|\/\/)|<!DOCTYPE|@import|url\s*\(\s*["']?\s*(?:https?:|data:)/i.test(svg))issue(label,'SVG contains executable, remote or embedded content');
    const w=svg.match(/<svg\b[^>]*\bwidth="(\d+)"/),h=svg.match(/<svg\b[^>]*\bheight="(\d+)"/);
    if(!w||!h||Number(w[1])!==width||Number(h[1])!==height)issue(label,'SVG intrinsic width/height differ from image metadata');
  }
  used.set(parts.relative,{width,height,label});
  referenced++;
  return parts;
}

for(const [id,value] of Object.entries(catalog.reports||{})){
  const item=reportIds.get(id);
  if(!item){issue(id,'media catalog references a non-public research ID');continue;}
  if(value.slug!==item.slug)issue(id,'catalog slug does not match canonical report slug');
  if(!value.lead)issue(id,'catalog entry missing lead image');
  else validateMedia(value.lead,id+'/lead',item.slug,true);
  for(const prop of Object.keys(value))if(!['slug','lead'].includes(prop))issue(id,'unsupported catalog property '+prop);
}
for(const item of reports){
  const signatures={};
  for(const locale of ['en','pt-BR']){
    const view=reportView(item,locale);
    if(!view?.markdown_url)continue;
    const md=fs.readFileSync(full(view.markdown_url.replace(/^\//,'')),'utf8');
    const blocks=imageBlocks(md);
    signatures[locale]=blocks.map(x=>x.src);
    blocks.forEach((img,i)=>validateMedia(img,item.id+'/'+locale+'/image-'+(i+1),item.slug));
    if(/!\[[^\]]*\]\((?:\/assets\/images\/reports\/|https?:\/\/)/.test(md))issue(item.id+'/'+locale,'use image fences, not raw Markdown image syntax');
    if(distMode){
      const prefix=locale==='pt-BR'?'pt-br/':'';
      const output=path.join(root,'dist',prefix,item.url.replace(/^\//,''));
      if(!fs.existsSync(output)){issue(item.id+'/'+locale,'missing rendered HTML');continue;}
      const html=fs.readFileSync(output,'utf8');
      const expected=[...(catalog.reports?.[item.id]?.lead?[catalog.reports[item.id].lead]:[]),...blocks];
      for(const [i,img] of expected.entries()){
        const parts=imagePathParts(img.src);
        if(!parts)continue;
        if(!html.includes('data-report-image="'+parts.name+'"'))issue(item.id+'/'+locale,'missing generated image figure '+parts.name);
        if(!html.includes('src="'+img.src+'"'))issue(item.id+'/'+locale,'wrong image URL '+img.src);
        if(!html.includes('class="report-image-credit"'))issue(item.id+'/'+locale,'missing image attribution');
        if(!fs.existsSync(path.join(root,'dist',parts.relative)))issue(item.id+'/'+locale,'asset was not copied to dist: '+parts.relative);
      }
    }
  }
  if(signatures.en&&signatures['pt-BR']&&JSON.stringify(signatures.en)!==JSON.stringify(signatures['pt-BR']))issue(item.id,'EN/PT-BR inline image sequence differs');
}
for(const [rel,meta] of used){
  if(rel.endsWith('.svg')){checked++;continue;}
  try{
    const info=await sharp(full(rel),{failOn:'error'}).metadata();
    if(info.width!==meta.width||info.height!==meta.height)issue(meta.label,'raster intrinsic dimensions differ from metadata');
    if(!['webp','png','jpeg','avif'].includes(info.format))issue(meta.label,'unsupported image binary format');
    if(info.pages&&info.pages>1)issue(meta.label,'animated images are not allowed in research');
    checked++;
  }catch(e){issue(meta.label,'unreadable raster: '+e.message);}
}
if(fail.length){console.error('Research image validation failed:\n- '+fail.join('\n- '));process.exit(1);}
console.log('Research image validation OK:',referenced,'figures referenced;',checked,'assets verified;',reports.length,'public report bundles;',distMode?'rendered assets checked':'source files checked');
