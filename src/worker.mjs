import {McpServer} from '@modelcontextprotocol/server';
import {createMcpHandler} from 'agents/mcp/server';
import {z} from 'zod';

const MCP_ROUTE = '/mcp';
const CANONICAL_HOST = 'marginalthinking.org';
const ALLOWED_HOSTS = [CANONICAL_HOST, `www.${CANONICAL_HOST}`];
const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const normalize = value => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const jsonResult = value => ({
  content: [{type: 'text', text: JSON.stringify(value, null, 2)}],
  structuredContent: value
});

const errorResult = message => ({
  content: [{type: 'text', text: message}],
  isError: true
});

async function assetResponse(env, requestUrl, pathname) {
  const url = new URL(pathname, requestUrl);
  return env.ASSETS.fetch(url);
}

async function loadJson(env, requestUrl, pathname) {
  const response = await assetResponse(env, requestUrl, pathname);
  if (!response.ok) throw new Error(`Published asset unavailable: ${pathname} (${response.status})`);
  return response.json();
}

async function loadText(env, requestUrl, pathname) {
  const response = await assetResponse(env, requestUrl, pathname);
  if (!response.ok) throw new Error(`Published asset unavailable: ${pathname} (${response.status})`);
  return response.text();
}

async function loadCatalog(env, requestUrl) {
  return loadJson(env, requestUrl, '/data/mcp-catalog.json');
}

function viewFor(item, locale) {
  return item.views?.[locale] || item.views?.[item.source_locale] || item.views?.en || Object.values(item.views || {})[0] || null;
}

function countryMatches(item, country) {
  if (!country) return true;
  const needle = normalize(country);
  return (item.geography?.countries || []).some(c => normalize(c.code) === needle || normalize(c.slug) === needle);
}

function matchesFilters(item, {program, topic, country, cadence, format, date_from, date_to, series} = {}) {
  if (program && item.program !== program) return false;
  if (topic && !(item.topics || []).includes(topic)) return false;
  if (cadence && item.cadence !== cadence) return false;
  if (format && item.format !== format) return false;
  if (series && item.series !== series) return false;
  if (!countryMatches(item, country)) return false;
  if (date_from && String(item.date) < date_from) return false;
  if (date_to && String(item.date) > date_to) return false;
  return true;
}

function searchableText(item, view) {
  const countries = (item.geography?.countries || []).flatMap(c => [c.code, c.slug]);
  return [
    view?.title,
    view?.deck,
    view?.regime,
    view?.key_risk,
    ...(view?.watch || []),
    ...(view?.tags || []),
    ...(view?.keywords || []),
    view?.search_text,
    item.program,
    ...(item.related_programs || []),
    ...(item.dimensions || []),
    ...(item.topics || []),
    ...(item.geography?.regions || []),
    ...countries,
    item.format,
    item.cadence,
    item.series,
    item.series_domain
  ].filter(Boolean).join(' ');
}

function scoreQuery(item, view, query) {
  const phrase = normalize(query);
  if (!phrase) return 1;
  const tokens = [...new Set(phrase.split(' ').filter(Boolean))];
  const title = normalize(view?.title);
  const deck = normalize(view?.deck);
  const tags = normalize((view?.tags || []).join(' '));
  const keywords = normalize((view?.keywords || []).join(' '));
  const search = normalize(searchableText(item, view));
  let score = 0;
  if (title === phrase) score += 100;
  else if (title.includes(phrase)) score += 45;
  if (deck.includes(phrase)) score += 24;
  if (tags.includes(phrase)) score += 20;
  if (keywords.includes(phrase)) score += 16;
  if (search.includes(phrase)) score += 12;
  for (const token of tokens) {
    if (title.includes(token)) score += 8;
    if (deck.includes(token)) score += 4;
    if (tags.includes(token)) score += 4;
    if (keywords.includes(token)) score += 3;
    if (search.includes(token)) score += 1;
  }
  return score;
}

