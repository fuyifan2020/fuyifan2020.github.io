/* =========================================================
   FuYifan · 个人博客  —  交互脚本
   1) 移动端 sheet 菜单（遮罩 + 白色面板）
   2) 首页文章列表渲染（数据来自 posts.js）
   3) 统计区：由 POSTS 计算覆写 + 计数动画
   4) 滚动渐显动效
   5) 当前导航高亮
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- 首页主标题：遮罩分词错落浮现 ---------------- */
  function splitHeroTitle() {
    var t = document.querySelector(".hero-title");
    if (!t || reduceMotion) return; // 减动模式保留纯文本
    var words = t.textContent.trim().split(/\s+/);
    t.textContent = "";
    t.style.opacity = "0"; // 仅在 JS 开启时短暂隐藏，无 JS 用户仍可见标题
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var outer = document.createElement("span");
      outer.className = "word";
      var inner = document.createElement("span");
      inner.className = "word-inner";
      inner.style.setProperty("--i", i);
      inner.textContent = w;
      outer.appendChild(inner);
      frag.appendChild(outer);
    });
    t.appendChild(frag);
    t.classList.add("is-anim");
    t.style.opacity = "1";
  }
  splitHeroTitle();

  /* ---------------- 移动端 sheet 菜单 ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var sheet = document.getElementById("nav-sheet");
  var overlay = document.querySelector(".nav-overlay");

  function isMenuOpen() {
    return toggle && toggle.getAttribute("aria-expanded") === "true";
  }

  function openMenu() {
    if (!toggle || !sheet || !overlay) return;
    sheet.hidden = false;
    overlay.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = sheet.querySelector("a");
    if (first) first.focus();
  }

  function closeMenu(returnFocus) {
    if (!toggle || !sheet || !overlay) return;
    sheet.hidden = true;
    overlay.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (returnFocus) toggle.focus();
  }

  if (toggle && sheet && overlay) {
    toggle.addEventListener("click", function () {
      if (isMenuOpen()) closeMenu(false);
      else openMenu();
    });

    overlay.addEventListener("click", function () { closeMenu(false); });

    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMenuOpen()) closeMenu(true);
    });

    // 视口变宽回到桌面布局时自动收起
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && isMenuOpen()) closeMenu(false);
    });
  }

  /* ---------------- 渲染首页文章列表 ---------------- */
  var listEl = document.getElementById("post-list");
  if (listEl && window.POSTS) {
    var posts = window.POSTS.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : -1; // 新文章在前
    });
    var html = posts
      .map(function (p, i) {
        return (
          '<a class="post-card reveal" style="--d:' + (i * 0.06).toFixed(2) + 's" href="posts/' +
          p.slug +
          '.html">' +
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
      })
      .join("");
    listEl.innerHTML = html;

    var countEl = document.getElementById("post-count");
    if (countEl) countEl.textContent = posts.length + " 篇";
  }

  /* ---------------- 统计区（仅首页） ---------------- */
  var statsEl = document.querySelector(".stats");
  if (statsEl && window.POSTS && window.POSTS.length) {
    var cats = {};
    var catCount = 0;
    var minutes = 0;
    var latest = "";

    window.POSTS.forEach(function (p) {
      if (p.category && !cats[p.category]) {
        cats[p.category] = 1;
        catCount++;
      }
      var m = parseInt(String(p.read || ""), 10); // read 形如「2 分钟」
      if (!isNaN(m)) minutes += m;
      if (p.date && p.date > latest) latest = p.date;
    });

    var vals = statsEl.querySelectorAll(".stat-value");
    if (vals.length >= 4) {
      vals[0].setAttribute("data-count", String(window.POSTS.length));
      vals[1].setAttribute("data-count", String(catCount));
      vals[2].setAttribute("data-count", String(minutes));
      if (latest) vals[3].textContent = latest.slice(0, 7); // 第 4 项是日期，不参与补间
    }

    function setFinal(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (!isNaN(target)) el.textContent = target.toFixed(decimals);
    }

    function runCount(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (isNaN(target)) return;
      if (reduceMotion) {
        setFinal(el);
        return;
      }
      var dur = 900;
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
      var statIO = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              Array.prototype.forEach.call(
                en.target.querySelectorAll(".stat-value[data-count]"),
                runCount
              );
              obs.unobserve(en.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      statIO.observe(statsEl);
    } else {
      Array.prototype.forEach.call(
        statsEl.querySelectorAll(".stat-value[data-count]"),
        setFinal
      );
    }
  }

  /* ---------------- 滚动渐显 ---------------- */
  var revealIO = null;

  function observeReveals(nodes) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              revealIO.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
    }
    nodes.forEach(function (el) {
      if (!el.classList.contains("in")) revealIO.observe(el);
    });
  }

  // 注意：列表项是上面动态生成的，必须在 innerHTML 之后再次观察，否则拿不到入场动画
  observeReveals(Array.prototype.slice.call(document.querySelectorAll(".reveal")));

  /* ---------------- 当前导航高亮 ---------------- */
  var path = location.pathname;
  var here = path.split("/").pop() || "index.html";
  var inPosts = /\/posts\//.test(path); // 文章详情页也算在「文章」栏目下

  document.querySelectorAll(".nav-links a, .nav-sheet nav a").forEach(function (a) {
    var target = (a.getAttribute("href") || "").split("/").pop();
    var isIndex = target === "index.html";
    if (target === here || (here === "" && isIndex) || (inPosts && isIndex)) {
      a.classList.add("active");
    }
  });
})();
