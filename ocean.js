"use strict";
// The living ocean: a reef, schools of fish, reef residents, and roaming sea life. Each map has its own cast (see maps.js).
// Loaded before game.js; uses ctx, g, W, H, WATER_Y, INK, FISH, drawFish, lerp, clamp, rand, curMap, settings at call time.
// (Scene is authored dock-left and mirrored when drawn, like everything else.)

const fishByName = n => FISH.find(f => f.name === n);

// ---------- sprite cache (lets us draw dozens of fish cheaply) ----------
const spriteCache = new Map();
function fishSprite(f, len) {
  const key = `${f.name}|${f.color}|${f.deco}|${Math.round(len / 3)}`;
  let s = spriteCache.get(key); if (s) return s;
  const w = Math.ceil(len * 2.2) + 8, h = Math.ceil(len * 1.7) + 8;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  drawFish(c.getContext("2d"), w / 2, h / 2, f, len, 1, {});
  s = { c, w, h }; spriteCache.set(key, s); return s;
}
function blit(f, x, y, len, dir, alpha) {
  const s = fishSprite(f, len);
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(dir, 1); ctx.drawImage(s.c, -s.w / 2, -s.h / 2); ctx.restore();
}

// ---------- build (called on resize and whenever the map changes) ----------
function buildEcosystem() {
  const M = curMap(), E = M.eco;
  const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const floor = H - 36, span = floor - WATER_Y;
  const poolNames = FISH.filter(f => f.maps.includes(M.id));

  // reef / plants: back layer (z 0) and front layer (z 1)
  const total = E.reef.reduce((a, [, w]) => a + w, 0);
  const pick = r => { let x = r * total; for (const [t, w] of E.reef) { x -= w; if (x <= 0) return t; } return E.reef[0][0]; };
  const n = Math.round(W / 22);
  g.reef = Array.from({ length: n }, (_, i) => {
    const type = pick(rnd(i, 11)), z = rnd(i, 12) < 0.45 ? 0 : 1;
    return { type, z, x: rnd(i, 13) * W, s: (0.75 + rnd(i, 14) * 1.0) * (z ? 0.85 : 1), col: E.cols[Math.floor(rnd(i, 15) * E.cols.length)], col2: E.cols[Math.floor(rnd(i, 16) * E.cols.length)], ph: rnd(i, 17) * 6 };
  }).sort((a, b) => a.z - b.z);
  g.surface = Array.from({ length: E.surface || 0 }, (_, i) => ({ x: rnd(i, 31) * W, s: 0.8 + rnd(i, 32) * 0.7, ph: rnd(i, 33) * 6 }));
  g.deco.coral = [];
  g.deco.kelp = Array.from({ length: E.kelp }, (_, i) => ({ x: rnd(i, 1) * W, h: 90 + rnd(i, 2) * 130, ph: rnd(i, 3) * 6 }));

  // schools: a leader swims, members hold formation around it
  g.schools = E.schools.map((d, si) => ({
    f: { ...fishByName(d.n), color: d.tint }, len: d.len, dir: si % 2 ? -1 : 1, speed: rand(26, 42), x: rand(0, W), y: WATER_Y + 40 + d.depth * (span - 90), depth: d.depth, flee: 0,
    members: Array.from({ length: d.count }, () => ({ ox: rand(-70, 70), oy: rand(-34, 34), w: rand(0, 6), sz: rand(0.85, 1.15) })),
  }));

  // reef residents: colourful fish that loiter around the coral
  g.residents = E.residents.map((r, i) => ({
    f: { ...fishByName(r.n), color: r.col, deco: r.deco }, len: r.len,
    hx: rnd(i, 21) * W, hy: floor - 60 - rnd(i, 22) * (span * 0.32), rx: 50 + rnd(i, 23) * 90, ry: 14 + rnd(i, 24) * 30, w: 0.18 + rnd(i, 25) * 0.3, ph: rnd(i, 26) * 6,
  }));

  // open-water wanderers (this map's real species; the fish that bite are taken from them)
  g.wanderers = Array.from({ length: 36 }, () => makeWanderer(true)); g.wRespawn = 0; g.wClock = 0;

  // big roamers (some are predators the schools flee from)
  g.roamers = E.roam.map(r => ({ f: fishByName(r.name), len: r.len, y: WATER_Y + span * r.dy, x: rand(0, W), v: r.v * (Math.random() < 0.5 ? -1 : 1), alpha: r.alpha, pred: !!r.pred, ph: rand(0, 6) }));
  g.turtles = Array.from({ length: E.turtles }, (_, i) => ({ x: rand(0, W), y: WATER_Y + span * (0.3 + i * 0.2), v: (i % 2 ? -12 : 16), ph: i * 2 }));
  g.crabs = Array.from({ length: E.crabs }, (_, i) => ({ x: rand(0, W), v: 10, wait: 0, s: 0.8 + i * 0.1, col: E.crabCol }));
  g.jellies = Array.from({ length: E.jellies }, () => ({ f: { ...fishByName("Jellyfish"), color: E.jellyCols[Math.floor(Math.random() * E.jellyCols.length)] }, x: rand(0, W), y: WATER_Y + rand(0.3, 0.85) * span, ph: rand(0, 6), len: rand(44, 74) }));
  g.seahorses = Array.from({ length: E.seahorses }, (_, i) => ({ f: fishByName("Seahorse"), x: (g.deco.kelp[i] || { x: rand(0, W) }).x + 26, y: floor - 90 - i * 20, ph: rand(0, 6) }));
}

