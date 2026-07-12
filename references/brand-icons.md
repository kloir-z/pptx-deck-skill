# Brand Icons for Proper Nouns

Insert a brand logo (or a consistent fallback badge) next to **proper nouns** — products, tools, companies, languages, services (GitHub, Apple, Hugging Face, Qwen, Python, …). A small recognizable mark beside the name helps the reader place the concept faster than text alone. This is optional; reach for it when a slide names concrete tools/products and a mark would aid recognition (chips, list items, comparison-card headers, table rows, dividers).

## Verify every mark before shipping (required when marks are used)

The resolver tells you *what it matched*, not *whether it is right*. Skipping this step ships wrong logos — it has happened (a company wordmark used for a product; a placeholder lettermark for a famous brand; an unrelated OS-download icon fetched off a product page). If you add brand marks, do all of the following before declaring the deck done:

1. **Look at every rendered mark yourself.** Render each mark to a PNG and `Read` it in the main conversation (this is the one image-QA step you do *not* delegate — a subagent doesn't know what each brand's logo is supposed to look like). Confirm each is the recognizable mark of the *exact* entity named on the slide.
2. **`found:true` is not proof of correctness.** It only means the name matched a simple-icons entry — which may be the wrong entity or a near-miss. Verify the glyph, not the boolean.
3. **`found:false` (a lettermark) for a well-known commercial brand is a DEFECT, not a fallback.** Resolve it via a tier-2 fetch or a `brand_icon.js` alias, or remove brand marks from the deck entirely. Lettermarks are acceptable *only* for genuinely unbranded/internal names (a custom tool, an internal agent).
4. **Product ≠ vendor — choose deliberately.** "Claude Code", "Codex CLI", "Antigravity CLI" are products; "Anthropic", "OpenAI", "Google" are their vendors. The resolver will happily hand back a vendor's corporate logo (or an ambiguous wordmark like Anthropic's "AI") for a product name. Decide which you actually want, use it consistently, and never let a vendor logo silently stand in for a product mark (or vice-versa) without noticing.
5. **When fetching (tier 2), verify the fetched asset, not just that a fetch succeeded.** A product page hosts many SVGs/PNGs — OS-download badges, social icons, unrelated marks. Grabbing "the first square SVG" is how a Windows icon ends up representing an unrelated product. Open the candidate, look at it, and only then save it to `assets/`.

If you cannot obtain a correct, recognizable mark for every named entity, it is better to drop brand marks for the whole deck (use plain product-name text) than to ship a mismatched or placeholder one.

## Helper: `scripts/brand_icon.js`

`brandIconPng(name, opts)` resolves a name to a transparent PNG and returns a base64 data URL ready for `slide.addImage({ data })` (same pipeline as react-icons + sharp).

```javascript
const brand = require("../../scripts/brand_icon.js"); // adjust path to the skill

const apple = await brand.brandIconPng("Apple", { size: 128 });
slide.addImage({ data: apple.data, x: 2.05, y: 0.9, w: 0.2, h: 0.2 });
// apple.found (bool) · apple.kind ("logo" | "file" | "lettermark") · apple.title · apple.hex
```

Image generation is **async** — load every mark you need at the top of an `async main()`, store them in a plain map, then the synchronous slide code uses the map. Do not call `await` inside the per-slide blocks unless the whole build is already async.

```javascript
const ICON = {};
async function main() {
  ICON.apple = (await brand.brandIconPng("Apple", { size: 128 })).data;
  ICON.qwen  = (await brand.brandIconPng("Qwen",  { size: 128 })).data;
  // ... build slides using ICON.apple / ICON.qwen ...
  await pres.writeFile({ fileName: outFile });
}
main().catch((e) => { console.error(e); process.exit(1); });
```

## Resolution tiers (best → fallback)

