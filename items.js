"use strict";
// Shop items: 10 tiers each of Rod / Line / Bait / Bucket, each with its own drawing.
// Loaded before game.js; uses INK, star, drawFish and FISH from game.js at call time.

const ol = (c, w) => { c.lineWidth = w; c.strokeStyle = INK; c.lineJoin = "round"; c.lineCap = "round"; };

const RODS = [
  { name: "Twig Rod",       col: "#a0703a", col2: "#7a4a1d", grip: "#5a3a1a", reel: "#c9c9d6", feature: "none" },
  { name: "Bamboo Rod",     col: "#9bd45a", col2: "#5d9a2e", grip: "#7a4a1d", reel: "#ffd23f", feature: "joints" },
  { name: "Fiberglass Rod", col: "#4aa8ff", col2: "#1f6fc4", grip: "#2b3a55", reel: "#ff5a5f", feature: "ring" },
  { name: "Carbon Rod",     col: "#333a4a", col2: "#ff5a5f", grip: "#111",    reel: "#ff5a5f", feature: "stripes" },
  { name: "Silver Rod",     col: "#dfe6ee", col2: "#9aa7b8", grip: "#4a5568", reel: "#4aa8ff", feature: "ring" },
  { name: "Emerald Rod",    col: "#2fcf7a", col2: "#1e9e5a", grip: "#0f5a35", reel: "#ffd23f", feature: "gem", gem: "#8dffb8" },
  { name: "Ruby Rod",       col: "#c81e4a", col2: "#7a0f2c", grip: "#3a0a18", reel: "#ffd23f", feature: "gem", gem: "#ff8fa8" },
  { name: "Golden Rod",     col: "#ffd23f", col2: "#c98a00", grip: "#8a5a00", reel: "#ff5a5f", feature: "gold" },
  { name: "Crystal Rod",    col: "#9be8ff", col2: "#4ab8e8", grip: "#3a6a8a", reel: "#ffffff", feature: "crystal" },
  { name: "Rainbow Rod",    col: "#ffffff", col2: "#ffffff", grip: "#5b2a8a", reel: "#ffd23f", feature: "rainbow" },
];
const LINES = [
  { name: "Thread",      col: "#ffffff" }, { name: "Nylon",      col: "#8be28b" },
  { name: "Braided",     col: "#ffa64d" }, { name: "Steel Cable", col: "#aab6c6" },
  { name: "Silk Line",   col: "#ff8fc6" }, { name: "Cobalt Line", col: "#4d7cff" },
  { name: "Gold Thread", col: "#ffd23f" }, { name: "Neon Line",   col: "#b6ff3f" },
  { name: "Plasma Line", col: "#b45cff" }, { name: "Rainbow Line", col: "#ffffff" },
];
const BAITS = [
  { name: "Bread Crumb" }, { name: "Worm" }, { name: "Corn" }, { name: "Cricket" }, { name: "Shrimp" },
  { name: "Minnow Bait" }, { name: "Squid" }, { name: "Glow Lure" }, { name: "Golden Lure" }, { name: "Diamond Lure" },
];
const BUCKETS = [
  { name: "Tin Bucket" }, { name: "Red Bucket" }, { name: "Wood Barrel" }, { name: "Big Cooler" }, { name: "Steel Drum" },
  { name: "Fish Tank" }, { name: "Treasure Chest" }, { name: "Golden Bucket" }, { name: "Crystal Tank" }, { name: "Diamond Vault" },
];

const COSTS = [0, 60, 150, 320, 650, 1200, 2200, 4000, 7000, 12000];
const COST_MULT = { rod: 1, line: 1.1, bait: 0.8, bucket: 1 };
const itemCost = (cat, t) => Math.round(COSTS[t - 1] * COST_MULT[cat] / 10) * 10;

