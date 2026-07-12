"use strict";
// pptx-deck-skill 紹介デッキ（ドッグフーディング）
// self-narrating / explanatory / palette: Indigo + Lavender (#13)
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

// ── Palette #13 (references/palettes.md) ───────────────────
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
const OUT = path.join(__dirname, "demo_deck.pptx");
const sh = () => ({ type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.10 });

// ── 画像ヘルパー（references/user-images.md より） ──────────
function imgSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50)
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  throw new Error("unsupported: " + file);
}
function fitImage(file, box) {
  const px = imgSize(file);
  const k = Math.min(box.w / px.w, box.h / px.h);
  const w = px.w * k, h = px.h * k;
  return { path: file, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "pptx-deck-skill";
  pres.title = "pptx-deck-skill 紹介";
  const RECT = pres.shapes.RECTANGLE, RREC = pres.shapes.ROUNDED_RECTANGLE,
        OVAL = pres.shapes.OVAL, CHEV = pres.shapes.CHEVRON;

  const bg = (s) => { s.background = { color: C.lightBg }; };
  const pageNum = (s) => {
    s.slideNumber = { x: 8.55, y: 5.28, w: 0.95, h: 0.24, fontFace: FONT, fontSize: 10, color: C.lightText, align: "right" };
  };
  // 2段メッセージタイトル（ラベル + 結論文）
  const msgTitle = (s, label, conclusion) => {
    s.addText(label, { x: 0.5, y: 0.32, w: 9.0, h: 0.26, fontFace: FONT, fontSize: 14, bold: true, color: C.main, valign: "middle", margin: 0, charSpacing: 1 });
    s.addText(conclusion, { x: 0.5, y: 0.60, w: 9.0, h: 0.78, fontFace: FONT, fontSize: 19, bold: true, color: C.darkText, valign: "top", margin: 0, lineSpacingMultiple: 1.12 });
  };
  const listCard = (s, x, y, w, h, header, lines, fsz = 11.5) => {
    s.addShape(RREC, { x, y, w, h, fill: { color: C.cardBg }, line: { color: "DDD6FE", pt: 1 }, rectRadius: 0.06, shadow: sh() });
    s.addShape(RECT, { x, y: y + 0.10, w: 0.07, h: h - 0.20, fill: { color: C.main }, line: { type: "none" } });
    s.addText(header, { x: x + 0.24, y: y + 0.12, w: w - 0.4, h: 0.30, fontFace: FONT, fontSize: 13, bold: true, color: C.main, valign: "middle", margin: 0 });
    const runs = lines.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true, paraSpaceAfter: i === lines.length - 1 ? 0 : 5 } }));
    s.addText(runs, { x: x + 0.24, y: y + 0.48, w: w - 0.42, h: h - 0.60, fontFace: FONT, fontSize: fsz, color: C.gray, valign: "top", margin: 0, lineSpacingMultiple: 1.1 });
  };
  const noteBand = (s, text, y) => {
    s.addShape(RREC, { x: 0.5, y, w: 9.0, h: 0.5, fill: { color: C.midBg }, line: { color: C.main, pt: 1 }, rectRadius: 0.05 });
    s.addShape(RECT, { x: 0.5, y: y + 0.07, w: 0.07, h: 0.36, fill: { color: C.main }, line: { type: "none" } });
    s.addText(text, { x: 0.72, y, w: 8.68, h: 0.5, fontFace: FONT, fontSize: 10.5, color: C.darkText, valign: "middle", margin: 0, lineSpacingMultiple: 1.05 });
  };

  // ════════════════ 1. Hero ════════════════
  {
    const s = pres.addSlide(); bg(s);
    s.addShape(RECT, { x: 0, y: 0, w: 0.22, h: 5.625, fill: { color: C.main }, line: { type: "none" } });
    s.addShape(RECT, { x: 0.22, y: 0, w: 0.06, h: 5.625, fill: { color: C.accent }, line: { type: "none" } });
    s.addText("pptx-deck-skill", { x: 0.7, y: 1.35, w: 8.8, h: 0.9, fontFace: FONT, fontSize: 44, bold: true, color: C.darkText, margin: 0 });
    s.addText("Claude Code 用 PPTX 生成スキル ｜ 紹介デッキ", { x: 0.72, y: 2.35, w: 8.8, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: C.main, margin: 0 });
    s.addText(
      "PptxGenJS のコード生成でスライドを組み立て、機械検査（lint）と描画画像の確認までを\n1つの手順として定義したスキル。日本語スライドの組版規則に重点を置いています。\n本デッキ自体がこのスキルの手順で生成されています。",
      { x: 0.72, y: 3.15, w: 8.7, h: 1.1, fontFace: FONT, fontSize: 13, color: C.gray, margin: 0, lineSpacingMultiple: 1.28 });
    s.addNotes("ドッグフーディング用サンプル。リポジトリ: pptx-deck-skill");
  }

  // ════════════════ 2. スキルの役割 ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "スキルの役割",
      "デッキ生成をコードで行い、機械検査と視覚確認までを1つの手順にする");
    const cards = [
      ["コード生成", ["スライドは PptxGenJS の\nJS スクリプトとして記述", "位置・寸法は事前に計算\n（描画してから直さない）", "レイアウトはサンプル13種\nから最も近いものを流用"]],
      ["機械検査", ["layout_lint.py がはみ出し・\n重なり・極小フォントを検出", "ERROR は修正必須、\nWARN は画像で真偽を確認", "プレースホルダー残存も\nテキスト抽出で点検"]],
      ["視覚 QA", ["soffice で PDF 化し\nページ画像を描画", "コンタクトシートで\n全スライドを一覧確認", "語中折り返し・重なりは\n画像でしか見つからない"]],
    ];
    const cw = 2.93, chh = 2.9, gx = 0.11, x0 = 0.5, y0 = 1.62;
    cards.forEach((c, i) => {
      const x = x0 + i * (cw + gx);
      s.addShape(RREC, { x, y: y0, w: cw, h: chh, fill: { color: C.cardBg }, line: { color: "DDD6FE", pt: 1 }, rectRadius: 0.06, shadow: sh() });
      s.addShape(OVAL, { x: x + 0.22, y: y0 + 0.2, w: 0.42, h: 0.42, fill: { color: C.main }, line: { type: "none" } });
      s.addText(String(i + 1), { x: x + 0.22, y: y0 + 0.2, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 15, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
      s.addText(c[0], { x: x + 0.76, y: y0 + 0.2, w: cw - 0.9, h: 0.42, fontFace: FONT, fontSize: 14, bold: true, color: C.main, valign: "middle", margin: 0 });
      const runs = c[1].map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: true, paraSpaceAfter: j === c[1].length - 1 ? 0 : 6 } }));
      s.addText(runs, { x: x + 0.24, y: y0 + 0.78, w: cw - 0.44, h: chh - 0.95, fontFace: FONT, fontSize: 10.5, color: C.gray, valign: "top", margin: 0, lineSpacingMultiple: 1.12 });
    });
    noteBand(s, "描画結果を見る工程まで含めて「生成」と定義する。コードを書いて終わり、にしない。", 4.72);
    s.addNotes("スキルの3本柱。SKILL.md の Workflow / QA pipeline に対応。");
  }

  // ════════════════ 3. ワークフロー（図解） ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "ワークフロー",
      "アウトラインの合意までコードは書かず、\n生成後は指摘ゼロまで検査を繰り返す");
    s.addImage(fitImage(path.join(__dirname, "workflow.png"), { x: 0.5, y: 1.55, w: 9.0, h: 3.48 }));
    s.addText("図: references/diagrams/flow.html テンプレートをパレットに合わせて調整し、scripts/render_html.py で PNG 化", { x: 0.5, y: 5.06, w: 9, h: 0.26, fontFace: FONT, fontSize: 10, color: C.lightText, margin: 0 });
    s.addNotes("2段階ワークフロー。Stage 1 で合意を取ってから Stage 2 でコードを書く。");
  }

  // ════════════════ 4. デザインシステム ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "配色と文字",
      "3色を 70:25:5 の比率で固定し、本文 13–14pt・下限 10pt を守る");
    listCard(s, 0.5, 1.62, 4.4, 2.9, "配色（3色ルール）", [
      "パレット13種から1組を選ぶ",
      "背景 70% / メイン 25% / アクセント 5%",
      "デッキ途中で4色目を足さない",
      "写真・ブランドロゴは例外扱い",
    ], 11);
    listCard(s, 5.1, 1.62, 4.4, 2.9, "文字（BIZ UDPGothic）", [
      "本文 13–14pt、キャプション 10pt",
      "下限 10pt（高密度の表のみ 8–9pt）",
      "収まらない時は文を削るか箱を広げる",
      "フォント縮小での帳尻合わせは禁止",
    ], 11);
    noteBand(s, "長い日本語は語中で折り返される — 句読点・助詞の境界に明示的な改行を入れ、描画画像で確認する。", 4.72);
    s.addNotes("SKILL.md の Design system / Writing rules #6 に対応。");
  }

  // ════════════════ 5. 文章規則 ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "文章規則",
      "説明資料では事実を淡々と記述し、宣伝の言い回しを持ち込まない");
    const rows = [
      ["根拠のない理由付けをしない", "出典にない動機・背景を補完しない。無ければ書かない"],
      ["売り込まない", "タグライン・N原則・締めスローガンは説明資料では使わない"],
      ["AI くさい文面を避ける", "擬人化・三点対句・体言止めキャッチは書き直す"],
      ["出典のキャッチコピーも中和", "原文の決め台詞を拾わず、背後の事実を平叙文にする"],
      ["強調は意図に合わせる", "巨大数字・単一メッセージは説得資料専用の道具"],
      ["改行を制御する", "全角文字数を計算し、句の境界で明示的に改行する"],
    ];
    const header = ["規則", "内容"].map((h) => ({ text: h, options: { fontFace: FONT, bold: true, fontSize: 10, color: C.white, fill: { color: C.main }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08] } }));
    const body = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: {
      fontFace: FONT, fontSize: 10.5, bold: ci === 0, color: ci === 0 ? C.darkText : C.gray,
      fill: { color: ri % 2 === 0 ? C.cardBg : C.midBg }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08],
    } })));
    s.addTable([header, ...body], { x: 0.5, y: 1.62, w: 9.0, colW: [3.4, 5.6], rowH: 0.42, autoPage: false, border: { pt: 0.5, color: "DDD6FE" } });
    noteBand(s, "6つとも実際に出荷して差し戻された失敗から書かれている。全タイトル・全本文・注記が対象。", 4.76);
    s.addNotes("SKILL.md の Writing rules 6箇条の要約。");
  }

  // ════════════════ 6. レイアウトライブラリ ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "レイアウトライブラリ",
      "13種のサンプル JS から最も近いものをコピーして組み立てる");
    const items = [
      ["agenda", "目次・現在地表示"], ["data-table", "縞模様の整形表"], ["chart", "棒・折れ線・円"],
      ["checklist", "状態つき項目"], ["process-flow", "工程と矢印"], ["matrix", "2x2 象限"],
      ["kanban", "列型カード"], ["gantt", "時間軸バー"], ["roadmap", "複数レーン"],
      ["pyramid", "階層ピラミッド"], ["tree", "分岐階層"], ["screenshot-annotation", "画像+注釈"],
    ];
    const cw = 2.93, chh = 0.62, gx = 0.11, gy = 0.13, x0 = 0.5, y0 = 1.62;
    items.forEach((c, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = x0 + col * (cw + gx), y = y0 + row * (chh + gy);
      s.addShape(RREC, { x, y, w: cw, h: chh, fill: { color: C.cardBg }, line: { color: "DDD6FE", pt: 1 }, rectRadius: 0.05 });
      s.addShape(RECT, { x, y: y + 0.08, w: 0.06, h: chh - 0.16, fill: { color: C.accent }, line: { type: "none" } });
      s.addText([
        { text: c[0], options: { bold: true, color: C.main, fontSize: 11.5, breakLine: true } },
        { text: c[1], options: { color: C.gray, fontSize: 10 } },
      ], { x: x + 0.18, y, w: cw - 0.3, h: chh, fontFace: FONT, valign: "middle", margin: 0, lineSpacingMultiple: 1.05 });
    });
    s.addText("ほかに diagram-image（図解パネル+読み取りポイント）。全サンプルは references/layouts/ に格納。", { x: 0.5, y: 4.72, w: 9, h: 0.26, fontFace: FONT, fontSize: 10, color: C.lightText, margin: 0 });
    s.addNotes("13種: agenda, chart, checklist, data-table, diagram-image, gantt, kanban, matrix, process-flow, pyramid, roadmap, screenshot-annotation, tree");
  }

  // ════════════════ 7. 図解テンプレート ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "図解テンプレート",
      "複雑な図は HTML テンプレート10種を調整し、PNG に描画して貼る");
    const rows = [
      ["flow", "横フロー・パイプライン・担当領域の受け渡し"],
      ["architecture", "ネスト枠つきの構成図"],
      ["layers", "レイヤ積み上げ"],
      ["hub-spoke", "中心と周辺の関係"],
      ["cycle", "循環プロセス"],
      ["swimlane", "役割別レーン"],
      ["compare", "対比構成"],
      ["funnel", "絞り込み段階"],
      ["tree", "分岐ツリー"],
      ["icons", "汎用アイコン集（他テンプレへコピー）"],
    ];
    const header = ["テンプレート", "用途"].map((h) => ({ text: h, options: { fontFace: FONT, bold: true, fontSize: 10, color: C.white, fill: { color: C.main }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08] } }));
    const body = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: {
      fontFace: FONT, fontSize: 10, bold: ci === 0, color: ci === 0 ? C.darkText : C.gray,
      fill: { color: ri % 2 === 0 ? C.cardBg : C.midBg }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08],
    } })));
    s.addTable([header, ...body], { x: 0.5, y: 1.60, w: 9.0, colW: [2.6, 6.4], rowH: 0.27, autoPage: false, border: { pt: 0.5, color: "DDD6FE" } });
    noteBand(s, "手順：テンプレートをコピー → :root の色をデッキの C 定数に差し替え → render_html.py で PNG 化 → 実寸比で配置。", 4.60);
    s.addNotes("本デッキ3枚目の図が flow.html の実例。");
  }

  // ════════════════ 8. 画像の配置 ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "画像の配置",
      "PptxGenJS は画像の実寸を読まないため、\n寸法は必ずファイルから計算する");
    listCard(s, 0.5, 1.62, 4.4, 2.9, "落とし穴", [
      "sizing: contain / cover は宣言 w/h 基準",
      "枠サイズと同値で渡すと単なる引き伸ばし",
      "円が楕円になる事故は描画するまで見えない",
    ], 11);
    listCard(s, 5.1, 1.62, 4.4, 2.9, "対策（user-images.md）", [
      "imgSize: PNG/JPEG/GIF のヘッダから実寸取得",
      "fitImage: 枠内に等比レターボックス",
      "coverImage: 枠を埋めて中央クロップ",
      "配置後は描画画像で歪み・切れを確認",
    ], 11);
    noteBand(s, "本デッキの図解も fitImage で配置している（4400×1700px → 9.0×3.48in、比率 2.59 を維持）。", 4.72);
    s.addNotes("references/user-images.md 参照。ユーザー提供の写真・スクショも同じヘルパーで配置する。");
  }

  // ════════════════ 9. 構成と依存関係（リファレンス締め） ════════════════
  {
    const s = pres.addSlide(); bg(s); pageNum(s);
    msgTitle(s, "構成と依存関係",
      "SKILL.md と references / scripts の2層構成、依存は Node・Python・LibreOffice");
    const rows = [
      ["SKILL.md", "ワークフロー・文章規則・デザインシステム・QA 手順"],
      ["references/palettes.md ほか", "パレット13種 / PptxGenJS 要点 / 画像配置 / 図解手順"],
      ["references/layouts/ (13)", "コピーして使うレイアウトサンプル JS"],
      ["references/diagrams/ (10)", "HTML 図解テンプレート"],
      ["scripts/layout_lint.py", "はみ出し・重なり・極小フォントの機械検査"],
      ["scripts/thumbnails.py", "スライド一覧のコンタクトシート生成"],
      ["scripts/render_html.py", "HTML 図解の PNG レンダラー"],
      ["scripts/add_slide_total.py", "ページ番号を「n / N」表示にする後処理"],
    ];
    const header = ["ファイル", "役割"].map((h) => ({ text: h, options: { fontFace: FONT, bold: true, fontSize: 10, color: C.white, fill: { color: C.main }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08] } }));
    const body = rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: {
      fontFace: FONT, fontSize: 10, bold: ci === 0, color: ci === 0 ? C.darkText : C.gray,
      fill: { color: ri % 2 === 0 ? C.cardBg : C.midBg }, align: "left", valign: "middle", margin: [0, 0, 0, 0.08],
    } })));
    s.addTable([header, ...body], { x: 0.5, y: 1.60, w: 9.0, colW: [3.3, 5.7], rowH: 0.32, autoPage: false, border: { pt: 0.5, color: "DDD6FE" } });
    s.addText("依存：Node.js + pptxgenjs ／ Python + markitdown[pptx]・pillow・pymupdf ／ LibreOffice（soffice）／ BIZ UDPGothic", { x: 0.5, y: 4.72, w: 9, h: 0.26, fontFace: FONT, fontSize: 10, color: C.lightText, margin: 0 });
    s.addNotes("説明資料はリファレンススライドで締める（Writing rules #2）。");
  }

  await pres.writeFile({ fileName: OUT });
  console.log("Written:", OUT);
}
main().catch((e) => { console.error(e); process.exit(1); });
