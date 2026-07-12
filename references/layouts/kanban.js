// ─────────────────────────────────────────────────────────────
// Layout: kanban
// Description: 4-column Kanban board with column headers and task
//   cards. Each column has a colored header (RECTANGLE) and a body
//   area (RECTANGLE) containing 2-3 ROUNDED_RECTANGLE cards with
//   shadow. Cards show a task title and an assignee line.
//   Fully data-driven via columns/cards arrays.
// Customization points:
//   - C palette: swap colors for different themes
//   - columns array: replace column names and accent colors
//   - cards array: replace titles, assignees, and target columns
//   - COL_W / COL_GAP: adjust column width and inter-column spacing
//   - CARD_H / CARD_GAP: adjust card height and vertical spacing
//   - HEADER_H: adjust column header height
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
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.08 });

// ── Column definitions ────────────────────────────────────
const columns = [
  { id: "backlog",     label: "Backlog",  headerFill: "78716C" },
  { id: "in-progress", label: "進行中",   headerFill: "44403C" },
  { id: "review",      label: "レビュー", headerFill: "57534E" },
  { id: "done",        label: "完了",     headerFill: "A8A29E" },
];

// ── Card data ─────────────────────────────────────────────
const cards = [
  // Backlog
  { col: "backlog",      title: "ダッシュボード UI 設計",       assignee: "田中 花子" },
  { col: "backlog",      title: "API レートリミット対応",        assignee: "鈴木 一郎" },
  { col: "backlog",      title: "ドキュメント整備",              assignee: "未割当" },
  // 進行中
  { col: "in-progress",  title: "認証フロー実装",               assignee: "佐藤 大輔" },
  { col: "in-progress",  title: "DB マイグレーション",           assignee: "田中 花子" },
  // レビュー
  { col: "review",       title: "検索機能 PR #42",              assignee: "山本 さくら" },
  { col: "review",       title: "エラーハンドリング改善",        assignee: "鈴木 一郎" },
  // 完了
  { col: "done",         title: "ログイン画面リデザイン",        assignee: "山本 さくら" },
  { col: "done",         title: "CI/CD パイプライン設定",        assignee: "佐藤 大輔" },
  { col: "done",         title: "初期リリース準備",              assignee: "田中 花子" },
];

// ── Layout constants ──────────────────────────────────────
const MARGIN_X     = 0.50;  // left & right edge margin
const SLIDE_W      = 10.0;
const SLIDE_H      = 5.625;

const N_COLS       = columns.length;
const COL_GAP      = 0.10;  // gap between columns
const TOTAL_COL_W  = SLIDE_W - MARGIN_X * 2;              // 9.0"
const COL_W        = (TOTAL_COL_W - COL_GAP * (N_COLS - 1)) / N_COLS; // ~2.175"

const BOARD_TOP_Y  = 1.30;  // top of board (below slide title + subtitle)
const HEADER_H     = 0.45;
const BODY_TOP_Y   = BOARD_TOP_Y + HEADER_H;
const BODY_H       = SLIDE_H - BODY_TOP_Y - 0.35;        // leave bottom margin

const CARD_H       = 0.68;
const CARD_GAP     = 0.14;
const CARD_PADDING = 0.12;  // horizontal inset inside column body

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "kanban layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("スプリント カンバンボード", {
    x: MARGIN_X, y: 0.16, w: TOTAL_COL_W, h: 0.46,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Slide subtitle ──
  slide.addText("現在のタスク状況をカンバン形式で整理。各列のカード数から\nワークフローの滞留ポイントを把握できる。", {
    x: 0.5, y: 0.62, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Columns ──
  columns.forEach((col, colIdx) => {
    const colX = MARGIN_X + colIdx * (COL_W + COL_GAP);

    // Column header rectangle
    slide.addShape(pres.shapes.RECTANGLE, {
      x: colX, y: BOARD_TOP_Y, w: COL_W, h: HEADER_H,
      fill: { color: col.headerFill },
      line: { color: col.headerFill, pt: 0 },
    });

    // Column header label (inset 0.40 on both sides so it stays centered
    // and clear of the count badge on the right)
    slide.addText(col.label, {
      x: colX + 0.40, y: BOARD_TOP_Y, w: COL_W - 0.80, h: HEADER_H,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Column body background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: colX, y: BODY_TOP_Y, w: COL_W, h: BODY_H,
      fill: { color: C.midBg },
      line: { color: C.accent, pt: 0.75 },
    });

    // Count badge in header (number of cards)
    const colCards = cards.filter((c) => c.col === col.id);
    slide.addText(String(colCards.length), {
      x: colX + COL_W - 0.36, y: BOARD_TOP_Y + 0.08, w: 0.26, h: 0.28,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // ── Cards ──
    colCards.forEach((card, cardIdx) => {
      const cardX = colX + CARD_PADDING;
      const cardW = COL_W - CARD_PADDING * 2;
      const cardY = BODY_TOP_Y + CARD_GAP + cardIdx * (CARD_H + CARD_GAP);

      // Card rounded rectangle
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: cardW, h: CARD_H,
        fill: { color: C.cardBg },
        line: { color: C.accent, pt: 0.5 },
        shadow: makeShadow(),
        rectRadius: 0.06,
      });

      // Card title
      slide.addText(card.title, {
        x: cardX + 0.10, y: cardY + 0.07, w: cardW - 0.20, h: CARD_H * 0.52,
        fontFace: FONT, fontSize: 10, bold: true, color: C.darkText,
        valign: "top", margin: 0,
        wrap: true,
      });

      // Assignee line
      slide.addText(card.assignee, {
        x: cardX + 0.10, y: cardY + CARD_H * 0.56, w: cardW - 0.20, h: CARD_H * 0.36,
        fontFace: FONT, fontSize: 10, color: C.gray,
        valign: "middle", margin: 0,
      });
    });
  });

  const outFile = path.join(__dirname, "kanban.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
