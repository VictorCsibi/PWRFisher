"use strict";
// Tiers 16-24 for every shop category, plus new drawings for ALL rods (realistic, slim, each one different in shape,
// not just colour) and new line styles. Loaded after items3.js, before game.js.
// Uses INK, ol(), star(), RODS, LINES, BAITS, BUCKETS, CHAIRS, STRENGTHS, COSTS and the draw functions at call time.

const MORE = {
  rod:      ["Jade Rod", "Amber Rod", "Coral Rod", "Moonstone Rod", "Thunder Rod", "Aurora Rod", "Nebula Rod", "Phoenix Rod", "Legend Rod"],
  line:     ["Jade Thread", "Amber Line", "Coral Cord", "Moon Silk", "Thunder Wire", "Aurora Line", "Nebula Thread", "Phoenix Cord", "Legend Line"],
  bait:     ["Glow Worm", "Urchin Lure", "Pearl Oyster", "Moon Lure", "Thunder Spoon", "Aurora Squid", "Nebula Lure", "Phoenix Fly", "Legend Lure"],
  bucket:   ["Jade Bamboo Pail", "Amber Jar", "Coral Pot", "Moon Vault", "Thunder Cooler", "Aurora Tank", "Nebula Pod", "Phoenix Chest", "Legend Vault"],
  chair:    ["Jade Recliner", "Amber Armchair", "Coral Lounger", "Moon Hammock", "Thunder Stool", "Aurora Sofa", "Nebula Egg Pod", "Phoenix Throne", "Legend Throne"],
  strength: ["Sushi Platter", "Pizza Slice", "Pancake Stack", "Fruit Bowl", "Feast Plate", "Golden Noodles", "Dessert Tower", "Phoenix Curry", "Legend Feast"],
};
const MORE_COL = ["#3fbf7a", "#ffb020", "#ff7f7f", "#cfd8ff", "#ffe14a", "#5ff0d0", "#b45cff", "#ff6a2a", "#ffd23f"];
const MORE_ARRAYS = { rod: RODS, line: LINES, bait: BAITS, bucket: BUCKETS, chair: CHAIRS, strength: STRENGTHS };
for (const [cat, names] of Object.entries(MORE)) names.forEach((n, i) => MORE_ARRAYS[cat].push(cat === "line" ? { name: n, col: MORE_COL[i] } : cat === "rod" ? { name: n, reel: "#ffd23f" } : { name: n }));

// smooth prices: from tier 8 up every tier costs only 30% more than the one before
for (let t = 8; t <= 24; t++) COSTS[t - 1] = Math.round(2200 * Math.pow(1.3, t - 7) / 100) * 100;

