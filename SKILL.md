---
name: pptx-deck
description: Build polished PowerPoint decks from scratch with PptxGenJS — Japanese-first typography, curated palettes, a copy-paste layout library, HTML diagram templates, and a mechanical QA pipeline. Use when the user asks to create slides, presentations, or .pptx files.
license: MIT
---

# pptx-deck — deck generation skill

Generates `.pptx` files by writing a PptxGenJS (Node.js) script, then verifies
the result mechanically (lint) and visually (rendered images). Optimized for
Japanese text, but everything works for Latin-only decks too.

This skill **creates decks from scratch**. Editing an existing .pptx in place
is out of scope.

## Workflow (two stages, always)

Never jump straight to code.

**Stage 1 — plan.** Reply with, in one message:

1. The deck type and intent (next section) you inferred — ask if genuinely ambiguous.
2. A palette recommendation with a one-line reason ([references/palettes.md](references/palettes.md)).
3. A slide-by-slide outline table: `# / Title / Layout type / Key content / Notes`.
   Every content slide needs **3+ concrete content items** in the Key-content
   cell; merge thin slides before showing the outline.
4. If the user supplied image files, view each one first and assign it to a
   slide with a placement pattern from [references/user-images.md](references/user-images.md).

Wait for the user to confirm the outline.

**Stage 2 — generate.** Write one JS file that builds every slide, run it,
then run the QA pipeline (below). Deliver `.pptx` (and `.pdf` when asked).

## Deck type & intent

Decide both before outlining; they change every downstream rule.

**Delivery type** — who carries the story:

| Type | Situation | Titles | Body |
|------|-----------|--------|------|
| Talk deck | A presenter speaks over it | Short topic labels | Fragments; depth goes to speaker notes |
| Self-narrating deck | Read alone: manuals, handovers, link-shared docs | **Full-sentence conclusions** (see Message titles) | Complete sentences; no narration needed |
| Hybrid | Presented, then distributed | Sentence titles | Complete but tight |

**Intent** — explain or persuade:

- **Explanatory (default).** Neutral register, even emphasis, factual titles,
  reference-style ending (component list, file map, glossary). All Writing
  rules below apply strictly.
- **Persuasive.** Only when the user explicitly asks for a pitch/vision deck.
  Unlocks taglines, stat callouts, dramatic emphasis. Never chosen by default.

## Writing rules

1. **No invented rationale.** Every "why" must come from the source material or
   the user. A confident fabricated motive is worse than silence — omit or ask.
2. **Describe, don't sell** (explanatory decks). State what a thing is and how
   it works. No benefit-framing copy, no hero taglines, no "N原則" packaging,
   no closing slogan. End on a reference slide, not a message slide.
3. **Avoid generated-sounding copy.** Personified components, rhythmic
   three-part parallels, and noun-stop headline titles (体言止めキャッチ) all
   read as AI output. Name the real component and the real action instead.
4. **Neutralize the source's own catchphrases.** Source documents — especially
   AI-written ones — carry slogans, metaphors, and punchy one-liners. When you
   condense a long source, resist harvesting each chapter's catchiest sentence
   for titles and emphasis bars: that concentrates scattered rhetoric into a
   slogan on every slide. Unpack the fact behind the phrase and state it
   plainly. Quote a source-coined term at most once, as a defined concept,
   never as a title or closing line.
5. **Emphasis devices must match intent.** Oversized numbers, single-message
   slides, and dramatic color blocks are persuasion tools. In explanatory
   decks, present figures as label+value lines or a compact table.
6. **Control CJK line breaks.** PowerPoint wraps Japanese at any character, so
   long strings in boxes narrower than ~4" split mid-word. Insert explicit
   `\n` at phrase boundaries, sized to the box (chars per line ≈
   `boxWidth(in) × 72 / fontSize` for full-width chars). Fix overflow by
   shortening text or widening boxes — **never by shrinking the font below the
   minimums.**

## Size math (do it while writing, not after rendering)

Slide canvas: 16:9 = **10 × 5.625 inches** (`LAYOUT_16x9`).

- Chars per line (full-width) ≈ `boxWidth × 72 / fontSize`; Latin fits ~2×.
- Line height ≈ `fontSize × 1.2 / 72` inches.
- Needed box height = `lines × lineHeight × 1.15` — if it doesn't fit, cut
  text or widen the box.
