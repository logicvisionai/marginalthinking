import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalizeAllowedUrl} from '../src/canonical-url.mjs';

test('worker canonicalization normalizes scheme, host and legacy HTML route in one hop',()=>{
  assert.equal(
    canonicalizeAllowedUrl('http://www.marginalthinking.org/pt-br/reports/2026/09/report.html?x=1'),
    'https://marginalthinking.org/pt-br/reports/2026/09/report?x=1'
  );
});

test('worker canonicalizes flat HTML and directory index routes',()=>{
  assert.equal(
    canonicalizeAllowedUrl('https://marginalthinking.org/about.html'),
    'https://marginalthinking.org/about'
  );
  assert.equal(
    canonicalizeAllowedUrl('https://marginalthinking.org/index.html'),
    'https://marginalthinking.org/'
  );
  assert.equal(
    canonicalizeAllowedUrl('https://marginalthinking.org/pt-br/index.html'),
    'https://marginalthinking.org/pt-br/'
  );
  assert.equal(
    canonicalizeAllowedUrl('https://marginalthinking.org/research/coverage/index.html'),
    'https://marginalthinking.org/research/coverage/'
  );
});

test('already canonical public routes are left untouched',()=>{
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/about'),null);
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/pt-br/reports/2026/09/report'),null);
  assert.equal(canonicalizeAllowedUrl('https://marginalthinking.org/research/coverage/'),null);
});

test('foreign hosts are not rewritten',()=>{
  assert.equal(canonicalizeAllowedUrl('https://example.com/about.html'),null);
});