const RB = ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"];
const cl = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- RODS: slim, realistic (grip, reel seat, reel, tapered blank, guides). x0,y0 = butt, x1,y1 = tip ----------
const ROD_ST = [
  { c: "#a0703a", c2: "#5a3a1a", grip: "#c9a26a", gt: "wrap", reel: "#9aa3b0", rt: "spin", g: 3, pat: "knots", tip: "leaf" },
  { c: "#9bd45a", c2: "#4d8a22", grip: "#7a4a1d", gt: "cork", reel: "#ffd23f", rt: "spin", g: 4, pat: "joints" },
  { c: "#4aa8ff", c2: "#ffffff", grip: "#2b3a55", gt: "foam", reel: "#ff5a5f", rt: "spin", g: 5, pat: "bands" },
  { c: "#2c3140", c2: "#ff5a5f", grip: "#15171f", gt: "foam", reel: "#ff5a5f", rt: "bait", g: 5, pat: "spiral" },
  { c: "#dfe6ee", c2: "#9aa7b8", grip: "#4a5568", gt: "cork", reel: "#4aa8ff", rt: "spin", g: 6, pat: "chrome" },
  { c: "#2fcf7a", c2: "#1e9e5a", grip: "#0f5a35", gt: "wrap", reel: "#ffd23f", rt: "bait", g: 5, pat: "gems", gem: "#8dffb8" },
  { c: "#c81e4a", c2: "#7a0f2c", grip: "#3a0a18", gt: "foam", reel: "#ffd23f", rt: "big", g: 5, pat: "scales", gem: "#ff8fa8" },
  { c: "#ffd23f", c2: "#c98a00", grip: "#8a5a00", gt: "wrap", reel: "#ff5a5f", rt: "bait", g: 6, pat: "gold", glow: "#ffe066" },
  { c: "#9be8ff", c2: "#e8fbff", grip: "#3a6a8a", gt: "foam", reel: "#ffffff", rt: "fly", g: 5, pat: "crystal", glow: "#9be8ff" },
  { c: "rainbow", c2: "#ffffff", grip: "#5b2a8a", gt: "wrap", reel: "#ffd23f", rt: "big", g: 6, pat: "sparks", tip: "star" },
  { c: "#2b5fd8", c2: "#8dc8ff", grip: "#12244f", gt: "cork", reel: "#8dc8ff", rt: "spin", g: 6, pat: "waves" },
  { c: "#1d1a26", c2: "#ff5a2a", grip: "#000000", gt: "foam", reel: "#ff5a2a", rt: "big", g: 6, pat: "flame", glow: "#ff5a2a" },
  { c: "#ffe14a", c2: "#3a3a3a", grip: "#3a3a3a", gt: "foam", reel: "#4d9dff", rt: "bait", g: 6, pat: "bolt", glow: "#fff8b0", tip: "bolt" },
  { c: "#2a1a6a", c2: "#fff8b0", grip: "#12082f", gt: "wrap", reel: "#ffd23f", rt: "fly", g: 6, pat: "stars", glow: "#b45cff" },
  { c: "rainbow", c2: "#ffd23f", grip: "#7a2fa8", gt: "wrap", reel: "#ffd23f", rt: "big", g: 7, pat: "gems", gem: "#ff8fa8", tip: "crown" },
  { c: "#3fbf7a", c2: "#1e7a4a", grip: "#5a3a1a", gt: "wrap", reel: "#c9f7d8", rt: "spin", g: 6, pat: "vines", tip: "leaf" },
  { c: "#ffb020", c2: "#a05a00", grip: "#4a2a10", gt: "cork", reel: "#ffe9a8", rt: "bait", g: 6, pat: "dots" },
  { c: "#ff7f7f", c2: "#c94a4a", grip: "#5a2a3a", gt: "foam", reel: "#ffd9d9", rt: "spin", g: 6, pat: "coral" },
  { c: "#cfd8ff", c2: "#ffffff", grip: "#2a3560", gt: "foam", reel: "#8ab4ff", rt: "fly", g: 6, pat: "moons", glow: "#cfd8ff" },
  { c: "#3a3a4a", c2: "#ffe14a", grip: "#111111", gt: "foam", reel: "#ffe14a", rt: "big", g: 7, pat: "bolt", glow: "#ffe14a", tip: "bolt" },
  { c: "aurora", c2: "#ffffff", grip: "#1a3a4a", gt: "wrap", reel: "#5ff0d0", rt: "bait", g: 7, pat: "sparks", glow: "#5ff0d0" },
  { c: "#3a1a6a", c2: "#ff8cf0", grip: "#1a0a3a", gt: "foam", reel: "#b45cff", rt: "spin", g: 7, pat: "swirl", glow: "#b45cff", tip: "bulb", gem: "#ff8cf0" },
  { c: "#ff6a2a", c2: "#ffd23f", grip: "#4a1a0a", gt: "wrap", reel: "#ffd23f", rt: "big", g: 7, pat: "feathers", glow: "#ff6a2a", tip: "feather" },
  { c: "#ffd23f", c2: "#ffffff", grip: "#7a2fa8", gt: "wrap", reel: "#ff5a5f", rt: "big", g: 8, pat: "gems", gem: "#ff5a5f", glow: "#ffe066", tip: "crown" },
];
function drawRod(c, x0, y0, x1, y1, t) {
  const S = ROD_ST[t - 1], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, side = ny >= 0 ? 1 : -1;
  const P = (u, o = 0) => [x0 + dx * u + nx * o, y0 + dy * u + ny * o];
  const wid = u => 4.4 - 3 * cl((u - 0.3) / 0.7, 0, 1); // the blank tapers from 4.4 to 1.4
  const tm = Date.now() / 1000, ang = Math.atan2(dy, dx);
  const tube = (a, b, w0, w1, fill) => {
    const [ax, ay] = P(a), [bx, by] = P(b);
    c.beginPath(); c.moveTo(ax + nx * w0 / 2, ay + ny * w0 / 2); c.lineTo(bx + nx * w1 / 2, by + ny * w1 / 2); c.lineTo(bx - nx * w1 / 2, by - ny * w1 / 2); c.lineTo(ax - nx * w0 / 2, ay - ny * w0 / 2); c.closePath();
    ol(c, 3); c.stroke(); c.fillStyle = fill; c.fill();
  };
  const gradFill = () => { const g = c.createLinearGradient(x0, y0, x1, y1); (S.c === "rainbow" ? RB : ["#5ff0d0", "#4d9dff", "#b45cff", "#ff8cf0"]).forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col)); return g; };
  const blankFill = S.c === "rainbow" || S.c === "aurora" ? gradFill() : S.c;
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  if (S.glow) { c.shadowColor = S.glow; c.shadowBlur = 9; }
  tube(0.28, 1, wid(0.28), wid(1), blankFill); c.shadowBlur = 0;
  c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1; c.beginPath(); c.moveTo(...P(0.3, -wid(0.3) * 0.22)); c.lineTo(...P(0.98, -wid(0.98) * 0.22)); c.stroke();
  c.fillStyle = S.c2; c.strokeStyle = S.c2;
  const us = (a, b, n) => Array.from({ length: n }, (_, i) => a + (b - a) * i / (n - 1));
  switch (S.pat) {
    case "knots": for (const u of [0.42, 0.6, 0.78]) { const [px, py] = P(u); c.fillStyle = S.c2; c.beginPath(); c.ellipse(px, py, 2.6, 1.8, ang + 1.57, 0, 7); c.fill(); c.lineWidth = 1.5; c.beginPath(); c.moveTo(px, py); c.lineTo(...P(u + 0.03, -side * 5)); c.stroke(); } break;
    case "joints": for (const u of us(0.4, 0.9, 6)) { c.lineWidth = 2; c.beginPath(); c.moveTo(...P(u, -wid(u) / 2 - 0.5)); c.lineTo(...P(u, wid(u) / 2 + 0.5)); c.stroke(); } break;
    case "bands": for (const u of [0.4, 0.56, 0.72, 0.86]) tube(u, u + 0.025, wid(u) + 0.5, wid(u + 0.025) + 0.5, S.c2); break;
    case "spiral": c.lineWidth = 1.4; for (const u of us(0.32, 0.95, 16)) { c.beginPath(); c.moveTo(...P(u, -wid(u) / 2)); c.lineTo(...P(u + 0.03, wid(u) / 2)); c.stroke(); } break;
    case "chrome": tube(0.3, 0.33, wid(0.3) + 1, wid(0.33) + 1, "#f4f7fb"); tube(0.62, 0.645, wid(0.62) + 1, wid(0.645) + 1, "#f4f7fb"); break;
    case "gems": for (const u of [0.5, 0.68, 0.86]) { const [px, py] = P(u); ol(c, 1.6); c.fillStyle = S.gem; c.beginPath(); c.arc(px, py, 2.4, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(px - 0.7, py - 0.7, 0.8, 0, 7); c.fill(); } break;
    case "scales": c.lineWidth = 1.2; for (const u of us(0.34, 0.96, 12)) { const [px, py] = P(u); c.beginPath(); c.arc(px, py, wid(u) * 0.45, 0, Math.PI); c.stroke(); } break;
    case "gold": tube(0.3, 0.335, wid(0.3) + 1.5, wid(0.335) + 1.5, "#fff3a0"); tube(0.55, 0.575, wid(0.55) + 1.5, wid(0.575) + 1.5, "#fff3a0"); tube(0.8, 0.82, wid(0.8) + 1.5, wid(0.82) + 1.5, "#fff3a0"); break;
    case "crystal": for (const u of [0.5, 0.7, 0.9]) { const [px, py] = P(u, -wid(u) / 2); ol(c, 1.6); c.fillStyle = "#e8fbff"; c.beginPath(); c.moveTo(px, py); c.lineTo(...P(u + 0.03, -wid(u) / 2 - 7)); c.lineTo(...P(u + 0.05, -wid(u) / 2)); c.closePath(); c.fill(); c.stroke(); } break;
    case "waves": c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i <= 30; i++) { const u = 0.32 + i / 30 * 0.66; const [px, py] = P(u, Math.sin(i * 0.9) * wid(u) * 0.28); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); break;
    case "flame": for (const u of us(0.4, 0.92, 6)) { const [px, py] = P(u, -side * wid(u) / 2); c.fillStyle = S.c2; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(...P(u + 0.012, -side * 6), ...P(u + 0.03, -side * (wid(u) / 2 + 6 + Math.sin(tm * 8 + u * 30) * 1.5))); c.lineTo(...P(u + 0.045, -side * wid(u) / 2)); c.closePath(); c.fill(); } break;
    case "bolt": c.lineWidth = 1.6; c.beginPath(); us(0.32, 0.98, 9).forEach((u, i) => { const [px, py] = P(u, (i % 2 ? 1 : -1) * wid(u) * 0.32); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); break;
    case "stars": for (const u of [0.45, 0.62, 0.8]) { const [px, py] = P(u); c.fillStyle = S.c2; ol(c, 1); star(c, px, py, 2.6 + Math.sin(tm * 3 + u * 9)); c.fill(); } break;
    case "vines": c.strokeStyle = S.c2; c.lineWidth = 1.3; c.beginPath(); for (let i = 0; i <= 28; i++) { const u = 0.32 + i / 28 * 0.66; const [px, py] = P(u, Math.sin(i * 1.1) * wid(u) * 0.4); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.fillStyle = "#7dff9a"; for (const u of [0.45, 0.6, 0.75, 0.9]) { const [px, py] = P(u, -side * (wid(u) / 2 + 1)); c.beginPath(); c.ellipse(px, py, 2.6, 1.4, ang - 0.7 * side, 0, 7); c.fill(); } break;
    case "dots": for (const u of us(0.36, 0.95, 9)) { const [px, py] = P(u); c.fillStyle = S.c2; c.beginPath(); c.arc(px, py, Math.max(0.9, wid(u) * 0.28), 0, 7); c.fill(); } break;
    case "coral": c.strokeStyle = S.c2; c.lineWidth = 1.5; for (const u of [0.42, 0.58, 0.74, 0.9]) { const b = P(u, -side * wid(u) / 2); c.beginPath(); c.moveTo(...b); c.lineTo(...P(u + 0.02, -side * 7)); c.moveTo(...P(u + 0.015, -side * 4)); c.lineTo(...P(u + 0.05, -side * 8)); c.stroke(); } break;
    case "moons": c.strokeStyle = "#fff"; c.lineWidth = 1.4; for (const u of [0.45, 0.65, 0.85]) { const [px, py] = P(u); c.beginPath(); c.arc(px, py, wid(u) * 0.5 + 0.6, 0.8, 5.5); c.stroke(); } break;
    case "sparks": for (const u of [0.5, 0.72, 0.92]) { const [px, py] = P(u, -side * 4); c.globalAlpha = 0.5 + 0.5 * Math.sin(tm * 5 + u * 20); c.fillStyle = "#fff8b0"; ol(c, 1); star(c, px, py, 3); c.fill(); c.globalAlpha = 1; } break;
    case "swirl": c.lineWidth = 1.6; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(...P(0.32)); c.lineTo(...P(0.98)); c.stroke(); c.setLineDash([]); for (const u of [0.5, 0.74]) { const [px, py] = P(u); c.beginPath(); c.arc(px, py, 2, 0, 7); c.fill(); } break;
    case "feathers": for (const u of [0.4, 0.5, 0.6]) { c.fillStyle = S.c2; ol(c, 1); c.beginPath(); c.ellipse(...P(u + 0.03, -side * 6), 7, 2.4, ang - 0.5 * side, 0, 7); c.fill(); c.stroke(); } break;
  }
  // grip
  tube(0, 0.27, 6.4, 5.6, S.grip);
  c.lineWidth = 1; c.strokeStyle = "rgba(0,0,0,.35)";
  if (S.gt === "cork") for (const u of us(0.04, 0.24, 6)) { const [px, py] = P(u, 1); c.beginPath(); c.arc(px, py, 0.7, 0, 7); c.stroke(); }
  else if (S.gt === "wrap") for (const u of us(0.02, 0.26, 9)) { c.beginPath(); c.moveTo(...P(u, -2.8)); c.lineTo(...P(u + 0.018, 2.8)); c.stroke(); }
  else for (const u of [0.1, 0.18]) { c.beginPath(); c.moveTo(...P(u, -2.6)); c.lineTo(...P(u, 2.6)); c.stroke(); }
  tube(-0.012, 0.012, 7.2, 7.2, "#444444"); // butt cap
  tube(0.27, 0.33, 6, 5, "#8a94a4"); // reel seat
  // reel
  const rr0 = P(0.3, side * 12);
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(...P(0.3, side * 2)); c.lineTo(...rr0); c.stroke(); c.strokeStyle = "#8a94a4"; c.lineWidth = 2; c.beginPath(); c.moveTo(...P(0.3, side * 2)); c.lineTo(...rr0); c.stroke();
  c.fillStyle = S.reel; ol(c, 2.4);
  const [cx, cy] = P(0.31, side * 16);
  if (S.rt === "spin") { c.beginPath(); c.ellipse(cx, cy, 8, 5.5, ang, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, cy, 5, 3, ang, 0, 7); c.stroke(); ol(c, 1.8); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - ux * 9, cy - uy * 9 + side * 3); c.stroke(); c.beginPath(); c.arc(cx - ux * 9, cy - uy * 9 + side * 3, 1.6, 0, 7); c.fill(); }
  else if (S.rt === "bait") { c.beginPath(); c.roundRect(cx - 8, cy - 5, 16, 10, 4); c.fill(); c.stroke(); c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.arc(cx, cy, 3, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(cx - 7, cy + 3 * side, 1.8, 0, 7); c.fill(); c.stroke(); }
  else if (S.rt === "big") { c.beginPath(); c.arc(cx, cy, 8.5, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 1.2; for (let a = 0; a < 6; a++) { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a * 1.05) * 7, cy + Math.sin(a * 1.05) * 7); c.stroke(); } c.fillStyle = "#222"; c.beginPath(); c.arc(cx, cy, 2, 0, 7); c.fill(); }
  else { c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.2; c.stroke(); }
  // guides (little rings under the blank)
  for (let i = 0; i < S.g; i++) {
    const u = 0.42 + (0.52 * i) / Math.max(1, S.g - 1), r = 3 - 1.5 * (i / Math.max(1, S.g - 1));
    const [gx, gy] = P(u, side * (wid(u) / 2 + r * 0.7)); c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.arc(gx, gy, r, 0, 7); c.stroke(); c.strokeStyle = S.pat === "gold" || S.pat === "gems" ? "#ffe066" : "#e8edf5"; c.lineWidth = 1.2; c.stroke();
  }
  // tip
  const [tx, ty] = P(1);
  c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.arc(tx, ty, 1.8, 0, 7); c.stroke();
  switch (S.tip) {
    case "leaf": c.fillStyle = "#4fd66b"; ol(c, 1.6); c.beginPath(); c.ellipse(tx + ux * 4, ty + uy * 4 - 2, 4.5, 2.2, ang - 0.5, 0, 7); c.fill(); c.stroke(); break;
    case "bulb": c.fillStyle = S.gem || "#ffd23f"; ol(c, 1.8); c.beginPath(); c.arc(tx + ux * 3, ty + uy * 3, 3.2, 0, 7); c.fill(); c.stroke(); break;
    case "star": c.fillStyle = "#fff8b0"; ol(c, 1.4); star(c, tx + ux * 4, ty + uy * 4 - 3, 5 + Math.sin(tm * 4)); c.fill(); c.stroke(); break;
    case "bolt": c.shadowColor = "#fff8b0"; c.shadowBlur = 8; c.strokeStyle = "#fff8b0"; c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 5, ty - 6); c.lineTo(tx + 1, ty - 6); c.lineTo(tx + 6, ty - 12); c.stroke(); c.shadowBlur = 0; break;
    case "feather": c.fillStyle = "#ffd23f"; ol(c, 1.2); c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + 8, ty - 12, tx + 2, ty - 15); c.quadraticCurveTo(tx - 2, ty - 8, tx, ty); c.fill(); c.stroke(); break;
    case "crown": c.fillStyle = "#ffd23f"; ol(c, 1.6); c.beginPath(); c.moveTo(tx - 4, ty - 2); c.lineTo(tx - 5, ty - 10); c.lineTo(tx - 2, ty - 6); c.lineTo(tx, ty - 12); c.lineTo(tx + 2, ty - 6); c.lineTo(tx + 5, ty - 10); c.lineTo(tx + 4, ty - 2); c.closePath(); c.fill(); c.stroke(); break;
  }
  c.restore();
}

