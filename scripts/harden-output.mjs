import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist ausente para hardening');process.exit(1);}
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});
const styles=['/assets/css/language-switch.css','/assets/css/layout-guardrails.css','/assets/css/mobile-nav-fix.css','/assets/css/institutional-premium.css','/assets/css/theme.css'];

function injectStyles(html){
  let out=html;
  for(const href of styles){
    if(!out.includes(`href="${href}"`))out=out.replace('</head>',`<link rel="stylesheet" href="${href}"></head>`);
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

let changed=0;
for(const file of walk(root).filter(x=>x.endsWith('.html'))){
  const before=fs.readFileSync(file,'utf8');
  const after=normalizeNativeListMarkers(injectStyles(before));
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}
console.log(`Output hardening OK: ${changed} HTML pages normalized/injected.`);
