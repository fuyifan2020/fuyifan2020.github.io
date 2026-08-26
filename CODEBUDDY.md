# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## 项目概况

这是傅艺梵的个人博客，部署在 GitHub Pages：`https://fuyifan2020.github.io/`，仓库为 `https://github.com/fuyifan2020/fuyifan2020.github.io`。

**纯静态站点，无构建步骤、无依赖、无框架。** 所有页面直接由浏览器解析，GitHub Pages 原生托管（仓库即站点根目录，无需 `docs/` 子目录或 Jekyll）。

语言：中文为主；视觉：暗色背景 + 香槟金/米色点缀，艺术画廊式高级感。

## 常用命令

本仓库没有任何包管理器或构建工具，无需 `npm install` / `build`。

- **本地预览**：在仓库根目录运行 `python3 -m http.server 8099`，浏览器打开 `http://localhost:8099/index.html`。（必须用本地服务器预览，因为文章列表由 JS 渲染，直接双击 `file://` 打开时部分浏览器会拦截脚本。）
- **部署**：直接 `git add` + `git commit` + `git push` 到 `main` 分支，GitHub Pages 会自动发布（通常 1 分钟内生效）。
- **检查页面是否可访问**：`curl -s -o /dev/null -w "%{http_code}" http://localhost:8099/index.html`（预期 `200`）。
- **校验文章数据**：`node -e "global.window={};require('./js/posts.js');console.log(window.POSTS.length)"`。

## 架构与目录结构

```
index.html          首页：Hero 简介 + 文章列表容器(#post-list)
about.html          关于我页
posts/<slug>.html   每篇文章一个独立 HTML 文件（真实正文写在这里）
assets/css/style.css 全局设计系统（CSS 变量、排版、布局、响应式、动效）
js/posts.js         文章元数据数组 window.POSTS（首页列表的数据源）
js/main.js          交互脚本：渲染列表、移动端导航、滚动渐显、导航高亮
```

### 关键设计约定

1. **文章列表是数据驱动的**：首页 `#post-list` 由 `js/main.js` 读取 `js/posts.js` 中的 `window.POSTS` 数组渲染（按 `date` 倒序）。`posts.js` 里每项 `{slug, title, date, category, excerpt, read}` 对应一个 `posts/<slug>.html`。
2. **导航栏与页脚是手写重复的**：每个 HTML 顶部/底部都直接写了 `<header class="site-header">` 和 `<footer>`（未用 JS 注入），目的是即使 JS 失效页面仍可用，且对 SEO 友好。改动导航时需在 `index.html`、`about.html`、`posts/*.html` 同步修改。
3. **文章正文是真实 HTML**：`posts/<slug>.html` 内的 `<article class="post-body prose">` 直接写中文内容，可用 `.prose`、`.post-body` 下的 `h2/h3/blockquote/code/pre/ul` 等样式。
4. **样式集中在 `assets/css/style.css`**：颜色/字体等主题通过 `:root` 里的 CSS 变量统一控制（见 `--bg`、`--gold`、`--text` 等），改主题只需调变量，不要散落在各页面。
5. **字体走 Google Fonts**：`Noto Serif SC`（衬线标题）+ `Noto Sans SC`（无衬线正文），含 `display=swap` 与 `preconnect`，离线预览会回退到系统字体。

### 新增一篇文章的标准流程

1. 在 `posts/` 下新建 `<slug>.html`，复制任一篇现有文章为模板，替换 `post-header` 元信息与 `<article>` 正文。
2. 在 `js/posts.js` 的 `POSTS` 数组顶部（或任意位置）加一项，保证 `slug` 与文件名一致。
3. 如需要，更新首尾文章的「上一篇/下一篇」链接（`.post-nav`）。
4. 本地 `http.server` 预览，确认列表与详情页正常，再 `git push`。

### 易踩的坑

- 文章页在 `posts/` 子目录，引用资源要用 `../assets/css/style.css`、`../js/main.js`、`../index.html`（首页/关于页则用 `assets/...` 无 `../`）。
- 首页文章列表依赖 JS；若用户报告「列表空白」，先确认 `js/posts.js` 与 `js/main.js` 路径正确且 `POSTS` 中 `slug` 对应的 HTML 文件存在。
- 不要引入需要构建的步骤（如 Sass、React、打包器），会破坏「纯静态零构建」的部署方式。
