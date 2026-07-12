// ─────────────────────────────────────────────────────────────
// Layout: gantt
// Description: Project schedule Gantt chart with month columns,
//   task label column on the left, and colored task bars spanning
//   their duration. Alternating row backgrounds for readability.
//   Vertical grid lines separate months. One accent-colored bar
//   highlights the key development task. Optional today marker.
//   Fully data-driven via tasks/months arrays.
// Customization points:
//   - C palette: swap colors for different themes
//   - tasks array: replace names, start/end column indices
//   - months array: replace with actual month labels
//   - labelW: adjust task name column width
//   - rowH / barH: adjust row and bar heights
//   - accentTask: name of task to highlight with C.accent color
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Navy + Orange #1 ─────────────────────────────
const C = {
  lightBg:  "F8FAFC",
  cardBg:   "FFFFFF",
  midBg:    "EFF6FF",
  main:     "1E3A8A",
  accent:   "F97316",
  white:    "FFFFFF",
  gray:     "4B5563",
  darkText: "1E293B",
  lightText:"6B7280",
};

const FONT = "BIZ UDPGothic";
const makeShadow = () => ({ type: "outer", color: "000000", blur: 3, offset: 1, angle: 135, opacity: 0.07 });

// ── Task data ─────────────────────────────────────────────
// start/end are 0-based column indices into the months array.
// A task from start=0, end=1 spans columns 0 and 1 (April–May).
// start/end are 0-based column indices. Max end = months.length - 1.
const tasks = [
  { name: "要件定義",       start: 0, end: 1 },
  { name: "基本設計",       start: 1, end: 2 },
  { name: "詳細設計",       start: 2, end: 3 },
  { name: "開発",          start: 2, end: 4 },
  { name: "テスト",        start: 3, end: 4 },
  { name: "ユーザーテスト", start: 4, end: 4 },
  { name: "リリース準備",   start: 4, end: 5 },
];
const months = ["4月", "5月", "6月", "7月", "8月", "9月"];

// Task name to highlight with accent color
const accentTask = "開発";

// Today marker: column offset (fractional). e.g. 3.5 = mid-July.
// Set to null to disable.
const todayOffset = 3.5;

// ── Layout constants ──────────────────────────────────────
const SLIDE_W      = 10.0;
// const SLIDE_H   = 5.625;  // reference only

const leftMargin   = 0.5;
const rightMargin  = 0.5;
const labelW       = 2.0;   // task name column width
const titleH       = 1.2;   // slide title area height (extended to accommodate subtitle)
const headerH      = 0.4;   // month header row height
const rowH         = 0.5;   // each task row height
const barH         = 0.3;   // bar height inside row
const barPad       = 0.05;  // horizontal padding inside bar

const gridX        = leftMargin + labelW;            // 2.5"
const gridW        = SLIDE_W - gridX - rightMargin;  // 7.0"
const colW         = gridW / months.length;          // ~1.167"
const headerY      = titleH;                         // month headers start after title
const gridStartY   = headerY + headerH;              // task rows start = 1.2"

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "gantt layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("プロジェクトスケジュール", {
    x: leftMargin, y: 0.15, w: SLIDE_W - leftMargin - rightMargin, h: 0.5,
    fontFace: FONT, fontSize: 28, bold: true, color: C.darkText, // Reduced from 36-44pt standard — dense grid needs vertical space
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("プロジェクト全体のスケジュールを月別に可視化。\nクリティカルパスとマイルストーンの関係を一目で確認できる。", {
    x: 0.5, y: 0.65, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Alternating row backgrounds ──
  tasks.forEach((task, i) => {
    const rowY = gridStartY + i * rowH;
    const rowFill = i % 2 === 0 ? C.cardBg : C.midBg;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: leftMargin,
      y: rowY,
      w: SLIDE_W - leftMargin - rightMargin,
      h: rowH,
      fill: { color: rowFill },
      line: { color: rowFill, pt: 0 },
    });
  });

  // ── Month header row ──
  months.forEach((month, i) => {
    const hx = gridX + i * colW;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: hx, y: headerY, w: colW, h: headerH,
      fill: { color: C.main },
      line: { color: C.main, pt: 0 },
    });
    slide.addText(month, {
      x: hx, y: headerY, w: colW, h: headerH,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
  });

  // ── Vertical grid lines ──
  const gridTotalH = tasks.length * rowH;
  for (let i = 0; i <= months.length; i++) {
    const lx = gridX + i * colW;
    slide.addShape(pres.shapes.LINE, {
      x: lx, y: gridStartY, w: 0, h: gridTotalH,
      line: { color: C.lightText, pt: 0.5 },
    });
  }

  // ── Task labels ──
  tasks.forEach((task, i) => {
    const labelY = gridStartY + i * rowH;
    slide.addText(task.name, {
      x: leftMargin + 0.1,
      y: labelY,
      w: labelW - 0.2,
      h: rowH,
      fontFace: FONT, fontSize: 11, color: C.darkText,
      valign: "middle", margin: 0,
    });
  });

  // ── Task bars ──
  tasks.forEach((task, i) => {
    const barX = gridX + task.start * colW + barPad;
    const barW = (task.end - task.start + 1) * colW - 2 * barPad;
    const barY = gridStartY + i * rowH + (rowH - barH) / 2;
    const fillColor = task.name === accentTask ? C.accent : C.main;

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: barX, y: barY, w: barW, h: barH,
      fill: { color: fillColor },
      line: { color: fillColor, pt: 0 },
      shadow: makeShadow(),
      rectRadius: 0.05,
    });
  });

  // ── Today marker ──
  if (todayOffset !== null) {
    const todayX = gridX + todayOffset * colW;
    slide.addShape(pres.shapes.LINE, {
      x: todayX, y: gridStartY - 0.05,
      w: 0, h: gridTotalH + 0.05,
      line: { color: C.accent, pt: 1.5, dashType: "dash" },
    });
    // Label below the grid (avoid overlap with month headers)
    slide.addText("▲ Today", {
      x: todayX - 0.4, y: gridStartY + gridTotalH + 0.05, w: 0.8, h: 0.22,
      fontFace: FONT, fontSize: 10, bold: true, color: C.accent,
      align: "center", valign: "middle", margin: 0,
    });
  }

  const outFile = path.join(__dirname, "gantt.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