const CATS = {
  rod:    { label: "Rods",    items: RODS,    stat: t => `Reels ${(t - 1) * 20}% faster. Fish sell for +${(t - 1) * 15}%` },
  line:   { label: "Lines",   items: LINES,   stat: t => `Hooks fish up to size ${t + 1}. Casts ${20 + t * 12}m out and dives ${4 + t * 4}m deep. Lasts about ${Math.round(8 + t * 5 + t * t * 0.6)} reels` },
  bait:   { label: "Baits",   items: BAITS,   stat: t => `Bites ${(t - 1) * 25}% sooner. Rare fish odds +${(t - 1) * 30}%` },
  bucket: { label: "Buckets", items: BUCKETS, stat: t => `Holds fish up to size ${t + 1}. Bigger ones die on the dock` },
};

// ---------- Rod ----------
function drawRod(c, x0, y0, x1, y1, t) {
  const R = RODS[t - 1], tw = 6 + t * 0.35;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const at = u => [x0 + dx * u, y0 + dy * u];
  const seg = (a, b) => { c.beginPath(); c.moveTo(x0 + dx * a, y0 + dy * a); c.lineTo(x0 + dx * b, y0 + dy * b); };
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.strokeStyle = INK; c.lineWidth = tw + 4; seg(0, 1); c.stroke();
  let fill = R.col;
  if (R.feature === "rainbow") {
    fill = c.createLinearGradient(x0, y0, x1, y1);
    ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"].forEach((col, i, a) => fill.addColorStop(i / (a.length - 1), col));
  }
  c.strokeStyle = fill; c.lineWidth = tw; seg(0, 1); c.stroke();
  // grip
  c.strokeStyle = INK; c.lineWidth = tw + 5; seg(0, 0.24); c.stroke();
  c.strokeStyle = R.grip; c.lineWidth = tw + 1; seg(0, 0.24); c.stroke();

  const ring = u => { const [px, py] = at(u); c.fillStyle = R.feature === "gold" ? "#fff3a0" : "#fff"; ol(c, 2); c.beginPath(); c.arc(px + nx * tw * 0.9, py + ny * tw * 0.9, 3.2, 0, 7); c.fill(); c.stroke(); };
  switch (R.feature) {
    case "joints": for (const u of [0.4, 0.6, 0.8]) { const [px, py] = at(u); c.strokeStyle = R.col2; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px + nx * tw / 2, py + ny * tw / 2); c.lineTo(px - nx * tw / 2, py - ny * tw / 2); c.stroke(); } break;
    case "stripes": c.setLineDash([5, 9]); c.strokeStyle = R.col2; c.lineWidth = tw * 0.6; seg(0.28, 1); c.stroke(); c.setLineDash([]); [0.55, 0.8].forEach(ring); break;
    case "ring": [0.45, 0.7, 0.92].forEach(ring); break;
    case "gem": { [0.5, 0.72].forEach(ring); const [px, py] = at(0.93); ol(c, 2.5); c.fillStyle = R.gem; c.beginPath(); c.arc(px, py, 5.5, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(px - 1.5, py - 1.5, 1.6, 0, 7); c.fill(); break; }
    case "gold": c.strokeStyle = "#fff3a0"; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + dx * 0.26 - nx * tw * 0.2, y0 + dy * 0.26 - ny * tw * 0.2); c.lineTo(x1 - nx * tw * 0.2, y1 - ny * tw * 0.2); c.stroke(); [0.5, 0.7, 0.9].forEach(ring); break;
    case "crystal": for (const u of [0.5, 0.7, 0.9]) { const [px, py] = at(u); c.fillStyle = "#e8fbff"; ol(c, 2); c.beginPath(); c.moveTo(px + nx * (tw + 7), py + ny * (tw + 7)); c.lineTo(px + dx / L * 4 + nx * tw * 0.6, py + dy / L * 4 + ny * tw * 0.6); c.lineTo(px - dx / L * 4 + nx * tw * 0.6, py - dy / L * 4 + ny * tw * 0.6); c.closePath(); c.fill(); c.stroke(); } break;
    case "rainbow": { const tw2 = Date.now() / 250; c.fillStyle = "#fff8b0"; ol(c, 1.8); [[0, -10], [-9, 4]].forEach(([ox, oy], i) => { star(c, x1 + ox, y1 + oy, 5 + 2.5 * Math.sin(tw2 + i * 2)); c.fill(); c.stroke(); }); [0.5, 0.75].forEach(ring); break; }
  }
  c.restore();
}

