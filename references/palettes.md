# Color Palettes

## Palette Selection Prompt

**Before writing any slide code**, analyze the topic and recommend one palette. Use this format:

```
このプレゼンのトピック・雰囲気を踏まえ、[パレット名] (#N) をおすすめします。
理由：[1〜2文で説明]

このパレットで進めてよいですか？変更したい場合は別の番号か独自カラーをお知らせください。

（参考：利用可能なパレット一覧）
1. Navy + Orange    — 信頼感・テック・モダン
2. Forest + Lime    — 自然・サステナビリティ・成長
3. Cherry + Cream   — 情熱・アート・クリエイティブ
4. Slate + Sky      — クール・データ・分析
5. Charcoal + Gold  — プレミアム・高級感・エグゼクティブ
6. Blue Monotone    — 青系統一・プロフェッショナル・信頼
7. Orange + Yellow  — 活気・エネルギー・ポジティブ
8. Teal + Orange    — 爽やか・親しみやすい・バランス
9. Navy + Yellow    — インパクト・ダイナミック・若々しい
10. Monochrome B&W  — 白黒・技術文書・格式
11. Warm Gray       — 落ち着き・柔らかい・ニュートラル
12. Cool Gray       — クール・ミニマル・モノトーン
13. Indigo+Lavender — 紫・知性・AI・イノベーション
```

## Available Palettes

The 3-color palettes below follow the 70:25:5 rule. Each row shows: `Background (70%)` / `Main (25%)` / `Accent (5%)`.

| # | Theme | Background (70%) | Main (25%) | Accent (5%) |
|---|-------|-----------------|------------|-------------|
| 1 | **Navy + Orange** | `F8FAFC` (off-white) | `1E3A8A` (navy) | `F97316` (orange) |
| 2 | **Forest + Lime** | `F0FDF4` (mint-white) | `166534` (forest) | `84CC16` (lime) |
| 3 | **Cherry + Cream** | `FFF1F2` (rose-white) | `9F1239` (cherry) | `F59E0B` (amber) |
| 4 | **Slate + Sky** | `F8FAFC` (off-white) | `334155` (slate) | `38BDF8` (sky) |
| 5 | **Charcoal + Gold** | `FAFAF9` (warm-white) | `292524` (charcoal) | `D97706` (gold) |
| 6 | **Blue Monotone** | `E0E6E4` (blue-gray-white) | `1A43AA` (deep blue) | `15A2E9` (bright blue) |
| 7 | **Orange + Yellow** | `E0E4E7` (cool-gray-white) | `F47F29` (orange) | `FFDC5C` (yellow) |
| 8 | **Teal + Orange** | `E7F9F9` (teal-white) | `33BEC5` (teal) | `F17C1D` (orange) |
| 9 | **Navy + Yellow** *(all-dark)* | `113160` (dark navy) | `0B3E8D` (bright navy) | `E9D144` (yellow) |
| 10 | **Monochrome B&W** | `FAFAFA` (white) | `1A1A1A` (black) | `6B7280` (gray) |
| 11 | **Warm Gray** | `FAF9F7` (warm-white) | `44403C` (warm-gray) | `A8A29E` (beige-gray) |
| 12 | **Cool Gray** | `F8FAFC` (cool-white) | `334155` (cool-gray) | `94A3B8` (blue-gray) |
| 13 | **Indigo + Lavender** | `F5F3FF` (pale-violet) | `3730A3` (indigo) | `A78BFA` (lavender) |

## JavaScript Constant Template

Copy-paste and fill in your chosen palette:

```javascript
const C = {
  lightBg:  "F8FAFC",  // ALL slide backgrounds — never add a separate darkBg
  cardBg:   "FFFFFF",  // White — card / table cell backgrounds
  midBg:    "EFF6FF",  // Tinted bg — alternating rows, subtle section fills
  main:     "1E3A8A",  // Main (25%) — headers, icon circles, shape fills
  accent:   "F97316",  // Accent (5%) — highlights, badges, key numbers
  white:    "FFFFFF",
  gray:     "4B5563",  // Body text, subtitles, captions (≥7:1 contrast on white)
  darkText: "1E293B",  // Headings, bold labels
  lightText:"6B7280",  // Footnotes, legends, decorative labels (≥5:1 contrast on white)
};
```

## Usage Rules

- Replace `main` and `accent` with your chosen palette's values. Adjust `lightBg` and `midBg` to match the background column.
- Apply the chosen palette consistently to **all** backgrounds, shapes, icons, and text accents. Never introduce a 4th color mid-deck.
- Palette #9 is the only dark-background option — every slide uses `113160` background. Do not mix with light slides.
- Palettes #10–#12 are monochrome. Main and accent have low color contrast — differentiate via font weight (bold), size, and opacity instead of color alone. Use `midBg` for subtle row/section distinction.
- midBg values: #10 `F0F0F0`, #11 `F0EEEB`, #12 `EFF2F5`, #13 `EDE9FE`.
