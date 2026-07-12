// ─────────────────────────────────────────────────────────────
// Layout: checklist
// Description: Vertical list of 6 items, each with a colored status circle
//   (green=done, red=failed, gray=pending), a unicode symbol inside the circle,
//   the item text, and an optional status note on the right.
// Customization points:
//   - C palette: swap colors for different themes
//   - items array: replace labels, status, and note fields
//   - ITEM_H / GAP: adjust row height and spacing
//   - CIRCLE_SIZE: adjust status indicator diameter
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

// Status colors
const STATUS_DONE    = "22C55E";
const STATUS_FAILED  = "EF4444";
const STATUS_PENDING = "94A3B8";

const FONT = "BIZ UDPGothic";

// ── Checklist items ───────────────────────────────────────
// status: "done" | "failed" | "pending"
const items = [
  { label: "要件定義書のレビューと承認",         status: "done",    note: "2024-03-01 完了" },
  { label: "ステークホルダーへの最終確認",       status: "done",    note: "2024-03-05 完了" },
  { label: "本番環境インフラのプロビジョニング", status: "done",    note: "2024-03-10 完了" },
  { label: "負荷テスト（目標: 1000 RPS）",       status: "failed",  note: "750 RPS で上限超過" },
  { label: "セキュリティ脆弱性スキャン",         status: "pending", note: "担当: 田中" },
  { label: "リリースノート・ドキュメント整備",   status: "pending", note: "担当: 鈴木" },
];

// ── Layout constants ──────────────────────────────────────
const LEFT_MARGIN = 0.5;
const TOP_START   = 1.42;
const ITEM_H      = 0.60;
const GAP         = 0.12;
const ITEM_W      = 9.0;
const CIRCLE_SIZE = 0.36;

function statusColor(status) {
  if (status === "done")    return STATUS_DONE;
  if (status === "failed")  return STATUS_FAILED;
  return STATUS_PENDING;
}

function statusSymbol(status) {
  if (status === "done")   return "✓";
  if (status === "failed") return "✗";
  return "−";
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "checklist layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("プロジェクト Go / No-Go チェックリスト", {
    x: LEFT_MARGIN, y: 0.20, w: ITEM_W, h: 0.48,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("各機能の対応状況を一覧で表示。✓ は完了、✗ は未対応を示し、\nリリース判定の根拠資料として活用する。", {
    x: 0.5, y: 0.68, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Summary badge row (done / failed / pending counts) ──
  const counts = { done: 0, failed: 0, pending: 0 };
  items.forEach((it) => { counts[it.status]++; });

  const badgeData = [
    { label: "完了", count: counts.done,    color: STATUS_DONE },
    { label: "NG",   count: counts.failed,  color: STATUS_FAILED },
    { label: "保留", count: counts.pending, color: STATUS_PENDING },
  ];
  badgeData.forEach((b, bi) => {
    const bx = LEFT_MARGIN + bi * 1.1;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: bx, y: 1.14, w: 0.95, h: 0.24,
      fill: { color: b.color },
      line: { color: b.color, pt: 0 },
      rectRadius: 0.04,
    });
    slide.addText(`${b.label} ${b.count}`, {
      x: bx, y: 1.14, w: 0.95, h: 0.24,
      fontFace: FONT, fontSize: 10, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
  });

  // ── Checklist rows ──
  items.forEach((item, i) => {
    const y = TOP_START + i * (ITEM_H + GAP);
    const circleColor = statusColor(item.status);

    // Row card background
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: LEFT_MARGIN, y, w: ITEM_W, h: ITEM_H,
      fill: { color: C.cardBg },
      line: { color: "E2E8F0", pt: 0.5 },
      rectRadius: 0.05,
    });

    // Status circle
    const circleX = LEFT_MARGIN + 0.14;
    const circleY = y + (ITEM_H - CIRCLE_SIZE) / 2;
    slide.addShape(pres.shapes.OVAL, {
      x: circleX, y: circleY, w: CIRCLE_SIZE, h: CIRCLE_SIZE,
      fill: { color: circleColor },
      line: { color: circleColor, pt: 0 },
    });

    // Symbol inside circle
    slide.addText(statusSymbol(item.status), {
      x: circleX, y: circleY, w: CIRCLE_SIZE, h: CIRCLE_SIZE,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Item label
    const textX = LEFT_MARGIN + CIRCLE_SIZE + 0.30;
    const noteW  = 1.8;
    const textW  = ITEM_W - CIRCLE_SIZE - 0.30 - noteW - 0.20;
    slide.addText(item.label, {
      x: textX, y, w: textW, h: ITEM_H,
      fontFace: FONT, fontSize: 12, color: C.darkText,
      valign: "middle", margin: 0,
    });

    // Status note on the right
    if (item.note) {
      slide.addText(item.note, {
        x: LEFT_MARGIN + ITEM_W - noteW, y, w: noteW, h: ITEM_H,
        fontFace: FONT, fontSize: 10, color: C.lightText,
        align: "right", valign: "middle", margin: [0, 0.10, 0, 0],
      });
    }
  });

  const outFile = path.join(__dirname, "checklist.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
