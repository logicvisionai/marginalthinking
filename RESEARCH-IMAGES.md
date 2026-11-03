# Marginal Thinking — Editorial Images and Media Provenance

**Status:** active operational image standard
**Version:** 1.0
**Scope:** canonical bilingual research and presentation-only editorial artwork
**Primary authority:** RESEARCH-PUBLISHING.md, RESEARCH-VISUALS.md, LICENSE-CONTENT.md, THIRD-PARTY-NOTICES.md

## 1. Editorial purpose

Marginal Thinking supports real documentary photographs, verified archival reproductions, original editorial illustrations and data-backed visual explanations, tracked directly in GitHub. Photography is evidence about a particular event only when date, place and identity are independently verified. Original illustration is interpretation, not a photograph and not measured evidence. Images must illuminate the article; they must not be used as unverified emotional decoration or falsely suggest a documented event.

Original renderings are subordinate to research substance, independent source checking, the English-first bilingual contract and the frozen canonical Markdown. No new static media should bypass scientific accuracy, attribution, copyright or accessibility.

## 2. Storage and public URLs

Each report owns one namespace:

```text
assets/images/reports/<report-slug>/
  context-photo.webp
  industrial-chain.svg
  cover-illustration.webp
data/report-images.json
scripts/lib/report-images.mjs
scripts/validate-report-images.mjs
tests/report-images.test.mjs
```

The build already copies assets/ into dist/assets/. Both report languages resolve a stable public image under /assets/images/reports/<slug>/... without a runtime image host or API.

Allowed formats: WebP, PNG, JPEG, AVIF and strictly sanitized SVG. Do not commit animated files, unlicensed screenshots, remote image URLs, base64 data URIs, third-party scripts or binary assets to canonical research Markdown. Prefer WebP or AVIF for photographs and raster illustrations, SVG for verified original diagrams and simple vector artwork, PNG only when necessary. Max asset size: 4 MB raster, 200 KB SVG. Aim for 1600×900 or 1600×1000 cover assets and <= 350 KB when feasible, preserving readable detail and accurate aspect ratios.

Filenames must be lowercase ASCII and semantic; alt text and captions must be authored in both locales. Do not add images to the content index as new research reports.

## 3. Presentation-only lead media on existing approved articles

Use data/report-images.json to attach ONE optional opening editorial image to an already published article without changing SHA-bound approved research Markdown. The lead may be a conceptual illustration or a verified documentary image with no new factual assertions. The manifest is a separately reviewed visual presentation layer, not authority to rewrite approved prose, metadata or numerical charts. Its addition must not change canonical report IDs, revisions, approvals or public URLs.

Example:

```json
{
  "schema_version": 1,
  "reports": {
    "MT-EXAMPLE-RESEARCH-ID": {
      "slug": "2026-11-02-example-report",
      "lead": {
        "src": "/assets/images/reports/2026-11-02-example-report/cover.webp",
        "origin": "original",
        "kind": "editorial-illustration",
        "width": 1600,
        "height": 900,
        "alt": {
          "en": "Meaningful English description of the actual artwork.",
          "pt-BR": "Descrição em português da ilustração realmente apresentada."
        },
        "caption": {
          "en": "Editorial illustration of the structural relationships discussed in the report; not observed data.",
          "pt-BR": "Ilustração editorial das relações estruturais discutidas no artigo; não representa dados observados."
        },
        "credit": "LOGV / Marginal Thinking",
        "license": "CC-BY-4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/"
      }
    }
  }
}
```

The renderer places the image at the beginning of the report content, before the first subheading, with semantic HTML figure/figcaption, numbered label, copyright details, intrinsic dimensions, eager cover loading and responsive CSS. It never changes the approved report's Markdown blob. Do not use this presentation mechanism to add a new substantive chart, contested claim or interpretation not supported by the article. Those require a normal staged revision and independent editorial approval.

## 4. Inline figures inside newly authored or revised research

The canonical Markdown parser supports a deterministic image fence. Use it in both en.md and pt-BR.md at the corresponding passage. The actual src and factual evidence must be identical; alt and caption must be localized.

English example:

```image
src: /assets/images/reports/2026-11-02-example-report/industrial-chain.webp
origin: original
kind: editorial-illustration
width: 1600
height: 900
alt: Visual illustration of links among data centres and industrial production.
caption: Computing capacity depends on physical networks and industrial supply; this is conceptual, not measured data.
credit: LOGV / Marginal Thinking
license: CC-BY-4.0
license_url: https://creativecommons.org/licenses/by/4.0/
```

For a third-party documentary source instead use origin: third-party; kind: documentary-photograph or archival-image; an exact credit; applicable license; license_url; and source_url pointing to the original rights/source page. If the work is allowed under an individual permission rather than an open license, use license: PERMISSION and add a reviewed permission_ref file under data/media-permissions/. These records remain internal to the Git repository and are not automatically published as research.

