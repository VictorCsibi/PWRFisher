"use strict";
// Angler ranks: catch a specific rare fish to rank up, and your stickman dresses more like a pro each time.
// Loaded before game.js. Uses INK, ol(), star(), drawRod(), state, g, Snd, popup, save, fmt, bodyEl at call time.

const RANKS = [
  { name: "Rookie",     req: null, blurb: "Everybody starts somewhere. Straw hat and a dream." },
  { name: "Angler",     req: ["Bass", "Walleye", "Salmon", "Pufferfish"], blurb: "A red hat band, a lucky hook pin and a proper fishing vest." },
  { name: "Expert",     req: ["Tuna", "Catfish", "Octopus", "Pike", "Parrotfish", "Lava Eel", "Ember Octopus", "Barracuda", "Snakehead", "Halibut", "Stingray", "Coal Catfish", "Electric Eel", "Nile Perch", "Skeleton Fish", "Nebula Jelly"], blurb: "Sporty cap, sunglasses, a pocketed vest and rubber boots." },
  { name: "Pro Fisher", req: ["Swordfish", "Manta Ray", "Anglerfish", "Lionfish", "Moonfish", "Muskie", "Sturgeon", "Beluga", "Ice Angler", "Ember Angler", "Cinder Ray", "Winter Koi", "Aurora Salmon", "Alligator Gar", "Molten Marlin", "Albino Catfish", "Ghost Koi", "River Shark", "Lungfish", "Void Angler", "Gulper Eel", "Comet Ray", "Treasure Fish"], blurb: "Sponsored red cap, mirror shades, an orange pro vest, waders and a tackle pack." },
  { name: "Master",     req: ["Golden Fish", "Shark", "Giant Whale", "Golden Koi", "Narwhal", "Obsidian Shark", "Crystal Sturgeon", "Giant Squid", "Greenland Shark", "Ghost Shark", "Cypress Sturgeon", "Oarfish", "Galaxy Eel"], blurb: "A captain's hat, a navy jacket with gold buttons and a medal of honour." },
  { name: "Legend",     req: ["Sea Dragon", "Lake Serpent", "Orca", "Phoenix Koi", "Frost Serpent", "Inferno Whale", "Dragon Koi", "Swamp Serpent", "Pharaoh Fish", "Kraken", "Leviathan", "Cosmic Whale"], blurb: "Golden crown, royal cape and a glowing aura. The ocean bows to you." },
];

// Ranks come from BOTH how much money you have made and how many kinds of fish you have caught.
const RANK_NEED = [null, { money: 3000, kinds: 6 }, { money: 25000, kinds: 16 }, { money: 150000, kinds: 32 }, { money: 800000, kinds: 55 }, { money: 4000000, kinds: 85 }];
const myRank = () => Math.max(1, Math.min(RANKS.length, state.rank || 1));
const kindsCaught = () => Object.keys(state.caught).filter(k => state.caught[k] > 0).length;
function rankProgress() {
  const r = myRank(); if (r >= RANKS.length) return { pct: 1, max: true, ready: false };
  const n = RANK_NEED[r], mp = Math.min(1, Math.max(state.stats.earned || 0, state.money || 0) / n.money), kp = Math.min(1, kindsCaught() / n.kinds);
  return { pct: (mp + kp) / 2, mp, kp, max: false, ready: mp >= 1 && kp >= 1 };
}

function checkRank() {
  let up = 0;
  while (rankProgress().ready) { state.rank = myRank() + 1; up++; }
  if (!up) return;
  const r = myRank(); save();
  g.rankBanner = { name: RANKS[r - 1].name, life: 4.2 };
  Snd.rankUp(); fireworks(); X().pts += up; toast("SKILL POINT earned! Spend it in the Boosts page", "#e3c8ff"); if (typeof addGems === "function") addGems(2 * up, "rank up");
  g.confetti = g.confetti || [];
  for (let i = 0; i < 90; i++) g.confetti.push({ x: Math.random() * W, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 80, vy: 120 + Math.random() * 160, col: ["#ffd23f", "#ff5fa2", "#4d9dff", "#4fd66b", "#fff"][i % 5], rot: Math.random() * 6, life: 5 });
  refreshModal();
}

