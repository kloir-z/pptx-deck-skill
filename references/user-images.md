# Placing user-supplied images

How to incorporate images the user hands you — photos, screenshots, exported
figures, scanned pages — without distortion and with a deliberate layout.
(Rendered diagrams have their own pipeline: [diagram-rendering.md](diagram-rendering.md).
Brand logos: [brand-icons.md](brand-icons.md).)

## Step 0 — look at the image first (required)

Before writing any placement code, **Read the image file** and note:

1. **What it shows** — subject, orientation, where the visual weight sits,
   whether it contains text (text-in-image must stay legible → limits shrinking).
2. **Pixel size and aspect ratio** — from the helper below or
   `python -c "from PIL import Image; print(Image.open('img.jpg').size)"`.
3. **Which slide it belongs to** — assign it in the Stage 1 outline with a
   placement pattern from the table below. An image the user supplied is
   content, not decoration: the slide's message should reference it.

## Sizing helpers (required — never place with bare w/h)

pptxgenjs never reads an image file's real dimensions; `sizing:{type:"contain"}`
and `"cover"` compute from the **declared** `w`/`h`, so passing the box size for
both silently stretches the image. Always derive sizes from the file:

```js
const fs = require("fs");

// Intrinsic pixel size without external deps (PNG / JPEG / GIF).
function imgSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50)                       // PNG
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {                     // JPEG: find SOF
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xff) { i++; continue; }                    // fill byte
      if (m >= 0xd0 && m <= 0xd9) { i += 2; continue; }     // standalone
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  if (b.toString("ascii", 0, 3) === "GIF")                  // GIF87a/89a
    return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
  throw new Error("unsupported image format (convert to PNG first): " + file);
}

// Letterbox inside box, centered — shows the WHOLE image, never crops.
function fitImage(file, box) { // box = {x, y, w, h} in inches
  const px = imgSize(file);
  const k = Math.min(box.w / px.w, box.h / px.h);
  const w = px.w * k, h = px.h * k;
  return { path: file, x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}

// Fill box exactly, center-cropping the overflow (verified: emits a:srcRect).
// Declared w/h carries the real ratio; sizing "cover" then crops correctly.
function coverImage(file, box) {
  const px = imgSize(file);
  const k = Math.max(box.w / px.w, box.h / px.h);
  return { path: file, x: box.x, y: box.y, w: px.w * k, h: px.h * k,
           sizing: { type: "cover", w: box.w, h: box.h } };
}

slide.addImage(fitImage("photo.jpg", { x: 0.5, y: 1.6, w: 5.5, h: 3.0 }));
```

WebP/HEIC/AVIF: convert to PNG first (`python -c "from PIL import Image;
Image.open('a.webp').save('a.png')"`) — pptx image support and the helper
cover PNG/JPEG/GIF only.

## Choosing a placement pattern

| Image kind | Pattern | Build |
|------------|---------|-------|
| Figure / photo that carries content | **Framed panel + takeaway column** (default) | Card shape + `fitImage` inset ~0.08", 3 numbered reading points beside it — reuse `layouts/diagram-image.js` with `fitImage` |
| UI screenshot being explained | **Screenshot + annotation** | `layouts/screenshot-annotation.js`, place with `fitImage`, numbered callout badges |
| Scene-setting / mood photo | **Half-bleed cover** | `coverImage` over the full left or right half (edge to edge), text on the other half |
| Hero / section background | **Full-bleed cover + scrim** | `coverImage` over the whole slide, then a solid or `transparency: 40`+ rectangle under the text so it stays readable |
| Logo / wordmark | see [brand-icons.md](brand-icons.md) | — |

- **fit vs cover**: `fitImage` when the content matters edge to edge
  (screenshots, charts, documents — cropping loses information);
  `coverImage` when the image is atmosphere and clean edges matter more.
  After `coverImage`, check the render: nothing essential (faces, labels,
  toolbars) may fall in the cropped bands.
- **Screenshots need a border** — they are usually white-on-white against the
  slide: card panel or `line: { color: "E2E8F0", pt: 1 }` around the placed rect.
- **Photos are imagery** — like logos, exempt from the 3-color rule; keep
  frames, captions, and callouts in the deck palette, and don't recolor the photo.
- **Caption / attribution** — 10pt `C.lightText` line under the panel; name the
  source if the image isn't the user's own.

## Resolution guard

Effective resolution = `pixel width / placed width(in)`. Keep it **≥ ~100 px/in**
(a 1000px-wide image supports at most ~10" of width). Below that the render
looks soft — place the image smaller, or ask the user for a larger original.
Never scale a small image up to fill a hero.

## QA

The placed image is invisible to `layout_lint.py` — check the rendered slide:

1. No distortion (circles stay circles; compare against the source file)
2. Cover crops lose nothing essential
3. No pixelation at final size; text inside the image still legible
4. Frame, caption, and surrounding blocks align with the slide grid
