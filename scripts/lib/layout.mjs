import {esc} from './markdown.mjs';
import {availableLocales} from './reports.mjs';

export function makeLayout(ctx){
  const {cfg,i18n,site,author,social,locale,reportPath,pagePath}=ctx;
  const loc=cfg.locales[locale],t=i18n[locale]||i18n[cfg.default_locale];
  const prefix=loc.path?`/${loc.path}`:'';
  const abs=u=>/^https?:\/\//.test(String(u||''))?u:`${site}${u}`;
  const safe=u=>/^(https?:\/\/|mailto:|\/|#)/i.test(String(u||''))?esc(u):'#';
  const iso=v=>String(v||'').slice(0,10);
  const role=a=>typeof a?.role==='object'?(a.role[locale]||a.role[cfg.default_locale]||Object.values(a.role)[0]):(a?.role||'');
  const authors=i=>Array.isArray(i.authors)&&i.authors.length?i.authors:[author];
  const authorUrl=a=>`${prefix}/authors/${a.slug||author.slug}/`;
  const localized=(p)=>pagePath(locale,p);
  function brand(){return `<a class="brand" href="${localized('/index.html')}" aria-label="Marginal Thinking"><span class="brand-mark"><i></i></span><span class="brand-name"><strong>MARGINAL</strong><em>THINKING</em></span></a>`;}
  function languageSwitch(alternates={}){
    const links=Object.entries(cfg.locales).map(([code,c])=>{const target=alternates[code]||pagePath(code,'/index.html');const current=code===locale;return `<a href="${safe(target)}" data-locale="${esc(code)}" hreflang="${esc(c.lang)}" lang="${esc(c.lang)}" title="${esc(c.name)}" aria-label="${esc(c.name)}"${current?' aria-current="true" class="active"':''}>${esc(c.label)}</a>`;}).join('');
    return `<div class="language-switch" role="navigation" aria-label="${esc(t.language_label||'Language')}">${links}</div>`;
  }
  function themeToggle(){
    const label=locale==='pt-BR'?'Alternar tema claro e escuro':'Toggle light and dark theme';
    return `<button class="theme-toggle" type="button" aria-label="${esc(label)}" title="${esc(label)}" aria-pressed="false"><span class="theme-icon theme-icon-moon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.5 14.1A8.7 8.7 0 0 1 9.9 3.5 8.7 8.7 0 1 0 20.5 14.1Z"/></svg></span><span class="theme-icon theme-icon-sun" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.6"/><path d="M12 2.5v2M12 19.5v2M4.1 4.1l1.4 1.4M18.5 18.5l1.4 1.4M2.5 12h2M19.5 12h2M4.1 19.9l1.4-1.4M18.5 5.5l1.4-1.4"/></svg></span></button>`;
  }
  function nav(active='research',alternates={}){
    const pt=locale==='pt-BR';
    const labels={
      intelligence:pt?'Inteligência':'Intelligence',
      explore:pt?'Explorar':'Explore',
      archive:pt?'Arquivo de pesquisas':'Research archive',
      researchIntel:pt?'Inteligência de pesquisa':'Research intelligence',
      coverage:pt?'Cobertura & taxonomia':'Coverage & taxonomy',
      energy:pt?'Energia, materiais & sistemas':'Energy, materials & systems',
      actors:pt?'Atores Estratégicos':'Strategic Actors',
      dependencies:pt?'Rede de Dependências':'Dependency Network',
      atlas:pt?'Atlas Estrutural':'Structural Atlas',
      geography:pt?'Países & Regiões':'Countries & Regions',
      search:pt?'Busca global':'Global search',
      workspace:pt?'Caderno de pesquisa':'Research workspace',
      mcp:pt?'MCP para agentes':'MCP for AI agents'
    };
    const activeIn=keys=>keys.includes(active);
    const direct=(key,p,label)=>`<a href="${localized(p)}"${active===key?' class="active" aria-current="page"':''}>${esc(label)}</a>`;
    const dropLink=(key,p,label,desc)=>`<a class="nav-dropdown-link${active===key?' active':''}" href="${localized(p)}"${active===key?' aria-current="page"':''}><span>${esc(label)}</span><small>${esc(desc)}</small></a>`;
    const group=(label,keys,items,desc)=>`<div class="nav-group${activeIn(keys)?' active':''}"><button class="nav-trigger" type="button" aria-haspopup="true" aria-expanded="false"><span>${esc(label)}</span><svg class="nav-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false"><path d="M1 1.5 6 6.5 11 1.5"/></svg></button><div class="nav-dropdown"><div class="nav-dropdown-shell"><div class="nav-dropdown-heading"><strong>${esc(label)}</strong><p>${esc(desc)}</p></div><div class="nav-dropdown-grid">${items.join('')}</div></div></div></div>`;
    const research=group(t.nav.research,['research','research-intelligence','coverage','energy'],[
      dropLink('research','/reports.html',labels.archive,pt?'Relatórios, briefings e estudos publicados.':'Published reports, briefings and studies.'),
      dropLink('research-intelligence','/research/',labels.researchIntel,pt?'Navegue pela produção acumulada e conexões temáticas.':'Navigate accumulated research and thematic connections.'),
      dropLink('coverage','/research/coverage/',labels.coverage,pt?'Veja cobertura por programa, região e tema.':'Inspect coverage by program, region and topic.'),
      dropLink('energy','/series/energy-materials-industrial-systems/',labels.energy,pt?'Pesquisa sobre infraestrutura física e produção.':'Research on physical infrastructure and production.')
    ],pt?'Publicações, séries e cobertura do acervo de pesquisa.':'Publications, series and coverage across the research archive.');
    const intelligence=group(labels.intelligence,['actors','dependencies','opportunities'],[
      dropLink('actors','/actors/',labels.actors,pt?'Capacidades, direitos, dependências e mecanismos.':'Capabilities, rights, dependencies and mechanisms.'),
      dropLink('dependencies','/dependencies/',labels.dependencies,pt?'Relações críticas entre sistemas, recursos e atores.':'Critical relationships across systems, resources and actors.'),
      dropLink('opportunities','/opportunities/',labels.atlas,pt?'Ineficiências, restrições e capacidades utilizáveis.':'Inefficiencies, constraints and usable capabilities.')
    ],pt?'Ferramentas para conectar atores, dependências, restrições e capacidade estrutural.':'Tools for connecting actors, dependencies, constraints and structural capacity.');
    const explore=group(labels.explore,['geography','search','workspace','mcp'],[
      dropLink('geography','/regions/',labels.geography,pt?'Pesquisa organizada por geografia.':'Research organized by geography.'),
      dropLink('search','/search.html',labels.search,pt?'Busca transversal em todo o acervo.':'Cross-corpus search across the archive.'),
      dropLink('workspace','/workspace/',labels.workspace,pt?'Salve, compare e organize pesquisas.':'Save, compare and organize research.'),
      dropLink('mcp','/mcp-docs/',labels.mcp,pt?'Acesso estruturado para agentes e clientes MCP.':'Structured access for agents and MCP clients.')
    ],pt?'Busca, geografia, caderno e acesso estruturado ao corpus.':'Search, geography, workspace and structured access to the corpus.');
    const mobileSection=(title,items)=>`<div class="mobile-nav-section"><div class="mobile-nav-title">${esc(title)}</div>${items.join('')}</div>`;
    const mobile=`${direct('home','/index.html',t.nav.home)}${mobileSection(t.nav.research,[direct('research','/reports.html',labels.archive),direct('research-intelligence','/research/',labels.researchIntel),direct('coverage','/research/coverage/',labels.coverage),direct('energy','/series/energy-materials-industrial-systems/',labels.energy)])}${mobileSection(labels.intelligence,[direct('actors','/actors/',labels.actors),direct('dependencies','/dependencies/',labels.dependencies),direct('opportunities','/opportunities/',labels.atlas)])}${mobileSection(labels.explore,[direct('geography','/regions/',labels.geography),direct('search','/search.html',labels.search),direct('workspace','/workspace/',labels.workspace),direct('mcp','/mcp-docs/',labels.mcp)])}${direct('method','/methodology.html',t.nav.method)}${direct('about','/about.html',t.nav.about)}`;
    const mobileTools=`<div class="mobile-menu-toolbar"><span>${pt?'Idioma':'Language'}</span><div class="mobile-language">${languageSwitch(alternates)}</div></div>`;
    return `<header class="site-header"><div class="container header-row">${brand()}<nav class="nav nav-mega" aria-label="${esc(t.nav.research)}">${direct('home','/index.html',t.nav.home)}${research}${intelligence}${explore}${direct('method','/methodology.html',t.nav.method)}${direct('about','/about.html',t.nav.about)}</nav>${languageSwitch(alternates)}<div class="header-actions"><a class="header-report" href="${localized('/workspace/')}">${pt?'Meu caderno':'My workspace'}</a>${themeToggle()}<button class="menu-toggle" type="button" aria-label="${esc(t.nav.menu)}" aria-controls="mobile-menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div><div class="mobile-menu" id="mobile-menu"><div class="container mobile-menu-inner">${mobileTools}<nav>${mobile}</nav></div></div></header>`;
  }
  function footer(){const mcpLabel=locale==='pt-BR'?'MCP para agentes':'MCP for AI agents';return `<footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-intro">${brand()}<p>${esc(t.footer.intro)}</p></div><div><div class="footer-title">${esc(t.footer.research)}</div><div class="footer-links"><a href="${localized('/reports.html')}">${esc(t.footer.archive)}</a><a href="${localized('/opportunities/')}">${esc(locale==='pt-BR'?'Atlas de Oportunidades Estruturais':'Structural Opportunity Atlas')}</a><a href="${localized('/methodology.html')}">${esc(t.footer.method)}</a><a href="${localized('/workspace/')}">${locale==='pt-BR'?'Caderno de pesquisa':'Research workspace'}</a><a href="${localized('/dependencies/')}">${locale==='pt-BR'?'Rede de dependências':'Dependency network'}</a><a href="${localized('/feed.xml')}">RSS</a></div></div><div><div class="footer-title">${esc(t.footer.institutional)}</div><div class="footer-links"><a href="${localized('/about.html')}">${esc(t.footer.about)}</a><a href="${localized('/mcp.html')}">${esc(mcpLabel)}</a><a href="${authorUrl(author)}">${esc(author.name)}</a><a href="mailto:${esc(author.email)}">${esc(t.footer.contact)}</a></div></div></div><div class="footer-bottom"><div class="footer-meta">${esc(cfg.institution)} · ${esc(t.country||'Brazil')}</div><div class="footer-meta">© 2026 ${esc(cfg.site_name)}</div></div></div></footer><div class="product-notice" id="product-notice" role="status" aria-live="polite"></div><script type="module" src="/assets/js/research-actions.js"></script><script type="module" src="/assets/js/annotation-layer.js"></script>`;}
  function alternatesHead(alternates={}){
    const links=Object.entries(alternates).map(([code,url])=>`<link rel="alternate" hreflang="${esc(cfg.locales[code]?.lang||code)}" href="${esc(abs(url))}">`).join('');
    const x=alternates[cfg.default_locale]||Object.values(alternates)[0];
    return links+(x?`<link rel="alternate" hreflang="x-default" href="${esc(abs(x))}">`:'');
  }
  function articleJson(i,view,canonical){const a=authors(i);return {'@type':'ScholarlyArticle','@id':`${abs(canonical)}#article`,headline:view.title,description:view.deck,datePublished:i.published_at||i.date,dateModified:i.updated_at||i.qa_reviewed_at||i.published_at||i.date,inLanguage:loc.lang,isAccessibleForFree:true,mainEntityOfPage:abs(canonical),url:abs(canonical),articleSection:t.kinds[i.kind]||i.kind,keywords:[...(view.tags||i.tags||[]),...(view.keywords||i.keywords||[])].join(', '),author:a.map(x=>({'@type':'Person',name:x.name,url:abs(authorUrl(x)),email:x.email||undefined})),publisher:{'@type':'Organization','@id':`${site}/#organization`,name:cfg.publisher,url:`${site}/`,logo:{'@type':'ImageObject',url:social}},image:social,license:'https://creativecommons.org/licenses/by/4.0/'};}
  function crumbs(i,view,canonical){return {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:t.nav.home,item:abs(localized('/index.html'))},{'@type':'ListItem',position:2,name:t.nav.research,item:abs(localized('/reports.html'))},{'@type':'ListItem',position:3,name:view.title,item:abs(canonical)}]};}
  function reportHead(i,view,canonical,alternates={},robots='index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'){
    const a=authors(i),modified=i.updated_at||i.qa_reviewed_at||i.published_at||i.date,graph=JSON.stringify({'@context':'https://schema.org','@graph':[articleJson(i,view,canonical),crumbs(i,view,canonical)]}).replace(/</g,'\\u003c');
    return `<link rel="stylesheet" href="/assets/css/annotations.css" data-annotation-styles><meta name="robots" content="${esc(robots)}"><link rel="canonical" href="${esc(abs(canonical))}">${alternatesHead(alternates)}<link rel="alternate" type="application/rss+xml" title="Marginal Thinking — ${esc(t.nav.research)}" href="${esc(abs(localized('/feed.xml')))}"><meta property="og:type" content="article"><meta property="og:site_name" content="${esc(cfg.site_name)}"><meta property="og:locale" content="${esc(loc.og_locale)}"><meta property="og:title" content="${esc(view.title)}"><meta property="og:description" content="${esc(view.deck)}"><meta property="og:url" content="${esc(abs(canonical))}"><meta property="og:image" content="${esc(social)}"><meta property="article:published_time" content="${esc(i.published_at||i.date)}"><meta property="article:modified_time" content="${esc(modified)}">${(view.tags||i.tags||[]).slice(0,8).map(x=>`<meta property="article:tag" content="${esc(x)}">`).join('')}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(view.title)}"><meta name="twitter:description" content="${esc(view.deck)}"><meta name="twitter:image" content="${esc(social)}"><meta name="citation_title" content="${esc(view.title)}">${a.map(x=>`<meta name="citation_author" content="${esc(x.name)}">`).join('')}<meta name="citation_publication_date" content="${iso(i.published_at||i.date)}"><meta name="citation_language" content="${esc(loc.lang)}"><meta name="citation_abstract" content="${esc(view.deck)}"><meta name="citation_fulltext_html_url" content="${esc(abs(canonical))}"><script type="application/ld+json">${graph}</script>`;
  }
  function baseHead(title,description,canonical,type='WebPage',alternates={},extra={}){const data=JSON.stringify({'@context':'https://schema.org','@type':type,url:abs(canonical),name:title,description,inLanguage:loc.lang,...extra}).replace(/</g,'\\u003c');return `<link rel="stylesheet" href="/assets/css/annotations.css" data-annotation-styles><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="${esc(abs(canonical))}">${alternatesHead(alternates)}<link rel="alternate" type="application/rss+xml" href="${esc(abs(localized('/feed.xml')))}" title="Marginal Thinking — ${esc(t.nav.research)}"><meta property="og:type" content="website"><meta property="og:site_name" content="${esc(cfg.site_name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(abs(canonical))}"><meta property="og:image" content="${esc(social)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(social)}"><script type="application/ld+json">${data}</script>`;}
  return{loc,t,prefix,abs,safe,role,authors,authorUrl,brand,languageSwitch,themeToggle,nav,footer,reportHead,baseHead,availableLocales};
}