function compactItem(item, locale, extra = {}) {
  const view = viewFor(item, locale);
  return {
    id: item.id,
    date: item.date,
    published_at: item.published_at,
    title: view?.title || item.id,
    deck: view?.deck || '',
    program: item.program,
    related_programs: item.related_programs || [],
    dimensions: item.dimensions || [],
    geography: item.geography,
    topics: item.topics || [],
    format: item.format,
    cadence: item.cadence,
    series: item.series,
    series_domain: item.series_domain,
    qa_confidence: item.qa_confidence,
    canonical_url: view?.canonical_url,
    markdown_url: view?.markdown_url,
    ...extra
  };
}

function relatedScore(source, candidate) {
  let score = 0;
  const reasons = [];
  if (source.program && source.program === candidate.program) {
    score += 8;
    reasons.push(`same program: ${source.program}`);
  }
  if ((source.related_programs || []).includes(candidate.program) || (candidate.related_programs || []).includes(source.program)) {
    score += 4;
    reasons.push('related research program');
  }
  const sourceTopics = new Set(source.topics || []);
  const commonTopics = (candidate.topics || []).filter(x => sourceTopics.has(x));
  if (commonTopics.length) {
    score += commonTopics.length * 3;
    reasons.push(`shared topics: ${commonTopics.join(', ')}`);
  }
  const sourceCountries = new Set((source.geography?.countries || []).map(c => c.code || c.slug).filter(Boolean));
  const commonCountries = (candidate.geography?.countries || []).map(c => c.code || c.slug).filter(x => sourceCountries.has(x));
  if (commonCountries.length) {
    score += commonCountries.length * 4;
    reasons.push(`shared countries: ${commonCountries.join(', ')}`);
  }
  const sourceRegions = new Set(source.geography?.regions || []);
  const commonRegions = (candidate.geography?.regions || []).filter(x => sourceRegions.has(x));
  if (commonRegions.length) {
    score += commonRegions.length * 2;
    reasons.push(`shared regions: ${commonRegions.join(', ')}`);
  }
  if (source.series && source.series === candidate.series) {
    score += 5;
    reasons.push(`same series: ${source.series}`);
  }
  const sourceDimensions = new Set(source.dimensions || []);
  const commonDimensions = (candidate.dimensions || []).filter(x => sourceDimensions.has(x));
  if (commonDimensions.length) score += commonDimensions.length;
  return {score, reasons};
}

