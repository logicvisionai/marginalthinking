import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist ausente para limpeza editorial final');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

// Final safety net for Portuguese public output. Earlier normalizers handle
// sentence-level rewrites; this pass catches residual variants generically.
const rules=[
  [/preço de controle do sistema/gi,'principal referência para o custo de capital'],
  [/quem controla os gargalos necessários/gi,'quem controla os recursos, infraestruturas e capacidades críticas necessários'],
  [/controle de gargalos/gi,'controle de etapas críticas da cadeia'],
  [/concentração de gargalos/gi,'concentração de etapas críticas da cadeia'],
  [/funil causal/gi,'cadeia de transmissão'],
  [/gargalo marginal/gi,'principal restrição'],
  [/principal reservatório financeiro/gi,'principal centro financeiro'],
  [/claims bancários cross-border/gi,'ativos bancários transfronteiriços'],
  [/\bcollateral\b/gi,'garantias financeiras'],
  [/\bmidstream\b/gi,'processamento intermediário'],
  [/captura desigual do valor/gi,'distribuição desigual da renda gerada'],
  [/poder de captura de renda/gi,'capacidade de receber uma parcela maior da renda'],
  [/\bclaims\b/gi,'ativos ou direitos financeiros'],
  [/\bcross-asset\b/gi,'entre classes de ativos'],
  [/\bfunding\b/gi,'financiamento'],
  [/\brepricing\b/gi,'reprecificação'],
  [/\bterm premium\b/gi,'prêmio de prazo'],
  [/\bsmall caps\b/gi,'ações de empresas de menor capitalização'],
  [/\bprivate credit\b/gi,'crédito privado'],
  [/\butilities\b/gi,'empresas de serviços públicos'],
  [/\bupstream\b/gi,'exploração e produção']
];

const apply=text=>rules.reduce((out,[rx,to])=>out.replace(rx,to),text);

function cleanHtml(text){
  const protectedBlock=/(<(?:script|style|pre|code)\b[\s\S]*?<\/(?:script|style|pre|code)>|<[^>]+>)/gi;
  return text.split(protectedBlock).map(part=>part.startsWith('<')?part:apply(part)).join('');
}

function cleanMarkdown(text){
  return text.split(/(```[\s\S]*?```)/g).map(part=>{
    if(part.startsWith('```')) return part;
    return part.split(/(https?:\/\/[^\s<>"')\]]+)/g).map(piece=>/^https?:\/\//.test(piece)?piece:apply(piece)).join('');
  }).join('');
}

function shouldClean(rel){
  if(rel.startsWith('pt-br/')&&rel.endsWith('.html')) return true;
  if(/^reports\/\d{4}\/\d{2}\/[^/]+\.md$/i.test(rel)) return true;
  if(rel.endsWith('/pt-BR.md')) return true;
  return false;
}

let changed=0;
for(const file of walk(root)){
  const rel=path.relative(root,file).split(path.sep).join('/');
  if(!shouldClean(rel)) continue;
  const before=fs.readFileSync(file,'utf8');
  const after=rel.endsWith('.html')?cleanHtml(before):cleanMarkdown(before);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}

console.log(`Final editorial cleanup OK: ${changed} Portuguese public files adjusted.`);
