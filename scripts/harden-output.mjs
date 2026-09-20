import fs from 'node:fs';
import path from 'node:path';

const cwd=process.cwd();
const root=path.join(cwd,'dist');
if(!fs.existsSync(root)){console.error('FAIL dist ausente para hardening');process.exit(1);}
const cfg=JSON.parse(fs.readFileSync(path.join(cwd,'site.config.json'),'utf8'));
const canonicalHost=new URL(cfg.site_url).hostname.toLowerCase();
const internalHosts=new Set([canonicalHost,canonicalHost.startsWith('www.')?canonicalHost.slice(4):`www.${canonicalHost}`]);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const bundledStyles=[
  '/assets/css/report-data.css',
  '/assets/css/research-static.css',
  '/assets/css/language-switch.css',
  '/assets/css/layout-guardrails.css',
  '/assets/css/mobile-nav-fix.css',
  '/assets/css/institutional-premium.css',
  '/assets/css/theme.css'
];
const rxEsc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function bundleCoreStyles(){
  const core=path.join(root,'assets/css/styles.css');
  if(!fs.existsSync(core))throw new Error('styles.css ausente para bundle crítico');
  let css=fs.readFileSync(core,'utf8');
  for(const href of bundledStyles){
    const file=path.join(root,href.replace(/^\//,''));
    if(!fs.existsSync(file))continue;
    css+=`\n\n/* bundled: ${path.basename(file)} */\n${fs.readFileSync(file,'utf8')}\n`;
  }
  fs.writeFileSync(core,css);
}

function optimizeHeadAssets(html){
  let out=html;
  for(const href of bundledStyles){
    const rx=new RegExp(`<link\\b[^>]*href=(["'])${rxEsc(href)}\\1[^>]*>`,'gi');
    out=out.replace(rx,'');
  }
  out=out.replace(/<script\s+src="\/assets\/js\/app\.js"\s*><\/script>/gi,'<script defer src="/assets/js/app.js"></script>');
  if(out.includes('data-research-visual=')){
    if(!out.includes('href="/assets/css/research-visuals.css"'))out=out.replace('</head>','<link rel="stylesheet" href="/assets/css/research-visuals.css"></head>');
    if(!out.includes('src="/assets/js/research-visuals.js"'))out=out.replace('</body>','<script type="module" src="/assets/js/research-visuals.js"></script></body>');
  }
  return out;
}
function normalizeNativeListMarkers(html){
  let out=html;
  out=out.replace(/<ol(\s[^>]*)?>([\s\S]*?)<\/ol>/gi,(all,attrs='',body)=>{
    const cleaned=body.replace(/<li([^>]*)>(\s*)(?:(?:\d+[.)]\s+)+)/gi,'<li$1>$2');
    return `<ol${attrs||''}>${cleaned}</ol>`;
  });
  out=out.replace(/<ul(\s[^>]*)?>([\s\S]*?)<\/ul>/gi,(all,attrs='',body)=>{
    const cleaned=body.replace(/<li([^>]*)>(\s*)(?:(?:[-+*•]\s+)+)/gi,'<li$1>$2');
    return `<ul${attrs||''}>${cleaned}</ul>`;
  });
  return out;
}
function hrefFromAnchor(tag){
  const m=tag.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  return m?(m[1]??m[2]??m[3]??''):'';
}
function isExternalHref(href){
  const value=String(href||'').trim();
  if(!value||value.startsWith('#')||value.startsWith('/')||value.startsWith('./')||value.startsWith('../'))return false;
  if(/^(?:mailto|tel|sms|javascript|data):/i.test(value))return false;
  try{
    const u=value.startsWith('//')?new URL(`https:${value}`):new URL(value);
    if(!/^https?:$/.test(u.protocol))return false;
    return !internalHosts.has(u.hostname.toLowerCase());
  }catch{return false;}
}
function setAttr(tag,name,value){
  const quoted=new RegExp(`\\s${name}\\s*=\\s*(["'])[^"']*\\1`,'i');
  const unquoted=new RegExp(`\\s${name}\\s*=\\s*[^\\s>]+`,'i');
  if(quoted.test(tag))return tag.replace(quoted,` ${name}="${value}"`);
  if(unquoted.test(tag))return tag.replace(unquoted,` ${name}="${value}"`);
  return tag.replace(/>$/,` ${name}="${value}">`);
}
function enforceExternalLinkPolicy(html){
  return html.replace(/<a\b[^>]*>/gi,tag=>{
    const href=hrefFromAnchor(tag);
    if(!isExternalHref(href))return tag;
    let out=setAttr(tag,'target','_blank');
    const relMatch=out.match(/\srel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relTokens=new Set(String(relMatch?.[1]??relMatch?.[2]??relMatch?.[3]??'').split(/\s+/).filter(Boolean));
    relTokens.add('noopener');
    relTokens.add('noreferrer');
    out=setAttr(out,'rel',[...relTokens].join(' '));
    return out;
  });
}

bundleCoreStyles();
let changed=0;
for(const file of walk(root).filter(x=>x.endsWith('.html'))){
  const before=fs.readFileSync(file,'utf8');
  const after=enforceExternalLinkPolicy(normalizeNativeListMarkers(optimizeHeadAssets(before)));
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}
console.log(`Output hardening OK: ${changed} HTML pages normalized; core CSS consolidated and noncritical scripts deferred.`);