function extractSection(markdown, section) {
  if (!section) return {markdown, section: null};
  const target = normalize(section);
  const headings = [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map(match => ({
    start: match.index,
    level: match[1].length,
    title: match[2].replace(/[#*_`]/g, '').trim()
  }));
  const found = headings.find(h => normalize(h.title) === target) || headings.find(h => normalize(h.title).includes(target));
  if (!found) return {markdown: '', section: null};
  const next = headings.find(h => h.start > found.start && h.level <= found.level);
  return {
    markdown: markdown.slice(found.start, next?.start ?? markdown.length).trim(),
    section: found.title
  };
}

function createServer(env, requestUrl) {
  const server = new McpServer({
    name: 'Marginal Thinking Research Intelligence',
    version: '1.0.0'
  });

  server.registerTool(
    'search_research',
    {
      title: 'Search Marginal Thinking research',
      description: 'Search the published Marginal Thinking corpus across titles, summaries, tags, keywords, taxonomy and indexed report text. Use this before opening full reports.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({
        query: z.string().min(1).describe('Natural-language query or keywords.'),
        locale: z.enum(['en', 'pt-BR']).default('en'),
        program: z.string().optional(),
        topic: z.string().optional(),
        country: z.string().optional().describe('Country code or canonical slug, for example BR or brazil.'),
        cadence: z.string().optional(),
        format: z.string().optional(),
        series: z.string().optional(),
        date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        limit: z.number().int().min(1).max(20).default(8)
      })
    },
    async args => {
      try {
        const catalog = await loadCatalog(env, requestUrl);
        const results = catalog.items
          .filter(item => matchesFilters(item, args))
          .map(item => ({item, score: scoreQuery(item, viewFor(item, args.locale), args.query)}))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score || String(b.item.date).localeCompare(String(a.item.date)))
          .slice(0, args.limit)
          .map(x => compactItem(x.item, args.locale, {relevance_score: x.score}));
        return jsonResult({query: args.query, locale: args.locale, count: results.length, results});
      } catch (error) {
        return errorResult(`Marginal Thinking search failed: ${error.message}`);
      }
    }
  );

  server.registerTool(
    'get_research',
    {
      title: 'Read a Marginal Thinking research item',
      description: 'Return the canonical metadata and Markdown text for one published Marginal Thinking research item. Optionally request a single Markdown section to reduce context usage.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({
        id: z.string().min(1).describe('Canonical Marginal Thinking research ID returned by search_research.'),
        locale: z.enum(['en', 'pt-BR']).default('en'),
        section: z.string().min(1).optional().describe('Optional heading or partial heading to extract.'),
        max_chars: z.number().int().min(2000).max(100000).default(60000)
      })
    },
    async ({id, locale, section, max_chars}) => {
      try {
        const catalog = await loadCatalog(env, requestUrl);
        const item = catalog.items.find(x => normalize(x.id) === normalize(id));
        if (!item) return errorResult(`Research item not found: ${id}`);
        const view = viewFor(item, locale);
        if (!view?.markdown_url) return errorResult(`No public Markdown view is available for ${id} in ${locale}.`);
        const pathname = new URL(view.markdown_url).pathname;
        const full = await loadText(env, requestUrl, pathname);
        const selected = extractSection(full, section);
        if (section && !selected.section) return errorResult(`Section not found in ${id}: ${section}`);
        const text = selected.markdown.slice(0, max_chars);
        return jsonResult({
          ...compactItem(item, locale),
          requested_section: section || null,
          resolved_section: selected.section,
          truncated: selected.markdown.length > text.length,
          markdown: text
        });
      } catch (error) {
        return errorResult(`Marginal Thinking document retrieval failed: ${error.message}`);
      }
    }
  );

  server.registerTool(
    'latest_research',
    {
      title: 'Get the latest Marginal Thinking research',
      description: 'Return the most recent published research, optionally filtered by program, topic, country, cadence, format or series.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({
        locale: z.enum(['en', 'pt-BR']).default('en'),
        program: z.string().optional(),
        topic: z.string().optional(),
        country: z.string().optional(),
        cadence: z.string().optional(),
        format: z.string().optional(),
        series: z.string().optional(),
        limit: z.number().int().min(1).max(20).default(5)
      })
    },
    async args => {
      try {
        const catalog = await loadCatalog(env, requestUrl);
        const results = catalog.items
          .filter(item => matchesFilters(item, args))
          .sort((a, b) => String(b.published_at || b.date).localeCompare(String(a.published_at || a.date)))
          .slice(0, args.limit)
          .map(item => compactItem(item, args.locale));
        return jsonResult({locale: args.locale, count: results.length, results});
      } catch (error) {
        return errorResult(`Marginal Thinking latest-research lookup failed: ${error.message}`);
      }
    }
  );

  server.registerTool(
    'get_related_research',
    {
      title: 'Find related Marginal Thinking research',
      description: 'Find research connected to a publication through programs, topics, countries, regions, series and analytical dimensions.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({
        id: z.string().min(1),
        locale: z.enum(['en', 'pt-BR']).default('en'),
        limit: z.number().int().min(1).max(20).default(8)
      })
    },
    async ({id, locale, limit}) => {
      try {
        const catalog = await loadCatalog(env, requestUrl);
        const source = catalog.items.find(x => normalize(x.id) === normalize(id));
        if (!source) return errorResult(`Research item not found: ${id}`);
        const results = catalog.items
          .filter(item => item.id !== source.id)
          .map(item => ({item, ...relatedScore(source, item)}))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score || String(b.item.date).localeCompare(String(a.item.date)))
          .slice(0, limit)
          .map(x => compactItem(x.item, locale, {relationship_score: x.score, relationship_reasons: x.reasons}));
        return jsonResult({source: compactItem(source, locale), count: results.length, results});
      } catch (error) {
        return errorResult(`Marginal Thinking related-research lookup failed: ${error.message}`);
      }
    }
  );

  server.registerTool(
    'get_timeline',
    {
      title: 'Build a Marginal Thinking research timeline',
      description: 'Build a chronological research timeline for a subject using the published corpus and optional taxonomy filters.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({
        subject: z.string().min(1).describe('Country, topic, market, institution, technology or other subject.'),
        locale: z.enum(['en', 'pt-BR']).default('en'),
        program: z.string().optional(),
        topic: z.string().optional(),
        country: z.string().optional(),
        series: z.string().optional(),
        date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        order: z.enum(['asc', 'desc']).default('asc'),
        limit: z.number().int().min(1).max(50).default(20)
      })
    },
    async args => {
      try {
        const catalog = await loadCatalog(env, requestUrl);
        const rows = catalog.items
          .filter(item => matchesFilters(item, args))
          .map(item => ({item, score: scoreQuery(item, viewFor(item, args.locale), args.subject)}))
          .filter(x => x.score > 0)
          .sort((a, b) => {
            const dateCmp = String(a.item.date).localeCompare(String(b.item.date));
            return args.order === 'asc' ? dateCmp : -dateCmp;
          })
          .slice(0, args.limit)
          .map(x => compactItem(x.item, args.locale, {relevance_score: x.score}));
        return jsonResult({subject: args.subject, locale: args.locale, order: args.order, count: rows.length, timeline: rows});
      } catch (error) {
        return errorResult(`Marginal Thinking timeline lookup failed: ${error.message}`);
      }
    }
  );

  server.registerTool(
    'get_corpus_overview',
    {
      title: 'Get Marginal Thinking corpus coverage',
      description: 'Return automatically derived coverage metrics for the published Marginal Thinking corpus, including programs, countries, topics, languages and publication activity.',
      annotations: TOOL_ANNOTATIONS,
      inputSchema: z.object({})
    },
    async () => {
      try {
        const intelligence = await loadJson(env, requestUrl, '/data/research-intelligence.json');
        return jsonResult(intelligence);
      } catch (error) {
        return errorResult(`Marginal Thinking corpus overview failed: ${error.message}`);
      }
    }
  );

  server.registerResource(
    'marginal-thinking-catalog',
    'marginalthinking://catalog',
    {
      title: 'Marginal Thinking public research catalog',
      description: 'Machine-readable catalog of the public Marginal Thinking research corpus.',
      mimeType: 'application/json'
    },
    async uri => {
      const catalog = await loadCatalog(env, requestUrl);
      return {contents: [{uri: uri.href, mimeType: 'application/json', text: JSON.stringify(catalog)}]};
    }
  );

  return server;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (ALLOWED_HOSTS.includes(url.hostname.toLowerCase()) && (url.hostname.toLowerCase() !== CANONICAL_HOST || url.protocol !== 'https:')) {
      const canonical = new URL(request.url);
      canonical.protocol = 'https:';
      canonical.hostname = CANONICAL_HOST;
      canonical.port = '';
      return Response.redirect(canonical.toString(), 308);
    }
    if (url.pathname === `${MCP_ROUTE}/`) {
      url.pathname = MCP_ROUTE;
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === MCP_ROUTE) {
      const handler = createMcpHandler(
        () => createServer(env, request.url),
        {
          route: MCP_ROUTE,
          allowedHostnames: ALLOWED_HOSTS,
          allowedOriginHostnames: '*',
          onerror: error => console.error('MCP error', error)
        }
      );
      return handler(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};