The image renderer outputs number, type, caption, author/rights holder, license and original source link. It escapes all text and rejects remote, data, traversal and non-canonical src. It never executes arbitrary HTML from Markdown.

## 5. Documentary authenticity, licensing and rights

- Prefer images commissioned or created by LOGV, trusted public-domain/CC images, government or institutional assets with explicit redistribution rights, or images under direct permission.
- Verify a third-party image's author, exact licensing statement, source page and permitted adaptations *before* copying the file into GitHub. A search result or social media post does not imply reuse permission. Record changes, cropping and transformation where attribution demands it.
- Third-party works do not inherit the site's CC BY 4.0 license. The source's own license is displayed with every figure. Public-domain material still needs a grounded origin and authorship when known.
- A photo cannot be used to represent a different war, protest, person, country or date. Do not fabricate documentary photographs, and never present synthetic generated imagery of real events as historical evidence. Generative illustrations must be explicitly labeled.
- Respect privacy and the dignity of people affected by violence, disasters and war. Avoid sensational visual amplification and unlawful reproduction.
- Data charts must still conform to RESEARCH-VISUALS.md and cannot be replaced by a screenshot or a decorative figure. An image cannot manufacture observations not contained in referenced primary sources.
- A license URL does not prove that the stated creator actually owns the underlying content: this remains an editorial review responsibility.

## 6. Evidence and QA

Mandatory checks before media commit:

1. The image really illustrates the surrounding report and makes no unsupported factual assertion.
2. Local asset exists, format is valid, dimensions match, file size is acceptable, SVG is safe, and no hotlink or executable data is present.
3. Correct author/rights holder, original source URL and license/permission have been reviewed.
4. English and Brazilian Portuguese captions and text alternatives are equivalent and substantively descriptive.
5. Photographic subject, time and place are grounded; contested imagery carries necessary qualifications.
6. A source-backed quantitative visual remains a deterministic chart rather than a photograph of a chart.
7. Add no substantive new evidence to an approved report outside the original revision/QA workflow.
8. The static build preserves local URLs, figures, captions and links on both localized pages.

Commands:

```sh
npm run validate:images
npm run build
node scripts/validate-report-images.mjs --dist
```

npm run validate:images checks public source assets, ownership/licensing metadata, MIME-compatible raster decoding, image safety, source-localized parity and unit tests; the final build checks rendered output and verifies assets were copied to dist. External deployment is not established by build success: confirm the workflow, credentials and live URL independently.

## 7. Rollout policy

Start with a reviewed lead artwork on one public report, then expand to the highest-value long-form dossiers where historical documentation, infrastructure, technical systems or geography truly benefits from visual illustration. New major research should plan photos and illustrations during the producer evidence pass rather than attach them after writing. Avoid blanket automated backfills, repeated generic pictures and identical illustration for unrelated topics.

The future "Algorithm Revolution" research can include documentary primary-source photos of McNamara (only with verified rights and context), original schematics of recommendation pipelines, formally sourced historical imagery of political mobilisation, analytically labelled iconography for short-form media, and verified context-dependent war imagery without false event attribution.

## Editorial image quality gate — 3 November 2026

**Default: publish without a lead or decorative illustration.** A report does not require an editorial cover image or generated artwork. The evidence-based visual standards for tables, charts, geographic comparisons and structural diagrams remain unchanged; they must not be satisfied by decorative image files.

- Generic silhouettes, networks, icons, symbolic institutional buildings and abstract nodes do not qualify as an illustration merely because the caption offers an interpretation of them. Only a precise subject-specific visual that genuinely informs the surrounding analysis should be added.
- Prefer a documentary photograph or archive reproduction from a source with verifiable identity, subject, event date where applicable, licence and redistribution rights. Freely viewable does not mean free to reproduce. Cite the specific source and rights holder.
- A caption must accurately describe visible content. It must not claim to depict a process, institution, funding relationship or historical event that the image does not actually document.
- Realistic generated images may be used only for a specific justified illustrative purpose, clearly marked synthetic, never as documentary evidence of a real person, historical event, meeting or armed operation.
- If source quality, copyright clearance, specific relevance or captions cannot be verified, omit the image. No placeholder, generic stock imagery or image used simply to fill the report layout.
- Presentation-only retirement of unsuitable existing images may be made without changing immutable QA-approved research Markdown. A source-level change requires the normal staged review and approval.

### November 2026 visual cleanup

Three generic conceptual lead illustrations were withdrawn from `data/report-images.json`. Four uninformative inline SVG editorial drawings in the algorithmic-revolution and Rockbridge research were explicitly suppressed in the presentation renderer and associated output validator, without altering the reviewed Markdown or its evidence records. Charts, tables, causal diagrams and geography figures are unaffected.
