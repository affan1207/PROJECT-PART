/*
 * FlipCard — plain JavaScript version of the FlipCard component.
 * Spring-driven 3D flip with tilt, glare, hover scale and drag-to-flip.
 *
 *   var card = FlipCard(document.getElementById("slot"), {
 *     front: "<img src='/landscape.jpg' alt=''>",   // HTML string or DOM node
 *     back: "<h3>Wooded Landscape</h3>",
 *     axis: "y", flipOnClick: true, draggable: true, dragDistance: 0,
 *     tilt: true, tiltMax: 12, glare: true, glareOpacity: 0.22,
 *     hoverScale: 1.03, perspective: 1100, stiffness: 170, damping: 20,
 *     width: 300, height: 400, radius: 22,
 *     background: "#27272a", color: "#f5f5f5",
 *     shadow: true, shadowColor: "#000000", shadowOpacity: 0.45,
 *     onFlipChange: function (flipped) { console.log(flipped); }
 *   });
 *   card.flip(); card.setFlipped(true); card.destroy();
 */
(function () {
  "use strict";

  function hexToRgb(hex) {
    var h = String(hex || "#000").replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    if (isNaN(n)) return "0,0,0";
    return ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255);
  }

  function put(el, content) {
    if (content == null) return;
    if (typeof content === "string") el.innerHTML = content;
    else el.appendChild(content);
  }

  function FlipCard(host, opts) {
    if (!host) return null;
    var o = Object.assign(
      {
        front: "", back: "", axis: "y", flipOnClick: true, draggable: true, dragDistance: 0,
        tilt: true, tiltMax: 12, glare: true, glareOpacity: 0.22, hoverScale: 1.03,
        perspective: 1100, stiffness: 170, damping: 20, width: 300, height: 400, radius: 22,
        background: "#27272a", color: "#f5f5f5", shadow: true, shadowColor: "#000000",
        shadowOpacity: 0.45, onFlipChange: null, label: "Flip card"
      },
      opts || {}
    );
    var axisY = o.axis !== "x";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var root = document.createElement("div");
    root.className = "fc";
    root.tabIndex = 0;
    root.setAttribute("role", "button");
    root.setAttribute("aria-pressed", "false");
    root.setAttribute("aria-label", o.label);
    root.style.perspective = o.perspective + "px";
    root.style.width = typeof o.width === "number" ? o.width + "px" : o.width;
    root.style.maxWidth = "100%";
    if (typeof o.width === "number" && typeof o.height === "number") {
      root.style.aspectRatio = o.width + " / " + o.height;
    } else if (o.height) {
      root.style.height = typeof o.height === "number" ? o.height + "px" : o.height;
    }
    root.style.touchAction = o.draggable ? (axisY ? "pan-y" : "pan-x") : "auto";
    root.style.setProperty("--fc-radius", o.radius + "px");
    root.style.setProperty("--fc-bg", o.background);
    root.style.setProperty("--fc-color", o.color);
    root.style.setProperty(
      "--fc-shadow",
      o.shadow ? "0 22px 44px -12px rgba(" + hexToRgb(o.shadowColor) + "," + o.shadowOpacity + ")" : "none"
    );
    root.style.setProperty("--fc-glare", String(o.glareOpacity));

    var tiltEl = document.createElement("div");
    tiltEl.className = "fc-tilt";
    var flipEl = document.createElement("div");
    flipEl.className = "fc-flip";
    var front = document.createElement("div");
    front.className = "fc-face fc-front";
    var back = document.createElement("div");
    back.className = "fc-face fc-back";
    put(front, o.front);
    put(back, o.back);
    var glareF = null;
    var glareB = null;
    if (o.glare) {
      glareF = document.createElement("span");
      glareF.className = "fc-glare";
      glareF.setAttribute("aria-hidden", "true");
      glareB = glareF.cloneNode(true);
      front.appendChild(glareF);
      back.appendChild(glareB);
    }
    flipEl.appendChild(front);
    flipEl.appendChild(back);
    tiltEl.appendChild(flipEl);
    root.appendChild(tiltEl);
    host.appendChild(root);

    /* ---- spring state ---- */
    function S(v) { return { x: v, v: 0, t: v }; }
    var flipS = S(0);
    var rx = S(0);
    var ry = S(0);
    var sc = S(1);
    var all = [flipS, rx, ry, sc];
    var flipped = false;
    var raf = 0;
    var lastT = 0;
    var dragging = false;
    var startPos = 0;
    var startAngle = 0;
    var downX = 0;
    var downY = 0;
    var moved = 0;

    function isFlipped(angle) {
      return Math.round(angle / 180) % 2 !== 0;
    }

    function setBackFocus() {
      var f = back.querySelectorAll("a,button,[tabindex]");
      var fr = front.querySelectorAll("a,button,[tabindex]");
      Array.prototype.forEach.call(f, function (n) { n.tabIndex = flipped ? 0 : -1; });
      Array.prototype.forEach.call(fr, function (n) { n.tabIndex = flipped ? -1 : 0; });
      back.setAttribute("aria-hidden", flipped ? "false" : "true");
      front.setAttribute("aria-hidden", flipped ? "true" : "false");
    }

    function commitFlipState() {
      var now = isFlipped(flipS.t);
      if (now === flipped) return;
      flipped = now;
      root.setAttribute("aria-pressed", flipped ? "true" : "false");
      root.classList.toggle("is-flipped", flipped);
      setBackFocus();
      if (typeof o.onFlipChange === "function") o.onFlipChange(flipped);
    }

    function paint() {
      var fa = axisY ? "rotateY(" + flipS.x + "deg)" : "rotateX(" + flipS.x + "deg)";
      flipEl.style.transform = fa;
      tiltEl.style.transform =
        "scale(" + sc.x + ") rotateX(" + rx.x + "deg) rotateY(" + ry.x + "deg)";
    }

    function step(now) {
      raf = 0;
      var dt = lastT ? Math.min((now - lastT) / 1000, 1 / 20) : 1 / 60;
      lastT = now;
      var k = o.stiffness;
      var c = o.damping;
      var sub = 4;
      var h = dt / sub;
      var busy = dragging;
      for (var n = 0; n < sub; n++) {
        for (var i = 0; i < all.length; i++) {
          var s = all[i];
          if (dragging && s === flipS) continue;
          var a = -k * (s.x - s.t) - c * s.v;
          s.v += a * h;
          s.x += s.v * h;
        }
      }
      for (var j = 0; j < all.length; j++) {
        var q = all[j];
        if (dragging && q === flipS) continue;
        if (Math.abs(q.x - q.t) > 0.01 || Math.abs(q.v) > 0.01) busy = true;
        else { q.x = q.t; q.v = 0; }
      }
      paint();
      if (busy) raf = requestAnimationFrame(step);
      else {
        lastT = 0;
        // keep the angle bounded
        var turns = Math.floor(flipS.x / 360);
        if (turns) { flipS.x -= turns * 360; flipS.t -= turns * 360; paint(); }
      }
    }

    function wake() {
      if (reduce) {
        all.forEach(function (s) { s.x = s.t; s.v = 0; });
        paint();
        return;
      }
      if (!raf) { lastT = 0; raf = requestAnimationFrame(step); }
    }

    function setFlipTarget(angle) {
      flipS.t = angle;
      commitFlipState();
      wake();
    }

    function flip() { setFlipTarget(isFlipped(flipS.t) ? Math.round(flipS.t / 360) * 360 : Math.round(flipS.t / 360) * 360 + 180); }
    function setFlipped(v) {
      var base = Math.round(flipS.t / 360) * 360;
      setFlipTarget(v ? base + 180 : base);
    }

    /* ---- pointer handling ---- */
    function setGlare(px, py) {
      if (!o.glare) return;
      glareF.style.setProperty("--gx", px + "%");
      glareF.style.setProperty("--gy", py + "%");
      glareB.style.setProperty("--gx", 100 - px + "%");
      glareB.style.setProperty("--gy", py + "%");
      glareF.style.opacity = glareB.style.opacity = "1";
    }

    function onEnter() {
      sc.t = o.hoverScale;
      wake();
    }
    function onLeave() {
      if (dragging) return;
      sc.t = 1;
      rx.t = 0;
      ry.t = 0;
      if (o.glare) glareF.style.opacity = glareB.style.opacity = "0";
      wake();
    }
    function onMove(e) {
      var r = root.getBoundingClientRect();
      var nx = (e.clientX - r.left) / Math.max(1, r.width);
      var ny = (e.clientY - r.top) / Math.max(1, r.height);
      if (e.pointerType !== "touch") {
        if (o.tilt && !reduce) {
          ry.t = (nx - 0.5) * 2 * o.tiltMax;
          rx.t = -(ny - 0.5) * 2 * o.tiltMax;
        }
        setGlare(nx * 100, ny * 100);
        wake();
      }
      if (!o.draggable || !downState) return;
      var pos = axisY ? e.clientX : e.clientY;
      var dx = e.clientX - downX;
      var dy = e.clientY - downY;
      moved = Math.max(moved, Math.hypot(dx, dy));
      if (!dragging && Math.abs(axisY ? dx : dy) > 6 && Math.abs(axisY ? dx : dy) >= Math.abs(axisY ? dy : dx)) {
        dragging = true;
        try { root.setPointerCapture(e.pointerId); } catch (err) {}
        root.classList.add("is-dragging");
      }
      if (dragging) {
        var delta = pos - startPos;
        flipS.x = startAngle + (axisY ? delta : -delta) * 0.6;
        flipS.v = 0;
        flipS.t = flipS.x;
        paint();
      }
    }
    var downState = false;
    function onDown(e) {
      if (e.button != null && e.button !== 0) return;
      downState = true;
      moved = 0;
      downX = e.clientX;
      downY = e.clientY;
      startPos = axisY ? e.clientX : e.clientY;
      startAngle = flipS.x;
    }
    function onUp(e) {
      if (!downState) return;
      downState = false;
      if (dragging) {
        dragging = false;
        root.classList.remove("is-dragging");
        try { root.releasePointerCapture(e.pointerId); } catch (err) {}
        var travelled = Math.abs((axisY ? e.clientX : e.clientY) - startPos);
        var base = Math.round(startAngle / 180) * 180;
        var target = Math.round(flipS.x / 180) * 180;
        if (travelled < o.dragDistance) target = base;
        flipS.t = target;
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        commitFlipState();
        wake();
      }
    }
    var suppressClick = false;
    function onClick(e) {
      if (suppressClick || moved > 6) return;
      if (e.target.closest && e.target.closest("a, button, [data-no-flip]") && e.target.closest("a, button, [data-no-flip]") !== root) return;
      if (o.flipOnClick) flip();
    }
    function onKey(e) {
      if (e.target !== root) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (o.flipOnClick) flip();
      }
    }

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    setBackFocus();
    paint();

    return {
      el: root,
      flip: flip,
      setFlipped: setFlipped,
      isFlipped: function () { return flipped; },
      destroy: function () {
        if (raf) cancelAnimationFrame(raf);
        root.remove();
      }
    };
  }

  window.FlipCard = FlipCard;
})();
