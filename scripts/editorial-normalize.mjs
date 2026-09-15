import fs from 'node:fs';
import path from 'node:path';

const root=path.join(process.cwd(),'dist');
if(!fs.existsSync(root)){console.error('FAIL dist ausente para normalização editorial');process.exit(1);}

const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];});

// Correções editoriais de formulações já presentes no acervo. O objetivo é
// preservar fatos, números e conclusões, mas explicitar o mecanismo econômico.
const replacements=[
  ['O sistema global está sendo conduzido por um funil causal relativamente claro. A primeira camada é física: ataques e interrupções na infraestrutura energética saudita reduziram a redundância disponível para contornar o Estreito de Hormuz. A segunda é nominal: Brent voltou à região de US$107–108 e elevou o risco de inflação de combustíveis, frete e produção. A terceira é monetária: o Treasury de 10 anos superou 5% e o mercado passou a tratar uma alta de 25 pb pelo Fed como cenário amplamente dominante. A quarta é financeira: dólar se fortalece, tecnologia e small caps sofrem com duration e custo de capital, enquanto ouro não funciona plenamente como hedge porque yields reais/nominais altos competem com o metal. A quinta é política: governos precisam escolher entre absorver o choque via subsídios/fiscal, permitir repasse de preços ou tolerar desaceleração maior.','A transmissão do choque pode ser descrita de forma direta. Ataques e interrupções na infraestrutura energética saudita reduziram as rotas alternativas ao Estreito de Hormuz. O Brent voltou à região de US$107–108, elevando custos de combustível, transporte e produção e, com isso, o risco de inflação. Diante desse quadro, o Treasury de 10 anos superou 5% e o mercado passou a considerar uma alta de 25 pb pelo Fed como o cenário mais provável. Juros mais altos fortalecem o dólar e pressionam principalmente ações sensíveis ao custo de capital. O ouro, por sua vez, recebe menos demanda como proteção quando títulos oferecem rendimentos elevados. Para os governos, a escolha passa a ser entre deixar o aumento de custos chegar ao consumidor, absorver parte dele por meio de medidas fiscais ou aceitar uma desaceleração maior da atividade.'],
  ['A tese central é que **o mundo está pagando mais caro simultaneamente por energia, dinheiro e segurança**. O petróleo representa a camada física; o Treasury acima de 5%, a camada financeira; defesa, autonomia tecnológica e rotas estratégicas, a camada política. Quando essas três camadas sobem juntas, o crescimento nominal pode permanecer alto enquanto o crescimento real e o valor presente dos ativos sofrem.','A tese central é que **energia, financiamento e segurança ficaram simultaneamente mais caros**. Petróleo elevado encarece produção e transporte; Treasury acima de 5% aumenta o custo de financiamento e reduz o valor presente de ativos; maiores gastos com defesa, autonomia tecnológica e proteção de rotas exigem recursos públicos e privados adicionais. Quando esses custos aumentam ao mesmo tempo, a atividade real e os preços dos ativos podem enfraquecer mesmo que o crescimento nominal permaneça elevado.'],
  ['a riqueza mundial continua financeiramente ancorada nos mercados de capitais dos Estados Unidos e no dólar, enquanto o fluxo marginal de poder econômico se torna mais estatal, intensivo em infraestrutura e dependente de gargalos físicos.','a riqueza financeira mundial continua fortemente concentrada nos mercados de capitais dos Estados Unidos e no dólar, enquanto uma parcela maior do investimento estratégico passa por Estados e fundos soberanos e se concentra em infraestrutura, energia, processamento mineral e capacidade computacional.'],
  ['A competição relevante é por financiamento + energia + processamento + computação + propriedade intelectual.','A competição estratégica concentra-se no acesso a financiamento, energia, processamento industrial, capacidade computacional e propriedade intelectual.'],
  ['quem controla os gargalos necessários para produzir riqueza futura','quem controla os recursos, infraestruturas e capacidades críticas para a produção de riqueza futura'],
  ['controle de gargalos','controle de etapas críticas da cadeia'],
  ['concentração de gargalos','concentração de etapas críticas da cadeia'],
  ['ganho industrial e de gargalos','ganho industrial e maior controle de etapas críticas'],
  ['gargalo difícil de substituir','etapa crítica cuja substituição é lenta ou cara'],
  ['gargalos tecnológicos específicos que não podem ser replicados rapidamente','capacidades tecnológicas específicas cuja substituição exige tempo, capital e conhecimento especializado'],
  ['gargalos produtivos','etapas produtivas críticas'],
  ['gargalos físicos','restrições físicas de infraestrutura e processamento'],
  ['A riqueza futura está sendo disputada em gargalos: semicondutores, eletricidade, transformadores, redes, data centers, minerais críticos e capacidade de financiamento.','A expansão futura de riqueza e capacidade produtiva depende de recursos e infraestruturas cuja oferta é limitada ou concentrada: semicondutores, eletricidade, transformadores, redes, data centers, minerais críticos e financiamento.'],
  ['os gargalos que transformam recursos físicos em poder econômico','as capacidades críticas que condicionam a transformação de recursos físicos em produção e renda'],
  ['O gargalo mineral está mais concentrado no processamento do que na geologia.','A maior concentração da cadeia mineral está no processamento e no refino, e não na localização das jazidas.'],
  ['O gargalo marginal pode migrar rapidamente do chip para energia ou conexão à rede.','A principal restrição pode passar rapidamente da disponibilidade de chips para a oferta de energia ou a capacidade de conexão à rede.'],
  ['O gargalo passa a ser MW conectável, transformadores, gás, nuclear, cobre e refrigeração.','A principal restrição passa a ser a capacidade de conexão à rede elétrica, além da disponibilidade de transformadores, geração a gás ou nuclear, cobre e refrigeração.'],
  ['## 1. Resumo executivo — o funil do regime','## 1. Resumo executivo — como o choque se transmite'],
  ['funil causal','cadeia de transmissão'],
  ['O preço de controle do sistema é o UST 10Y, não o S&P 500.','O UST 10Y tornou-se a principal referência para o custo de capital global, mais relevante para esta análise do que a variação isolada do S&P 500.'],
  ['o principal preço de referência do sistema','a principal referência para o custo de capital global'],
  ['o Treasury de 10 anos virou a variável de controle','o Treasury de 10 anos tornou-se a principal referência do custo de capital'],
  ['variável de controle global','principal referência do custo de capital global'],
  ['capital financeiro ainda gravita para ativos dos EUA','o capital financeiro continua fortemente concentrado em ativos dos EUA'],
  ['O centro de gravidade financeiro continua americano.','Os mercados financeiros dos Estados Unidos continuam no centro do sistema.'],
  ['principal reservatório financeiro mundial','principal centro financeiro mundial'],
  ['principal reservatório financeiro','principal centro financeiro'],
  ['reservatório global equivalente','destino global de poupança com função equivalente'],
  ['A cadeia de captura de renda passa por','A renda gerada pela expansão da IA é distribuída entre'],
  ['canais de captura da renda','mecanismos pelos quais lucros, juros, tarifas e royalties são apropriados'],
  ['O poder de captura de renda migra para quem controla capacidade escassa','Uma parcela maior da renda tende a permanecer com quem controla capacidades escassas'],
  ['O poder de apropriação de renda migra para quem controla capacidade escassa','Uma parcela maior da renda tende a permanecer com quem controla capacidades escassas'],
  ['## 19. Mudança na captura de renda futura','## 19. Quem tende a receber a renda futura'],
  ['captura desigual do valor','apropriação desigual da renda gerada'],
  ['a captura de valor depende de mover-se para processamento e infraestrutura','a parcela da renda recebida localmente aumenta quando também existem processamento e infraestrutura'],
  ['capturam rents tecnológicos','recebem margens elevadas associadas a tecnologia proprietária'],
  ['quem aumenta capacidade de capturar renda futura?','quem aumenta sua capacidade de receber lucros, juros, royalties, tarifas ou outras formas de renda futura?'],
  ['mecanismos de captura de renda futura','mecanismos que permitem receber uma parcela maior da renda futura'],
  ['capacidade de capturar renda futura','capacidade de receber uma parcela maior da renda futura'],
  ['elos de captura de renda','etapas que recebem uma parcela maior da renda gerada'],
  ['captura industrial relevante','participação industrial relevante na geração de valor'],
  ['quem captura o retorno','quem fica com a maior parcela do retorno econômico'],
  ['claims bancários cross-border','ativos bancários transfronteiriços'],
  ['claims cross-border','ativos transfronteiriços'],
  ['claims financeiros','direitos financeiros'],
  ['um claim sobre renda futura','um direito financeiro sobre renda futura'],
  ['collateral','garantias financeiras'],
  ['clearing','liquidação financeira'],
  ['midstream','processamento intermediário'],
  ['fees, impostos, talento e informação','taxas e receitas de intermediação, impostos, talento e informação'],
  ['private markets','mercados privados'],
  ['buffers cambiais','reservas cambiais'],
  ['grande buffer externo','reservas externas elevadas'],
  ['Fluxos asiáticos seguem divergentes.','Os fluxos financeiros na Ásia seguem direções diferentes.'],
  ['O delta de hoje','A principal mudança de hoje'],
  ['**Delta.**','**Mudança desde a edição anterior.**'],
  ['informação cross-asset','informação obtida pela comparação entre classes de ativos'],
  ['mapa cross-asset','comparação entre classes de ativos'],
  ['funding','financiamento'],
  ['repricing','reprecificação'],
  ['term premium','prêmio de prazo'],
  ['equity duration','ações mais sensíveis aos juros de longo prazo'],
  ['private credit','crédito privado'],
  ['small caps','ações de empresas de menor capitalização'],
  ['upstream','exploração e produção'],
  ['proxy linear','relação direta'],
  ['lead times','prazos de entrega'],
  ['inventories','estoques'],
  ['treatment charges','taxas de tratamento'],
  ['market cap','capitalização de mercado'],
  ['rents tecnológicos','margens associadas a tecnologia proprietária'],
  ['captura de margem','retenção de margens'],
  ['capturar a margem','reter uma parcela maior da margem'],
  ['captura de valor','apropriação da renda gerada'],
  ['captura de renda','apropriação de renda'],
  ['polo dominante de expansão refinada','principal centro de expansão da capacidade de refino'],
  ['vetor central do greenfield estratégico','um dos principais destinos de novos investimentos estratégicos'],
  ['trajetórias políticas de cauda','cenários políticos extremos'],
  ['prêmio físico','prêmio associado ao risco de oferta física'],
  ['catalisador doméstico de prêmio','principal fator doméstico para o prêmio de risco']
];

