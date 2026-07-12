# intro-deck — スキル自身の紹介デッキ（9枚）

このスキルの手順どおりに生成したサンプルです。全体像は [preview.jpg](preview.jpg) を参照。

```bash
npm install pptxgenjs
python ../../scripts/render_html.py workflow.html   # 図解 → workflow.png
node demo_deck.js                                   # → demo_deck.pptx
python ../../scripts/add_slide_total.py demo_deck.pptx
python ../../scripts/layout_lint.py demo_deck.pptx  # 0 error / 0 warning
python ../../scripts/thumbnails.py demo_deck.pptx   # コンタクトシート生成
```

パレット: Indigo + Lavender (#13) ／ self-narrating ／ explanatory
