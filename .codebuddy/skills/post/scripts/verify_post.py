#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify_post.py —— 对生成的文章做自动排版核验（配合「人工检查至完美」要求）

用法:
    python3 .codebuddy/skills/post/scripts/verify_post.py <slug>

检查项:
    1) posts/<slug>.html 是否存在
    2) 结构标签计数（h2 / pre / code / a / strong / ol / ul / blockquote）
    3) js/posts.js 是否已登记该 slug，且整体按 date 倒序
    4) assets/css/style.css 是否覆盖该文实际用到的元素选择器
注意: 脚本只核验结构与 CSS 是否存在，最终观感仍需本地服务器肉眼确认。
"""
import os
import re
import sys
import pathlib

ROOT = str(pathlib.Path(__file__).resolve().parents[4])


def main():
    if len(sys.argv) < 2:
        print("用法: python3 .codebuddy/skills/post/scripts/verify_post.py <slug>")
        sys.exit(1)
    slug = sys.argv[1]
    html_path = os.path.join(ROOT, "posts", slug + ".html")
    if not os.path.isfile(html_path):
        print("[错误] 找不到", html_path)
        sys.exit(1)
    html = open(html_path, encoding="utf-8").read()

    print("== 结构标签计数 ==")
    for tag in ("h2", "h3", "pre", "code", "a", "strong", "ol", "ul", "blockquote"):
        pat = r"<%s[\s>]" % tag
        print("  %-10s: %d" % (tag, len(re.findall(pat, html))))

    print("\n== js/posts.js ==")
    pj = os.path.join(ROOT, "js", "posts.js")
    pjc = open(pj, encoding="utf-8").read()
    print("  slug 已登记 :", ('slug: "%s"' % slug) in pjc)
    dates = re.findall(r'date:\s*"([^"]+)"', pjc)
    print("  日期倒序     :", dates == sorted(dates, reverse=True), dates)

    print("\n== CSS 覆盖（仅检查文中实际用到的元素）==")
    css = open(os.path.join(ROOT, "assets", "css", "style.css"), encoding="utf-8").read()
    sel = {
        "h2": ".post-body h2",
        "h3": ".post-body h3",
        "pre": ".post-body pre",
        "code": ".post-body code",
        "ol": ".prose ol",
        "ul": ".prose ul",
        "a": ".prose a",
        "blockquote": ".post-body blockquote",
        "table": ".table-wrap table",
    }
    for tag, selector in sel.items():
        if len(re.findall(r"<%s[\s>]" % tag, html)) > 0:
            ok = selector in css
            print("  %-10s 用到 %-20s : %s" % (tag, selector, "[OK]" if ok else "[缺失样式!]"))

    print("\n提示：脚本仅核验结构 / CSS 是否到位，最终观感仍需 `python3 -m http.server 8099` 肉眼确认。")


if __name__ == "__main__":
    main()
