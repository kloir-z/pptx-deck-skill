// ─────────────────────────────────────────────────────────────
// brand_icon.js
// 固有名詞（製品・ツール・企業名）→ ブランドロゴ PNG を解決するヘルパー。
//
// 解決順:
//   1. simple-icons（3000+ のブランドロゴ SVG / 公式カラー付き・ローカル同梱）
//   2. 見つからなければレターマーク（頭文字をパレット色の円に入れたバッジ）
//
// 出力は sharp で透過 PNG にラスタライズし、base64 データ URL で返す
// （pptxgenjs の addImage({ data }) にそのまま渡せる）。既存のアイコン
// パイプライン（react-icons + sharp）と同じ考え方。
//
// 使い方（生成 JS 内）:
//   const brand = require("../../scripts/brand_icon.js");
//   const apple = await brand.brandIconPng("Apple", { size: 128 });
//   slide.addImage({ data: apple.data, x, y, w: 0.24, h: 0.24 });
//   // apple.found / apple.kind ("logo" | "lettermark") / apple.hex / apple.title
//
// CLI（確認用）:
//   node scripts/brand_icon.js "Hugging Face" out.png
// ─────────────────────────────────────────────────────────────

"use strict";

const fs = require("fs");
const sharp = require("sharp");

let si = null;
try { si = require("simple-icons"); } catch (_) { si = null; }

// ── 名前 → simple-icons の別名（紛らわしいもの・表記揺れ） ────────
// 値は simple-icons の slug もしくは title。ここに無い名前はそのまま正規化照合。
const ALIASES = {
  "macos": "macos", "osx": "macos", "mac": "macos",
  "huggingface": "huggingface", "hf": "huggingface",
  "nodejs": "nodedotjs", "node": "nodedotjs",
  "vscode": "visualstudiocode",
  "githubactions": "githubactions",
  "x": "x", "twitter": "x",
};

// simple-icons には独自ロゴが無い／別物と紛らわしいので、あえてレターマークに
// 倒す名前（例: Gemma は Gemini ではない）。
const FORCE_LETTERMARK = new Set(["gemma"]);

