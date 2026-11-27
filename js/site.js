(function () {
  "use strict";


  var STORAGE_KEY = "kyle-intro-lang-v4";
  var root = document.documentElement;
  var toggle = document.getElementById("lang-toggle");

  function currentLang() {
    return root.getAttribute("lang") === "zh-CN" ? "zh-CN" : "en";
  }

  function applyTenureYears() {
    var yrs = Math.max(17, new Date().getFullYear() - 2009);
    var nodes = document.querySelectorAll(".js-tenure-years");
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].textContent = String(yrs);
    }
  }

  function applyLang(lang) {
    var isEn = lang !== "zh-CN";
    root.setAttribute("lang", isEn ? "en" : "zh-CN");
    root.removeAttribute("dir");
    document
      .querySelectorAll("[data-label-zh][data-label-en]")
      .forEach(function (el) {
        var label = isEn
          ? el.getAttribute("data-label-en")
          : el.getAttribute("data-label-zh");
        el.setAttribute("aria-label", label);
        if (el.tagName === "IMG") {
          el.setAttribute("alt", label);
        }
        if (el.classList.contains("frame-play")) {
          var visual = el.closest(".frame-visual");
          var playing = visual && visual.classList.contains("is-playing");
          var playLabel = playing
            ? (isEn ? el.getAttribute("data-pause-en") : el.getAttribute("data-pause-zh"))
            : label;
          if (playLabel) {
            el.setAttribute("aria-label", playLabel);
          }
        }
      });
    if (toggle) {
      toggle.setAttribute("aria-pressed", isEn ? "true" : "false");
      var lbl = toggle.querySelector(".lang-label");
      if (lbl) {
        lbl.textContent = isEn ? "中文" : "EN";
      }
      toggle.setAttribute(
        "aria-label",
        isEn ? "Switch to Chinese" : "切换到英文"
      );
    }
    try {
      localStorage.setItem(STORAGE_KEY, isEn ? "en" : "zh-CN");
    } catch (err) {}
    applyTenureYears();
  }

  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    saved = null;
  }
  if (saved === "en" || saved === "zh-CN") {
    applyLang(saved);
  } else {
    applyLang("en");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      applyLang(currentLang() === "en" ? "zh-CN" : "en");
    });
  }

  var copyEmailBtn = document.getElementById("copy-email");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", function () {
      var email = copyEmailBtn.getAttribute("data-email") || "kyle.lee.china@gmail.com";
      var zhSpan = copyEmailBtn.querySelector(".i18n-zh");
      var enSpan = copyEmailBtn.querySelector(".i18n-en");
      var done = function () {
        if (zhSpan) zhSpan.textContent = "已复制邮箱 ✓";
        if (enSpan) enSpan.textContent = "Copied ✓";
        setTimeout(function () {
          if (zhSpan) zhSpan.textContent = "复制邮箱";
          if (enSpan) enSpan.textContent = "Copy email";
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }


  (function initTenureYears() {
    var nowYear = new Date().getFullYear();
    var nodes = document.querySelectorAll(".js-tenure-years");
    for (var i = 0; i < nodes.length; i += 1) {
      var start = parseInt(nodes[i].getAttribute("data-start-year") || "2009", 10);
      var yrs = Math.max(17, nowYear - start);
      nodes[i].textContent = String(yrs);
    }
  })();

  var printBtn = document.getElementById("print-profile");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* Hero 3-photo carousel (10s auto-advance + clickable dots) */
  (function initHeroSlides() {
    var slides = document.querySelectorAll(".opening-photo .hero-slide");
    var dots = document.querySelectorAll(".hero-dots .hero-dot");
    if (slides.length < 2) {
      return;
    }
    var cur = 0;
    var timer = null;
    function showSlide(idx) {
      cur = (idx + slides.length) % slides.length;
      for (var i = 0; i < slides.length; i += 1) {
        slides[i].classList.toggle("is-active", i === cur);
      }
      for (var j = 0; j < dots.length; j += 1) {
        var on = j === cur;
        dots[j].classList.toggle("is-active", on);
        dots[j].setAttribute("aria-selected", on ? "true" : "false");
      }
    }
    function resetTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(cur + 1);
      }, 10000);
    }
    for (var d = 0; d < dots.length; d += 1) {
      (function (idx) {
        dots[idx].addEventListener("click", function () {
          showSlide(idx);
          resetTimer();
        });
      })(d);
    }
    resetTimer();
  })();

  /* Sticky header gains weight after a small scroll past the top. */
  (function initMastWeight() {
    var mast = document.querySelector(".mast");
    if (!mast) {
      return;
    }
    var ticking = false;
    function sync() {
      ticking = false;
      mast.classList.toggle("is-scrolled", window.scrollY > 32);
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sync);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    sync();
  })();

  /* Main sections fade/rise on scroll. Disabled under reduced motion.
     Never applied to the folio track itself. */
  (function initSectionReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) {
      return;
    }
    function showAll() {
      els.forEach(function (el) {
        el.classList.add("is-in");
      });
    }
    if (reduceMotion) {
      showAll();
      return;
    }
    if (typeof window.IntersectionObserver !== "function") {
      showAll();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  })();

  /* Seamless right-to-left folio rail. Driven in JS so it still runs when
     the OS has disabled animation effects (prefers-reduced-motion). */
  (function initFolioRail() {
    var viewport = document.querySelector(".folio-viewport");
    var track = viewport ? viewport.querySelector(".folio-track") : null;
    var set = track ? track.querySelector(".folio-set") : null;
    if (!viewport || !track || !set) {
      return;
    }

    var PERIOD_MS = 90000;
    var EASE_MS = 420;
    var offset = 0;
    var lastTime = 0;
    var lastWidth = 0;
    var reasons = { hover: false, focus: false, hidden: false, print: false, video: false, zoom: false };
    var ease = null;
    var currentCard = null;
    var expandedCard = null;
    var pointerOnCard = null;
    var lastPtr = { x: 0, y: 0, has: false };
    var hoverFine =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    function paused() {
      return reasons.focus || reasons.hidden || reasons.print || reasons.video;
    }


    var pointerInViewport = false;
    function hoverSpeedMultiplier() {
      if (!pointerInViewport || !lastPtr.has || !hoverFine) {
        return 1;
      }
      var vr = viewport.getBoundingClientRect();
      if (vr.width <= 0) {
        return 1;
      }
      var relX = (lastPtr.x - vr.left) / vr.width;
      if (relX < 0.15) return -14.0;
      if (relX < 0.35) return -7.0;
      if (relX <= 0.65) return 0;
      if (relX <= 0.85) return 14.0;
      return 14.0;
    }

    function setWidth() {
      return set.getBoundingClientRect().width;
    }

    function apply() {
      track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
    }

    function normalizeOffset() {
      var width = setWidth();
      if (width <= 0) {
        return;
      }
      while (offset >= width) {
        offset -= width;
      }
      while (offset < 0) {
        offset += width;
      }
    }

    function viewportMid() {
      var vr = viewport.getBoundingClientRect();
      return vr.left + vr.width / 2;
    }

    function isCloneCard(card) {
      return !!(card && card.closest('[data-clone="true"]'));
    }

    function zoomOf(card) {
      if (!card || !card.classList.contains("is-expanded")) {
        return 1;
      }
      var z = parseFloat(card.style.getPropertyValue("--frame-zoom") || "");
      if (!z) {
        z = parseFloat(window.getComputedStyle(card).getPropertyValue("--frame-zoom") || "1.5");
      }
      return z || 1;
    }

    function parseOrigin(card) {
      var parts = window.getComputedStyle(card).transformOrigin.split(" ");
      return { x: parseFloat(parts[0]) || 0, y: parseFloat(parts[1]) || 0 };
    }

    function cardRect(card) {
      var r = card.getBoundingClientRect();
      var z = zoomOf(card);
      if (z === 1) {
        return { left: r.left, top: r.top, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
      }
      var o = parseOrigin(card);
      var left = r.left + o.x * (z - 1);
      var top = r.top + o.y * (z - 1);
      var width = r.width / z;
      var height = r.height / z;
      return { left: left, top: top, width: width, height: height, right: left + width, bottom: top + height };
    }

    function cardCenter(card) {
      var r = cardRect(card);
      return r.left + r.width / 2;
    }

    function frames() {
      return track.querySelectorAll(".frame");
    }

    function cardKey(card) {
      var img = card.querySelector("img");
      var vid = card.querySelector("video");
      var title = card.querySelector("h3") ? card.querySelector("h3").textContent : "";
      return (img ? img.getAttribute("src") : "") + "|" + (vid ? vid.getAttribute("src") : "") + "|" + title;
    }

    function counterpart(card) {
      if (!card) {
        return null;
      }
      var key = cardKey(card);
      var wantClone = !isCloneCard(card);
      var list = frames();
      for (var i = 0; i < list.length; i += 1) {
        var f = list[i];
        if (f !== card && cardKey(f) === key && isCloneCard(f) === wantClone) {
          return f;
        }
      }
      return null;
    }

    function neighborLis(li) {
      var prev = li.previousElementSibling;
      if (!prev && li.parentElement.previousElementSibling) {
        prev = li.parentElement.previousElementSibling.lastElementChild;
      }
      var next = li.nextElementSibling;
      if (!next && li.parentElement.nextElementSibling) {
        next = li.parentElement.nextElementSibling.firstElementChild;
      }
      return { prev: prev, next: next };
    }

    function updateHighlights() {
      var list = frames();
      if (!list.length) {
        return;
      }
      var mid = viewportMid();
      var best = null;
      var bestDist = Infinity;
      for (var i = 0; i < list.length; i += 1) {
        var d = Math.abs(cardCenter(list[i]) - mid);
        if (d < bestDist) {
          bestDist = d;
          best = list[i];
        }
      }
      if (!best) {
        return;
      }
      viewport.classList.add("is-hot");
      var near = {};
      var li = best.closest("li");
      if (li) {
        var nb = neighborLis(li);
        if (nb.prev) {
          near[nb.prev] = true;
        }
        if (nb.next) {
          near[nb.next] = true;
        }
      }
      for (var j = 0; j < list.length; j += 1) {
        var card = list[j];
        var isCurrent = card === best;
        var isNear = !isCurrent && near[card.closest("li")];
        card.classList.toggle("is-current", isCurrent);
        card.classList.toggle("is-near", !!isNear);
      }
      currentCard = best;
      syncOffscreenFocus();
    }

    function isCardInView(card) {
      var r = cardRect(card);
      var vr = viewport.getBoundingClientRect();
      var left = Math.max(r.left, vr.left);
      var right = Math.min(r.right, vr.right);
      var visible = Math.max(0, right - left);
      return r.width > 0 && visible / r.width >= 0.4;
    }

    function videoPlaying(card) {
      var video = card ? card.querySelector("video") : null;
      return !!(video && !video.paused && !video.ended);
    }

    function isInteractive(card) {
      if (!card) {
        return false;
      }
      if (card === expandedCard || card.classList.contains("is-expanded")) {
        return true;
      }
      if (card === pointerOnCard || card.matches(":hover")) {
        return true;
      }
      if (card === document.activeElement || card.contains(document.activeElement)) {
        return true;
      }
      if (videoPlaying(card)) {
        return true;
      }
      return false;
    }

    function syncOffscreenFocus() {
      var list = frames();
      var keepers = [];
      var i;
      for (i = 0; i < list.length; i += 1) {
        var card = list[i];
        var video = card.querySelector("video");
        if (!video) {
          continue;
        }
        var keep =
          isInteractive(card) ||
          card.classList.contains("is-current") ||
          isCardInView(card) ||
          videoPlaying(card);
        keepers.push({ card: card, video: video, keep: keep, key: cardKey(card) });
      }
      for (i = 0; i < keepers.length; i += 1) {
        if (!keepers[i].keep) {
          continue;
        }
        for (var j = i + 1; j < keepers.length; j += 1) {
          if (!keepers[j].keep || keepers[j].key !== keepers[i].key) {
            continue;
          }
          var a = keepers[i];
          var b = keepers[j];
          var pickA = 0;
          if (isInteractive(a.card) !== isInteractive(b.card)) {
            pickA = isInteractive(a.card) ? 1 : -1;
          } else if (videoPlaying(a.card) !== videoPlaying(b.card)) {
            pickA = videoPlaying(a.card) ? 1 : -1;
          } else {
            var da = Math.abs(cardCenter(a.card) - viewportMid());
            var db = Math.abs(cardCenter(b.card) - viewportMid());
            if (da !== db) {
              pickA = da < db ? 1 : -1;
            } else {
              pickA = isCloneCard(a.card) ? -1 : 1;
            }
          }
          if (pickA >= 0) {
            b.keep = false;
          } else {
            a.keep = false;
          }
        }
      }
      for (i = 0; i < keepers.length; i += 1) {
        var item = keepers[i];
        var playBtn = item.card.querySelector(".frame-play");
        if (item.keep) {
          item.video.setAttribute("controls", "");
          item.video.removeAttribute("tabindex");
          if (playBtn) {
            playBtn.removeAttribute("tabindex");
          }
        } else {
          item.video.removeAttribute("controls");
          item.video.tabIndex = -1;
          if (playBtn) {
            playBtn.tabIndex = -1;
          }
        }
      }
    }

    function fitZoom(card) {
      var desktop = window.matchMedia && window.matchMedia("(min-width: 701px)").matches;
      var max = desktop ? 1.5 : 1.22;
      var r = cardRect(card);
      var margin = 16;
      var availW = Math.max(120, window.innerWidth - margin * 2);
      var availH = Math.max(120, window.innerHeight - margin * 2);
      var s = Math.min(max, availW / r.width, availH / r.height);
      if (desktop) {
        return Math.max(1.2, Math.min(1.5, s));
      }
      return Math.max(1.12, Math.min(max, s));
    }

    function setOriginAndZoom(card) {
      var zoom = fitZoom(card);
      card.style.setProperty("--frame-zoom", String(zoom));
      var r = cardRect(card);
      var margin = 12;
      var boundL = margin;
      var boundR = window.innerWidth - margin;
      var boundT = margin;
      var boundB = window.innerHeight - margin;
      var denom = zoom - 1;
      var ox = r.width / 2;
      var oy = r.height / 2;
      if (denom > 0.001) {
        var minX = (r.left + r.width * zoom - boundR) / denom;
        var maxX = (r.left - boundL) / denom;
        var minY = (r.top + r.height * zoom - boundB) / denom;
        var maxY = (r.top - boundT) / denom;
        ox = Math.min(Math.max(ox, minX), maxX);
        oy = Math.min(Math.max(oy, minY), maxY);
        ox = Math.min(Math.max(ox, 0), r.width);
        oy = Math.min(Math.max(oy, 0), r.height);
      }
      card.style.transformOrigin = ox + "px " + oy + "px";
    }

    function startEaseTo(card) {
      if (!card) {
        return;
      }
      var delta = cardCenter(card) - viewportMid();
      if (Math.abs(delta) < 0.75) {
        ease = null;
        apply();
        return;
      }
      ease = {
        from: offset,
        to: offset + delta,
        start: performance.now(),
        dur: EASE_MS
      };
    }

    function nearestCopy(card) {
      var key = cardKey(card);
      var mid = viewportMid();
      var best = card;
      var bestD = Infinity;
      var list = frames();
      for (var i = 0; i < list.length; i += 1) {
        var f = list[i];
        if (cardKey(f) !== key) {
          continue;
        }
        var d = Math.abs(cardCenter(f) - mid);
        if (d < bestD) {
          bestD = d;
          best = f;
        }
      }
      return best;
    }

    function expand(card) {
      if (!card) {
        return;
      }
      if (expandedCard && expandedCard !== card) {
        collapse(expandedCard, true);
      }
      var mate = counterpart(card);
      if (mate && mate.classList.contains("is-expanded")) {
        mate.classList.remove("is-expanded");
        mate.style.removeProperty("transform-origin");
        mate.style.removeProperty("--frame-zoom");
      }
      setOriginAndZoom(card);
      card.classList.add("is-expanded");
      expandedCard = card;
      reasons.zoom = true;
      ease = null;
      syncOffscreenFocus();
    }

    function collapse(card, force) {
      if (!card) {
        return;
      }
      if (!force && videoPlaying(card)) {
        return;
      }
      card.classList.remove("is-expanded");
      card.style.removeProperty("transform-origin");
      card.style.removeProperty("--frame-zoom");
      if (expandedCard === card) {
        expandedCard = null;
      }
      if (!expandedCard) {
        reasons.zoom = false;
      }
      syncOffscreenFocus();
    }

    function requestCollapse(card) {
      if (!card) {
        return;
      }
      if (pointerOnCard === card || (pointerOnCard && cardKey(pointerOnCard) === cardKey(card) && !isCloneCard(pointerOnCard) === !isCloneCard(card))) {
        return;
      }
      if (card === document.activeElement || card.contains(document.activeElement)) {
        return;
      }
      collapse(card, false);
    }

    function tick(now) {
      var width = setWidth();
      if (width > 0) {
        if (lastWidth > 0 && width !== lastWidth) {
          offset = offset * (width / lastWidth);
          if (ease) {
            ease.from = ease.from * (width / lastWidth);
            ease.to = ease.to * (width / lastWidth);
          }
        }
        lastWidth = width;
        if (ease) {
          var t = (now - ease.start) / ease.dur;
          if (t >= 1) {
            offset = ease.to;
            ease = null;
            normalizeOffset();
            apply();
            if (expandedCard) {
              setOriginAndZoom(expandedCard);
            }
          } else {
            if (t < 0) {
              t = 0;
            }
            var e = 1 - Math.pow(1 - t, 3);
            offset = ease.from + (ease.to - ease.from) * e;
            apply();
          }
        } else if (!paused()) {
          if (!lastTime) {
            lastTime = now;
          }
          var delta = Math.min(64, now - lastTime);
          var mult = hoverSpeedMultiplier();
          if (mult !== 0) {
            offset += ((width * delta) / PERIOD_MS) * mult;
            normalizeOffset();
            apply();
          }
        }
      }
      lastTime = now;
      updateHighlights();
      requestAnimationFrame(tick);
    }

    function resumeClock() {
      lastTime = 0;
    }

    var videos = viewport.querySelectorAll("video");
    function anyVideoPlaying() {
      for (var i = 0; i < videos.length; i++) {
        if (!videos[i].paused && !videos[i].ended) return true;
      }
      return false;
    }
    function pauseVideosExcept(keep) {
      for (var i = 0; i < videos.length; i++) {
        if (videos[i] !== keep && !videos[i].paused) videos[i].pause();
      }
    }
    function syncPlayButton(video) {
      var visual = video.closest(".frame-visual");
      var btn = visual ? visual.querySelector(".frame-play") : null;
      var playing = !video.paused && !video.ended;
      if (visual) {
        visual.classList.toggle("is-playing", playing);
      }
      if (btn) {
        var isEn = document.documentElement.getAttribute("lang") === "en";
        var label = playing
          ? (isEn ? btn.getAttribute("data-pause-en") : btn.getAttribute("data-pause-zh"))
          : (isEn ? btn.getAttribute("data-label-en") : btn.getAttribute("data-label-zh"));
        if (label) {
          btn.setAttribute("aria-label", label);
        }
      }
    }
    function afterVideoState(video) {
      reasons.video = anyVideoPlaying();
      syncPlayButton(video);
      var card = video.closest(".frame");
      if (card && !videoPlaying(card) && pointerOnCard !== card && !(card === document.activeElement || card.contains(document.activeElement))) {
        if (expandedCard === card) {
          collapse(card, false);
        }
      }
      apply();
      if (!paused()) {
        resumeClock();
      }
      syncOffscreenFocus();
    }
    videos.forEach(function (video) {
      video.addEventListener("play", function () {
        reasons.video = true;
        pauseVideosExcept(video);
        syncPlayButton(video);
        var card = video.closest(".frame");
        if (card) {
          expand(card);
        }
        apply();
        syncOffscreenFocus();
      });
      video.addEventListener("pause", function () {
        afterVideoState(video);
      });
      video.addEventListener("ended", function () {
        afterVideoState(video);
      });
    });

    function toggleVideo(card, event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (!card) {
        return;
      }
      expand(card);
      var video = card.querySelector("video");
      if (!video) {
        return;
      }
      if (video.paused || video.ended) {
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {
            /* gesture or codec issue: controls remain for a manual retry */
            syncPlayButton(video);
          });
        }
      } else {
        video.pause();
      }
    }

    function pointerCardFromEvent(event) {
      var node = event.target;
      if (!node || !node.closest) {
        if (lastPtr.has) {
          var hit = document.elementFromPoint(lastPtr.x, lastPtr.y);
          node = hit;
        }
      }
      if (!node || !node.closest) {
        return null;
      }
      var card = node.closest(".frame");
      if (!card || !viewport.contains(card)) {
        return null;
      }
      return card;
    }

    function isVideoChrome(event) {
      var t = event.target;
      if (!t || !t.closest) {
        return false;
      }
      if (t.closest(".frame-play")) {
        return true;
      }
      if (t.closest("video")) {
        return true;
      }
      return false;
    }

    viewport.addEventListener("pointermove", function (event) {
      lastPtr = { x: event.clientX, y: event.clientY, has: true };
      if (!event.pointerType || event.pointerType === "mouse" || event.pointerType === "pen") {
        pointerInViewport = true;
      }
    });

    viewport.addEventListener("mouseenter", function () {
      reasons.hover = true;
      pointerInViewport = true;
    });
    viewport.addEventListener("mouseleave", function () {
      reasons.hover = false;
      pointerInViewport = false;
      pointerOnCard = null;
      if (expandedCard && !videoPlaying(expandedCard)) {
        collapse(expandedCard, false);
      }
      if (!paused()) {
        ease = null;
        normalizeOffset();
        apply();
        resumeClock();
      }
    });
    viewport.addEventListener("focusin", function (event) {
      reasons.focus = true;
      var card = event.target.closest(".frame");
      if (card && viewport.contains(card)) {
        var live = nearestCopy(card);
        expand(live);
        startEaseTo(live);
      }
    });
    viewport.addEventListener("focusout", function (event) {
      if (!viewport.contains(event.relatedTarget)) {
        reasons.focus = false;
        if (expandedCard && !videoPlaying(expandedCard) && pointerOnCard !== expandedCard) {
          collapse(expandedCard, false);
        }
        if (!paused()) {
          ease = null;
          normalizeOffset();
          apply();
          resumeClock();
        }
      }
    });

    var originalFrames = set.querySelectorAll(".frame");
    for (var i = 0; i < originalFrames.length; i += 1) {
      originalFrames[i].tabIndex = 0;
    }
    var cloneSet = track.querySelector('.folio-set[data-clone="true"]');
    if (cloneSet) {
      var cloneFocusable = cloneSet.querySelectorAll("video, button, a, [tabindex]");
      for (var cv = 0; cv < cloneFocusable.length; cv += 1) {
        cloneFocusable[cv].tabIndex = -1;
        if (cloneFocusable[cv].tagName === "VIDEO") {
          cloneFocusable[cv].removeAttribute("controls");
        }
      }
      var cloneFrames = cloneSet.querySelectorAll(".frame");
      for (var cf = 0; cf < cloneFrames.length; cf += 1) {
        cloneFrames[cf].removeAttribute("tabindex");
      }
    }
    syncOffscreenFocus();

    var allFrames = frames();
    for (var k = 0; k < allFrames.length; k += 1) {
      (function (card) {
        card.addEventListener("pointerenter", function (event) {
          lastPtr = { x: event.clientX, y: event.clientY, has: true };
          if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
            return;
          }
          pointerOnCard = card;
          reasons.hover = true;
          expand(card);
        });
        card.addEventListener("pointerleave", function (event) {
          if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
            return;
          }
          if (pointerOnCard === card) {
            pointerOnCard = null;
          }
          requestCollapse(card);
        });
        card.addEventListener("click", function (event) {
          if (isVideoChrome(event)) {
            if (!card.classList.contains("is-expanded")) {
              expand(card);
            }
            return;
          }
          if (hoverFine && event.pointerType !== "touch") {
            return;
          }
          if (card.classList.contains("is-expanded") && expandedCard === card) {
            collapse(card, false);
          } else {
            expand(card);
          }
        });
      })(allFrames[k]);
    }

    viewport.addEventListener("click", function (event) {
      var btn = event.target.closest && event.target.closest(".frame-play");
      if (!btn || !viewport.contains(btn)) {
        return;
      }
      toggleVideo(btn.closest(".frame"), event);
    });

    document.addEventListener("pointerdown", function (event) {
      if (!expandedCard) {
        return;
      }
      var t = event.target;
      if (t && expandedCard.contains(t)) {
        return;
      }
      if (t && t.closest && t.closest(".frame") && viewport.contains(t.closest(".frame"))) {
        return;
      }
      if (videoPlaying(expandedCard)) {
        return;
      }
      if (event.pointerType === "touch" || !hoverFine) {
        collapse(expandedCard, false);
        if (!paused()) {
          resumeClock();
        }
      }
    });

    document.addEventListener("visibilitychange", function () {
      
    var filterBtns = document.querySelectorAll(".folio-filter-btn");
    var activeFilter = "core";
    function applyFolioFilter(cat) {
      activeFilter = cat || "core";
      if (activeFilter === "core") {
        PERIOD_MS = 90000;
      } else if (activeFilter === "personal") {
        PERIOD_MS = 65000;
      } else {
        PERIOD_MS = 90000;
      }
      var allLis = track.querySelectorAll(".folio-set > li");
      for (var fi = 0; fi < allLis.length; fi += 1) {
        var li = allLis[fi];
        var match = activeFilter === "all" || li.getAttribute("data-category") === activeFilter;
        li.hidden = !match;
      }
      for (var bi = 0; bi < filterBtns.length; bi += 1) {
        var b = filterBtns[bi];
        var isOn = b.getAttribute("data-filter") === activeFilter;
        b.classList.toggle("is-active", isOn);
        b.setAttribute("aria-pressed", isOn ? "true" : "false");
      }
      if (expandedCard) {
        collapse(expandedCard, true);
      }
      offset = 0;
      lastWidth = setWidth();
      apply();
      updateHighlights();
    }
    for (var fbi = 0; fbi < filterBtns.length; fbi += 1) {
      filterBtns[fbi].addEventListener("click", function () {
        applyFolioFilter(this.getAttribute("data-filter"));
      });
    }
    applyFolioFilter("core");

    reasons.hidden = document.hidden;
      if (!document.hidden) {
        resumeClock();
      }
    });

    if (typeof window.matchMedia === "function") {
      var printQuery = window.matchMedia("print");
      var syncPrint = function () {
        reasons.print = !!printQuery.matches;
        if (reasons.print) {
          ease = null;
          if (expandedCard) {
            collapse(expandedCard, true);
          }
          track.style.transform = "none";
        } else {
          resumeClock();
        }
      };
      if (printQuery.addEventListener) {
        printQuery.addEventListener("change", syncPrint);
      } else if (printQuery.addListener) {
        printQuery.addListener(syncPrint);
      }
      window.addEventListener("beforeprint", function () {
        reasons.print = true;
        ease = null;
        if (expandedCard) {
          collapse(expandedCard, true);
        }
        track.style.transform = "none";
      });
      window.addEventListener("afterprint", function () {
        reasons.print = false;
        resumeClock();
      });
      syncPrint();
    }

    window.addEventListener("resize", function () {
      if (expandedCard) {
        setOriginAndZoom(expandedCard);
      }
    });

    
    var filterBtns = document.querySelectorAll(".folio-filter-btn");
    var activeFilter = "core";
    function applyFolioFilter(cat) {
      activeFilter = cat || "core";
      if (activeFilter === "core") {
        PERIOD_MS = 90000;
      } else if (activeFilter === "personal") {
        PERIOD_MS = 65000;
      } else {
        PERIOD_MS = 90000;
      }
      var allLis = track.querySelectorAll(".folio-set > li");
      for (var fi = 0; fi < allLis.length; fi += 1) {
        var li = allLis[fi];
        var match = activeFilter === "all" || li.getAttribute("data-category") === activeFilter;
        li.hidden = !match;
      }
      for (var bi = 0; bi < filterBtns.length; bi += 1) {
        var b = filterBtns[bi];
        var isOn = b.getAttribute("data-filter") === activeFilter;
        b.classList.toggle("is-active", isOn);
        b.setAttribute("aria-pressed", isOn ? "true" : "false");
      }
      if (expandedCard) {
        collapse(expandedCard, true);
      }
      offset = 0;
      lastWidth = setWidth();
      apply();
      updateHighlights();
    }
    for (var fbi = 0; fbi < filterBtns.length; fbi += 1) {
      filterBtns[fbi].addEventListener("click", function () {
        applyFolioFilter(this.getAttribute("data-filter"));
      });
    }
    applyFolioFilter("core");

    reasons.hidden = document.hidden;
    viewport.classList.add("is-hot");
    updateHighlights();
    requestAnimationFrame(tick);
  })();
})();
