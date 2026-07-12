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
- `\n` inside a run starts a **new paragraph** — in a bulleted run each line
  gets its own bullet. For a wrapped bullet item, either keep it to one line
  or use a bold-label run (with `bullet`) followed by a plain run.
- Bullets: `bullet: { indent: 14 }` on the run; `paraSpaceAfter: 5` for gaps.
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