function replaceAll(text,from,to){return text.split(from).join(to);}

function firstTerm(text,term,replacement){
  const i=text.indexOf(term);if(i<0)return text;
  return text.slice(0,i)+replacement+text.slice(i+term.length);
}

function normalize(text){
  let out=text;
  for(const [from,to] of replacements)out=replaceAll(out,from,to);
  // Na primeira ocorrência, explique abreviações comuns quando a edição ainda não o faz.
  out=firstTerm(out,'projetos greenfield','novos projetos (greenfield)');
  out=firstTerm(out,'greenfield mundial','novos projetos (greenfield) no mundo');
  out=firstTerm(out,'capex de','investimento de capital (capex) de');
  out=firstTerm(out,'carry elevado','diferencial de juros elevado (carry)');
  out=firstTerm(out,'duration e custo de capital','sensibilidade a juros de longo prazo e custo de capital');
  out=firstTerm(out,'hedge externo','proteção contra o cenário externo');
  out=firstTerm(out,'valuation e','precificação e');
  out=firstTerm(out,'valuation agregado','avaliação agregada');
  return out;
}

let changed=0;
for(const file of walk(root).filter(f=>/\.(?:html|md|json)$/i.test(f))){
  const before=fs.readFileSync(file,'utf8');
  const after=normalize(before);
  if(after!==before){fs.writeFileSync(file,after);changed++;}
}
console.log(`Editorial language normalization OK: ${changed} public files adjusted.`);
