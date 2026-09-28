function canonicalHtmlPath(pathname){
  const lower=pathname.toLowerCase();
  if(lower.endsWith('/index.html'))return pathname.slice(0,-'index.html'.length);
  if(lower.endsWith('.html'))return pathname.slice(0,-'.html'.length)||'/';
  return pathname;
}

export function canonicalizeAllowedUrl(input,canonicalHost='marginalthinking.org'){
  const url=new URL(input);
  const host=url.hostname.toLowerCase();
  if(host!==canonicalHost&&host!==`www.${canonicalHost}`)return null;
  let changed=false;
  if(url.protocol!=='https:'){url.protocol='https:';changed=true;}
  if(host!==canonicalHost){url.hostname=canonicalHost;url.port='';changed=true;}
  const pathname=canonicalHtmlPath(url.pathname);
  if(pathname!==url.pathname){url.pathname=pathname;changed=true;}
  return changed?url.toString():null;
}
