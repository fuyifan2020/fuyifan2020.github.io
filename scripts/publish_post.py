#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
publish_post.py —— 傅艺梵博客的文章发布脚本

用法:
    python3 scripts/publish_post.py "Blogs/2026_8_26"

它会读取 Blogs/<日期>/ 下的文章源文件（优先 .md，其次 .txt）和同名/任意 .pdf，
自动生成 posts/<slug>.html、把 PDF 复制到 assets/papers/、并在 js/posts.js 登记。

文章源文件约定（Markdown）:
    ---
    title:    文章标题
    slug:     url 用的短名（英文/数字，如 ctinexus），留空则按标题生成
    date:     2026-08-26（留空则取文件夹名 2026_8_26 -> 2026-08-26）
    category: 分类（留空默认“笔记”）
    excerpt:  列表摘要（留空取首段）
    ---

    正文用 Markdown 书写：
      # 小节        -> 渲染为 <h2>
      ## 子小节     -> 渲染为 <h3>
      代码用 ``` 围栏
      列表用 1. / - 
      表格用 | a | b |
      引用用 > 
    在正文任意位置写 {{PDF}} 表示把随附的 PDF 内嵌（下载卡片）到此处；
    不写则自动追加到文末。
"""

import os
import re
import sys
import shutil
import html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_JS = os.path.join(ROOT, "js", "posts.js")
POSTS_DIR = os.path.join(ROOT, "posts")
PAPERS_DIR = os.path.join(ROOT, "assets", "papers")

POST_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} · FuYifan</title>
  <meta name="description" content="{excerpt}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../assets/css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="../index.html">FuYifan<span class="dot">.</span></a>
      <button class="nav-toggle" aria-label="菜单"><span></span><span></span><span></span></button>
      <nav class="nav-links">
        <a href="../index.html">文章</a>
        <a href="../about.html">关于</a>
      </nav>
    </div>
  </header>
  <main class="wrap wrap-read">
    <header class="post-header reveal">
      <div class="meta">
        <span class="cat">{category}</span>
        <span>{date}</span>
        <span>{read}</span>
      </div>
      <h1>{title}</h1>
      <div class="rule"></div>
    </header>
    <article class="post-body prose reveal">
{body}
      <div class="post-nav">
        <a href="../index.html">&larr; 返回文章列表</a>
      </div>
    </article>
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <span>&copy; <span id="year"></span> FuYifan · 用文字留存时光</span>
      <span>
        <a href="../index.html">文章</a> &nbsp;·&nbsp;
        <a href="../about.html">关于</a> &nbsp;·&nbsp;
        <a href="https://github.com/fuyifan2020" target="_blank" rel="noopener">GitHub</a>
      </span>
    </div>
  </footer>
  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
  <script src="../js/main.js"></script>
</body>
</html>
"""

PAPER_CARD = """<div class="paper-card">
  <div class="paper-badge">PDF</div>
  <div class="paper-info">
    <div class="paper-name">{name}</div>
    <div class="paper-size">PDF · {size}</div>
  </div>
  <a class="paper-dl" href="../assets/papers/{slug}.pdf" target="_blank" rel="noopener">下载 / 查看 ↗</a>
</div>
"""

PAPER_FRAME = """<div class="paper-appendix">
  <h3>附：{name}</h3>
  <iframe class="paper-frame" src="../assets/papers/{slug}.pdf" title="{name}"></iframe>
</div>
"""


# ------------------------- 工具函数 -------------------------
def slugify(s):
    s = s.strip().lower()
    s = re.sub(r"[\s]+", "-", s)
    s = re.sub(r"[^a-z0-9\-一-鿿]", "", s)
    return s.strip("-") or "post"


def parse_front_matter(text):
    meta = {}
    body = text
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            block = text[3:end].strip("\n")
            for line in block.split("\n"):
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip('"').strip("'")
            body = text[end + 4:].lstrip("\n")
    return meta, body


def estimate_read(md):
    chars = len(re.sub(r"\s", "", md))
    return max(1, round(chars / 350))


def inline(s):
    # 先转义原文中的特殊字符，再插入标签（顺序不能反，否则标签会被转义成纯文本）
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # 链接 [t](u)
    s = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: '<a href="%s" target="_blank" rel="noopener">%s</a>' % (m.group(2), m.group(1)),
        s,
    )
    # 粗体 **x**
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    # 行内代码 `x`（内容已转义，直接包裹）
    s = re.sub(r"`([^`]+)`", lambda m: "<code>" + m.group(1) + "</code>", s)
    return s


def render_table(rows):
    cells = [[inline(c.strip()) for c in r] for r in rows]
    if len(cells) >= 2 and all(re.match(r"^[-:]+$", c) for c in cells[1]):
        head, body = cells[0], cells[2:]
    else:
        head, body = cells[0], cells[1:]
    out = ['<div class="table-wrap"><table>']
    out.append("<thead><tr>" + "".join("<th>%s</th>" % c for c in head) + "</tr></thead>")
    out.append("<tbody>")
    for r in body:
        out.append("<tr>" + "".join("<td>%s</td>" % c for c in r) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def md_to_html(md):
    lines = md.split("\n")
    out = []
    i, n = 0, len(lines)
    in_code = False
    code = []
    para = []
    list_type = None
    list_buf = []

    def flush_para():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    def flush_list():
        nonlocal list_type, list_buf
        if list_type:
            out.append("<%s>" % list_type)
            out.extend(list_buf)
            out.append("</%s>" % list_type)
            list_type = None
            list_buf = []

    while i < n:
        line = lines[i]
        if in_code:
            if line.strip().startswith("```"):
                out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
                code = []
                in_code = False
            else:
                code.append(line)
            i += 1
            continue
        if line.strip().startswith("```"):
            flush_para()
            flush_list()
            in_code = True
            i += 1
            continue
        s = line.strip()
        if not s:
            flush_para()
            flush_list()
            i += 1
            continue
        # 标题 # -> h2, ## -> h3 ...
        m = re.match(r"^(#{1,6})\s+(.*)", s)
        if m:
            flush_para()
            flush_list()
            lvl = min(len(m.group(1)) + 1, 4)
            out.append("<h%d>%s</h%d>" % (lvl, inline(m.group(2)), lvl))
            i += 1
            continue
        if s.startswith(">"):
            flush_para()
            flush_list()
            out.append("<blockquote>" + inline(s[1:].strip()) + "</blockquote>")
            i += 1
            continue
        if s == "---":
            flush_para()
            flush_list()
            out.append("<hr/>")
            i += 1
            continue
        if s == "{{PDF}}":
            flush_para()
            flush_list()
            out.append("__PDF__")
            i += 1
            continue
        if "|" in s and s.startswith("|") and s.endswith("|"):
            flush_para()
            flush_list()
            rows = []
            while i < n and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                rows.append(lines[i].strip().strip("|").split("|"))
                i += 1
            out.append(render_table(rows))
            continue
        m = re.match(r"^\d+[\.、]\s+(.*)", s)
        if m:
            flush_para()
            if list_type != "ol":
                flush_list()
                list_type = "ol"
            list_buf.append("<li>" + inline(m.group(1)) + "</li>")
            i += 1
            continue
        m = re.match(r"^[-*]\s+(.*)", s)
        if m:
            flush_para()
            if list_type != "ul":
                flush_list()
                list_type = "ul"
            list_buf.append("<li>" + inline(m.group(1)) + "</li>")
            i += 1
            continue
        para.append(s)
        i += 1
    flush_para()
    flush_list()
    return "\n".join(out)


# ------------------------- 发布流程 -------------------------
def update_posts_js(entry):
    if os.path.exists(POSTS_JS):
        src = open(POSTS_JS, encoding="utf-8").read()
    else:
        src = "window.POSTS = [\n];"
    entries = []
    for block in re.findall(r"\{\s*slug:[^}]*\}", src, re.S):
        d = {}
        for k in ("slug", "title", "date", "category", "excerpt", "read"):
            m = re.search(r'%s:\s*"([^"]*)"' % k, block)
            if m:
                d[k] = m.group(1)
        if d.get("slug"):
            entries.append(d)
    entries = [e for e in entries if e["slug"] != entry["slug"]]
    entries.append(entry)
    # 自动剔除已删除文章页（html 不存在即视为已下架）
    entries = [e for e in entries if os.path.exists(os.path.join(POSTS_DIR, e["slug"] + ".html"))]
    entries.sort(key=lambda e: e.get("date", ""), reverse=True)
    body = ["window.POSTS = ["]
    for e in entries:
        body.append("  {")
        for k in ("slug", "title", "date", "category", "excerpt", "read"):
            body.append('    %s: "%s",' % (k, e.get(k, "").replace('"', "'")))
        body.append("  },")
    body.append("];")
    open(POSTS_JS, "w", encoding="utf-8").write("\n".join(body) + "\n")


def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/publish_post.py <Blogs/日期文件夹>")
        sys.exit(1)
    folder = sys.argv[1]
    if not os.path.isdir(folder):
        folder = os.path.join(ROOT, folder)
    if not os.path.isdir(folder):
        print("找不到文件夹:", folder)
        sys.exit(1)

    md_file = None
    pdf_file = None
    for f in sorted(os.listdir(folder)):
        if f.endswith(".md") and md_file is None:
            md_file = os.path.join(folder, f)
        elif f.lower().endswith(".pdf") and pdf_file is None:
            pdf_file = os.path.join(folder, f)
    if md_file is None:
        for f in sorted(os.listdir(folder)):
            if f.endswith(".txt"):
                md_file = os.path.join(folder, f)
                break
    if not md_file:
        print("未找到 .md / .txt 文章源文件")
        sys.exit(1)

    text = open(md_file, encoding="utf-8").read()
    meta, body = parse_front_matter(text)

    folder_date = os.path.basename(folder.rstrip("/\\")).replace("_", "-")
    title = meta.get("title") or body.splitlines()[0] if body.strip() else "未命名"
    slug = meta.get("slug") or slugify(title)
    date = meta.get("date") or folder_date
    category = meta.get("category") or "笔记"
    excerpt = meta.get("excerpt") or ""
    if not excerpt:
        first = [l for l in body.splitlines() if l.strip() and not l.startswith(("#", ">", "```", "|"))]
        excerpt = inline(first[0][:60] + ("…" if len(first[0]) > 60 else "")) if first else ""
    read = meta.get("read") or ("%d 分钟" % estimate_read(body))

    content = md_to_html(body)

    if pdf_file:
        os.makedirs(PAPERS_DIR, exist_ok=True)
        dest = os.path.join(PAPERS_DIR, slug + ".pdf")
        shutil.copy(pdf_file, dest)
        size = os.path.getsize(dest)
        size_str = ("%.1f MB" % (size / 1024 / 1024)) if size > 1024 * 1024 else ("%d KB" % (size // 1024))
        name = meta.get("paper") or (title + "（原论文）")
        card = PAPER_CARD.format(name=name, size=size_str, slug=slug)
        frame = PAPER_FRAME.format(name=name, slug=slug)
        if "__PDF__" in content:
            content = content.replace("__PDF__", card)
        else:
            content += "\n" + card
        content += "\n" + frame  # 在线预览始终置于文末，避免打断阅读
    else:
        content = content.replace("__PDF__", "")

    os.makedirs(POSTS_DIR, exist_ok=True)
    post_html = POST_TEMPLATE.format(title=html.escape(title, quote=False), excerpt=html.escape(excerpt, quote=False),
                                     date=date, category=category, read=read, body=content)
    with open(os.path.join(POSTS_DIR, slug + ".html"), "w", encoding="utf-8") as fp:
        fp.write(post_html)

    update_posts_js({"slug": slug, "title": title, "date": date, "category": category,
                     "excerpt": excerpt, "read": read})

    print("✅ 已发布文章:")
    print("   标题 :", title)
    print("   slug :", slug)
    print("   文件 : posts/%s.html" % slug)
    print("   PDF  :", ("assets/papers/%s.pdf" % slug) if pdf_file else "无")
    print("   已写入 js/posts.js")


if __name__ == "__main__":
    main()
