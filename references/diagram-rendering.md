# Diagrams (HTML / Mermaid → PNG)

For diagrams that exceed what PptxGenJS shapes can express cleanly — architecture
maps, layered stacks, hub-and-spoke relations, cycles, swimlanes, funnels, rich
comparisons, sequence diagrams — author the diagram as HTML (preferred) or
Mermaid, render it to PNG, and place it on the slide with `addImage`. Use the
`diagram-image` layout (`references/layouts/diagram-image.js`) as the slide
template.

## When to render vs. draw with shapes

| Situation | Approach |
|-----------|----------|
| 3-6 boxes with simple arrows | PptxGenJS shapes (`process-flow`, `tree` layouts) |
| Any composition matching a template below | **HTML template → PNG** (start from the template, never from scratch) |
| Sequence diagrams, ER, state machines, git graphs | Mermaid → PNG |
| Custom infographic no template fits | HTML → PNG, following the Design Rules below |

## HTML templates (start here)

`references/diagrams/` has 9 ready-made compositions. **Copy the closest one
into `projects/<name>/`, swap the palette, edit the content** — do not write
diagram HTML from scratch; the templates already encode the sizing, arrow, and
wrap rules that keep failing in ad-hoc HTML.

| Template | Composition | Use for |
|----------|-------------|---------|
| `flow.html` | Horizontal pipeline: dashed responsibility groups + relay node + note band | Process flows, data pipelines, handovers across environments |
| `layers.html` | Stacked layers, cells per layer, one accent-focused layer | Tech stacks, layered architecture, abstraction levels |
| `hub-spoke.html` | Central hub + 6 surrounding nodes with connector lines | One thing and its consumers/roles/integrations (relations, not flow) |
| `cycle.html` | 4 steps on a ring with arc arrows + center label | Repeating loops (PDCA, ops cycles) — only when the loop-back is the point |
| `swimlane.html` | Grid of lanes (who) × phases (when) | Processes with role separation — prefer over flow when "who does it" matters |
| `compare.html` | Row-aligned Before/After cards with accent arrows | Change effects, two-option contrasts, migration stories |
| `architecture.html` | Zone borders + nested inner groups + icon nodes + labeled connection lines | System/deployment diagrams; shows brand-icon integration and 2-level nesting |
| `funnel.html` | Narrowing trapezoid stack + per-stage numbers column | Stage-by-stage reduction (filtering, conversion, selection) |
| `tree.html` | Horizontal tree, up to 4 levels, CSS-drawn branch lines | Org charts, directory structures, functional decomposition — deeper/wider than the PptxGenJS `tree` layout |

Also in that folder: **`icons.html`** — a catalog of ~22 generic line icons
(db, server, cloud, gpu, lock, user…) drawn with a consistent stroke style.
Open it, copy the `<svg class="dicon">` block you need into a node. All icons
use `currentColor`, so they follow the parent element's `color`.

### Palette wiring

Each template defines the palette once as CSS custom properties. Map them from
the deck's `C` constants (`references/palettes.md`) — same 3-color rule:

| CSS var | Deck constant | Role in the diagram |
|---------|---------------|---------------------|
| `--bg` | `cardBg` or `lightBg` | Canvas background — match where the PNG lands |
| `--mid` | `midBg` | Node fills |
| `--main` | `main` | Borders, arrows, group frames, headings |
| `--accent` | `accent` | ONE highlighted element (at most two) |
| `--text` / `--muted` / `--light` | `darkText` / `gray` / `lightText` | Text tiers |

SVG `marker` fills and any hard-coded hex inside `<svg>` blocks do not read CSS
vars in all cases — the templates flag these spots with comments; swap them
together with the palette.

### Design rules (apply to any diagram HTML, template or custom)

- **Canvas**: design at the same aspect ratio as the target box. Templates are
  1650x1000 (fits the `diagram-image` panel, ~6.1" x 3.7"); `flow.html` is
  2200x850 for full-width placement (~9.0" x 3.47"). Fill the canvas — internal
  empty margins become dead space on the slide.
