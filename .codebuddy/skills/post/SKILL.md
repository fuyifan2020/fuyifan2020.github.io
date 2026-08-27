---
name: post
description: 综合「上传博客文章」的完整流程——涵盖任意来源格式（txt/md/pdf/docx/html/pptx/图片/聊天零散文字）的归集与转换、按博客风格重组为带 front-matter 的 .md、运行发布脚本、本地人工核验排版、部署与冲突处理。当用户说“上传/发布/发一篇/把这份发出去/帮我发博客”时使用。
---

# 发布博客文章（post）

## 何时使用
- 用户给出一段文字 / 一个文件 / 一个文件夹，想要发成博客文章。
- 关键词：「上传文章」「发布这篇」「新增随笔」「把这份 blog 发出去」「帮我发博客」。

## 用户的习惯与硬性要求（务必遵守）
1. **风格统一**：暗色背景 + 香槟金/米色点缀、艺术画廊式高级感，中文为主。重组内容要贴合这种调性，不要破坏视觉语言。
2. **排版必须正确**：标题层级、列表、代码块、表格、链接、加粗都要规范。
3. **每次上传必须人工检查、调整至完美**：生成后先本地观察（起本地服务器 / 截图）核对排版，确认无误再部署；宁可多迭代几次，也不要带瑕疵上线。
4. 文章源通常放在 `Blogs/<日期>/` 草稿夹（日期形如 `2026_8_27`）。
5. 标题习惯沿用「XX 学习笔记：从 … 到 …」这类结构（参考已发布的 CTINexus、Embedding 两篇）。

## 全流程（按此顺序）

### 1. 定位 / 归集来源
来源可能在 `Blogs/<日期>/`，也可能直接贴在对话里。先确认素材位置与格式。

### 2. 按格式转换 / 提取为干净 .md
脚本 `scripts/publish_post.py` 只认 `.md`（优先）或 `.txt`（次优先）+ 可选 `.pdf`。其它格式先转成 `.md`：

| 格式 | 处理 |
|---|---|
| `.md` | 直接用；检查 front-matter 是否齐全 |
| `.txt` | 直接用；通常需重组为带 front-matter 的 .md |
| `.pdf`（作为正文） | 抽取文本再转 .md：`pdftotext file.pdf -` 或 `pandoc file.pdf -t markdown`；若只是要「附带」的论文 PDF，则放原文件并用正文 `{{PDF}}` 内嵌，**不要**抽文字 |
| `.docx` | `pandoc file.docx -t markdown -o out.md` |
| `.html` | `pandoc file.html -t markdown -o out.md`，或摘取正文 |
| `.pptx` / `.ppt` | `pandoc file.pptx -t markdown -o out.md`（或 python-pptx 抽文本） |
| 图片 `.png/.jpg/...` | ⚠️ 见下方「图片限制」 |
| 聊天零散文字 | 由你整理成带 front-matter 的 .md |

转换工具（pandoc / poppler 的 `pdftotext`）可能未安装，缺失时回退到手动誊写，并在交付说明里点出。

> 通用原则：**永远产出一份带 front-matter 的 `.md` 放进 `Blogs/<日期>/`，再由脚本生成**；不要手写 `posts/*.html`，也不要手动改 `js/posts.js` 的数组。

### 3. 编写 / 精修 .md（符合风格与排版）
front-matter 字段（放到文件顶部 `---` 块）：
```
---
title:    XX 学习笔记：从 … 到 …
slug:     xx-notes          # 英文短名，留空按标题生成
date:     2026-08-27        # 留空取文件夹名
category: 技术              # 留空默认「笔记」
excerpt:  一句话摘要（留空取首段）
paper:    原论文显示名（可选，仅当附 PDF 时用于卡片标题）
---
```
正文语法（脚本是手写正则解析器，**非标准 Markdown**，仅支持下列）：
- `#`→h2、`##`→h3、`###`→h4（`####` 及以上一律封顶 h4）
- `**加粗**`、`` `行内代码` ``、`[文本](链接)`
- 代码块用 ` ``` ` 围栏；表格用 `| a | b |`；有序 `1.` / 无序 `-`
- 引用 `>`、分隔线 `---`
- 正文写 `{{PDF}}` 在该处内嵌 PDF 下载卡片 + 在线预览；不写则自动追加文末
- **不支持**：嵌套列表、脚注、`![]()` 图片、裸 HTML（会被转义）、`###` 以上的真实 h5/h6

