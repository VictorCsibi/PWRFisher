"use strict";
// Six more maps: Cherry Blossom Pond, Mangrove Swamp, Desert Oasis, Pirate Cove, Deep Abyss and Alien Planet.
// Loaded right after maps.js. Uses ctx, g, W, H, WATER_Y, DECK_Y, INK, ink(), lerp, clamp, MAPS, MAP_ORDER, MAP_ITEMS, cloud, skyState at call time.

// ---------- shared scenery bits ----------
function cherryTree(x, y, s) {
  ink(3); ctx.fillStyle = "#6b4a3a"; ctx.beginPath(); ctx.moveTo(x - 5 * s, y); ctx.lineTo(x - 3 * s, y - 26 * s); ctx.lineTo(x + 3 * s, y - 26 * s); ctx.lineTo(x + 5 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const [dx, dy, r, col] of [[-14, -34, 15, "#ffb3d1"], [10, -40, 17, "#ffc4dc"], [-2, -52, 15, "#ffb3d1"], [18, -30, 12, "#ff9fc4"], [-20, -26, 11, "#ff9fc4"]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, 7); ctx.fill(); ctx.stroke(); }
}
function torii(x, y, s) {
  ink(3.5); ctx.fillStyle = "#e23a3a";
  for (const dx of [-30, 30]) { ctx.fillRect(x + dx * s - 4 * s, y - 72 * s, 8 * s, 76 * s); ctx.strokeRect(x + dx * s - 4 * s, y - 72 * s, 8 * s, 76 * s); }
  ctx.fillRect(x - 40 * s, y - 56 * s, 80 * s, 6 * s); ctx.strokeRect(x - 40 * s, y - 56 * s, 80 * s, 6 * s);
  ctx.fillStyle = "#2a2028"; ctx.beginPath(); ctx.moveTo(x - 52 * s, y - 70 * s); ctx.quadraticCurveTo(x, y - 82 * s, x + 52 * s, y - 70 * s); ctx.lineTo(x + 46 * s, y - 62 * s); ctx.quadraticCurveTo(x, y - 74 * s, x - 46 * s, y - 62 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
}
function pagoda(x, y, s) {
  ink(3);
  for (let k = 0; k < 3; k++) {
    const w = (46 - k * 10) * s, h = 20 * s, by = y - k * 30 * s;
    ctx.fillStyle = "#e23a3a"; ctx.fillRect(x - w / 2, by - h, w, h); ctx.strokeRect(x - w / 2, by - h, w, h);
    ctx.fillStyle = "#3a2a3a"; ctx.beginPath(); ctx.moveTo(x - w / 2 - 12 * s, by - h + 2); ctx.quadraticCurveTo(x - w / 4, by - h - 6 * s, x, by - h - 14 * s); ctx.quadraticCurveTo(x + w / 4, by - h - 6 * s, x + w / 2 + 12 * s, by - h + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}
function palmTree(x, y, s = 1, lean = 1) {
  for (const [col, w] of [[INK, 11 * s], ["#a0703a", 7 * s]]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 14 * lean * s, y - 40 * s, x + 8 * lean * s, y - 80 * s); ctx.stroke(); }
  const tx = x + 8 * lean * s, ty = y - 80 * s;
  ctx.fillStyle = "#2fb34a"; ink(3);
  for (const a of [-2.7, -2.1, -1.5, -0.9, -0.3, 0.3]) { ctx.beginPath(); ctx.ellipse(tx + Math.cos(a) * 24 * s, ty + Math.sin(a) * 10 * s + 6 * s, 26 * s, 8 * s, a * 0.55, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = "#6b4a2a"; for (const dx of [-4, 4]) { ctx.beginPath(); ctx.arc(tx + dx * s, ty + 8 * s, 4 * s, 0, 7); ctx.fill(); }
}
function mangrove(x, y, s) {
  const top = y - 70 * s;
  for (const [col, w] of [[INK, 7], ["#5a4a30", 3.5]]) { ctx.strokeStyle = col; ctx.lineWidth = w * s; ctx.lineCap = "round"; ctx.beginPath(); for (const dx of [-26, -14, 0, 14, 26]) { ctx.moveTo(x + dx * 0.3 * s, top + 14 * s); ctx.quadraticCurveTo(x + dx * s, y - 26 * s, x + dx * 1.1 * s, y + 4); } ctx.stroke(); }
  ctx.fillStyle = "#3f7a4a"; ink(3); for (const [dx, dy, r] of [[-22, 0, 20], [0, -12, 24], [22, 0, 20], [-8, 8, 16]]) { ctx.beginPath(); ctx.arc(x + dx * s, top + dy * s, r * s, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = "rgba(170,200,120,.9)"; ctx.lineWidth = 2; ctx.beginPath(); for (const dx of [-26, -10, 8, 26]) { ctx.moveTo(x + dx * s, top + 14 * s); ctx.quadraticCurveTo(x + dx * s + 4, top + 34 * s, x + dx * s - 2, top + 54 * s + Math.sin(g.t + dx) * 3); } ctx.stroke();
}
function pyramid(x, y, s) {
  ink(4); ctx.fillStyle = "#e6c07a"; ctx.beginPath(); ctx.moveTo(x - s * 0.9, y); ctx.lineTo(x, y - s * 0.75); ctx.lineTo(x + s * 0.9, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#c9a05a"; ctx.beginPath(); ctx.moveTo(x, y - s * 0.75); ctx.lineTo(x + s * 0.9, y); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
}
function hills(base, col, amp, period, step, drawItem) {
  const hy = x => WATER_Y - base - Math.sin(x / period + base) * amp - Math.sin(x / 37) * 4;
  ctx.fillStyle = col; ink(4); ctx.beginPath(); ctx.moveTo(0, WATER_Y + 4); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, hy(x)); ctx.lineTo(W, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (drawItem) for (let x = 30 + base; x < W; x += step) drawItem(x, hy(x) + 3);
}
const fogBand = (a = 0.5) => { const f = ctx.createLinearGradient(0, WATER_Y - 60, 0, WATER_Y + 4); f.addColorStop(0, "rgba(255,255,255,0)"); f.addColorStop(1, `rgba(255,255,255,${a})`); ctx.fillStyle = f; ctx.fillRect(0, WATER_Y - 60, W, 64); };

// ---------- CHERRY BLOSSOM POND ----------
function farBlossom() {
  const cx = W * 0.56;
  ink(4); ctx.fillStyle = "#9fb0e8"; ctx.beginPath(); ctx.moveTo(cx - 340, WATER_Y); ctx.lineTo(cx - 40, WATER_Y - 160); ctx.lineTo(cx + 40, WATER_Y - 160); ctx.lineTo(cx + 340, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(cx - 40, WATER_Y - 160); ctx.lineTo(cx + 40, WATER_Y - 160); ctx.lineTo(cx + 78, WATER_Y - 112); ctx.lineTo(cx + 46, WATER_Y - 122); ctx.lineTo(cx + 18, WATER_Y - 104); ctx.lineTo(cx - 12, WATER_Y - 124); ctx.lineTo(cx - 44, WATER_Y - 106); ctx.lineTo(cx - 76, WATER_Y - 116); ctx.closePath(); ctx.fill(); ctx.stroke();
  hills(46, "#b6e0a4", 14, 100, 62, (x, y) => cherryTree(x, y, 0.75));
  hills(20, "#98d68c", 12, 90, 76, (x, y) => cherryTree(x, y, 1));
  pagoda(W * 0.8, WATER_Y - 34, 0.9);
  torii(W * 0.36, WATER_Y + 4, 1);
  fogBand(0.35);
}
function platformBlossom() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#7a2a1a"; ink(4); ctx.fillRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); ctx.strokeRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); }
  ctx.fillStyle = "#b9784a"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.lineWidth = 3; for (let x = 30; x < 420; x += 44) { ctx.beginPath(); ctx.moveTo(x, DECK_Y); ctx.lineTo(x, DECK_Y + 18); ctx.stroke(); }
  ctx.fillStyle = "#ffb3d1"; for (let x = 6; x < 420; x += 27) { ctx.beginPath(); ctx.ellipse(x + (x % 3) * 5, DECK_Y - 1, 4, 2, x, 0, 7); ctx.fill(); }
  // stone lantern (toro)
  ink(3.5); ctx.fillStyle = "#9aa7b8"; ctx.fillRect(266, DECK_Y - 8, 16, 8); ctx.strokeRect(266, DECK_Y - 8, 16, 8); ctx.fillRect(270, DECK_Y - 30, 8, 22); ctx.strokeRect(270, DECK_Y - 30, 8, 22);
  ctx.fillRect(262, DECK_Y - 44, 24, 14); ctx.strokeRect(262, DECK_Y - 44, 24, 14); ctx.fillStyle = "#ffe066"; ctx.fillRect(268, DECK_Y - 40, 12, 6);
  ctx.fillStyle = "#7b8794"; ctx.beginPath(); ctx.moveTo(254, DECK_Y - 44); ctx.lineTo(274, DECK_Y - 58); ctx.lineTo(294, DECK_Y - 44); ctx.closePath(); ctx.fill(); ctx.stroke();
  lanternPost("#ff5a5f", "#7a2a1a");
}

// ---------- MANGROVE SWAMP ----------
function farSwamp() {
  hills(20, "#5a7a4a", 8, 80, 999, null);
  for (let x = 20; x < W; x += 74) mangrove(x + ((x * 7) % 30), WATER_Y, 0.8 + ((x * 3) % 5) / 10);
  fogBand(0.55);
  const dk = skyState(g.tod).dark;
  if (dk > 0.3) { // fireflies
    ctx.save(); ctx.shadowColor = "#e8ff8a"; ctx.shadowBlur = 10;
    for (let i = 0; i < 30; i++) { const x = (i * 97) % W + Math.sin(g.t * 0.5 + i) * 12, y = WATER_Y - 14 - ((i * 53) % 130) + Math.sin(g.t * 0.8 + i * 2) * 8; ctx.fillStyle = `rgba(232,255,140,${dk * (0.4 + 0.6 * Math.abs(Math.sin(g.t * 1.4 + i)))})`; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
}
function platformSwamp() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#5a4a2a"; ink(4); ctx.fillRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); ctx.strokeRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); }
  ctx.fillStyle = "#7a5a3a"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.fillStyle = "#5a8a4a"; for (let x = -4; x < 420; x += 38) { ctx.beginPath(); ctx.ellipse(x, DECK_Y + 1, 16 + (x % 5), 4, 0, Math.PI, 0); ctx.fill(); }
  // ramshackle shack
  ink(4); ctx.fillStyle = "#8a6a44"; ctx.fillRect(-30, DECK_Y - 74, 142, 74); ctx.strokeRect(-30, DECK_Y - 74, 142, 74);
  ctx.strokeStyle = "rgba(50,30,10,.5)"; ctx.lineWidth = 2; for (let x = -18; x < 112; x += 16) { ctx.beginPath(); ctx.moveTo(x, DECK_Y - 74); ctx.lineTo(x, DECK_Y); ctx.stroke(); }
  ctx.fillStyle = "#8a4a3a"; ink(4); ctx.beginPath(); ctx.moveTo(-42, DECK_Y - 70); ctx.lineTo(90, DECK_Y - 106); ctx.lineTo(124, DECK_Y - 70); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a2410"; ink(3); ctx.fillRect(56, DECK_Y - 48, 30, 48); ctx.strokeRect(56, DECK_Y - 48, 30, 48);
  ctx.fillStyle = "#e8ff9a"; ctx.fillRect(-16, DECK_Y - 54, 28, 24); ctx.strokeRect(-16, DECK_Y - 54, 28, 24);
  ctx.strokeStyle = "rgba(170,200,120,.9)"; ctx.lineWidth = 2; ctx.beginPath(); for (const dx of [-24, 20, 100]) { ctx.moveTo(dx, DECK_Y - 72); ctx.quadraticCurveTo(dx + 4, DECK_Y - 52, dx - 2, DECK_Y - 34 + Math.sin(g.t + dx) * 3); } ctx.stroke();
  lanternPost("#c8ff8a", "#5a4a2a");
}

// ---------- DESERT OASIS ----------
function farOasis() {
  for (const [xf, s] of [[0.2, 1.1], [0.31, 0.75], [0.72, 1.3]]) pyramid(W * xf, WATER_Y - 8, 110 * s);
  hills(52, "#f0cf8a", 22, 130, 999, null);
  hills(26, "#f8dea0", 16, 110, 999, null);
  for (const [xf, s, l] of [[0.08, 1, 1], [0.13, 0.8, -1], [0.55, 0.9, 1], [0.6, 1.1, -1], [0.9, 1, 1]]) palmTree(W * xf, WATER_Y - 22, s, l);
  ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { const y = WATER_Y - 6 - i * 7; ctx.beginPath(); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 30 + g.t * 2 + i) * 1.6); ctx.stroke(); }
}
function platformOasis() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#e6c07a"; ink(4); ctx.fillRect(px - 12, DECK_Y + 16, 24, fl - DECK_Y - 12); ctx.strokeRect(px - 12, DECK_Y + 16, 24, fl - DECK_Y - 12); ctx.fillStyle = "#c9a05a"; for (let y = DECK_Y + 40; y < fl; y += 50) ctx.fillRect(px - 12, y, 24, 6); }
  palmTree(8, DECK_Y, 1.1, 1);
  ctx.fillStyle = "#f2d896"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.fillStyle = "#c9a05a"; for (let x = 10; x < 420; x += 50) ctx.fillRect(x, DECK_Y + 6, 22, 4);
  lanternPost("#ffb02a", "#8a6a3a");
  const fx = 322, fy = DECK_Y - 158, fl2 = 1 + Math.sin(g.t * 11) * 0.12;
  ctx.fillStyle = "#ffcf4a"; ink(3); ctx.beginPath(); ctx.moveTo(fx - 9, fy + 6); ctx.quadraticCurveTo(fx - 12, fy - 10 * fl2, fx, fy - 22 * fl2); ctx.quadraticCurveTo(fx + 12, fy - 10 * fl2, fx + 9, fy + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
}

// ---------- PIRATE COVE ----------
function farPirate() {
  ink(4); ctx.fillStyle = "#5a5a66";
  for (const [xf, w, h] of [[0.1, 36, 120], [0.46, 28, 84], [0.9, 40, 100]]) { ctx.beginPath(); ctx.moveTo(W * xf - w, WATER_Y + 4); ctx.lineTo(W * xf - w * 0.5, WATER_Y - h); ctx.lineTo(W * xf + w * 0.3, WATER_Y - h * 0.8); ctx.lineTo(W * xf + w, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  // skull island
  const sx = W * 0.27, sy = WATER_Y;
  ctx.fillStyle = "#d8d0c0"; ctx.beginPath(); ctx.ellipse(sx, sy - 60, 72, 58, 0, Math.PI, 0); ctx.lineTo(sx + 52, sy - 8); ctx.lineTo(sx - 52, sy - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1d1a26"; for (const dx of [-25, 25]) { ctx.beginPath(); ctx.ellipse(sx + dx, sy - 62, 14, 16, 0, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(sx, sy - 48); ctx.lineTo(sx - 7, sy - 34); ctx.lineTo(sx + 7, sy - 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#d8d0c0"; ctx.fillRect(sx - 42, sy - 14, 84, 12); ctx.strokeRect(sx - 42, sy - 14, 84, 12); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); for (let x = sx - 30; x <= sx + 30; x += 15) { ctx.moveTo(x, sy - 14); ctx.lineTo(x, sy - 2); } ctx.stroke();
  // ship on the horizon
  const bx = W * 0.7, by = WATER_Y + Math.sin(g.t * 0.8) * 2;
  ctx.fillStyle = "#2a2028"; ink(3); ctx.beginPath(); ctx.moveTo(bx - 60, by - 10); ctx.lineTo(bx + 60, by - 10); ctx.lineTo(bx + 44, by + 8); ctx.lineTo(bx - 48, by + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const [dx, h] of [[-30, 70], [0, 90], [30, 66]]) { ctx.fillStyle = "#3a3038"; ctx.fillRect(bx + dx - 2, by - 10 - h, 4, h); ctx.beginPath(); ctx.moveTo(bx + dx + 3, by - 6 - h); ctx.lineTo(bx + dx + 24, by - 20 - h * 0.5); ctx.lineTo(bx + dx + 3, by - 16 - h * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}
function platformPirate() {
  ink(4);
  ctx.fillStyle = "#5a3a22"; ctx.beginPath(); ctx.moveTo(-30, DECK_Y); ctx.lineTo(420, DECK_Y); ctx.quadraticCurveTo(470, DECK_Y - 4, 488, DECK_Y - 44); ctx.quadraticCurveTo(450, DECK_Y + 70, 330, DECK_Y + 86); ctx.lineTo(-30, DECK_Y + 86); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(20,10,0,.45)"; ctx.lineWidth = 2.5; for (const k of [20, 40, 60]) { ctx.beginPath(); ctx.moveTo(-30, DECK_Y + k); ctx.lineTo(420 - k * 0.2, DECK_Y + k); ctx.stroke(); }
  ctx.fillStyle = "#1d1a26"; ink(3); for (const x of [50, 140, 230, 320]) { ctx.beginPath(); ctx.arc(x, DECK_Y + 32, 9, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = "#c98a2a"; ctx.fillRect(-30, DECK_Y - 3, 458, 6); ctx.strokeRect(-30, DECK_Y - 3, 458, 6);
  // mast, sail and flag
  ctx.fillStyle = "#4a321c"; ink(4); ctx.fillRect(56, DECK_Y - 250, 9, 250); ctx.strokeRect(56, DECK_Y - 250, 9, 250); ctx.fillRect(66, DECK_Y - 226, 118, 6); ctx.strokeRect(66, DECK_Y - 226, 118, 6);
  ctx.fillStyle = "#e6dcc0"; ink(3); ctx.beginPath(); ctx.moveTo(70, DECK_Y - 220); ctx.quadraticCurveTo(128, DECK_Y - 205, 180, DECK_Y - 220); ctx.lineTo(176, DECK_Y - 166); ctx.quadraticCurveTo(126, DECK_Y - 150, 74, DECK_Y - 166); ctx.closePath(); ctx.fill(); ctx.stroke();
  const wv = Math.sin(g.t * 3) * 3;
  ctx.fillStyle = "#1d1a26"; ctx.beginPath(); ctx.moveTo(65, DECK_Y - 250); ctx.lineTo(112, DECK_Y - 244 + wv); ctx.lineTo(112, DECK_Y - 214 + wv); ctx.lineTo(65, DECK_Y - 220); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4f4f4"; ctx.beginPath(); ctx.arc(88, DECK_Y - 233 + wv * 0.5, 6, 0, 7); ctx.fill(); ctx.fillStyle = "#1d1a26"; ctx.fillRect(84, DECK_Y - 235 + wv * 0.5, 3, 3); ctx.fillRect(90, DECK_Y - 235 + wv * 0.5, 3, 3);
  ctx.strokeStyle = "#8a7a5a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, DECK_Y - 240); ctx.lineTo(420, DECK_Y - 2); ctx.moveTo(60, DECK_Y - 240); ctx.lineTo(-20, DECK_Y - 2); ctx.stroke();
  // barrels
  for (const [x, y] of [[262, 0], [290, 0], [276, -26]]) { ctx.fillStyle = "#9a6a3a"; ink(3.5); ctx.beginPath(); ctx.roundRect(x - 12, DECK_Y + y - 26, 24, 26, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3a3038"; ctx.fillRect(x - 12, DECK_Y + y - 20, 24, 3); ctx.fillRect(x - 12, DECK_Y + y - 8, 24, 3); }
  lanternPost("#ffcf6a", "#4a321c");
}

// ---------- DEEP ABYSS (always stormy) ----------
function stormClouds() { for (let i = 0; i < 8; i++) cloud(i * (W / 6) - 60 + Math.sin(g.t * 0.2 + i) * 18, 10 + (i % 2) * 28, 1.7, "#2e3550"); }
function farAbyss() {
  // oil rig
  const rx = W * 0.25; ink(3); ctx.fillStyle = "#2a2f3c";
  for (const dx of [-50, -20, 20, 50]) ctx.fillRect(rx + dx - 4, WATER_Y - 60, 8, 64);
  ctx.fillRect(rx - 70, WATER_Y - 74, 140, 14); ctx.strokeRect(rx - 70, WATER_Y - 74, 140, 14); ctx.fillRect(rx - 16, WATER_Y - 130, 32, 56); ctx.strokeRect(rx - 16, WATER_Y - 130, 32, 56);
  ctx.strokeStyle = "#2a2f3c"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(rx + 40, WATER_Y - 74); ctx.lineTo(rx + 60, WATER_Y - 134); ctx.stroke();
  const fl = 1 + Math.sin(g.t * 9) * 0.15; ctx.fillStyle = "#ff8a2a"; ink(2.5); ctx.beginPath(); ctx.moveTo(rx + 54, WATER_Y - 134); ctx.quadraticCurveTo(rx + 44, WATER_Y - 150 * fl, rx + 60, WATER_Y - 168 * fl); ctx.quadraticCurveTo(rx + 76, WATER_Y - 150 * fl, rx + 66, WATER_Y - 134); ctx.closePath(); ctx.fill(); ctx.stroke();
  // lighthouse with a sweeping beam
  const lx = W * 0.7, ly = WATER_Y - 150; ctx.fillStyle = "#f4f4f4"; ink(3.5); ctx.beginPath(); ctx.moveTo(lx - 26, WATER_Y + 4); ctx.lineTo(lx - 16, ly); ctx.lineTo(lx + 16, ly); ctx.lineTo(lx + 26, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e23a3a"; for (const [y0, y1] of [[0.25, 0.45], [0.65, 0.85]]) { const a = WATER_Y - (WATER_Y - ly) * y0, b = WATER_Y - (WATER_Y - ly) * y1; ctx.fillRect(lx - 24 + y0 * 8, b, 48 - y0 * 16, a - b); }
  ctx.fillStyle = "#ffe066"; ctx.fillRect(lx - 14, ly - 18, 28, 18); ctx.strokeRect(lx - 14, ly - 18, 28, 18); ctx.fillStyle = "#3a3038"; ctx.beginPath(); ctx.moveTo(lx - 18, ly - 18); ctx.lineTo(lx, ly - 32); ctx.lineTo(lx + 18, ly - 18); ctx.closePath(); ctx.fill(); ctx.stroke();
  const ang = Math.sin(g.t * 0.7) * 0.5, bl = ctx.createLinearGradient(lx, ly - 9, lx + Math.cos(ang) * 500, ly - 9 + Math.sin(ang) * 500); bl.addColorStop(0, "rgba(255,255,200,.55)"); bl.addColorStop(1, "rgba(255,255,200,0)");
  ctx.fillStyle = bl; ctx.beginPath(); ctx.moveTo(lx, ly - 9); ctx.lineTo(lx + Math.cos(ang - 0.08) * 500, ly - 9 + Math.sin(ang - 0.08) * 500); ctx.lineTo(lx + Math.cos(ang + 0.08) * 500, ly - 9 + Math.sin(ang + 0.08) * 500); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(lx, ly - 9); ctx.lineTo(lx - Math.cos(ang - 0.08) * 500, ly - 9 - Math.sin(ang - 0.08) * 500); ctx.lineTo(lx - Math.cos(ang + 0.08) * 500, ly - 9 - Math.sin(ang + 0.08) * 500); ctx.closePath(); ctx.fill();
}
function platformAbyss() {
  const fl = shore();
  for (const px of [30, 200, 380]) { ctx.fillStyle = "#3a3f4c"; ink(4); ctx.fillRect(px - 9, DECK_Y + 16, 18, fl - DECK_Y - 12); ctx.strokeRect(px - 9, DECK_Y + 16, 18, fl - DECK_Y - 12); }
  ctx.strokeStyle = "#4a4f5c"; ctx.lineWidth = 4; ctx.beginPath(); for (const [a, b] of [[30, 200], [200, 380]]) for (let y = DECK_Y + 30; y < fl - 40; y += 100) { ctx.moveTo(a, y); ctx.lineTo(b, y + 100); ctx.moveTo(b, y); ctx.lineTo(a, y + 100); } ctx.stroke();
  ctx.fillStyle = "#5a6070"; ink(4); ctx.fillRect(-30, DECK_Y, 460, 20); ctx.strokeRect(-30, DECK_Y, 460, 20);
  ctx.save(); ctx.beginPath(); ctx.rect(-30, DECK_Y + 10, 460, 10); ctx.clip(); for (let x = -40; x < 440; x += 24) { ctx.fillStyle = (x / 24) % 2 ? "#ffd23f" : "#1d1a26"; ctx.beginPath(); ctx.moveTo(x, DECK_Y + 20); ctx.lineTo(x + 12, DECK_Y + 10); ctx.lineTo(x + 24, DECK_Y + 10); ctx.lineTo(x + 12, DECK_Y + 20); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.strokeStyle = "#ff8a2a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(330, DECK_Y - 34); ctx.lineTo(430, DECK_Y - 34); for (const x of [340, 380, 425]) { ctx.moveTo(x, DECK_Y); ctx.lineTo(x, DECK_Y - 34); } ctx.stroke();
  ctx.fillStyle = "#ff8a2a"; ink(3); ctx.fillRect(20, DECK_Y - 22, 34, 22); ctx.strokeRect(20, DECK_Y - 22, 34, 22); ctx.fillStyle = "#ffd23f"; ctx.fillRect(28, DECK_Y - 16, 18, 4);
  lanternPost("#f4f4ff", "#4a4f5c");
}

// ---------- ALIEN PLANET ----------
function alienSky() {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 70; i++) { ctx.globalAlpha = 0.45 + 0.5 * Math.sin(g.t * 1.5 + i); ctx.beginPath(); ctx.arc((i * 173) % W, (i * 61) % (WATER_Y * 0.8), 1.2 + (i % 3) * 0.5, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  const px = W * 0.22, py = WATER_Y * 0.42, pr = 58;
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(255,200,140,.7)"; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, Math.PI, 0); ctx.stroke(); ctx.restore();
  const pg = ctx.createLinearGradient(px, py - pr, px, py + pr); pg.addColorStop(0, "#ff9f6b"); pg.addColorStop(0.5, "#c05ae0"); pg.addColorStop(1, "#5a3ad8"); ink(4); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35); ctx.strokeStyle = "rgba(255,200,140,.85)"; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, pr * 1.9, pr * 0.42, 0, 0, Math.PI); ctx.stroke(); ctx.restore();
  for (const [mx, my, mr, col] of [[W * 0.6, WATER_Y * 0.3, 20, "#7affd0"], [W * 0.72, WATER_Y * 0.52, 12, "#ff8fe0"]]) { ink(3); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill(); ctx.stroke(); }
}
function farAlien() {
  ink(4); ctx.fillStyle = "#6a4aa8"; ctx.beginPath(); ctx.moveTo(0, WATER_Y); for (const [xf, h] of [[0, 30], [0.1, 90], [0.2, 40], [0.34, 110], [0.5, 50], [0.66, 100], [0.8, 46], [0.92, 84], [1, 30]]) ctx.lineTo(xf * W, WATER_Y - h); ctx.lineTo(W, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (const [xf, h, col] of [[0.08, 90, "#7affd0"], [0.16, 60, "#ff5fe0"], [0.44, 110, "#5fd8ff"], [0.52, 70, "#7affd0"], [0.75, 100, "#ff5fe0"], [0.86, 64, "#5fd8ff"]]) {
    const x = W * xf; ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.fillStyle = col; ink(3); ctx.beginPath(); ctx.moveTo(x - 14, WATER_Y); ctx.lineTo(x - 8, WATER_Y - h * 0.7); ctx.lineTo(x, WATER_Y - h); ctx.lineTo(x + 8, WATER_Y - h * 0.7); ctx.lineTo(x + 14, WATER_Y); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.stroke();
  }
  for (const [xf, s] of [[0.28, 1], [0.6, 1.3], [0.95, 0.9]]) { const x = W * xf; ink(3); ctx.fillStyle = "#c8f0ff"; ctx.fillRect(x - 5 * s, WATER_Y - 42 * s, 10 * s, 44 * s); ctx.strokeRect(x - 5 * s, WATER_Y - 42 * s, 10 * s, 44 * s); ctx.save(); ctx.shadowColor = "#ff5fe0"; ctx.shadowBlur = 12; ctx.fillStyle = "#ff5fe0"; ctx.beginPath(); ctx.ellipse(x, WATER_Y - 44 * s, 30 * s, 16 * s, 0, Math.PI, 0); ctx.fill(); ctx.restore(); ctx.stroke(); ctx.fillStyle = "#fff8b0"; for (const dx of [-14, 0, 12]) { ctx.beginPath(); ctx.arc(x + dx * s, WATER_Y - 50 * s, 2.5 * s, 0, 7); ctx.fill(); } }
  const fy = WATER_Y - 130 + Math.sin(g.t * 0.9) * 6, fx = W * 0.4; ink(3); ctx.fillStyle = "#7a5ac8"; ctx.beginPath(); ctx.ellipse(fx, fy, 46, 12, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.save(); ctx.shadowColor = "#7affd0"; ctx.shadowBlur = 16; ctx.fillStyle = "rgba(122,255,208,.8)"; ctx.beginPath(); ctx.moveTo(fx - 30, fy + 8); ctx.lineTo(fx, fy + 30); ctx.lineTo(fx + 30, fy + 8); ctx.closePath(); ctx.fill(); ctx.restore();
}
function platformAlien() {
  // a hovering metal disc
  const cx = 200, cy = DECK_Y + 22;
  ink(4); const mg = ctx.createLinearGradient(0, DECK_Y, 0, DECK_Y + 44); mg.addColorStop(0, "#d8d0f0"); mg.addColorStop(1, "#6a5a9a");
  ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(cx, cy, 250, 22, 0, Math.PI, 0); ctx.lineTo(cx + 250, cy); ctx.ellipse(cx, cy, 250, 22, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy + 20, 190, 34, 0, 0, Math.PI); ctx.fillStyle = "#4a3a8a"; ctx.fill(); ctx.stroke();
  ctx.save(); ctx.shadowColor = "#7affd0"; ctx.shadowBlur = 16; ctx.fillStyle = "#7affd0"; for (let i = 0; i < 16; i++) { const a = Math.PI * (i + 0.5) / 16; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 236, cy + Math.sin(a) * 18 + 2, 3.5, 0, 7); ctx.fill(); } ctx.restore();
  const tg = ctx.createRadialGradient(cx, cy + 60, 4, cx, cy + 60, 120); tg.addColorStop(0, "rgba(122,255,208,.7)"); tg.addColorStop(1, "rgba(122,255,208,0)"); ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(cx, cy + 62, 130, 40, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "#c8f0ff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, DECK_Y - 2); ctx.lineTo(30, DECK_Y - 40); ctx.lineTo(120, DECK_Y - 40); ctx.stroke(); ctx.fillStyle = Math.floor(g.t * 2) % 2 ? "#ff5a5f" : "#ffd23f"; ctx.beginPath(); ctx.arc(30, DECK_Y - 44, 4, 0, 7); ctx.fill();
  lanternPost("#7affd0", "#8a7ac8");
}

// ---------- underwater pieces used by the new maps ----------
Object.assign(MAP_ITEMS, {
  chest(r, y) {
    ink(4); ctx.fillStyle = "#8a5a2b"; ctx.beginPath(); ctx.roundRect(r.x - 26 * r.s, y - 28 * r.s, 52 * r.s, 28 * r.s, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#a06a34"; ctx.beginPath(); ctx.moveTo(r.x - 26 * r.s, y - 28 * r.s); ctx.quadraticCurveTo(r.x, y - 52 * r.s, r.x + 26 * r.s, y - 28 * r.s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(r.x - 4 * r.s, y - 34 * r.s, 8 * r.s, 12 * r.s); ctx.strokeRect(r.x - 4 * r.s, y - 34 * r.s, 8 * r.s, 12 * r.s);
    ctx.save(); ctx.shadowColor = "#ffd23f"; ctx.shadowBlur = 12; ctx.fillStyle = "#ffd23f"; for (const [dx, dy] of [[-10, -2], [2, -5], [12, -1], [-2, 1]]) { ctx.beginPath(); ctx.arc(r.x + dx * r.s, y - 28 * r.s + dy, 4 * r.s, 0, 7); ctx.fill(); } ctx.restore();
  },
  crystal(r, y) {
    for (const [dx, h, w] of [[-14, 46, 9], [0, 74, 12], [16, 52, 10], [30, 30, 7]]) { const x = r.x + dx * r.s; ctx.save(); ctx.shadowColor = r.col; ctx.shadowBlur = 12; ctx.fillStyle = r.col; ink(3.5); ctx.beginPath(); ctx.moveTo(x - w * r.s, y); ctx.lineTo(x - w * 0.7 * r.s, y - h * r.s * 0.8); ctx.lineTo(x, y - h * r.s); ctx.lineTo(x + w * 0.7 * r.s, y - h * r.s * 0.8); ctx.lineTo(x + w * r.s, y); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.stroke(); }
  },
  mushroom(r, y) {
    const sw = Math.sin(g.t + r.ph) * 2;
    ink(3.5); ctx.fillStyle = "#e8e0ff"; ctx.fillRect(r.x - 5 * r.s, y - 36 * r.s, 10 * r.s, 36 * r.s); ctx.strokeRect(r.x - 5 * r.s, y - 36 * r.s, 10 * r.s, 36 * r.s);
    ctx.save(); ctx.shadowColor = r.col; ctx.shadowBlur = 14; ctx.fillStyle = r.col; ctx.beginPath(); ctx.ellipse(r.x + sw, y - 38 * r.s, 30 * r.s, 20 * r.s, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.stroke();
    ctx.fillStyle = "#fff8b0"; for (const [dx, dy] of [[-12, -46], [4, -52], [14, -44]]) { ctx.beginPath(); ctx.arc(r.x + dx * r.s + sw, y + dy * r.s, 3 * r.s, 0, 7); ctx.fill(); }
  },
});

// ---------- the new map definitions ----------
const OCEAN_WEATHER = { name: "RAIN", kind: "rain", color: "200,225,255" };
Object.assign(MAPS, {
  blossom: {
    id: "blossom", name: "Cherry Blossom Pond", price: 28000, mult: 1.9, weather: { name: "BLOSSOM WIND", kind: "petals", color: "255,160,200" },
    blurb: "A peaceful Japanese pond with cherry trees, a red torii gate and shimmering koi. Petals drift on the wind.",
    sky: { top: [255, 190, 210], bot: [255, 236, 242], amt: 0.55 }, sand: "#d9c9a0", rock: "#8da1a0", kelpCol: "#3f9a6a", front: "rgba(80,190,170,.3)",
    water: [[0, "#7ad8c8"], [0.25, "#3aa8a0"], [0.6, "#1d6f80"], [1, "#0a2f48"]],
    drawFar: farBlossom, drawPlatform: platformBlossom,
    eco: {
      reef: [["grass", 26], ["log", 5], ["rock", 14], ["star", 3]], cols: ["#7fc6a8", "#9fe0b8", "#f6c0d8", "#e8c0ff"], kelp: 6, grassCol: "#4aa86a", surface: 12,
      schools: [
        { n: "Minnow", count: 14, depth: 0.18, tint: "#f0d8e8", len: 26 }, { n: "Sakura Koi", count: 6, depth: 0.3, tint: "#ffd0e6", len: 56 }, { n: "Koi", count: 6, depth: 0.45, tint: "#fff5e6", len: 60 },
        { n: "Kohaku Koi", count: 5, depth: 0.6, tint: "#ffffff", len: 66 }, { n: "Crappie", count: 9, depth: 0.75, tint: "#c8d88a", len: 44 },
      ],
      residents: [
        { n: "Koi", col: "#fff", deco: "koi", len: 74 }, { n: "Tancho Koi", col: "#fff", deco: "koi", len: 80 }, { n: "Ogon Koi", col: "#ffd23f", deco: "shine", len: 80 },
        { n: "Sakura Koi", col: "#ffd0e6", deco: "koi", len: 66 }, { n: "Carp", col: "#e8b070", deco: "blotch", len: 76 }, { n: "Rainbow Trout", col: "#ff9fd8", deco: "lateral", len: 62 },
      ],
      roam: [{ name: "Ghost Koi", len: 130, dy: 0.5, v: 26, alpha: 0.7 }, { name: "Dragon Koi", len: 200, dy: 0.78, v: 18, alpha: 0.5 }],
      turtles: 2, crabs: 2, crabCol: "#e08a6a", jellies: 0, jellyCols: [], seahorses: 0,
    },
  },
  swamp: {
    id: "swamp", name: "Mangrove Swamp", price: 35000, mult: 2.2, weather: OCEAN_WEATHER,
    blurb: "A misty mangrove swamp with a ramshackle shack, hanging moss and glowing fireflies at night.",
    sky: { top: [120, 150, 125], bot: [196, 210, 172], amt: 0.7 }, sand: "#4a4a32", rock: "#4a5a48", kelpCol: "#4a7a3a", front: "rgba(60,120,80,.3)",
    water: [[0, "#5a8a5a"], [0.3, "#3a6a48"], [0.6, "#204030"], [1, "#0a1a14"]],
    drawFar: farSwamp, drawPlatform: platformSwamp,
    eco: {
      reef: [["reed", 20], ["grass", 24], ["log", 10], ["rock", 10]], cols: ["#4a7a3a", "#6a8a3a", "#3a5a3a"], kelp: 10, grassCol: "#4a7a3a", surface: 7,
      schools: [
        { n: "Minnow", count: 14, depth: 0.2, tint: "#a8b880", len: 26 }, { n: "Mudskipper", count: 8, depth: 0.3, tint: "#8a8a5a", len: 40 }, { n: "Crappie", count: 10, depth: 0.45, tint: "#a0b070", len: 44 },
        { n: "Piranha", count: 8, depth: 0.6, tint: "#c8402a", len: 40 }, { n: "Bowfin", count: 5, depth: 0.75, tint: "#5a7a3a", len: 70 },
      ],
      residents: [
        { n: "Bowfin", col: "#5a7a3a", deco: "blotch", len: 80 }, { n: "Piranha", col: "#e05a3a", deco: "stripes", len: 50 }, { n: "Catfish", col: "#8a7a5a", deco: "blotch", len: 84 },
        { n: "Mudskipper", col: "#a0a060", deco: "spots", len: 46 }, { n: "Snakehead", col: "#5a6a3a", deco: "blotch", len: 92 },
      ],
      roam: [{ name: "River Shark", len: 170, dy: 0.5, v: 38, alpha: 0.8, pred: true }, { name: "Alligator Gar", len: 170, dy: 0.7, v: 24, alpha: 0.7 }, { name: "Electric Eel", len: 150, dy: 0.85, v: 18, alpha: 0.7 }],
      turtles: 3, crabs: 3, crabCol: "#8a5a3a", jellies: 0, jellyCols: [], seahorses: 0,
    },
  },
  oasis: {
    id: "oasis", name: "Desert Oasis", price: 40000, mult: 2.4, noWeather: true, weather: OCEAN_WEATHER,
    blurb: "A turquoise oasis in the sand dunes, with pyramids, palm trees and a sandstone pier. It never rains here.",
    sky: { top: [255, 206, 130], bot: [255, 238, 196], amt: 0.55 }, sand: "#eed9a0", rock: "#b8a070", kelpCol: "#6ab86a", front: "rgba(60,200,190,.28)",
    water: [[0, "#5fe0d0"], [0.25, "#25b0b0"], [0.6, "#107088"], [1, "#062a40"]],
    drawFar: farOasis, drawPlatform: platformOasis,
    eco: {
      reef: [["grass", 22], ["rock", 16], ["log", 6], ["star", 6], ["sponge", 6]], cols: ["#d8b070", "#e8c890", "#7ab86a", "#c89a5a"], kelp: 8, grassCol: "#6ab86a",
      schools: [
        { n: "Pupfish", count: 16, depth: 0.16, tint: "#7ab8f0", len: 28 }, { n: "Tilapia", count: 10, depth: 0.34, tint: "#d8c890", len: 48 }, { n: "Bluegill", count: 8, depth: 0.5, tint: "#6ab0a0", len: 42 },
        { n: "Tigerfish", count: 6, depth: 0.66, tint: "#c88a3a", len: 70 }, { n: "Minnow", count: 12, depth: 0.8, tint: "#c8e0f0", len: 26 },
      ],
      residents: [
        { n: "Tilapia", col: "#e8d8a0", deco: "stripes", len: 56 }, { n: "Bluegill", col: "#5fd8c8", deco: "ear", len: 46 }, { n: "Tigerfish", col: "#d8a04a", deco: "stripes", len: 76 },
        { n: "Koi", col: "#ffe8c0", deco: "koi", len: 64 }, { n: "Pupfish", col: "#5fa8e8", deco: "glint", len: 32 },
      ],
      roam: [{ name: "Nile Perch", len: 150, dy: 0.5, v: 30, alpha: 0.8, pred: true }, { name: "Lungfish", len: 170, dy: 0.75, v: 16, alpha: 0.65 }, { name: "Pharaoh Fish", len: 150, dy: 0.84, v: 14, alpha: 0.5 }],
      turtles: 2, crabs: 2, crabCol: "#d0a060", jellies: 0, jellyCols: [], seahorses: 0,
    },
  },
  pirate: {
    id: "pirate", name: "Pirate Cove", price: 60000, mult: 3.2, bob: { amp: 4, speed: 1.2, tilt: 0.026, whole: true, bucket: true }, weather: OCEAN_WEATHER,
    blurb: "Stand on a pirate ship deck beside a skull island. Treasure chests glitter on the sea floor.",
    sky: { top: [90, 70, 130], bot: [255, 160, 100], amt: 0.6 }, sand: "#c8b07a", rock: "#5a5a66", kelpCol: "#2a8a5a", wreck: true, front: "rgba(30,120,140,.3)",
    water: [[0, "#2c8a9a"], [0.25, "#186a80"], [0.6, "#0c3a58"], [1, "#04182c"]],
    drawFar: farPirate, drawPlatform: platformPirate,
    eco: {
      reef: [["chest", 8], ["branch", 20], ["brain", 8], ["fan", 8], ["urchin", 6], ["star", 6], ["grass", 10], ["rock", 8]], cols: ["#ff9f43", "#b45cff", "#4d9dff", "#3ddc97", "#ff5fa2"], kelp: 8, grassCol: "#3a9a5a",
      schools: [
        { n: "Sardine", count: 14, depth: 0.18, tint: "#cfe0f0", len: 30 }, { n: "Clownfish", count: 7, depth: 0.32, tint: "#ff8a1f", len: 34 }, { n: "Cutlassfish", count: 8, depth: 0.5, tint: "#c9d6e2", len: 70 },
        { n: "Perch", count: 9, depth: 0.66, tint: "#ffb84d", len: 40 }, { n: "Minnow", count: 12, depth: 0.8, tint: "#9bd4ff", len: 26 },
      ],
      residents: [
        { n: "Clownfish", col: "#ff8a1f", deco: "clown", len: 40 }, { n: "Bass", col: "#3ddc97", deco: "lateral", len: 58 }, { n: "Skeleton Fish", col: "#f4f4f0", deco: "stripes", len: 60 },
        { n: "Treasure Fish", col: "#ffd23f", deco: "shine", len: 66 }, { n: "Perch", col: "#4d7cff", deco: "glint", len: 46 },
      ],
      roam: [{ name: "Ghost Shark", len: 190, dy: 0.5, v: 40, alpha: 0.8, pred: true }, { name: "Kraken", len: 300, dy: 0.8, v: 10, alpha: 0.35 }],
      turtles: 1, crabs: 3, crabCol: "#e0552a", jellies: 3, jellyCols: ["#ff8fc8", "#9be8ff"], seahorses: 2,
    },
  },
  abyss: {
    id: "abyss", name: "Deep Abyss", price: 80000, mult: 4, alwaysWeather: true, weather: { name: "STORM", kind: "rain", color: "190,210,240" },
    blurb: "An oil rig in a never-ending storm above the darkest deep. Bigger monsters, slower bites.",
    sky: { top: [22, 30, 54], bot: [74, 84, 116], amt: 0.9 }, sand: "#1c2230", rock: "#2a3040", kelpCol: "#2a5a6a", front: "rgba(20,60,120,.32)",
    water: [[0, "#1f4a78"], [0.2, "#10305a"], [0.5, "#081a3a"], [1, "#02050f"]],
    drawFar: farAbyss, drawPlatform: platformAbyss, drawSkyExtra: stormClouds,
    eco: {
      reef: [["vent", 12], ["ember", 16], ["crystal", 8]], cols: ["#4aa8c8", "#8a5ad8", "#3ad8b8"], kelp: 0, grassCol: "#2a5a6a",
      schools: [
        { n: "Lanternfish", count: 16, depth: 0.2, tint: "#4aa8c8", len: 28 }, { n: "Bristlemouth", count: 12, depth: 0.35, tint: "#2a5a8a", len: 36 }, { n: "Hatchetfish", count: 9, depth: 0.5, tint: "#c9d6e2", len: 44 },
        { n: "Lanternfish", count: 12, depth: 0.7, tint: "#8ad8c8", len: 30 },
      ],
      residents: [
        { n: "Viperfish", col: "#3a4a6a", deco: "spots", len: 80 }, { n: "Hatchetfish", col: "#c9d6e2", deco: "glint", len: 52 }, { n: "Lanternfish", col: "#4aa8c8", deco: "dots", len: 34 }, { n: "Bristlemouth", col: "#2a5a8a", deco: "glint", len: 40 },
      ],
      roam: [{ name: "Giant Squid", len: 200, dy: 0.55, v: 26, alpha: 0.75, pred: true }, { name: "Oarfish", len: 280, dy: 0.72, v: 22, alpha: 0.6 }, { name: "Leviathan", len: 260, dy: 0.86, v: 10, alpha: 0.35 }],
      turtles: 0, crabs: 2, crabCol: "#6a2a4a", jellies: 6, jellyCols: ["#4aa8c8", "#8a5ad8", "#3ad8b8"], seahorses: 0,
    },
  },
  alien: {
    id: "alien", name: "Alien Planet", price: 120000, mult: 5.5, weather: { name: "METEOR SHOWER", kind: "meteor", color: "160,220,255" },
    blurb: "A glowing world with a ringed planet, two moons, crystal spires and a hovering platform. Meteors rain down.",
    sky: { top: [70, 30, 130], bot: [255, 140, 200], amt: 0.85 }, sand: "#5a3a8a", rock: "#4a3a7a", kelpCol: "#a05ae0", front: "rgba(120,80,255,.25)",
    water: [[0, "#7affd0"], [0.25, "#3a9fd8"], [0.6, "#3a3ad8"], [1, "#100a4a"]],
    bob: { amp: 6, speed: 1.1, tilt: 0.02, whole: true, bucket: true },
    drawFar: farAlien, drawPlatform: platformAlien, drawSkyExtra: alienSky,
    eco: {
      reef: [["crystal", 22], ["mushroom", 16], ["ember", 10], ["star", 4]], cols: ["#7affd0", "#ff5fe0", "#5fd8ff", "#b45cff"], kelp: 6, grassCol: "#a05ae0",
      schools: [
        { n: "Glow Minnow", count: 16, depth: 0.16, tint: "#7affd0", len: 28 }, { n: "Star Guppy", count: 12, depth: 0.3, tint: "#ffd23f", len: 30 }, { n: "Plasma Tetra", count: 9, depth: 0.5, tint: "#ff5fe0", len: 42 },
        { n: "Asteroid Puffer", count: 5, depth: 0.7, tint: "#a08aff", len: 44 },
      ],
      residents: [
        { n: "Plasma Tetra", col: "#ff5fe0", deco: "lateral", len: 52 }, { n: "Star Guppy", col: "#ffd23f", deco: "glint", len: 36 }, { n: "Glow Minnow", col: "#7affd0", deco: "glint", len: 34 }, { n: "Plasma Tetra", col: "#5fd8ff", deco: "stripes", len: 50 },
      ],
      roam: [{ name: "Void Angler", len: 130, dy: 0.5, v: 34, alpha: 0.8, pred: true }, { name: "Comet Ray", len: 170, dy: 0.68, v: 22, alpha: 0.7 }, { name: "Cosmic Whale", len: 260, dy: 0.84, v: 10, alpha: 0.4 }],
      turtles: 0, crabs: 2, crabCol: "#a05ae0", jellies: 6, jellyCols: ["#7affd0", "#ff5fe0", "#5fd8ff", "#b45cff"], seahorses: 0,
    },
  },
});
MAP_ORDER.splice(0, MAP_ORDER.length, "bay", "lake", "forest", "blossom", "arctic", "swamp", "oasis", "volcano", "pirate", "abyss", "alien");

// ---------- shop pictures for the new maps ----------
const __mapIcon0 = drawMapIcon;
drawMapIcon = function (c, id) {
  const NEW = { blossom: 1, swamp: 1, oasis: 1, pirate: 1, abyss: 1, alien: 1 };
  if (!NEW[id]) return __mapIcon0(c, id);
  const M = MAPS[id], w = 200, h = 110, wy = 62;
  const sk = { blossom: ["#ffbed4", "#ffeef2"], swamp: ["#7a9a80", "#c4d2ac"], oasis: ["#ffce82", "#ffeec4"], pirate: ["#5a468a", "#ff9c64"], abyss: ["#161e36", "#4a5474"], alien: ["#46208a", "#ff8cc8"] }[id];
  const g1 = c.createLinearGradient(0, 0, 0, wy); g1.addColorStop(0, sk[0]); g1.addColorStop(1, sk[1]); c.fillStyle = g1; c.fillRect(0, 0, w, h);
  c.lineJoin = "round"; c.lineWidth = 2.5; c.strokeStyle = INK;
  const blob = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); };
  const tri = (x, y, bw, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - bw, wy); c.lineTo(x, y); c.lineTo(x + bw, wy); c.closePath(); c.fill(); c.stroke(); };
  if (id === "blossom") { tri(110, 16, 60, "#9fb0e8"); c.fillStyle = "#b6e0a4"; c.beginPath(); c.ellipse(100, wy + 4, 110, 12, 0, Math.PI, 0); c.fill(); c.stroke(); for (const x of [20, 54, 150, 184]) { blob(x, wy - 14, 9, "#ffb3d1"); blob(x + 8, wy - 18, 8, "#ffc4dc"); } c.fillStyle = "#e23a3a"; c.fillRect(74, wy - 26, 4, 28); c.fillRect(96, wy - 26, 4, 28); c.fillRect(70, wy - 26, 34, 5); }
  if (id === "swamp") { for (const x of [14, 50, 92, 132, 176]) { c.strokeStyle = "#5a4a30"; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 10, wy); c.quadraticCurveTo(x - 6, wy - 20, x, wy - 28); c.moveTo(x + 10, wy); c.quadraticCurveTo(x + 6, wy - 20, x, wy - 28); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.5; blob(x, wy - 34, 14, "#3f7a4a"); } c.fillStyle = "#c8ff8a"; for (const [x, y] of [[40, 30], [120, 20], [160, 36]]) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }
  if (id === "oasis") { c.fillStyle = "#e6c07a"; c.beginPath(); c.moveTo(20, wy); c.lineTo(58, 22); c.lineTo(96, wy); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#f0cf8a"; c.beginPath(); c.ellipse(110, wy + 4, 110, 16, 0, Math.PI, 0); c.fill(); c.stroke(); c.strokeStyle = "#a0703a"; c.lineWidth = 4; c.beginPath(); c.moveTo(160, wy); c.quadraticCurveTo(168, wy - 20, 162, wy - 34); c.stroke(); c.fillStyle = "#2fb34a"; c.strokeStyle = INK; c.lineWidth = 2.5; for (const a of [-2.6, -1.9, -1.2, -0.5]) { c.beginPath(); c.ellipse(162 + Math.cos(a) * 12, wy - 36 + Math.sin(a) * 5, 13, 4, a * 0.5, 0, 7); c.fill(); c.stroke(); } }
  if (id === "pirate") { c.fillStyle = "#d8d0c0"; c.beginPath(); c.ellipse(46, wy - 20, 30, 24, 0, Math.PI, 0); c.lineTo(58, wy); c.lineTo(34, wy); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#1d1a26"; for (const dx of [-10, 10]) { c.beginPath(); c.ellipse(46 + dx, wy - 22, 6, 7, 0, 0, 7); c.fill(); } c.fillStyle = "#2a2028"; c.beginPath(); c.moveTo(112, wy - 6); c.lineTo(170, wy - 6); c.lineTo(160, wy + 4); c.lineTo(120, wy + 4); c.closePath(); c.fill(); c.stroke(); c.fillRect(138, wy - 40, 3, 34); c.beginPath(); c.moveTo(141, wy - 38); c.lineTo(160, wy - 26); c.lineTo(141, wy - 16); c.closePath(); c.fill(); c.stroke(); }
  if (id === "abyss") { for (const [x, y, s] of [[30, 14, 22], [90, 8, 28], [150, 16, 24]]) blob(x, y, s, "#2e3550"); c.fillStyle = "#f4f4f4"; c.beginPath(); c.moveTo(150, wy); c.lineTo(154, 26); c.lineTo(166, 26); c.lineTo(170, wy); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#e23a3a"; c.fillRect(153, 42, 14, 8); c.fillStyle = "#ffe066"; c.fillRect(154, 18, 12, 8); c.fillStyle = "#2a2f3c"; c.fillRect(30, wy - 34, 44, 6); c.fillRect(38, wy - 28, 5, 30); c.fillRect(60, wy - 28, 5, 30); c.fillStyle = "#ff8a2a"; c.beginPath(); c.arc(78, wy - 42, 5, 0, 7); c.fill(); }
  if (id === "alien") { const pg = c.createLinearGradient(0, 8, 0, 48); pg.addColorStop(0, "#ff9f6b"); pg.addColorStop(1, "#5a3ad8"); c.fillStyle = pg; c.beginPath(); c.arc(40, 30, 20, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,200,140,.9)"; c.lineWidth = 4; c.beginPath(); c.ellipse(40, 30, 36, 8, -0.35, 0, 7); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.5; blob(130, 20, 8, "#7affd0"); blob(160, 36, 5, "#ff8fe0"); for (const [x, hh, col] of [[100, 40, "#7affd0"], [120, 28, "#ff5fe0"], [176, 34, "#5fd8ff"]]) { c.fillStyle = col; c.beginPath(); c.moveTo(x - 7, wy); c.lineTo(x, wy - hh); c.lineTo(x + 7, wy); c.closePath(); c.fill(); c.stroke(); } }
  const gw = c.createLinearGradient(0, wy, 0, h); for (const [s, col] of M.water) gw.addColorStop(s, col); c.fillStyle = gw; c.fillRect(0, wy, w, h - wy); c.beginPath(); c.moveTo(0, wy); c.lineTo(w, wy); c.stroke();
  // platform
  const deck = { blossom: "#b9784a", swamp: "#7a5a3a", oasis: "#f2d896", pirate: "#5a3a22", abyss: "#5a6070", alien: "#8a7ac8" }[id];
  c.fillStyle = deck;
  if (id === "pirate") { c.beginPath(); c.moveTo(96, wy - 2); c.lineTo(200, wy - 2); c.lineTo(190, wy + 26); c.lineTo(96, wy + 26); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#e6dcc0"; c.fillRect(130, wy - 44, 3, 42); c.fillRect(110, wy - 44, 44, 26); }
  else if (id === "alien") { c.beginPath(); c.ellipse(150, wy + 4, 60, 8, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(122,255,208,.6)"; c.beginPath(); c.ellipse(150, wy + 18, 40, 10, 0, 0, 7); c.fill(); }
  else { c.fillRect(100, wy - 4, 110, 10); c.strokeRect(100, wy - 4, 110, 10); c.fillStyle = id === "oasis" ? "#e6c07a" : id === "abyss" ? "#3a3f4c" : "#5a3a1a"; for (const x of [112, 150, 188]) { c.fillRect(x, wy + 6, 8, 38); } }
};