1. **simple-icons** (automatic). 3000+ brand SVGs with official hex colors, bundled locally (offline-safe). Matched by normalized title/slug; a small alias table in the script handles tricky names (`Hugging Face`→`huggingface`, `Node.js`→`nodedotjs`, `macOS`→`macos`). Install once: `npm install simple-icons`.

2. **Web logo via the user's browser** (agent-fetched, per-deck). For a real brand that simple-icons lacks (e.g. `llama.cpp`), fetch the official asset with the chrome-devtools MCP, save it into the deck's `assets/`, and pass it through the helper with `{ file }`:
   - Find the official asset (e.g. a repo's `media/*.svg`). Open the raw URL in a new page, then serialize the SVG from the DOM (an SVG served as `image/svg+xml` becomes the document root):
     ```javascript
     // evaluate_script on the raw-SVG page:
     () => { const s = document.documentElement.cloneNode(true);
             s.querySelectorAll('[data-ab-filters-channel]').forEach(e=>e.removeAttribute('data-ab-filters-channel'));
             return new XMLSerializer().serializeToString(s); }
     ```
   - Save the returned string as `assets/<name>.svg`, then render through the helper:
     ```javascript
     // wide wordmark (≈3:1) → keep the aspect ratio with fileW/fileH
     ICON.llama = (await brand.brandIconPng("llama.cpp",
       { file: ASSET("llama-cpp.svg"), fileW: 600, fileH: 200 })).data;
     ```
   - **Wide wordmarks need wide slots** (a card header, a chip) — never squeeze a 3:1 wordmark into a 0.2" inline square. Square brand marks (most simple-icons) suit inline rows; wordmarks suit headers.
   - Only the agent can drive the browser; this tier is a manual, per-deck step, not part of the automatic script. Always save fetched assets under the deck's `assets/` so the build is reproducible.

3. **Lettermark** (automatic fallback). When no logo is found, the helper draws the initial(s) in a palette-colored circle — every proper noun still gets a consistent visual. Use it deliberately for internal/unbranded names (a custom tool, an agent named "Pi"):
   ```javascript
   ICON.gemma = (await brand.brandIconPng("Gemma", { size: 128, fallbackCircle: C.main })).data;
   // found:false, kind:"lettermark" → "G" in an indigo circle
   ```

## Color & placement

- **Logos are imagery, not palette colors** — a brand mark in its official color is a recognized object, so it is exempt from the 3-color rule. Keep it small (it lives in the 5% accent zone) and never let a logo's color leak into other shapes/text.
- **Light brand colors need a backing** — marks like Hugging Face yellow (`#FFD21E`) vanish on near-white slides. Place them on a small dark/tinted chip, or pass `{ color }` to recolor, or `{ monochrome:true }` to render in the palette `main` color:
  ```javascript
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.34, h: 0.34, fill: { color: C.darkText }, rectRadius: 0.05 });
  slide.addImage({ data: ICON.hf, x: x+0.06, y: y+0.06, w: 0.22, h: 0.22 });
  ```
- **Size**: 0.18–0.24" for inline marks beside a label; up to ~0.5" for card-header marks; wordmarks scale by width. Vertically center the mark on the text baseline and leave ~0.1" between mark and label.
- **One representation per entity** — don't show the same brand as a wordmark on one slide and a lettermark on another. Pick the form that fits and reuse it.
- **Don't logo every word** — mark the proper nouns that carry the slide (the tools being compared, the stack components), not generic terms ("ローカルLLM", "モデル"). Over-marking reads as clutter.
- Lettermark `found:false` is the signal that a name has no official logo — fine for niche/internal names; for a well-known brand that returns `found:false`, add an alias in `brand_icon.js` or fetch it via tier 2 instead of settling for initials.

## Dependencies

- `npm install simple-icons` — brand logo SVGs (tier 1). The script degrades gracefully to lettermarks if it is absent.
- `sharp` (already used by the icon pipeline) — SVG/PNG → PNG rasterization.
- chrome-devtools MCP — only for tier 2 (optional, agent-driven).