// ---------- update ----------
function updateEcosystem(dt) {
  if (g.wRespawn > 0) { g.wClock -= dt; if (g.wClock <= 0) { g.wanderers.push(makeWanderer(false)); g.wRespawn--; g.wClock = rand(1.5, 3.5); } } // a new fish swims in from the edge to replace one that was hooked
  const wrap = (o, pad = 140) => { if (o.x > W + pad) o.x = -pad; if (o.x < -pad) o.x = W + pad; };
  for (const w of g.wanderers) { w.x += w.v * dt; if (w.x > W + 120 || w.x < -120) Object.assign(w, makeWanderer(false)); } // a fish that swims off is replaced by a new one at the edge: your current gear decides what comes in, old fish stay until then
  for (const r of g.roamers) { r.x += r.v * dt; wrap(r, r.len); r.y += Math.sin(g.t * 0.4 + r.ph) * 8 * dt; }
  for (const t of g.turtles) { t.x += t.v * dt; wrap(t, 100); t.y += Math.sin(g.t * 0.6 + t.ph) * 10 * dt; }
  for (const c of g.crabs) { c.wait -= dt; if (c.wait <= 0) { c.v = rand(8, 20) * (Math.random() < 0.5 ? -1 : 1); c.wait = rand(2, 5); } c.x += c.v * dt; wrap(c, 60); }
  for (const j of g.jellies) { j.y += Math.sin(g.t * 0.8 + j.ph) * 14 * dt; j.x += Math.sin(g.t * 0.2 + j.ph) * 8 * dt; }
  // schools swim in formation and bolt away from any predator
  const preds = g.roamers.filter(r => r.pred);
  for (const s of g.schools) {
    let near = null, best = 260;
    for (const p of preds) { const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < best) { best = d; near = p; } }
    s.flee = lerp(s.flee, near ? 1 : 0, Math.min(1, dt * 2));
    s.x += s.dir * s.speed * (1 + s.flee * 2.4) * dt;
    if (near && s.flee > 0.1) s.y -= Math.sign(near.y - s.y || 1) * 30 * s.flee * dt;
    s.y = clamp(s.y, WATER_Y + 40, H - 120);
    if (s.x > W + 120) s.x = -120; if (s.x < -120) s.x = W + 120;
  }
}

// ---------- coral pieces (drawn at floor level, base at x,y) ----------
function ink(w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.lineCap = "round"; }

