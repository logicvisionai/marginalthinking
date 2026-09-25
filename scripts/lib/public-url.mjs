const rxEsc=s=>String(s).replace(/[.*+?^\${}()|[\\]\\]/g,'\\$&');

export function canonicalPublicPath(pathname='/'){
  let p=String(pathname||'/');
  if(!p.startsWith('/'))p=`/${p}`;
  if(p==='/index.html')return'/';
  if(p.endsWith('/index.html'))return p.slice(0,-'index.html'.length);
  if(p.endsWith('.html'))return p.slice(0,-'.html'.length);
  return p;
}

export function canonicalizePublicUrl(value,siteUrl){
  const raw=String(value??'');
  const isAbsolute=/^https?:\/\//i.test(raw),isRootRelative=raw.startsWith('/');
  if(!isAbsolute&&!isRootRelative)return raw;

  const site=new URL(siteUrl),baseHost=site.hostname.toLowerCase().replace(/^www\./,'');
  let url;try{url=new URL(raw,site);}catch{return raw;}
  const host=url.hostname.toLowerCase();
  if(host!==baseHost&&host!==`www.${baseHost}`)return raw;

  url.protocol='https:';
  url.hostname=site.hostname;
  url.port='';
  url.pathname=canonicalPublicPath(url.pathname);
  const relative=`${url.pathname}${url.search}${url.hash}`;
  return isAbsolute?`${site.origin}${relative}`:relative;
}

export function normalizePublicReferences(text,siteUrl){
  const site=new URL(siteUrl),baseHost=site.hostname.toLowerCase().replace(/^www\./,'');
  const hostRx=rxEsc(baseHost);
  let out=String(text??'');

  const absoluteRx=new RegExp(`https?:\\/\\/(?:www\\.)?${hostRx}(?::\\d+)?(?:\\/[^\\s"'<>)]*)?`,'gi');
  out=out.replace(absoluteRx,raw=>canonicalizePublicUrl(raw,siteUrl));

  const quotedRootHtmlRx=/(["'])(\/[^"'<>]*?\.html(?:[?#][^"'<>]*)?)\1/g;
  out=out.replace(quotedRootHtmlRx,(all,quote,url)=>`${quote}${canonicalizePublicUrl(url,siteUrl)}${quote}`);
  return out;
}
