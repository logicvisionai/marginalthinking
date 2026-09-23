import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalizeAllowedUrl} from '../src/canonical-url.mjs';

test('worker canonicalization only normalizes scheme and host',()=>{
  assert.equal(
    canonicalizeAllowedUrl('http://www.marginalthinking.org/pt-br/reports/2026/09/report?x=1'),
    'https://marginalthinking.org/pt-br/reports/2026/09/report?x=1'
  );
});
test('worker does not fight Cloudflare static-assets HTML routing',()=>{
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/about'),null);
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/about.html'),null);
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/pt-br/reports/2026/09/report'),null);
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/pt-br/reports/2026/09/report.html'),null);
});
test('foreign hosts are not rewritten',()=>{
  assert.equal(canonicalizeAllowedUrl('https://example.com/about'),null);
});
