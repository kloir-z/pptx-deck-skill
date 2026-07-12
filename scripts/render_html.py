#!/usr/bin/env python3
"""render_html.py — HTML 図解を PNG にレンダリングするワンコマンドツール。

ヘッドレスブラウザ (Edge / Chrome / Chromium) を自動検出してスクリーンショットを撮る。
references/diagram-rendering.md のテンプレート (references/diagrams/*.html) 用。

Usage:
    python render_html.py diagram.html                    # diagram.png に出力
    python render_html.py diagram.html -o out.png
    python render_html.py diagram.html --size 1650x1000   # canvas サイズを明示
    python render_html.py diagram.html --scale 3          # 既定は 2 (2x 密度)

サイズは --size 未指定なら HTML の body style から width/height を読み取る
(テンプレートは全て `body { width: ...px; height: ...px; }` 形式)。
"""
import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

CHROME_CANDIDATES = [
    # Windows
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    # Linux
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    # macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]


def find_browser() -> str:
    for p in CHROME_CANDIDATES:
        if Path(p).is_file():
            return p
    sys.exit("error: Edge/Chrome/Chromium が見つかりません。CHROME_CANDIDATES にパスを追加してください。")


def parse_canvas_size(html_path: Path):
    """body の inline/embedded style から width/height (px) を読む。"""
    text = html_path.read_text(encoding="utf-8", errors="replace")
    # <style> 内の body { ... } ブロック、または <body style="..."> を対象にする
    scopes = []
    m = re.search(r"body\s*\{([^}]*)\}", text)
    if m:
        scopes.append(m.group(1))
    m = re.search(r"<body[^>]*style=\"([^\"]*)\"", text)
    if m:
        scopes.append(m.group(1))
    for scope in scopes:
        w = re.search(r"width\s*:\s*(\d+)px", scope)
        h = re.search(r"height\s*:\s*(\d+)px", scope)
        if w and h:
            return int(w.group(1)), int(h.group(1))
    return None


def main():
    ap = argparse.ArgumentParser(description="HTML 図解 → PNG レンダラー")
    ap.add_argument("html", help="入力 HTML ファイル")
    ap.add_argument("-o", "--out", help="出力 PNG (既定: 入力名.png)")
    ap.add_argument("--size", help="canvas サイズ WxH 例 1650x1000 (既定: HTML から自動検出)")
    ap.add_argument("--scale", type=int, default=2, help="device scale factor (既定 2)")
    args = ap.parse_args()

    html_path = Path(args.html).resolve()
    if not html_path.is_file():
        sys.exit(f"error: not found: {html_path}")
    out_path = Path(args.out).resolve() if args.out else html_path.with_suffix(".png")

    if args.size:
        m = re.fullmatch(r"(\d+)x(\d+)", args.size)
        if not m:
            sys.exit("error: --size は WxH 形式 (例 1650x1000)")
        size = (int(m.group(1)), int(m.group(2)))
    else:
        size = parse_canvas_size(html_path)
        if not size:
            sys.exit("error: HTML から canvas サイズを検出できません。--size WxH を指定してください。")

    browser = find_browser()
    with tempfile.TemporaryDirectory() as tmp:  # プロファイル分離 (既に起動中のブラウザと衝突させない)
        cmd = [
            browser,
            "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--default-background-color=00000000",
            f"--user-data-dir={tmp}",
            f"--window-size={size[0]},{size[1]}",
            f"--force-device-scale-factor={args.scale}",
            f"--screenshot={out_path}",
            html_path.as_uri(),
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

    if not out_path.is_file():
        sys.exit(f"error: レンダリング失敗\n{res.stderr[-2000:]}")

    # 出力サイズ検証 (Pillow があれば)
    try:
        from PIL import Image
        with Image.open(out_path) as im:
            w, h = im.size
        expected = (size[0] * args.scale, size[1] * args.scale)
        note = "" if (w, h) == expected else f"  ※期待値 {expected[0]}x{expected[1]} と不一致"
        print(f"OK: {out_path} ({w}x{h}px, scale={args.scale}){note}")
    except ImportError:
        print(f"OK: {out_path}")


if __name__ == "__main__":
    main()
