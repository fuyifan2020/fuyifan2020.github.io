/* =========================================================
   FuYifan · 个人博客  —  交互脚本
   1) 移动端导航开合
   2) 首页文章列表渲染（数据来自 posts.js）
   3) 滚动渐显动效
   ========================================================= */
(function () {
  "use strict";

  /* ---- 移动端导航 ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  /* ---- 渲染首页文章列表 ---- */
  var listEl = document.getElementById("post-list");
  if (listEl && window.POSTS) {
    var posts = window.POSTS.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1; // 新文章在前
    });
    var html = posts.map(function (p) {
      return (
        '<a class="post-card reveal" href="posts/' + p.slug + '.html">' +
          '<div class="meta">' +
            '<span class="cat">' + p.category + "</span>" +
            "<span>" + p.date + "</span>" +
            "<span>" + (p.read || "") + "</span>" +
          "</div>" +
          "<h3>" + p.title + "</h3>" +
          '<p class="excerpt">' + p.excerpt + "</p>" +
          '<div class="read">阅读全文 &rarr;</div>' +
        "</a>"
      );
    }).join("");
    listEl.innerHTML = html;

    var countEl = document.getElementById("post-count");
    if (countEl) countEl.textContent = posts.length + " 篇";
  }

  /* ---- 滚动渐显 ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- 当前导航高亮 ---- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var target = a.getAttribute("href");
    if (target === here ||
        (here === "" && target === "index.html") ||
        (here.indexOf("posts/") === 0 && target === "index.html")) {
      a.classList.add("active");
    }
  });
})();
