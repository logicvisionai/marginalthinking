import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditSearchIndexability} from '../scripts/audit-search-indexability.mjs';

function fixture(options={}){
  const dist=fs.mkdtempSync(path.join(os.tmpdir(),'mt-seo-'));
  const base='https://marginalthinking.org';
  const en='/reports/2026/09/article';
  const pt='/pt-br/reports/2026/09/article';
  for(const p of [en,pt]){
    if(options.missing&&p===pt)continue;
    const f=path.join(dist,p.slice(1)+'.html');
    fs.mkdirSync(path.dirname(f),{recursive:true});
    const self=base+p;
    const other=base+(p===en?pt:en);
    const links='<link rel="alternate" hreflang="en" href="'+(options.nonreciprocal&&p===pt?self:base+en)+'">'+
      '<link rel="alternate" hreflang="pt-BR" href="'+(base+pt)+'">';
    const html='<html lang="'+(options.lang&&p===pt?'en':p===en?'en':'pt-BR')+'"><head>'+
      '<link rel="canonical" href="'+(options.wrong&&p===en?other:self)+'">'+
      '<meta name="robots" content="'+(options.noindex&&p===en?'noindex,follow':'index,follow')+'">'+
      links+'</head><body><h1>Research</h1></body></html>';
    fs.writeFileSync(f,html);
  }
  const sitemap='<urlset><url><loc>'+base+en+'</loc></url><url><loc>'+base+pt+'</loc></url></urlset>';
  fs.writeFileSync(path.join(dist,'sitemap.xml'),sitemap);
  return auditSearchIndexability({dist,siteUrl:base,importantPages:[]}).errors.join(' ');
}

test('valid bilingual canonical pages pass',()=>assert.equal(fixture(),''));
test('sitemap cannot include noindex',()=>assert.match(fixture({noindex:true}),/noindex/));
test('sitemap cannot include non-self canonical',()=>assert.match(fixture({wrong:true}),/canonical mismatch/));
test('sitemap cannot reference missing HTML',()=>assert.match(fixture({missing:true}),/missing HTML/));
test('hreflang must be reciprocal',()=>assert.match(fixture({nonreciprocal:true}),/nonreciprocal hreflang/));
test('localized HTML must match URL language',()=>assert.match(fixture({lang:true}),/html lang mismatch/));
