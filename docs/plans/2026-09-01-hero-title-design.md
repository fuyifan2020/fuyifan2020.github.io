# 首页主标题动效设计方案（遮罩揭示）

- 日期：2026-09-01
- 范围：仅重做首页主标题 `Fu Yifan's Blog` 的**入场动效**，文案与排版结构不动。
- 背景：上一版「逐字交错 + 光扫」被判定为偏轻浮；本方案改为更克制、更高级的遮罩滑入。

## ① 架构与结构（核心机制）

遮罩揭示（Masked Reveal）：把标题按「词」切分为若干单元，每个词外层
`overflow:hidden` 当幕布，内层 `translateY(110%)` 藏在幕下；入场时内层滑回 `0`，
文字如被无形的幕拉开浮现。

```html
<h1 class="hero-title">
  <span class="word"><span class="word-inner">Fu</span></span>
  <span class="word"><span class="word-inner">Yifan's</span></span>
  <span class="word"><span class="word-inner">Blog</span></span>
</h1>
```

- 拆词与加 `is-anim` 由 `main.js` 在 DOM 就绪时同步完成（防闪烁：隐藏→拆词→显示）。
- 无 JS 时 `<h1>` 直接显示完整文案，零动画但可读。
- 旧的 `.char` 逻辑与 `::after` 光扫已移除。

## ② 动效细节

- **分词错落**：三词依次上浮，每词延迟 ~0.09s。
- **时长/缓动**：单词 0.85s，整体 ~1.1s；缓动 `cubic-bezier(0.22,1,0.36,1)`（类 easeOutQuint，尾段极缓「落定」）。
- **上移幅度**：`translateY(110%)→0`，确保降部字母完全藏住。
- **模糊消散**：叠加 `blur(8px)→0` 的轻微由虚到实，与「随笔/思考」主题呼应。
- **与粒子背景**：各自独立图层，自然叠加，互不抢戏。

## ③ 降级与无障碍

- `prefers-reduced-motion`：跳过拆分与动画，标题以纯文本完整显示（JS 早返回 + CSS `animation:none` 双保险）。
- 无 JS：HTML 即完整文案，完全可读。
- 窄屏换行：幕布逐词独立，换行至第二行也不会被整句幕布裁坏；词间距 `.word+.word{margin-left:.24em}`。
- SEO/ARIA：DOM 文本仍连续为 `Fu Yifan's Blog`，屏幕阅读器照常念出。

## ④ 实现与验证

- 改动文件：`assets/css/style.css`（替换 `.char`/`::after` 为 `.word`/`.word-inner` + `wordUp`）、`js/main.js`（拆词函数 `splitHeroTitle`）、`index.html`（文案不变）。
- 验证：`node --check js/main.js` 通过；CSS 花括号平衡；本地 `http.server 8099` 首页返回 200。
- 视觉核验：浏览器打开 `http://localhost:8099/index.html`，观察三词依次上浮+模糊消散；系统开启「减少动态」时标题直接显示。
