"use strict";
// The start screen (sunset over a cherry-blossom sea with a fisherman waiting) and the map ups and downs.
// Loaded before game.js. Only defines things; uses game functions when clicked / each frame (drawRod, MAPS, MAP_ORDER,
// drawMapIcon, state, switchMap, openModal, closeModal, save, Snd, FISH, settings, ol, INK, star).

// ---------- map ups and downs (sell = money multiplier, bite = bite speed, wear = line wear, luck = rare fish, junk = extra junk chance) ----------
const MAP_TRAITS = {
  bay:     { sell: 1.0,  bite: 1.15, wear: 1,   luck: 0.85, junk: 0,     ups: ["Fish bite 15% faster"], downs: ["Rare fish 15% less likely"] },
  lake:    { sell: 1.1,  bite: 0.9,  wear: 1,   luck: 1,    junk: -0.08, ups: ["Fish sell +10%", "Less junk"], downs: ["Fish bite 10% slower"] },
  forest:  { sell: 1.2,  bite: 0.8,  wear: 1,   luck: 1,    junk: 0,     ups: ["Fish sell +20%", "Peaceful snowfall"], downs: ["Cold water: bites 20% slower"] },
  blossom: { sell: 0.9,  bite: 1.25, wear: 1,   luck: 1,    junk: -0.1,  ups: ["Fish bite 25% faster", "Much less junk"], downs: ["Fish sell 10% less"] },
  arctic:  { sell: 1.3,  bite: 0.9,  wear: 1.5, luck: 1.1,  junk: 0,     ups: ["Fish sell +30%", "Rare fish +10%"], downs: ["Icy line wears 50% faster", "Bites 10% slower"] },
  swamp:   { sell: 0.95, bite: 1,    wear: 1,   luck: 1.25, junk: 0.1,   ups: ["Rare fish +25%"], downs: ["Lots more junk", "Fish sell 5% less"] },
  oasis:   { sell: 1.25, bite: 0.85, wear: 0.8, luck: 0.9,  junk: 0,     ups: ["Fish sell +25%", "Line lasts 25% longer"], downs: ["Bites 15% slower", "Rare fish 10% less likely"] },
  volcano: { sell: 1.5,  bite: 1,    wear: 2,   luck: 1,    junk: 0.05,  ups: ["Fish sell +50%"], downs: ["Line wears twice as fast", "A bit more junk"] },
  pirate:  { sell: 1.1,  bite: 1,    wear: 1.5, luck: 1.3,  junk: 0.1,   ups: ["Rare fish +30%", "Fish sell +10%"], downs: ["More junk", "Line wears 50% faster"] },
  abyss:   { sell: 1.6,  bite: 0.7,  wear: 1.5, luck: 1,    junk: 0,     ups: ["Fish sell +60%"], downs: ["Bites 30% slower", "Line wears 50% faster", "Always stormy"] },
  alien:   { sell: 1.8,  bite: 0.8,  wear: 2.5, luck: 1.2,  junk: 0.1,   ups: ["Fish sell +80%", "Rare fish +20%"], downs: ["Line wears 2.5x faster", "More junk", "Bites 20% slower"] },
};
const mapT = () => MAP_TRAITS[state.map] || MAP_TRAITS.bay;

const menu = { open: true, pick: "", petals: null };
const menuEl = () => document.getElementById("menu");

