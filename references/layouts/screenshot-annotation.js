// ─────────────────────────────────────────────────────────────
// Layout: screenshot-annotation
// Description: Large placeholder rectangle representing a screenshot,
//   with numbered callout circles at key points, thin connector lines
//   from callouts toward target areas, and a legend below.
// Customization points:
//   - C palette: swap colors for different themes
//   - callouts array: update positions (cx, cy) and descriptions
//   - IMG_* constants: adjust the placeholder rectangle dimensions
//   - Replace addShape(RECTANGLE) placeholder with addImage() for real screenshots
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Cool Gray #12 ──────────────────────────────────
const C = {
  lightBg:  "F8FAFC",
  cardBg:   "FFFFFF",
  midBg:    "EFF2F5",
  main:     "334155",
  accent:   "94A3B8",
  white:    "FFFFFF",
  gray:     "4B5563",
  darkText: "1E293B",
  lightText:"6B7280",
};

const FONT = "BIZ UDPGothic";

// ── Image placeholder dimensions (~60% of slide area) ────
// Slide: 10" x 5.625"  (LAYOUT_16x9)
// Placeholder: 7.0" wide x 3.5" tall, left-aligned
const IMG_X = 0.5;
const IMG_Y = 1.15;
const IMG_W = 7.0;
const IMG_H = 3.10;

// ── Callout data ──────────────────────────────────────────
// cx, cy = center of the callout circle (in inches, absolute on slide)
// tx, ty = tip point that the line points toward (inside the image area)
// desc   = legend description
const CIRCLE_R = 0.17;   // half diameter of callout circle
const callouts = [
  {
    num: 1,
    cx: IMG_X + 1.40,  cy: IMG_Y + 0.55,   // top-left area (nav bar)
    tx: IMG_X + 0.85,  ty: IMG_Y + 0.30,
    desc: "グローバルナビゲーションバー — 現在のページが反転表示されている",
  },
  {
    num: 2,
    cx: IMG_X + 4.20,  cy: IMG_Y + 1.80,   // center (KPI cards)
    tx: IMG_X + 3.50,  ty: IMG_Y + 1.50,
    desc: "KPI サマリーカード — 前月比のデルタ値をアイコン付きで表示",
  },
  {
    num: 3,
    cx: IMG_X + 5.80,  cy: IMG_Y + 2.90,   // bottom-right (chart)
    tx: IMG_X + 6.20,  ty: IMG_Y + 3.10,
    desc: "トレンドグラフ — ホバー時にツールチップが出る（要: JS イベント実装）",
  },
];

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "screenshot-annotation layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("ダッシュボード UI — アノテーション付きスクリーンショット", {
    x: 0.5, y: 0.15, w: 9.0, h: 0.42,
    fontFace: FONT, fontSize: 15, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("ダッシュボード画面の主要な操作ポイントを番号付きで解説。\n新メンバーのオンボーディング資料として利用する。", {
    x: 0.5, y: 0.57, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Image placeholder ─────────────────────────────────
  // TODO: Replace this rectangle with addImage() when you have a real screenshot:
  //   slide.addImage({ path: "/path/to/screenshot.png",
  //     x: IMG_X, y: IMG_Y, w: IMG_W, h: IMG_H });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: IMG_X, y: IMG_Y, w: IMG_W, h: IMG_H,
    fill: { color: C.midBg },
    line: { color: C.accent, pt: 1 },
  });

  // Placeholder label inside the rectangle
  slide.addText("[ スクリーンショットをここに配置 ]", {
    x: IMG_X, y: IMG_Y + IMG_H / 2 - 0.18, w: IMG_W, h: 0.36,
    fontFace: FONT, fontSize: 10, color: C.lightText,
    align: "center", valign: "middle", margin: 0,
  });

  // Simulate UI panels inside the placeholder with lighter rectangles
  // Top nav bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: IMG_X, y: IMG_Y, w: IMG_W, h: 0.42,
    fill: { color: C.main },
    line: { color: C.main, pt: 0 },
  });
  // Left sidebar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: IMG_X, y: IMG_Y + 0.42, w: 1.10, h: IMG_H - 0.42,
    fill: { color: "DDE3EA" },
    line: { color: "DDE3EA", pt: 0 },
  });
  // KPI card area (3 boxes)
  [0, 1, 2].forEach((ci) => {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: IMG_X + 1.20 + ci * 1.65, y: IMG_Y + 0.55, w: 1.50, h: 0.72,
      fill: { color: C.cardBg },
      line: { color: "CBD5E1", pt: 0.5 },
      rectRadius: 0.04,
    });
  });
  // Chart area
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: IMG_X + 1.20, y: IMG_Y + 1.45, w: 5.65, h: 1.85,
    fill: { color: C.cardBg },
    line: { color: "CBD5E1", pt: 0.5 },
    rectRadius: 0.04,
  });

  // ── Connector lines from callout circles to target points ──
  callouts.forEach((co) => {
    // Line from callout circle edge toward the target tip
    // Determine circle edge closest to target
    const dx = co.tx - co.cx;
    const dy = co.ty - co.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const edgeX = co.cx + (dx / dist) * CIRCLE_R;
    const edgeY = co.cy + (dy / dist) * CIRCLE_R;

    // Normalize line coordinates — negative w/h corrupts the file in PowerPoint.
    const lw = co.tx - edgeX;
    const lh = co.ty - edgeY;
    slide.addShape(pres.shapes.LINE, {
      x: lw >= 0 ? edgeX : co.tx,
      y: lh >= 0 ? edgeY : co.ty,
      w: Math.abs(lw),
      h: Math.abs(lh),
      flipH: lw < 0,
      flipV: lh < 0,
      line: { color: C.main, pt: 1.2, dashType: "dash" },
    });
  });

  // ── Callout circles (drawn after lines so they appear on top) ──
  const CIRCLE_D = CIRCLE_R * 2;
  callouts.forEach((co) => {
    slide.addShape(pres.shapes.OVAL, {
      x: co.cx - CIRCLE_R, y: co.cy - CIRCLE_R,
      w: CIRCLE_D, h: CIRCLE_D,
      fill: { color: C.main },
      line: { color: C.white, pt: 1.5 },
    });
    slide.addText(String(co.num), {
      x: co.cx - CIRCLE_R, y: co.cy - CIRCLE_R,
      w: CIRCLE_D, h: CIRCLE_D,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
  });

  // ── Legend below the image ────────────────────────────
  const LEGEND_Y = IMG_Y + IMG_H + 0.18;
  const LEGEND_ITEM_H = 0.30;

  callouts.forEach((co, li) => {
    const ly = LEGEND_Y + li * (LEGEND_ITEM_H + 0.06);

    // Number badge (small circle)
    slide.addShape(pres.shapes.OVAL, {
      x: 0.5, y: ly + (LEGEND_ITEM_H - 0.22) / 2,
      w: 0.22, h: 0.22,
      fill: { color: C.main },
      line: { color: C.main, pt: 0 },
    });
    slide.addText(String(co.num), {
      x: 0.5, y: ly + (LEGEND_ITEM_H - 0.22) / 2,
      w: 0.22, h: 0.22,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Description
    slide.addText(co.desc, {
      x: 0.80, y: ly, w: 8.7, h: LEGEND_ITEM_H,
      fontFace: FONT, fontSize: 10, color: C.gray,
      valign: "middle", margin: 0,
    });
  });

  const outFile = path.join(__dirname, "screenshot-annotation.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
