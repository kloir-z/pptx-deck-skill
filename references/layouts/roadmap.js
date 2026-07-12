// ─────────────────────────────────────────────────────────────
// Layout: roadmap
// Description: Multi-lane roadmap (swim-lane Gantt) with quarterly
//   time axis. Each lane represents a team or workstream; task bars
//   span their start/end quarters. Milestone diamonds appear below
//   the grid at key quarter boundaries. Alternating lane backgrounds
//   improve readability. Fully data-driven via lanes/months/milestones.
// Customization points:
//   - C palette: swap colors for different themes
//   - months array: replace "Q1"–"Q4" with actual quarter/month labels
//   - lanes array: add/remove lanes; each lane has name + tasks[]
//   - task color: null → C.main, or set to any hex string for override
//   - milestones array: set col (0-based column index) and name
//   - titleH / labelW / barH / barPad: tweak geometry constants
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Slate + Sky #4 ───────────────────────────────
const C = {
  lightBg:   "F8FAFC",
  cardBg:    "FFFFFF",
  midBg:     "EFF6FF",
  main:      "334155",
  accent:    "38BDF8",
  white:     "FFFFFF",
  gray:      "4B5563",
  darkText:  "1E293B",
  lightText: "6B7280",
};

const FONT = "BIZ UDPGothic";
const makeShadow = () => ({ type: "outer", color: "000000", blur: 3, offset: 1, angle: 135, opacity: 0.07 });

// ── Data ──────────────────────────────────────────────────
const months = ["Q1", "Q2", "Q3", "Q4"];

const lanes = [
  {
    name: "フロントエンド",
    tasks: [
      { name: "UI刷新",     start: 0, end: 1, color: null },
      { name: "モバイル対応", start: 2, end: 3, color: null },
    ],
  },
  {
    name: "バックエンド",
    tasks: [
      { name: "API v2", start: 0, end: 2, color: null },
      { name: "DB移行",  start: 2, end: 2, color: null },
    ],
  },
  {
    name: "インフラ",
    tasks: [
      { name: "K8s移行", start: 0, end: 1, color: null },
      { name: "監視強化", start: 1, end: 2, color: null },
      { name: "DR対応",  start: 3, end: 3, color: null },
    ],
  },
];

const milestones = [
  { name: "v2.0 リリース", col: 2 },
  { name: "年度目標達成",  col: 3 },
];

// ── Layout constants ──────────────────────────────────────
const SLIDE_W = 10.0;
const SLIDE_H = 5.625;

const leftMargin  = 0.5;
const rightMargin = 0.5;
const titleH      = 0.7;   // slide title area height
const labelW      = 1.8;   // left lane name column width
const headerH     = 0.35;  // quarter header row height
const barH        = 0.28;  // task bar height
const barPad      = 0.04;  // horizontal padding inside bar

const gridX      = leftMargin + labelW;               // 2.3"
const gridW      = SLIDE_W - gridX - rightMargin;     // 7.2"
const colW       = gridW / months.length;             // 1.8" per quarter
const headerY    = titleH + 0.40;                     // header row starts after title + subtitle
const gridStartY = headerY + headerH;                 // 1.45"

const milestoneSpace = 0.55;  // reserved height below grid for milestone markers (diamond + label + margin)
const bottomMargin   = 0.5;
const availableH     = SLIDE_H - gridStartY - bottomMargin - milestoneSpace; // ~3.125"
const laneH          = availableH / lanes.length;     // ~1.225" per lane

