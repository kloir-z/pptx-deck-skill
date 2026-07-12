// ─────────────────────────────────────────────────────────────
// Layout: chart
// Description: Native PptxGenJS bar chart (column) with modern styling.
//   Title placed via addText for full positioning control.
//   Two data series, four quarters, custom palette colors,
//   white chart area, muted axis labels, subtle grid lines, data labels.
// Customization points:
//   - C palette: swap colors for different themes
//   - chartColors: match to palette or brand colors
//   - chartData: replace series names, labels, and values
//   - Chart position/size (x, y, w, h): adjust to slide layout
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

// ── Chart data: quarterly revenue comparison ──────────────
// Two product lines across 4 quarters (unit: 百万円)
const chartData = [
  {
    name: "プロダクト A",
    labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    values: [42, 58, 63, 79],
  },
  {
    name: "プロダクト B",
    labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    values: [31, 37, 45, 54],
  },
];

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "chart layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title (via addText for full control) ──
  slide.addText("四半期別売上推移（2024年度）", {
    x: 0.5, y: 0.18, w: 9.0, h: 0.48,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Slide subtitle ──
  slide.addText("月次売上の推移を棒グラフで可視化。前年比との差分から\n成長トレンドと季節変動のパターンを読み取れる。", {
    x: 0.5, y: 0.66, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Unit annotation ──
  slide.addText("単位：百万円", {
    x: 0.5, y: 1.02, w: 9.0, h: 0.28,
    fontFace: FONT, fontSize: 10, color: C.lightText,
    valign: "middle", margin: 0,
  });

  // ── Bar chart (column) ──
  slide.addChart(pres.charts.BAR, chartData, {
    x: 0.5, y: 1.35, w: 9.0, h: 4.00,
    barDir: "col",

    // Colors matching palette (main, then a lighter complement)
    chartColors: ["334155", "94A3B8"],

    // Clean white chart background
    chartArea: { fill: { color: C.white }, roundedCorners: false },

    // Muted axis labels
    catAxisLabelColor: C.gray,
    valAxisLabelColor: C.gray,
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,

    // Value axis: start at 0, reasonable max
    valAxisMinVal: 0,
    valAxisMaxVal: 90,

    // Subtle grid on value axis only
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },

    // Data labels on bars
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: C.darkText,
    dataLabelFontSize: 10,

    // Show legend (two series)
    showLegend: true,
    legendPos: "b",
    legendColor: C.gray,
    legendFontSize: 10,

    // Gap between grouped bars
    barGapWidthPct: 50,
  });

  const outFile = path.join(__dirname, "chart.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
