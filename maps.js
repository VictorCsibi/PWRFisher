"use strict";
// Maps: each has its own sky tint, far scenery, water, the platform you stand on, sea-floor life and fish.
// Loaded before game.js. Uses ctx, g, W, H, WATER_Y, DECK_Y, INK, ink(), lerp, clamp, rand, state at call time.
// (Scene is authored dock-left and mirrored when drawn.)

const MAP_ORDER = ["bay", "lake", "forest", "arctic", "volcano"];
const curMap = () => MAPS[state.map] || MAPS.bay;

// ---------- shared bits ----------
function pineTree(x, y, h, col, trunk = "#6b4423") {
  ctx.fillStyle = trunk; ink(2.5); ctx.fillRect(x - 2.5, y - 6, 5, 8);
  ctx.fillStyle = col;
  for (let k = 0; k < 3; k++) {
    const by = y - 6 - k * h * 0.28, w = 14 - k * 3.5;
    ctx.beginPath(); ctx.moveTo(x, by - h * 0.42); ctx.lineTo(x + w, by); ctx.lineTo(x - w, by); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}
function snowCap(x, y, w) {
  ctx.fillStyle = "#fff"; ink(3);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - w, y + w * 0.85); ctx.lineTo(x - w * 0.45, y + w * 1.15); ctx.lineTo(x, y + w * 0.85); ctx.lineTo(x + w * 0.5, y + w * 1.2); ctx.lineTo(x + w, y + w * 0.85); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function lanternPost(lamp = "#ffe066", post = "#7a4a1d") {
  ink(4); ctx.fillStyle = post; ctx.fillRect(316, DECK_Y - 120, 12, 120); ctx.strokeRect(316, DECK_Y - 120, 12, 120);
  ctx.fillStyle = lamp; ctx.beginPath(); ctx.roundRect(308, DECK_Y - 152, 28, 30, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(304, DECK_Y - 152); ctx.lineTo(322, DECK_Y - 166); ctx.lineTo(340, DECK_Y - 152); ctx.closePath(); ctx.fill();
}
const seeded = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const shore = () => H - 36; // sea-floor line

// Floating platforms (the boat, the ice floe) rock and tilt gently on the waves.
function deckTilt() {
  const b = curMap().bob; if (!b || !b.tilt) return 0;
  return Math.sin(g.t * b.speed * 0.9 + 0.7) * b.tilt + Math.sin(g.t * b.speed * 2.1 + 2) * b.tilt * 0.25;
}
// move + tilt the canvas the same way the floating platform moves (pivot = where the fisherman stands)
function applyDeck(c) { c.translate(0, deckBob()); c.translate(190, DECK_Y); c.rotate(deckTilt()); c.translate(-190, -DECK_Y); }
// the same transform for a single point (rod tip, lantern light...)
function deckXform(x, y) {
  const th = deckTilt(), cs = Math.cos(th), sn = Math.sin(th), dx = x - 190, dy = y - DECK_Y;
  return { x: 190 + dx * cs - dy * sn, y: DECK_Y + dx * sn + dy * cs + deckBob() };
}

// Floating platforms (the boat, the ice floe) rock gently on the waves. The dock and the volcano pier stay still.
function deckBob() {
  const b = curMap().bob; if (!b) return 0;
  return Math.sin(g.t * b.speed) * b.amp + Math.sin(g.t * b.speed * 2.3 + 1) * b.amp * 0.25;
}

// ---------- LAKE: boat beside a log cabin ----------
function farLake() {
  const pk = [[0, 50], [.09, 105], [.2, 62], [.33, 128], [.47, 76], [.6, 118], [.74, 64], [.87, 104], [1, 52]].map(([xf, h]) => [xf * W, WATER_Y - h]);
  ink(4); ctx.fillStyle = "#93b5d8"; ctx.beginPath(); pk.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(W, WATER_Y); ctx.lineTo(0, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  snowCap(pk[3][0], pk[3][1], 26); snowCap(pk[5][0], pk[5][1], 24);
  // forest hills, two layers
  for (const [amp, base, col, treeCol, step, hh] of [[16, 42, "#3f8f5a", "#1f6e45", 24, 30], [12, 18, "#57b06a", "#2a8a4c", 30, 34]]) {
    const hy = x => WATER_Y - base - Math.sin(x / 90 + base) * amp - Math.sin(x / 31) * 4;
    ctx.fillStyle = col; ink(4); ctx.beginPath(); ctx.moveTo(0, WATER_Y + 4); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, hy(x)); ctx.lineTo(W, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let x = 12 + base; x < W; x += step) pineTree(x, hy(x) + 2, hh + ((x * 7) % 11), treeCol);
  }
  // morning mist
  const mist = ctx.createLinearGradient(0, WATER_Y - 60, 0, WATER_Y + 4); mist.addColorStop(0, "rgba(255,255,255,0)"); mist.addColorStop(1, "rgba(255,255,255,.45)");
  ctx.fillStyle = mist; ctx.fillRect(0, WATER_Y - 60, W, 64);
  // reeds along the far shore
  for (let x = 30; x < W; x += 140) { ctx.strokeStyle = "#2f7a3a"; ctx.lineWidth = 3; ctx.beginPath(); for (let k = -2; k <= 2; k++) { ctx.moveTo(x + k * 6, WATER_Y + 2); ctx.lineTo(x + k * 6 + Math.sin(g.t + x + k) * 3, WATER_Y - 26 - Math.abs(k) * -4); } ctx.stroke(); }
}
function platformLake() {
  const fl = shore();
  // earth bank the cabin sits on
  ink(4); ctx.fillStyle = "#7a5a3a"; ctx.beginPath(); ctx.moveTo(-30, DECK_Y); ctx.lineTo(112, DECK_Y); ctx.lineTo(126, DECK_Y + 40); ctx.lineTo(112, fl); ctx.lineTo(-30, fl); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#5fbf5a"; ctx.beginPath(); ctx.moveTo(-30, DECK_Y - 4); ctx.lineTo(112, DECK_Y - 4); ctx.lineTo(116, DECK_Y + 12); ctx.lineTo(-30, DECK_Y + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#9a7b58"; for (const [px, py, r] of [[20, DECK_Y + 60, 8], [70, DECK_Y + 100, 10], [40, DECK_Y + 140, 7]]) { ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
  // log cabin
  const cx0 = -34, cw = 138, top = DECK_Y - 86;
  for (let i = 0; i < 7; i++) { // stacked logs
    const y = DECK_Y - 12 - i * 12;
    ctx.fillStyle = i % 2 ? "#a3703c" : "#8f5f30"; ink(3); ctx.beginPath(); ctx.roundRect(cx0, y, cw, 13, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c99a62"; ctx.beginPath(); ctx.arc(cx0, y + 6.5, 5.5, 0, 7); ctx.arc(cx0 + cw, y + 6.5, 5.5, 0, 7); ctx.fill();
  }
  ctx.fillStyle = "#5b3a1c"; ink(4); ctx.beginPath(); ctx.moveTo(cx0 - 18, top + 6); ctx.lineTo(cx0 + cw / 2, top - 62); ctx.lineTo(cx0 + cw + 18, top + 6); ctx.closePath(); ctx.fill(); ctx.stroke(); // roof
  ctx.fillStyle = "#7a4a2a"; for (const k of [0.3, 0.55, 0.8]) { ctx.beginPath(); ctx.moveTo(cx0 + cw / 2 - (cw / 2 + 18) * k, top + 6 - 68 * (1 - k) + 4); ctx.lineTo(cx0 + cw / 2 + (cw / 2 + 18) * k, top + 6 - 68 * (1 - k) + 4); ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = "#8a8f99"; ink(4); ctx.fillRect(cx0 + cw - 34, top - 74, 20, 50); ctx.strokeRect(cx0 + cw - 34, top - 74, 20, 50); // chimney
  for (let i = 0; i < 5; i++) { const ph = (g.t * 0.35 + i * 0.2) % 1; ctx.fillStyle = `rgba(230,230,235,${0.75 * (1 - ph)})`; ctx.beginPath(); ctx.arc(cx0 + cw - 24 + Math.sin(ph * 5 + i) * 8 + ph * 16, top - 78 - ph * 70, 7 + ph * 10, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#3a2410"; ink(3); ctx.beginPath(); ctx.roundRect(cx0 + 62, DECK_Y - 52, 30, 52, [6, 6, 0, 0]); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(cx0 + 68, DECK_Y - 26, 2.5, 0, 7); ctx.fill(); // door
  ctx.fillStyle = "#ffe89a"; ink(3); ctx.fillRect(cx0 + 16, DECK_Y - 56, 30, 26); ctx.strokeRect(cx0 + 16, DECK_Y - 56, 30, 26); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx0 + 31, DECK_Y - 56); ctx.lineTo(cx0 + 31, DECK_Y - 30); ctx.moveTo(cx0 + 16, DECK_Y - 43); ctx.lineTo(cx0 + 46, DECK_Y - 43); ctx.stroke(); // window
  // the boat
  const bob = deckBob();
  ctx.save(); applyDeck(ctx);
  ctx.fillStyle = "#8a5a2b"; ink(4); ctx.beginPath(); ctx.moveTo(112, DECK_Y + 2); ctx.lineTo(346, DECK_Y + 2); ctx.lineTo(384, DECK_Y - 16); ctx.lineTo(334, DECK_Y + 58); ctx.lineTo(146, DECK_Y + 58); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(60,30,10,.55)"; ctx.lineWidth = 2.5; for (const k of [16, 32, 46]) { ctx.beginPath(); ctx.moveTo(118 + k * 0.5, DECK_Y + k); ctx.lineTo(346 + k * 0.4, DECK_Y + k); ctx.stroke(); }
  ctx.fillStyle = "#fff"; ink(3); ctx.fillRect(112, DECK_Y - 4, 240, 8); ctx.strokeRect(112, DECK_Y - 4, 240, 8); // rail
  ctx.fillStyle = "#d9954f"; ink(3); ctx.fillRect(114, DECK_Y - 2, 236, 6);
  ctx.fillStyle = "#ff5a5f"; ink(3); ctx.beginPath(); ctx.arc(250, DECK_Y + 28, 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) { ctx.beginPath(); ctx.arc(250 + Math.cos(a) * 8, DECK_Y + 28 + Math.sin(a) * 8, 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.arc(250, DECK_Y + 28, 4, 0, 7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#c9b27a"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(106, DECK_Y - 4); { const rp = deckXform(120, DECK_Y - 2); ctx.quadraticCurveTo(114, DECK_Y + 10 + bob * 0.5, rp.x, rp.y); } ctx.stroke(); // mooring rope
  ctx.save(); applyDeck(ctx); lanternPost("#ffe066", "#6b4423"); ctx.restore();
}

// ---------- ARCTIC: ice shelf and igloo ----------
function aurora(dark, rain) {
  const a = clamp((dark - 0.25) / 0.6, 0, 1) * (1 - rain * 0.6);
  if (a < 0.02) return;
  ctx.save();
  for (let k = 0; k < 3; k++) {
    const y0 = WATER_Y * (0.2 + k * 0.09), edge = x => y0 + Math.sin(x / 150 + g.t * 0.4 + k * 1.7) * 26;
    const gr = ctx.createLinearGradient(0, y0 - 30, 0, y0 + 140);
    gr.addColorStop(0, `rgba(90,255,170,${a * 0.5})`); gr.addColorStop(0.5, `rgba(70,200,255,${a * 0.28})`); gr.addColorStop(1, "rgba(160,110,255,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(0, edge(0));
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, edge(x));
    for (let x = W; x >= 0; x -= 16) ctx.lineTo(x, edge(x) + 90 + Math.sin(x / 60 + g.t + k) * 30);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function farArctic() {
  const pk = [[0, 40], [.07, 100], [.17, 60], [.3, 140], [.43, 70], [.55, 125], [.68, 64], [.8, 132], [.92, 80], [1, 50]].map(([xf, h]) => [xf * W, WATER_Y - h]);
  ink(4); ctx.fillStyle = "#cfe3f7"; ctx.beginPath(); pk.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(W, WATER_Y); ctx.lineTo(0, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#a9c6e6"; for (const i of [1, 3, 5, 7]) { ctx.beginPath(); ctx.moveTo(pk[i][0], pk[i][1]); ctx.lineTo(pk[i + 1][0], pk[i + 1][1]); ctx.lineTo(pk[i][0] + 10, WATER_Y); ctx.lineTo(pk[i][0] - 30, WATER_Y); ctx.closePath(); ctx.fill(); }
  for (const i of [1, 3, 5, 7]) snowCap(pk[i][0], pk[i][1], 24);
  // glacier front along the horizon
  ctx.fillStyle = "#e6f6ff"; ink(4); ctx.beginPath(); ctx.moveTo(0, WATER_Y + 4);
  for (let x = 0; x <= W; x += 14) ctx.lineTo(x, WATER_Y - 30 - ((x * 13) % 22) - Math.sin(x / 70) * 8);
  ctx.lineTo(W, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(120,180,230,.6)"; ctx.lineWidth = 2; for (let x = 40; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, WATER_Y - 26); ctx.lineTo(x + 10, WATER_Y + 2); ctx.stroke(); }
  // icebergs bobbing on the water
  for (const [x, s] of [[W * 0.22, 1.2], [W * 0.52, 0.9], [W * 0.8, 1.4]]) {
    const y = WATER_Y + Math.sin(g.t * 0.9 + x) * 2;
    ctx.fillStyle = "rgba(160,215,245,.55)"; ctx.beginPath(); ctx.moveTo(x - 46 * s, y + 4); ctx.lineTo(x - 20 * s, y + 46 * s); ctx.lineTo(x + 30 * s, y + 52 * s); ctx.lineTo(x + 50 * s, y + 4); ctx.closePath(); ctx.fill(); // under the water
    ctx.fillStyle = "#fff"; ink(4); ctx.beginPath(); ctx.moveTo(x - 46 * s, y + 4); ctx.lineTo(x - 30 * s, y - 34 * s); ctx.lineTo(x - 8 * s, y - 18 * s); ctx.lineTo(x + 6 * s, y - 52 * s); ctx.lineTo(x + 28 * s, y - 20 * s); ctx.lineTo(x + 50 * s, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#cfe8fb"; ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 52 * s); ctx.lineTo(x + 28 * s, y - 20 * s); ctx.lineTo(x + 50 * s, y + 4); ctx.lineTo(x + 8 * s, y + 4); ctx.closePath(); ctx.fill();
  }
}
function penguin(x, y, s, ph) {
  ctx.save(); ctx.translate(x, y + Math.abs(Math.sin(g.t * 1.6 + ph)) * -2); ctx.scale(s, s); ink(3);
  ctx.fillStyle = "#ff9f43"; ctx.beginPath(); ctx.ellipse(-6, 0, 6, 3, 0, 0, 7); ctx.ellipse(6, 0, 6, 3, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#22273a"; ctx.beginPath(); ctx.ellipse(0, -16, 12, 17, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(1, -13, 8, 12, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#22273a"; ctx.beginPath(); ctx.ellipse(-12, -14, 4, 10, 0.4, 0, 7); ctx.ellipse(12, -14, 4, 10, -0.4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff9f43"; ctx.beginPath(); ctx.moveTo(2, -26); ctx.lineTo(11, -24); ctx.lineTo(2, -21); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-1, -28, 3, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -28, 1.3, 0, 7); ctx.fill();
  ctx.restore();
}
function platformArctic() {
  const fl = shore();
  const gr = ctx.createLinearGradient(0, DECK_Y, 0, DECK_Y + 190); gr.addColorStop(0, "#eaf8ff"); gr.addColorStop(1, "rgba(90,170,235,.55)");
  ink(4); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-30, DECK_Y); ctx.lineTo(430, DECK_Y);
  for (let i = 0; i < 7; i++) { ctx.lineTo(430 - i * 54 - 14, DECK_Y + 90 + (i % 2) * 40); ctx.lineTo(430 - i * 54 - 40, DECK_Y + 40 + (i % 3) * 20); }
  ctx.lineTo(-30, DECK_Y + 100); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(120,180,230,.7)"; ctx.lineWidth = 2; for (const [x, y] of [[60, 26], [180, 40], [280, 24]]) { ctx.beginPath(); ctx.moveTo(x, DECK_Y + 6); ctx.lineTo(x + 8, DECK_Y + y); ctx.lineTo(x - 6, DECK_Y + y + 20); ctx.stroke(); }
  // snow cap on top
  ctx.fillStyle = "#fff"; ink(4); ctx.beginPath(); ctx.moveTo(-30, DECK_Y - 2); ctx.lineTo(430, DECK_Y - 2); for (let x = 430; x >= -30; x -= 20) ctx.lineTo(x, DECK_Y + 10 + (x % 40 ? 6 : 0)); ctx.closePath(); ctx.fill(); ctx.stroke();
  // igloo
  const ix = 20; ctx.fillStyle = "#f4fbff"; ink(4); ctx.beginPath(); ctx.arc(ix, DECK_Y, 66, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(120,170,215,.8)"; ctx.lineWidth = 2.5;
  for (const r of [22, 44]) { ctx.beginPath(); ctx.arc(ix, DECK_Y, r + 10, Math.PI, 0); ctx.stroke(); }
  for (const [a, b] of [[-50, -30], [-20, -6], [10, 30], [40, 56]]) { ctx.beginPath(); ctx.moveTo(ix + a, DECK_Y - 4); ctx.lineTo(ix + a - 6, DECK_Y - 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ix + b, DECK_Y - 34); ctx.lineTo(ix + b + 4, DECK_Y - 56); ctx.stroke(); }
  ctx.fillStyle = "#2b3a55"; ink(4); ctx.beginPath(); ctx.roundRect(ix + 40, DECK_Y - 36, 40, 36, [16, 16, 0, 0]); ctx.fill(); ctx.stroke(); // entrance
  ctx.fillStyle = "#f4fbff"; ctx.beginPath(); ctx.roundRect(ix + 34, DECK_Y - 42, 52, 12, 6); ctx.fill(); ctx.stroke();
  // penguins near the end of the ice
  penguin(262, DECK_Y + 4, 1, 0); penguin(292, DECK_Y + 4, 0.8, 1.3);
  lanternPost("#bfe9ff", "#8a6a4a");
}

// ---------- VOLCANO: basalt pier ----------
function farVolcano() {
  // distant smaller volcano
  ink(4); ctx.fillStyle = "#4a3540"; ctx.beginPath(); ctx.moveTo(W * 0.14, WATER_Y); ctx.lineTo(W * 0.22, WATER_Y - 96); ctx.lineTo(W * 0.245, WATER_Y - 96); ctx.lineTo(W * 0.34, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  // main volcano
  const cx = W * 0.66, top = WATER_Y - 210;
  const sh = ctx.createLinearGradient(cx - 300, 0, cx + 300, 0); sh.addColorStop(0, "#5a4048"); sh.addColorStop(1, "#2c1f26");
  ink(4); ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(cx - 320, WATER_Y); ctx.lineTo(cx - 76, top + 14); ctx.quadraticCurveTo(cx, top - 12, cx + 76, top + 14); ctx.lineTo(cx + 320, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  // lava rivers
  for (const [dx, ex, w] of [[-20, -90, 7], [14, 40, 9], [30, 190, 6]]) {
    const path = () => { ctx.beginPath(); ctx.moveTo(cx + dx, top + 8); ctx.bezierCurveTo(cx + dx + (ex - dx) * 0.2, top + 80, cx + ex * 0.9, WATER_Y - 90, cx + ex, WATER_Y - 6); };
    ctx.strokeStyle = INK; ctx.lineWidth = w + 5; ctx.lineCap = "round"; path(); ctx.stroke();
    ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 14; ctx.strokeStyle = "#ff9a3a"; ctx.lineWidth = w; path(); ctx.stroke(); ctx.strokeStyle = "#ffd070"; ctx.lineWidth = w * 0.35; path(); ctx.stroke(); ctx.restore();
  }
  // crater glow + smoke plume + sparks
  const gl = ctx.createRadialGradient(cx, top + 6, 4, cx, top + 6, 120); gl.addColorStop(0, "rgba(255,150,60,.9)"); gl.addColorStop(1, "rgba(255,90,30,0)");
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, top + 6, 120, 0, 7); ctx.fill();
  for (let i = 0; i < 9; i++) { const ph = (g.t * 0.12 + i / 9) % 1; ctx.fillStyle = `rgba(70,55,62,${0.8 * (1 - ph)})`; ctx.beginPath(); ctx.arc(cx + Math.sin(ph * 4 + i) * 18 + ph * 90, top - ph * 150, 18 + ph * 38, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#ffb04a"; for (let i = 0; i < 14; i++) { const ph = (g.t * 0.5 + i * 0.37) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(cx + Math.sin(i * 3.1) * 60 + (i % 2 ? 1 : -1) * ph * 60, top - ph * 130 + ph * ph * 80, 2.4, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  // black rock islands
  ctx.fillStyle = "#2a2028"; ink(4); for (const [x, w, h] of [[W * 0.05, 90, 34], [W * 0.4, 70, 26], [W * 0.92, 100, 40]]) { ctx.beginPath(); ctx.moveTo(x - w, WATER_Y + 4); ctx.lineTo(x - w * 0.5, WATER_Y - h); ctx.lineTo(x, WATER_Y - h * 0.6); ctx.lineTo(x + w * 0.6, WATER_Y - h * 1.1); ctx.lineTo(x + w, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}
function platformVolcano() {
  const fl = shore();
  for (const px of [40, 170, 296, 420]) { // basalt columns down to the sea floor
    ctx.fillStyle = "#2a2430"; ink(4); ctx.fillRect(px - 16, DECK_Y + 16, 32, fl - DECK_Y - 12); ctx.strokeRect(px - 16, DECK_Y + 16, 32, fl - DECK_Y - 12);
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 2; for (let y = DECK_Y + 40; y < fl; y += 46) { ctx.beginPath(); ctx.moveTo(px - 16, y); ctx.lineTo(px + 16, y + 6); ctx.stroke(); }
    const lg = ctx.createRadialGradient(px, fl, 2, px, fl, 60); lg.addColorStop(0, "rgba(255,120,40,.7)"); lg.addColorStop(1, "rgba(255,120,40,0)"); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(px, fl, 60, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = "#3a3340"; ink(4); ctx.fillRect(-30, DECK_Y, 460, 20); ctx.strokeRect(-30, DECK_Y, 460, 20);
  ctx.fillStyle = "#4b4356"; ctx.fillRect(-30, DECK_Y, 460, 6);
  // glowing lava cracks in the slab
  ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 10; ctx.strokeStyle = "#ff9a3a"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (const [x, y] of [[20, 4], [110, 8], [200, 3], [290, 8]]) { ctx.beginPath(); ctx.moveTo(x, DECK_Y + y); ctx.lineTo(x + 18, DECK_Y + y + 6); ctx.lineTo(x + 34, DECK_Y + y + 2); ctx.lineTo(x + 46, DECK_Y + y + 9); ctx.stroke(); }
  ctx.restore();
  // a stack of black rocks and a skull-topped post
  ctx.fillStyle = "#231d29"; ink(4); ctx.beginPath(); ctx.moveTo(-30, DECK_Y); ctx.lineTo(-10, DECK_Y - 70); ctx.lineTo(24, DECK_Y - 40); ctx.lineTo(46, DECK_Y - 60); ctx.lineTo(74, DECK_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 8; ctx.strokeStyle = "#ff9a3a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-4, DECK_Y - 60); ctx.lineTo(8, DECK_Y - 34); ctx.lineTo(0, DECK_Y - 12); ctx.moveTo(40, DECK_Y - 54); ctx.lineTo(48, DECK_Y - 26); ctx.stroke(); ctx.restore();
  // torch on the post at the end
  lanternPost("#3a2a20", "#4a2c1c");
  const fx = 322, fy = DECK_Y - 158, fl2 = 1 + Math.sin(g.t * 12) * 0.12;
  ctx.fillStyle = "#ff8a2f"; ink(3); ctx.beginPath(); ctx.moveTo(fx - 12, fy + 12); ctx.quadraticCurveTo(fx - 16, fy - 14 * fl2, fx, fy - 30 * fl2); ctx.quadraticCurveTo(fx + 16, fy - 14 * fl2, fx + 12, fy + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffd070"; ctx.beginPath(); ctx.moveTo(fx - 6, fy + 10); ctx.quadraticCurveTo(fx - 8, fy - 4, fx, fy - 14 * fl2); ctx.quadraticCurveTo(fx + 8, fy - 4, fx + 6, fy + 10); ctx.closePath(); ctx.fill();
}

// ---------- SNOWY FOREST: frozen pine forest with a snow-covered dock ----------
function snowyPine(x, y, h, col) {
  ctx.fillStyle = "#6b4423"; ink(2.5); ctx.fillRect(x - 2.5, y - 6, 5, 8);
  for (let k = 0; k < 3; k++) {
    const by = y - 6 - k * h * 0.28, w = 14 - k * 3.5, tipY = by - h * 0.42;
    ctx.fillStyle = col; ink(2.5); ctx.beginPath(); ctx.moveTo(x, tipY); ctx.lineTo(x + w, by); ctx.lineTo(x - w, by); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x, tipY); ctx.lineTo(x + w * 0.62, by - (by - tipY) * 0.4); ctx.quadraticCurveTo(x, by - (by - tipY) * 0.52, x - w * 0.62, by - (by - tipY) * 0.4); ctx.closePath(); ctx.fill();
  }
}
function farForest() {
  const pk = [[0, 55], [.1, 100], [.22, 60], [.34, 120], [.47, 72], [.6, 110], [.74, 62], [.88, 98], [1, 55]].map(([xf, h]) => [xf * W, WATER_Y - h]);
  ink(4); ctx.fillStyle = "#c8d9ec"; ctx.beginPath(); pk.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(W, WATER_Y); ctx.lineTo(0, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const i of [1, 3, 5, 7]) snowCap(pk[i][0], pk[i][1], 24);
  for (const [amp, base, col, treeCol, step, hh] of [[16, 46, "#e6f0fa", "#1f5f45", 22, 34], [12, 20, "#f5f9fd", "#2a6f50", 27, 40]]) {
    const hy = x => WATER_Y - base - Math.sin(x / 90 + base) * amp - Math.sin(x / 31) * 4;
    ctx.fillStyle = col; ink(4); ctx.beginPath(); ctx.moveTo(0, WATER_Y + 4); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, hy(x)); ctx.lineTo(W, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let x = 10 + base; x < W; x += step) snowyPine(x, hy(x) + 2, hh + ((x * 7) % 13), treeCol);
  }
  const mist = ctx.createLinearGradient(0, WATER_Y - 50, 0, WATER_Y + 4); mist.addColorStop(0, "rgba(255,255,255,0)"); mist.addColorStop(1, "rgba(255,255,255,.5)");
  ctx.fillStyle = mist; ctx.fillRect(0, WATER_Y - 50, W, 54);
  // ice sheets along the shore of the lake
  ctx.fillStyle = "rgba(255,255,255,.9)"; ink(3);
  for (const [x, rx] of [[W * 0.08, 70], [W * 0.33, 90], [W * 0.58, 60], [W * 0.82, 100]]) { ctx.beginPath(); ctx.ellipse(x, WATER_Y + 3, rx, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}
function platformForest() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) {
    ctx.fillStyle = "#6b4a2a"; ink(4); ctx.fillRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); ctx.strokeRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12);
    ctx.fillStyle = "#e8f6ff"; ctx.beginPath(); ctx.ellipse(px, DECK_Y + 24, 13, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = "#b07a44"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.lineWidth = 3; for (let x = 30; x < 420; x += 44) { ctx.beginPath(); ctx.moveTo(x, DECK_Y); ctx.lineTo(x, DECK_Y + 18); ctx.stroke(); }
  // icicles under the deck
  ctx.fillStyle = "#cfeaff"; ink(2.5); for (let x = 0; x < 420; x += 34) { const h = 10 + ((x * 7) % 14); ctx.beginPath(); ctx.moveTo(x - 5, DECK_Y + 18); ctx.lineTo(x + 5, DECK_Y + 18); ctx.lineTo(x, DECK_Y + 18 + h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // a soft blanket of snow on the planks
  ctx.fillStyle = "#fff"; ink(4); ctx.beginPath(); ctx.moveTo(-10, DECK_Y + 3);
  for (let x = -10; x < 420; x += 22) ctx.quadraticCurveTo(x + 11, DECK_Y - 6, x + 22, DECK_Y + 3);
  ctx.lineTo(420, DECK_Y + 9); ctx.lineTo(-10, DECK_Y + 9); ctx.closePath(); ctx.fill(); ctx.stroke();
  // snowman keeping watch
  const sx = 272, sy = DECK_Y;
  ink(3.5); ctx.fillStyle = "#fff";
  for (const [dy, r] of [[-16, 17], [-41, 12.5], [-59, 9.5]]) { ctx.beginPath(); ctx.arc(sx, sy + dy, r, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = "#6b4423"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy - 42); ctx.lineTo(sx - 26, sy - 54); ctx.moveTo(sx, sy - 42); ctx.lineTo(sx + 22, sy - 32); ctx.stroke();
  ctx.fillStyle = INK; for (const [ex, ey] of [[4, -62], [4, -56]]) { ctx.beginPath(); ctx.arc(sx + ex + 2, sy + ey + 0, 1.8, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(sx + 1, sy - 41, 1.8, 0, 7); ctx.arc(sx + 1, sy - 33, 1.8, 0, 7); ctx.fill();
  ctx.fillStyle = "#ff8a2a"; ink(2); ctx.beginPath(); ctx.moveTo(sx + 8, sy - 60); ctx.lineTo(sx + 24, sy - 57); ctx.lineTo(sx + 8, sy - 55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e23a3a"; ink(3); ctx.beginPath(); ctx.roundRect(sx - 12, sy - 51, 24, 6, 3); ctx.fill(); ctx.stroke(); ctx.fillRect(sx - 10, sy - 47, 6, 14); ctx.strokeRect(sx - 10, sy - 47, 6, 14);
  ctx.fillStyle = "#22252f"; ink(3); ctx.fillRect(sx - 9, sy - 76, 18, 12); ctx.strokeRect(sx - 9, sy - 76, 18, 12); ctx.beginPath(); ctx.ellipse(sx, sy - 65, 14, 3.5, 0, 0, 7); ctx.fill(); ctx.stroke();
  lanternPost("#ffe066", "#6b4a2a");
  ctx.fillStyle = "#fff"; ink(2.5); ctx.beginPath(); ctx.ellipse(322, DECK_Y - 163, 16, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
}

// ---------- underwater pieces for the other maps ----------
const MAP_ITEMS = {
  reed(r, y) {
    for (const [c, w] of [[INK, 6 * r.s], ["#4aa14f", 3.2 * r.s]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); for (let b = -2; b <= 2; b++) { const h = (70 + (b % 2) * 22 - Math.abs(b) * 6) * r.s, sw = Math.sin(g.t * 1.3 + r.ph + b) * 6 * r.s; ctx.moveTo(r.x + b * 7 * r.s, y); ctx.quadraticCurveTo(r.x + b * 7 * r.s + sw * 0.3, y - h * 0.5, r.x + b * 8 * r.s + sw, y - h); } ctx.stroke(); }
    ctx.fillStyle = "#7a4a2a"; ink(2.5); for (const b of [-1, 1]) { ctx.beginPath(); ctx.roundRect(r.x + b * 8 * r.s - 3.5 * r.s + Math.sin(g.t * 1.3 + r.ph + b) * 6 * r.s, y - 58 * r.s, 7 * r.s, 20 * r.s, 3); ctx.fill(); ctx.stroke(); }
  },
  log(r, y) { ink(4); ctx.fillStyle = "#7a5230"; ctx.beginPath(); ctx.roundRect(r.x - 50 * r.s, y - 24 * r.s, 100 * r.s, 22 * r.s, 10 * r.s); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#b98a55"; ctx.beginPath(); ctx.ellipse(r.x + 50 * r.s, y - 13 * r.s, 6 * r.s, 11 * r.s, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x - 40 * r.s, y - 16 * r.s); ctx.lineTo(r.x + 30 * r.s, y - 16 * r.s); ctx.stroke(); ctx.fillStyle = "#4aa14f"; ctx.beginPath(); ctx.ellipse(r.x - 20 * r.s, y - 24 * r.s, 22 * r.s, 5 * r.s, 0, 0, 7); ctx.fill(); },
  rock(r, y) { ink(4); ctx.fillStyle = "#77857a"; ctx.beginPath(); ctx.ellipse(r.x, y - 4, 32 * r.s, 22 * r.s, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#4aa14f"; ctx.beginPath(); ctx.ellipse(r.x - 6 * r.s, y - 22 * r.s, 18 * r.s, 6 * r.s, 0, Math.PI, 0); ctx.fill(); },
  icecrystal(r, y) {
    for (const [dx, h, w, c] of [[-16, 34, 9, "#9fd8ff"], [0, 58, 12, "#c6ecff"], [16, 40, 10, "#8ccaf5"], [30, 22, 7, "#b6e3ff"]]) {
      ink(3.5); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(r.x + dx * r.s - w * r.s, y); ctx.lineTo(r.x + dx * r.s - w * 0.7 * r.s, y - h * r.s * 0.8); ctx.lineTo(r.x + dx * r.s, y - h * r.s); ctx.lineTo(r.x + dx * r.s + w * 0.7 * r.s, y - h * r.s * 0.8); ctx.lineTo(r.x + dx * r.s + w * r.s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x + dx * r.s - w * 0.3 * r.s, y - 4); ctx.lineTo(r.x + dx * r.s - w * 0.25 * r.s, y - h * r.s * 0.7); ctx.stroke();
    }
  },
  vent(r, y) {
    ink(4); ctx.fillStyle = "#2c2431"; ctx.beginPath(); ctx.moveTo(r.x - 26 * r.s, y); ctx.lineTo(r.x - 10 * r.s, y - 50 * r.s); ctx.lineTo(r.x + 10 * r.s, y - 50 * r.s); ctx.lineTo(r.x + 26 * r.s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    const gl = ctx.createRadialGradient(r.x, y - 52 * r.s, 2, r.x, y - 52 * r.s, 42 * r.s); gl.addColorStop(0, "rgba(255,150,60,.9)"); gl.addColorStop(1, "rgba(255,90,30,0)"); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(r.x, y - 52 * r.s, 42 * r.s, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const ph = (g.t * 0.7 + i * 0.25 + r.ph) % 1; ctx.beginPath(); ctx.arc(r.x + Math.sin(ph * 8 + i) * 8, y - 56 * r.s - ph * 110, 3 + ph * 3, 0, 7); ctx.stroke(); }
  },
  lavarock(r, y) {
    ink(4); ctx.fillStyle = "#2a2028"; ctx.beginPath(); ctx.moveTo(r.x - 34 * r.s, y); ctx.lineTo(r.x - 20 * r.s, y - 30 * r.s); ctx.lineTo(r.x - 2 * r.s, y - 24 * r.s); ctx.lineTo(r.x + 16 * r.s, y - 40 * r.s); ctx.lineTo(r.x + 36 * r.s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 8; ctx.strokeStyle = "#ff9a3a"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(r.x - 14 * r.s, y - 4); ctx.lineTo(r.x - 4 * r.s, y - 20 * r.s); ctx.lineTo(r.x + 6 * r.s, y - 12 * r.s); ctx.lineTo(r.x + 16 * r.s, y - 30 * r.s); ctx.stroke(); ctx.restore();
  },
  blackcoral(r, y) { coralBranch(r.x, y, r.s, "#3a2530", r.ph); ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 8; ctx.fillStyle = "#ffb04a"; for (const [dx, dy] of [[-30, 64], [-10, 76], [16, 70], [32, 60]]) { ctx.beginPath(); ctx.arc(r.x + dx * r.s, y - dy * r.s, 3 * r.s, 0, 7); ctx.fill(); } ctx.restore(); },
  ember(r, y) { ctx.save(); ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 12; ctx.fillStyle = "#ffb04a"; ctx.beginPath(); ctx.arc(r.x, y - 8 - Math.sin(g.t * 2 + r.ph) * 6, 5 * r.s, 0, 7); ctx.fill(); ctx.restore(); },
};

function lilyPad(x, s, ph) {
  const y = WATER_Y + 2 + Math.sin(g.t * 1.2 + ph) * 1.5;
  ink(3); ctx.fillStyle = "#4fbf5a"; ctx.beginPath(); ctx.ellipse(x, y, 26 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a9f48"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26 * s, y - 2 * s); ctx.lineTo(x + 20 * s, y + 4 * s); ctx.closePath(); ctx.fill();
  if (ph > 3) { ctx.fillStyle = "#ffb3d9"; ctx.beginPath(); ctx.ellipse(x - 6 * s, y - 8 * s, 6 * s, 9 * s, 0, 0, 7); ctx.ellipse(x + 6 * s, y - 8 * s, 6 * s, 9 * s, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(x, y - 7 * s, 3.5 * s, 0, 7); ctx.fill(); }
}

// ---------- map definitions ----------
const BAY_COLS = ["#ff5fa2", "#ff9f43", "#ffd23f", "#b45cff", "#4d9dff", "#3ddc97", "#ff6b6b", "#ffa8d1", "#2ec4b6"];
const MAPS = {
  bay: {
    id: "bay", name: "Sunny Bay", price: 0, mult: 1, weather: { name: "RAIN", kind: "rain", color: "200,225,255" },
    blurb: "A sunny tropical bay with a huge colourful coral reef.",
    sky: null, sand: "#e6c777", rock: "#8c99ab", kelpCol: "#1e9e5a", wreck: true, front: "rgba(40,150,240,.3)",
    water: [[0, "#3ec1ff"], [0.22, "#2288e2"], [0.55, "#1250b0"], [1, "#071a55"]],
    drawFar() { drawMountains(); drawBoat(); }, drawPlatform() { drawDock(); },
    eco: {
      reef: [["branch", 26], ["brain", 12], ["fan", 9], ["tube", 12], ["table", 8], ["anemone", 8], ["sponge", 7], ["clam", 3], ["urchin", 6], ["star", 6], ["grass", 14]], cols: BAY_COLS, kelp: 12, grassCol: "#43c86a",
      schools: [
        { n: "Sardine", count: 16, depth: 0.16, tint: "#cfe0f0", len: 30 }, { n: "Minnow", count: 14, depth: 0.28, tint: "#9bd4ff", len: 26 }, { n: "Trout", count: 8, depth: 0.4, tint: "#ff9fb8", len: 52 },
        { n: "Perch", count: 10, depth: 0.52, tint: "#ffb84d", len: 40 }, { n: "Bluegill", count: 8, depth: 0.66, tint: "#ffd94a", len: 44 }, { n: "Clownfish", count: 7, depth: 0.86, tint: "#ff8a1f", len: 34 }, { n: "Sardine", count: 12, depth: 0.74, tint: "#ffc2e0", len: 32 },
      ],
      residents: [
        { n: "Bluegill", col: "#ffd23f", deco: "stripes", len: 46 }, { n: "Bluegill", col: "#4d9dff", deco: "ear", len: 44 }, { n: "Perch", col: "#3ddc97", deco: "stripes", len: 44 }, { n: "Perch", col: "#4d7cff", deco: "glint", len: 46 },
        { n: "Clownfish", col: "#fff2a8", deco: "clown", len: 40 }, { n: "Clownfish", col: "#ff5fa2", deco: "clown", len: 36 }, { n: "Bass", col: "#ff8fab", deco: "lateral", len: 58 }, { n: "Bass", col: "#b45cff", deco: "spots", len: 56 },
        { n: "Trout", col: "#ff9f43", deco: "spots", len: 54 }, { n: "Trout", col: "#2ec4b6", deco: "glint", len: 50 }, { n: "Minnow", col: "#ffe066", deco: "glint", len: 30 }, { n: "Minnow", col: "#ff6b6b", deco: "glint", len: 30 },
        { n: "Salmon", col: "#ffb84d", deco: "stripes", len: 64 }, { n: "Lionfish", col: "#e8503a", deco: "stripes", len: 60 },
      ],
      roam: [{ name: "Manta Ray", len: 190, dy: 0.62, v: 22, alpha: 0.75 }, { name: "Shark", len: 170, dy: 0.5, v: 40, alpha: 0.8, pred: true }, { name: "Giant Whale", len: 380, dy: 0.82, v: 9, alpha: 0.3 }],
      turtles: 2, crabs: 3, crabCol: "#ff5a4a", jellies: 6, jellyCols: ["#ff8fc8", "#b6a0ff", "#9be8ff"], seahorses: 3,
    },
  },
  lake: {
    id: "lake", name: "Cabin Lake", bob: { amp: 3.5, speed: 1.3, tilt: 0.03 }, price: 20000, mult: 1.4, weather: { name: "RAIN", kind: "rain", color: "200,225,255" },
    blurb: "Fish from your boat, moored beside your cosy log cabin on a calm forest lake.",
    sky: { top: [104, 178, 214], bot: [214, 236, 226], amt: 0.35 }, sand: "#9c8558", rock: "#6f7d6a", kelpCol: "#3f9a4a", front: "rgba(50,150,150,.3)",
    water: [[0, "#4fc2b8"], [0.25, "#2b93a0"], [0.6, "#155f7a"], [1, "#0a2f47"]],
    drawFar: farLake, drawPlatform: platformLake,
    eco: {
      reef: [["reed", 16], ["grass", 26], ["log", 6], ["rock", 12]], cols: ["#4aa14f", "#67c26a", "#3f8f5a"], kelp: 10, grassCol: "#4aa14f", surface: 9,
      schools: [
        { n: "Minnow", count: 14, depth: 0.18, tint: "#a9d8e8", len: 26 }, { n: "Perch", count: 10, depth: 0.38, tint: "#e6c25a", len: 40 }, { n: "Trout", count: 8, depth: 0.5, tint: "#9fc0d8", len: 50 },
        { n: "Bluegill", count: 8, depth: 0.62, tint: "#5fb0a0", len: 42 }, { n: "Koi", count: 5, depth: 0.3, tint: "#fff5e6", len: 56 },
      ],
      residents: [
        { n: "Bluegill", col: "#5fb0a0", deco: "ear", len: 46 }, { n: "Bluegill", col: "#e6c25a", deco: "ear", len: 44 }, { n: "Perch", col: "#8ac36a", deco: "stripes", len: 46 }, { n: "Bass", col: "#4c9a4e", deco: "lateral", len: 62 },
        { n: "Koi", col: "#fff", deco: "koi", len: 70 }, { n: "Koi", col: "#ffd9a0", deco: "koi", len: 66 }, { n: "Trout", col: "#7fb8d8", deco: "spots", len: 56 }, { n: "Walleye", col: "#c7b86a", deco: "lateral", len: 62 },
      ],
      roam: [{ name: "Pike", len: 120, dy: 0.45, v: 42, alpha: 0.8, pred: true }, { name: "Sturgeon", len: 180, dy: 0.78, v: 14, alpha: 0.65 }, { name: "Catfish", len: 110, dy: 0.86, v: 12, alpha: 0.7 }],
      turtles: 3, crabs: 2, crabCol: "#c0613a", jellies: 0, jellyCols: [], seahorses: 0,
    },
  },
  arctic: {
    id: "arctic", name: "Frozen Sea", bob: { amp: 5, speed: 0.9, tilt: 0.022, whole: true, bucket: true }, price: 30000, mult: 2, weather: { name: "SNOW", kind: "snow", color: "255,255,255" },
    blurb: "An icy polar sea with glaciers, penguins, aurora nights and giant whales.",
    sky: { top: [150, 200, 240], bot: [225, 240, 252], amt: 0.5 }, sand: "#dbe8f3", rock: "#9fb6cc", kelpCol: "#8a6fd0", front: "rgba(80,170,240,.3)",
    water: [[0, "#5fd0f0"], [0.22, "#2a98d8"], [0.55, "#135a9e"], [1, "#061a4a"]],
    drawFar: farArctic, drawPlatform: platformArctic, drawSkyExtra: aurora,
    eco: {
      reef: [["icecrystal", 24], ["grass", 14], ["star", 8], ["urchin", 6], ["sponge", 6], ["clam", 3]], cols: ["#9fd8ff", "#c6a8ff", "#ffffff", "#7ec8ff", "#e6b8ff"], kelp: 9, grassCol: "#9a6fd0",
      schools: [
        { n: "Sardine", count: 16, depth: 0.16, tint: "#dcecff", len: 30 }, { n: "Arctic Char", count: 10, depth: 0.32, tint: "#9fd3ff", len: 44 }, { n: "Minnow", count: 12, depth: 0.5, tint: "#c6e6ff", len: 26 },
        { n: "Cod", count: 8, depth: 0.66, tint: "#9aa88a", len: 54 }, { n: "Sardine", count: 12, depth: 0.8, tint: "#b8b0ff", len: 30 },
      ],
      residents: [
        { n: "Arctic Char", col: "#7ac0ff", deco: "spots", len: 52 }, { n: "Arctic Char", col: "#c6a8ff", deco: "spots", len: 50 }, { n: "Cod", col: "#8ab0c0", deco: "spots", len: 62 }, { n: "Trout", col: "#a0d4ff", deco: "glint", len: 56 },
        { n: "Minnow", col: "#e8f6ff", deco: "glint", len: 32 }, { n: "Minnow", col: "#b6a0ff", deco: "glint", len: 30 },
      ],
      roam: [{ name: "Orca", len: 220, dy: 0.5, v: 34, alpha: 0.8, pred: true }, { name: "Beluga", len: 210, dy: 0.7, v: 12, alpha: 0.6 }, { name: "Narwhal", len: 200, dy: 0.84, v: 10, alpha: 0.5 }],
      turtles: 0, crabs: 2, crabCol: "#ff9a7a", jellies: 6, jellyCols: ["#bfe9ff", "#d0c0ff", "#ffffff"], seahorses: 0,
    },
  },
  forest: {
    id: "forest", name: "Snowy Forest", price: 25000, mult: 1.7, weather: { name: "SNOW", kind: "snow", color: "255,255,255" },
    blurb: "A frozen pine forest lake where it snows instead of rains. A snowman keeps you company.",
    sky: { top: [136, 174, 206], bot: [228, 238, 247], amt: 0.55 }, sand: "#cfd8de", rock: "#8da1b3", kelpCol: "#3f8a7a", front: "rgba(70,150,190,.3)",
    water: [[0, "#5fb8d8"], [0.22, "#2b83b0"], [0.55, "#14507a"], [1, "#07203f"]],
    drawFar: farForest, drawPlatform: platformForest,
    eco: {
      reef: [["icecrystal", 10], ["grass", 24], ["log", 8], ["rock", 14], ["star", 4]], cols: ["#9fd8ff", "#7fc6a8", "#d8f0ff", "#8fb8d8"], kelp: 8, grassCol: "#4a9a86",
      schools: [
        { n: "Minnow", count: 14, depth: 0.18, tint: "#c6e6ff", len: 26 }, { n: "Frost Perch", count: 10, depth: 0.34, tint: "#bfe6ff", len: 42 }, { n: "Arctic Char", count: 9, depth: 0.5, tint: "#9fd3ff", len: 44 },
        { n: "Trout", count: 8, depth: 0.64, tint: "#a6c8e0", len: 50 }, { n: "Perch", count: 8, depth: 0.78, tint: "#c8d8a0", len: 40 },
      ],
      residents: [
        { n: "Frost Perch", col: "#bfe6ff", deco: "stripes", len: 50 }, { n: "Arctic Char", col: "#7ac0ff", deco: "spots", len: 52 }, { n: "Trout", col: "#a0d4ff", deco: "spots", len: 56 },
        { n: "Walleye", col: "#b6c88a", deco: "lateral", len: 60 }, { n: "Minnow", col: "#e8f6ff", deco: "glint", len: 30 }, { n: "Perch", col: "#8fd0b8", deco: "stripes", len: 46 },
      ],
      roam: [{ name: "Icicle Pike", len: 120, dy: 0.45, v: 42, alpha: 0.8, pred: true }, { name: "Crystal Sturgeon", len: 180, dy: 0.76, v: 14, alpha: 0.6 }, { name: "Frost Serpent", len: 240, dy: 0.86, v: 16, alpha: 0.45 }],
      turtles: 0, crabs: 2, crabCol: "#d98a6a", jellies: 0, jellyCols: [], seahorses: 0,
    },
  },
  volcano: {
    id: "volcano", name: "Ember Isle", price: 50000, mult: 3, noWeather: true, weather: { name: "EMBER STORM", kind: "ember", color: "255,176,74" },
    blurb: "A volcanic island with lava rivers, glowing vents and fiery deep-sea monsters.",
    sky: { top: [110, 34, 40], bot: [255, 138, 60], amt: 0.78 }, sand: "#3a2f38", rock: "#2a2028", kelpCol: "#5b2a3a", front: "rgba(200,60,40,.22)", wreck: true,
    water: [[0, "#e06a3a"], [0.12, "#3a5a9a"], [0.5, "#1a2a5a"], [1, "#0a0f2a"]],
    drawFar: farVolcano, drawPlatform: platformVolcano,
    eco: {
      reef: [["vent", 10], ["lavarock", 18], ["blackcoral", 16], ["urchin", 8], ["star", 6], ["ember", 10]], cols: ["#ff5a2a", "#ffb02a", "#c0392b", "#5b2a3a", "#ff7a2f"], kelp: 0, grassCol: "#5b2a3a",
      schools: [
        { n: "Sardine", count: 14, depth: 0.2, tint: "#ffb27a", len: 30 }, { n: "Minnow", count: 12, depth: 0.4, tint: "#ff8a5a", len: 26 }, { n: "Perch", count: 9, depth: 0.6, tint: "#c44a3a", len: 40 },
        { n: "Sardine", count: 12, depth: 0.8, tint: "#ffd070", len: 30 },
      ],
      residents: [
        { n: "Bass", col: "#d0402a", deco: "lateral", len: 62 }, { n: "Bass", col: "#ffb02a", deco: "spots", len: 58 }, { n: "Perch", col: "#ff7a2f", deco: "stripes", len: 46 }, { n: "Trout", col: "#8a2a3a", deco: "spots", len: 54 },
        { n: "Minnow", col: "#ffd070", deco: "glint", len: 30 }, { n: "Minnow", col: "#ff5a2a", deco: "glint", len: 30 },
      ],
      roam: [{ name: "Obsidian Shark", len: 180, dy: 0.5, v: 40, alpha: 0.85, pred: true }, { name: "Cinder Ray", len: 190, dy: 0.66, v: 20, alpha: 0.75 }, { name: "Lava Eel", len: 160, dy: 0.8, v: 18, alpha: 0.8 }],
      turtles: 0, crabs: 3, crabCol: "#8a2a1a", jellies: 3, jellyCols: ["#ff9a3a", "#ff5a5a"], seahorses: 0,
    },
  },
};

// ---------- map pictures for the shop ----------
function drawMapIcon(c, id) {
  const M = MAPS[id], w = 200, h = 110, wy = 62;
  const sk = { bay: ["#58bfff", "#d8f3ff"], lake: ["#68b2d6", "#d6ece2"], forest: ["#8cb4d8", "#e4eef8"], arctic: ["#96c8f0", "#e1f0fc"], volcano: ["#6e2228", "#ff8a3c"] }[id];
  const g1 = c.createLinearGradient(0, 0, 0, wy); g1.addColorStop(0, sk[0]); g1.addColorStop(1, sk[1]); c.fillStyle = g1; c.fillRect(0, 0, w, h);
  c.lineJoin = "round"; c.lineWidth = 2.5; c.strokeStyle = INK;
  const tri = (x, y, bw, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - bw, wy); c.lineTo(x, y); c.lineTo(x + bw, wy); c.closePath(); c.fill(); c.stroke(); };
  const pine = (x, y, s, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 14 * s); c.lineTo(x + 6 * s, y); c.lineTo(x - 6 * s, y); c.closePath(); c.fill(); };
  if (id === "bay") { tri(50, 22, 44, "#a9bdf0"); tri(140, 30, 50, "#a9bdf0"); c.fillStyle = "#63d276"; c.beginPath(); c.ellipse(100, wy + 2, 110, 12, 0, Math.PI, 0); c.fill(); c.stroke(); for (const x of [30, 70, 120, 165]) pine(x, wy - 8, 1, "#1f9d55"); }
  if (id === "lake") { tri(60, 24, 50, "#93b5d8"); tri(150, 32, 46, "#93b5d8"); c.fillStyle = "#3f8f5a"; c.beginPath(); c.ellipse(100, wy + 4, 110, 16, 0, Math.PI, 0); c.fill(); c.stroke(); for (let x = 10; x < 200; x += 16) pine(x, wy - 6, 1.1, "#1f6e45"); }
  if (id === "arctic") { tri(40, 20, 42, "#cfe3f7"); tri(120, 12, 56, "#e6f0fb"); tri(180, 32, 30, "#cfe3f7"); c.fillStyle = "rgba(90,255,170,.35)"; c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(60, 0, 120, 16); c.quadraticCurveTo(160, 26, 200, 10); c.lineTo(200, 30); c.quadraticCurveTo(140, 44, 90, 30); c.quadraticCurveTo(40, 20, 0, 34); c.closePath(); c.fill(); }
  if (id === "volcano") { c.fillStyle = "#3b2b33"; c.beginPath(); c.moveTo(40, wy); c.lineTo(88, 22); c.lineTo(114, 22); c.lineTo(170, wy); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "#ff9a3a"; c.lineWidth = 3; c.beginPath(); c.moveTo(98, 24); c.lineTo(88, 48); c.lineTo(96, wy); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.5; c.fillStyle = "rgba(255,140,60,.8)"; c.beginPath(); c.arc(101, 20, 9, 0, 7); c.fill(); c.fillStyle = "rgba(80,60,66,.7)"; c.beginPath(); c.arc(112, 8, 9, 0, 7); c.arc(122, 2, 7, 0, 7); c.fill(); }
  if (id === "forest") { tri(46, 24, 46, "#c8d9ec"); tri(150, 30, 52, "#c8d9ec"); c.fillStyle = "#f2f8fd"; c.beginPath(); c.ellipse(100, wy + 4, 112, 16, 0, Math.PI, 0); c.fill(); c.stroke(); for (let x = 8; x < 200; x += 15) { pine(x, wy - 6, 1.15, "#1f5f45"); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(x, wy - 22); c.lineTo(x + 4, wy - 15); c.lineTo(x - 4, wy - 15); c.closePath(); c.fill(); } }
  const gw = c.createLinearGradient(0, wy, 0, h); for (const [s, col] of M.water) gw.addColorStop(s, col); c.fillStyle = gw; c.fillRect(0, wy, w, h - wy);
  c.beginPath(); c.moveTo(0, wy); c.lineTo(w, wy); c.stroke();
  // platform
  if (id === "bay") { c.fillStyle = "#d9954f"; c.fillRect(120, wy - 4, 90, 8); c.strokeRect(120, wy - 4, 90, 8); c.fillStyle = "#7a4a1d"; for (const x of [132, 170]) { c.fillRect(x, wy + 4, 6, 40); } }
  if (id === "lake") { c.fillStyle = "#8f5f30"; c.fillRect(6, wy - 26, 40, 26); c.strokeRect(6, wy - 26, 40, 26); c.fillStyle = "#5b3a1c"; c.beginPath(); c.moveTo(0, wy - 26); c.lineTo(26, wy - 46); c.lineTo(52, wy - 26); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#8a5a2b"; c.beginPath(); c.moveTo(70, wy - 2); c.lineTo(160, wy - 2); c.lineTo(174, wy - 10); c.lineTo(150, wy + 18); c.lineTo(84, wy + 18); c.closePath(); c.fill(); c.stroke(); }
  if (id === "arctic") { c.fillStyle = "#eaf8ff"; c.fillRect(100, wy - 4, 110, 12); c.strokeRect(100, wy - 4, 110, 12); c.fillStyle = "#f4fbff"; c.beginPath(); c.arc(140, wy - 4, 20, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); }
  if (id === "forest") { c.fillStyle = "#b07a44"; c.fillRect(100, wy - 4, 110, 10); c.strokeRect(100, wy - 4, 110, 10); c.fillStyle = "#fff"; c.beginPath(); c.roundRect(100, wy - 8, 110, 6, 3); c.fill(); c.fillStyle = "#7a4a1d"; for (const x of [112, 150, 188]) c.fillRect(x, wy + 6, 8, 38); c.fillStyle = "#fff"; ol(c, 2); c.beginPath(); c.arc(160, wy - 14, 7, 0, 7); c.arc(160, wy - 26, 5, 0, 7); c.fill(); c.stroke(); }
  if (id === "volcano") { c.fillStyle = "#3a3340"; c.fillRect(100, wy - 4, 110, 10); c.strokeRect(100, wy - 4, 110, 10); c.fillStyle = "#2a2430"; for (const x of [112, 150, 188]) c.fillRect(x, wy + 6, 10, 38); c.strokeStyle = "#ff9a3a"; c.lineWidth = 2; c.beginPath(); c.moveTo(114, wy); c.lineTo(126, wy + 3); c.lineTo(140, wy); c.stroke(); }
}
