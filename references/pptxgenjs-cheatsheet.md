# PptxGenJS notes for this skill

Condensed field notes for the API surface the layout library uses.
Full upstream docs: https://gitbrent.github.io/PptxGenJS/

## Setup

```js
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";          // canvas = 10 x 5.625 inches
pres.author = "…"; pres.title = "…";
const s = pres.addSlide();
s.background = { color: "F8FAFC" };   // hex WITHOUT '#'
await pres.writeFile({ fileName: "deck.pptx" });
```

All positions/sizes are **inches** (numbers). Colors are 6-digit hex strings
without `#`.

## Text

```js
s.addText("string or runs", {
  x, y, w, h,
  fontFace: "BIZ UDPGothic",   // set on EVERY text call
  fontSize: 13, bold: true, color: "1E293B",
  align: "left|center|right", valign: "top|middle|bottom",
  margin: 0,                    // default inset is nonzero — usually set 0
  lineSpacingMultiple: 1.12,
  charSpacing: 1,
});
```

- Multi-style paragraphs: pass an array of runs
  `[{ text, options: { bold: true, breakLine: false } }, …]`.
  `breakLine: true` ends the paragraph.
- Bullets: `bullet: { indent: 14 }` on the run; `paraSpaceAfter: 5` for gaps.
- **Bullet items: one paragraph = one bullet — budget each item to ONE line.**
  Verified render behavior:
  - `\n` inside a bulleted run starts a new paragraph and **mints another
    bullet on every line** — never do this.
  - A long item without `\n` auto-wraps under a single bullet with a clean
    hanging indent, but CJK auto-wrap can split mid-word and strand a lone
    trailing character.
  - So: compute the char budget (`boxWidth × 72 / fontSize` full-width chars)
    and shorten each item until it fits one line, or split the thought into
    two items / a bold-label run + plain run.
- There is no auto-fit; do the size math yourself before writing the call.

## Shapes

```js
const RECT = pres.shapes.RECTANGLE, RREC = pres.shapes.ROUNDED_RECTANGLE,
      OVAL = pres.shapes.OVAL, CHEV = pres.shapes.CHEVRON, LINE = pres.shapes.LINE;

s.addShape(RREC, { x, y, w, h,
  fill: { color: "FFFFFF" },                    // or { type: "none" }
  line: { color: "E2E8F0", pt: 1 },             // or { type: "none" }
  rectRadius: 0.05,                             // rounded corners (in)
  shadow: { type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.10 },
});
s.addShape(LINE, { x, y, w, h: 0, line: { color: "334155", pt: 1.5, endArrowType: "triangle" } });
```

Text inside a shape: prefer a separate `addText` over shape-embedded text —
placement is more predictable.

## Tables

```js
s.addTable([headerRow, ...bodyRows], {
  x, y, w, colW: [1.5, 3.7, 3.8],
  rowH: 0.36, autoPage: false,
  border: { pt: 0.5, color: "DDE3EA" },
});
// each cell: { text, options: { fontFace, fontSize, bold, color, fill: { color },
//              align, valign, margin: [t, r, b, l] } }
```

Always set `autoPage: false` and control the row count yourself; alternate
`fill` per row for striping.

## Images

```js
s.addImage({ path: "img.png", x, y, w, h });
```

**pptxgenjs never opens the image file.** It cannot know the real aspect
ratio, so `sizing: { type: "contain" | "cover" }` scales relative to the
`w`/`h` you declared — declaring the target box for both is a silent stretch.
Always compute `w`/`h` from the file's pixel size; helpers (`imgSize`,
`fitImage`, `coverImage`) live in [user-images.md](user-images.md).
`cover` does crop correctly (emits `a:srcRect`) once the declared `w`/`h`
carries the true ratio.

## Charts

```js
s.addChart(pres.charts.BAR, [{ name: "系列", labels: [...], values: [...] }], {
  x, y, w, h,
  barDir: "col", chartColors: ["0EA5E9"],
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
  showLegend: false, showValue: true, dataLabelFontSize: 10,
});
```

Keep chart colors inside the deck's 3-color palette.

## Standard slide chrome (proven geometry, 10 × 5.625" canvas)

Coordinates that have survived visual QA — start here instead of guessing:

- **Two-tier title**: topic label 13–14pt bold accent-color at `y:0.32 h:0.26`;
  conclusion sentence 19pt bold at `y:0.60 h:0.78` (2 lines max, explicit `\n`
  at a phrase boundary when it wraps).
- **Content zone**: `y:1.62` down to ~4.6. Bottom note band at `y ≥ 4.5` with
  `y + h ≤ 5.125` (0.5" bottom margin).
- **Page number**: `x:8.55 y:5.28 w:0.95` right-aligned 10pt — keep the
  bottom-right corner clear of other elements.
- **Left accent bar on a card**: bar `w:0.07` at the card's `x`; the text
  block starts at `x + 0.24`. Never give a bar and its text the same `x` —
  the bar overlaps the first character.
- **Cards in a row**: 3 cards → `w:2.93 gap:0.11` from `x:0.5`; 2 columns →
  `w:4.4` at `x:0.5` and `x:5.1`.

## Notes, page numbers

```js
s.addNotes("speaker notes / sources");
s.slideNumber = { x: 8.55, y: 5.28, w: 0.95, h: 0.24,
                  fontFace: FONT, fontSize: 10, color: "6B7280", align: "right" };
```

`slideNumber` inserts a live number field; `scripts/add_slide_total.py`
appends "` / N`" to that field post-generation.

## Pitfalls checklist

- Hex colors with `#` → silently broken fills.
- Forgot `margin: 0` → text floats away from its box edge.
- Text glyph arrows (`→`) between boxes → misalign across renderers; use shapes.
- `\n` in bulleted runs → duplicated bullets (see Text above).
- Shadows on tiny shapes → muddy; reserve for cards.
- Fonts not set per call → renderer default (not BIZ UDPGothic).
- 9.5pt looks harmless but breaks the 10pt floor — `layout_lint.py` rejects it.
  When body text feels tight, cut words or widen the box, don't shave points.
- Verifying the install: `require('pptxgenjs')` works;
  `require('pptxgenjs/package.json')` throws (blocked by package `exports`).
