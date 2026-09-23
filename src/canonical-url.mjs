const STATIC_HTML_ALIASES=new Set(['/about','/methodology','/reports','/search']);
const DIRECTORY_ROOTS=[
  '/research','/regions','/countries','/topics','/series','/actors','/dependencies',
  '/resource-control','/policy-cases','/opportunities','/workspace','/data',
  '/mcp-docs','/system-status','/what-is-marginal-thinking'
];

export function canonicalizePathname(pathname){
  const p=String(pathname||'/').replace(/\/{2,}/g,'/');
  if(p==='/index.html')return'/';
  if(p==='/pt-br'||p==='/pt-br/index.html')return'/pt-br/';
  const hasLocale=p==='/pt-br'||p.startsWith('/pt-br/');
  const locale=hasLocale?'/pt-br':'';
  const local=locale?p.slice(locale.length):p;
  const staticBase=local.replace(/\/$/,'');
  if(STATIC_HTML_ALIASES.has(staticBase))return locale+staticBase+'.html';
  const report=local.match(/^\/reports\/(\d{4})\/(\d{2})\/([^/.]+)\/?$/);
  if(report)return locale+`/reports/${report[1]}/${report[2]}/${report[3]}.html`;
  if(!local.endsWith('/')&&!/\.[a-z0-9]+$/i.test(local)&&DIRECTORY_ROOTS.some(root=>local===root||local.startsWith(root+'/'))){
    return locale+local+'/';
  }
  return p;
}

export function canonicalizeAllowedUrl(input,canonicalHost='marginalthinking.org'){
  const url=new URL(input);
  const host=url.hostname.toLowerCase();
  if(host!==canonicalHost&&host!==`www.${canonicalHost}`)return null;
  let changed=false;
  if(url.protocol!=='https:'){url.protocol='https:';changed=true;}
  if(host!==canonicalHost){url.hostname=canonicalHost;url.port='';changed=true;}
  const nextPath=canonicalizePathname(url.pathname);
  if(nextPath!==url.pathname){url.pathname=nextPath;changed=true;}
  return changed?url.toString():null;
}
