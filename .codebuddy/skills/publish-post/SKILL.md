---
name: publish-post
description: 已并入 post 技能的跳板。发布/上传博客文章时请直接使用更完整的 post 技能（任意格式→md→脚本发布→人工核验→部署）。
---

# 发布文章（publish-post）—— 已由 post 技能取代

本技能原为发布流程的精简版，现已完整并入 `.codebuddy/skills/post/SKILL.md`（涵盖任意来源格式转换、front-matter 精修、脚本发布、人工核验、部署与冲突处理）。

**如需发布文章，请直接按 `post` 技能的流程执行**，不要按本文件做——本文件保留仅作历史参考。

## 核心命令（速查）
- 发布：`python3 scripts/publish_post.py "Blogs/<日期>"`
- 本地预览：`python3 -m http.server 8099`，打开 `http://localhost:8099/posts/<slug>.html`
- 部署：`git add -A && git commit -m "发布文章：<标题>" && git push origin main`

完整流程、格式转换、核验清单见 `post` 技能。