// ---------- LINES: every tier its own colour AND its own style ----------
const LINE_PAT = ["plain", "plain", "twist", "cable", "sheen", "double", "beads", "sparkle", "flow", "rainbow", "stars", "chain", "zig", "stars", "rainbow", "barbs", "beads", "chain", "sparkle", "zig", "flow", "stars", "barbs", "rainbow"];
function strokeLine(c, t, x0, y0, cx, cy, x1, y1, thin = 1) {
  const w = (1.6 + Math.min(t, 15) * 0.25) * thin, N = 18, pts = [], tm = Date.now();
  for (let i = 0; i <= N; i++) { const u = i / N, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; pts.push([a * x0 + b * cx + d * x1, a * y0 + b * cy + d * y1]); }
  const path = () => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); };
  const pat = LINE_PAT[t - 1] || "plain", col = LINES[t - 1].col;
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.strokeStyle = "rgba(20,20,40,.55)"; c.lineWidth = w + 2; path(); c.stroke();
  if (t >= 8) { c.shadowColor = col; c.shadowBlur = 8; }
  if (pat === "rainbow") { c.lineWidth = w; for (let i = 0; i < N; i++) { c.strokeStyle = `hsl(${(i * 22 + tm / 8) % 360},90%,60%)`; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); } }
  else { c.strokeStyle = col; c.lineWidth = w; path(); c.stroke(); }
  c.shadowBlur = 0;
  const seg = i => { const [ax, ay] = pts[i], [bx, by] = pts[Math.min(N, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1; return { x: ax, y: ay, nx: -(by - ay) / l, ny: (bx - ax) / l }; };
  const o = Math.max(1.2, w * 0.9);
  if (pat === "twist") { c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1; for (let i = 0; i < N; i++) { const s = seg(i); c.beginPath(); c.moveTo(s.x - s.nx * w / 2, s.y - s.ny * w / 2); c.lineTo(s.x + s.nx * w / 2 + 1.5, s.y + s.ny * w / 2 + 1.5); c.stroke(); } }
  if (pat === "cable") { c.strokeStyle = "rgba(30,30,50,.6)"; c.lineWidth = 1.2; for (let i = 0; i < N; i += 1) { const s = seg(i); c.beginPath(); c.moveTo(s.x - s.nx * w / 2, s.y - s.ny * w / 2); c.lineTo(s.x + s.nx * w / 2, s.y + s.ny * w / 2); c.stroke(); } }
  if (pat === "sheen") { c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = Math.max(0.8, w * 0.25); c.beginPath(); pts.forEach(([x, y], i) => { const s = seg(i); i ? c.lineTo(x - s.nx * w * 0.2, y - s.ny * w * 0.2) : c.moveTo(x - s.nx * w * 0.2, y - s.ny * w * 0.2); }); c.stroke(); }
  if (pat === "double") { c.strokeStyle = "rgba(20,20,40,.7)"; c.lineWidth = Math.max(0.8, w * 0.3); path(); c.stroke(); }
  if (pat === "beads") { c.fillStyle = "#fff"; ol(c, 1.4); for (let i = 1; i < N; i += 3) { c.beginPath(); c.arc(pts[i][0], pts[i][1], w * 0.8 + 0.8, 0, 7); c.fill(); c.stroke(); } }
  if (pat === "chain") { ol(c, 1.4); c.fillStyle = "rgba(255,255,255,.85)"; for (let i = 1; i < N; i += 2) { const s = seg(i); c.save(); c.translate(s.x, s.y); c.rotate(Math.atan2(s.nx, -s.ny)); c.beginPath(); c.ellipse(0, 0, w * 1.4 + 1, w * 0.7 + 0.5, 0, 0, 7); c.fill(); c.stroke(); c.restore(); } }
  if (pat === "zig") { c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 1.1; c.beginPath(); pts.forEach(([x, y], i) => { const s = seg(i), k = (i % 2 ? 1 : -1) * w * 0.8; i ? c.lineTo(x + s.nx * k, y + s.ny * k) : c.moveTo(x, y); }); c.stroke(); }
  if (pat === "flow") { c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = Math.max(1, w * 0.4); c.setLineDash([3, 9]); c.lineDashOffset = -(tm / 40) % 12; path(); c.stroke(); c.setLineDash([]); }
  if (pat === "barbs") { c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 1.1; for (let i = 1; i < N; i += 2) { const s = seg(i); c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x + s.nx * o * 1.8 + 2, s.y + s.ny * o * 1.8); c.moveTo(s.x, s.y); c.lineTo(s.x - s.nx * o * 1.8 + 2, s.y - s.ny * o * 1.8); c.stroke(); } }
  if (pat === "sparkle" || pat === "stars" || t === 10 || t === 15 || t === 24) { c.fillStyle = "#fff8b0"; ol(c, 0.9); for (let i = 2; i < N; i += 4) { const k = 0.5 + 0.5 * Math.sin(tm / 260 + i * 1.7); if (pat === "stars" || t === 24) { star(c, pts[i][0], pts[i][1] - 2, 1.8 + 2.2 * k); c.fill(); } else { c.globalAlpha = k; c.beginPath(); c.arc(pts[i][0], pts[i][1], 1.6, 0, 7); c.fill(); c.globalAlpha = 1; } } }
  c.restore();
}

