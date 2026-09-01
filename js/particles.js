/*
 * particles.js — 全站漂浮微光点背景（分层景深）
 * 纯 Canvas 2D，无依赖。三层景深（远/中/近）缓慢漂移 + 正弦微摆，
 * 自动适配 DPR 与视口尺寸；文章页（存在 .post-body）自动减淡降密。
 * 尊重 prefers-reduced-motion：关闭动画、仅绘制低密度静态点。
 */
(function () {
  'use strict';

  var canvas = document.getElementById('particles');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');

  // 文章页（正文长、留白需克制）自动减淡
  var faint = !!document.querySelector('.post-body');

  // 是否允许动画
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 三层景深配置：[半径, 速度, 不透明度, 模糊, 数量系数]
  // 远层：极小、极慢、极淡；近层：略大、略快、带辉光。
  var LAYERS = [
    { rMin: 0.5, rMax: 1.2, spd: 0.06, alpha: 0.16, glow: 0,  density: 1.00 }, // 远
    { rMin: 1.0, rMax: 2.0, spd: 0.11, alpha: 0.30, glow: 4,  density: 0.55 }, // 中
    { rMin: 1.6, rMax: 3.0, spd: 0.17, alpha: 0.48, glow: 8,  density: 0.30 }  // 近
  ];

  if (faint) {
    // 文章页：密度与亮度整体下调，保留微弱的呼吸感
    LAYERS = LAYERS.map(function (l) {
      return {
        rMin: l.rMin, rMax: l.rMax,
        spd: l.spd * 0.7,
        alpha: l.alpha * 0.55,
        glow: l.glow,
        density: l.density * 0.45
      };
    });
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var particles = [];
  var rafId = null;
  var running = false;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function build() {
    particles = [];
    // 以 1280×800 为基准面积，按比例缩放总数，避免大屏过多/小屏过密
    var base = (W * H) / (1280 * 800);
    LAYERS.forEach(function (layer, li) {
      var count = Math.max(1, Math.round(base * 90 * layer.density));
      for (var i = 0; i < count; i++) {
        particles.push({
          layer: li,
          x: Math.random() * W,
          y: Math.random() * H,
          r: rand(layer.rMin, layer.rMax),
          vx: rand(-1, 1) * layer.spd,
          vy: rand(-0.6, -1) * layer.spd, // 整体缓慢上飘
          wob: rand(0, Math.PI * 2),       // 微摆相位
          wobAmp: rand(0.2, 0.8),          // 微摆幅度
          wobSpd: rand(0.4, 1.0)
        });
      }
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var layer = LAYERS[p.layer];

      // 正弦微摆 + 线性漂移
      var x = p.x + Math.sin(t * 0.001 * p.wobSpd + p.wob) * p.wobAmp;
      var y = p.y + Math.cos(t * 0.001 * p.wobSpd + p.wob) * p.wobAmp * 0.5;

      p.x += p.vx;
      p.y += p.vy;

      // 边界回绕：飘出屏幕则从对侧重新进入
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;

      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      var a = layer.alpha * (0.7 + 0.3 * Math.sin(t * 0.0015 + p.wob));
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      if (layer.glow) {
        ctx.shadowColor = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = layer.glow;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function loop(t) {
    draw(t);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    if (reduceMotion) {
      // 静态：仅绘制一帧低透明度点（不闪烁）
      draw(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // 标签页隐藏时暂停，节省资源
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  resize();
  start();
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  // 暴露最小接口，便于调试/页面级控制
  window.__particles = { start: start, stop: stop };
})();