### 4. 运行发布脚本
```bash
python3 scripts/publish_post.py "Blogs/<日期>"
```
生成 `posts/<slug>.html`、复制 PDF 到 `assets/papers/`、写入 `js/posts.js`。

### 5. 本地人工核验（硬性要求，必须做）
1. **读生成的 `posts/<slug>.html`**，确认转换正确：h2/ol/ul/pre/code/a/strong 是否如期；有无内容丢失或错位。
2. **核对 `js/posts.js`**：新条目已登记、按 `date` 倒序（新文在前）。
3. **核对 CSS 覆盖**：`assets/css/style.css` 中该文用到的元素（`.post-body h2`、`.prose ol`、`.post-body pre/code`、`.prose a`、`.table-wrap` 等）确有样式——排版是否正确最终由这些规则决定。
4. **起本地服务器观察**：
   ```bash
   python3 -m http.server 8099
   ```
   打开 `http://localhost:8099/posts/<slug>.html`。若环境有可用的浏览器/截图工具（如 playwright），截图肉眼核对；若浏览器二进制下载受限、无法截图，则明确说明改用「结构 + CSS 规则 + 服务 200」核验，并提示用户自行硬刷新自查。
5. **迭代**：发现瑕疵就回改 `Blogs/<日期>/*.md` 重跑脚本，直到完美。

### 6. 部署
```bash
git add -A && git commit -m "发布文章：<标题>" && git push origin main
```

### 7. 处理「远程领先 / 冲突」（重要教训）
- 若 `push` 被拒（`fetch first`），先 `git pull --rebase origin main`。
- 出现 `modify/delete` 冲突时，**优先保留用户在远程的最新改动**（例如某文件用户在远程刚修订过，就不要因为本地曾删过而再次删掉它，那会销毁用户工作）。用 `git add <该文件>` 采用远程版本后 `git rebase --continue`。
- 必要时就冲突去向用户确认，不要凭猜测销毁远程内容。

### 8. 上线核验
- `curl -s -o /dev/null -w "%{http_code}" https://fuyifan2020.github.io/posts/<slug>.html` 期望 `200`。
- 首页列表由 `js/posts.js` 在浏览器端渲染，**不要**去 grep `index.html` 查标题（那里没有）；应确认线上 `js/posts.js` 包含该 `slug`。
- 提醒用户硬刷新查看。

## 已知限制与补充
- **图片不支持**：当前解析器不处理 `![]()`，且裸 HTML 会被转义，所以图片无法直接入文。若文章必须有图，要么文字描述，要么先扩展 `publish_post.py` 支持图片（存到 `assets/` 并自定义渲染）。交付时主动说明这一点。
- **删除文章**：直接删 `posts/<slug>.html`，下次跑任意一次发布脚本时 `js/posts.js` 会自动剔除；`assets/papers/<slug>.pdf` 不会自动清理，需手动删。
- 文章页在 `posts/` 子目录，引用资源用 `../assets/...`、导航用 `../index.html`。
- `read` 字段不写时按 350 字/分钟自动估算。

## 参考
- 人类可读发布指南：`POSTING.md`
- 站点结构与约定：`CODEBUDDY.md`
- 现有发布脚本：`scripts/publish_post.py`
- 同源精简技能：`.codebuddy/skills/publish-post/SKILL.md`