function updateRankFx(dt) {
  if (g.rankBanner) { g.rankBanner.life -= dt; if (g.rankBanner.life <= 0) g.rankBanner = null; }
  if (g.confetti) { for (const c of g.confetti) { c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += dt * 6; c.vx += Math.sin(c.rot) * 20 * dt; } g.confetti = g.confetti.filter(c => c.life > 0 && c.y < H + 20); }
}

// ---------- outfit pieces. G = { bx, lean, hipY, neckY, hx, footY } ----------
const OUTFIT = {
  vest: [null, null, "#a0703a", "#6b8f4e", "#ff8a2a", "#2b4a9a", "#f5c542"],
  hat: [null, "#ffd23f", "#ffd23f", "#2b6ad8", "#e23a3a", "#f4f4f4", "#ffd23f"],
};

function outfitBack(c, r, G) {
  const { bx, lean, hipY, neckY, footY } = G, t = Date.now() / 1000;
  if (r >= 6) { // golden aura
    const gl = c.createRadialGradient(bx, neckY + 30, 10, bx, neckY + 30, 120), a = 0.4 + Math.sin(t * 3) * 0.1;
    gl.addColorStop(0, `rgba(255,224,102,${a})`); gl.addColorStop(1, "rgba(255,224,102,0)");
    c.fillStyle = gl; c.beginPath(); c.arc(bx, neckY + 30, 120, 0, 7); c.fill();
    // cape
    const w = Math.sin(t * 3) * 6;
    c.fillStyle = "#c81e4a"; ol(c, 3);
    c.beginPath(); c.moveTo(bx + lean - 3, neckY + 6); c.lineTo(bx + lean - 40 + w, hipY + 22); c.lineTo(bx - 34 + w * 1.4, footY - 6); c.lineTo(bx - 6, footY - 10); c.lineTo(bx - 4, hipY + 6); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "#ffd23f"; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + lean - 40 + w, hipY + 22); c.lineTo(bx - 34 + w * 1.4, footY - 6); c.stroke();
  }
  if (r >= 4) { // tackle pack on the back
    c.fillStyle = r >= 5 ? "#2b4a9a" : "#ff8a2a"; ol(c, 3); c.beginPath(); c.roundRect(bx - 27, neckY + 10, 17, 28, 4); c.fill(); c.stroke();
    c.fillStyle = "#ffd23f"; c.fillRect(bx - 24, neckY + 18, 11, 5); c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(bx - 24, neckY + 18, 11, 5);
    c.strokeStyle = "#8a6a2a"; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 16, neckY + 10); c.lineTo(bx + lean, neckY + 6); c.stroke();
    c.strokeStyle = "#7a7f8a"; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 22, neckY + 10); c.lineTo(bx - 30, neckY - 20); c.stroke(); // spare rod tip
  }
}

function boot(c, x, y, col, trim) {
  c.fillStyle = col; ol(c, 3); c.beginPath(); c.roundRect(x - 6, y - 10, 19, 11, 4); c.fill(); c.stroke();
  if (trim) { c.fillStyle = trim; c.fillRect(x - 5, y - 10, 9, 3); }
}
function outfitLegs(c, r, G) {
  const { bx, hipY, footY } = G;
  const legs = () => { c.beginPath(); c.moveTo(bx, hipY); c.lineTo(bx - 18, footY - 6); c.moveTo(bx, hipY); c.lineTo(bx + 20, footY - 6); };
  if (r >= 4) { // waders / trousers over the black legs
    const col = r === 4 ? "#3f7d4a" : r === 5 ? "#1f2f6a" : "#e8b830";
    c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = 15; legs(); c.stroke(); c.strokeStyle = col; c.lineWidth = 10; legs(); c.stroke();
  }
  if (r >= 3) { const col = r >= 6 ? "#e8b830" : "#22252f"; boot(c, bx - 24, footY, col, r >= 5 ? "#ffd23f" : null); boot(c, bx + 14, footY, col, r >= 5 ? "#ffd23f" : null); }
}

