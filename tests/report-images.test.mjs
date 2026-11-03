import test from 'node:test';
import assert from 'node:assert/strict';
import {imagePathParts,parseImageBlock,imageBlocks,localizedImage,renderReportImage,isEditorialImageRetired} from '../scripts/lib/report-images.mjs';

const src='/assets/images/reports/2026-11-02-after-accelerationism-ai-labor-income-power/ai-productive-systems.svg';
const media={
  src,origin:'original',kind:'editorial-illustration',
  width:1600,height:900,credit:'LOGV / Marginal Thinking',license:'CC-BY-4.0',
  license_url:'https://creativecommons.org/licenses/by/4.0/',
  alt:{en:'Diagram of data centres, AI and people.', 'pt-BR':'Diagrama de centros de dados, IA e pessoas.'},
  caption:{en:'This is a conceptual illustration, not a measured dataset.', 'pt-BR':'Esta ilustração é conceitual e não representa dados medidos.'}
};
test('allow only local images within canonical report directories',()=>{
  assert.equal(imagePathParts(src)?.slug,'2026-11-02-after-accelerationism-ai-labor-income-power');
  for(const invalid of ['https://example.com/picture.jpg','//images.example.com/file.png','/assets/images/elsewhere.svg','/assets/images/reports/../file.jpg','/assets/images/reports/id/x.svg?cache=1','/assets/images/reports/id/name<script>.svg']){
    assert.equal(imagePathParts(invalid),null,invalid);
  }
});
test('HTML figures localize alt, caption, attribution and image loading',()=>{
  const en=renderReportImage(media,'en',{number:1,lead:true});
  const pt=renderReportImage(media,'pt-BR',{number:1,lead:true});
  assert.match(en,/Figure 1/);
  assert.match(en,/loading="eager"/);
  assert.match(en,/fetchpriority="high"/);
  assert.match(en,/Credit: LOGV \/ Marginal Thinking/);
  assert.match(pt,/Figura 1/);
  assert.match(pt,/Crédito: LOGV \/ Marginal Thinking/);
  assert.match(pt,/Ilustração/);
  assert.match(pt,/src="\/assets\/images\/reports\//);
  assert.match(pt,/alt="Diagrama de centros de dados, IA e pessoas/);
  assert.equal(renderReportImage({...media,src:'https://bad.example/x.png'},'en'), '');
  assert.equal(renderReportImage(media,'en',{expectedSlug:'different-slug'}), '');
});
test('image properties are escaped, not interpreted as HTML',()=>{
  const html=renderReportImage({...media,caption:{en:'Story <script>alert(1)</script>', 'pt-BR':'Texto seguro'}},'en');
  assert(!html.includes('<script>'));
  assert(html.includes('&lt;script&gt;'));
});
test('inline image fenced blocks parse without interfering with ordinary charts',()=>{
  const fence=String.fromCharCode(96).repeat(3);
  const md=fence+'chart\nA | 5\n'+fence+'\n\n'+fence+'image\nsrc: '+src+'\ncaption: A detailed editorial diagram\nalt: AI infrastructure diagram\ncredit: LOGV / Marginal Thinking\n'+fence+'\n';
  const blocks=imageBlocks(md);
  assert.equal(blocks.length,1);
  assert.equal(blocks[0].src,src);
  assert.equal(blocks[0].caption,'A detailed editorial diagram');
  assert.equal(parseImageBlock(['foo: a','foo: b'])._invalid,true);
  assert.equal(localizedImage(media,'pt-BR').alt,'Diagrama de centros de dados, IA e pessoas.');
});

test('retired abstract editorial image is omitted from public presentation while approved sources are preserved',()=>{
  const retired={...media,src:'/assets/images/reports/2026-11-03-algorithmic-revolution-attention-power-social-conflict/recommendation-feedback.svg'};
  assert.equal(isEditorialImageRetired(retired),true);
  assert.equal(renderReportImage(retired,'pt-BR',{expectedSlug:'2026-11-03-algorithmic-revolution-attention-power-social-conflict'}),'');
  assert.equal(isEditorialImageRetired(media),false);
});