function coralBranch(x, y, s, col, ph) {
  const stems = [-0.6, -0.2, 0.22, 0.62];
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass ? col : INK; ctx.lineWidth = (pass ? 7 : 12.5) * s; ctx.lineCap = "round"; ctx.beginPath();
    stems.forEach((a, i) => {
      const sway = Math.sin(g.t * 1.1 + ph + i) * 3 * s, len = (52 + (i % 2) * 22) * s;
      const ex = x + Math.sin(a) * len * 0.95 + sway, ey = y - Math.cos(a) * len;
      ctx.moveTo(x + (i - 1.5) * 5 * s, y); ctx.quadraticCurveTo(x + Math.sin(a) * len * 0.3, y - len * 0.55, ex, ey);
      const fx = x + Math.sin(a) * len * 0.62 + sway * 0.6, fy = y - Math.cos(a) * len * 0.72;
      ctx.moveTo(fx, fy); ctx.lineTo(fx + (a < 0 ? -1 : 1) * 15 * s + sway * 0.3, fy - 22 * s);
    });
    ctx.stroke();
  }
}
function coralBrain(x, y, s, col) {
  ink(4); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 36 * s, 30 * s, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, 36 * s, 30 * s, 0, Math.PI, 0); ctx.clip();
  ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
  for (let r = 6; r < 34; r += 8) { ctx.beginPath(); for (let a = Math.PI; a <= Math.PI * 2; a += 0.3) { const rr = r * s + Math.sin(a * 5 + r) * 2 * s; a === Math.PI ? ctx.moveTo(x + Math.cos(a) * rr * 1.1, y + Math.sin(a) * rr) : ctx.lineTo(x + Math.cos(a) * rr * 1.1, y + Math.sin(a) * rr); } ctx.stroke(); }
  ctx.restore();
}
function coralFan(x, y, s, col, ph) {
  const sw = Math.sin(g.t * 0.9 + ph) * 3 * s;
  ink(4); ctx.fillStyle = col; ctx.globalAlpha *= 0.92;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 50 * s + sw, y - 70 * s); ctx.quadraticCurveTo(x + sw, y - 100 * s, x + 50 * s + sw, y - 70 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.globalAlpha /= 0.92;
  ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(x, y - 6 * s); ctx.lineTo(x + i * 15 * s + sw, y - (86 - Math.abs(i) * 5) * s); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(x + sw * 0.5, y - 50 * s, 26 * s, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
}
function coralTube(x, y, s, col, col2) {
  [[-16, 34, col], [-4, 56, col2], [10, 42, col], [22, 28, col2]].forEach(([dx, h, c], i) => {
    ink(4); ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x + dx * s - 6 * s, y - h * s, 12 * s, h * s, 5 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x + dx * s, y - h * s + 3 * s, 4 * s, 2.5 * s, 0, 0, 7); ctx.fill();
  });
}
function coralTable(x, y, s, col) {
  ink(4); ctx.fillStyle = "#c98a5e"; ctx.beginPath(); ctx.moveTo(x - 8 * s, y); ctx.lineTo(x - 5 * s, y - 34 * s); ctx.lineTo(x + 5 * s, y - 34 * s); ctx.lineTo(x + 8 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y - 38 * s, 54 * s, 13 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y - 40 * s, 38 * s, 7 * s, 0, 0, 7); ctx.stroke();
}
function anemone(x, y, s, col, ph) {
  ink(4); ctx.fillStyle = "#b86a7a"; ctx.beginPath(); ctx.roundRect(x - 14 * s, y - 16 * s, 28 * s, 16 * s, 6 * s); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 13; i++) {
    const bx = x + (i - 6) * 4.4 * s, len = (26 + (i % 3) * 8) * s, sw = Math.sin(g.t * 1.6 + i + ph) * 6 * s;
    for (const [c, w] of [[INK, 6.5 * s], [col, 3.4 * s]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx, y - 14 * s); ctx.quadraticCurveTo(bx + sw, y - len * 0.7, bx + sw * 1.4 + (i - 6) * 1.6 * s, y - len - 12 * s); ctx.stroke(); }
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(bx + sw * 1.4 + (i - 6) * 1.6 * s, y - len - 12 * s, 2.2 * s, 0, 7); ctx.fill();
  }
}
function sponge(x, y, s, col) {
  [[-10, 40], [4, 56], [16, 34]].forEach(([dx, h]) => { ink(4); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x + dx * s - 7 * s, y - h * s, 14 * s, h * s, [7 * s, 7 * s, 2, 2]); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(x + dx * s, y - h * s + 4 * s, 4.5 * s, 3 * s, 0, 0, 7); ctx.fill(); });
}
function clam(x, y, s, ph) {
  const open = 0.35 + Math.sin(g.t * 0.7 + ph) * 0.2;
  ink(4); ctx.fillStyle = "#b9a58a";
  ctx.beginPath(); ctx.ellipse(x, y - 8 * s, 30 * s, 12 * s, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff8fc8"; ctx.beginPath(); ctx.ellipse(x, y - 10 * s, 26 * s, 5 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y - 12 * s, 4 * s, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#cbb89c"; ctx.save(); ctx.translate(x, y - 12 * s); ctx.rotate(-open); ctx.beginPath(); ctx.ellipse(0, -10 * s, 30 * s, 12 * s, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function urchin(x, y, s) {
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round"; ctx.beginPath();
  for (let i = 0; i < 18; i++) { const a = -Math.PI + (i / 17) * Math.PI; ctx.moveTo(x + Math.cos(a) * 8 * s, y - 8 * s + Math.sin(a) * 8 * s); ctx.lineTo(x + Math.cos(a) * 19 * s, y - 8 * s + Math.sin(a) * 19 * s); }
  ctx.stroke(); ink(3); ctx.fillStyle = "#5b2a8a"; ctx.beginPath(); ctx.arc(x, y - 8 * s, 9 * s, 0, 7); ctx.fill(); ctx.stroke();
}
function starfish(x, y, s, col) {
  ink(3); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 * s : 13 * s, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(x + Math.cos(a) * r, y - 12 * s + Math.sin(a) * r * 0.9); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
}
function seagrass(x, y, s, ph, gcol = "#43c86a") {
  for (const [c, w] of [[INK, 6 * s], [gcol, 3.2 * s]]) {
    ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath();
    for (let b = -2; b <= 2; b++) { const h = (46 + Math.abs(b) * -8 + (b % 2) * 12) * s, sw = Math.sin(g.t * 1.5 + ph + b) * 8 * s; ctx.moveTo(x + b * 6 * s, y); ctx.quadraticCurveTo(x + b * 6 * s + sw * 0.4, y - h * 0.5, x + b * 7 * s + sw, y - h); }
    ctx.stroke();
  }
}
// ---------- creatures ----------
function drawTurtle(t) {
  const dir = t.v > 0 ? 1 : -1, flap = Math.sin(g.t * 2.2 + t.ph);
  ctx.save(); ctx.translate(t.x, t.y); ctx.scale(dir, 1); ink(3.5);
  // back flipper + tail
  ctx.fillStyle = "#5fbf6a"; ctx.beginPath(); ctx.ellipse(-30, 12 + flap * 3, 12, 6, 0.6, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-36, 2); ctx.lineTo(-48, 6); ctx.lineTo(-36, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  // front flipper (far)
  ctx.beginPath(); ctx.ellipse(14, -8 - flap * 6, 20, 6, -0.7 - flap * 0.3, 0, 7); ctx.fill(); ctx.stroke();
  // head
  ctx.beginPath(); ctx.ellipse(38, -2, 13, 9, 0.1, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(43, -5, 3.4, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(44, -5, 1.6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(46, 1, 4, 0.2, 1.6); ctx.stroke();
  // shell
  ctx.fillStyle = "#8a6a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 34, 22, 0, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#b58c3c"; ctx.beginPath(); ctx.ellipse(0, -1, 26, 15, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "rgba(60,40,10,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.moveTo(10, -13); ctx.lineTo(4, 0); ctx.lineTo(10, 13); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.stroke();
  // front flipper (near)
  ink(3.5); ctx.fillStyle = "#5fbf6a"; ctx.beginPath(); ctx.ellipse(12, 14 + flap * 6, 20, 6, 0.7 + flap * 0.3, 0, 7); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function drawCrab(c, y) {
  const dir = c.v > 0 ? 1 : -1, step = Math.sin(g.t * 9 + c.x * 0.1) * (c.wait > 0 ? 1 : 0);
  ctx.save(); ctx.translate(c.x, y); ctx.scale(c.s * dir, c.s); ink(3);
  ctx.strokeStyle = INK; ctx.lineWidth = 3;
  for (const k of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(k * 10, -6); ctx.lineTo(k * (18 + i * 4), -2 + (i % 2) * step * 2); ctx.lineTo(k * (20 + i * 4), 4); ctx.stroke(); }
  ctx.fillStyle = c.col || "#ff5a4a"; ctx.beginPath(); ctx.ellipse(0, -9, 15, 10, 0, 0, 7); ctx.fill(); ctx.stroke();
  for (const k of [-1, 1]) { // claws
    ctx.beginPath(); ctx.moveTo(k * 12, -12); ctx.lineTo(k * 20, -22); ctx.stroke();
    ctx.fillStyle = c.col || "#ff5a4a"; ctx.beginPath(); ctx.arc(k * 22, -25, 6, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c93a2e"; ctx.beginPath(); ctx.moveTo(k * 22, -25); ctx.lineTo(k * 26, -32); ctx.lineTo(k * 18, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-5, -16); ctx.lineTo(-5, -22); ctx.moveTo(5, -16); ctx.lineTo(5, -22); ctx.stroke();
  ctx.fillStyle = "#fff"; for (const k of [-5, 5]) { ctx.beginPath(); ctx.arc(k, -23, 3.2, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(k + 0.6, -23, 1.3, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; }
  ctx.restore();
}

function drawReefItem(r, y) {
  const E = curMap().eco;
  switch (r.type) {
    case "branch": coralBranch(r.x, y, r.s, r.col, r.ph); break;
    case "brain": coralBrain(r.x, y, r.s, r.col); break;
    case "fan": coralFan(r.x, y, r.s, r.col, r.ph); break;
    case "tube": coralTube(r.x, y, r.s, r.col, r.col2); break;
    case "table": coralTable(r.x, y, r.s, r.col); break;
    case "anemone": anemone(r.x, y, r.s, r.col, r.ph); break;
    case "sponge": sponge(r.x, y, r.s, r.col); break;
    case "clam": clam(r.x, y, r.s, r.ph); break;
    case "urchin": urchin(r.x, y, r.s); break;
    case "star": starfish(r.x, y, r.s, r.col); break;
    case "grass": seagrass(r.x, y, r.s, r.ph, E.grassCol); break;
    default: if (MAP_ITEMS[r.type]) MAP_ITEMS[r.type](r, y);
  }
}

// ---------- draw ----------
function drawReefBack() {
  const y = H - 36 + 8;
  for (const r of g.reef) if (r.z === 0) { ctx.globalAlpha = 0.9; drawReefItem(r, y + Math.sin(r.x) * 3); }
  ctx.globalAlpha = 1;
  // a cool wash so the back layer feels farther away
  const wash = ctx.createLinearGradient(0, H - 260, 0, H); wash.addColorStop(0, "rgba(20,70,150,0)"); wash.addColorStop(1, "rgba(20,70,150,.28)");
  ctx.fillStyle = wash; ctx.fillRect(0, H - 260, W, 260);
}

function drawEcoFish() {
  const alphaAt = y => clamp(0.85 - (y - WATER_Y) / (H - WATER_Y) * 0.3, 0.5, 0.85);
  for (const r of g.roamers) if (r.alpha < 0.4) blit(r.f, r.x, r.y, r.len, r.v > 0 ? 1 : -1, r.alpha); // far away giants first
  for (const f of g.wanderers) blit(f.f, f.x, f.y + Math.sin(g.t * 0.8 + f.ph) * 6, f.s, f.v > 0 ? 1 : -1, alphaAt(f.y) * 0.85);
  for (const r of g.roamers) if (r.alpha >= 0.4) blit(r.f, r.x, r.y, r.len, r.v > 0 ? 1 : -1, r.alpha);
  for (const j of g.jellies) { ctx.globalAlpha = 0.75; drawFish(ctx, j.x, j.y, j.f, j.len, 1, {}); }
  ctx.globalAlpha = 1;
  for (const s of g.schools) {
    for (const m of s.members) {
      const spread = 1 + s.flee * -0.5;
      blit(s.f, s.x + m.ox * spread + Math.sin(g.t * 1.6 + m.w) * 6, s.y + m.oy * spread + Math.sin(g.t * 2.1 + m.w) * 5, s.len * m.sz, s.dir, alphaAt(s.y));
    }
  }
  for (const t of g.turtles) { ctx.globalAlpha = 0.95; drawTurtle(t); }
  ctx.globalAlpha = 1;
}

function drawReefFront() {
  const y = H - 36 + 14;
  for (const r of g.reef) if (r.z === 1) drawReefItem(r, y + Math.sin(r.x) * 3);
  for (const p of g.surface) lilyPad(p.x, p.s, p.ph);
  if (!settings.bgFish) return;
  for (const r of g.residents) {
    const a = g.t * r.w + r.ph, x = r.hx + Math.sin(a) * r.rx, y2 = r.hy + Math.cos(a * 1.3) * r.ry, dir = Math.cos(a) > 0 ? 1 : -1;
    blit(r.f, x, y2, r.len, dir, 0.95);
  }
  for (const s of g.seahorses) { ctx.globalAlpha = 0.9; drawFish(ctx, s.x, s.y + Math.sin(g.t + s.ph) * 6, s.f, 44, 1, {}); }
  ctx.globalAlpha = 1;
  for (const c of g.crabs) drawCrab(c, y + 4);
}