// ── Overlap detection ─────────────────────────────────────
// Returns array of vertical slot indices for each task in a lane.
// Tasks that overlap in time get different slot indices (stacked).
// Non-overlapping tasks that fit in one row share slot 0.
function assignSlots(tasks) {
  const slots = new Array(tasks.length).fill(-1);
  const slotEnd = []; // tracks end column of each slot

  for (let i = 0; i < tasks.length; i++) {
    // find the first slot whose last task ended before this task starts
    let placed = false;
    for (let s = 0; s < slotEnd.length; s++) {
      if (slotEnd[s] < tasks[i].start) {
        slots[i] = s;
        slotEnd[s] = tasks[i].end;
        placed = true;
        break;
      }
    }
    if (!placed) {
      slots[i] = slotEnd.length;
      slotEnd.push(tasks[i].end);
    }
  }
  return { slots, numSlots: slotEnd.length };
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "roadmap layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("プロダクトロードマップ 2026", {
    x: leftMargin, y: 0.12, w: SLIDE_W - leftMargin - rightMargin, h: titleH - 0.12,
    fontFace: FONT, fontSize: 24, bold: true, color: C.darkText, // Reduced from 36-44pt standard — dense grid needs vertical space
    valign: "middle", margin: 0,
  });

  // ── Slide subtitle ──
  slide.addText("2025年度のプロダクトロードマップを四半期単位で表示。\n各レーンの進捗と依存関係を俯瞰できる。", {
    x: 0.5, y: titleH, w: 9.0, h: 0.38,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  // ── Quarter header row ──
  months.forEach((month, i) => {
    const hx = gridX + i * colW;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: hx, y: headerY, w: colW, h: headerH,
      fill: { color: C.main },
      line: { color: C.main, pt: 0 },
    });
    slide.addText(month, {
      x: hx, y: headerY, w: colW, h: headerH,
      fontFace: FONT, fontSize: 12, bold: true, color: C.white,
      align: "center", valign: "middle", margin: 0,
    });
  });

  // ── Alternating lane backgrounds + lane labels ──
  lanes.forEach((lane, li) => {
    const laneY = gridStartY + li * laneH;
    const bgColor = li % 2 === 0 ? C.cardBg : C.midBg;

    // Full-width lane background
    slide.addShape(pres.shapes.RECTANGLE, {
      x: leftMargin, y: laneY,
      w: SLIDE_W - leftMargin - rightMargin, h: laneH,
      fill: { color: bgColor },
      line: { color: bgColor, pt: 0 },
    });

    // Lane label (left column)
    slide.addText(lane.name, {
      x: leftMargin + 0.1, y: laneY,
      w: labelW - 0.2, h: laneH,
      fontFace: FONT, fontSize: 11, bold: true, color: C.darkText,
      valign: "middle", margin: 0,
    });
  });

  // ── Lane separator lines ──
  for (let li = 1; li < lanes.length; li++) {
    const sepY = gridStartY + li * laneH;
    slide.addShape(pres.shapes.LINE, {
      x: leftMargin, y: sepY,
      w: SLIDE_W - leftMargin - rightMargin, h: 0,
      line: { color: C.lightText, pt: 0.5 },
    });
  }

  // ── Vertical grid lines ──
  const gridTotalH = lanes.length * laneH;
  for (let i = 0; i <= months.length; i++) {
    const lx = gridX + i * colW;
    slide.addShape(pres.shapes.LINE, {
      x: lx, y: gridStartY, w: 0, h: gridTotalH,
      line: { color: C.lightText, pt: 0.5, dashType: "sysDash" },
    });
  }

  // ── Task bars ──
  lanes.forEach((lane, li) => {
    const laneY = gridStartY + li * laneH;
    const { slots, numSlots } = assignSlots(lane.tasks);

    // When stacking, divide the lane height among slots
    const slotH = laneH / Math.max(numSlots, 1);

    lane.tasks.forEach((task, ti) => {
      const slot = slots[ti];
      const barX = gridX + task.start * colW + barPad;
      const barW = (task.end - task.start + 1) * colW - 2 * barPad;

      let barY;
      if (numSlots === 1) {
        // Single slot: center the bar in the lane
        barY = laneY + (laneH - barH) / 2;
      } else {
        // Multiple slots: center bar within its slot
        const slotY = laneY + slot * slotH;
        barY = slotY + (slotH - barH) / 2;
      }

      const fillColor = task.color !== null ? task.color : C.main;

      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: barX, y: barY, w: barW, h: barH,
        fill: { color: fillColor },
        line: { color: fillColor, pt: 0 },
        shadow: makeShadow(),
        rectRadius: 0.05,
      });

      // Task name text inside the bar
      slide.addText(task.name, {
        x: barX + 0.06, y: barY, w: barW - 0.12, h: barH,
        fontFace: FONT, fontSize: 10, bold: false, color: C.white,
        valign: "middle", margin: 0,
      });
    });
  });

  // ── Milestone markers ──
  const msY = gridStartY + gridTotalH + 0.06; // just below the grid
  const diamondSize = 0.2;

  milestones.forEach((ms) => {
    const cx = gridX + ms.col * colW + colW / 2;

    // Diamond: rotated square centered at cx, msY + diamondSize/2
    slide.addShape(pres.shapes.RECTANGLE, {
      x: cx - diamondSize / 2,
      y: msY,
      w: diamondSize,
      h: diamondSize,
      fill: { color: C.accent },
      line: { color: C.accent, pt: 0 },
      rotate: 45,
    });

    // Label below diamond
    slide.addText(ms.name, {
      x: cx - 0.7, y: msY + diamondSize + 0.04, w: 1.4, h: 0.22,
      fontFace: FONT, fontSize: 10, bold: true, color: C.darkText,
      align: "center", valign: "top", margin: 0,
    });

    // Vertical dashed guide line from header to milestone
    slide.addShape(pres.shapes.LINE, {
      x: cx, y: headerY,
      w: 0, h: gridTotalH + headerH + 0.05,
      line: { color: C.accent, pt: 0.75, dashType: "dash" },
    });
  });

  const outFile = path.join(__dirname, "roadmap.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
