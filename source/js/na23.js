/* ============================================================
   NA23 自訂互動
   透過 _config.fluid.yml 的 custom_js 載入,不會動到主題原始碼。

   1. 首頁頂部:由字元組成的站名招牌,游標掃過的筆畫會亮起再褪色
   2. 其他頁面頂部:游標留下會褪色的字元軌跡
   3. 首頁精選作品:換作品時封面碎成字元再重組

   顏色全部取自 custom.css 的 --na-* 變數,深淺模式切換時自動跟著變。
   訪客的系統開了「減少動態效果」時,只顯示靜止畫面。
   ============================================================ */
(function () {
  'use strict';

  /* 招牌上的字。要改字時,用到的每個字元都要在下面的 FONT 裡有點陣圖 */
  var SIGN_TEXT = 'NA23.Chiao';

  /* 5×7 點陣字(1 = 有筆畫)。「.」比較窄,只有兩格寬 */
  var FONT = {
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '.': ['00', '00', '00', '00', '00', '11', '11'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    h: ['10000', '10000', '10110', '11001', '10001', '10001', '10001'],
    i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
    a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
    o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110']
  };

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MONO = 'ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace';
  var RAMP = ' .:;=+x%#@';

  /* ---------- 顏色:從 CSS 變數讀,深淺切換時重讀 ---------- */
  var P = {};
  var repaint = [];
  function readPalette() {
    var cs = getComputedStyle(root);
    ['rest', 'acc', 'hot0', 'hot1', 'hot2', 'card'].forEach(function (k) {
      P[k] = cs.getPropertyValue('--na-' + k).trim() || '#888';
    });
  }
  readPalette();
  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      readPalette();
      repaint.forEach(function (fn) { fn(); });
    }).observe(root, { attributes: true, attributeFilter: ['data-user-color-scheme'] });
  }

  /* ---------- 共用工具 ---------- */
  function fit(box, canvas, ctx) {
    var r = box.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return r;
  }
  function watchSize(el, fn) {
    if ('ResizeObserver' in window) new ResizeObserver(fn).observe(el);
    else window.addEventListener('resize', fn);
  }
  function watchVisible(el, fn) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { fn(es[0].isIntersecting); }).observe(el);
    } else fn(true);
  }

  /* ---------- 頂部:招牌與軌跡 ---------- */
  function mountBanner(banner, home) {
    var canvas = document.createElement('canvas');
    canvas.className = 'na-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    banner.insertBefore(canvas, banner.firstChild);
    var ctx = canvas.getContext('2d');
    var S = { w: 0, h: 0, px: 0, py: 0, lx: null, ly: 0, lastMove: -1e9 };
    var running = false, visible = true, raf = 0, last = 0;

    function layout() {
      var r = fit(banner, canvas, ctx);
      if (!r) return false;
      S.w = r.width; S.h = r.height; S.mask = null; S.sign = null;

      if (home) {
        var chars = SIGN_TEXT.split('').filter(function (c) { return FONT[c]; });
        var units = chars.reduce(function (n, c) { return n + FONT[c][0].length + 1; }, -1);
        /* 一個點陣格 = k 個字元寬、bh 個字元高,盡量接近正方形 */
        var signW = Math.min(S.w * 0.86, 880), block = signW / units;
        var k = Math.max(1, Math.round(block / 8));
        var bh = k === 1 ? 1 : Math.max(1, Math.round(k / 1.75));
        S.cw = block / k;
        S.ch = k === 1 ? S.cw * 1.3 : block / bh;
        S.cols = Math.ceil(S.w / S.cw); S.rows = Math.ceil(S.h / S.ch);

        /* 垂直位置:導覽列以下、副標題以上的空間置中 */
        /* 導覽列蓋住頂部多少(招牌要避開它) */
        var nav = document.getElementById('navbar');
        var top = nav ? nav.offsetHeight : 56;
        var signH = 7 * bh * S.ch;
        var below = S.w < 768 ? 60 : 88;   /* 留給副標題的高度,對應 custom.css 的 margin-bottom */
        var oy = Math.max(0, Math.round((top + Math.max(0, (S.h - top - below - signH) / 2)) / S.ch));
        var ox = Math.round((S.cols - units * k) / 2);

        S.mask = new Uint8Array(S.cols * S.rows);
        var x0 = 0;
        chars.forEach(function (c) {
          var g = FONT[c], kind = c === '.' ? 2 : 1;
          g.forEach(function (row, y) {
            for (var x = 0; x < row.length; x++) {
              if (row.charAt(x) !== '1') continue;
              for (var b = 0; b < bh; b++) for (var a = 0; a < k; a++) {
                var i = ox + (x0 + x) * k + a, j = oy + y * bh + b;
                if (i >= 0 && i < S.cols && j >= 0 && j < S.rows) S.mask[j * S.cols + i] = kind;
              }
            }
          });
          x0 += g[0].length + 1;
        });
        S.sign = { x: ox * S.cw, y: oy * S.ch, w: signW, h: signH };
        S.radius = Math.max(14, block * 2.4);   /* 光暈大小跟著招牌縮放,手機上才不會糊成一片 */
      } else {
        S.cw = 9; S.ch = 16; S.radius = 30;
        S.cols = Math.ceil(S.w / S.cw); S.rows = Math.ceil(S.h / S.ch);
      }
      S.heat = new Float32Array(S.cols * S.rows);
      S.lx = null;
      return true;
    }

    /* 沒人操作時,一道光沿著招牌慢慢來回掃 */
    function ghost(t) {
      return [
        S.sign.x + S.sign.w * (0.5 + 0.5 * Math.sin(t * 0.45)),
        S.sign.y + S.sign.h * (0.5 + 0.25 * Math.sin(t * 1.1))
      ];
    }
    function stamp(x, y) {
      var cx = x / S.cw, cy = y / S.ch, R = S.radius / S.ch, RX = S.radius / S.cw;
      var j0 = Math.max(0, Math.floor(cy - R)), j1 = Math.min(S.rows - 1, Math.ceil(cy + R));
      var i0 = Math.max(0, Math.floor(cx - RX)), i1 = Math.min(S.cols - 1, Math.ceil(cx + RX));
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
        var dx = (i + 0.5 - cx) / RX, dy = (j + 0.5 - cy) / R, d = dx * dx + dy * dy;
        if (d < 1) { var n = j * S.cols + i; if (1 - d > S.heat[n]) S.heat[n] = 1 - d; }
      }
    }
    function decay() {
      var h = S.heat, max = 0;
      for (var i = 0; i < h.length; i++) { h[i] *= 0.965; if (h[i] > max) max = h[i]; }
      return max;
    }

    /* 回傳 true 表示畫面上還有東西在變,要繼續跑下一格 */
    function step(now) {
      var useGhost = home && !reduce && now - S.lastMove > 2500;
      var moving = now - S.lastMove < 150;
      if (useGhost) { var g = ghost(now / 1000); S.px = g[0]; S.py = g[1]; }
      var max = decay();
      if (useGhost || moving) {
        if (S.lx === null) { S.lx = S.px; S.ly = S.py; }
        var dist = Math.hypot(S.px - S.lx, S.py - S.ly);
        var n = dist > 260 ? 1 : Math.max(1, Math.ceil(dist / 8));
        for (var s = 1; s <= n; s++) stamp(S.lx + (S.px - S.lx) * s / n, S.ly + (S.py - S.ly) * s / n);
        S.lx = S.px; S.ly = S.py;
        max = 1;
      } else S.lx = null;
      paint();
      return useGhost || max > 0.02;
    }
    function paint() {
      if (!S.w) return;
      ctx.clearRect(0, 0, S.w, S.h);
      ctx.font = '600 ' + Math.min(S.ch * 0.84, S.cw / 0.6) + 'px ' + MONO;
      ctx.textBaseline = 'top';
      for (var j = 0; j < S.rows; j++) for (var i = 0; i < S.cols; i++) {
        var n = j * S.cols + i, h = S.heat[n], m = S.mask ? S.mask[n] : 0, g;
        if (m) {
          g = '#';
          ctx.fillStyle = h > 0.7 ? P.hot0 : h > 0.4 ? P.hot1 : h > 0.14 ? P.hot2 : m === 2 ? P.acc : P.rest;
        } else if (home) {
          /* 招牌以外的軌跡只留淡淡的點,不搶筆畫 */
          if (h < 0.3) continue;
          g = '.'; ctx.fillStyle = P.hot2;
        } else {
          if (h <= 0.12) continue;
          g = h > 0.6 ? '+' : h > 0.32 ? ':' : '.';
          ctx.fillStyle = h > 0.6 ? P.hot1 : P.hot2;
        }
        ctx.fillText(g, i * S.cw, j * S.ch);
      }
    }
    function loop(now) {
      if (!visible) { running = false; return; }
      if (now - last < 33) { raf = requestAnimationFrame(loop); return; }
      last = now;
      if (step(now)) raf = requestAnimationFrame(loop); else running = false;
    }
    function kick() {
      if (running || reduce || !visible) return;
      running = true; raf = requestAnimationFrame(loop);
    }
    function resize() {
      if (!layout()) return;
      if (home && !reduce) {
        /* 先跑一小段,第一眼就看得到光 */
        var t0 = performance.now() / 1000;
        for (var s = 50; s >= 0; s--) { var g = ghost(t0 - s * 0.033); stamp(g[0], g[1]); decay(); }
      }
      paint(); kick();
    }

    if (!reduce) {
      banner.addEventListener('pointermove', function (e) {
        var r = banner.getBoundingClientRect();
        S.px = e.clientX - r.left; S.py = e.clientY - r.top; S.lastMove = performance.now();
        kick();
      });
    }
    watchSize(banner, resize);
    watchVisible(banner, function (v) { visible = v; if (v) kick(); });
    repaint.push(paint);
    resize();
  }

  /* ---------- 首頁精選作品:換圖時碎成字元再重組 ---------- */
  function mountFeature(el) {
    var items;
    try { items = JSON.parse(el.getAttribute('data-items')); } catch (e) { return; }
    if (!items || items.length < 2) return;

    var art = el.querySelector('.na-feat-art');
    var titleLink = el.querySelector('.na-feat-title a');
    var desc = el.querySelector('.na-feat-desc');
    var play = el.querySelector('.na-feat-play');
    var dots = Array.prototype.slice.call(el.querySelectorAll('.na-feat-dots button'));
    if (!art || !titleLink || !desc || !play) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'na-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    art.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var W = 0, H = 0, cw = 10, ch = 14, cols = 0, rows = 0, lum = [];
    var cur = 0, prev = 0, start = 0, raf = 0, visible = true, manual = false;
    var imgs = items.map(function (it) { var im = new Image(); if (it.cover) im.src = it.cover; return im; });

    function ok(im) { return im.complete && im.naturalWidth > 0; }
    function hash(i, j) { var v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); }
    function sample(n) {
      try {
        var off = document.createElement('canvas'); off.width = cols; off.height = rows;
        var c = off.getContext('2d', { willReadFrequently: true });
        c.drawImage(imgs[n], 0, 0, cols, rows);
        var d = c.getImageData(0, 0, cols, rows).data, out = new Float32Array(cols * rows);
        for (var k = 0; k < out.length; k++) {
          out[k] = Math.pow((0.2126 * d[k * 4] + 0.7152 * d[k * 4 + 1] + 0.0722 * d[k * 4 + 2]) / 255, 0.6);
        }
        return out;
      } catch (e) { return null; }
    }
    /* 靜止時畫布是空的,露出底下 CSS 背景的封面圖 */
    function rest() {
      cancelAnimationFrame(raf);
      if (items[cur].cover) art.style.backgroundImage = "url('" + items[cur].cover + "')";
      if (W) ctx.clearRect(0, 0, W, H);
    }
    function resize() {
      var r = fit(art, canvas, ctx);
      if (!r) return;
      W = r.width; H = r.height; cols = Math.ceil(W / cw); rows = Math.ceil(H / ch); lum = [];
      rest();
    }
    function frame() {
      var T = Math.max(0, Math.min(1, (performance.now() - start) / 1000));
      var a = imgs[prev], b = imgs[cur];
      if (!ok(b) || !W) { rest(); return; }
      ctx.clearRect(0, 0, W, H);
      if (ok(a)) ctx.drawImage(a, 0, 0, W, H);
      if (lum[cur] === undefined) lum[cur] = sample(cur);
      var L = lum[cur], sx = b.naturalWidth / W, sy = b.naturalHeight / H, RL = RAMP.length - 1;
      ctx.font = '600 ' + (ch * 0.85) + 'px ' + MONO; ctx.textBaseline = 'top';
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        /* 由左往右掃過去,每格再加一點亂數,邊緣才不會是一條直線 */
        var p = T * 2.2 - i / cols - hash(i, j) * 0.2;
        if (p < 0.3) continue;
        var x = i * cw, y = j * ch;
        if (p >= 0.75) { ctx.drawImage(b, x * sx, y * sy, cw * sx, ch * sy, x, y, cw + 0.5, ch + 0.5); continue; }
        ctx.fillStyle = P.card; ctx.fillRect(x, y, cw + 0.5, ch + 0.5);
        var g = RAMP[Math.round((L ? L[j * cols + i] : hash(j, i)) * RL)];
        if (g !== ' ') { ctx.fillStyle = p < 0.5 ? P.hot2 : P.hot1; ctx.fillText(g, x, y); }
      }
      if (T < 1) raf = requestAnimationFrame(frame); else rest();
    }
    function go(n) {
      if (n === cur) return;
      prev = cur; cur = n;
      var it = items[n], external = /^https?:\/\//i.test(it.url);
      titleLink.textContent = it.title;
      desc.textContent = it.desc;
      play.textContent = it.text;
      [titleLink, play, art].forEach(function (a) {
        a.href = it.url;
        if (external) { a.target = '_blank'; a.rel = 'noopener'; }
        else { a.removeAttribute('target'); a.removeAttribute('rel'); }
      });
      art.setAttribute('aria-label', it.title);
      dots.forEach(function (d, k) { d.setAttribute('aria-pressed', k === n ? 'true' : 'false'); });
      cancelAnimationFrame(raf);
      if (reduce || !ok(imgs[n])) { rest(); return; }
      start = performance.now(); raf = requestAnimationFrame(frame);
    }

    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { manual = true; go(n); });
    });
    watchSize(art, resize);
    watchVisible(art, function (v) { visible = v; });
    resize();
    /* 自動輪播;訪客自己按過、或開了減少動態效果,就不再自動換 */
    if (!reduce) {
      setInterval(function () {
        if (visible && !manual && !document.hidden) go((cur + 1) % items.length);
      }, 7000);
    }
  }

  /* ---------- 翻譯連結 ----------
     選單裡的 Google 翻譯連結預設指向首頁,這裡改成訪客當下這一頁。
     本機預覽時不改(Google 連不到 localhost) */
  function setupTranslate() {
    var host = location.hostname;
    if (/\.translate\.goog$/.test(host)) {
      /* 已經在翻譯後的頁面裡:Google 的工具列會蓋住導覽列,交給 custom.css 往下挪 */
      root.setAttribute('data-na-translated', '');
      return;
    }
    if (/^(localhost|127\.|\[::1\])/.test(host)) return;
    var here = encodeURIComponent(location.href.split('#')[0]);
    var links = document.querySelectorAll('a[href^="https://translate.google.com/translate"]');
    Array.prototype.forEach.call(links, function (a) {
      a.href = a.href.replace(/([?&]u=)[^&]*/, '$1' + here);
    });
  }
  setupTranslate();

  /* ---------- 啟動 ---------- */
  var feat = document.getElementById('na-feat');
  var home = !!feat || !!document.querySelector('.index-card');
  if (home) root.setAttribute('data-na-page', 'home');

  var banner = document.getElementById('banner');
  /* 內頁只有軌跡,開了減少動態效果就完全不需要畫布 */
  if (banner && (home || !reduce)) mountBanner(banner, home);
  if (feat) mountFeature(feat);
})();
