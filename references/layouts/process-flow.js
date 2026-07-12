// ─────────────────────────────────────────────────────────────
// Layout: process-flow
// Description: 5 horizontal steps connected by arrow indicators.
//   Each step has a rounded rectangle card, a numbered badge (OVAL),
//   a bold title, and a one-line description. Steps are data-driven
//   and evenly distributed across the slide width.
// Customization points:
//   - C palette: swap colors for different themes
//   - steps array: replace titles/descriptions and add/remove steps
//   - ARROW_GAP: adjust space reserved for arrows between steps
//   - STEP_H / TOP_Y: adjust card height and vertical position
//   - BADGE_SIZE: adjust step-number badge diameter
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
const makeShadow = () => ({ type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.10 });

// ── Process steps ─────────────────────────────────────────
const steps = [
  { title: "Plan",    desc: "要件定義・設計" },
  { title: "Develop", desc: "実装・コードレビュー" },
  { title: "Test",    desc: "単体・結合テスト" },
  { title: "Stage",   desc: "ステージング検証" },
  { title: "Deploy",  desc: "本番リリース" },
];

// ── Layout constants ──────────────────────────────────────
const LEFT_MARGIN  = 0.5;
const RIGHT_MARGIN = 0.5;
const SLIDE_W      = 10.0;
const AVAILABLE_W  = SLIDE_W - LEFT_MARGIN - RIGHT_MARGIN; // 9.0"
const ARROW_GAP    = 0.30; // width reserved for arrow between steps
const N            = steps.length;
// Total arrow space
const TOTAL_ARROWS = ARROW_GAP * (N - 1);
// Step card width
const STEP_W       = (AVAILABLE_W - TOTAL_ARROWS) / N;

const TOP_Y        = 1.50;  // top of step cards
const STEP_H       = 3.00;  // height of step card
const BADGE_SIZE   = 0.44;  // diameter of number badge
const BADGE_OFFSET = 0.18;  // badge top offset inside card

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "process-flow layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("ソフトウェア デプロイ パイプライン", {
    x: LEFT_MARGIN, y: 0.20, w: AVAILABLE_W, h: 0.52,
    fontFace: FONT, fontSize: 17, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("デプロイパイプラインの全体像を5つのステップで図示。\n各段階の所要期間と担当部門を明確にし、ボトルネックの特定に活用する。", {
    x: 0.5, y: 0.72, w: 9.0, h: 0.45,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Steps ──
  steps.forEach((step, i) => {
    const x = LEFT_MARGIN + i * (STEP_W + ARROW_GAP);

    // Card background
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: TOP_Y, w: STEP_W, h: STEP_H,
      fill: { color: C.cardBg },
      line: { color: C.accent, pt: 1.0 },
      shadow: makeShadow(),
      rectRadius: 0.10,
    });

    // Step number badge (OVAL)
    const badgeX = x + (STEP_W - BADGE_SIZE) / 2;
    const badgeY = TOP_Y + BADGE_OFFSET;
    slide.addShape(pres.shapes.OVAL, {
      x: badgeX, y: badgeY, w: BADGE_SIZE, h: BADGE_SIZE,
      fill: { color: C.main },
      line: { color: C.main, pt: 0 },
    });
    slide.addText(String(i + 1), {
      x: badgeX, y: badgeY, w: BADGE_SIZE, h: BADGE_SIZE,
      fontFace: FONT, fontSize: 14, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Step title
    const titleY = TOP_Y + BADGE_OFFSET + BADGE_SIZE + 0.18;
    slide.addText(step.title, {
      x: x + 0.10, y: titleY, w: STEP_W - 0.20, h: 0.46,
      fontFace: FONT, fontSize: 14, bold: true, color: C.darkText,
      align: "center", valign: "middle", margin: 0,
    });

    // Step description
    const descY = titleY + 0.50;
    slide.addText(step.desc, {
      x: x + 0.10, y: descY, w: STEP_W - 0.20, h: 0.38,
      fontFace: FONT, fontSize: 10, color: C.gray,
      align: "center", valign: "middle", margin: 0,
    });

    // ── Arrow between steps ──
    // Drawn as a CHEVRON shape — never a lone text glyph (→ ›), which
    // misaligns across renderers (see SKILL.md "Connectors between shapes").
    if (i < N - 1) {
      const arrowX = x + STEP_W + ARROW_GAP * 0.15;
      const arrowY = TOP_Y + STEP_H / 2 - 0.13;
      slide.addShape(pres.shapes.CHEVRON, {
        x: arrowX, y: arrowY, w: ARROW_GAP * 0.70, h: 0.26,
        fill: { color: C.accent },
        line: { color: C.accent, pt: 0 },
      });
    }
  });

  // ── Progress bar at bottom ──
  const barY   = TOP_Y + STEP_H + 0.22;
  const barW   = AVAILABLE_W;
  const barH   = 0.10;
  // Track
  slide.addShape(pres.shapes.RECTANGLE, {
    x: LEFT_MARGIN, y: barY, w: barW, h: barH,
    fill: { color: C.midBg },
    line: { color: C.midBg, pt: 0 },
  });
  // Fill (shows steps 1-3 completed out of 5 as example)
  const completedSteps = 3;
  const fillW = barW * (completedSteps / N);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: LEFT_MARGIN, y: barY, w: fillW, h: barH,
    fill: { color: C.main },
    line: { color: C.main, pt: 0 },
  });

  // Progress label
  slide.addText(`${completedSteps} / ${N} ステップ完了`, {
    x: LEFT_MARGIN, y: barY + 0.14, w: barW, h: 0.22,
    fontFace: FONT, fontSize: 10, color: C.lightText,
    align: "center", valign: "top", margin: 0,
  });

  const outFile = path.join(__dirname, "process-flow.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