function outfitTorso(c, r, G) {
  if (r < 2) return;
  const { bx, lean, hipY, neckY } = G, sx = bx + lean, top = neckY + 4, bot = hipY + 6;
  c.fillStyle = OUTFIT.vest[r]; ol(c, 3);
  c.beginPath(); c.moveTo(sx - 13, top); c.lineTo(sx + 13, top); c.lineTo(bx + 11, bot); c.lineTo(bx - 11, bot); c.closePath(); c.fill(); c.stroke();
  const mx = (sx + bx) / 2;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, top); c.lineTo(bx, bot); c.stroke(); // zip
  // pockets
  c.fillStyle = "rgba(0,0,0,.18)"; for (const k of [-1, 1]) { c.fillRect(mx + k * 8 - 4, hipY - 12, 8, 9); }
  if (r === 4) { // reflective stripes + sponsor patch
    c.fillStyle = "#e8f6ff"; c.fillRect(bx - 11, hipY - 20, 22, 4); c.fillRect(sx - 12, neckY + 12, 24, 3);
    c.fillStyle = "#fff"; c.beginPath(); c.arc(mx + 7, neckY + 24, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#e23a3a"; c.beginPath(); c.ellipse(mx + 7, neckY + 24, 3.5, 2, 0, 0, 7); c.fill();
  }
  if (r >= 5) { // gold buttons + medal
    c.fillStyle = "#ffd23f"; ol(c, 1.5); for (const k of [0.25, 0.5, 0.75]) { c.beginPath(); c.arc(sx + (bx - sx) * k - 3, top + (bot - top) * k, 2.2, 0, 7); c.fill(); c.stroke(); }
    c.strokeStyle = "#c81e4a"; c.lineWidth = 3; c.beginPath(); c.moveTo(mx + 6, neckY + 6); c.lineTo(mx + 8, neckY + 22); c.stroke();
    c.fillStyle = "#ffd23f"; ol(c, 2); c.beginPath(); c.arc(mx + 8, neckY + 27, 5, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#c98a00"; c.beginPath(); c.arc(mx + 8, neckY + 27, 2, 0, 7); c.fill();
  }
  if (r >= 6) { c.fillStyle = "#e23a3a"; ol(c, 1.5); c.beginPath(); c.arc(mx, neckY + 12, 3, 0, 7); c.fill(); c.stroke(); }
}

function outfitHead(c, r, G) {
  const { hx, neckY } = G, hy = neckY - 16, ey = neckY - 19, t = Date.now() / 1000;
  // sunglasses
  if (r >= 3) {
    const lens = r === 3 ? "#4d7cff" : r === 4 ? "#c9d6e2" : r === 5 ? "#ffcf4a" : "#c77dff";
    c.fillStyle = lens; c.strokeStyle = r >= 5 ? "#ffd23f" : "#fff"; c.lineWidth = 2.2; c.beginPath(); c.roundRect(hx + 1, ey - 5.5, 16, 11, 4); c.fill(); c.stroke();
    c.strokeStyle = r >= 5 ? "#ffd23f" : "#fff"; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + 1, ey - 1); c.lineTo(hx - 15, ey - 3); c.stroke();
    c.fillStyle = "rgba(255,255,255,.75)"; c.beginPath(); c.roundRect(hx + 4, ey - 4, 4, 3, 1); c.fill();
  }
  const hatCol = OUTFIT.hat[r];
  if (r <= 2) { // straw hat
    c.fillStyle = "#ffd23f"; ol(c, 4);
    c.beginPath(); c.ellipse(hx, neckY - 30, 26, 6, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(hx - 14, neckY - 31); c.quadraticCurveTo(hx, neckY - 58, hx + 14, neckY - 31); c.closePath(); c.fill(); c.stroke();
    if (r === 2) {
      c.strokeStyle = "#e23a3a"; c.lineWidth = 5; c.beginPath(); c.moveTo(hx - 13.5, neckY - 34); c.quadraticCurveTo(hx, neckY - 27, hx + 13.5, neckY - 34); c.stroke();
      c.strokeStyle = "#e6edf5"; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + 6, neckY - 40); c.lineTo(hx + 6, neckY - 33); c.arc(hx + 3, neckY - 33, 3, 0, Math.PI * 0.9); c.stroke(); // hook pin
    }
  } else if (r === 3 || r === 4) { // sports cap
    c.fillStyle = hatCol; ol(c, 3.5);
    c.beginPath(); c.arc(hx, neckY - 24, 18, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(hx + 16, neckY - 25, 15, 4.5, 0.12, 0, 7); c.fill(); c.stroke(); // visor
    c.fillStyle = "#fff"; c.beginPath(); c.arc(hx, neckY - 42, 2.5, 0, 7); c.fill();
    if (r === 4) { // sponsor patch with a little fish
      c.fillStyle = "#fff"; ol(c, 2); c.beginPath(); c.roundRect(hx - 2, neckY - 39, 17, 12, 3); c.fill(); c.stroke();
      c.fillStyle = "#e23a3a"; c.beginPath(); c.ellipse(hx + 6, neckY - 33, 5, 3, 0, 0, 7); c.moveTo(hx + 1, neckY - 33); c.lineTo(hx - 1, neckY - 36); c.lineTo(hx - 1, neckY - 30); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(hx - 17, neckY - 28); c.lineTo(hx + 17, neckY - 28); c.stroke();
    }
  } else if (r === 5) { // captain's hat
    c.fillStyle = "#f4f4f4"; ol(c, 3.5);
    c.beginPath(); c.moveTo(hx - 17, neckY - 27); c.lineTo(hx - 21, neckY - 43); c.quadraticCurveTo(hx, neckY - 55, hx + 21, neckY - 43); c.lineTo(hx + 17, neckY - 27); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#111a3a"; c.fillRect(hx - 17, neckY - 32, 34, 6); c.strokeRect(hx - 17, neckY - 32, 34, 6);
    c.fillStyle = "#111a3a"; c.beginPath(); c.ellipse(hx + 15, neckY - 26, 15, 4.5, 0.1, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#ffd23f"; ol(c, 2); c.beginPath(); c.arc(hx, neckY - 41, 6, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = "#8a5a00"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(hx, neckY - 45); c.lineTo(hx, neckY - 37); c.moveTo(hx - 3, neckY - 43); c.lineTo(hx + 3, neckY - 43); c.arc(hx, neckY - 38, 3, 0.2, Math.PI - 0.2); c.stroke(); // anchor
  } else { // crown
    c.fillStyle = "#ffd23f"; ol(c, 3.5);
    c.beginPath(); c.moveTo(hx - 15, neckY - 28); c.lineTo(hx - 17, neckY - 46); c.lineTo(hx - 8, neckY - 38); c.lineTo(hx, neckY - 50); c.lineTo(hx + 8, neckY - 38); c.lineTo(hx + 17, neckY - 46); c.lineTo(hx + 15, neckY - 28); c.closePath(); c.fill(); c.stroke();
    ol(c, 1.8); for (const [gx, gy, col] of [[-17, -46, "#e23a3a"], [0, -50, "#4d9dff"], [17, -46, "#4fd66b"]]) { c.fillStyle = col; c.beginPath(); c.arc(hx + gx, neckY + gy, 3, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = "#c98a00"; c.fillRect(hx - 15, neckY - 32, 30, 4);
    c.fillStyle = "#fff8b0"; ol(c, 1.4); for (const [sx, sy, k] of [[-30, -34, 0], [28, -46, 2], [26, 6, 4]]) { star(c, hx + sx, neckY + sy, 4 + 2 * Math.sin(t * 5 + k)); c.fill(); c.stroke(); }
  }
}

// ---------- pictures for the Ranks tab ----------
function drawRankPreview(c, r) {
  c.clearRect(0, 0, 200, 150);
  const sky = c.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, "#8fd6ff"); sky.addColorStop(1, "#e2f6ff"); c.fillStyle = sky; c.fillRect(0, 0, 200, 150);
  c.fillStyle = "#d9954f"; c.fillRect(0, 138, 200, 12); c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-2, 138, 204, 12);
  c.save(); c.translate(84, 138); c.scale(0.8, 0.8);
  const G = { bx: 0, lean: 0, hipY: -42, neckY: -92, hx: 0, footY: 0 };
  outfitBack(c, r, G);
  c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "#111"; c.lineWidth = 7;
  c.beginPath(); c.moveTo(0, -42); c.lineTo(-18, 0); c.moveTo(0, -42); c.lineTo(20, 0); c.stroke();
  outfitLegs(c, r, G);
  c.strokeStyle = "#111"; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -92); c.stroke();
  outfitTorso(c, r, G);
  c.strokeStyle = "#111"; c.lineWidth = 7; c.beginPath(); c.moveTo(0, -84); c.lineTo(8, -70); c.lineTo(28, -58); c.moveTo(0, -84); c.lineTo(2, -62); c.lineTo(14, -52); c.stroke();
  drawRod(c, 14, -52, 84, -104, Math.min(10, r + 1));
  c.fillStyle = "#111"; c.beginPath(); c.arc(0, -108, 17, 0, 7); c.fill();
  c.fillStyle = "#fff"; c.beginPath(); c.arc(8, -111, 4.5, 0, 7); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(10, -111, 2, 0, 7); c.fill();
  outfitHead(c, r, G);
  c.restore();
}

// Only ranks you have already earned are shown. Higher ranks stay a surprise until you unlock them.
function renderRanks() {
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  const grid = document.createElement("div"); grid.className = "grid ranks";
  const cur = myRank();
  RANKS.forEach((R, i) => {
    const r = i + 1; if (r > cur) return;
    const card = document.createElement("div"); card.className = "card" + (r === cur ? " equipped" : "");
    const c = document.createElement("canvas"); c.width = 200; c.height = 150; drawRankPreview(c.getContext("2d"), r); card.appendChild(c);
    card.insertAdjacentHTML("beforeend", `<b>${R.name}</b><small>${R.blurb}</small>`);
    const tag = document.createElement("button"); tag.disabled = true; tag.textContent = r === cur ? "YOUR RANK" : "UNLOCKED"; if (r === cur) tag.className = "on";
    card.appendChild(tag); grid.appendChild(card);
  });
  bodyEl.appendChild(grid);
  const note = document.createElement("small"); note.className = "ranknote"; note.textContent = cur < RANKS.length ? "Keep catching rare fish to discover your next rank..." : "You have reached the top rank!";
  bodyEl.appendChild(note); bodyEl.scrollTop = scroll;
}

// legs as hip -> knee -> foot so they can stand or sit
function drawLegsPose(c, rank, hip, kA, fA, kB, fB) {
  c.lineCap = "round"; c.lineJoin = "round";
  const poly = (k, f, dy = 0) => { c.beginPath(); c.moveTo(hip.x, hip.y); c.lineTo(k.x, k.y); c.lineTo(f.x, f.y - dy); };
  c.strokeStyle = "#111"; c.lineWidth = 7; poly(kA, fA); c.stroke(); poly(kB, fB); c.stroke();
  if (rank >= 4) {
    const col = rank === 4 ? "#3f7d4a" : rank === 5 ? "#1f2f6a" : "#e8b830";
    for (const [w, k] of [[15, INK], [10, col]]) { c.strokeStyle = k; c.lineWidth = w; poly(kA, fA, 6); c.stroke(); poly(kB, fB, 6); c.stroke(); }
  }
  if (rank >= 3) { const col = rank >= 6 ? "#e8b830" : "#22252f", trim = rank >= 5 ? "#ffd23f" : null; boot(c, fA.x - 6, fA.y, col, trim); boot(c, fB.x - 6, fB.y, col, trim); }
}
