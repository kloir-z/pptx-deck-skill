// ─────────────────────────────────────────────────────────────
// Layout: tree
// Description: 3-level org-chart hierarchy rendered with
//   breadth-first layout. Root at top center, level-1 children
//   spread horizontally, level-2 grandchildren grouped under
//   their parent. Connector lines join parent bottom-center to
//   child top-center. Nodes are ROUNDED_RECTANGLE with distinct
//   fills per level.
// Customization points:
//   - C palette: swap colors for different themes
//   - tree data: replace labels and add/remove children
//   - nodeW / nodeH: adjust node size
//   - levelSpacing: vertical gap between levels
//   - topMargin: space reserved for slide title
//   - connector line color / width
// ─────────────────────────────────────────────────────────────

"use strict";
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette: Charcoal + Gold #5 ─────────────────────────────
const C = {
  lightBg:   "FAFAF9",
  cardBg:    "FFFFFF",
  midBg:     "F5F5F4",
  main:      "292524",
  accent:    "D97706",
  white:     "FFFFFF",
  gray:      "4B5563",
  darkText:  "1C1917",
  lightText: "6B7280",
};

const FONT = "BIZ UDPGothic";
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.10,
});

// ── Tree data ─────────────────────────────────────────────
const tree = {
  label: "CTO",
  children: [
    {
      label: "開発部長",
      children: [
        { label: "フロント",   children: [] },
        { label: "バックエンド", children: [] },
        { label: "インフラ",     children: [] },
      ],
    },
    {
      label: "QA部長",
      children: [
        { label: "テスト自動化", children: [] },
        { label: "品質管理",     children: [] },
      ],
    },
    {
      label: "プロダクト部長",
      children: [
        { label: "企画",     children: [] },
        { label: "デザイン", children: [] },
      ],
    },
  ],
};

// ── Layout constants ──────────────────────────────────────
const SLIDE_W      = 10.0;
const SLIDE_H      = 5.625;
const EDGE_MARGIN  = 0.5;
const AVAILABLE_W  = SLIDE_W - EDGE_MARGIN * 2; // 9.0"
const TOP_MARGIN   = 1.40;  // space for title + subtitle
const NODE_W       = 1.6;
const LEAF_NODE_W  = 0.95;  // narrower nodes for level-2 (7 nodes must fit in 9")
const NODE_H       = 0.5;
const LEVEL_SPACING = 1.3;  // vertical gap between levels
const RECT_RADIUS  = 0.08;

// ── layoutTree ────────────────────────────────────────────
// Returns array of { label, level, x, y, w, h, parentX, parentY }
function layoutTree(root) {
  const nodes = [];

  // BFS to collect nodes with level and parent info
  const queue = [{ node: root, level: 0, parentIndex: null }];
  const flat = [];
  while (queue.length > 0) {
    const { node, level, parentIndex } = queue.shift();
    const index = flat.length;
    flat.push({ label: node.label, level, parentIndex });
    for (const child of node.children) {
      queue.push({ node: child, level: level + 1, parentIndex: index });
    }
  }

  // Group by level
  const levels = [];
  for (const item of flat) {
    if (!levels[item.level]) levels[item.level] = [];
    levels[item.level].push(item);
  }

  // ── Level 0: root centered ──
  const level0 = levels[0];
  const rootX = (SLIDE_W - NODE_W) / 2;
  const rootY = TOP_MARGIN;
  flat[0].x = rootX;
  flat[0].y = rootY;
  flat[0].cx = rootX + NODE_W / 2; // center x
  flat[0].cy = rootY + NODE_H;     // bottom y (for parent connector)

  // ── Level 1: evenly spaced across available width ──
  const level1 = levels[1] || [];
  const l1Count = level1.length;
  if (l1Count > 0) {
    // Distribute evenly
    const span = AVAILABLE_W / l1Count;
    level1.forEach((item, i) => {
      const x = EDGE_MARGIN + i * span + (span - NODE_W) / 2;
      const y = TOP_MARGIN + LEVEL_SPACING;
      item.x = x;
      item.y = y;
      item.cx = x + NODE_W / 2;
      item.cy = y + NODE_H;
      // Record span ownership for level-2 grouping
      item.spanStart = EDGE_MARGIN + i * span;
      item.spanEnd   = EDGE_MARGIN + (i + 1) * span;
    });
  }

  // ── Level 2: grouped under their level-1 parent ──
  const level2 = levels[2] || [];
  if (level2.length > 0 && level1.length > 0) {
    // Map each level-1 node index to its level-2 children
    const childrenOf = {};
    for (const item of level2) {
      const pid = item.parentIndex;
      if (!childrenOf[pid]) childrenOf[pid] = [];
      childrenOf[pid].push(item);
    }

    // For each level-1 node, lay out its children within its span
    for (const l1item of level1) {
      const l1FlatIdx = flat.indexOf(l1item);
      const children = childrenOf[l1FlatIdx] || [];
      if (children.length === 0) continue;
      const spanW = l1item.spanEnd - l1item.spanStart;
      const childSlot = spanW / children.length;
      children.forEach((child, j) => {
        const nw = LEAF_NODE_W; // use narrower width for level-2 nodes
        const x = l1item.spanStart + j * childSlot + (childSlot - nw) / 2;
        const y = TOP_MARGIN + LEVEL_SPACING * 2;
        child.x = x;
        child.y = y;
        child.nw = nw; // store actual node width
        child.cx = x + nw / 2;
        child.cy = y + NODE_H;
      });
    }
  }

  // Build final node list with parent connector coords
  for (const item of flat) {
    const parentItem = item.parentIndex !== null ? flat[item.parentIndex] : null;
    nodes.push({
      label:   item.label,
      level:   item.level,
      x:       item.x,
      y:       item.y,
      w:       item.nw || NODE_W,
      h:       NODE_H,
      parentCX: parentItem ? parentItem.cx : null,
      parentCY: parentItem ? parentItem.cy : null,
    });
  }

  return nodes;
}

