(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NF = function (n) {
    return Math.abs(Math.round(n)).toLocaleString("en-US");
  };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Tips data ---------- */
  var CATS = { outdoor: "Outdoor", indoor: "Indoor", kids: "Family", workplace: "Workplace" };
  var TIPS = [];
  function T(n, cat, t, m) { TIPS.push({ n: n, cat: cat, t: t, m: m }); }
  T(1, "outdoor", "Use a broom instead of a hose to clean patios, steps and driveways.", "A hose can run for ten minutes and send well over a hundred litres down the drain. A broom uses none.");
  T(2, "outdoor", "Water plants early in the morning or in the evening.", "Cooler air means less water evaporates before it soaks in, so more of it reaches the roots.");
  T(3, "outdoor", "Catch rainwater in a barrel or bucket and use it on the garden.", "Rainwater is free and plants like it. Even one good shower can fill a bucket.");
  T(4, "outdoor", "Wash the car with a bucket and sponge, not a running hose.", "Fill one bucket with soapy water, scrub, then rinse quickly. Keep the hose for the last splash only.");
  T(5, "outdoor", "Spread mulch around plants and trees.", "A layer of dry leaves, straw or bark keeps the soil cool and damp, so you water less often.");
  T(6, "outdoor", "Plant trees and shrubs that suit your local climate.", "Local plants need less watering. Their roots also hold soil and rain.");
  T(7, "outdoor", "Check outdoor taps and hoses for drips.", "A tap that drips once every second can waste more than 10,000 litres in a year.");
  T(8, "outdoor", "Water the soil, not the leaves or the pavement.", "Aim a watering can or a slow drip at the roots. Water on paths is mostly lost.");
  T(9, "indoor", "Turn off the tap while you brush your teeth.", "A running tap uses about 6 litres a minute. Wet, turn off, brush, then rinse — about 12 litres saved each time.");
  T(10, "indoor", "Take shorter showers.", "A 5-minute shower uses about 45 litres, so every minute you cut saves roughly 9 litres.");
  T(11, "indoor", "Fix leaking taps and toilets quickly.", "Add food colouring to the toilet tank. If colour reaches the bowl without flushing, there is a leak.");
  T(12, "indoor", "Run the washing machine and dishwasher only when they are full.", "A half-empty load uses almost as much water as a full one.");
  T(13, "indoor", "Keep a jug of drinking water in the fridge.", "Then nobody has to run the tap until the water turns cold.");
  T(14, "indoor", "Reuse water from cooking and rinsing.", "Let unsalted rinse water cool, then pour it on garden or house plants.");
  T(15, "indoor", "Put a bucket in the shower while the water warms up.", "That cold water can flush a toilet or water plants.");
  T(16, "indoor", "Wash dishes in a basin, not under a running tap.", "One basin for soapy water and one for rinsing uses far less.");
  T(17, "indoor", "Bin tissues and wrappers instead of flushing them.", "Every flush uses litres of water. Save flushes for what only a toilet can do.");
  T(18, "indoor", "Fit tap aerators and choose water-efficient appliances.", "An aerator mixes air into the flow so it feels strong while using less water.");
  T(19, "kids", "Tell a grown-up when you spot a dripping tap.", "You can be a leak hero at home or school.");
  T(20, "kids", "Turn the tap off tightly after you wash your hands.", "Scrub with soap for 20 seconds, then close the tap all the way.");
  T(21, "kids", "Make a sign for a tap at school.", "Write something friendly like “Water is precious. Please close me fully.”");
  T(22, "kids", "Plant a seedling and water it with saved rainwater.", "Trees help hold rain in the soil and refill wells.");
  T(23, "kids", "Fill a reusable bottle instead of buying a new one.", "Making and moving bottles uses water too.");
  T(24, "kids", "Take a 4-minute shower and sing one short song.", "When the song ends, turn off the tap.");
  T(25, "kids", "Count the drips.", "Put a cup under a dripping tap for a day, measure it, then ask for a fix.");
  T(26, "workplace", "Report leaks to facilities the same day.", "Small leaks run all night and weekend when nobody is looking.");
  T(27, "workplace", "Ask how your building is cooled.", "Cooling towers can use a lot of water. Ask whether usage is tracked.");
  T(28, "workplace", "Choose sensor taps and water-efficient fittings in washrooms.", "Sensor taps switch off when hands leave.");
  T(29, "workplace", "Serve jugs of water at meetings, not single-use bottles.", "Jugs and refillable glasses save the water used to make and ship bottles.");
  T(30, "workplace", "Ask your data centre or IT team for a water report.", "Tracking water next to energy is the first step to cutting it.");
  T(31, "workplace", "Switch off equipment you are not using.", "Less electricity means less heat to remove — and power stations use water too.");
  T(32, "workplace", "Water office plants with leftover drinking water.", "Half-finished glasses can go on plants instead of down the sink.");

  var TIP = {};
  TIPS.forEach(function (t) { TIP[t.n] = t; });

  var P = {};
  try {
    JSON.parse(localStorage.getItem("wg-pledges") || "[]").forEach(function (n) {
      if (TIP[n]) P[n] = 1;
    });
  } catch (e) {}
  function savePledges() {
    try { localStorage.setItem("wg-pledges", JSON.stringify(Object.keys(P).map(Number))); } catch (e) {}
  }
  function pledgeCount() { return Object.keys(P).length; }

  /* ---------- Films (YouTube, shown as native film cards) ---------- */
  var VIDEOS = [
    {
      id: "v1",
      title: "Save water, save the Earth",
      blurb: "Tia & Tofu learn why every drop matters for our planet.",
      yt: "ALafNmKrfoM",
      tone: "coral"
    },
    {
      id: "v2",
      title: "Every drop counts",
      blurb: "A short animated film about protecting water every day.",
      yt: "ehGjJrjPIrI",
      tone: "teal"
    }
  ];

  /* ---------- Path / routing ---------- */
  var PATH = null;
  try { PATH = localStorage.getItem("wg-path"); } catch (e) {}

  var KIDS_ROUTES = ["kids-home", "storybook", "games", "leak-patrol", "my-water-day", "videos"];
  var ADULT_ROUTES = ["adults-home"];
  var NAV = {
    kids: [
      { href: "#kids-home", label: "Home" },
      { href: "#storybook", label: "Story" },
      { href: "#games", label: "Games" },
      { href: "#videos", label: "Films" }
    ],
    adults: [
      { href: "#adults-home", label: "Tips" }
    ]
  };

  function hideShells() {
    $("#portal").hidden = true;
    $("#view-why").hidden = true;
    $("#app").hidden = true;
  }

  function showPortal() {
    hideShells();
    $("#portal").hidden = false;
    PATH = null;
    try { localStorage.removeItem("wg-path"); } catch (e) {}
  }

  function showWhy() {
    hideShells();
    $("#view-why").hidden = false;
    PATH = null;
    try { localStorage.removeItem("wg-path"); } catch (e) {}
    buildDrops();
  }

  function enterPath(path, hash) {
    PATH = path;
    try { localStorage.setItem("wg-path", path); } catch (e) {}
    hideShells();
    $("#app").hidden = false;
    renderNav();
    if (hash) location.hash = hash;
    else location.hash = path === "kids" ? "kids-home" : "adults-home";
    route();
  }

  function renderNav() {
    var links = NAV[PATH] || [];
    $("#topNav").innerHTML = links.map(function (l) {
      return '<a href="' + l.href + '">' + esc(l.label) + "</a>";
    }).join("");
    $("#drawerLinks").innerHTML = links.map(function (l) {
      return '<a href="' + l.href + '">' + esc(l.label) + "</a>";
    }).join("") + '<a href="#" id="switchPath">Switch Kids / Adults</a>';
  }

  function route() {
    var h = location.hash.replace("#", "") || "";

    if (h === "why") {
      showWhy();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }

    if (h === "home" || h === "") {
      if (!PATH) {
        showPortal();
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
    }

    if (!PATH) {
      showPortal();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }

    h = h || (PATH === "kids" ? "kids-home" : "adults-home");

    if (PATH === "kids" && ADULT_ROUTES.indexOf(h) >= 0) h = "kids-home";
    if (PATH === "adults" && KIDS_ROUTES.indexOf(h) >= 0) h = "adults-home";
    if (PATH === "kids" && KIDS_ROUTES.indexOf(h) < 0 && h !== "adults-home") h = "kids-home";
    if (PATH === "adults" && h !== "adults-home") h = "adults-home";

    hideShells();
    $("#app").hidden = false;

    $$("main > .view").forEach(function (s) {
      s.hidden = s.id !== "view-" + h;
    });

    $$("#topNav a, #drawerLinks a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === "#" + h) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    if (h === "adults-home") renderTips();
    if (h === "videos") renderVideos();
    if (h === "leak-patrol") lpHud();
    if (h === "my-water-day") calc();
    if (h === "storybook") ensureStorybook();

    closeDrawer();
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    requestAnimationFrame(function () { observeReveals(); });
  }

  $$("[data-enter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      enterPath(btn.dataset.enter, btn.dataset.goto || null);
    });
  });

  /* ---------- Why water matters: 100 drops ---------- */
  function buildDrops() {
    var grid = $("#dropGrid");
    if (!grid || grid.dataset.ready === "1") return;
    var h = '<defs><symbol id="m-drop-s" viewBox="0 0 24 30"><path d="M12 1 C17 9 22 14 22 20 a10 10 0 0 1 -20 0 C2 14 7 9 12 1Z"/></symbol></defs>';
    for (var i = 0; i < 100; i++) {
      var r = Math.floor(i / 10);
      var c = i % 10;
      var cls = i === 99 ? "fresh" : i >= 97 ? "ice" : "";
      h +=
        '<use href="#m-drop-s" class="' + cls + '" x="' + (c * 25 + 0.5) +
        '" y="' + (r * 31) + '" width="24" height="30"/>';
    }
    grid.innerHTML = h;
    grid.dataset.ready = "1";
  }
  buildDrops();

  $("#backPortal").addEventListener("click", function () {
    showPortal();
    history.replaceState(null, "", location.pathname + "#home");
  });

  document.addEventListener("click", function (e) {
    if (e.target.id === "switchPath" || e.target.closest("#switchPath")) {
      e.preventDefault();
      showPortal();
      location.hash = "home";
    }
  });

  window.addEventListener("hashchange", route);

  /* ---------- Drawer ---------- */
  function openDrawer() {
    $("#drawer").hidden = false;
    $("#menuToggle").setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    $("#drawer").hidden = true;
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }
  $("#menuToggle").addEventListener("click", openDrawer);
  $("#menuClose").addEventListener("click", closeDrawer);
  $("#drawer").addEventListener("click", function (e) {
    if (e.target.id === "drawer") closeDrawer();
    if (e.target.closest("a") && e.target.id !== "switchPath") closeDrawer();
  });

  /* ---------- Reveal on scroll ---------- */
  var io;
  function observeReveals() {
    var active = $("main > .view:not([hidden])") || document;
    $$(".reveal", active).forEach(function (el) {
      el.classList.remove("is-pending");
    });
    if (reduce) return;
    $$(".reveal").forEach(function (el) {
      if (el.closest(".view[hidden]")) return;
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        el.classList.remove("is-pending");
        return;
      }
      el.classList.add("is-pending");
      if (!io) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.remove("is-pending");
              io.unobserve(en.target);
            }
          });
        }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
      }
      io.observe(el);
    });
  }

  /* ---------- Tips UI ---------- */
  var curFilter = "all";

  function tipHTML(t) {
    return (
      '<button class="tip k-' + t.cat + (P[t.n] ? " done" : "") + '" type="button" data-tip="' + t.n + '">' +
      '<span class="chip">' + CATS[t.cat] + "</span>" +
      '<span class="num">#' + t.n + "</span>" +
      '<span class="txt">' + esc(t.t) + "</span>" +
      '<span class="arr" aria-hidden="true">→</span></button>'
    );
  }

  function renderTips() {
    var list = TIPS.filter(function (t) {
      return curFilter === "all" || t.cat === curFilter;
    }).slice().sort(function (a, b) { return a.n - b.n; });
    $("#tipsOut").innerHTML = list.map(tipHTML).join("");
    $$("#tipFilters button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.f === curFilter));
    });
    var n = pledgeCount();
    $("#meterBar").style.width = (n / TIPS.length * 100) + "%";
    $("#meterTxt").textContent = n + " of " + TIPS.length + " tips pledged";
  }

  $("#tipFilters").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    curFilter = b.dataset.f;
    renderTips();
  });

  var openN = null;
  var lastFocus = null;

  function openTip(n) {
    var t = TIP[n];
    if (!t) return;
    openN = n;
    lastFocus = document.activeElement;
    $("#mCat").textContent = CATS[t.cat];
    $("#mNum").textContent = "#" + t.n;
    $("#mTitle").textContent = t.t;
    $("#mMore").textContent = t.m;
    setPledgeBtn();
    $("#modal").hidden = false;
    $("#mClose").focus();
  }

  function closeTip() {
    $("#modal").hidden = true;
    openN = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setPledgeBtn() {
    var on = !!P[openN];
    var b = $("#mPledge");
    b.setAttribute("aria-pressed", String(on));
    b.textContent = on ? "Pledged · tap to undo" : "I’ll do this";
  }

  $("#mPledge").addEventListener("click", function () {
    if (P[openN]) delete P[openN];
    else P[openN] = 1;
    savePledges();
    setPledgeBtn();
    renderTips();
  });

  $("#modal").addEventListener("click", function (e) {
    if (e.target.closest("[data-close]") || e.target.id === "mClose") closeTip();
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tip]");
    if (b && !b.closest("#modal")) openTip(+b.dataset.tip);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#modal").hidden) closeTip();
  });

  var totdN = 0;
  function showTotd() {
    var t;
    do { t = TIPS[Math.floor(Math.random() * TIPS.length)]; } while (t.n === totdN);
    totdN = t.n;
    $("#totdTxt").textContent = t.t;
    $("#totdMore").dataset.tip = t.n;
  }
  $("#totdNext").addEventListener("click", showTotd);

  /* ---------- Films ---------- */
  function ytEmbedUrl(id) {
    return (
      "https://www.youtube-nocookie.com/embed/" + id +
      "?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&color=white&controls=1"
    );
  }

  function renderVideos() {
    $("#videoGrid").innerHTML = VIDEOS.map(function (v) {
      var poster = "https://i.ytimg.com/vi/" + v.yt + "/hqdefault.jpg";
      return (
        '<article class="video-card film-card reveal tone-' + esc(v.tone || "teal") + '">' +
        '<div class="video-frame film-frame" data-yt="' + esc(v.yt) + '">' +
        '<button type="button" class="film-cover" aria-label="Play ' + esc(v.title) + '">' +
        '<img class="film-poster" src="' + esc(poster) + '" alt="" loading="lazy">' +
        '<span class="film-veil" aria-hidden="true"></span>' +
        '<span class="film-play" aria-hidden="true"><i></i></span>' +
        '<span class="film-badge">Film</span>' +
        "</button>" +
        '<div class="film-stage" hidden></div>' +
        "</div>" +
        '<div class="video-meta"><h2>' + esc(v.title) + "</h2><p>" + esc(v.blurb) + "</p></div>" +
        "</article>"
      );
    }).join("");

    $$("#videoGrid .film-frame").forEach(function (frame) {
      var cover = frame.querySelector(".film-cover");
      var stage = frame.querySelector(".film-stage");
      cover.addEventListener("click", function () {
        if (frame.classList.contains("is-playing")) return;
        frame.classList.add("is-playing");
        cover.hidden = true;
        stage.hidden = false;
        stage.innerHTML =
          '<iframe src="' + ytEmbedUrl(frame.dataset.yt) + '"' +
          ' title="Water Guardians film" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
          ' allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>';
      });
    });
  }

  /* ---------- Storybook (lazy init) ---------- */
  var storybookApi = null;
  function ensureStorybook() {
    if (storybookApi) return storybookApi;
    try {
      if (typeof window.initWGStorybook === "function") {
        storybookApi = window.initWGStorybook({
          $: $,
          $$: $$,
          esc: esc,
          reduce: reduce,
          clamp: clamp
        });
        storybookApi.initBook();
      }
    } catch (err) {
      console.error("Storybook failed to start:", err);
    }
    return storybookApi;
  }

  /* ---------- Leak Patrol ---------- */
  var LP = { on: false, t: 0, tank: 100, fixed: 0, lost: 0, leaks: {}, timer: null };
  var LP_LEN = 45;

  function lpHud() {
    $("#lpTime").textContent = Math.max(0, Math.ceil(LP_LEN - LP.t));
    var tk = Math.max(0, LP.tank);
    $("#lpTank").style.width = tk + "%";
    $("#lpPct").textContent = Math.round(tk) + "%";
    $("#lpTankBox").classList.toggle("low", tk < 35);
    $("#lpFix").textContent = LP.fixed;
    $("#lpLost").textContent = NF(LP.lost);
  }

  function lpJoint(i) { return $('#lpField .joint[data-i="' + i + '"]'); }

  function lpStart() {
    clearInterval(LP.timer);
    LP.on = true; LP.t = 0; LP.tank = 100; LP.fixed = 0; LP.lost = 0; LP.leaks = {};
    $$("#lpField .joint").forEach(function (b, i) {
      b.className = "joint";
      b.disabled = false;
      b.setAttribute("aria-label", "Pipe joint " + (i + 1));
    });
    $("#lpStart").disabled = true;
    $("#lpStart").textContent = "Patrolling…";
    $("#lpMsg").textContent = "Go! Tap the shaking joints.";
    lpHud();
    LP.timer = setInterval(lpTick, 100);
  }

  function lpTick() {
    LP.t += 0.1;
    var ids = Object.keys(LP.leaks);
    var n = ids.length;
    if (n < 6 && ((LP.t > 0.25 && LP.t < 0.45 && n === 0) || Math.random() < 0.028 + LP.t * 0.0013)) {
      var free = [];
      for (var i = 0; i < 9; i++) if (!LP.leaks[i]) free.push(i);
      if (free.length) {
        var k = free[Math.floor(Math.random() * free.length)];
        LP.leaks[k] = LP.t;
        var b = lpJoint(k);
        b.classList.add("leak");
        b.setAttribute("aria-label", "Pipe joint " + (k + 1) + ", leaking. Tap to fix");
      }
    }
    n = Object.keys(LP.leaks).length;
    LP.tank -= n * 0.07;
    LP.lost += n * 0.18;
    lpHud();
    if (LP.tank <= 0) lpEnd(false);
    else if (LP.t >= LP_LEN) lpEnd(true);
  }

  function lpEnd(win) {
    clearInterval(LP.timer);
    LP.on = false;
    $$("#lpField .joint").forEach(function (b) {
      b.classList.remove("leak");
      b.disabled = true;
    });
    var tk = Math.max(0, Math.round(LP.tank));
    var stars = win ? (tk >= 60 ? 3 : tk >= 30 ? 2 : 1) : 0;
    var s = "";
    for (var i = 0; i < 3; i++) s += i < stars ? "★" : "☆";
    $("#lpMsg").innerHTML = win
      ? '<b>Village saved! <span class="stars">' + s + "</span></b>Tank finished at " + tk + "%. You fixed " + LP.fixed + " leaks."
      : "<b>The tank ran dry.</b>You fixed " + LP.fixed + " leaks. Try again — fix the oldest leak first.";
    $("#lpStart").disabled = false;
    $("#lpStart").textContent = "Play again";
    lpHud();
  }

  function initLeak() {
    var h = '<div class="lp-grid">';
    for (var i = 0; i < 9; i++) {
      h += '<div class="jc"><button class="joint" type="button" data-i="' + i + '" aria-label="Pipe joint ' + (i + 1) + '" disabled></button></div>';
    }
    $("#lpField").innerHTML = h + "</div>";
    $("#lpStart").addEventListener("click", lpStart);
    $("#lpField").addEventListener("click", function (e) {
      var b = e.target.closest(".joint");
      if (!b || !LP.on) return;
      var i = b.dataset.i;
      if (!LP.leaks[i]) return;
      delete LP.leaks[i];
      LP.fixed++;
      b.classList.remove("leak");
      b.classList.add("fixed");
      setTimeout(function () { b.classList.remove("fixed"); }, 350);
      lpHud();
    });
    lpHud();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden && LP.on) {
      clearInterval(LP.timer);
      LP.on = false;
      $("#lpMsg").textContent = "Paused. Press Play again to restart.";
      $("#lpStart").disabled = false;
      $("#lpStart").textContent = "Play again";
      $$("#lpField .joint").forEach(function (b) {
        b.classList.remove("leak");
        b.disabled = true;
      });
    }
  });

  /* ---------- My Water Day (kids) ---------- */
  function calc() {
    var g = function (id) { return +$("#" + id).value; };
    var v = function (n) {
      var el = $('input[name="' + n + '"]:checked');
      return el ? el.value : "off";
    };
    var sh = g("c-shower"), hands = g("c-hands");
    var bottle = g("c-bottle"), play = g("c-play"), brush = g("c-brush");
    var teeth = v("teeth");
    $("#o-shower").textContent = sh + (sh === 1 ? " minute" : " minutes");
    $("#o-hands").textContent = hands + " a day";
    $("#o-bottle").textContent = bottle + " a day";
    $("#o-play").textContent = play + " min a day";
    $("#o-brush").textContent = brush + (brush === 1 ? " time" : " times");
    $("#teethModeField").hidden = brush === 0;

    var brushLitres = 0;
    if (brush > 0) brushLitres = brush * (teeth === "run" ? 12 : 1);

    var items = [
      ["Shower", sh * 9, "#2BA8FF"],
      ["Brushing teeth", brushLitres, "#3CC98A"],
      ["Hand washing", hands * 1, "#1FA8B8"],
      ["Water bottles", bottle * 0.5, "#9DB7CC"],
      ["Plants / outdoor play", play * 8, "#34D6C0"]
    ].filter(function (it) { return it[1] > 0; });

    var tot = items.reduce(function (a, b) { return a + b[1]; }, 0);
    $("#rTotal").textContent = NF(tot);
    $("#rBar").innerHTML = tot
      ? items.map(function (it) {
          return '<i style="width:' + (it[1] / tot * 100) + "%;background:" + it[2] + '"></i>';
        }).join("")
      : "";
    $("#rLeg").innerHTML = items.length
      ? items.map(function (it) {
          return '<li><i style="background:' + it[2] + '"></i><span>' + it[0] + "</span><b>" + NF(it[1]) + " L</b></li>";
        }).join("")
      : "";

    if (!items.length) {
      $("#rBig").textContent = "Everything is at zero. Move a slider to add water use.";
      $("#swapBlock").hidden = true;
      return;
    }

    var top = items.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
    $("#rBig").innerHTML = "Your biggest slice is <b>" + top[0].toLowerCase() + "</b>, about " + NF(top[1]) + " litres a day.";

    var sw = [];
    if (sh > 4) sw.push(["Sing one short song in the shower", (sh - 4) * 9]);
    if (brush > 0 && teeth === "run") sw.push(["Turn the tap off while brushing", brush * 11]);
    if (hands > 6) sw.push(["Turn the tap off while soaping hands", (hands - 6) * 1.5]);
    if (play > 5) sw.push(["Use a watering can, not a hose", (play - 5) * 5]);

    if (!sw.length) {
      $("#swapBlock").hidden = true;
      return;
    }

    $("#swapBlock").hidden = false;
    var save = sw.reduce(function (a, b) { return a + b[1]; }, 0);
    $("#rSwaps").innerHTML = sw.map(function (s) {
      return "<li>" + s[0] + "<span>saves " + NF(s[1]) + " L/day</span></li>";
    }).join("");
    var yr = save * 365;
    $("#rYear").textContent = "That could save about " + NF(yr) + " litres a year — enough to fill roughly " + NF(yr / 150) + " bathtubs.";
  }

  function initCalc() {
    $("#calcForm").addEventListener("input", calc);
    $("#calcForm").addEventListener("change", calc);
    calc();
  }

  /* ---------- Boot ---------- */
  try { initLeak(); } catch (e) { console.error(e); }
  try { initCalc(); } catch (e) { console.error(e); }
  try { showTotd(); } catch (e) { console.error(e); }

  // Boot: honour #why, otherwise open the home portal (ignore stale path storage).
  try { localStorage.removeItem("wg-path"); } catch (e) {}
  PATH = null;
  if (location.hash.replace("#", "") === "why") {
    route();
  } else {
    showPortal();
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
})();
