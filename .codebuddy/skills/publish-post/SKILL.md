---
name: publish-post
description: 将 Blogs/<日期>/ 下的文章（Markdown + 可选 PDF）发布为博客文章页，并登记到首页列表。当用户说“发布/上传/新增/写一篇文章”、“把这篇发出去”、“帮我发博客”时使用。
---

# 发布文章（publish-post）

当用户提供一篇文章（通常在 `Blogs/<日期>/` 文件夹，含一个 `.md` 正文与可选 `.pdf`）并希望发到博客时，按此流程操作。

## 何时使用
- 用户给了一段文字 / 一个文件，想发成博客文章。
- 用户说“上传文章”“发布这篇”“新增随笔”。

## 流程
1. **确认来源**：文章应在 `Blogs/<日期>/` 下，正文为 `.md`（推荐）或 `.txt`，PDF 随意命名。
   - 若用户只给了零散文字，先帮他整理成带 front-matter 的 `.md`（标题/分类/摘要写在 `---` 里）。
   - 用 `#`/`##` 写小节，` ``` ` 写代码，`|` 写表格，`1.` 写有序列表。
   - 想内嵌 PDF，在正文合适位置写 `{{PDF}}`（卡片 + 在线预览）；不写则追加到文末。
2. **运行脚本**：
   ```bash
   python3 scripts/publish_post.py "Blogs/<日期>"
   ```
   脚本会生成 `posts/<slug>.html`、把 PDF 复制到 `assets/papers/`、并在 `js/posts.js` 登记。
3. **检查结果**：本地 `python3 -m http.server 8099` 打开 `posts/<slug>.html` 看排版，确认 PDF 链接（`assets/papers/<slug>.pdf`）可访问。
4. **部署**：
   ```bash
   git add -A && git commit -m "发布文章：<标题>" && git push origin main
   ```
   提醒用户硬刷新查看。

## 约定（不要违反）
- 不要手写 `posts/*.html` 或手动改 `js/posts.js` 的数组——统一由脚本生成，避免格式错位。
- 首页文章列表由 `js/posts.js` 数据驱动，新增文章只需跑脚本，无需改 `index.html`。
- 删除文章 = 删除对应 `posts/<slug>.html`，下次跑脚本时 `posts.js` 会自动剔除。
- 文章页在 `posts/` 子目录，引用资源用 `../assets/...`、导航用 `../index.html`。

## 参考
- 人类可读指南：`POSTING.md`
- 站点整体结构：`CODEBUDDY.md`
