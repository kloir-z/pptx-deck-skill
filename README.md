# pptx-deck-skill

A Claude Code skill for building polished PowerPoint decks from scratch with
PptxGenJS — Japanese-first typography rules, curated palettes, a copy-paste
layout library, HTML diagram templates, and a mechanical QA pipeline.

Claude Code 用の PPTX 生成スキルです。PptxGenJS でデッキをコード生成し、
lint とレンダリング画像で品質確認するまでの一連の流れを定義します。
日本語スライドの組版（語中折り返し防止・フォントサイズ下限・メッセージ
タイトル運用）に重点を置いています。

## 特徴

- **2段階ワークフロー** — アウトライン合意 → コード生成。いきなり書かない
- **説明資料ファースト** — 宣伝調・キャッチコピー・AI くさい文面を排除する
  Writing rules（出典資料由来のキャッチフレーズも中和する）
- **13パレット** と 3色ルール（70:25:5）による配色統制
- **レイアウトライブラリ 13種** — agenda / data-table / gantt / kanban /
  matrix / process-flow / roadmap / tree など、コピーして使える JS サンプル
- **HTML 図解テンプレート 10種** — アーキテクチャ図・レイヤ図・サイクル図
  などを HTML で組んで PNG レンダリング（`scripts/render_html.py`）
- **画像の等比配置ヘルパー** — pptxgenjs が画像実寸を読まない問題
  （`sizing` 単独では引き伸ばしになる）への対策込み
- **機械 QA** — `layout_lint.py`（はみ出し・重なり・極小フォント検出）、
  `thumbnails.py`（コンタクトシート生成）、ページ番号の `n / N` 化

## インストール

Claude Code のスキルディレクトリに clone するだけです。

```bash
# ユーザー共通
git clone https://github.com/<you>/pptx-deck-skill ~/.claude/skills/pptx-deck

# または特定プロジェクトのみ
git clone https://github.com/<you>/pptx-deck-skill <project>/.claude/skills/pptx-deck
```

## 依存関係

```bash
npm install pptxgenjs          # 生成本体
npm install simple-icons       # ブランドロゴを使う場合のみ
pip install "markitdown[pptx]" pillow pymupdf
# LibreOffice（soffice を PATH へ）— PDF 変換・QA レンダリング
# BIZ UDPGothic フォント（Windows 11 は標準搭載 / Debian系: fonts-morisawa-bizud-gothic）
```

Windows / macOS / Linux で動作します。

## 構成

```
SKILL.md                        スキル本体（ワークフロー・文章規則・デザインシステム）
references/
  palettes.md                   パレットカタログ13種
  pptxgenjs-cheatsheet.md       PptxGenJS の要点と落とし穴
  user-images.md                ユーザー提供画像の等比配置（imgSize/fitImage/coverImage）
  diagram-rendering.md          HTML図解 → PNG のレンダリング手順
  brand-icons.md                ブランドロゴの解決と検証
  diagrams/*.html               図解テンプレート10種
  layouts/*.js                  レイアウトサンプル13種
scripts/
  layout_lint.py                レイアウト機械チェック
  thumbnails.py                 スライド一覧のコンタクトシート生成
  render_html.py                HTML図解のPNGレンダラー
  add_slide_total.py            ページ番号への総数付与（n / N）
  brand_icon.js                 ブランドアイコン解決
```

## 出自について

このスキルは、Anthropic 製 pptx スキル（source-available・再配布不可）を
ベースに個人環境でカスタマイズを重ねた知見を、**独立したスキルとして
新規に書き起こした**ものです。Anthropic のライセンス対象ファイルは
含まれていません。references/ と scripts/ は本リポジトリ著者のオリジナル、
SKILL.md は蓄積した運用知見の書き下ろしです。

## License

MIT
