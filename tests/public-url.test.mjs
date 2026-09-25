import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalPublicPath,canonicalizePublicUrl,normalizePublicReferences} from '../scripts/lib/public-url.mjs';

const site='https://marginalthinking.org';

test('Cloudflare flat HTML routes are extensionless',()=>{
  assert.equal(canonicalPublicPath('/about.html'),'/about');
  assert.equal(canonicalPublicPath('/reports/2026/09/example.html'),'/reports/2026/09/example');
});
test('directory index routes keep their trailing slash',()=>{
  assert.equal(canonicalPublicPath('/index.html'),'/');
  assert.equal(canonicalPublicPath('/pt-br/index.html'),'/pt-br/');
  assert.equal(canonicalPublicPath('/research/coverage/index.html'),'/research/coverage/');
});
test('first-party scheme, host and HTML path normalize together',()=>{
  assert.equal(canonicalizePublicUrl('http://www.marginalthinking.org/about.html?x=1#top',site),'https://marginalthinking.org/about?x=1#top');
  assert.equal(canonicalizePublicUrl('/reports.html',site),'/reports');
});
test('foreign URLs and non-HTML resources remain unchanged',()=>{
  assert.equal(canonicalizePublicUrl('https://example.com/about.html',site),'https://example.com/about.html');
  assert.equal(canonicalizePublicUrl('/feed.xml',site),'/feed.xml');
});
test('generated references normalize in HTML, XML, JSON and text',()=>{
  const input='<a href="/about.html">About</a> <loc>http://www.marginalthinking.org/reports/a.html</loc> {"url":"/pt-br/index.html"}';
  const expected='<a href="/about">About</a> <loc>https://marginalthinking.org/reports/a</loc> {"url":"/pt-br/"}';
  assert.equal(normalizePublicReferences(input,site),expected);
});
