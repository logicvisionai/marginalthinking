import fs from 'node:fs';
import path from 'node:path';
import {esc} from './lib/markdown.mjs';
import {makeLayout} from './lib/layout.mjs';

const root = process.cwd();
const out = path.join(root,'dist');
const cfg = JSON.parse(fs.readFileSync('site.config.json','utf8'));
const i18n = JSON.parse(fs.readFileSync('data/i18n.json','utf8'));
const data = JSON.parse(fs.readFileSync('data/global-conditions-monitor.json','utf8'));
const site = cfg.site_url.replace(/\/$/,'');
const locales = Object.keys(cfg.locales);
const pagePath = (locale, p) => (cfg.locales[locale]?.path ? '/'+cfg.locales[locale].path : '') + p;
const labels = {
  annual_hicp_inflation:{en:'Annual HICP inflation','pt-BR':'Inflação anual (IPCH)'},
  global_real_gdp_growth_forecast:{en:'World real GDP growth — projection','pt-BR':'Crescimento do PIB real mundial — projeção'},
  global_headline_inflation_forecast:{en:'World consumer inflation — projection','pt-BR':'Inflação global ao consumidor — projeção'},
  energy_inflation_contribution:{en:'Energy contribution to inflation','pt-BR':'Contribuição da energia à inflação'},
  asylum_cases_pending_first_instance:{en:'Asylum cases pending first-instance decision','pt-BR':'Processos de asilo pendentes em primeira instância'},
  gulf_crude_exports:{en:'Gulf crude-oil exports','pt-BR':'Exportações de petróleo bruto do Golfo'},
  hormuz_oil_flows:{en:'Oil flow through Hormuz','pt-BR':'Trânsito de petróleo por Hormuz'},
  observed_oil_stocks_change_since_feb_2026:{en:'Change in observed oil inventories since February','pt-BR':'Variação do estoque observado de petróleo desde fevereiro'},
  global_oil_demand_change_forecast:{en:'World oil demand change — projection','pt-BR':'Variação da demanda mundial de petróleo — projeção'},
  unemployment_rate:{en:'Unemployment','pt-BR':'Desemprego'},
  youth_unemployment_rate:{en:'Youth unemployment','pt-BR':'Desemprego jovem'},
  house_price_index_growth:{en:'House-price growth','pt-BR':'Variação de preços imobiliários'},
  rent_price_index_growth:{en:'Rent-price growth','pt-BR':'Variação dos aluguéis'},
  asylum_applications:{en:'Asylum applications','pt-BR':'Solicitações de asilo'},
  world_oil_supply:{en:'World oil supply','pt-BR':'Oferta mundial de petróleo'},
  middle_east_refined_product_exports:{en:'Middle East refined-product exports','pt-BR':'Exportações de derivados do Oriente Médio'}
};
const units = {
  percent_yoy:{en:'% year on year','pt-BR':'% em 12 meses'},
  percent_labor_force:{en:'% of labour force','pt-BR':'% da força de trabalho'},
  percent_youth_labor_force:{en:'% of youth labour force','pt-BR':'% da força de trabalho jovem'},
  percentage_points_contribution:{en:'percentage points','pt-BR':'pontos percentuais'},
  cases_approx:{en:'cases, approximately','pt-BR':'processos, aproximadamente'},
  million_barrels_per_day_change:{en:'million barrels/day change','pt-BR':'milhões de barris/dia de variação'},
  million_barrels_change:{en:'million barrels of stock change','pt-BR':'milhões de barris de variação de estoque'},
  applications_approx:{en:'applications, approximately','pt-BR':'solicitações, aproximadamente'},
  million_barrels_per_day:{en:'million barrels/day','pt-BR':'milhões de barris/dia'}
};
const regions = {RO:{en:'Romania','pt-BR':'Romênia'},LT:{en:'Lithuania','pt-BR':'Lituânia'},BG:{en:'Bulgaria','pt-BR':'Bulgária'},STRAIT_HORMUZ:{en:'Strait of Hormuz','pt-BR':'Estreito de Hormuz'},EU:{en:'European Union','pt-BR':'União Europeia'},EA21:{en:'Euro area (21 members)','pt-BR':'Zona do euro (21 membros)'},EU_PLUS:{en:'EU+ asylum area','pt-BR':'Área de asilo UE+'},WORLD:{en:'World','pt-BR':'Mundo'},MIDDLE_EAST:{en:'Middle East','pt-BR':'Oriente Médio'}};
const groups = [
 {id:'outlook', title:{en:'Global growth and inflation — institutional forecasts','pt-BR':'Crescimento e inflação mundiais — projeções institucionais'}, fields:['global_real_gdp_growth_forecast','global_headline_inflation_forecast']},
 {id:'prices', title:{en:'Prices, jobs and housing','pt-BR':'Preços, emprego e moradia'}, fields:['annual_hicp_inflation','energy_inflation_contribution','unemployment_rate','youth_unemployment_rate','house_price_index_growth','rent_price_index_growth']},
 {id:'asylum', title:{en:'Asylum system','pt-BR':'Sistema de asilo'}, fields:['asylum_applications','asylum_cases_pending_first_instance']},
 {id:'energy', title:{en:'Energy production and product shipments','pt-BR':'Produção energética e transporte de derivados'}, fields:['world_oil_supply','middle_east_refined_product_exports','gulf_crude_exports','hormuz_oil_flows','observed_oil_stocks_change_since_feb_2026','global_oil_demand_change_forecast']}
];
const pick = (x,l) => x?.[l] || x?.en || '';
const format = (v,l) => new Intl.NumberFormat(l==='pt-BR'?'pt-BR':'en-US',{maximumFractionDigits:2}).format(v);
const write = (p,s) => {const target=path.join(out,p.replace(/^\//,''));fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);};
for (const locale of locales) {
  const pt=locale==='pt-BR';
  const L=makeLayout({cfg,i18n,site,author:cfg.default_author,social:site+cfg.social_image,locale,reportPath:()=>'',pagePath});
  const url='/data/global-conditions-monitor/';
  const title=pt?'Condições globais: observações documentadas':'Global conditions: sourced observations';
  const description=pt?'Indicadores históricos datados e não cotações em tempo real, com fontes primárias e ressalvas metodológicas.':'Dated historical indicators rather than real-time quotes, with primary sources and methodological qualifications.';
  const alts=Object.fromEntries(locales.map(x=>[x,pagePath(x,url)]));
  const schema={'@context':'https://schema.org','@type':'Dataset',name:title,url:site+pagePath(locale,url),
    description,inLanguage:cfg.locales[locale].lang,
    distribution:[{'@type':'DataDownload',encodingFormat:'application/json',contentUrl:site+'/data/global-conditions-monitor.json'}]};
  const heads = L.baseHead(title+' — '+cfg.site_name,description,pagePath(locale,url),'Dataset',alts);
  const sections=groups.map(group=>{
    const items=data.observations.filter(o=>group.fields.includes(o.indicator));
    const rows=items.map(o=>{
      const val=format(o.value,locale),unit=pick(units[o.unit],locale)||o.unit,ref=pick(regions[o.geography],locale)||o.geography;
      const kind=/(projection)$/.test(o.status)?(pt?'PROJEÇÃO':'FORECAST'):(pt?'OBSERVADO/ESTIMADO':'OBSERVED/ESTIMATED');
      const cmp=o.comparator?'<p class="small">'+esc(pt?'Referência: ':'Reference: ')+esc(format(o.comparator.value,locale)+' '+unit+' ('+o.comparator.period+')')+'</p>':'';
      return '<tr><td><strong>'+esc(pick(labels[o.indicator],locale)||o.indicator)+'</strong><p>'+esc(pick(o.description,locale))+'</p></td>'+
        '<td>'+esc(ref)+'<p class="small">'+esc(o.period)+'</p></td>'+
        '<td><strong>'+esc(val)+'</strong><p class="small">'+esc(unit)+'</p><p class="small">'+esc(kind)+'</p>'+cmp+'</td>'+
        '<td><a href="'+esc(o.source.url)+'" rel="noopener noreferrer">'+esc(o.source.publisher)+' ↗</a><p class="small">'+esc(o.released_at)+'</p></td>'+
        '<td>'+esc(pick(o.caveat,locale))+'</td></tr>';
    }).join('');
    return '<section class="section"><div class="container"><h2>'+esc(pick(group.title,locale))+'</h2>'+
      '<div class="md-table-wrap"><table><thead><tr><th>'+(pt?'Indicador':'Indicator')+'</th><th>'+(pt?'Abrangência / período':'Coverage / period')+'</th><th>'+(pt?'Valor':'Value')+'</th><th>'+(pt?'Fonte':'Source')+'</th><th>'+(pt?'Limitações':'Qualifications')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div></div></section>';
  }).join('');
  const body='<!doctype html><html lang="'+esc(L.loc.lang)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+heads+
    '<link rel="stylesheet" href="/assets/css/styles.css"><script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script><title>'+esc(title)+'</title></head><body>'+L.nav('data',alts)+
    '<main><section class="page-hero"><div class="container"><div class="eyebrow dark">'+(pt?'DADOS COM PROVENIÊNCIA':'SOURCED OBSERVATIONS')+
    '</div><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p><div class="chips"><span>'+esc(pt?'Corte das evidências':'Evidence cutoff')+': '+esc(data.evidence_cutoff)+'</span><span>'+esc(pt?'Última alteração real':'Last factual update')+': '+esc(data.updated_at)+'</span></div>'+
    '<p>'+esc(pick(data.method,locale))+'</p><div class="report-actions"><a class="btn dark" href="/data/global-conditions-monitor.json">JSON</a><a class="btn" href="'+pagePath(locale,'/data/')+'">'+(pt?'Catálogo de dados':'Data catalog')+'</a></div></div></section>'+
    sections+'</main>'+L.footer()+'<script src="/assets/js/app.js"></script></body></html>';
  write(pagePath(locale,url)+'index.html',body);
}
console.log('Global Conditions Monitor: '+data.observations.length+' sourced observations in '+locales.length+' languages.');