// ---------- BOBBERS (tiers 16-24) ----------
const __bob4 = drawBobber;
drawBobber = function (c, t, x, y, s = 1) {
  if (t <= 15) return __bob4(c, t, x, y, s);
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 3);
  switch (t) {
    case 16: c.fillStyle = "#3fbf7a"; c.beginPath(); c.moveTo(0, -13); c.quadraticCurveTo(13, -2, 0, 12); c.quadraticCurveTo(-13, -2, 0, -13); c.fill(); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 12); c.moveTo(0, -2); c.lineTo(6, -6); c.moveTo(0, 3); c.lineTo(-6, -1); c.stroke(); break;
    case 17: c.shadowColor = "#ffb020"; c.shadowBlur = 8; c.fillStyle = "#ffb020"; c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(12, 0, 8, 7); c.quadraticCurveTo(0, 14, -8, 7); c.quadraticCurveTo(-12, 0, 0, -14); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "#5a3a10"; c.beginPath(); c.ellipse(0, 1, 2.2, 3.4, 0.5, 0, 7); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(-4, -3, 2, 0, 7); c.fill(); break;
    case 18: c.fillStyle = "#ff7f7f"; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.57 + i * Math.PI / 5, r = i % 2 ? 5 : 13; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd0d0"; for (const a of [0, 1.26, 2.51, 3.77, 5.03]) { c.beginPath(); c.arc(Math.cos(a - 1.57) * 7, Math.sin(a - 1.57) * 7, 1.3, 0, 7); c.fill(); } break;
    case 19: c.shadowColor = "#cfd8ff"; c.shadowBlur = 12; c.fillStyle = "#e8edff"; c.beginPath(); c.arc(0, 0, 11, 0.5, 5.8); c.quadraticCurveTo(-2, 0, 9.2, 5.6); c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke(); break;
    case 20: c.fillStyle = "#4a4f66"; c.beginPath(); c.arc(-6, 3, 7, 0, 7); c.arc(4, 3, 8, 0, 7); c.arc(-1, -4, 7, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#ffe14a"; c.beginPath(); c.moveTo(2, -1); c.lineTo(-3, 6); c.lineTo(0, 6); c.lineTo(-2, 13); c.lineTo(5, 4); c.lineTo(2, 4); c.closePath(); c.fill(); c.stroke(); break;
    case 21: { const gr = c.createLinearGradient(0, -13, 0, 13); gr.addColorStop(0, "#5ff0d0"); gr.addColorStop(0.5, "#4d9dff"); gr.addColorStop(1, "#b45cff"); c.shadowColor = "#5ff0d0"; c.shadowBlur = 10; c.fillStyle = gr; c.beginPath(); c.moveTo(0, -14); c.lineTo(10, 0); c.lineTo(0, 14); c.lineTo(-10, 0); c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, -1); c.quadraticCurveTo(0, -5, 5, -1); c.stroke(); break; }
    case 22: c.fillStyle = "#7a3ad8"; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#ff8cf0"; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 0, 15, 4.5, -0.4, 0, 7); c.stroke(); c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, 16.2, 5.7, -0.4, 0, 7); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(-3, -3, 1.2, 0, 7); c.fill(); break;
    case 23: c.shadowColor = "#ff6a2a"; c.shadowBlur = 12; c.fillStyle = "#ff6a2a"; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(-8, -14, -15, -6); c.quadraticCurveTo(-9, -3, -12, 3); c.quadraticCurveTo(-4, 0, 0, 8); c.quadraticCurveTo(4, 0, 12, 3); c.quadraticCurveTo(9, -3, 15, -6); c.quadraticCurveTo(8, -14, 0, -4); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.stroke(); break;
    case 24: c.shadowColor = "#ffe066"; c.shadowBlur = 14; c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 3, 9, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.beginPath(); c.moveTo(-7, -4); c.lineTo(-8, -13); c.lineTo(-3, -8); c.lineTo(0, -15); c.lineTo(3, -8); c.lineTo(8, -13); c.lineTo(7, -4); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ff5a5f"; c.beginPath(); c.arc(0, 4, 2.8, 0, 7); c.fill(); break;
  }
  c.restore();
};

