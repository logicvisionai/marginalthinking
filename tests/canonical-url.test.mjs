import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalizePathname,canonicalizeAllowedUrl} from '../src/canonical-url.mjs';

test('canonical standalone aliases use existing .html canonicals',()=>{
  assert.equal(canonicalizePathname('/about'),'/about.html');
  assert.equal(canonicalizePathname('/about/'),'/about.html');
  assert.equal(canonicalizePathname('/pt-br/methodology'),'/pt-br/methodology.html');
});
test('report aliases consolidate to canonical .html path',()=>{
  assert.equal(canonicalizePathname('/reports/2026/09/foo'),'/reports/2026/09/foo.html');
  assert.equal(canonicalizePathname('/reports/2026/09/foo/'),'/reports/2026/09/foo.html');
  assert.equal(canonicalizePathname('/pt-br/reports/2026/09/foo'),'/pt-br/reports/2026/09/foo.html');
});
test('directory research routes get one trailing slash',()=>{
  assert.equal(canonicalizePathname('/regions'),'/regions/');
  assert.equal(canonicalizePathname('/countries/brazil'),'/countries/brazil/');
  assert.equal(canonicalizePathname('/what-is-marginal-thinking'),'/what-is-marginal-thinking/');
});
test('host, protocol and path consolidate in one redirect',()=>{
  assert.equal(canonicalizeAllowedUrl('http://www.marginalthinking.org/about?x=1'),'https://marginalthinking.org/about.html?x=1');
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/about.html'),null);
  assert.equal(canonicalizeAllowedUrl('https://example.com/about'),null);
});