- Lay out stacked blocks with a y-cursor (`y = prevY + prevH + gap`), and keep
  the last block above `y + h ≤ 5.125` (0.5" bottom margin).
- Decide footer/caption bands first and reserve them.

## Design system

### Palette

Pick one palette from [references/palettes.md](references/palettes.md) in
Stage 1 and use exactly **3 colors at ~70:25:5 weight** (background / main /
accent) for the whole deck. No fourth color mid-deck; light background on
every slide (unless the chosen palette is the all-dark one). Photos and brand
logos are imagery and exempt.

### Typography

Default font: **BIZ UDPGothic** (OFL; ships with Windows 11, installable on
Linux/macOS). Set `fontFace` on every text call.

| Element | Size |
|---------|------|
| Title (topic-label style) | 36–44pt bold |
| Message title (sentence) | see below |
| Subtitle under title | 12pt gray, 2–3 lines |
| Header-bar label | 11.5–13pt bold |
| Body | 13–14pt (11.5pt in dense cards) |
| Captions / footnotes | 10pt light gray |
| Dense tables | 8–10pt |

**Hard floor: 10pt** everywhere except dense table cells (8–9pt).
Lightest allowed text color ≈ `6B7280` on light background; lighter tones are
decoration-only.

**Message titles** (self-narrating decks): the title is the slide's conclusion
as a neutral sentence, so it runs long — don't set every one at 36–44pt.
One-line conclusions (≤ ~20 full-width chars) get a single 30–36pt line.
Longer ones get two tiers: a small topic label (13–16pt bold, accent color, a
plain noun phrase — not a headline) plus the conclusion sentence at 18–22pt.
The conclusion tier, not the label, satisfies the self-narrating requirement.

### Content density

Minimum payload per content slide: **4–7 information blocks**, or one rich
visual (table / chart / diagram / image) plus 3+ supporting facts. Hero,
section dividers, and quote slides are exempt. Every slide gets at least one
visual element (shape, icon, chart, image) — never a bare text wall.

### Recurring structure

Choose one structural motif (card panels, numbered badges, single-side accent
bars…) and repeat it; uniformity reads as designed. Add a slim header bar with
the chapter name on content slides of multi-section decks.

## Deck skeleton (multi-section decks)

- **TOC slide** listing sections with number badges.
- **Section dividers** before each section's first slide: big faint number,
  section name, one-line scope — visually distinct from content slides, no
  header bar, page number kept.
- **Page numbers**: use `slide.slideNumber` on every slide except the hero.
  For `n / N` display run `python scripts/add_slide_total.py deck.pptx` after
  generation — it appends the total inside the same paragraph as the number
  field so nothing shifts vertically.

## Building the slides

Write against the API notes in
[references/pptxgenjs-cheatsheet.md](references/pptxgenjs-cheatsheet.md) and
start from the closest sample in `references/layouts/`:

agenda, chart, checklist, data-table, diagram-image, gantt, kanban, matrix,
process-flow, pyramid, roadmap, screenshot-annotation, tree.

Rules that recur in review:

- Connectors between boxes are **shapes** (LINE with arrowhead, CHEVRON) —
  never a floating `→` text glyph; glyph connectors drift across renderers.
- Icon circles must mean something (✓, number). If no glyph fits, use a
  numbered badge or nothing.
- Brand logos beside product names: resolve with `node scripts/brand_icon.js`
  (simple-icons → lettermark fallback) and **look at the rendered mark before
  shipping** — see [references/brand-icons.md](references/brand-icons.md).
- Complex diagrams (architecture, layers, hub-spoke, cycles, swimlanes,
  funnels, comparisons, trees): copy one of the 10 HTML templates in
  `references/diagrams/`, restyle it to the deck palette, render with
  `python scripts/render_html.py diagram.html`, and place the PNG — full
  procedure in [references/diagram-rendering.md](references/diagram-rendering.md).
- User-supplied photos/screenshots: [references/user-images.md](references/user-images.md).
  Always compute placement from the file's real pixel size (`imgSize` /
  `fitImage` / `coverImage` helpers there). pptxgenjs does not read image
  files, so `sizing` alone will silently stretch.

## QA pipeline (required)

1. **Generate**: `node deck.js` (then `add_slide_total.py` if paginated).
2. **Lint**: `python scripts/layout_lint.py deck.pptx` — fix every ERROR
   (overflow, overlap, sub-minimum fonts, line-start punctuation). WARNs are
   heuristics: check them on the rendered image before touching code.
3. **Render**: `soffice --headless --convert-to pdf deck.pptx`, then raster
   pages (`python scripts/thumbnails.py deck.pptx` builds contact sheets, or
   PyMuPDF per page at 2× for detail).
4. **Visual QA via subagent**: hand the page images to a subagent and ask for
   a text-only issue list (overlaps, clipped text, mid-word CJK breaks, edge
   margins < 0.5", contrast). Don't bulk-read images in the main context.
5. **Text QA**: `python -m markitdown deck.pptx` — reread every string against
   the Writing rules, and grep for leftover placeholders (`lorem`, `xxxx`).
6. Iterate until lint is clean and the visual pass reports nothing.

Use 3× zoom renders for dense layouts (gantt, tree, matrix) — 2× hides subtle
collisions.

## Platform notes

Works on Linux, macOS, and Windows. `soffice` must be on PATH
(Windows: `C:\Program Files\LibreOffice\program`). PDF rasterization uses
`pdftoppm` when available, PyMuPDF otherwise. `render_html.py` needs a
headless Chromium/Chrome.

## Dependencies

- Node.js + `npm install pptxgenjs` (plus `simple-icons` if brand logos are used)
- Python + `pip install "markitdown[pptx]" pillow pymupdf`
- LibreOffice (`soffice`) for PDF/QA rendering
- BIZ UDPGothic font (`sudo apt install fonts-morisawa-bizud-gothic` on Debian/Ubuntu)