// ---------- Line ----------
function strokeLine(c, t, x0, y0, cx, cy, x1, y1, thin = 1) {
  const w = (1.6 + t * 0.25) * thin, N = 18, pts = [];
  for (let i = 0; i <= N; i++) { const u = i / N, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; pts.push([a * x0 + b * cx + d * x1, a * y0 + b * cy + d * y1]); }
  const path = () => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); };
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.strokeStyle = "rgba(20,20,40,.55)"; c.lineWidth = w + 2; path(); c.stroke();
  if (t >= 8) { c.shadowColor = LINES[t - 1].col; c.shadowBlur = 8; }
  if (t === 10) {
    c.lineWidth = w;
    for (let i = 0; i < N; i++) { c.strokeStyle = `hsl(${(i * 22 + Date.now() / 8) % 360},90%,60%)`; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); }
  } else { c.strokeStyle = LINES[t - 1].col; c.lineWidth = w; path(); c.stroke(); }
  c.restore();
}

function drawBobber(c, t, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 3);
  const circ = (r, col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); };
  switch (t) {
    case 1: circ(9, "#fff"); c.fillStyle = "#ff5a5f"; c.beginPath(); c.arc(0, 0, 9, Math.PI, 0); c.fill(); c.beginPath(); c.arc(0, 0, 9, 0, 7); c.stroke(); break;
    case 2: circ(9, "#ffd23f"); c.save(); c.clip(); c.fillStyle = "#222"; c.fillRect(-10, -3, 20, 6); c.restore(); c.beginPath(); c.arc(0, 0, 9, 0, 7); c.stroke(); break;
    case 3: c.fillStyle = "#fff"; c.beginPath(); c.ellipse(0, 0, 7, 11, 0, 0, 7); c.fill(); c.save(); c.clip(); c.fillStyle = "#4fd66b"; c.fillRect(-9, -12, 18, 12); c.restore(); c.beginPath(); c.ellipse(0, 0, 7, 11, 0, 0, 7); c.stroke(); break;
    case 4: c.fillStyle = "#b8c4d4"; c.beginPath(); c.moveTo(0, -12); c.lineTo(9, 0); c.lineTo(0, 12); c.lineTo(-9, 0); c.closePath(); c.fill(); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.stroke(); break;
    case 5: c.fillStyle = "#ff6fae"; c.beginPath(); c.moveTo(0, 9); c.bezierCurveTo(-15, -2, -8, -14, 0, -6); c.bezierCurveTo(8, -14, 15, -2, 0, 9); c.closePath(); c.fill(); c.stroke(); break;
    case 6: c.fillStyle = "#4d9dff"; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 12, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); break;
    case 7: circ(10, "#ffd23f"); c.stroke(); c.strokeStyle = "#c98a00"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.stroke(); break;
    case 8: { c.shadowColor = "#b6ff3f"; c.shadowBlur = 14; c.fillStyle = "#b6ff3f"; c.beginPath(); c.roundRect(-7, -10, 14, 20, 4); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = INK; c.fillRect(-6, -13, 12, 4); break; }
    case 9: c.shadowColor = "#b45cff"; c.shadowBlur = 12; circ(9, "#b45cff"); c.shadowBlur = 0; c.stroke(); c.strokeStyle = "#ffe066"; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 0, 15, 4, -0.3, 0, 7); c.stroke(); break;
    case 10: { const gr = c.createRadialGradient(-3, -3, 1, 0, 0, 11); gr.addColorStop(0, "#fff"); gr.addColorStop(0.35, `hsl(${(Date.now() / 6) % 360},95%,65%)`); gr.addColorStop(1, `hsl(${(Date.now() / 6 + 120) % 360},95%,50%)`); c.shadowColor = "#fff"; c.shadowBlur = 12; c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "#fff8b0"; ol(c, 1.5); star(c, 11, -11, 4.5); c.fill(); c.stroke(); break; }
  }
  c.restore();
}

