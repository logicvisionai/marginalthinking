export function canonicalizeAllowedUrl(input,canonicalHost='marginalthinking.org'){
  const url=new URL(input);
  const host=url.hostname.toLowerCase();
  if(host!==canonicalHost&&host!==`www.${canonicalHost}`)return null;
  let changed=false;
  if(url.protocol!=='https:'){url.protocol='https:';changed=true;}
  if(host!==canonicalHost){url.hostname=canonicalHost;url.port='';changed=true;}
  return changed?url.toString():null;
}
