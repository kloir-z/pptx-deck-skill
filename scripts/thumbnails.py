"""Contact sheets for a PPTX: render every slide and tile them into JPG grids.

Pipeline: soffice (PPTX -> PDF) -> PyMuPDF (PDF -> page images) -> PIL (grid).

Usage:
    python thumbnails.py deck.pptx                # -> deck-sheet-1.jpg, ...
    python thumbnails.py deck.pptx -o qa/sheet --cols 4 --dpi 110
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image, ImageDraw

CELL_W = 320          # thumbnail width in px
PAD = 16              # grid padding
LABEL_H = 22          # room for the slide number under each cell


def pptx_to_pdf(pptx: Path, workdir: Path) -> Path:
    soffice = shutil.which("soffice")
    if not soffice:
        sys.exit("error: soffice not found on PATH (install LibreOffice)")
    subprocess.run(
        [soffice, "--headless", "--convert-to", "pdf",
         "--outdir", str(workdir), str(pptx)],
        check=True, capture_output=True,
    )
    pdf = workdir / (pptx.stem + ".pdf")
    if not pdf.exists():
        sys.exit("error: PDF conversion produced no output")
    return pdf


def render_pages(pdf: Path, dpi: int) -> list[Image.Image]:
    pages = []
    with fitz.open(pdf) as doc:
        for page in doc:
            pix = page.get_pixmap(dpi=dpi)
            pages.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
    return pages


def build_sheets(pages: list[Image.Image], cols: int, out_prefix: Path) -> list[Path]:
    per_sheet = cols * cols  # square-ish sheets keep each cell legible
    ratio = pages[0].height / pages[0].width
    cell_h = int(CELL_W * ratio)
    written = []

    chunks = [pages[i:i + per_sheet] for i in range(0, len(pages), per_sheet)]
    for si, chunk in enumerate(chunks, 1):
        rows = -(-len(chunk) // cols)
        sheet = Image.new(
            "RGB",
            (cols * CELL_W + (cols + 1) * PAD,
             rows * (cell_h + LABEL_H) + (rows + 1) * PAD),
            "white",
        )
        draw = ImageDraw.Draw(sheet)
        for i, page in enumerate(chunk):
            r, c = divmod(i, cols)
            x = PAD + c * (CELL_W + PAD)
            y = PAD + r * (cell_h + LABEL_H + PAD)
            thumb = page.resize((CELL_W, cell_h), Image.LANCZOS)
            sheet.paste(thumb, (x, y))
            draw.rectangle([x - 1, y - 1, x + CELL_W, y + cell_h], outline="#B0B0B0")
            draw.text((x + CELL_W // 2 - 8, y + cell_h + 4),
                      str(si * per_sheet - per_sheet + i + 1), fill="black")
        out = Path(f"{out_prefix}-{si}.jpg") if len(chunks) > 1 else Path(f"{out_prefix}.jpg")
        out.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(out, quality=92)
        written.append(out)
    return written


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("pptx", type=Path)
    ap.add_argument("-o", "--out", type=Path, default=None,
                    help="output prefix (default: <pptx stem>-sheet)")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--dpi", type=int, default=96)
    args = ap.parse_args()

    if not args.pptx.exists():
        sys.exit(f"error: {args.pptx} not found")
    prefix = args.out or args.pptx.with_name(args.pptx.stem + "-sheet")

    with tempfile.TemporaryDirectory() as td:
        pdf = pptx_to_pdf(args.pptx, Path(td))
        pages = render_pages(pdf, args.dpi)
    if not pages:
        sys.exit("error: no pages rendered")
    for f in build_sheets(pages, args.cols, prefix):
        print(f)


if __name__ == "__main__":
    main()