- **Minimum font sizes**, converted from the typography floors: `pt-equivalent =
  fontPx × placedWidthInches × 72 / canvasWidthPx`. Two tiers: **headings and
  labels ≥ 10pt equivalent** (~38px on a 1650px canvas placed at 6.1"; ~34px on
  a 2200px canvas at 9.0"), **supporting text ≥ 9pt equivalent** (~34px at
  1650/6.1" — same rank as dense-table footnotes). Nothing below that; fix
  overflow by shortening text or widening boxes, not by shrinking fonts.
- **Japanese line breaks**: browsers wrap CJK mid-word exactly like PowerPoint.
  Any string expected to wrap gets an explicit `<br>` at a phrase boundary.
  Node headings: keep to ~5 full-width chars or add `<br>`. Verify in the
  rendered PNG — mid-word breaks (「通らな / い」) are ship-blockers.
- **Arrows are drawn, not typed**: use the templates' CSS arrow parts
  (`.arr-r`, `.arr-lbl`) or SVG lines with `marker-end`. Never a bare text
  glyph (`→` `›` `↓`) between boxes. (Inline arrows inside a sentence are fine.)
  When styling SVG with CSS, scope selectors to `svg > path` so they don't
  bleed into `<marker>` contents.
- **One accent**: highlight at most 1-2 elements with `--accent` (the `strong` /
  `focus` classes). Everything accented = nothing accented.
- **Hierarchy & nesting**: show containment by frame style, not by color count.
  Outer zone (environment/place boundary) = thick dashed border + 42px label;
  inner group (deploy unit / logical grouping) = thin solid border + 34px
  label; node = filled. Keep the meaning consistent — dashed for physical/
  environment boundaries, solid for logical grouping. **Containment nesting
  maxes out at 2 levels** (zone > group > node); for deeper structures switch
  to `tree.html` (up to 4 levels, node decoration lightens as depth increases)
  or split the diagram. Past 4 tree levels, split into one overview + one
  detail diagram.
- **Icons**: generic concepts → copy from `icons.html` (one stroke family per
  diagram — don't mix icon styles). Proper nouns (GitHub, Slack, …) → get the
  official mark as SVG via `brandIconSvg` and inline it, or write a file:
  ```bash
  node scripts/brand_icon.js "GitHub" github.svg
  ```
  Brand logos keep their official color (imagery is exempt from the 3-color
  rule) or pass `color` for monochrome. Verification rules in
  `references/brand-icons.md` apply — render and look at every mark.

## Rendering HTML → PNG

One command (auto-detects Edge/Chrome/Chromium on Windows/Linux/macOS, reads
the canvas size from the template's `body { width/height }`):

```bash
python scripts/render_html.py diagram.html
# → projects/<name>/diagram.png at 2x density; use --scale 3 for dense diagrams
```

2x on a 1650px canvas gives 3300px for a 6.1" box (~540 px/inch) — comfortably
above the ≥300 px/inch floor. If you bypass the script, replicate its flags
(`--headless=new --hide-scrollbars --window-size=<canvas> --force-device-scale-factor=2 --screenshot=…`).

## Mermaid → PNG

For sequence/ER/state/gitgraph diagrams where auto-layout beats hand placement:

```bash
npx -y @mermaid-js/mermaid-cli -i diagram.mmd -o diagram.png -s 3 -b white -c mermaid.config.json
```

- `-s 3` — 3x scale for crisp text (mandatory; default 1x is blurry on slides)
- `-b white` — or the deck's `lightBg` hex so the image blends into the slide
- First run downloads a headless Chromium via puppeteer — allow a few minutes

**Match the deck palette** via a config file — Mermaid's default theme will
clash:

```json
{
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#EFF2F5",
    "primaryTextColor": "#1E293B",
    "primaryBorderColor": "#334155",
    "lineColor": "#334155",
    "fontFamily": "BIZ UDPGothic, Meiryo, sans-serif",
    "fontSize": "16px"
  }
}
```

Map: `primaryColor` ← `C.midBg`, `primaryTextColor` ← `C.darkText`,
`primaryBorderColor` / `lineColor` ← `C.main`. Never introduce colors outside
the deck's 3-color rule. If a flowchart-style diagram needs specific emphasis,
grouping frames, or icons, prefer the HTML templates — Mermaid's expressiveness
tops out quickly.

## Placing on the slide

```js
// pptxgenjs never reads the image file's real dimensions. `sizing:{type:"contain"}`
// fits relative to the DECLARED w/h — declaring the box size for both simply
// stretches the image to the box (a 1.65:1 render in a 2.0:1 box draws ~20% wider,
// and circles become ellipses). Compute the drawn size from the PNG header instead:
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; // IHDR width/height
}
function fitImage(file, box) { // box = {x, y, w, h} in inches; letterbox + center
  const px = pngSize(file);
  const scale = Math.min(box.w / px.w, box.h / px.h);
  const w = px.w * scale, h = px.h * scale;
  return { path: file, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

slide.addImage(fitImage("diagram.png", { x: 0.6, y: 1.2, w: 6.1, h: 3.7 }));
```

- **Never rely on `sizing:{type:"contain"}` (or bare w/h) to keep the aspect ratio** —
  always derive w/h from the file as above, or design the render canvas at exactly
  the target box's aspect ratio
- The image counts as the slide's rich visual, but the slide still needs
  **3+ supporting facts** next to or below it (see Content Density in SKILL.md);
  the `diagram-image` layout reserves a takeaway column for this
- `flow.html`-proportioned renders go full-width instead (e.g. `x:0.5, y:1.3,
  w:9.0, h:3.47`) with the takeaways as a row underneath

## Diagram QA (before placing)

Diagram text is invisible to `markitdown` and `layout_lint.py` — **the rendered
PNG is the only checkable artifact.** Read the PNG image itself (or hand it to
the visual-QA subagent with the slide renders) and check:

1. Mid-word Japanese wraps (語中折り返し) — every multi-line string
2. Text escaping its box / 3-line overflows in fixed-height nodes
3. Overlapping labels, labels colliding with connector lines
4. Arrowheads render as arrows (not squares/blobs) and point the right way
5. Accent used on at most 1-2 elements; everything else in `--main`/`--mid`
6. Canvas edges: nothing clipped, no large dead margins
7. Icon style consistency (one stroke family; brand marks recognizable)
