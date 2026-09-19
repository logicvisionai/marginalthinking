# Research experience

## Audit and product decisions

The old homepage gave one featured article an entire column while four complete
abstracts accumulated in the other column. The resulting height was determined by
the longer column, leaving a large empty area under the feature. The analytical
tools appeared only after this block. The homepage was primarily an archive entry
point, without a workflow for keeping, comparing or revisiting research.

The corpus already provides the right foundation: canonical publication IDs,
localized titles and abstracts, regimes, key risks, watch items, controlled topics,
geography, publication dates, dependency relationships and original Markdown.
Existing search, coverage, Atlas and network tools should be connected to this
foundation rather than duplicated or replaced with unsupported indicators.

## Delivered experience

- The homepage is rendered once, with a compact editorial opening, a current lead
  paired with its first published chart, complementary research, visible tools,
  topic and country entry points, four permanent programs and the existing series.
- The chart retains its title, values, unit and immediate author qualification.
  Its publication date and original research link prevent an archival visual from
  masquerading as a live market feed. Without a chart, published watch items appear.
- Complementary research picks the latest available publication in different
  formats. This deterministic rule keeps daily editions from crowding out dossiers,
  technology and structural research. It is not a quality ranking.
- The research workspace combines search, program, topic, country, format, date and
  ordering filters. URLs preserve public selections, filters and up to three
  comparison IDs. Browser back/forward and language switching preserve context.
- Comparison displays published context, regime, risk, watch items, topics,
  geography and explicitly recorded dependency links. Missing information stays
  explicitly missing; no synthetic score or inferred relationship is introduced.
- Saved reading, notes and read status form a personal notebook. Notes remain in
  localStorage on the device; they are not sent to the server or included in shared
  URLs. Markdown export provides a portable copy, with notes only when explicitly
  exporting the personal notebook. Storage failure is disclosed in the interface.
- The watch view exposes observations named by the filtered publications, with
  dates and original context. It does not claim to verify current conditions or
  deliver notifications.
- Save and compare entry points sit on report pages; home and archive cards can be
  saved directly. The notebook is accessible from the header, mobile menu, footer
  and global search. Global search now also indexes the dependency network.

## Architecture and performance

`scripts/lib/research-product.mjs` projects the canonical research metadata for the
homepage and workspace. `scripts/render-research-workspace.mjs` emits two localized
static routes. Existing automation needs no additional editorial fields to keep
these experiences current.

Home content and first workspace results work without a catalog request. A small
shared module handles save buttons and persistence; only the workspace loads its
filter/comparison logic. The legacy research-index fetch now runs only on the
archive, and a failed request preserves the server-rendered archive. No framework,
service, paid API, runtime database or production dependency was added.

Counts reflect editorial coverage, not importance or the total real-world universe.
Reading time estimates use 220 words per minute. Local storage is not cross-device
backup: export is necessary before clearing browser data. IDs and stored content
are validated, text is escaped, and private notes never enter generated HTML.

## Verification

The existing bilingual, editorial, taxonomy, series, dependency, SEO and output
validators remain mandatory. Product checks additionally cover filters, URL state,
comparison limits, persistence, notes, exports, storage failure and hostile input.
Responsive styles use single-column layouts on small screens, bounded comparison
scrolling, native form controls, visible focus, status announcements and reduced
motion. The dependency network's existing zoom, touch navigation and expanded view
remain intact.
