// ─────────────────────────────────────────────────────────────
// Layout: diagram-image
// Description: A rendered diagram image (Mermaid or HTML screenshot —
//   see references/diagram-rendering.md) on a card panel, with a
//   takeaway column on the right (3 numbered reading points) and a
//   source/tool caption at the bottom. Falls back to a placeholder
//   rectangle when the PNG is missing, so the reference runs standalone.
// Customization points:
//   - C palette: swap colors for different themes
//   - DIAGRAM_PATH: the rendered PNG (design it at ~1.65:1 aspect to fill
//     the panel; any other ratio is letterboxed from the file's real size —
//     pptxgenjs's sizing:"contain" does NOT protect the aspect ratio)
//   - takeaways array: 3 reading points (header + 1-2 line detail)
//   - caption: tool/source line ("" to hide)
// ─────────────────────────────────────────────────────────────

"use strict";
const fs = require("fs");
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

// ── Image fitting ────────────────────────────────────────────
// pptxgenjs never reads the image file's dimensions: sizing:{type:"contain"}
// fits relative to the DECLARED w/h, so declaring the box size stretches the
// image to the box. Compute the drawn size from the PNG header instead.
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; // IHDR width/height
}
function fitImage(file, box) { // box = {x, y, w, h} in inches; letterbox + center
  const px = pngSize(file);
  const scale = Math.min(box.w / px.w, box.h / px.h);
  const w = px.w * scale, h = px.h * scale;
  return { path: file, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

// ── Content ──────────────────────────────────────────────────
const title    = "バッチ処理パイプラインの全体構成";
const subtitle = "夜間 ETL の処理フローを Mermaid で図解。データソースから BI ダッシュボード\nまでの経路と、リトライが発生する箇所を示す。";
const DIAGRAM_PATH = path.join(__dirname, "diagram-image.png");
const caption  = "図: Mermaid (flowchart) で生成 — ソース: docs/etl-pipeline.mmd";

const takeaways = [
  {
    num: "1",
    head: "取り込みは3系統",
    desc: "基幹DB・行動ログ・外部APIを\n毎日 02:00 に並列取得する。",
  },
  {
    num: "2",
    head: "変換は2段構え",
    desc: "クレンジング後に集計。\n失敗時は該当系統のみ\n3回リトライ。",
  },
  {
    num: "3",
    head: "完了は 05:30 目標",
    desc: "BI 更新の SLA は始業前。\n遅延時は\nSlack #data-alert に通知。",
  },
];

// ── Geometry (slide: 10" x 5.625", LAYOUT_16x9) ──────────────
const PANEL_X = 0.5,  PANEL_Y = 1.10, PANEL_W = 6.30, PANEL_H = 3.90;
const IMG_PAD = 0.10;                       // inset of the image inside the panel
const TKW_X   = 7.00, TKW_W   = 2.50;       // takeaway column
const TKW_Y   = 1.10, TKW_ITEM_H = 1.18, TKW_GAP = 0.18;

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "diagram-image layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText(title, {
    x: 0.5, y: 0.15, w: 9.0, h: 0.42,
    fontFace: FONT, fontSize: 15, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText(subtitle, {
    x: 0.5, y: 0.57, w: 9.0, h: 0.40,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Diagram panel (card) ──
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: PANEL_X, y: PANEL_Y, w: PANEL_W, h: PANEL_H,
    fill: { color: C.cardBg },
    line: { color: C.accent, pt: 0.75 },
    rectRadius: 0.05,
  });

  // ── Diagram image (or placeholder when the PNG is absent) ──
  const imgX = PANEL_X + IMG_PAD, imgY = PANEL_Y + IMG_PAD;
  const imgW = PANEL_W - IMG_PAD * 2, imgH = PANEL_H - IMG_PAD * 2;
  if (fs.existsSync(DIAGRAM_PATH)) {
    slide.addImage(fitImage(DIAGRAM_PATH, { x: imgX, y: imgY, w: imgW, h: imgH }));
  } else {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: imgX, y: imgY, w: imgW, h: imgH,
      fill: { color: C.midBg },
      line: { color: C.accent, pt: 0.75, dashType: "dash" },
    });
    slide.addText(
      "[ レンダリング済みの図 (PNG) をここに配置 ]\nreferences/diagram-rendering.md の手順で生成し、\nDIAGRAM_PATH に保存すると addImage に切り替わる",
      {
        x: imgX, y: imgY + imgH / 2 - 0.55, w: imgW, h: 1.1,
        fontFace: FONT, fontSize: 11, color: C.lightText,
        align: "center", valign: "middle", margin: 0,
        lineSpacingMultiple: 1.4,
      });
  }

  // ── Takeaway column (3 reading points) ──
  slide.addText("読み取りポイント", {
    x: TKW_X, y: TKW_Y, w: TKW_W, h: 0.32,
    fontFace: FONT, fontSize: 13, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  takeaways.forEach((t, i) => {
    const ty = TKW_Y + 0.42 + i * (TKW_ITEM_H + TKW_GAP) * 0.85;

    // Number badge
    slide.addShape(pres.shapes.OVAL, {
      x: TKW_X, y: ty, w: 0.30, h: 0.30,
      fill: { color: C.main },
      line: { color: C.main, pt: 0 },
    });
    slide.addText(t.num, {
      x: TKW_X, y: ty, w: 0.30, h: 0.30,
      fontFace: FONT, fontSize: 11, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });

    // Header
    slide.addText(t.head, {
      x: TKW_X + 0.40, y: ty, w: TKW_W - 0.40, h: 0.30,
      fontFace: FONT, fontSize: 12, bold: true, color: C.darkText,
      valign: "middle", margin: 0,
    });

    // Detail (1-2 lines)
    slide.addText(t.desc, {
      x: TKW_X + 0.40, y: ty + 0.32, w: TKW_W - 0.40, h: 0.62,
      fontFace: FONT, fontSize: 10, color: C.gray,
      valign: "top", margin: 0,
      lineSpacingMultiple: 1.15,
    });
  });

  // ── Caption / source line ──
  if (caption) {
    slide.addText(caption, {
      x: PANEL_X, y: PANEL_Y + PANEL_H + 0.10, w: PANEL_W, h: 0.30,
      fontFace: FONT, fontSize: 10, color: C.lightText,
      valign: "middle", margin: 0,
    });
  }

  const outFile = path.join(__dirname, "diagram-image.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
