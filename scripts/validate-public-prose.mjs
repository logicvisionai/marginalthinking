import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const effective='2026-09-22';
const failures=[];

const walk=dir=>!fs.existsSync(dir)?[]:fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?walk(p):[p];
});
const rel=p=>path.relative(root,p).split(path.sep).join('/');
const dateOf=p=>rel(p).match(/(20\d{2}-\d{2}-\d{2})/)?.[1]||'';
const localeOf=p=>/\/pt-BR\.md$/i.test(rel(p))||/\/pt-br\//i.test(rel(p))?'pt-BR':'en';

function visibleMarkdown(text){
  return text
    .replace(/\`\`\`[\s\S]*?\`\`\`/g,' ')
    .replace(/https?:\/\/[^\s)\]]+/g,' ')
    .replace(/^##\s+Sources?[\s\S]*$/gmi,' ')
    .replace(/^##\s+Fontes[\s\S]*$/gmi,' ');
}

const rules={
  en:[
    ['self-referential publication prose',/\b(?:this|the)\s+(?:report|article|publication|piece)\s+(?:shows?|demonstrates?|explains?|examines?|analys(?:es|is)|tracks?|maps?|argues?|presents?)\b/i],
    ['self-referential section prose',/\b(?:in|within)\s+this\s+(?:report|article|publication|section)\b/i],
    ['reader instruction',/\b(?:the|a)\s+reader\s+(?:should|can|may|must|will)\b/i],
    ['conversational first-person scaffold',/\b(?:we\s+(?:will|shall|now)\s+(?:examine|analyse|analyze|show|discuss|track|look at)|let\s+us|let['’]s)\b/i],
    ['formulaic conversational scaffold',/\b(?:the\s+(?:key|important|central)\s+question\s+is|what\s+matters\s+is|it\s+is\s+(?:important|worthwhile)\s+to\s+note|it\s+is\s+worth\s+noting|put\s+differently|in\s+other\s+words)\b/i],
    ['internal product operations',/\bMarginal\s+Thinking\s+(?:is|will\s+be|has\s+been)\s+(?:building|creating|developing|updating|operating|maintaining|populating)\b/i],
    ['publishing architecture leakage',/\b(?:editorial|publication|publishing|research)\s+(?:pipeline|workflow|architecture)\b/i],
    ['internal QA leakage',/\b(?:QA\s+(?:gate|check|status|review)|producer\s+agent|publisher\s+agent|pending\s+sidecar|staging\s+source|publication\s+bundle|renderer\s+pipeline|LLM\s+prompt)\b/i],
    ['methodology boilerplate',/\bprimary\s+(?:documents|sources|data).{0,90}\bobservable\s+facts?\b/i],
    ['methodology boilerplate',/\bprestige\s+does\s+not\s+replace\s+evidence\b/i]
  ],
  'pt-BR':[
    ['metadiscurso da publicação',/\b(?:este|o)\s+(?:relat[oó]rio|artigo|texto)\s+(?:mostra|demonstra|explica|examina|analisa|acompanha|mapeia|apresenta)\b/i],
    ['metadiscurso da publicação',/\b(?:neste|nesse)\s+(?:relat[oó]rio|artigo|texto|cap[ií]tulo|trecho)\b/i],
    ['instrução ao leitor',/\b(?:o|um)\s+leitor\s+(?:deve|pode|precisa|ver[aá]|encontrar[aá])\b/i],
    ['andaime conversacional em primeira pessoa',/\b(?:vamos\s+(?:analisar|examinar|ver|discutir|acompanhar|mapear)|analisaremos|examinaremos|veremos\s+agora)\b/i],
    ['andaime conversacional formulaico',/\b(?:a\s+pergunta\s+(?:central|principal|importante)\s+[ée]|o\s+que\s+importa\s+[ée]|[ée]\s+importante\s+(?:notar|destacar|observar)|vale\s+(?:a\s+pena\s+)?(?:notar|destacar|observar)|em\s+outras\s+palavras|dito\s+de\s+outra\s+forma)\b/i],
    ['operação interna do produto',/\bMarginal\s+Thinking\s+(?:est[aá]|vai\s+ser|vem\s+sendo)\s+(?:construindo|criando|desenvolvendo|atualizando|operando|mantendo|populando)\b/i],
    ['vazamento de arquitetura editorial',/\b(?:arquitetura|pipeline|fluxo)\s+(?:editorial|de\s+publica[cç][aã]o|da\s+publica[cç][aã]o|de\s+pesquisa)\b/i],
    ['vazamento de QA interno',/\b(?:QA\s+(?:editorial|de\s+publica[cç][aã]o|gate|status)|agente\s+(?:produtor|publicador)|sidecar\s+pendente|fonte\s+de\s+staging|bundle\s+de\s+publica[cç][aã]o|prompt\s+de\s+IA)\b/i],
    ['boilerplate metodológico',/\b(?:documentos|fontes|dados)\s+prim[aá]ri[oa]s?.{0,90}\bfatos?\s+observ[aá]veis?\b/i],
    ['boilerplate metodológico',/\bprest[ií]gio\s+n[aã]o\s+substitui\s+evid[eê]ncia\b/i]
  ]
};

const candidates=[
  ...walk(path.join(root,'reports')),
  ...walk(path.join(root,'staging','research'))
].filter(p=>p.endsWith('.md')&&dateOf(p)>=effective);

for(const file of candidates){
  const locale=localeOf(file),text=visibleMarkdown(fs.readFileSync(file,'utf8'));
  for(const [label,re] of rules[locale]){
    const m=text.match(re);
    if(m)failures.push(`${rel(file)}: ${label}: "${m[0].replace(/\s+/g,' ').trim()}"`);
  }
}

if(failures.length){
  console.error(failures.map(x=>`FAIL ${x}`).join('\n'));
  process.exit(1);
}
console.log(`Public prose validation OK: ${candidates.length} EN/PT-BR Markdown file(s) dated ${effective} or later.`);
