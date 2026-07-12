// ─────────────────────────────────────────────────────────────
// Layout: pyramid
// Description: 4-tier centered pyramid representing a hierarchy or
//   maturity model. Each tier is a RECTANGLE of decreasing width
//   (bottom widest, top narrowest), stacked with a small gap.
//   Fill shades graduate from darkest at the bottom to lightest at
//   the top. Labels are centered in each tier with contrast-appropriate
//   text color.
// Customization points:
//   - C palette: swap colors for different themes
//   - tiers array: replace labels, widths, fills, and text colors
//   - TIER_H: uniform tier height
//   - TIER_GAP: vertical gap between tiers
//   - PYRAMID_TOP_Y: vertical start of the pyramid block
//   - SLIDE_CENTER_X: horizontal center (default 5.0")
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Warm Gray #11 ──────────────────────────────────
const C = {
  lightBg:  "FAF9F7",
  cardBg:   "FFFFFF",
  midBg:    "F0EEEB",
  main:     "44403C",
  accent:   "A8A29E",
  white:    "FFFFFF",
  gray:     "4B5563",
  darkText: "292524",
  lightText:"6B7280",
};

const FONT = "BIZ UDPGothic";
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.10 });

// ── Tier data (bottom → top) ─────────────────────────────────
// widths: 7.0, 5.5, 4.0, 2.5  (each tier narrows by 1.5" from the one below)
// fills shade from darkest (C.main = "44403C") to lightest (C.midBg = "F0EEEB")
const tiers = [
  { label: "Foundation",   sublabel: "基盤技術・インフラ",       w: 7.0, fill: "44403C", textColor: "FFFFFF" },
  { label: "Development",  sublabel: "開発ツール・フレームワーク", w: 5.5, fill: "78716C", textColor: "FFFFFF" },
  { label: "Integration",  sublabel: "システム統合・API連携",     w: 4.0, fill: "C7C3BE", textColor: "292524" },
  { label: "Innovation",   sublabel: "AI・先端技術活用",          w: 2.5, fill: "F0EEEB", textColor: "292524" },
];

// ── Layout constants ──────────────────────────────────────
const SLIDE_CENTER_X = 5.0;
const TIER_H         = 0.85;  // uniform height of each tier rectangle
const TIER_GAP       = 0.05;  // vertical gap between tiers
const N              = tiers.length;
const TOTAL_PYRAMID_H = N * TIER_H + (N - 1) * TIER_GAP;
// Center pyramid vertically (title + subtitle reserve 1.20", leave footer space)
const PYRAMID_TOP_Y  = (5.625 - 1.20 - TOTAL_PYRAMID_H) / 2 + 1.20;

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "pyramid layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("テクノロジー成熟度モデル", {
    x: 0.5, y: 0.18, w: 9.0, h: 0.46,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    align: "center", valign: "middle", margin: 0,
  });

  // ── Slide subtitle ──
  slide.addText("組織構造をピラミッド型で表現。上位層ほど人数が少なく\n意思決定権限が大きいことを視覚的に示している。", {
    x: 0.5, y: 0.64, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    align: "center", valign: "top", margin: 0,
  });

  // ── Tiers (rendered bottom-to-top in data order index 0 = bottom) ──
  // We draw from bottom to top so index 0 is the lowest tier (highest y).
  tiers.forEach((tier, i) => {
    // i=0 is bottom tier → highest y value
    const tierY = PYRAMID_TOP_Y + (N - 1 - i) * (TIER_H + TIER_GAP);
    const tierX = SLIDE_CENTER_X - tier.w / 2;

    // Tier rectangle
    slide.addShape(pres.shapes.RECTANGLE, {
      x: tierX, y: tierY, w: tier.w, h: TIER_H,
      fill: { color: tier.fill },
      line: { color: tier.fill, pt: 0 },
      shadow: makeShadow(),
    });

    // Main label (centered)
    slide.addText(tier.label, {
      x: tierX + 0.15, y: tierY + 0.06, w: tier.w - 0.30, h: TIER_H * 0.52,
      fontFace: FONT, fontSize: 13, bold: true, color: tier.textColor,
      align: "center", valign: "middle", margin: 0,
    });

    // Sub-label (smaller, below main label)
    slide.addText(tier.sublabel, {
      x: tierX + 0.15, y: tierY + TIER_H * 0.52, w: tier.w - 0.30, h: TIER_H * 0.40,
      fontFace: FONT, fontSize: 10, color: tier.textColor,
      align: "center", valign: "middle", margin: 0,
    });
  });

  // ── Tier level badges on the left side ──
  tiers.forEach((tier, i) => {
    const tierY = PYRAMID_TOP_Y + (N - 1 - i) * (TIER_H + TIER_GAP);
    const tierX = SLIDE_CENTER_X - tier.w / 2;
    const badgeX = tierX - 0.70;

    // Level number badge
    slide.addText(`Lv ${i + 1}`, {
      x: badgeX, y: tierY, w: 0.55, h: TIER_H,
      fontFace: FONT, fontSize: 10, color: C.gray,
      align: "right", valign: "middle", margin: 0,
    });
  });

  // ── Caption at bottom ──
  const captionY = PYRAMID_TOP_Y + TOTAL_PYRAMID_H + 0.10;
  slide.addText("下層が基盤となり、上層の高度な活用を支える", {
    x: 0.5, y: captionY, w: 9.0, h: 0.26,
    fontFace: FONT, fontSize: 10, color: C.lightText,
    align: "center", valign: "middle", margin: 0,
  });

  const outFile = path.join(__dirname, "pyramid.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