function norm(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

let INDEX = null;
function buildIndex() {
  if (INDEX) return INDEX;
  INDEX = {};
  if (si) {
    for (const k of Object.keys(si)) {
      const ic = si[k];
      if (ic && ic.title && ic.path) {
        INDEX[norm(ic.title)] = ic;
        if (ic.slug) INDEX[norm(ic.slug)] = ic;
      }
    }
  }
  return INDEX;
}

// 名前から simple-icons のアイコン定義を引く（無ければ null）
function lookup(name) {
  const n = norm(name);
  if (FORCE_LETTERMARK.has(n)) return null;
  const idx = buildIndex();
  if (ALIASES[n]) return idx[norm(ALIASES[n])] || null;
  return idx[n] || null;
}

// 名前 → 頭文字（既定は1文字。camelCase/区切りは先頭のみ）
function initialsOf(name) {
  const cleaned = String(name).replace(/[^A-Za-z0-9]/g, "");
  if (!cleaned) return "?";
  return cleaned.slice(0, 1).toUpperCase();
}

function logoSvg(ic, hex) {
  const fill = "#" + (hex || ic.hex);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${ic.path}" fill="${fill}"/></svg>`;
}

function lettermarkSvg(initials, circleHex, textHex) {
  const c = "#" + circleHex, t = "#" + textHex;
  const fs = initials.length > 1 ? 96 : 128;
  // y を中央よりやや下げ、dominant-baseline と併用して描画系差を吸収
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="${c}"/>
  <text x="128" y="132" font-family="Arial, Helvetica, sans-serif" font-size="${fs}" font-weight="bold" fill="${t}" text-anchor="middle" dominant-baseline="central">${initials}</text>
</svg>`;
}

async function svgToPng(svg, size) {
  return await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/**
 * 固有名詞 → ロゴ PNG（base64 データ URL）
 * @param {string} name  製品/ツール/企業名（例 "Hugging Face", "llama.cpp"）
 * @param {object} opts
 *   size        出力ピクセル（既定 256）
 *   color       ロゴ／レターマーク円の色を強制（hex, "#"なし）。未指定ならロゴは公式色
 *   monochrome  true でロゴを fallbackCircle 色の単色にする
 *   initials    レターマークの文字を明示（既定は頭文字）
 *   fallbackCircle  レターマーク円の色（既定 3730A3）
 *   fallbackText    レターマーク文字色（既定 FFFFFF）
 * @returns {Promise<{data, found, kind, title, hex}>}
 */
async function brandIconPng(name, opts = {}) {
  const {
    size = 256, color = null, monochrome = false,
    initials = null, fallbackCircle = "3730A3", fallbackText = "FFFFFF",
    file = null, fileW = null, fileH = null,
  } = opts;

  // 経路0: ローカルのロゴファイル（Chrome 等で取得した SVG/PNG）を優先
  // 横長ワードマークは fileW/fileH（px）で縦横比を保ってラスタライズできる。
  if (file) {
    if (!fs.existsSync(file)) throw new Error("brand_icon: file not found: " + file);
    const w = fileW || size, h = fileH || size;
    const buf = await sharp(fs.readFileSync(file))
      .resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toBuffer();
    return { data: "image/png;base64," + buf.toString("base64"), found: true, kind: "file", title: name, hex: null };
  }

  const ic = lookup(name);
  if (ic) {
    const hex = color ? color : (monochrome ? fallbackCircle : ic.hex);
    const buf = await svgToPng(logoSvg(ic, hex), size);
    return { data: "image/png;base64," + buf.toString("base64"), found: true, kind: "logo", title: ic.title, hex: ic.hex };
  }
  const text = initials || initialsOf(name);
  const buf = await svgToPng(lettermarkSvg(text, color || fallbackCircle, fallbackText), size);
  return { data: "image/png;base64," + buf.toString("base64"), found: false, kind: "lettermark", title: null, hex: color || fallbackCircle };
}

/**
 * 固有名詞 → ロゴ SVG 文字列（HTML 図解への直接埋め込み用。sharp 不要）
 * references/diagram-rendering.md の HTML テンプレートの
 * <span class="node-icon">…</span> にそのまま貼れる。
 * @param {string} name  製品/ツール/企業名
 * @param {object} opts
 *   color       塗り色を強制（hex, "#"なし）。未指定ならロゴは公式色
 *   initials    レターマークの文字を明示（既定は頭文字）
 *   fallbackCircle / fallbackText  レターマークの円・文字色
 * @returns {{svg, found, kind, title, hex}}
 */
function brandIconSvg(name, opts = {}) {
  const {
    color = null, initials = null,
    fallbackCircle = "3730A3", fallbackText = "FFFFFF",
  } = opts;
  const ic = lookup(name);
  if (ic) {
    return { svg: logoSvg(ic, color || ic.hex), found: true, kind: "logo", title: ic.title, hex: ic.hex };
  }
  const text = initials || initialsOf(name);
  return {
    svg: lettermarkSvg(text, color || fallbackCircle, fallbackText),
    found: false, kind: "lettermark", title: null, hex: color || fallbackCircle,
  };
}

module.exports = { brandIconPng, brandIconSvg, lookup, initialsOf };

// ── CLI（確認用） ────────────────────────────────────────────
if (require.main === module) {
  const fs = require("fs");
  const name = process.argv[2];
  const out = process.argv[3] || "brand-icon.png";
  if (!name) { console.error('usage: node brand_icon.js "<name>" [out.png|out.svg]'); process.exit(1); }
  if (/\.svg$/i.test(out)) {
    const r = brandIconSvg(name);
    fs.writeFileSync(out, r.svg);
    console.log(`${name} -> ${r.kind}${r.title ? ' ("' + r.title + '" #' + r.hex + ')' : ' "' + (r.hex) + '"'} -> ${out}`);
  } else {
    brandIconPng(name, { size: 256 }).then((r) => {
      const b64 = r.data.split("base64,")[1];
      fs.writeFileSync(out, Buffer.from(b64, "base64"));
      console.log(`${name} -> ${r.kind}${r.title ? ' ("' + r.title + '" #' + r.hex + ')' : ' "' + (r.hex) + '"'} -> ${out}`);
    }).catch((e) => { console.error(e); process.exit(1); });
  }
}
