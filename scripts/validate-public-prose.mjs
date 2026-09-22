import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist','reports');
if(!fs.existsSync(root)){console.error('FAIL dist/reports missing');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?walk(p):[p];
});
const strip=text=>String(text)
  .replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/https?:\/\/[^\s<)\]]+/g,' ')
  .replace(/&nbsp;|&#160;/g,' ');

const blockers=[
  ['research self-reference',/\b(?:este|esta|this)\s+(?:artigo|relat[oó]rio|an[aá]lise|avalia[cç][aã]o|pesquisa|article|report|analysis|assessment|research)\s+(?:mostra|apresenta|explica|examina|analisa|discute|reconstr[oó]i|shows|presents|explains|examines|analyses|analyzes|discusses|reconstructs|will|vai)\b/i],
  ['process narration',/\b(?:neste|nesta|nesse|nessa|in this)\s+(?:artigo|relat[oó]rio|an[aá]lise|avalia[cç][aã]o|pesquisa|article|report|analysis|assessment|research)\b/i],
  ['reader instruction',/\b(?:o leitor (?:deve|pode|ver[aá])|the reader (?:should|can|will see)|vamos (?:ver|analisar|examinar)|let['’]s (?:look|examine|analy[sz]e)|como vimos acima|as (?:we )?(?:saw|discussed) above)\b/i],
  ['internal QA language',/\b(?:quality assurance|controle de qualidade|revis[aã]o de qa|qa rework|qa review|staging|renderer|renderiza[cç][aã]o|publication pipeline|pipeline de publica[cç][aã]o|build process|processo de build|rejected draft|rascunho rejeitado|correction process|processo de corre[cç][aã]o)\b/i],
  ['internal architecture language',/\b(?:controlled series|s[eé]rie controlada|taxonomy version|vers[aã]o da taxonomia|dataset schema|schema do dataset|internal tool|ferramenta interna|editorial roadmap|roadmap editorial)\b/i],
  ['editorial roadmap language',/\b(?:next edition|pr[oó]xima edi[cç][aã]o|future version|vers[aã]o futura|we should add|devemos adicionar|should be added next|deve entrar em seguida)\b/i],
  ['git or deployment language',/\b(?:pull request|publication branch|branch de publica[cç][aã]o|deployment pipeline|pipeline de deploy)\b/i]
];

const failures=[];
for(const file of walk(root).filter(p=>/\.(?:html|md)$/i.test(p))){
  const rel=path.relative(process.cwd(),file).split(path.sep).join('/');
  const raw=fs.readFileSync(file,'utf8');
  const text=file.endsWith('.html')?strip(raw):raw.replace(/^\`\`\`[^\n]*\n[\s\S]*?^\`\`\`\s*$/gm,' ').replace(/https?:\/\/[^\s)\]]+/g,' ');
  for(const [label,re] of blockers){
    const m=text.match(re);
    if(m)failures.push(`${rel}: ${label}: "${m[0]}"`);
  }
}
if(failures.length){
  console.error(failures.map(x=>`FAIL ${x}`).join('\n'));
  process.exit(1);
}
console.log('Public-prose QA OK: no internal architecture, QA narration or conversational research phrasing in rendered reports.');