// ---------- BAITS (tiers 16-24) ----------
const __bait4 = drawBait;
drawBait = function (c, t, x, y, s = 1) {
  if (t <= 15) return __bait4(c, t, x, y, s);
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 2.5);
  const tm = Date.now() / 1000;
  switch (t) {
    case 16: c.shadowColor = "#7dff9a"; c.shadowBlur = 8; c.fillStyle = "#7dff9a"; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-9 + i * 4.6, Math.sin(i * 1.3 + tm * 3) * 2, 4.2 - i * 0.3, 0, 7); c.fill(); c.stroke(); } c.shadowBlur = 0; c.fillStyle = INK; c.beginPath(); c.arc(-11, -1, 1, 0, 7); c.fill(); break;
    case 17: c.fillStyle = "#8a4fd8"; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2; for (let a = 0; a < 12; a++) { const an = a * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(an) * 7, Math.sin(an) * 7); c.lineTo(Math.cos(an) * 13, Math.sin(an) * 13); c.stroke(); } break;
    case 18: c.fillStyle = "#d9c8b0"; c.beginPath(); c.arc(0, 2, 11, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.arc(0, 2, 11, 0, Math.PI); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.shadowColor = "#fff"; c.shadowBlur = 6; c.beginPath(); c.arc(0, 2, 4, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); break;
    case 19: c.shadowColor = "#cfd8ff"; c.shadowBlur = 8; c.fillStyle = "#e8edff"; c.beginPath(); c.arc(0, 0, 11, 0.6, 5.7); c.quadraticCurveTo(-2, 0, 9, 6); c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "#8ab4ff"; c.beginPath(); c.arc(-5, -2, 1.6, 0, 7); c.fill(); break;
    case 20: c.fillStyle = "#ffe14a"; c.beginPath(); c.ellipse(0, 0, 8, 12, 0.5, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#3a3a4a"; c.beginPath(); c.moveTo(2, -8); c.lineTo(-4, 1); c.lineTo(0, 1); c.lineTo(-2, 9); c.lineTo(5, -2); c.lineTo(1, -2); c.closePath(); c.fill(); break;
    case 21: { const gr = c.createLinearGradient(-10, 0, 10, 0); gr.addColorStop(0, "#5ff0d0"); gr.addColorStop(1, "#b45cff"); c.fillStyle = gr; c.beginPath(); c.moveTo(-7, -9); c.quadraticCurveTo(0, -14, 7, -9); c.quadraticCurveTo(9, -2, 6, 3); c.lineTo(-6, 3); c.quadraticCurveTo(-9, -2, -7, -9); c.fill(); c.stroke(); c.lineCap = "round"; for (const [k, col] of [[-5, "#5ff0d0"], [0, "#7fb8ff"], [5, "#b45cff"]]) { for (const [cc, w] of [[INK, 4.5], [col, 2.6]]) { c.strokeStyle = cc; c.lineWidth = w; c.beginPath(); c.moveTo(k, 3); c.quadraticCurveTo(k + Math.sin(tm * 3 + k) * 4, 9, k, 14); c.stroke(); } } c.fillStyle = "#fff"; c.beginPath(); c.arc(-3, -5, 1.6, 0, 7); c.arc(3, -5, 1.6, 0, 7); c.fill(); break; }
    case 22: c.fillStyle = "#7a3ad8"; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#ff8cf0"; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, 0, 13, 3.5, -0.5, 0, 7); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(-2, -2, 1, 0, 7); c.arc(3, 2, 0.8, 0, 7); c.fill(); break;
    case 23: for (const [col, ang] of [["#ff6a2a", -0.5], ["#ffd23f", 0], ["#ff3b3b", 0.5]]) { c.save(); c.rotate(ang); c.fillStyle = col; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(-9, -4, -2, -15); c.quadraticCurveTo(9, -4, 0, 6); c.fill(); c.stroke(); c.restore(); } c.fillStyle = "#4a1a0a"; c.beginPath(); c.arc(0, 6, 2.6, 0, 7); c.fill(); break;
    case 24: c.shadowColor = "#ffe066"; c.shadowBlur = 10; c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse(0, 1, 12, 7, 0, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.beginPath(); c.moveTo(-10, 1); c.lineTo(-18, -6); c.lineTo(-18, 8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ff5a5f"; c.beginPath(); c.arc(6, -1, 2.6, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-3, -6); c.lineTo(-4, -13); c.lineTo(0, -9); c.lineTo(3, -13); c.lineTo(4, -6); c.closePath(); c.fill(); c.stroke(); break;
  }
  c.restore();
};

// ---------- BUCKETS (origin bottom-centre, mouth at y = -36) ----------
const __bucket4 = drawBucketArt;
drawBucketArt = function (c, t) {
  if (t <= 15) return __bucket4(c, t);
  ol(c, 4);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const tm = Date.now() / 1000;
  switch (t) {
    case 16: R(-24, -36, 48, 36, "#7fcf6a", 3); c.strokeStyle = "#3f8f2a"; c.lineWidth = 2.5; for (const y of [-25, -13]) { c.beginPath(); c.moveTo(-24, y); c.lineTo(24, y); c.stroke(); } for (const x of [-12, 0, 12]) { c.beginPath(); c.moveTo(x, -36); c.lineTo(x, 0); c.stroke(); } R(-27, -40, 54, 7, "#5fb04a", 3); break;
    case 17: R(-22, -34, 44, 34, "rgba(255,176,32,.9)", 8); R(-18, -30, 8, 24, "rgba(255,255,255,.35)", 3); R(-24, -42, 48, 9, "#8a5a1a", 3); c.fillStyle = "#5a3a10"; c.beginPath(); c.ellipse(4, -14, 3, 5, 0.4, 0, 7); c.fill(); break;
    case 18: R(-26, -30, 52, 30, "#e8845a", 10); R(-30, -38, 60, 10, "#ff9f7a", 5); for (const [x, k] of [[-16, 1], [0, 0], [16, -1]]) { for (const [cc, w] of [[INK, 7], ["#ff7f7f", 4]]) { c.strokeStyle = cc; c.lineWidth = w; c.beginPath(); c.moveTo(x, -38); c.lineTo(x + k * 3, -48); c.moveTo(x + k * 3, -44); c.lineTo(x + k * 8, -50); c.stroke(); } } break;
    case 19: R(-30, -36, 60, 36, "#2a3568", 6); R(-30, -40, 60, 8, "#8ab4ff", 4); c.fillStyle = "#e8edff"; ol(c, 2.5); c.beginPath(); c.arc(0, -16, 10, 0.6, 5.7); c.quadraticCurveTo(-2, -16, 8.5, -11); c.closePath(); c.fill(); c.stroke(); ol(c, 4); break;
    case 20: R(-30, -34, 60, 34, "#ffe14a", 5); R(-32, -40, 64, 9, "#3a3a4a", 4); c.fillStyle = "#3a3a4a"; c.beginPath(); c.moveTo(4, -30); c.lineTo(-8, -14); c.lineTo(-1, -14); c.lineTo(-5, -3); c.lineTo(9, -20); c.lineTo(2, -20); c.closePath(); c.fill(); R(-36, -28, 6, 12, "#3a3a4a", 2); R(30, -28, 6, 12, "#3a3a4a", 2); break;
    case 21: { const gr = c.createLinearGradient(0, -36, 0, 0); gr.addColorStop(0, "rgba(140,255,230,.85)"); gr.addColorStop(1, "rgba(120,110,255,.9)"); c.fillStyle = gr; c.beginPath(); c.roundRect(-28, -36, 56, 36, 5); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 2; c.beginPath(); for (let x = -26; x <= 26; x += 2) { const y = -20 + Math.sin(x * 0.3 + tm * 3) * 3; x === -26 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); R(-31, -40, 62, 7, "#2a4a6a", 3); break; }
    case 22: c.fillStyle = "#4a2a8a"; c.beginPath(); c.arc(0, -6, 30, Math.PI, 0); c.lineTo(30, 0); c.lineTo(-30, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#1a0f3a"; c.beginPath(); c.ellipse(0, -36, 24, 5, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff8b0"; for (const [x, y] of [[-14, -22], [8, -28], [16, -14], [-6, -10]]) { ol(c, 1); star(c, x, y, 3 + Math.sin(tm * 3 + x)); c.fill(); } ol(c, 4); break;
    case 23: R(-30, -32, 60, 32, "#c8321a", 4); c.fillStyle = "#c8321a"; c.beginPath(); c.moveTo(-30, -32); c.quadraticCurveTo(0, -50, 30, -32); c.closePath(); c.fill(); c.stroke(); R(-31, -8, 62, 8, "#ffd23f", 2); c.fillStyle = "#ffd23f"; ol(c, 2.5); c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(-14, -22, -22, -14); c.quadraticCurveTo(-14, -18, -10, -8); c.quadraticCurveTo(-4, -10, 0, -4); c.quadraticCurveTo(4, -10, 10, -8); c.quadraticCurveTo(14, -18, 22, -14); c.quadraticCurveTo(14, -22, 0, -12); c.fill(); c.stroke(); ol(c, 4); break;
    case 24: c.save(); c.shadowColor = "#ffe066"; c.shadowBlur = 14; R(-30, -36, 60, 36, "#ffd23f", 5); c.restore(); R(-32, -40, 64, 8, "#fff3a0", 3); c.fillStyle = "#ff5a5f"; ol(c, 2.5); for (const x of [-20, 0, 20]) { c.beginPath(); c.arc(x, -18, 5, 0, 7); c.fill(); c.stroke(); } c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-10, -40); c.lineTo(-12, -54); c.lineTo(-5, -47); c.lineTo(0, -58); c.lineTo(5, -47); c.lineTo(12, -54); c.lineTo(10, -40); c.closePath(); c.fill(); c.stroke(); ol(c, 4); break;
  }
};

// ---------- CHAIRS (seat top at y = -26; about 50 wide) ----------
const __chair4 = drawChairArt;
drawChairArt = function (c, t) {
  if (t <= 15) return __chair4(c, t);
  ol(c, 3.5);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const L = (x1, y1, x2, y2, col, w = 5) => { c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); };
  const tm = Date.now() / 1000;
  switch (t) {
    case 16: L(-16, -6, -18, 0, "#3a2a1a"); L(20, -6, 22, 0, "#3a2a1a"); R(-20, -26, 40, 12, "#3fbf7a", 5); R(-28, -64, 14, 40, "#3fbf7a", 7); R(20, -18, 26, 9, "#2f9f62", 4); c.fillStyle = "#7dff9a"; c.beginPath(); c.arc(-21, -50, 3, 0, 7); c.fill(); break;
    case 17: for (const x of [-20, 18]) R(x, -8, 6, 8, "#4a2a10", 1); R(-24, -26, 48, 14, "#ffb020", 5); R(-24, -60, 48, 38, "#ffb020", 8); R(-30, -40, 9, 22, "#a05a00", 4); R(21, -40, 9, 22, "#a05a00", 4); c.fillStyle = "#ffe9a8"; for (const [x, y] of [[-10, -50], [4, -44], [12, -54]]) { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); } break;
    case 18: L(-30, -2, -22, -18, "#a04a4a"); L(18, -2, 26, -12, "#a04a4a"); L(-20, -18, 8, -28, "#ff7f7f", 12); L(-24, -20, -34, -50, "#ff7f7f", 11); L(8, -28, 40, -22, "#ff9f9f", 10); c.fillStyle = "#fff"; c.beginPath(); c.arc(-30, -40, 2.5, 0, 7); c.fill(); break;
    case 19: L(-32, 0, -32, -58, "#5a4a3a", 5); L(32, 0, 32, -58, "#5a4a3a", 5); c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(-32, -54); c.quadraticCurveTo(0, -12, 32, -54); c.stroke(); c.strokeStyle = "#8ab4ff"; c.lineWidth = 6; c.stroke(); break;
    case 20: L(0, -24, -14, -2, "#3a3a4a", 5); L(0, -24, 14, -2, "#3a3a4a", 5); L(0, -24, 0, -2, "#3a3a4a", 5); R(-20, -30, 40, 8, "#ffe14a", 4); R(-16, -66, 32, 34, "#ffe14a", 6); c.fillStyle = "#3a3a4a"; c.beginPath(); c.moveTo(3, -60); c.lineTo(-6, -48); c.lineTo(0, -48); c.lineTo(-3, -38); c.lineTo(7, -52); c.lineTo(1, -52); c.closePath(); c.fill(); break;
    case 21: for (const x of [-30, 26]) R(x, -8, 6, 8, "#1a3a4a", 1); R(-34, -30, 68, 16, "#5ff0d0", 6); R(-34, -64, 68, 36, "#3fd0b0", 10); R(-40, -42, 10, 28, "#2fb090", 5); R(30, -42, 10, 28, "#2fb090", 5); c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 2; for (const x of [-12, 12]) { c.beginPath(); c.moveTo(x, -60); c.lineTo(x, -32); c.stroke(); } break;
    case 22: c.fillStyle = "#4a2a8a"; c.beginPath(); c.ellipse(0, -30, 24, 32, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#1a0f3a"; c.beginPath(); c.ellipse(4, -22, 16, 20, 0, 0, 7); c.fill(); R(-18, -24, 38, 9, "#7a4ad8", 4); c.fillStyle = "#fff8b0"; for (const [x, y] of [[-14, -46], [12, -52], [16, -36], [-6, -58]]) { ol(c, 1); star(c, x, y, 2.6 + Math.sin(tm * 3 + x)); c.fill(); } break;
    case 23: for (const x of [-16, 12]) R(x, -8, 6, 8, "#4a1a0a", 1); R(-20, -28, 42, 16, "#ff6a2a", 5); R(-16, -78, 34, 52, "#c8321a", 8); c.fillStyle = "#ffd23f"; ol(c, 2.5); for (const k of [-1, 1]) { c.beginPath(); c.moveTo(1 + k * 16, -60); c.quadraticCurveTo(1 + k * 40, -78, 1 + k * 30, -40); c.quadraticCurveTo(1 + k * 26, -52, 1 + k * 16, -44); c.closePath(); c.fill(); c.stroke(); } c.beginPath(); c.arc(1, -60, 6, 0, 7); c.fill(); c.stroke(); break;
    case 24: for (const x of [-18, 16]) R(x, -8, 7, 8, "#7a5a00", 1); R(-24, -28, 48, 16, "#ffd23f", 5); R(-20, -84, 42, 60, "#ffd23f", 8); R(-30, -46, 9, 22, "#ffe066", 4); R(23, -46, 9, 22, "#ffe066", 4); c.fillStyle = "#ff5a5f"; ol(c, 2); for (const [x, y] of [[1, -68], [-8, -50], [10, -50]]) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); c.stroke(); } c.fillStyle = "#ffd23f"; ol(c, 2.5); c.beginPath(); c.moveTo(-14, -84); c.lineTo(-16, -98); c.lineTo(-7, -91); c.lineTo(1, -102); c.lineTo(9, -91); c.lineTo(18, -98); c.lineTo(16, -84); c.closePath(); c.fill(); c.stroke(); break;
  }
};

