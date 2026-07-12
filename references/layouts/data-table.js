// ─────────────────────────────────────────────────────────────
// Layout: data-table
// Description: Styled comparison table with header row, alternating body rows,
//   left-aligned label column, and centered data columns.
// Customization points:
//   - C palette: swap colors for different themes
//   - plans / rows: replace with actual comparison data
//   - colW: adjust column widths to fit content
//   - rowH: adjust row height (keep small to avoid LibreOffice row expansion)
//   - fontSize: 9pt works well for dense tables; drop to 8pt for 20+ rows
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Monochrome B&W (#10) ──────────────────────────
const C = {
  lightBg:  "FAFAFA",
  cardBg:   "FFFFFF",
  midBg:    "F0F0F0",
  main:     "1A1A1A",
  accent:   "6B7280",
  white:    "FFFFFF",
  gray:     "4B5563",
  darkText: "1A1A1A",
  lightText:"6B7280",
};

const FONT = "BIZ UDPGothic";

// ── Main ────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "data-table layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("機能比較：プロジェクト管理ツール", {
    x: 0.5, y: 0.18, w: 9, h: 0.42,
    fontFace: FONT, fontSize: 15, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("主要サービスの可用性と応答速度を一覧で比較。SLA達成状況の\n判定基準として四半期レビューで参照する。", {
    x: 0.5, y: 0.60, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Table data ──
  // Columns: 機能, Jira, Linear, Asana, Notion, Basecamp
  const headers = ["機能", "Jira", "Linear", "Asana", "Notion", "Basecamp"];
  const rows = [
    ["カンバンボード",     "◎", "◎", "◎", "◎", "○"],
    ["ガントチャート",     "◎", "×", "◎", "△", "◎"],
    ["スプリント管理",     "◎", "◎", "△", "×", "×"],
    ["カスタムフィールド", "◎", "◎", "◎", "◎", "×"],
    ["タイムライン",       "○", "△", "◎", "△", "◎"],
    ["API / 連携数",       "300+", "80+", "200+", "100+", "50+"],
  ];

  // Column widths: label col wide, data cols equal
  // Total = 9.0" (within 0.5" margins → slide edge at 9.5")
  const colW = [2.5, 1.3, 1.3, 1.3, 1.3, 1.3];

  // Header row
  const headerRow = headers.map((h, ci) => ({
    text: h,
    options: {
      bold: true,
      fontFace: FONT,
      fontSize: 9,
      color: C.white,
      fill: { color: C.main },
      align: ci === 0 ? "left" : "center",
      valign: "middle",
      margin: ci === 0 ? [0, 0, 0, 0.08] : 0,
    },
  }));

  // Data rows with alternating fill
  const dataRows = rows.map((row, ri) => {
    const rowBg = ri % 2 === 0 ? C.cardBg : C.midBg;
    return row.map((cell, ci) => ({
      text: cell,
      options: {
        fontFace: FONT,
        fontSize: 9,
        color: ci === 0 ? C.darkText : C.accent,
        bold: ci === 0,
        align: ci === 0 ? "left" : "center",
        valign: "middle",
        fill: { color: ci === 0 ? (ri % 2 === 0 ? "EBEBEB" : C.midBg) : rowBg },
        margin: ci === 0 ? [0, 0, 0, 0.08] : 0,
      },
    }));
  });

  slide.addTable([headerRow, ...dataRows], {
    x: 0.5, y: 1.12, w: 9.0,
    colW,
    rowH: 0.48,
    border: { pt: 0.5, color: "DDDDDD" },
  });

  // ── Footer note ──
  slide.addText("◎ 標準搭載  ○ 部分対応  △ 限定的  × 非対応", {
    x: 0.5, y: 4.56, w: 9, h: 0.22,
    fontFace: FONT, fontSize: 10, color: C.lightText, margin: 0,
  });

  const outFile = path.join(__dirname, "data-table.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
