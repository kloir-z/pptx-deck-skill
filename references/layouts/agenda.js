// ─────────────────────────────────────────────────────────────
// Layout: agenda
// Description: Numbered topic list with 6 items. The "current" item is
//   highlighted with a dark background + white text. Other items use a
//   light card background. Each row has a number badge on the left.
// Customization points:
//   - C palette: swap colors for different themes
//   - items array: replace labels and set currentIndex
//   - itemH / gap: adjust row height and spacing
//   - badgeSize: adjust number badge circle diameter
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
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 1, angle: 135, opacity: 0.08 });

// ── Agenda items ─────────────────────────────────────────────
const items = [
  "プロジェクト概要とゴール",
  "現状の課題と背景",
  "提案ソリューション",       // ← current (index 2)
  "実装ロードマップ",
  "リスクと対策",
  "まとめと次のステップ",
];
const currentIndex = 2;

// ── Layout constants ─────────────────────────────────────────
const ITEMS_COUNT  = items.length;
const LEFT_MARGIN  = 2.0;   // center the block horizontally
const TOP_START    = 1.25;
const ITEM_H       = 0.60;
const GAP          = 0.05;
const ITEM_W       = 6.0;
const BADGE_SIZE   = 0.42;

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "agenda layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("本日のアジェンダ", {
    x: 0.5, y: 0.18, w: 9, h: 0.48,
    fontFace: FONT, fontSize: 16, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Slide subtitle ──
  slide.addText("本日の議論ポイントを整理。現在のセクションをハイライト表示し、\n全体の進行状況を一目で把握できるようにしている。", {
    x: 0.5, y: 0.66, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Agenda rows ──
  items.forEach((label, i) => {
    const isCurrent = i === currentIndex;
    const y = TOP_START + i * (ITEM_H + GAP);

    const rowBg    = isCurrent ? C.main  : C.cardBg;
    const badgeBg  = isCurrent ? C.white : C.main;
    const badgeFg  = isCurrent ? C.main  : C.white;
    const textColor= isCurrent ? C.white : C.darkText;

    // Row background (rounded rectangle approximated with plain rectangle)
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: LEFT_MARGIN, y, w: ITEM_W, h: ITEM_H,
      fill: { color: rowBg },
      line: { color: isCurrent ? C.main : "E0E0E0", pt: 0.5 },
      shadow: makeShadow(),
      rectRadius: 0.06,
    });

    // Number badge (circle)
    const badgeX = LEFT_MARGIN + 0.14;
    const badgeY = y + (ITEM_H - BADGE_SIZE) / 2;
    slide.addShape(pres.shapes.OVAL, {
      x: badgeX, y: badgeY, w: BADGE_SIZE, h: BADGE_SIZE,
      fill: { color: badgeBg },
    });
    slide.addText(String(i + 1), {
      x: badgeX, y: badgeY, w: BADGE_SIZE, h: BADGE_SIZE,
      fontFace: FONT, fontSize: 13, bold: true, color: badgeFg,
      align: "center", valign: "middle", margin: 0,
    });

    // Item label
    const textX = LEFT_MARGIN + BADGE_SIZE + 0.28;
    // Reserve space on the right for the "▶ 現在" tag so the boxes don't overlap
    const textW  = ITEM_W - BADGE_SIZE - 0.42 - (isCurrent ? 1.15 : 0);
    slide.addText(label, {
      x: textX, y, w: textW, h: ITEM_H,
      fontFace: FONT, fontSize: 13, bold: isCurrent, color: textColor,
      valign: "middle", margin: 0,
    });

    // "現在のトピック" tag for current item
    if (isCurrent) {
      slide.addText("▶ 現在", {
        x: LEFT_MARGIN + ITEM_W - 1.1, y, w: 1.0, h: ITEM_H,
        fontFace: FONT, fontSize: 10, color: C.lightText,
        align: "right", valign: "middle", margin: [0, 0.1, 0, 0],
      });
    }
  });

  const outFile = path.join(__dirname, "agenda.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
