import {esc} from './markup.mjs';

export const supportedLicenses = new Set(['CC-BY-4.0','CC-BY-SA-4.0','CC0-1.0','PUBLIC-DOMAIN','PERMISSION']);
export const supportedKinds = new Set(['editorial-illustration','documentary-photograph','archival-image','data-visualization']);
export const imageRoot = '/assets/images/reports/';
const pathPattern = /^\/assets\/images\/reports\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:[-_][a-z0-9]+)*\.(?:webp|png|jpe?g|avif|svg))$/;

export function imagePathParts(src) {
  const m=String(src||'').match(pathPattern);
  return m?{slug:m[1],name:m[2],relative:m[0].slice(1)}:null;
}

export function parseImageBlock(lines=[]) {
  const result={};
  for(const line of lines){
    if(!line.trim())continue;
    const m=line.match(/^([a-z][a-z0-9_]*):\s*(.+?)\s*$/i);
    if(!m){result._invalid=true;continue;}
    const key=m[1].toLowerCase();
    if(Object.prototype.hasOwnProperty.call(result,key))result._invalid=true;
    result[key]=m[2];
  }
  return result;
}

export function imageBlocks(markdown=''){
  const fence=String.fromCharCode(96).repeat(3);
  const pattern=new RegExp('^'+fence+'image\\s*\\n([\\s\\S]*?)^'+fence+'\\s*$','gm');
  return [...String(markdown).matchAll(pattern)].map(m=>parseImageBlock(m[1].split('\n')));
}

export function localizedImage(media,locale='en'){
  if(!media)return null;
  return {...media,alt:typeof media.alt==='object'?media.alt[locale]:media.alt,caption:typeof media.caption==='object'?media.caption[locale]:media.caption};
}

const kindLabels={
'en':{'editorial-illustration':'Editorial illustration','documentary-photograph':'Documentary photograph','archival-image':'Archival image','data-visualization':'Data visualization'},
'pt-BR':{'editorial-illustration':'Ilustração editorial','documentary-photograph':'Fotografia documental','archival-image':'Imagem de arquivo','data-visualization':'Visualização de dados'}
};
const textLabels={'en':{figure:'Figure',credit:'Credit',source:'Source',license:'License'},'pt-BR':{figure:'Figura',credit:'Crédito',source:'Fonte',license:'Licença'}};

// Editorial retraction: these abstract figures add no verifiable information and are not shown in public HTML.
// Approved report source Markdown remains unchanged for auditability.
export const retiredEditorialImagePaths = new Set([
  "/assets/images/reports/2026-11-03-algorithmic-revolution-attention-power-social-conflict/recommendation-feedback.svg",
  "/assets/images/reports/2026-11-03-algorithmic-revolution-attention-power-social-conflict/camera-performance.svg",
  "/assets/images/reports/2026-11-03-rockbridge-network-capital-political-power-brazil/rockbridge-organisational-infrastructure.svg",
  "/assets/images/reports/2026-11-03-rockbridge-network-capital-political-power-brazil/rockbridge-documentary-boundaries.svg"
]);
export function isEditorialImageRetired(input){
  return input?.kind==='editorial-illustration' && retiredEditorialImagePaths.has(String(input?.src||''));
}

export function renderReportImage(input,locale='en',{number=1,lead=false,expectedSlug}={}){
  if(isEditorialImageRetired(input))return '';
  const image=localizedImage(input,locale),parts=imagePathParts(image?.src);
  if(!parts||(expectedSlug&&parts.slug!==expectedSlug))return '';
  const width=Number(image.width),height=Number(image.height);
  if(!Number.isInteger(width)||width<64||width>10000||!Number.isInteger(height)||height<64||height>10000)return '';
  if(!String(image.alt||'').trim()||!String(image.caption||'').trim()||!String(image.credit||'').trim())return '';
  if(!supportedKinds.has(image.kind)||!supportedLicenses.has(image.license))return '';
  const L=textLabels[locale]||textLabels.en,source=String(image.source_url||'');
  const license=String(image.license_url||'');
  const safeUrl=u=>/^https:\/\/[^\s<>"']+$/i.test(u);
  const sourceHtml=safeUrl(source)?' · <a href="'+esc(source)+'" rel="noopener noreferrer">'+esc(L.source)+'</a>':'';
  const licenseHtml=safeUrl(license)?'<a href="'+esc(license)+'" rel="noopener noreferrer">'+esc(image.license)+'</a>':esc(image.license);
  const kind=kindLabels[locale]?.[image.kind]||kindLabels.en[image.kind];
  const loading=lead?'eager':'lazy';
  return '<figure class="report-image'+(lead?' report-image--lead':'')+'" data-report-image="'+esc(parts.name)+'"><div class="report-image-frame"><img src="'+esc(image.src)+'" alt="'+esc(image.alt)+'" width="'+width+'" height="'+height+'" loading="'+loading+'" decoding="async"'+(lead?' fetchpriority="high"':'')+'></div><figcaption><span class="report-image-label">'+esc(L.figure)+' '+number+' · '+esc(kind)+'</span><span class="report-image-caption">'+esc(image.caption)+'</span><span class="report-image-credit">'+esc(L.credit)+': '+esc(image.credit)+' · '+esc(L.license)+': '+licenseHtml+sourceHtml+'</span></figcaption></figure>';
}
