import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {collectReports,reportView,availableLocales} from './lib/reports.mjs';

const root=process.cwd(),dist=path.join(root,'dist'),reports=collectReports(root),cfg=JSON.parse(fs.readFileSync('site.config.json','utf8'));
const network=JSON.parse(fs.readFileSync('data/global-dependencies.json','utf8'));
const taxonomy=JSON.parse(fs.readFileSync('data/taxonomy.json','utf8'));
const fromUrl=url=>path.join(dist,url.split(/[?#]/)[0].replace(/\/$/,'/index.html').replace(/^\//,''));
for(const locale of Object.keys(cfg.locales)){
  const prefix=cfg.locales[locale].path?`/${cfg.locales[locale].path}`:'';
  const home=fs.readFileSync(fromUrl(`${prefix}/`),'utf8'),workspace=fs.readFileSync(fromUrl(`${prefix}/workspace/`),'utf8');
  const data=JSON.parse(workspace.match(/<script id="research-catalog" type="application\/json">([\s\S]*?)<\/script>/)?.[1]||'null');
  assert(data,`${locale}: missing workspace catalog`);
  const expected=reports.filter(r=>availableLocales(r).includes(locale));
  assert.equal(new Set(data.items.map(r=>r.id)).size,expected.length,`${locale}: canonical IDs must not count translations twice`);
  assert.equal(data.items.length,expected.length);
  for(const r of expected){
    const actual=data.items.find(x=>x.id===r.id),view=reportView(r,locale);
    for(const [key,field] of [['title','title'],['deck','deck'],['regime','regime'],['risk','key_risk']])assert.equal(actual[key],view[field]||'',`${r.id}/${locale}: ${key} must retain canonical wording`);
    assert.deepEqual(actual.watch,view.watch||[],`${r.id}/${locale}: watch items must retain canonical wording`);
    assert.equal(actual.url,`${prefix}${r.url}`);assert(fs.existsSync(fromUrl(actual.url)));
    for(const link of actual.connections){
      assert(fs.existsSync(fromUrl(link.url)),`${r.id}: missing connection destination`);
      if(link.url.includes('/dependencies/'))assert(network.edges.some(e=>e.id===link.url.split('#relation-')[1]&&e.research_ids?.includes(r.id)),`${r.id}: connection must be explicitly supported`);
    }
  }
  assert.equal((home.match(/<h1\b/g)||[]).length,1);
  assert(!home.includes('class="home-grid"'),`${locale}: old uneven columns must not return`);
  const entryPoints=['/workspace/','/dependencies/','/opportunities/',...Object.keys(taxonomy.series||{}).map(id=>`/series/${id}/`)];
  for(const url of entryPoints)assert(home.includes(`href="${prefix}${url}"`),`${locale}: missing entry point ${url}`);
  for(const file of [home,workspace])for(const match of file.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
    const url=match[1];if(url.startsWith('//'))continue;
    assert(fs.existsSync(fromUrl(url)),`${locale}: missing local destination ${url}`);
  }
  assert(workspace.includes('name="robots" content="noindex,follow'),`${locale}: personal/query workspace must not be indexed`);
}
console.log(`Research product validation OK: ${reports.length} canonical items, bilingual fields, explicit network links, home routes and workspace integrity.`);