// ── Main ─────────────────────────────────────────────────
async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Claude Code";
  pres.title = "tree layout reference";

  const slide = pres.addSlide();
  slide.background = { color: C.lightBg };

  // ── Slide title ──
  slide.addText("組織図 — Engineering Division", {
    x: EDGE_MARGIN, y: 0.22, w: AVAILABLE_W, h: 0.52,
    fontFace: FONT, fontSize: 17, bold: true, color: C.darkText,
    valign: "middle", margin: 0,
  });

  // ── Subtitle ──
  slide.addText("システムのモジュール構成をツリー形式で表現。各ノード間の\n依存方向と階層関係を視覚的に把握できる。", {
    x: 0.5, y: 0.74, w: 9.0, h: 0.36,
    fontFace: FONT, fontSize: 12, color: C.gray,
    valign: "top", margin: 0,
  });

  const layoutNodes = layoutTree(tree);

  // ── Connector lines (draw first, nodes on top) ──
  for (const n of layoutNodes) {
    if (n.parentCX === null) continue;
    const childCX = n.x + n.w / 2;
    const childTopY = n.y;
    // Normalize line coordinates — negative w/h corrupts the file in PowerPoint.
    const lw = childCX - n.parentCX;
    const lh = childTopY - n.parentCY;
    slide.addShape(pres.shapes.LINE, {
      x: lw >= 0 ? n.parentCX : childCX,
      y: lh >= 0 ? n.parentCY : childTopY,
      w: Math.abs(lw),
      h: Math.abs(lh),
      flipH: lw < 0,
      flipV: lh < 0,
      line: { color: C.accent, pt: 1.5 },
    });
  }

  // ── Nodes ──
  for (const n of layoutNodes) {
    // Node fill/border per level
    let fill, lineColor, textColor, bold;
    if (n.level === 0) {
      fill      = { color: C.main };
      lineColor = C.main;
      textColor = C.white;
      bold      = true;
    } else if (n.level === 1) {
      fill      = { color: C.accent };
      lineColor = C.accent;
      textColor = C.white;
      bold      = true;
    } else {
      fill      = { color: C.cardBg };
      lineColor = C.main;
      textColor = C.darkText;
      bold      = false;
    }

    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: n.x, y: n.y, w: n.w, h: n.h,
      fill,
      line: { color: lineColor, pt: 1.0 },
      shadow: makeShadow(),
      rectRadius: RECT_RADIUS,
    });

    slide.addText(n.label, {
      x: n.x, y: n.y, w: n.w, h: n.h,
      fontFace: FONT,
      fontSize: n.level === 0 ? 13 : n.level === 1 ? 11 : 10,
      bold,
      color: textColor,
      align: "center", valign: "middle", margin: 0,
    });
  }

  // ── Level labels (right margin annotation) ──
  const levelLabels = ["Lv 0", "Lv 1", "Lv 2"];
  const levelY = [TOP_MARGIN, TOP_MARGIN + LEVEL_SPACING, TOP_MARGIN + LEVEL_SPACING * 2];
  levelLabels.forEach((lbl, i) => {
    slide.addText(lbl, {
      x: SLIDE_W - EDGE_MARGIN + 0.02, y: levelY[i] + (NODE_H - 0.18) / 2,
      w: 0.46, h: 0.22,
      fontFace: FONT, fontSize: 10, color: C.lightText,
      align: "left", valign: "middle", margin: 0,
    });
  });

  const outFile = path.join(__dirname, "tree.pptx");
  await pres.writeFile({ fileName: outFile });
  console.log("Written:", outFile);
}

main().catch((err) => { console.error(err); process.exit(1); });
