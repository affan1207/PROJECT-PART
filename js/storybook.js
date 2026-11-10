window.initWGStorybook = function (deps) {
  "use strict";
  var $ = deps.$;
  var $$ = deps.$$;
  var esc = deps.esc;
  var reduce = deps.reduce;
  var clamp = deps.clamp;

  function fmt(t) {
    return esc(t).replace(/\{(.+?)\}/g, '<span class="say">$1</span>');
  }

  /* Shared scene helpers */
  function sk(n, p, a, b) {
    var id = "sk" + p + n;
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="300" height="360" fill="url(#' + id + ')"/>';
  }
  function sun(x, y, r, c) {
    var rays = "";
    for (var i = 0; i < 12; i++) {
      var a = (i * 30 * Math.PI) / 180;
      rays += '<line x1="' + (x + Math.cos(a) * (r + 6)).toFixed(1) + '" y1="' + (y + Math.sin(a) * (r + 6)).toFixed(1) + '" x2="' + (x + Math.cos(a) * (r + 16)).toFixed(1) + '" y2="' + (y + Math.sin(a) * (r + 16)).toFixed(1) + '"/>';
    }
    return '<g class="sun"><g class="rays" stroke="' + c + '" stroke-width="3" stroke-linecap="round" opacity=".7">' + rays + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/></g>';
  }
  function cloud(x, y, s, c, d) {
    return '<g class="cloud" style="animation-delay:' + (d || 0) + 's"><g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')" fill="' + (c || "#fff") + '" opacity=".92"><ellipse cx="0" cy="0" rx="26" ry="10"/><ellipse cx="-14" cy="-7" rx="14" ry="9"/><ellipse cx="8" cy="-10" rx="16" ry="11"/></g></g>';
  }
  function ground(c1, c2) {
    return '<path d="M0 250 Q80 236 160 249 T300 243 V360 H0Z" fill="' + c1 + '"/><path d="M0 306 Q100 292 200 306 T300 300 V360 H0Z" fill="' + c2 + '"/>';
  }
  function hills(c) {
    return '<path d="M0 232 Q50 190 110 222 T230 214 T300 226 V262 H0Z" fill="' + c + '"/>';
  }
  function house(x, y, w, wall, roof) {
    var h = w * 0.62;
    return '<g transform="translate(' + x + " " + y + ')"><rect x="0" y="' + -h + '" width="' + w + '" height="' + h + '" fill="' + wall + '"/><path d="M-5 ' + -h + " L" + w / 2 + " " + (-h - w * 0.38) + " L" + (w + 5) + " " + -h + 'Z" fill="' + roof + '"/><rect x="' + w * 0.4 + '" y="' + -h * 0.62 + '" width="' + w * 0.2 + '" height="' + h * 0.62 + '" rx="2" fill="#6B3A1E"/></g>';
  }
  function tree(x, y, s, c) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')"><rect x="-4" y="-34" width="8" height="34" fill="#6B3F20"/><circle cx="0" cy="-48" r="22" fill="' + c + '"/><circle cx="-16" cy="-38" r="14" fill="' + c + '"/><circle cx="16" cy="-38" r="14" fill="' + c + '"/></g>';
  }
  function well(x, y, s, water) {
    return '<g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')"><ellipse cx="0" cy="0" rx="34" ry="8" fill="#000" opacity=".15"/><rect x="-28" y="-30" width="56" height="30" rx="4" fill="#B98B5E"/><path d="M-28 -22 H28 M-28 -12 H28 M-10 -30 V-22 M10 -22 V-12 M-18 -12 V0" stroke="#8D6538" stroke-width="2"/><ellipse cx="0" cy="-30" rx="28" ry="8" fill="' + (water ? "#2BA8FF" : "#2A1A12") + '"/><path d="M-26 -30 V-62 M26 -30 V-62" stroke="#6B3F20" stroke-width="5"/><path d="M-34 -60 L0 -80 L34 -60Z" fill="#8B5A2B"/><path d="M0 -62 V-40" stroke="#3B2A1A" stroke-width="2"/><path d="M-5 -40 h10 l-2 9 h-6Z" fill="#9AA7B3"/></g>';
  }
  function person(x, y, s, dress, o) {
    o = o || {};
    var skin = o.skin || "#8A5A3C",
      hair = o.hair || "#241610";
    var arms = o.up
      ? "M-10 -49 L-20 -68 M10 -49 L20 -68"
      : o.hold
        ? "M-10 -49 L-15 -33 M10 -49 L19 -42"
        : "M-10 -49 L-15 -32 M10 -49 L15 -32";
    var g = '<g transform="translate(' + x + " " + y + ") scale(" + (s || 1) + ')">';
    g += '<ellipse cx="0" cy="1" rx="13" ry="3" fill="#000" opacity=".16"/>';
    g += '<path d="M-5 -26 V-3 M5 -26 V-3" stroke="' + skin + '" stroke-width="5" stroke-linecap="round"/>';
    g += '<path d="M-9 -27 L-12 -52 Q0 -57 12 -52 L9 -27Z" fill="' + dress + '"/>';
    g += '<path d="' + arms + '" stroke="' + skin + '" stroke-width="4.5" stroke-linecap="round" fill="none"/>';
    g += '<circle cx="0" cy="-62" r="9.5" fill="' + skin + '"/>';
    g += '<path d="M-10 -63 Q-9 -76 0 -75 Q10 -76 10 -63 Q4 -69 -10 -63Z" fill="' + hair + '"/>';
    g += '<circle cx="-3.2" cy="-61.5" r="1" fill="#1E140E"/><circle cx="3.2" cy="-61.5" r="1" fill="#1E140E"/>';
    g += o.worry
      ? '<path d="M-3.5 -56.5 q3.5 -2.5 7 0" stroke="#1E140E" stroke-width="1.2" fill="none"/>'
      : '<path d="M-3.5 -57.5 q3.5 3 7 0" stroke="#1E140E" stroke-width="1.2" fill="none"/>';
    if (o.beard) g += '<path d="M-6.5 -58 Q0 -45 6.5 -58Z" fill="#EEE"/>';
    if (o.stick) g += '<path d="M21 -1 L25 -60" stroke="#6B3F20" stroke-width="3" stroke-linecap="round"/>';
    return g + "</g>";
  }
  function sprout(x, y) {
    return '<g transform="translate(' + x + " " + y + ')"><g class="sway"><path d="M0 0 V-14" stroke="#3E8E41" stroke-width="3"/><path d="M0 -9 q-11 -2 -10 -11 q10 0 10 11 M0 -14 q11 -2 10 -11 q-10 0 -10 11" fill="#5BBA55"/></g></g>';
  }
  function jump(x, delay) {
    return '<g class="jump" style="animation-delay:' + delay + 's">' + x + "</g>";
  }
  function barrel(x, y, full) {
    return (
      '<g transform="translate(' + x + " " + y + ')">' +
      '<ellipse cx="0" cy="28" rx="26" ry="7" fill="#000" opacity=".12"/>' +
      '<rect x="-24" y="-20" width="48" height="48" rx="6" fill="#8B5A2B"/>' +
      '<rect x="-20" y="-14" width="40" height="' + (full ? 34 : 10) + '" fill="#2BA8FF" opacity=".85"/>' +
      '<path d="M-24 -8 H24 M-24 8 H24 M-24 22 H24" stroke="#6B3F20" stroke-width="2"/>' +
      "</g>"
    );
  }
  function building(x, y, w, h, c) {
    return (
      '<g transform="translate(' + x + " " + y + ')">' +
      '<rect x="0" y="' + -h + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>' +
      '<rect x="' + w * 0.2 + '" y="' + -h * 0.7 + '" width="' + w * 0.2 + '" height="' + h * 0.18 + '" fill="#9FD3F5"/>' +
      '<rect x="' + w * 0.6 + '" y="' + -h * 0.7 + '" width="' + w * 0.2 + '" height="' + h * 0.18 + '" fill="#9FD3F5"/>' +
      '<rect x="' + w * 0.2 + '" y="' + -h * 0.4 + '" width="' + w * 0.2 + '" height="' + h * 0.18 + '" fill="#9FD3F5"/>' +
      '<rect x="' + w * 0.6 + '" y="' + -h * 0.4 + '" width="' + w * 0.2 + '" height="' + h * 0.18 + '" fill="#9FD3F5"/>' +
      "</g>"
    );
  }

  function sceneWell(n, p, pages) {
    var K = [
      ["#FFD2A1", "#FFF1D6"],
      ["#F7B97F", "#FCE5C4"],
      ["#9FD3F5", "#E8F5FF"],
      ["#9FD3F5", "#E8F5FF"],
      ["#8FCBF3", "#E8F5FF"],
      ["#7F90A8", "#C5D0DC"],
      ["#7EC8F7", "#E6F6FF"],
      ["#FFB878", "#FFEBC4"]
    ][n - 1];
    var s = sk(n, p, K[0], K[1]),
      i;
    if (n === 1) {
      s +=
        sun(215, 118, 24, "#FFE08A") +
        cloud(70, 64, 1, "#fff", 0) +
        cloud(240, 48, 0.7, "#fff", 3) +
        hills("#E9A867") +
        ground("#C9763F", "#B3642F") +
        house(10, 252, 58, "#D9945E", "#8B5A2B") +
        tree(98, 254, 1, "#4F9D4A") +
        house(212, 250, 62, "#E0A06A", "#7A4E26") +
        well(152, 272, 1.15, true) +
        person(104, 328, 1.35, "#E4572E", { hold: true }) +
        '<path d="M127 270 h15 l-2 15 h-11Z" fill="#9AA7B3"/><path d="M127 270 q7.5 -10 15 0" stroke="#6B7B88" stroke-width="2" fill="none"/>';
    } else if (n === 2) {
      s +=
        sun(62, 96, 20, "#FFD27A") +
        hills("#DB9A64") +
        ground("#C0693A", "#A9572B") +
        '<path d="M24 336 l18 -9 l14 6 M206 344 l20 -10 l12 8 M118 352 l16 -9 l10 5 M250 312 l14 -7 l10 5" stroke="#7A3A18" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        well(150, 306, 1.9, false) +
        person(72, 336, 1.3, "#E4572E", { worry: true }) +
        person(232, 334, 1.15, "#2A9D8F", { worry: true }) +
        person(266, 346, 0.95, "#7B3FA0", { worry: true }) +
        '<text class="qm" x="58" y="236" font-size="30" font-weight="900" fill="#7A3A18">?</text><text class="qm" x="236" y="234" font-size="26" font-weight="900" fill="#7A3A18" style="animation-delay:.5s">?</text>';
    } else if (n === 3) {
      s +=
        sun(240, 90, 18, "#FFF1B0") +
        cloud(60, 60, 1, "#fff", 0) +
        cloud(200, 40, 0.8, "#fff", 2) +
        hills("#CFA170") +
        '<g fill="#7A5A3A"><rect x="196" y="214" width="8" height="12"/><rect x="226" y="212" width="8" height="14"/><rect x="262" y="216" width="8" height="10"/></g>' +
        ground("#C9763F", "#B3642F") +
        '<path d="M44 262 Q52 196 58 150 Q72 138 86 150 Q94 196 104 262Z" fill="#7A5A3A"/><path d="M58 160 L24 128 M86 160 L120 126 M72 148 L72 112" stroke="#7A5A3A" stroke-width="8" stroke-linecap="round"/><g fill="#5BA35A"><ellipse cx="22" cy="118" rx="26" ry="16"/><ellipse cx="72" cy="100" rx="32" ry="18"/><ellipse cx="122" cy="116" rx="26" ry="16"/><ellipse cx="50" cy="112" rx="22" ry="14"/><ellipse cx="96" cy="112" rx="22" ry="14"/></g>' +
        '<path d="M150 346 q12 -10 24 0 t24 0 t24 0" stroke="#7A3A18" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        person(212, 330, 1.35, "#F2F2F2", { beard: true, hair: "#EEE", stick: true, skin: "#6B4430" }) +
        person(140, 338, 1.15, "#E4572E");
    } else if (n === 4) {
      s +=
        sun(252, 76, 18, "#FFF1B0") +
        cloud(70, 56, 1, "#fff", 0) +
        ground("#C9763F", "#B3642F") +
        '<path d="M8 168 L108 122 L208 168Z" fill="#B5522E"/><rect x="18" y="168" width="180" height="96" fill="#F4D7A1"/><rect x="18" y="168" width="180" height="10" fill="#E5BE7E"/><rect x="36" y="188" width="34" height="30" fill="#9FD3F5" stroke="#8B5A2B" stroke-width="3"/><rect x="146" y="188" width="34" height="30" fill="#9FD3F5" stroke="#8B5A2B" stroke-width="3"/><rect x="88" y="206" width="30" height="58" fill="#8B5A2B"/>' +
        '<rect x="124" y="236" width="38" height="9" rx="3" fill="#9AA7B3"/><rect x="150" y="244" width="9" height="12" fill="#9AA7B3"/><circle class="drip" cx="154.5" cy="262" r="3.4" fill="#2BA8FF"/><circle class="drip" cx="154.5" cy="262" r="3.4" fill="#2BA8FF" style="animation-delay:.65s"/><ellipse cx="154" cy="290" rx="22" ry="6" fill="#4C9ADB" opacity=".7"/><ellipse class="rip" cx="154" cy="290" rx="22" ry="6" fill="none" stroke="#fff" stroke-width="1.5"/>' +
        '<g transform="translate(168 266) rotate(8)"><rect width="58" height="34" fill="#E8CB93" stroke="#8B5A2B" stroke-width="2"/><text x="29" y="14" font-size="8" text-anchor="middle" font-weight="900" fill="#5A3A1A">WATER IS</text><text x="29" y="26" font-size="8" text-anchor="middle" font-weight="900" fill="#5A3A1A">PRECIOUS</text></g>' +
        person(244, 340, 1.3, "#E4572E", { hold: true });
    } else if (n === 5) {
      s +=
        sun(238, 80, 20, "#FFE9A0") +
        cloud(60, 60, 1, "#fff", 1) +
        cloud(200, 112, 0.7, "#fff", 4) +
        '<path d="M0 236 Q120 180 300 170 V360 H0Z" fill="#7DB653"/><path d="M0 286 Q140 236 300 226 V360 H0Z" fill="#C9763F"/><path d="M0 318 Q150 280 300 270 V360 H0Z" fill="#B3642F"/>';
      for (i = 0; i < 7; i++) s += sprout(24 + i * 42, 294 - i * 8.4);
      s += person(78, 338, 1.25, "#E4572E") + person(128, 348, 0.8, "#F4B942") + person(214, 332, 1.2, "#2A9D8F", { hold: true });
    } else if (n === 6) {
      s +=
        cloud(56, 58, 1.5, "#56637A", 0) +
        cloud(210, 76, 1.7, "#5E6B7D", 2) +
        cloud(130, 34, 1.2, "#6A778A", 4) +
        hills("#6FA35E") +
        ground("#7A9A45", "#668537") +
        tree(40, 262, 0.9, "#3F8A47") +
        tree(112, 258, 0.8, "#4B9650") +
        tree(248, 254, 0.85, "#3F8A47") +
        '<path d="M14 322 C76 296 134 346 204 308 S258 300 292 286" stroke="#3E8BD0" stroke-width="12" fill="none" stroke-linecap="round"/><path class="flow" d="M14 322 C76 296 134 346 204 308 S258 300 292 286" stroke="#BFE4FF" stroke-width="3" fill="none"/>' +
        well(250, 284, 0.8, true) +
        person(70, 352, 1.2, "#E4572E", { up: true }) +
        '<g class="rain" stroke="#D6ECFF" stroke-width="2" stroke-linecap="round">';
      for (i = 0; i < 22; i++)
        s +=
          '<line x1="' +
          (i * 14 + (i % 3) * 3) +
          '" y1="0" x2="' +
          (i * 14 + (i % 3) * 3 - 4) +
          '" y2="14" style="animation-delay:' +
          ((i % 7) * 0.13).toFixed(2) +
          's"/>';
      s += "</g>";
    } else if (n === 7) {
      s +=
        sun(236, 84, 22, "#FFE08A") +
        cloud(62, 58, 1, "#fff", 0) +
        hills("#8CCB6A") +
        ground("#C9763F", "#B3642F") +
        house(8, 252, 52, "#D9945E", "#8B5A2B") +
        house(240, 250, 52, "#E0A06A", "#7A4E26") +
        well(152, 278, 1.5, true) +
        '<g stroke="#2BA8FF" stroke-width="5" fill="none" stroke-linecap="round"><path class="spurt" d="M152 232 C146 206 136 192 128 178"/><path class="spurt" style="animation-delay:.25s" d="M152 232 C152 204 152 190 152 170"/><path class="spurt" style="animation-delay:.5s" d="M152 232 C158 206 168 192 176 178"/></g>' +
        '<circle cx="126" cy="172" r="4" fill="#2BA8FF"/><circle cx="152" cy="164" r="4" fill="#2BA8FF"/><circle cx="178" cy="172" r="4" fill="#2BA8FF"/>' +
        person(92, 332, 1.25, "#F2F2F2", { beard: true, hair: "#EEE", skin: "#6B4430" }) +
        jump(person(92, 262, 0.72, "#E4572E", { up: true }), 0) +
        jump(person(214, 332, 1.2, "#2A9D8F", { up: true }), 0.2) +
        jump(person(256, 346, 1, "#7B3FA0", { up: true }), 0.45) +
        '<g class="conf">';
      var cc = ["#E0993D", "#3CC98A", "#FF6FA3", "#2BA8FF", "#A98BFF"];
      for (i = 0; i < 16; i++)
        s +=
          '<rect x="' +
          (8 + i * 18) +
          '" y="0" width="6" height="10" fill="' +
          cc[i % 5] +
          '" style="animation-delay:' +
          ((i * 0.37) % 2.6).toFixed(2) +
          's"/>';
      s += "</g>";
    } else {
      s +=
        sun(150, 182, 38, "#FFE0A0") +
        '<path d="M150 28 C168 56 186 76 186 96 a36 36 0 0 1 -72 0 C114 76 132 56 150 28Z" fill="#2BA8FF" opacity=".92"/><path d="M130 88 q4 12 14 16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>' +
        hills("#C97A4A") +
        '<path d="M0 238 Q70 212 150 232 T300 220 V272 H0Z" fill="#5E8F4A"/>' +
        ground("#B8683A", "#9F5629") +
        house(14, 262, 56, "#E9B07A", "#8B5A2B") +
        house(228, 260, 58, "#E0A06A", "#7A4E26") +
        tree(98, 264, 0.95, "#477F3E") +
        tree(204, 264, 0.85, "#3F7A3B") +
        well(150, 276, 0.95, true) +
        '<g transform="translate(78 292)"><rect width="144" height="42" rx="3" fill="#F7E7C6" stroke="#8B5A2B" stroke-width="2"/><text x="72" y="18" font-size="12" font-weight="900" text-anchor="middle" fill="#0A1C3E">EVERY DROP</text><text x="72" y="33" font-size="12" font-weight="900" text-anchor="middle" fill="#0A1C3E">COUNTS</text></g>' +
        jump(person(38, 352, 1.2, "#E4572E", { up: true }), 0) +
        jump(person(264, 354, 1.15, "#2A9D8F", { up: true }), 0.3);
    }
    return '<svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(pages[n - 1].d) + '">' + s + "</svg>";
  }

  function sceneRain(n, p, pages) {
    var K = [
      ["#B8E0F0", "#EAF7FC"],
      ["#F2C78A", "#FFF1D6"],
      ["#9FD3F5", "#E8F5FF"],
      ["#7F90A8", "#D5DEE8"],
      ["#A8D8C8", "#E8F8F2"],
      ["#7F90A8", "#C5D0DC"],
      ["#7EC8F7", "#E6F6FF"],
      ["#FFB878", "#FFEBC4"]
    ][n - 1];
    var s = sk("r" + n, p, K[0], K[1]),
      i;
    if (n === 1) {
      s +=
        sun(240, 70, 22, "#FFE08A") +
        cloud(60, 50, 1, "#fff", 0) +
        building(20, 250, 70, 120, "#6A8FA8") +
        building(110, 250, 80, 150, "#4F7A92") +
        building(210, 250, 70, 110, "#7AA0B5") +
        ground("#6E8B75", "#587560") +
        person(150, 330, 1.3, "#2A9D8F", { hold: true });
    } else if (n === 2) {
      s +=
        sun(60, 80, 28, "#FFB84D") +
        hills("#C9A06A") +
        ground("#B8864E", "#9A6E3C") +
        '<ellipse cx="150" cy="280" rx="50" ry="10" fill="#8B5A2B" opacity=".4"/>' +
        '<g class="sway">' +
        sprout(120, 275) +
        sprout(150, 278) +
        sprout(180, 274) +
        "</g>" +
        person(70, 330, 1.25, "#2A9D8F", { worry: true }) +
        '<text class="qm" x="210" y="210" font-size="32" font-weight="900" fill="#7A3A18">?</text>';
    } else if (n === 3) {
      s +=
        cloud(70, 60, 1.2, "#fff", 0) +
        building(30, 250, 90, 130, "#5E7F95") +
        ground("#6E8B75", "#587560") +
        person(200, 320, 1.2, "#E0993D", { beard: true, hair: "#EEE", skin: "#6B4430" }) +
        person(140, 330, 1.15, "#2A9D8F") +
        barrel(250, 300, false);
    } else if (n === 4) {
      s +=
        cloud(50, 50, 1.4, "#56637A", 0) +
        cloud(180, 40, 1.6, "#5E6B7D", 1) +
        ground("#5F7A68", "#4A6354") +
        house(20, 260, 70, "#D9945E", "#8B5A2B") +
        barrel(200, 290, false) +
        person(120, 330, 1.25, "#2A9D8F", { hold: true }) +
        '<g class="rain" stroke="#D6ECFF" stroke-width="2" stroke-linecap="round">';
      for (i = 0; i < 18; i++)
        s +=
          '<line x1="' +
          (20 + i * 15) +
          '" y1="0" x2="' +
          (16 + i * 15) +
          '" y2="14" style="animation-delay:' +
          ((i % 6) * 0.12).toFixed(2) +
          's"/>';
      s += "</g>";
    } else if (n === 5) {
      s +=
        sun(230, 70, 20, "#FFE08A") +
        cloud(60, 55, 1, "#fff", 0) +
        ground("#6E8B75", "#587560") +
        barrel(150, 270, true) +
        '<circle class="drip" cx="150" cy="210" r="4" fill="#2BA8FF"/>' +
        '<ellipse class="rip" cx="150" cy="248" rx="18" ry="5" fill="none" stroke="#fff" stroke-width="1.5"/>' +
        person(70, 330, 1.2, "#2A9D8F", { up: true }) +
        person(230, 335, 1.1, "#E4572E");
    } else if (n === 6) {
      s +=
        sun(60, 80, 22, "#FFE08A") +
        ground("#7DB653", "#668537") +
        sprout(80, 280) +
        sprout(120, 275) +
        sprout(160, 278) +
        sprout(200, 272) +
        sprout(240, 276) +
        barrel(40, 300, true) +
        person(180, 330, 1.25, "#2A9D8F", { hold: true }) +
        '<path class="flow" d="M55 275 C90 260 110 290 140 270" stroke="#2BA8FF" stroke-width="4" fill="none"/>';
    } else if (n === 7) {
      s +=
        sun(220, 70, 24, "#FFE08A") +
        cloud(50, 55, 1, "#fff", 0) +
        ground("#7DB653", "#5F8F4A") +
        building(10, 250, 60, 100, "#6A8FA8") +
        house(200, 255, 70, "#E0A06A", "#7A4E26") +
        jump(person(120, 320, 1.2, "#2A9D8F", { up: true }), 0) +
        jump(person(180, 330, 1.1, "#E4572E", { up: true }), 0.25) +
        '<g class="conf">';
      var cc = ["#E0993D", "#3CC98A", "#2BA8FF", "#FF6FA3"];
      for (i = 0; i < 12; i++)
        s +=
          '<rect x="' +
          (20 + i * 22) +
          '" y="0" width="6" height="10" fill="' +
          cc[i % 4] +
          '" style="animation-delay:' +
          ((i * 0.3) % 2).toFixed(2) +
          's"/>';
      s += "</g>";
    } else {
      s +=
        sun(150, 90, 30, "#FFE0A0") +
        '<path d="M150 40 C162 58 172 70 172 84 a22 22 0 1 1-44 0 C128 70 138 58 150 40Z" fill="#2BA8FF"/>' +
        ground("#6E8B75", "#587560") +
        barrel(80, 290, true) +
        barrel(220, 290, true) +
        person(150, 330, 1.25, "#2A9D8F", { up: true }) +
        '<g transform="translate(70 250)"><rect width="160" height="36" rx="4" fill="#F7E7C6" stroke="#8B5A2B" stroke-width="2"/><text x="80" y="23" font-size="12" font-weight="900" text-anchor="middle" fill="#0A1C3E">SAVE THE RAIN</text></g>';
    }
    return '<svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(pages[n - 1].d) + '">' + s + "</svg>";
  }

  function sceneLeak(n, p, pages) {
    var K = [
      ["#D6ECFA", "#F2F9FD"],
      ["#F7D7A8", "#FFF4E3"],
      ["#CDE8F5", "#EEF8FC"],
      ["#BFE3D6", "#EAF8F2"],
      ["#9FD3F5", "#E8F5FF"],
      ["#F2C78A", "#FFF1D6"],
      ["#7EC8F7", "#E6F6FF"],
      ["#FFB878", "#FFEBC4"]
    ][n - 1];
    var s = sk("l" + n, p, K[0], K[1]),
      i;
    if (n === 1) {
      s +=
        sun(230, 70, 22, "#FFE08A") +
        cloud(50, 55, 1, "#fff", 0) +
        '<path d="M20 160 L140 110 L260 160Z" fill="#B5522E"/><rect x="30" y="160" width="220" height="110" fill="#F4D7A1"/>' +
        '<rect x="50" y="180" width="40" height="35" fill="#9FD3F5" stroke="#8B5A2B" stroke-width="3"/>' +
        '<rect x="190" y="180" width="40" height="35" fill="#9FD3F5" stroke="#8B5A2B" stroke-width="3"/>' +
        '<rect x="120" y="200" width="40" height="70" fill="#8B5A2B"/>' +
        ground("#C9763F", "#B3642F") +
        person(90, 340, 1.25, "#7B3FA0");
    } else if (n === 2) {
      s +=
        sun(60, 70, 18, "#FFF1B0") +
        ground("#C9763F", "#B3642F") +
        '<rect x="40" y="150" width="200" height="100" fill="#E8D5B5" stroke="#8B5A2B" stroke-width="3"/>' +
        '<rect x="160" y="210" width="40" height="10" rx="3" fill="#9AA7B3"/>' +
        '<rect x="186" y="220" width="10" height="14" fill="#9AA7B3"/>' +
        '<circle class="drip" cx="191" cy="242" r="3.5" fill="#2BA8FF"/>' +
        '<circle class="drip" cx="191" cy="242" r="3.5" fill="#2BA8FF" style="animation-delay:.55s"/>' +
        '<ellipse class="rip" cx="191" cy="280" rx="20" ry="6" fill="none" stroke="#4C9ADB" stroke-width="2"/>' +
        person(70, 340, 1.2, "#7B3FA0", { worry: true });
    } else if (n === 3) {
      s +=
        sun(240, 70, 20, "#FFE08A") +
        cloud(60, 50, 1, "#fff", 0) +
        ground("#C9763F", "#B3642F") +
        house(20, 255, 70, "#D9945E", "#8B5A2B") +
        person(200, 320, 1.25, "#1A6AA0") +
        person(130, 330, 1.15, "#7B3FA0", { hold: true }) +
        '<g transform="translate(210 250)"><rect width="50" height="28" fill="#FFF0CE" stroke="#8B5A2B"/><text x="25" y="18" font-size="8" text-anchor="middle" font-weight="900" fill="#5A3A1A">REPORT</text></g>';
    } else if (n === 4) {
      s +=
        sun(50, 70, 18, "#FFF1B0") +
        ground("#C9763F", "#B3642F") +
        '<rect x="30" y="160" width="180" height="90" fill="#E8D5B5"/>' +
        '<rect x="140" y="210" width="36" height="9" rx="3" fill="#2B9962"/>' +
        person(220, 330, 1.2, "#1A6AA0", { hold: true }) +
        person(90, 335, 1.15, "#7B3FA0", { up: true }) +
        '<text x="150" y="140" text-anchor="middle" font-size="16" font-weight="900" fill="#14664A">FIXED!</text>';
    } else if (n === 5) {
      s +=
        sun(220, 70, 22, "#FFE08A") +
        cloud(70, 55, 1, "#fff", 1) +
        ground("#C9763F", "#B3642F") +
        '<path d="M20 160 L130 115 L240 160Z" fill="#B5522E"/><rect x="30" y="160" width="200" height="95" fill="#F4D7A1"/>' +
        person(80, 330, 1.15, "#7B3FA0") +
        person(130, 335, 1.05, "#2A9D8F") +
        person(180, 330, 1.1, "#E4572E") +
        person(230, 338, 0.95, "#E0993D") +
        '<g transform="translate(90 200)"><rect width="120" height="40" rx="4" fill="#0A1C3E"/><text x="60" y="25" font-size="11" text-anchor="middle" font-weight="900" fill="#7DD3FF">LEAK PATROL</text></g>';
    } else if (n === 6) {
      s +=
        sun(60, 90, 26, "#FFB84D") +
        ground("#C9763F", "#B3642F") +
        '<rect x="40" y="170" width="50" height="12" rx="3" fill="#9AA7B3"/>' +
        '<circle class="drip" cx="80" cy="195" r="3" fill="#2BA8FF"/>' +
        '<rect x="160" y="200" width="50" height="12" rx="3" fill="#9AA7B3"/>' +
        '<circle class="drip" cx="200" cy="225" r="3" fill="#2BA8FF" style="animation-delay:.4s"/>' +
        person(100, 330, 1.15, "#7B3FA0") +
        person(180, 335, 1.1, "#2A9D8F") +
        '<text class="qm" x="250" y="180" font-size="28" font-weight="900" fill="#A8561C">!</text>';
    } else if (n === 7) {
      s +=
        sun(230, 70, 22, "#FFE08A") +
        cloud(50, 50, 1, "#fff", 0) +
        ground("#7DB653", "#668537") +
        jump(person(90, 320, 1.2, "#7B3FA0", { up: true }), 0) +
        jump(person(150, 330, 1.1, "#2A9D8F", { up: true }), 0.2) +
        jump(person(210, 325, 1.15, "#E4572E", { up: true }), 0.4) +
        '<g class="conf">';
      var cc = ["#E0993D", "#3CC98A", "#2BA8FF", "#A98BFF", "#FF6FA3"];
      for (i = 0; i < 14; i++)
        s +=
          '<rect x="' +
          (15 + i * 20) +
          '" y="0" width="6" height="10" fill="' +
          cc[i % 5] +
          '" style="animation-delay:' +
          ((i * 0.28) % 2.2).toFixed(2) +
          's"/>';
      s += "</g>";
    } else {
      s +=
        sun(150, 100, 32, "#FFE0A0") +
        '<path d="M150 36 C164 56 176 70 176 88 a26 26 0 1 1-52 0 C124 70 136 56 150 36Z" fill="#2BA8FF"/>' +
        ground("#C9763F", "#B3642F") +
        person(90, 330, 1.2, "#7B3FA0", { up: true }) +
        person(210, 330, 1.15, "#2A9D8F", { up: true }) +
        '<g transform="translate(65 250)"><rect width="170" height="40" rx="4" fill="#F7E7C6" stroke="#8B5A2B" stroke-width="2"/><text x="85" y="25" font-size="12" font-weight="900" text-anchor="middle" fill="#0A1C3E">SPOT IT · FIX IT</text></g>';
    }
    return '<svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(pages[n - 1].d) + '">' + s + "</svg>";
  }

  var BOOKS = [
    {
      id: "well",
      title: "The Day the Well Went Dry",
      blurb: "Amara’s village loses its well — and one small idea brings the water back.",
      ages: "Ages 6 to 9",
      accent: "#E0993D",
      coverPage: 1,
      pages: [
        { h: "Meet Amara", d: "A bright morning in the village of Keza. Amara carries her bucket past mud-brick houses to the well.", p: ["Every morning, Amara woke up before the sun finished rising.", "She lived in a small, cheerful village called Keza, where the red dirt roads were always warm and the mango trees smelled sweet.", "Her very favourite job, and the most important one, was fetching water from the village well for her family's breakfast."] },
        { h: "The Dry Well", d: "Amara leans over an empty well while worried neighbours gather round.", p: ["But one Tuesday morning, something terrible happened.", "Amara dropped her bucket into the well… and heard nothing. No splash. No echo.", '{"Mama!"} she called. {"The well, it\'s dry!"}', "One by one, the neighbours came and looked in. Their faces went quiet with worry. Without the well, there was no water to drink, to cook, or to wash with."] },
        { h: "Old Baba Knows", d: "Amara and Old Baba stand beneath the great baobab tree, with a bare hillside behind them.", p: ["Amara ran to find Old Baba, the wisest person in Keza.", "He sat beneath the great baobab tree and drew a picture in the red soil with his stick.", '{"Water,"} he said, {"is like a shy animal. It disappears when we are careless with it. The trees used to hold the rain in the ground, but we cut them down."}', "Amara looked at the bare hillside. Then she had an idea."] },
        { h: "The Leaky Tap", d: "A tap outside the school drips into a puddle. Amara has hung a cardboard sign on it.", p: ["On her way to school, Amara noticed the outside tap dripping, drip, drip, drip, all day long.", 'She twisted it shut. {"Every drop matters,"} she whispered.', "Then she made a sign on a piece of cardboard and put it on the tap: {Water is precious. Please close me fully. Amara, Grade 3.}"] },
        { h: "The Planting Day", d: "Children plant seedlings in a line along the hillside above the village.", p: ["The very next Saturday, Amara called all her friends together.", '{"Old Baba says trees bring back water,"} she said. {"So let\'s plant trees!"}', "They dug little holes all along the hillside above the village. One by one, they pushed small seedlings into the warm earth and patted the soil gently around each one.", "Even the youngest children helped. Even Amara's little brother Kofi, who was only four."] },
        { h: "The Rain Returns", d: "Rain falls on the green hillside and a clean stream runs down towards the well.", p: ["Weeks passed. The children watered their seedlings every day using saved rainwater from barrels.", "Then, one evening, big grey clouds rolled in from the mountains and the rain poured down!", "This time, the roots of the young trees held the water in the ground. Clean water seeped slowly down… down… down… into the earth below the village."] },
        { h: "The Well Returns", d: "Water splashes up from the well as the whole village cheers and children jump for joy.", p: ["Three mornings later, Amara lowered her bucket into the well…", "SPLASH!", "The whole village cheered! Old Baba smiled and lifted Amara onto his shoulders.", '{"The water came back,"} he said, {"because one small girl remembered that every drop counts."}', "Amara laughed and held her bucket high."] },
        { h: "The Message", d: "The whole village at sunset, with trees on the hillside and a wall painted Every Drop Counts.", p: ["Water is a gift for everyone: people, animals, plants, and the whole Earth.", "It doesn't matter if you are six years old or sixty. It doesn't matter if you live in a city or a village.", "Every single one of us can be a Water Guardian.", "{What will YOU do to protect water today?}"] }
      ],
      scene: sceneWell,
      tips: ["Shower for 4 minutes or less.", "Turn the tap off while you brush.", "Catch rainwater for the plants."]
    },
    {
      id: "rain",
      title: "Rafi and the Rain Barrel",
      blurb: "A city boy learns to catch the rain and keep his garden green.",
      ages: "Ages 6 to 9",
      accent: "#2A9D8F",
      coverPage: 5,
      pages: [
        { h: "Busy City Morning", d: "Rafi walks between tall buildings with a small watering can.", p: ["Rafi lived in a busy city where buses hummed and windows flashed in the sun.", "Behind his block of flats was a tiny garden with tomatoes, mint and one brave sunflower.", "Every evening he watered the plants — but the tap water felt like a treasure he did not want to waste."] },
        { h: "The Dry Spell", d: "Wilted plants under a hot sun.", p: ["One summer the rain stayed away for weeks.", "The soil cracked. The mint drooped. The sunflower hung its head.", '{"If I use the hose every day,"} Rafi worried, {"there will be less water for everyone."}'] },
        { h: "Auntie\'s Idea", d: "Auntie shows Rafi an empty barrel beside the drainpipe.", p: ["Auntie Meera pointed to the drainpipe on the wall.", '{"Rain is free,"} she said. {"Put a barrel under the pipe. When the clouds come, they will fill it for you."}', "Rafi’s eyes lit up. A rain barrel!"] },
        { h: "Waiting for Clouds", d: "Rain falls into Rafi’s barrel beside the house.", p: ["They washed the barrel, set it under the pipe and waited.", "That night thunder rolled. Rain danced on the roofs and sang into the barrel.", '{"Listen,"} Rafi whispered. {"Our garden’s water is arriving."}'] },
        { h: "A Full Barrel", d: "Rafi celebrates beside a full blue barrel.", p: ["By morning the barrel was almost full.", "Rafi dipped his can and carried cool rainwater to the mint and tomatoes.", "No hose. No waste. Just sky-water for thirsty roots."] },
        { h: "Garden Comes Alive", d: "Green sprouts and a happy sunflower.", p: ["Day by day the garden woke up again.", "The sunflower stood tall. Bees visited the mint.", "Neighbours asked how the plants looked so fresh — and Rafi showed them the barrel."] },
        { h: "Sharing the Idea", d: "Friends cheer with Rafi in the green courtyard.", p: ["Soon two more barrels appeared in other courtyards.", '{"We are Water Guardians of the city,"} Rafi laughed.', "Even between tall buildings, every drop from the sky can help."] },
        { h: "Remember the Rain", d: "Rafi under a painted Save the Rain sign.", p: ["Rain does not always come when we want it.", "But when it does, we can catch it, keep it and use it wisely.", "{Will you save the rain where you live?}"] }
      ],
      scene: sceneRain,
      tips: ["Put a bucket out when it rains.", "Water plants with saved rain, not the hose.", "Share one water tip with a neighbour."]
    },
    {
      id: "leak",
      title: "Noor the Leak Spotter",
      blurb: "Noor starts a school Leak Patrol and proves small drips matter.",
      ages: "Ages 6 to 9",
      accent: "#7B3FA0",
      coverPage: 5,
      pages: [
        { h: "School Bell", d: "Noor arrives at a sunny school building.", p: ["Noor loved school — especially science and the playground tap where everyone filled bottles.", "She noticed something others walked past every day.", "A soft drip… drip… drip… from the corner of the washroom."] },
        { h: "The Secret Puddle", d: "A dripping tap makes a puddle on the floor.", p: ["The puddle grew. Shoes slipped. Water ran toward the drain all morning.", '{"That is not a small drip,"} Noor thought. {"That is a leak on duty."}'] },
        { h: "Tell a Grown-up", d: "Noor reports the leak to a teacher with a note.", p: ["Noor found Mr. Hassan, the caretaker.", '{"There is a leak by the washroom,"} she said. {"It runs even when nobody is there."}', "Mr. Hassan smiled. {\"Thank you for spotting it. Leaks hate being noticed.\"}"] },
        { h: "Fixed Fast", d: "The caretaker fixes the tap while Noor cheers.", p: ["That afternoon the washer was changed and the drip stopped.", "The puddle dried. The floor shone.", "Noor felt taller than the doorway."] },
        { h: "Leak Patrol Club", d: "Kids gather under a Leak Patrol banner.", p: ["Noor asked her friends to join Leak Patrol.", "Their job was simple: walk the school once a week, listen for drips, and tell a grown-up the same day.", "Five children raised their hands."] },
        { h: "More Drips Found", d: "The team finds drips at two outdoor taps.", p: ["They found a hose left trickling by the garden.", "They found a classroom tap not closed all the way.", "Each time they reported it. Each time the water was saved."] },
        { h: "Assembly Cheer", d: "The school cheers for Leak Patrol.", p: ["At assembly the headteacher thanked Leak Patrol.", '{"You protected hundreds of litres,"} she said. {"Guardians do not need capes — they need sharp eyes."}', "Noor’s team cheered so loud the windows hummed."] },
        { h: "Your Turn", d: "Noor invites readers to spot leaks too.", p: ["A leak does not shout. It whispers.", "If you hear a drip at home or school, tell someone who can fix it.", "{Be a Leak Spotter today.}"] }
      ],
      scene: sceneLeak,
      tips: ["Tell a grown-up about any drip you find.", "Close taps tightly after washing hands.", "Check outdoor taps before you leave."]
    }
  ];

  var active = null;
  var bp = 0;
  var bTimer = null;
  var leaves = [];
  var bookBound = false;

  function pageCount() {
    return active ? active.pages.length : 8;
  }
  function lastIndex() {
    return pageCount() + 1; // cover=0, pages=1..N, end=N+1
  }

  function coverHTML() {
    var accent = active.accent || "#E0993D";
    return (
      '<div class="cover"><div class="c-eye">A Water Guardians picture book</div><div class="c-mid">' +
      '<svg class="c-drop" viewBox="0 0 120 150" aria-hidden="true"><path d="M60 8 C80 40 104 66 104 94 a44 44 0 0 1 -88 0 C16 66 40 40 60 8Z" fill="' +
      accent +
      '"/><path d="M22 98 q19 -14 38 0 t38 0" fill="none" stroke="#0A1C3E" stroke-width="5" stroke-linecap="round"/><path d="M26 114 q17 -12 34 0 t34 0" fill="none" stroke="#0A1C3E" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/></svg>' +
      "<h2>" +
      esc(active.title) +
      '</h2></div><div class="c-by">' +
      esc(active.ages) +
      "</div></div>"
    );
  }

  function illHTML(n, p) {
    return '<div class="ill">' + active.scene(n, p, active.pages) + "</div>";
  }

  function txtHTML(n) {
    var st = active.pages[n - 1];
    return (
      '<div class="tp"><div class="pg">Page ' +
      n +
      " of " +
      pageCount() +
      "</div><h3>" +
      esc(st.h) +
      "</h3>" +
      st.p.map(function (t) {
        return "<p>" + fmt(t) + "</p>";
      }).join("") +
      "</div>"
    );
  }

  function endHTML() {
    var tips = (active.tips || []).map(function (t) {
      return "<li>" + esc(t) + "</li>";
    }).join("");
    return (
      '<div class="endp"><div class="pg">The end</div><h3>What will YOU do today?</h3>' +
      "<p>Every one of us can be a Water Guardian. Try one of these this week.</p>" +
      '<ul class="mini">' +
      tips +
      '</ul><button class="btn solid" type="button" data-back-library>Pick another story</button></div>'
    );
  }

  function setBook(p) {
    var end = lastIndex();
    var prev = bp;
    bp = clamp(p, 0, end);
    leaves.forEach(function (lf, i) {
      var fl = i < bp,
        was = lf.classList.contains("flipped");
      if (fl !== was) {
        lf.style.zIndex = 100;
        setTimeout(function () {
          lf.style.zIndex = lf.classList.contains("flipped") ? i + 1 : 20 - i;
        }, reduce ? 0 : 1000);
      } else if (!lf.style.zIndex) lf.style.zIndex = fl ? i + 1 : 20 - i;
      lf.classList.toggle("flipped", fl);
    });
    $("#bookWrap").dataset.pos = bp === 0 ? "closed" : "open";
    var m = bp === 0 ? coverHTML() : bp === end ? endHTML() : illHTML(bp, "m") + txtHTML(bp);
    $("#bookM").innerHTML = '<div class="bm-card' + (bp > prev ? " turn-f" : bp < prev ? " turn-b" : "") + '">' + m + "</div>";
    $("#bPos").textContent = bp === 0 ? "Cover" : bp === end ? "The end" : "Page " + bp + " of " + pageCount();
    $("#bPrev").disabled = bp === 0;
    $("#bNext").disabled = bp === end;
    $("#bNext").innerHTML = bp === 0 ? "Open the book &rarr;" : bp === pageCount() ? "Finish &rarr;" : "Next page &rarr;";
    $$("#bDots .dot").forEach(function (d, i) {
      d.classList.toggle("on", i === bp);
      if (i === bp) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function goTo(t) {
    var end = lastIndex();
    t = clamp(t, 0, end);
    clearInterval(bTimer);
    if (t === bp) return;
    if (reduce || Math.abs(t - bp) === 1) {
      setBook(t);
      return;
    }
    var step = function () {
      if (bp === t) {
        clearInterval(bTimer);
        return;
      }
      setBook(bp + (t > bp ? 1 : -1));
    };
    step();
    bTimer = setInterval(step, 200);
  }

  function buildLeaves() {
    var bk = $("#book");
    var n = pageCount();
    var h = "";
    for (var i = 0; i <= n; i++) {
      h +=
        '<div class="leaf" data-i="' +
        i +
        '"><div class="face front">' +
        (i === 0 ? coverHTML() : txtHTML(i)) +
        '</div><div class="face back">' +
        (i < n ? illHTML(i + 1, "d") : endHTML()) +
        "</div></div>";
    }
    bk.innerHTML = '<div class="backcover" aria-hidden="true"></div>' + h;
    leaves = $$(".leaf", bk);
    var dots = "";
    for (var d = 0; d <= n + 1; d++) {
      dots +=
        '<button class="dot" type="button" data-p="' +
        d +
        '" aria-label="' +
        (d === 0 ? "Cover" : d === n + 1 ? "The end" : "Page " + d) +
        '"></button>';
    }
    $("#bDots").innerHTML = dots;
  }

  function showLibrary() {
    active = null;
    $("#storyPicker").hidden = false;
    $("#storyReader").hidden = true;
    $("#storyTitle").textContent = "Storybooks";
    $("#storyMeta").textContent = "Pick a picture book to read. Each one has animated pages you can turn.";
    renderPicker();
  }

  function openStory(id) {
    active = BOOKS.filter(function (b) {
      return b.id === id;
    })[0];
    if (!active) return;
    $("#storyPicker").hidden = true;
    $("#storyReader").hidden = false;
    $("#storyTitle").textContent = active.title;
    $("#storyMeta").textContent = active.blurb + " Turn pages with the buttons, arrow keys, a swipe, or a tap.";
    buildLeaves();
    setBook(0);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function renderPicker() {
    $("#storyPicker").innerHTML = BOOKS.map(function (b) {
      var coverN = b.coverPage || 1;
      var art = "";
      try {
        art = b.scene(coverN, "cover", b.pages);
      } catch (err) {
        art = "";
      }
      return (
        '<button type="button" class="story-pick" data-story="' +
        esc(b.id) +
        '" style="--story-accent:' +
        b.accent +
        '">' +
        '<span class="story-pick-art" aria-hidden="true">' +
        art +
        "</span>" +
        '<span class="story-pick-body"><span class="story-pick-ages">' +
        esc(b.ages) +
        "</span><strong>" +
        esc(b.title) +
        "</strong><span>" +
        esc(b.blurb) +
        '</span></span><span class="story-pick-go" aria-hidden="true">→</span></button>'
      );
    }).join("");
  }

  function bindOnce() {
    if (bookBound) return;
    bookBound = true;
    $("#bNext").addEventListener("click", function () {
      goTo(bp + 1);
    });
    $("#bPrev").addEventListener("click", function () {
      goTo(bp - 1);
    });
    $("#bDots").addEventListener("click", function (e) {
      var b = e.target.closest(".dot");
      if (b) goTo(+b.dataset.p);
    });
    ["#book", "#bookM"].forEach(function (sel) {
      var el = $(sel);
      el.addEventListener("click", function (e) {
        if (e.target.closest("a,button")) return;
        if (!active) return;
        var r = el.getBoundingClientRect();
        goTo(e.clientX - r.left > r.width / 2 ? bp + 1 : bp - 1);
      });
    });
    var tx = null,
      st = $("#stage");
    st.addEventListener(
      "touchstart",
      function (e) {
        tx = e.touches[0].clientX;
      },
      { passive: true }
    );
    st.addEventListener(
      "touchend",
      function (e) {
        if (tx === null || !active) return;
        var dx = e.changedTouches[0].clientX - tx;
        tx = null;
        if (Math.abs(dx) > 50) goTo(bp + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );
    document.addEventListener("keydown", function (e) {
      if ($("#view-storybook").hidden || !$("#modal").hidden || !active) return;
      if (/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || "")) return;
      if (e.key === "ArrowRight") goTo(bp + 1);
      else if (e.key === "ArrowLeft") goTo(bp - 1);
    });
    $("#storyPicker").addEventListener("click", function (e) {
      var b = e.target.closest("[data-story]");
      if (b) openStory(b.dataset.story);
    });
    $("#storyChange").addEventListener("click", showLibrary);
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-back-library]")) showLibrary();
    });
  }

  function initBook() {
    bindOnce();
    showLibrary();
  }

  return { initBook: initBook, openStory: openStory, showLibrary: showLibrary };
};
