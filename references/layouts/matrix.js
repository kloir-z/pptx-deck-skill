// ─────────────────────────────────────────────────────────────
// Layout: matrix
// Description: 2x2 quadrant grid (Eisenhower priority matrix).
//   Two crossing lines divide a content area into four quadrants.
//   Each quadrant has a colored fill, a bold title, and 2-3 bullet
//   items. Axis labels on the edges identify the dimensions.
// Customization points:
//   - C palette: swap colors for different themes
//   - quadrants array: replace titles, bullets, and fill colors
//   - CONTENT_* constants: reposition the content area
//   - LINE_PT: adjust cross-line thickness
//   - AXIS label text: replace dimension names
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Indigo + Lavender #13 ──────────────────────────
const C = {
  lightBg:  "F5F3FF",
  cardBg:   "FFFFFF",
  midBg:    "EDE9FE",
  main:     "3730A3",
  accent:   "A78BFA",
  white:    "FFFFFF",
  gray:     "4B5563",
  darkText: "1E293B",
  lightText:"6B7280",
};

const FONT = "BIZ UDPGothic";
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.08 });

// ── Quadrant data (top-left → top-right → bottom-left → bottom-right) ──
// order: [topLeft, topRight, bottomLeft, bottomRight]
const quadrants = [
  {
    title:   "今すぐやる",
    bullets: ["本番障害の対応", "締め切り間近のタスク", "重要な顧客対応"],
    fill:    "DDD6FE",  // vivid lavender — urgent + important
    textCol: "3730A3",
  },
  {
    title:   "スケジュールに入れる",
    bullets: ["スキルアップ計画", "長期戦略の立案", "チームビルディング"],
    fill:    "EDE9FE",  // soft lavender — not urgent + important
    textCol: "4338CA",
  },
  {
    title:   "委任する",
    bullets: ["ルーティン報告", "定例ミーティング", "軽微な問い合わせ対応"],
    fill:    "F5F3FF",  // very light — urgent + not important
    textCol: "6B7280",
  },
  {
    title:   "やめる・後回し",
    bullets: ["不要な資料作成", "形骸化した作業", "優先度の低い雑務"],
    fill:    "FFFFFF",  // white — not urgent + not important
    textCol: "9CA3AF",
  },
];

// ── Layout constants ──────────────────────────────────────
// Content area (space reserved for the 2x2 grid)
const CONTENT_X = 1.40;  // left margin for y-axis label; rotated label visual left edge ≈ 0.85"
const CONTENT_Y = 1.40;
const CONTENT_W = 7.60;  // right edge stays at 9.00" (10.00 - 1.00 right margin)
const CONTENT_H = 3.50;  // increased from 3.40 for better quadrant height

// Each quadrant size
const Q_W = CONTENT_W / 2;  // 3.80"
const Q_H = CONTENT_H / 2;  // 1.75"

// Center cross point
const CENTER_X = CONTENT_X + Q_W;
const CENTER_Y = CONTENT_Y + Q_H;

const LINE_PT = 2.0;

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "matrix layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("アイゼンハワーマトリクス：タスク優先度分類", {
    x: 0.5, y: 0.18, w: 9.0, h: 0.48,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("重要度と緊急度の2軸でタスクを4象限に分類。\n優先順位の判断基準を全員で共有するためのフレームワーク。", {
    x: 0.5, y: 0.66, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Quadrant fills ──
  // [col, row] offsets: topLeft(0,0), topRight(1,0), bottomLeft(0,1), bottomRight(1,1)
  const positions = [
    { col: 0, row: 0 },
    { col: 1, row: 0 },
    { col: 0, row: 1 },
    { col: 1, row: 1 },
  ];

  quadrants.forEach((q, i) => {
    const { col, row } = positions[i];
    const qx = CONTENT_X + col * Q_W;
    const qy = CONTENT_Y + row * Q_H;

    // Quadrant fill rectangle
    slide.addShape(pres.shapes.RECTANGLE, {
      x: qx, y: qy, w: Q_W, h: Q_H,
      fill: { color: q.fill },
      line: { color: q.fill, pt: 0 },
    });

    // Quadrant title
    slide.addText(q.title, {
      x: qx + 0.14, y: qy + 0.12, w: Q_W - 0.28, h: 0.34,
      fontFace: FONT, fontSize: 12, bold: true, color: q.textCol,
      valign: "middle", margin: 0,
    });

    // Bullet items
    const bulletItems = q.bullets.map((b) => ({
      text: b,
      options: { bullet: { code: "2022" }, indentLevel: 0 },
    }));
    slide.addText(bulletItems, {
      x: qx + 0.18, y: qy + 0.52, w: Q_W - 0.32, h: Q_H - 0.66,
      fontFace: FONT, fontSize: 10, color: q.textCol,
      valign: "top", margin: [0, 0, 0, 0],
      paraSpaceAfter: 2,
    });
  });

  // ── Cross lines (drawn on top of fills) ──
  // Vertical line
  slide.addShape(pres.shapes.LINE, {
    x: CENTER_X, y: CONTENT_Y, w: 0, h: CONTENT_H,
    line: { color: C.main, pt: LINE_PT },
  });
  // Horizontal line
  slide.addShape(pres.shapes.LINE, {
    x: CONTENT_X, y: CENTER_Y, w: CONTENT_W, h: 0,
    line: { color: C.main, pt: LINE_PT },
  });

  // ── Axis labels ──
  // X-axis label (bottom center of content area)
  slide.addText("Low  ←  重要度  →  High", {
    x: CONTENT_X, y: CONTENT_Y + CONTENT_H + 0.10, w: CONTENT_W, h: 0.26,
    fontFace: FONT, fontSize: 10, color: C.gray,
    align: "center", valign: "middle", margin: 0,
  });

  // Y-axis label (rotated 270°)
  // rotate: 270 rotates around the center of the UNROTATED bounding box.
  // We want the label centered vertically with the grid, just to its left.
  // Desired visual center: x ≈ CONTENT_X - 0.4, y = CONTENT_Y + CONTENT_H / 2
  // Unrotated box: w = 2.0 (just wide enough for the text — keeps the
  // pre-rotation box inside the slide canvas), h = 0.30 (narrow)
  // Center = (x + w/2, y + h/2), so solve for x, y:
  const Y_AXIS_LABEL_W = 2.0;
  const yAxisCenterX = CONTENT_X - 0.4;
  const yAxisCenterY = CONTENT_Y + CONTENT_H / 2;
  slide.addText("Low ← 緊急度 → High", {
    x: yAxisCenterX - Y_AXIS_LABEL_W / 2,
    y: yAxisCenterY - 0.15,
    w: Y_AXIS_LABEL_W,
    h: 0.30,
    fontFace: FONT, fontSize: 10, color: C.gray,
    align: "center", valign: "middle", margin: 0,
    rotate: 270,
  });

  const outFile = path.join(__dirname, "matrix.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
