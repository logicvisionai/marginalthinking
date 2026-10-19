import fs from 'node:fs';

const base = (process.env.MT_PUBLIC_ORIGIN || 'https://marginalthinking.org').replace(/\/$/, '');
const sha = process.env.MT_EXPECTED_SHA || process.env.GITHUB_SHA;
if (!sha) throw new Error('Deployment SHA is required');

const reports = JSON.parse(fs.readFileSync('data/reports.json', 'utf8'));
const newest = reports.filter(r => r.kind === 'daily-global-macro').sort((a,b) => b.date.localeCompare(a.date))[0];
const oct18 = reports.find(r => r.id === 'MT-GM-2026-10-18');
if (!newest || !oct18) throw new Error('Latest or October 18 Global Macro missing from canonical index');
const targets = [...new Map([newest, oct18].map(r => [r.id, r])).values()];
const normalized = v => String(v).replace(/<[^>]*>/g,' ')
  .replace(/&(?:mdash|ndash);/g,'—').replace(/&amp;/g,'&')
  .replace(/&#(\d+);/g, (_,n) => String.fromCodePoint(Number(n)))
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').toLowerCase();

async function get(path) {
  const url = new URL(path, base);
  url.searchParams.set('_mt_sha', sha.slice(0,12));
  const response = await fetch(url, { redirect:'follow', headers:{'Cache-Control':'no-cache'}, signal:AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('GET ' + url + ' returned HTTP ' + response.status);
  return response.text();
}

async function verify() {
  const deployment = JSON.parse(await get('/deployment.json'));
  if (deployment.sha !== sha) throw new Error('Live commit ' + deployment.sha + ' differs from expected ' + sha);
  const archive = normalized(await get('/reports/'));
  for (const report of targets) {
    for (const [lang,prefix] of [['en',''],['pt-BR','/pt-br']]) {
      const marker = normalized(report.locales[lang].title.split('—').pop()).trim().slice(0,45);
      const route = prefix + report.url.replace(/\.html$/,'');
      const html = normalized(await get(route));
      if (!html.includes(marker)) throw new Error('Published title missing: ' + route);
      if (report.id === newest.id && lang === 'en' && !archive.includes(marker))
        throw new Error('Live archive does not contain newest Global Macro: ' + report.id);
      console.log('Verified ' + report.id + ' (' + lang + '): ' + route);
    }
  }
  console.log('Verified live domain ' + base + ' at commit ' + sha);
}

let last;
for (let attempt=1; attempt<=10; attempt++) {
  try { await verify(); process.exit(0); }
  catch(e) { last=e; console.error('Verification attempt ' + attempt + ': ' + e.message); }
  if (attempt<10) await new Promise(ok=>setTimeout(ok,8000));
}
throw new Error('PUBLICATION NOT VERIFIED: ' + last.message);