// ---------- Bait ----------
function drawBait(c, t, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 2.5);
  switch (t) {
    case 1: c.fillStyle = "#f1d19a"; c.beginPath(); c.roundRect(-7, -6, 14, 12, 4); c.fill(); c.stroke(); c.fillStyle = "#c99a5a"; c.fillRect(-3, -3, 2, 2); c.fillRect(2, 1, 2, 2); break;
    case 2: for (const [col, w] of [[INK, 7], ["#ff8fa8", 4]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-10, 2); c.bezierCurveTo(-6, -8, -2, 10, 2, 0); c.bezierCurveTo(5, -6, 8, 4, 11, -3); c.stroke(); } break;
    case 3: c.fillStyle = "#ffe04a"; for (const [cx, cy] of [[-5, 3], [4, 3], [0, -4]]) { c.beginPath(); c.arc(cx, cy, 5.5, 0, 7); c.fill(); c.stroke(); } break;
    case 4: c.fillStyle = "#7bbf3a"; c.beginPath(); c.ellipse(0, 0, 9, 5, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(10, -2, 4, 0, 7); c.fill(); c.stroke();
      c.lineWidth = 1.8; c.beginPath(); c.moveTo(-3, 4); c.lineTo(-6, 10); c.moveTo(3, 4); c.lineTo(6, 10); c.moveTo(12, -5); c.lineTo(17, -10); c.stroke(); break;
    case 5: for (const [col, w] of [[INK, 9], ["#ff9f43", 5.5]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(0, 3, 8, Math.PI * 1.05, Math.PI * 2.05); c.stroke(); }
      c.fillStyle = "#ff9f43"; c.beginPath(); c.moveTo(8, 3); c.lineTo(14, 9); c.lineTo(5, 9); c.closePath(); c.fill(); c.stroke(); break;
    case 6: drawFish(c, 0, 0, { ...FISH[0], color: "#9bd4ff" }, 28, 1); break;
    case 7: c.fillStyle = "#f7e8ff"; for (const k of [-6, 0, 6]) { for (const [col, w] of [[INK, 4.5], ["#f7e8ff", 2.5]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(k, 2); c.quadraticCurveTo(k + 4, 8, k - 2, 13); c.stroke(); } }
      ol(c, 2.5); c.beginPath(); c.moveTo(0, -13); c.lineTo(8, 3); c.lineTo(-8, 3); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(-3, 0, 1.5, 0, 7); c.arc(3, 0, 1.5, 0, 7); c.fill(); break;
    case 8: c.shadowColor = "#b6ff3f"; c.shadowBlur = 14; c.fillStyle = "#b6ff3f"; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-13, -5); c.lineTo(-13, 5); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(3, -2, 1.6, 0, 7); c.fill(); break;
    case 9: drawFish(c, 0, 0, { ...FISH[0], color: "#ffd23f", ry: 0.25 }, 30, 1); c.fillStyle = "#fff8b0"; ol(c, 1.2); star(c, 8, -10, 3.5 + Math.sin(Date.now() / 200)); c.fill(); c.stroke(); break;
    case 10: { const gr = c.createLinearGradient(-9, -12, 9, 12); gr.addColorStop(0, "#e8fbff"); gr.addColorStop(0.5, "#7ee0ff"); gr.addColorStop(1, "#b45cff"); c.fillStyle = gr; c.beginPath(); c.moveTo(0, -12); c.lineTo(9, -3); c.lineTo(0, 12); c.lineTo(-9, -3); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 1.5; c.beginPath(); c.moveTo(-9, -3); c.lineTo(9, -3); c.moveTo(0, -12); c.lineTo(-3, -3); c.lineTo(0, 12); c.moveTo(0, -12); c.lineTo(3, -3); c.lineTo(0, 12); c.stroke();
      c.fillStyle = "#fff"; ol(c, 1.2); star(c, 10, -10, 3.5 + Math.sin(Date.now() / 180)); c.fill(); c.stroke(); break; }
  }
  c.restore();
}

// ---------- Bucket (origin = bottom centre, mouth at y = -36) ----------
function drawBucketArt(c, t) {
  ol(c, 4);
  const trap = (wt, wb) => { c.beginPath(); c.moveTo(-wt, -36); c.lineTo(wt, -36); c.lineTo(wb, 0); c.lineTo(-wb, 0); c.closePath(); };
  const handle = col => { for (const [k, w] of [[INK, 5], [col, 2.5]]) { c.strokeStyle = k; c.lineWidth = w; c.beginPath(); c.arc(0, -36, 24, Math.PI, 0); c.stroke(); } ol(c, 4); };
  const hexy = () => { c.beginPath(); c.moveTo(-28, -36); c.lineTo(28, -36); c.lineTo(32, -14); c.lineTo(16, 0); c.lineTo(-16, 0); c.lineTo(-32, -14); c.closePath(); };
  switch (t) {
    case 1: trap(28, 20); c.fillStyle = "#b8c0cc"; c.fill(); c.stroke(); c.lineWidth = 2.5; for (const y of [-24, -12]) { c.beginPath(); c.moveTo(-25 + (y + 36) * 0.2, y); c.lineTo(25 - (y + 36) * 0.2, y); c.stroke(); } handle("#9aa7b8"); break;
    case 2: trap(28, 20); c.fillStyle = "#ff5a5f"; c.fill(); c.stroke(); c.fillStyle = "#fff"; c.fillRect(-24, -22, 48, 7); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-24, -22, 48, 7); handle("#fff"); break;
    case 3: c.beginPath(); c.moveTo(-24, -36); c.bezierCurveTo(-36, -24, -36, -12, -24, 0); c.lineTo(24, 0); c.bezierCurveTo(36, -12, 36, -24, 24, -36); c.closePath(); c.fillStyle = "#b5793a"; c.fill(); c.stroke();
      for (const y of [-26, -9]) for (const [k, w] of [[INK, 6.5], ["#7b8794", 3.5]]) { c.strokeStyle = k; c.lineWidth = w; c.beginPath(); c.moveTo(-32, y); c.quadraticCurveTo(0, y + 5, 32, y); c.stroke(); } ol(c, 4); break;
    case 4: c.fillStyle = "#3d8bff"; c.fillRect(-30, -36, 60, 36); c.strokeRect(-30, -36, 60, 36); c.fillStyle = "#fff"; c.fillRect(-33, -40, 66, 9); c.strokeRect(-33, -40, 66, 9);
      c.fillStyle = "#ff5a5f"; c.fillRect(-16, -22, 32, 10); c.lineWidth = 2.5; c.strokeRect(-16, -22, 32, 10); ol(c, 4); break;
    case 5: { const gr = c.createLinearGradient(-24, 0, 24, 0); gr.addColorStop(0, "#8c99ab"); gr.addColorStop(0.4, "#e6edf5"); gr.addColorStop(1, "#7b8794"); c.fillStyle = gr; c.fillRect(-24, -36, 48, 36); c.strokeRect(-24, -36, 48, 36);
      c.lineWidth = 2.5; for (const y of [-27, -18, -9]) { c.beginPath(); c.moveTo(-24, y); c.lineTo(24, y); c.stroke(); } ol(c, 4); c.fillStyle = "#ffd23f"; c.fillRect(-24, -6, 48, 4); break; }
    case 6: c.fillStyle = "rgba(160,225,255,.5)"; c.fillRect(-28, -36, 56, 34); c.fillStyle = "rgba(60,160,255,.35)"; c.fillRect(-28, -28, 56, 26); c.strokeRect(-28, -36, 56, 34);
      c.fillStyle = "#7a4a1d"; c.fillRect(-31, -4, 62, 6); c.strokeRect(-31, -4, 62, 6);
      c.strokeStyle = "#1e9e5a"; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, -4); c.quadraticCurveTo(-24, -14, -16, -22); c.moveTo(20, -4); c.quadraticCurveTo(26, -12, 18, -20); c.stroke();
      c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 2; for (const [bx, by] of [[-4, -12], [6, -20], [0, -26]]) { c.beginPath(); c.arc(bx, by, 2.5, 0, 7); c.stroke(); } ol(c, 4); break;
    case 7: c.fillStyle = "#8a5a2b"; c.fillRect(-30, -36, 60, 36); c.strokeRect(-30, -36, 60, 36); c.lineWidth = 2; for (const y of [-24, -12]) { c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y); c.stroke(); }
      c.fillStyle = "#ffd23f"; ol(c, 3); for (const x of [-24, 18]) { c.fillRect(x, -36, 6, 36); c.strokeRect(x, -36, 6, 36); } c.fillRect(-6, -26, 12, 12); c.strokeRect(-6, -26, 12, 12); c.fillStyle = INK; c.beginPath(); c.arc(0, -21, 2, 0, 7); c.fill(); ol(c, 4); break;
    case 8: { const gr = c.createLinearGradient(-28, -36, 28, 0); gr.addColorStop(0, "#fff3a0"); gr.addColorStop(0.5, "#ffd23f"); gr.addColorStop(1, "#c98a00"); trap(28, 20); c.fillStyle = gr; c.fill(); c.stroke();
      c.fillStyle = "rgba(255,255,255,.55)"; c.fillRect(-20, -30, 6, 24); ol(c, 2.5); for (const [gx, col] of [[-10, "#ff5a5f"], [0, "#4d9dff"], [10, "#4fd66b"]]) { c.fillStyle = col; c.beginPath(); c.arc(gx, -16, 4, 0, 7); c.fill(); c.stroke(); } ol(c, 4); handle("#ffd23f"); break; }
    case 9: hexy(); c.fillStyle = "rgba(120,230,255,.65)"; c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-28, -36); c.lineTo(0, -8); c.lineTo(28, -36); c.moveTo(-32, -14); c.lineTo(0, -8); c.lineTo(32, -14); c.moveTo(0, -8); c.lineTo(0, 0); c.stroke();
      c.fillStyle = "#fff"; ol(c, 1.5); star(c, -18, -24, 5 + 2 * Math.sin(Date.now() / 220)); c.fill(); c.stroke(); break;
    case 10: { const gr = c.createLinearGradient(-32, -36, 32, 0); ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"].forEach((col, i, a) => gr.addColorStop(i / (a.length - 1), col)); hexy(); c.fillStyle = gr; c.fill(); c.stroke();
      c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-28, -36); c.lineTo(0, -8); c.lineTo(28, -36); c.moveTo(0, -8); c.lineTo(0, 0); c.stroke();
      c.fillStyle = "#fff"; ol(c, 1.5); [[-18, -24], [20, -14]].forEach(([sx, sy], i) => { star(c, sx, sy, 5 + 2.5 * Math.sin(Date.now() / 200 + i * 2)); c.fill(); c.stroke(); }); break; }
  }
}

// ---------- Shop pictures ----------
function drawItemIcon(c, cat, t) {
  c.clearRect(0, 0, 200, 110);
  switch (cat) {
    case "rod": drawRod(c, 24, 94, 180, 22, t); c.fillStyle = RODS[t - 1].reel; ol(c, 3); c.beginPath(); c.arc(58, 88, 8, 0, 7); c.fill(); c.stroke(); break;
    case "line": {
      strokeLine(c, t, 18, 26, 100, 110, 172, 66);
      drawBobber(c, t, 172, 68, 1.7);
      break;
    }
    case "bait": {
      c.save(); c.translate(100, 55); c.scale(3, 3); drawBait(c, t, 0, 0, 1); c.restore();
      break;
    }
    case "bucket": c.save(); c.translate(100, 100); c.scale(1.7, 1.7); drawBucketArt(c, t); c.restore(); break;
  }
}
