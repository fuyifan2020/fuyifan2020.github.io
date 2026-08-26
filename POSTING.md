# 发布新文章（POSTING）

本仓库有一套「放文件 → 跑脚本 → 推送」的文章发布流程，专为频繁更新设计。
核心脚本：`scripts/publish_post.py`（纯 Python，无需安装依赖）。

## 第一步：准备文章文件夹

在仓库根目录建一个以日期命名的文件夹，放入两样东西：

```
Blogs/2026_09_01/
├── article.md      ← 文章正文（Markdown）
└── paper.pdf       ← 可选，随附的 PDF（如原论文）
```

- 文章源文件优先用 `.md`；若只有 `.txt` 也会被读取（但 `.md` 排版更可控）。
- PDF 文件名随意，脚本会把它复制为 `assets/papers/<slug>.pdf`。

## 第二步：写文章（Markdown 约定）

文件顶部可写一段 front-matter（用 `---` 包裹），也可不写（脚本会自动推断）：

```markdown
---
title:    文章标题
slug:     ctinexus          # 网址短名，英文/数字；留空按标题生成
date:     2026-09-01         # 留空则取文件夹名 2026_09_01 -> 2026-09-01
category: 技术               # 留空默认“笔记”
excerpt:  列表里显示的摘要    # 留空取首段前 60 字
paper:    CTINexus 原论文     # PDF 卡片显示的名字
---

正文从这里开始，用 Markdown 书写：

# 小节标题            -> 渲染为 <h2>
## 子小节标题         -> 渲染为 <h3>
正文段落之间空一行即可。

\```bash
ollama serve         # 代码块用 ``` 围栏
\```

1. 有序列表
2. 第二项

| 阶段 | 模型 | 来源 |    # 表格用 | 分隔
| --- | --- | --- |
| A | x | y |

> 引用用大于号

在正文任意位置写 {{PDF}} 即可把随附 PDF 内嵌为「下载卡片 + 在线预览」，
不写则自动追加到文末。
```

提示：
- 标题层级用 `#`/`##` 即可（页面大标题已由 `title` 生成，无需再写一级标题）。
- 外链写成 `[文字](网址)`，会自动在新标签页打开。

## 第三步：运行脚本

```bash
python3 scripts/publish_post.py "Blogs/2026_09_01"
```

脚本会：
1. 生成 `posts/<slug>.html`（套用站点统一模板与暗金设计）；
2. 把 PDF 复制到 `assets/papers/<slug>.pdf`；
3. 在 `js/posts.js` 登记，首页列表自动出现新文章。

## 第四步：部署

```bash
git add -A
git commit -m "发布文章：<标题>"
git push origin main
```

GitHub Pages 约 1–2 分钟生效，**硬刷新 / 无痕窗口**查看。

## 删除文章

直接删除对应的 `posts/<slug>.html` 文件，下次运行任意一次发布脚本时，
`js/posts.js` 会自动剔除已不存在的文章（无需手动改数据）。

## 给 CodeBuddy / 未来自己

需要「类 skill」式的可复用说明，见 `.codebuddy/skills/publish-post/SKILL.md`；
本仓库的整体结构见 `CODEBUDDY.md`。
