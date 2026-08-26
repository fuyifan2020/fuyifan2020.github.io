/* =========================================================
   文章数据  —  首页文章列表由此渲染
   新增文章：在下方数组加一项，并创建 posts/<slug>.html
   字段：slug 文件名(不含扩展名) / title 标题 / date 日期
        / category 分类 / excerpt 摘要 / read 阅读时长
   ========================================================= */
window.POSTS = [
  {
    slug: "welcome",
    title: "你好，这里是傅艺梵",
    date: "2024-08-20",
    category: "随笔",
    excerpt: "关于这个网站的由来，以及我打算在这里记录些什么。",
    read: "3 分钟"
  },
  {
    slug: "on-typography",
    title: "为什么我偏爱衬线体",
    date: "2024-08-12",
    category: "设计",
    excerpt: "文字也是有呼吸的。聊聊我对排版与「高级感」的一点体会。",
    read: "5 分钟"
  },
  {
    slug: "slow-living",
    title: "在加速的时代里慢下来",
    date: "2024-07-30",
    category: "生活",
    excerpt: "关于专注、留白，以及把日子过成自己想要的样子。",
    read: "4 分钟"
  }
];