// ---------- the scene ----------
const mrn = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
function menuDraw(c, W, H, t) {
  const hz = Math.round(H * 0.46), sunX = W * 0.5, sunY = hz - 14, deckY = Math.round(H * 0.74), sc = Math.max(1.1, H / 720 * 1.35);
  c.clearRect(0, 0, W, H);
  // ---- sky ----
  let gr = c.createLinearGradient(0, 0, 0, hz);
  [[0, "#1b1a55"], [0.26, "#4d2f8c"], [0.48, "#b1409c"], [0.66, "#ff6e72"], [0.83, "#ffa860"], [1, "#ffe28e"]].forEach(([p, col]) => gr.addColorStop(p, col));
  c.fillStyle = gr; c.fillRect(0, 0, W, hz + 2);
  for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${(0.25 + 0.5 * mrn(i, 3)) * (0.5 + 0.5 * Math.sin(t * 1.5 + i))})`; c.fillRect(mrn(i, 1) * W, mrn(i, 2) * hz * 0.42, 1.6, 1.6); }
  // sun
  gr = c.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(W, H) * 0.55);
  gr.addColorStop(0, "rgba(255,240,180,.95)"); gr.addColorStop(0.12, "rgba(255,190,110,.55)"); gr.addColorStop(0.4, "rgba(255,120,110,.18)"); gr.addColorStop(1, "rgba(255,120,110,0)");
  c.fillStyle = gr; c.fillRect(0, 0, W, hz);
  c.save(); c.beginPath(); c.rect(0, 0, W, hz); c.clip();
  for (let i = 0; i < 9; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / 9 + Math.sin(t * 0.15 + i) * 0.03; c.fillStyle = "rgba(255,225,160,.07)"; c.beginPath(); c.moveTo(sunX, sunY); c.lineTo(sunX + Math.cos(a - 0.05) * W, sunY + Math.sin(a - 0.05) * W); c.lineTo(sunX + Math.cos(a + 0.05) * W, sunY + Math.sin(a + 0.05) * W); c.closePath(); c.fill(); }
  gr = c.createLinearGradient(0, sunY - 90, 0, sunY + 90); gr.addColorStop(0, "#fff7cf"); gr.addColorStop(1, "#ffb45e"); c.fillStyle = gr; c.beginPath(); c.arc(sunX, sunY, 88, 0, 7); c.fill();
  c.restore();
  // clouds (lit from below by the sun)
  for (let i = 0; i < 8; i++) {
    const w = 200 + mrn(i, 5) * 260, x = ((mrn(i, 6) * (W + 500) + t * (6 + mrn(i, 7) * 10)) % (W + 500)) - 250, y = hz * (0.1 + mrn(i, 8) * 0.55), h = 22 + mrn(i, 9) * 22;
    const cg = c.createLinearGradient(0, y - h, 0, y + h); cg.addColorStop(0, "rgba(130,70,150,.85)"); cg.addColorStop(0.55, "rgba(255,140,130,.85)"); cg.addColorStop(1, "rgba(255,210,150,.9)");
    c.fillStyle = cg; c.beginPath(); c.ellipse(x, y, w / 2, h * 0.6, 0, 0, 7); c.ellipse(x - w * 0.22, y - h * 0.25, w * 0.26, h * 0.6, 0, 0, 7); c.ellipse(x + w * 0.2, y - h * 0.2, w * 0.3, h * 0.55, 0, 0, 7); c.fill();
  }
  // birds
  c.strokeStyle = "rgba(40,20,60,.7)"; c.lineWidth = 2; c.lineCap = "round";
  for (let i = 0; i < 6; i++) { const bx = ((i * 190 + t * 22) % (W + 200)) - 100, by = hz * 0.32 + Math.sin(i * 2.1) * 40 + Math.sin(t * 0.7 + i) * 6, f = Math.sin(t * 6 + i) * 5; c.beginPath(); c.moveTo(bx - 10, by + f); c.quadraticCurveTo(bx - 4, by - 5, bx, by); c.quadraticCurveTo(bx + 4, by - 5, bx + 10, by + f); c.stroke(); }
  // mountains (a snow-capped peak far away)
  const mt = (pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, hz); pts.forEach(([x, y]) => c.lineTo(x * W, hz - y)); c.lineTo(W, hz); c.closePath(); c.fill(); };
  mt([[0, 60], [0.06, 95], [0.14, 150], [0.22, 220], [0.3, 150], [0.4, 100], [0.52, 68], [0.68, 100], [0.82, 78], [1, 96]], "#7a3f92");
  c.save(); c.beginPath(); c.moveTo(0.22 * W, hz - 220); c.lineTo(0.185 * W, hz - 176); c.lineTo(0.205 * W, hz - 184); c.lineTo(0.22 * W, hz - 170); c.lineTo(0.235 * W, hz - 184); c.lineTo(0.255 * W, hz - 176); c.closePath(); c.fillStyle = "#ffd9e6"; c.fill(); c.restore();
  mt([[0, 34], [0.12, 52], [0.28, 30], [0.44, 46], [0.6, 26], [0.78, 44], [1, 30]], "#5a2f7a");
  // far shore with tiny cherry trees
  c.fillStyle = "#3f2466"; c.fillRect(0, hz - 8, W * 0.5, 9);
  for (let x = 6; x < W * 0.5; x += 20 + mrn(x, 1) * 10) { const r = 9 + mrn(x, 2) * 8; c.fillStyle = "#3a2050"; c.fillRect(x - 1, hz - 8 - r * 0.6, 2, r * 0.7); c.fillStyle = mrn(x, 3) > 0.5 ? "#ff9ec4" : "#ff7fb2"; c.beginPath(); c.arc(x, hz - 9 - r * 0.9, r, 0, 7); c.arc(x + r * 0.7, hz - 8 - r * 0.6, r * 0.7, 0, 7); c.arc(x - r * 0.7, hz - 8 - r * 0.6, r * 0.7, 0, 7); c.fill(); }
  // ---- ocean ----
  gr = c.createLinearGradient(0, hz, 0, H); [[0, "#ffb377"], [0.08, "#f0708a"], [0.22, "#8a4fa0"], [0.55, "#28508a"], [1, "#0d2a5c"]].forEach(([p, col]) => gr.addColorStop(p, col));
  c.fillStyle = gr; c.fillRect(0, hz, W, H - hz);
  gr = c.createLinearGradient(0, hz, 0, hz + H * 0.32); gr.addColorStop(0, "rgba(255,230,160,.65)"); gr.addColorStop(1, "rgba(255,180,120,0)");
  c.fillStyle = gr; c.beginPath(); c.moveTo(sunX - 60, hz); c.lineTo(sunX + 60, hz); c.lineTo(sunX + 170, hz + H * 0.32); c.lineTo(sunX - 170, hz + H * 0.32); c.closePath(); c.fill();
  for (let i = 0; i < 18; i++) {
    const p = i / 17, y0 = hz + 5 + (H - hz) * Math.pow(p, 1.7), amp = 1.5 + p * 8, fr = 0.014 - p * 0.008, sp = 0.5 + p * 0.9;
    c.beginPath(); for (let x = 0; x <= W; x += 14) { const y = y0 + Math.sin(x * fr + t * sp + i) * amp + Math.sin(x * fr * 2.3 - t * sp * 0.7) * amp * 0.4; x ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.strokeStyle = `rgba(255,${200 + p * 40},${170 + p * 60},${0.16 + p * 0.06})`; c.lineWidth = 1.2 + p * 3; c.stroke();
  }
  for (let i = 0; i < 240; i++) { // glitter on the sun path
    const p = Math.pow(mrn(i, 1), 1.4), y = hz + 5 + p * (H - hz) * 0.9, spread = 40 + p * 300, x = sunX + (mrn(i, 2) + mrn(i, 3) + mrn(i, 4) - 1.5) * spread, tw = 0.5 + 0.5 * Math.sin(t * 2.6 + i * 1.7);
    c.fillStyle = `rgba(255,${235 - p * 40},${180 - p * 40},${tw * (1 - p * 0.45) * 0.9})`; c.fillRect(x, y, 6 + p * 34, 1.6 + p * 2);
  }
  // ---- bobber, line, ripples (the fisherman is waiting - nothing on the hook) ----
  const gx = W * 0.6 - 26 * sc, neckY = deckY - 6 - 40 * sc - 44 * sc, ang = 0.55, ux = -Math.cos(ang), uy = -Math.sin(ang), Lr = W * 0.19;
  const butt = { x: gx + 34 * sc, y: neckY + 30 * sc }, tip = { x: butt.x + ux * Lr, y: butt.y + uy * Lr };
  const bob = { x: W * 0.36, y: hz + (H - hz) * 0.36 + Math.sin(t * 1.6) * 2 };
  for (let r = 0; r < 3; r++) { const k = ((t * 0.5 + r / 3) % 1); c.strokeStyle = `rgba(255,240,210,${(1 - k) * 0.6})`; c.lineWidth = 2; c.beginPath(); c.ellipse(bob.x, bob.y + 6, 10 + k * 46, 3 + k * 12, 0, 0, 7); c.stroke(); }
  c.strokeStyle = "rgba(30,20,40,.75)"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(tip.x, tip.y); c.quadraticCurveTo((tip.x + bob.x) / 2, Math.max(tip.y, bob.y) + 40, bob.x, bob.y - 8); c.stroke();
  c.strokeStyle = "rgba(255,255,255,.28)"; c.beginPath(); c.moveTo(bob.x, bob.y + 8); c.lineTo(bob.x + 2, bob.y + 60); c.stroke();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(bob.x, bob.y, 9, 0, 7); c.fill(); c.fillStyle = "#ff4a55"; c.beginPath(); c.arc(bob.x, bob.y, 9, Math.PI, 0); c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(bob.x, bob.y, 9, 0, 7); c.stroke();
  // ---- pier ----
  const dx0 = W * 0.52;
  for (const px of [0.55, 0.67, 0.79, 0.91]) { const x = px * W; gr = c.createLinearGradient(x - 9, 0, x + 9, 0); gr.addColorStop(0, "#5a3a20"); gr.addColorStop(1, "#2e1c10"); c.fillStyle = gr; c.fillRect(x - 9, deckY + 20, 18, H - deckY); c.strokeStyle = `rgba(255,240,220,${0.4 + 0.2 * Math.sin(t * 2 + px * 9)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, deckY + 62, 22 + Math.sin(t * 2 + px * 9) * 2, 5, 0, 0, 7); c.stroke(); }
  c.fillStyle = "rgba(20,10,40,.28)"; c.fillRect(dx0 + 4, deckY + 24, W - dx0, 16);
  gr = c.createLinearGradient(0, deckY - 6, 0, deckY + 22); gr.addColorStop(0, "#c98a4a"); gr.addColorStop(0.3, "#a06a34"); gr.addColorStop(1, "#6a4022"); c.fillStyle = gr; c.fillRect(dx0, deckY - 6, W - dx0, 28);
  c.strokeStyle = "rgba(40,20,10,.55)"; c.lineWidth = 2; for (let x = dx0 + 26; x < W; x += 34) { c.beginPath(); c.moveTo(x, deckY - 6); c.lineTo(x, deckY + 20); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(dx0, deckY - 6, W - dx0 + 4, 28);
  // lantern
  const lx = dx0 + 20; c.fillStyle = "#4a2c18"; c.fillRect(lx - 3, deckY - 96, 6, 90);
  gr = c.createRadialGradient(lx, deckY - 106, 2, lx, deckY - 106, 90); gr.addColorStop(0, "rgba(255,220,130,.85)"); gr.addColorStop(1, "rgba(255,180,90,0)"); c.fillStyle = gr; c.fillRect(lx - 90, deckY - 196, 180, 180);
  c.fillStyle = "#ffe066"; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.roundRect(lx - 11, deckY - 122, 22, 24, 5); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.moveTo(lx - 15, deckY - 122); c.lineTo(lx, deckY - 134); c.lineTo(lx + 15, deckY - 122); c.closePath(); c.fill();
  // ---- the fisherman ----
  const fx0 = W * 0.6, feet = deckY - 6, hipY = feet - 40 * sc, sway = Math.sin(t * 1.1) * 1.5 * sc, nx0 = fx0 - 4 * sc + sway * 0.4, headY = neckY - 16 * sc;
  c.lineCap = "round"; c.lineJoin = "round";
  const lim = (x1, y1, x2, y2, w) => { c.strokeStyle = INK; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  lim(fx0, hipY, fx0 - 9 * sc, feet, 6 * sc); lim(fx0, hipY, fx0 + 11 * sc, feet, 6 * sc);
  lim(fx0, hipY, nx0, neckY, 7 * sc);
  const hand1 = { x: butt.x - 4 * sc, y: butt.y + 3 * sc }, hand2 = { x: butt.x + ux * 44 * sc, y: butt.y + uy * 44 * sc + 4 * sc };
  c.save(); c.translate(butt.x - ux * 6, butt.y - uy * 6); const rk = 1.15 * sc / 1.35; c.scale(rk, rk); drawRod(c, 0, 0, ux * (Lr + 6) / rk, uy * (Lr + 6) / rk, 4); c.restore();
  lim(nx0, neckY + 8 * sc, hand1.x, hand1.y, 5.5 * sc); lim(nx0, neckY + 8 * sc, hand2.x, hand2.y, 5.5 * sc);
  c.fillStyle = INK; c.beginPath(); c.arc(nx0 - 2 * sc, headY, 15 * sc, 0, 7); c.fill();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(nx0 - 9 * sc, headY - 2 * sc, 4.2 * sc, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(nx0 - 10.5 * sc, headY - 2 * sc, 2 * sc, 0, 7); c.fill();
  c.fillStyle = "#ffd23f"; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(nx0 - 2 * sc, headY - 10 * sc, 28 * sc, 6 * sc, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(nx0 - 15 * sc, headY - 12 * sc); c.quadraticCurveTo(nx0 - 2 * sc, headY - 34 * sc, nx0 + 11 * sc, headY - 12 * sc); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = "#e6a800"; c.lineWidth = 2; c.beginPath(); c.moveTo(nx0 - 14 * sc, headY - 16 * sc); c.lineTo(nx0 + 10 * sc, headY - 16 * sc); c.stroke();
  // warm rim light on the fisherman
  c.strokeStyle = "rgba(255,190,110,.55)"; c.lineWidth = 2; c.beginPath(); c.moveTo(nx0 - 11 * sc, headY - 6 * sc); c.arc(nx0 - 2 * sc, headY, 15 * sc, Math.PI * 1.02, Math.PI * 1.45); c.stroke();
  // ---- the big cherry tree on the right ----
  const tx = W * 0.9;
  c.strokeStyle = "#3a2216"; c.lineCap = "round"; c.lineWidth = 34 * sc / 1.3; c.beginPath(); c.moveTo(tx + 20, deckY); c.bezierCurveTo(tx - 10, H * 0.55, tx + 30, H * 0.4, tx - 6, H * 0.22); c.stroke();
  c.lineWidth = 14; c.beginPath(); c.moveTo(tx - 4, H * 0.3); c.quadraticCurveTo(W * 0.78, H * 0.24, W * 0.66, H * 0.17); c.stroke(); c.lineWidth = 9; c.beginPath(); c.moveTo(tx + 6, H * 0.36); c.quadraticCurveTo(W * 0.84, H * 0.36, W * 0.76, H * 0.31); c.stroke();
  const cols = ["#ff9ec7", "#ffb3d3", "#ff7fb5", "#ffd0e4", "#ff8fbe"];
  const blob = (cx, cy, r, i) => { c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); c.fillStyle = "rgba(255,230,240,.18)"; c.beginPath(); c.arc(cx - r * 0.25, cy - r * 0.3, r * 0.55, 0, 7); c.fill(); };
  for (let i = 0; i < 46; i++) blob(tx - 40 + (mrn(i, 1) - 0.5) * 480, H * 0.18 + (mrn(i, 2) - 0.5) * 250 + Math.sin(t * 0.5 + i) * 1.5, 34 + mrn(i, 3) * 34, i);
  for (let i = 0; i < 12; i++) blob(W * 0.66 + mrn(i, 4) * W * 0.16, H * 0.17 + mrn(i, 5) * H * 0.16, 16 + mrn(i, 6) * 14, i + 2);
  c.strokeStyle = "rgba(255,190,120,.5)"; c.lineWidth = 3; for (let i = 0; i < 46; i += 3) { const cx = tx - 40 + (mrn(i, 1) - 0.5) * 480, cy = H * 0.18 + (mrn(i, 2) - 0.5) * 250, r = 34 + mrn(i, 3) * 34; c.beginPath(); c.arc(cx, cy, r * 0.9, Math.PI * 0.85, Math.PI * 1.15); c.stroke(); }
  // ---- falling petals ----
  if (!menu.petals) menu.petals = Array.from({ length: 80 }, (_, i) => ({ x: mrn(i, 1) * W, y: mrn(i, 2) * H, v: 22 + mrn(i, 3) * 34, s: 4 + mrn(i, 4) * 5, ph: mrn(i, 5) * 6 }));
  for (const p of menu.petals) {
    const x = ((p.x - t * (26 + p.v * 0.5) + Math.sin(t * 0.9 + p.ph) * 26) % (W + 60) + W + 60) % (W + 60) - 30, y = ((p.y + t * p.v) % (H + 40)) - 20;
    c.save(); c.translate(x, y); c.rotate(t * 1.2 + p.ph); c.fillStyle = `rgba(255,${170 + p.s * 6},${205 + p.s * 3},.92)`; c.beginPath(); c.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 7); c.fill(); c.restore();
  }
  // vignette
  gr = c.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.75); gr.addColorStop(0, "rgba(20,0,40,0)"); gr.addColorStop(1, "rgba(20,0,40,.45)"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
}

// ---------- the start screen UI ----------
function menuLayout() {
  const cv = document.getElementById("menuCanvas"); if (!cv) return;
  cv.width = 1280; cv.height = Math.max(620, Math.min(1500, Math.round(1280 * window.innerHeight / window.innerWidth)));
}
function menuLoop(now) {
  requestAnimationFrame(menuLoop); // keep going even if one frame fails (e.g. before game.js has finished loading)
  if (!menu.open) return;
  try { const cv = document.getElementById("menuCanvas"); if (cv) menuDraw(cv.getContext("2d"), cv.width, cv.height, now / 1000); } catch (e) {}
}
function drawLockOverlay(cx, w, h) {
  cx.fillStyle = "rgba(10,8,20,.72)"; cx.fillRect(0, 0, w, h);
  cx.save(); cx.translate(w / 2, h / 2 - 6); cx.fillStyle = "#fff"; cx.strokeStyle = "#fff"; cx.lineWidth = 4;
  cx.beginPath(); cx.arc(0, -6, 16, Math.PI, 0); cx.stroke();
  cx.beginPath(); cx.roundRect(-24, -6, 48, 38, 6); cx.fill();
  cx.fillStyle = "#221a38"; cx.beginPath(); cx.arc(0, 12, 5, 0, 7); cx.fill();
  cx.restore();
}
function showMapPicker() {
  closeModal(); menu.pick = menu.pick || state.map;
  if (MAPS[menu.pick] && MAPS[menu.pick].lock && !MAPS[menu.pick].lock.ok()) menu.pick = state.map; // don't leave a locked card pre-selected
  const grid = document.getElementById("mapGrid"); grid.innerHTML = "";
  for (const id of MAP_ORDER) {
    const M = MAPS[id], T = MAP_TRAITS[id], locked = M.lock && !M.lock.ok(), card = document.createElement("div");
    card.className = "mcard" + (menu.pick === id ? " sel" : "") + (locked ? " locked" : "");
    const c = document.createElement("canvas"); c.width = 400; c.height = 220;
    const cx = c.getContext("2d"); drawMapIcon(cx, id); if (locked) drawLockOverlay(cx, 400, 220);
    card.appendChild(c);
    if (locked) {
      card.insertAdjacentHTML("beforeend", `<b>${M.name}</b><small class="bl">&#128274; ${M.lock.why}</small>`);
    } else {
      const count = FISH.filter(f => f.maps.includes(id)).length;
      card.insertAdjacentHTML("beforeend", `<b>${M.name}</b><small class="bl">${M.blurb} ${count} kinds of fish.</small>` + T.ups.map(u => `<span class="up">&#9650; ${u}</span>`).join("") + T.downs.map(d => `<span class="dn">&#9660; ${d}</span>`).join(""));
      card.onclick = () => { menu.pick = id; showMapPicker(); };
    }
    grid.appendChild(card);
  }
  document.getElementById("mapPick").hidden = false;
}
function startGame() {
  const id = menu.pick || state.map;
  if (id !== state.map) { state.map = id; if (!state.ownedMaps.includes(id)) state.ownedMaps.push(id); save(); switchMap(); }
  else if (!state.ownedMaps.includes(id)) { state.ownedMaps.push(id); save(); }
  menu.open = false; menuEl().hidden = true; document.getElementById("mapPick").hidden = true; closeModal();
  Snd.chime();
  if (typeof showTutorial === "function") showTutorial(); // first time only
}
function openMenu() { // back to the start screen (from the MENU button in game)
  closeModal(); save(); menu.pick = state.map; menu.open = true; menuEl().hidden = false; document.getElementById("mapPick").hidden = true; document.getElementById("leadPick").hidden = true;
}
document.getElementById("mStart").onclick = () => { if (!document.getElementById("mapPick").hidden) return; document.getElementById("leadPick").hidden = true; showMapPicker(); };
document.getElementById("mShop").onclick = () => { document.getElementById("mapPick").hidden = true; document.getElementById("leadPick").hidden = true; openModal("rod", "shop"); };
document.getElementById("mSet").onclick = () => { document.getElementById("mapPick").hidden = true; document.getElementById("leadPick").hidden = true; openModal("settings", "settings"); };
document.getElementById("mapGo").onclick = startGame;
document.getElementById("menuBtn").onclick = openMenu;
window.addEventListener("resize", menuLayout); menuLayout(); requestAnimationFrame(menuLoop);