// ---------- FOOD (fits roughly x -30..30, y -24..30) ----------
const __food4 = drawStrengthArt;
drawStrengthArt = function (c, t) {
  if (t <= 15) return __food4(c, t);
  ol(c, 3);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const D = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); };
  const tm = Date.now() / 1000;
  switch (t) {
    case 16: R(-30, 12, 60, 10, "#b5773a", 3); for (const [x, col] of [[-18, "#fff"], [0, "#fff"], [18, "#fff"]]) { R(x - 8, -2, 16, 14, col, 6); R(x - 8, 3, 16, 5, "#2a2f45", 1); D(x, -2, 4, x === 0 ? "#ff8a5a" : "#ff5a5f"); } break;
    case 17: c.fillStyle = "#ffd06a"; c.beginPath(); c.moveTo(-26, -14); c.lineTo(26, -14); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke(); R(-27, -19, 54, 8, "#d9954f", 4); D(-8, -4, 5, "#e2483a"); D(8, -4, 5, "#e2483a"); D(0, 10, 4.5, "#e2483a"); break;
    case 18: for (const [y, col] of [[14, "#e0a050"], [8, "#e8b060"], [2, "#f0c070"], [-4, "#f8d080"]]) { c.fillStyle = col; c.beginPath(); c.ellipse(0, y, 26, 6, 0, 0, 7); c.fill(); c.stroke(); } R(-7, -14, 14, 8, "#ffe066", 2); c.fillStyle = "#8a4a1a"; c.beginPath(); c.moveTo(-20, -4); c.quadraticCurveTo(-24, 10, -14, 12); c.quadraticCurveTo(-8, 4, -2, -4); c.closePath(); c.fill(); break;
    case 19: c.fillStyle = "#c98a5a"; c.beginPath(); c.moveTo(-28, 2); c.quadraticCurveTo(0, 36, 28, 2); c.closePath(); c.fill(); c.stroke(); D(-14, -4, 9, "#ff5a5f"); D(4, -8, 9, "#ffa030"); D(16, -2, 8, "#7dd06a"); break;
    case 20: D(0, 8, 28, "#f4f4f4"); D(0, 8, 20, "#fff"); c.fillStyle = "#b5773a"; c.beginPath(); c.ellipse(-4, 4, 13, 9, -0.4, 0, 7); c.fill(); c.stroke(); R(4, -2, 22, 5, "#f4f4f4", 2); D(26, 0, 4, "#f4f4f4"); D(-16, 14, 5, "#ffd23f"); D(-8, 18, 5, "#ffd23f"); D(0, 20, 5, "#ffd23f"); break;
    case 21: c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-28, 0); c.quadraticCurveTo(-26, 30, 0, 30); c.quadraticCurveTo(26, 30, 28, 0); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "#e6a800"; c.lineWidth = 3; c.lineCap = "round"; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-20 + i * 2, -2); c.bezierCurveTo(-10, -12 + i * 3, 0, 10, 10 + i * 3, -2); c.stroke(); } ol(c, 3); c.strokeStyle = "#c9a26a"; c.lineWidth = 3; c.beginPath(); c.moveTo(6, -6); c.lineTo(30, -26); c.moveTo(12, -4); c.lineTo(34, -20); c.stroke(); break;
    case 22: R(-3, -8, 6, 34, "#c8a0ff", 2); R(-28, 24, 56, 6, "#c8a0ff", 3); R(-20, 8, 40, 5, "#c8a0ff", 3); R(-12, -4, 24, 5, "#c8a0ff", 3); for (const [x, y, col] of [[-16, 2, "#ff8fb1"], [16, 2, "#8ab4ff"], [-8, -12, "#ffd23f"], [8, -12, "#7dd06a"], [0, -20, "#ff5a5f"]]) { R(x - 7, y - 4, 14, 9, col, 4); D(x, y - 6, 4, "#fff"); } break;
    case 23: R(-26, 4, 52, 22, "#c8321a", 9); R(-28, 0, 56, 7, "#ff6a2a", 3); c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse(0, 4, 20, 3, 0, 0, 7); c.fill(); for (const k of [-1, 0, 1]) { c.fillStyle = k ? "#ff6a2a" : "#ffd23f"; ol(c, 2); c.beginPath(); c.moveTo(k * 10 - 5, 0); c.quadraticCurveTo(k * 10 - 8, -10, k * 10 + Math.sin(tm * 6 + k) * 2, -20); c.quadraticCurveTo(k * 10 + 8, -8, k * 10 + 5, 0); c.closePath(); c.fill(); c.stroke(); } break;
    case 24: c.save(); c.shadowColor = "#ffe066"; c.shadowBlur = 12; c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse(0, 20, 32, 8, 0, 0, 7); c.fill(); c.restore(); c.stroke(); c.fillStyle = "#c9803a"; c.beginPath(); c.ellipse(0, 6, 20, 14, 0, 0, 7); c.fill(); c.stroke(); R(-28, 4, 8, 6, "#f4f4f4", 3); R(20, 4, 8, 6, "#f4f4f4", 3); c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-9, -8); c.lineTo(-10, -20); c.lineTo(-4, -14); c.lineTo(0, -22); c.lineTo(4, -14); c.lineTo(10, -20); c.lineTo(9, -8); c.closePath(); c.fill(); c.stroke(); break;
  }
};
