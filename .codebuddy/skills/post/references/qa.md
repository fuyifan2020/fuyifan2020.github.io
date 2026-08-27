# 人工核验清单（references/qa.md）

本文件展开 `SKILL.md` 第 5 步「本地人工核验」的具体做法，确保每次上传都「调整至完美」。

## 自动核验：verify_post.py

生成文章后先跑一次自动检查：

```bash
python3 .codebuddy/skills/post/scripts/verify_post.py <slug>
```

它会输出：
1. 结构标签计数（h2/h3/pre/code/a/strong/ol/ul/blockquote）—— 一眼看出转换是否到位；
2. `js/posts.js` 是否登记该 slug、整体日期是否倒序；
3. `assets/css/style.css` 是否覆盖该文实际用到的元素（缺样式会标 `✗ 缺失样式!`）。

脚本只确认「结构与样式是否存在」，**不代表观感合格**。

## 人工肉眼核验（必须做）

1. 起本地服务器：
   ```bash
   python3 -m http.server 8099
   ```
2. 浏览器打开 `http://localhost:8099/posts/<slug>.html`，逐项确认：
   - 标题、分类、日期、阅读时长显示正常；
   - 各级标题层级与间距舒适；
   - 代码块有深色底框、等宽字体、横向不溢出；
   - 有序/无序列表序号与金色标记正确；
   - 链接为金色且可点；
   - 表格（若有）边框与对齐正常；
   - 引用块（若有）左金边、衬线样式；
   - 若有 `{{PDF}}`：下载卡片 + 在线预览 iframe 可见、链接可打开。
3. 回到首页 `http://localhost:8099/index.html`，确认新文章已出现在列表且排在最前（列表由 JS 渲染，需等字体与脚本加载）。

## 截图核验（若环境支持）

若环境里浏览器可用（如已装 playwright / chromium），截图核对排版最稳妥：

```bash
# 安装（仅首次，需网络）
npm install -g @playwright/cli@latest
playwright-cli install-browser
# 起服务器后
playwright-cli open http://localhost:8099/posts/<slug>.html
playwright-cli screenshot --filename=post.png
```

> 注意：本环境曾出现浏览器二进制下载卡住（网络受限）。若 `install-browser` 长时间无进度，不要死等——
> 改为「结构 + CSS 规则 + 服务 200」核验，并在交付说明里明确告知用户：已做静态核验，建议其自行硬刷新自查。

## 迭代闭环

发现任何瑕疵 → 回改 `Blogs/<日期>/*.md` → 重跑 `publish_post.py` → 再 `verify_post.py` + 肉眼确认，直到完美，再走部署。
