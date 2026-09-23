"use strict";
// Five more prestige items (tiers 11-15) in every shop category. Loaded after items2.js, before game.js.
// Uses INK, ol(), star(), drawFish(), FISH, RODS, LINES, BAITS, BUCKETS, CHAIRS, STRENGTHS, CATS, COSTS at call time.

// ---------- data ----------
RODS.push(
  { name: "Sapphire Rod",  col: "#2b5fd8", col2: "#173a94", grip: "#12244f", reel: "#8dc8ff", feature: "gem", gem: "#7fd0ff" },
  { name: "Obsidian Rod",  col: "#1d1a26", col2: "#ff5a2a", grip: "#000000", reel: "#ff5a2a", feature: "glow" },
  { name: "Lightning Rod", col: "#ffe14a", col2: "#c98a00", grip: "#3a3a3a", reel: "#4d9dff", feature: "bolt" },
  { name: "Galaxy Rod",    col: "#2a1a6a", col2: "#b45cff", grip: "#12082f", reel: "#ffd23f", feature: "galaxy" },
  { name: "Fish King Rod", col: "#ffffff", col2: "#ffd23f", grip: "#7a2fa8", reel: "#ffd23f", feature: "rainbow" },
);
LINES.push({ name: "Aqua Silk", col: "#5ff0ff" }, { name: "Fire Line", col: "#ff7a2f" }, { name: "Storm Line", col: "#8ab4ff" }, { name: "Star Thread", col: "#fff3a0" }, { name: "Cosmic Line", col: "#ff5fe0" });
BAITS.push({ name: "Crab Bait" }, { name: "Octopus Lure" }, { name: "Lightning Lure" }, { name: "Ghost Lure" }, { name: "Dragon Lure" });
BUCKETS.push({ name: "Ice Chest" }, { name: "Steel Vault" }, { name: "Pirate Chest" }, { name: "Magic Cauldron" }, { name: "Space Pod" });
CHAIRS.push({ name: "Gaming Chair" }, { name: "Massage Chair" }, { name: "Hover Chair" }, { name: "Cloud Sofa" }, { name: "Rainbow Throne" });
STRENGTHS.push({ name: "Ramen Bowl" }, { name: "Ice Cream" }, { name: "Cake Slice" }, { name: "Cheeseburger" }, { name: "Royal Banquet" });
COSTS.push(20000, 32000, 50000, 80000, 125000);

// what the new tiers do (the stats keep growing where they can)
{
  const lineStat = CATS.line.stat, bucketStat = CATS.bucket.stat;
  CATS.line.stat = t => t <= 10 ? lineStat(t) : `Lucky line: rare fish odds +${(t - 10) * 8}%. Lasts about ${Math.round(8 + t * 5 + t * t * 0.6)} reels`;
  CATS.bucket.stat = t => t <= 9 ? bucketStat(t) : `Holds any fish${t > 10 ? ` and keeps it fresh: sells for +${(t - 10) * 10}%` : ""}`;
}

// ---------- rods ----------
const __rod0 = drawRod;
drawRod = function (c, x0, y0, x1, y1, t) {
  __rod0(c, x0, y0, x1, y1, t);
  if (t <= 10) return;
  const R = RODS[t - 1], dx = x1 - x0, dy = y1 - y0, at = u => [x0 + dx * u, y0 + dy * u], tm = Date.now() / 1000;
  c.save(); c.lineCap = "round";
  if (R.feature === "glow") { c.shadowColor = "#ff5a2a"; c.shadowBlur = 10; c.strokeStyle = "#ff7a3a"; c.lineWidth = 2; c.setLineDash([4, 7]); c.beginPath(); c.moveTo(...at(0.28)); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); }
  if (R.feature === "bolt") { c.shadowColor = "#fff8b0"; c.shadowBlur = 12; c.strokeStyle = "#fff8b0"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + 8, y1 - 9); c.lineTo(x1 + 3, y1 - 9); c.lineTo(x1 + 12, y1 - 22); c.stroke(); for (const u of [0.45, 0.7]) { const [px, py] = at(u); c.beginPath(); c.moveTo(px, py - 5); c.lineTo(px + 5, py - 11); c.lineTo(px + 1, py - 11); c.lineTo(px + 6, py - 18); c.stroke(); } }
  if (R.feature === "galaxy") { c.fillStyle = "#fff8b0"; ol(c, 1.4); for (const [u, k] of [[0.4, 0], [0.62, 2], [0.82, 4], [1, 1]]) { const [px, py] = at(u); star(c, px, py - 9, 3.5 + 2 * Math.sin(tm * 4 + k)); c.fill(); c.stroke(); } }
  if (t === 15) { const [px, py] = at(1); c.fillStyle = "#ffd23f"; ol(c, 2); c.beginPath(); c.moveTo(px - 8, py - 4); c.lineTo(px - 9, py - 15); c.lineTo(px - 4, py - 9); c.lineTo(px, py - 17); c.lineTo(px + 4, py - 9); c.lineTo(px + 9, py - 15); c.lineTo(px + 8, py - 4); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
};

// ---------- lines and bobbers ----------
const __line0 = strokeLine;
strokeLine = function (c, t, ...rest) { __line0(c, t === 15 ? 10 : t, ...rest); }; // the top line is rainbow too
const __bob0 = drawBobber;
drawBobber = function (c, t, x, y, s = 1) {
  if (t <= 10) return __bob0(c, t, x, y, s);
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 3);
  switch (t) {
    case 11: c.shadowColor = "#ffd23f"; c.shadowBlur = 12; c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.lineWidth = 2.5; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); c.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); } c.stroke(); break;
    case 12: c.shadowColor = "#ff7a2f"; c.shadowBlur = 12; c.fillStyle = "#ff7a2f"; c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(12, -2, 7, 8); c.quadraticCurveTo(0, 14, -7, 8); c.quadraticCurveTo(-12, -2, 0, -14); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "#ffe066"; c.beginPath(); c.moveTo(0, -4); c.quadraticCurveTo(6, 2, 3, 8); c.quadraticCurveTo(0, 10, -3, 8); c.quadraticCurveTo(-6, 2, 0, -4); c.fill(); break;
    case 13: c.shadowColor = "#fff8b0"; c.shadowBlur = 12; c.fillStyle = "#ffe14a"; c.beginPath(); c.moveTo(3, -15); c.lineTo(-8, 2); c.lineTo(-1, 2); c.lineTo(-5, 15); c.lineTo(9, -3); c.lineTo(2, -3); c.closePath(); c.fill(); c.shadowBlur = 0; c.stroke(); break;
    case 14: c.shadowColor = "#fff8d6"; c.shadowBlur = 10; c.fillStyle = "#fff8d6"; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.fillStyle = "rgba(30,30,80,.85)"; c.beginPath(); c.arc(5, -3, 8, 0, 7); c.fill(); c.strokeStyle = "#e6dca8"; c.lineWidth = 1.5; c.beginPath(); c.arc(-4, 4, 2, 0, 7); c.stroke(); break;
    case 15: { const gr = c.createRadialGradient(-3, -3, 1, 0, 0, 12); gr.addColorStop(0, "#fff"); gr.addColorStop(0.3, "#ff8cf0"); gr.addColorStop(0.7, "#5a3ad8"); gr.addColorStop(1, "#1a0f4a"); c.shadowColor = "#b45cff"; c.shadowBlur = 14; c.fillStyle = gr; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 6, 0.3, 3.6); c.stroke(); c.fillStyle = "#fff8b0"; ol(c, 1.2); star(c, 10, -10, 4 + Math.sin(Date.now() / 200)); c.fill(); c.stroke(); break; }
  }
  c.restore();
};

// ---------- baits ----------
const __bait0 = drawBait;
drawBait = function (c, t, x, y, s = 1) {
  if (t <= 10) return __bait0(c, t, x, y, s);
  c.save(); c.translate(x, y); c.scale(s, s); ol(c, 2.5);
  switch (t) {
    case 11: c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); for (const k of [-1, 1]) for (let i = 0; i < 3; i++) { c.moveTo(k * 6, 4); c.lineTo(k * (12 + i * 2), 9 + i * 2); } c.stroke(); ol(c, 2.5); c.fillStyle = "#e23a3a"; c.beginPath(); c.ellipse(0, 1, 10, 7, 0, 0, 7); c.fill(); c.stroke(); for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * 8, -3); c.lineTo(k * 13, -9); c.stroke(); c.fillStyle = "#e23a3a"; c.beginPath(); c.arc(k * 14, -11, 4, 0, 7); c.fill(); c.stroke(); } c.fillStyle = "#fff"; for (const k of [-3, 3]) { c.beginPath(); c.arc(k, -6, 2, 0, 7); c.fill(); c.stroke(); } break;
    case 12: c.fillStyle = "#c75bff"; for (const k of [-6, -2, 2, 6]) { for (const [col, w] of [[INK, 4.5], ["#c75bff", 2.5]]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(k, 2); c.quadraticCurveTo(k + 4, 8, k - 2, 13); c.stroke(); } } ol(c, 2.5); c.beginPath(); c.ellipse(0, -4, 10, 9, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; for (const k of [-4, 4]) { c.beginPath(); c.arc(k, -4, 2.5, 0, 7); c.fill(); c.stroke(); } break;
    case 13: c.shadowColor = "#fff8b0"; c.shadowBlur = 10; c.fillStyle = "#ffe14a"; c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.beginPath(); c.moveTo(-9, 0); c.lineTo(-16, -6); c.lineTo(-16, 6); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "#a06a00"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -5); c.lineTo(-3, 0); c.lineTo(2, 0); c.lineTo(-1, 5); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(7, -1, 1.6, 0, 7); c.fill(); break;
    case 14: c.globalAlpha = 0.85; c.shadowColor = "#e6f6ff"; c.shadowBlur = 14; c.fillStyle = "#f4f9ff"; c.beginPath(); c.ellipse(0, 0, 11, 7, 0, 0, 7); c.fill(); c.shadowBlur = 0; c.stroke(); c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-14, -8, -19, -3); c.quadraticCurveTo(-15, 0, -19, 4); c.quadraticCurveTo(-14, 8, -9, 0); c.fill(); c.stroke(); c.globalAlpha = 1; c.fillStyle = INK; c.beginPath(); c.arc(5, -2, 2, 0, 7); c.arc(5, -2, 0.1, 0, 7); c.fill(); break;
    case 15: c.fillStyle = "#3fbf6a"; c.beginPath(); c.ellipse(0, 0, 12, 7, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(-17, -6); c.lineTo(-17, 6); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; for (let i = 0; i < 4; i++) { const px = -6 + i * 5; c.beginPath(); c.moveTo(px - 2.5, -6); c.lineTo(px, -12); c.lineTo(px + 2.5, -6); c.closePath(); c.fill(); c.stroke(); } for (const k of [3, 9]) { c.beginPath(); c.moveTo(k - 2, -6); c.lineTo(k + 1, -13); c.lineTo(k + 3, -6); c.closePath(); c.fill(); } c.fillStyle = "#e23a3a"; c.beginPath(); c.arc(6, -2, 2.4, 0, 7); c.fill(); c.fillStyle = "#ff7a2f"; c.beginPath(); c.moveTo(11, 1); c.quadraticCurveTo(18, -2, 21, 2); c.quadraticCurveTo(18, 6, 11, 3); c.closePath(); c.fill(); break;
  }
  c.restore();
};

// ---------- buckets (origin bottom-centre, mouth at y = -36) ----------
const __bucket0 = drawBucketArt;
drawBucketArt = function (c, t) {
  if (t <= 10) return __bucket0(c, t);
  ol(c, 4);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  switch (t) {
    case 11: R(-30, -36, 60, 36, "#9fd8ff", 4); R(-33, -41, 66, 9, "#e6f6ff", 5); c.fillStyle = "#fff"; ol(c, 2.5); for (const x of [-22, -6, 10, 24]) { c.beginPath(); c.arc(x, -42, 6, Math.PI, 0); c.fill(); c.stroke(); } ol(c, 4); R(-10, -8 - 12, 20, 6, "#4d9dff", 3); c.strokeStyle = "#fff"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -16); c.moveTo(-6, -27); c.lineTo(6, -19); c.moveTo(6, -27); c.lineTo(-6, -19); c.stroke(); break;
    case 12: R(-30, -36, 60, 36, "#8c99ab", 4); c.fillStyle = "#c9d6e2"; ol(c, 2.5); for (const [x, y] of [[-26, -32], [26, -32], [-26, -4], [26, -4]]) { c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); c.stroke(); } ol(c, 3.5); c.fillStyle = "#c9d6e2"; c.beginPath(); c.arc(0, -18, 11, 0, 7); c.fill(); c.stroke(); c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -18); c.lineTo(6, -24); c.stroke(); R(14, -22, 10, 8, "#ffd23f", 2); break;
    case 13: R(-30, -36, 60, 36, "#5a3a1a", 4); R(-30, -38, 60, 6, "#ffd23f", 2); R(-30, -6, 60, 6, "#ffd23f", 2); for (const x of [-22, 16]) R(x, -36, 6, 36, "#ffd23f", 1); c.fillStyle = "#f4f4f4"; ol(c, 2.5); c.beginPath(); c.arc(0, -20, 8, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; for (const k of [-3, 3]) { c.beginPath(); c.arc(k, -21, 1.8, 0, 7); c.fill(); } c.fillRect(-3, -15, 6, 3); break;
    case 14: c.save(); c.shadowColor = "#7dffa0"; c.shadowBlur = 14; c.fillStyle = "#7dffa0"; c.beginPath(); c.ellipse(0, -37, 22, 5, 0, 0, 7); c.fill(); c.restore(); c.fillStyle = "#2a2a35"; c.beginPath(); c.moveTo(-26, -36); c.lineTo(26, -36); c.quadraticCurveTo(40, -16, 22, -2); c.lineTo(-22, -2); c.quadraticCurveTo(-40, -16, -26, -36); c.closePath(); c.fill(); c.stroke(); R(-32, -40, 64, 6, "#3a3a48", 3); for (const x of [-16, 12]) R(x, -4, 6, 6, "#1c1c26", 1); c.fillStyle = "rgba(125,255,160,.9)"; for (const [x, y, r] of [[-8, -46, 3], [4, -52, 4], [12, -44, 2.5]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } break;
    case 15: c.save(); c.shadowColor = "#4d9dff"; c.shadowBlur = 14; R(-26, -36, 52, 36, "#c9d6e2", [10, 10, 16, 16]); c.restore(); c.fillStyle = "#4d9dff"; c.beginPath(); c.arc(0, -20, 9, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.arc(-3, -23, 3, 0, 7); c.fill(); c.fillStyle = "#e23a3a"; c.fillRect(-26, -8, 52, 5); c.strokeRect(-26, -8, 52, 5); for (const k of [-1, 1]) { c.fillStyle = "#8c99ab"; c.beginPath(); c.moveTo(k * 26, -12); c.lineTo(k * 38, 0); c.lineTo(k * 26, 0); c.closePath(); c.fill(); c.stroke(); } break;
  }
};

// ---------- chairs (seat top at y = -26) ----------
const __chair0 = drawChairArt;
drawChairArt = function (c, t) {
  if (t <= 10) return __chair0(c, t);
  ol(c, 3.5);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const L = (x1, y1, x2, y2, col, w = 5) => { c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); ol(c, 3.5); };
  switch (t) {
    case 11: L(0, -20, -18, -2, "#4a4f5c"); L(0, -20, 18, -2, "#4a4f5c"); L(0, -22, 0, -6, "#4a4f5c"); for (const x of [-20, 20]) { c.fillStyle = "#22252f"; c.beginPath(); c.arc(x, -2, 3.5, 0, 7); c.fill(); c.stroke(); } R(-22, -34, 40, 10, "#22252f", 5); R(-28, -76, 15, 50, "#22252f", 7); R(-26, -68, 4, 34, "#e23a3a", 2); R(-30, -86, 19, 13, "#e23a3a", 5); R(2, -44, 20, 6, "#4a4f5c", 3); break;
    case 12: for (const x of [-16, 10]) R(x, -8, 6, 8, "#3a2410", 1); R(-24, -68, 17, 44, "#8a4f2a", 8); R(-20, -32, 42, 12, "#8a4f2a", 6); R(16, -26, 30, 10, "#8a4f2a", 4); c.fillStyle = "#b06a3a"; ol(c, 2); for (const y of [-58, -46, -34]) { c.beginPath(); c.arc(-16, y, 4, 0, 7); c.fill(); c.stroke(); } R(20, -40, 8, 6, "#ffd23f", 2); break;
    case 13: { const gl = c.createRadialGradient(0, -3, 3, 0, -3, 44); gl.addColorStop(0, "rgba(120,200,255,.8)"); gl.addColorStop(1, "rgba(120,200,255,0)"); c.fillStyle = gl; c.beginPath(); c.ellipse(0, -3, 44, 12, 0, 0, 7); c.fill(); R(-24, -64, 16, 40, "#4d9dff", 8); R(-20, -32, 40, 12, "#4d9dff", 6); R(-12, -22, 24, 6, "#2b6ad8", 3); c.fillStyle = "#fff"; for (const x of [-10, 0, 10]) { c.beginPath(); c.arc(x, -19, 2, 0, 7); c.fill(); } break; }
    case 14: c.fillStyle = "#fff"; ol(c, 3); for (const [x, y, r] of [[-14, -54, 15], [-16, -38, 14], [4, -22, 16], [24, -24, 12], [-4, -30, 16], [-20, -22, 13]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); } c.fillStyle = "#fff"; for (const [x, y, r] of [[-14, -54, 13], [-16, -38, 12], [-4, -30, 14], [4, -22, 14]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } R(-2, -44, 16, 12, "#ffb3d1", 6); break;
    case 15: { const gr = c.createLinearGradient(-26, -90, 26, -20); ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"].forEach((col, i, a) => gr.addColorStop(i / (a.length - 1), col)); c.save(); c.shadowColor = "#fff8b0"; c.shadowBlur = 16; c.fillStyle = gr; c.beginPath(); c.roundRect(-26, -90, 18, 66, 6); c.fill(); c.stroke(); c.beginPath(); c.roundRect(-22, -32, 44, 12, 5); c.fill(); c.stroke(); c.restore(); R(-4, -44, 26, 7, "#ffd23f", 3); for (const x of [-16, 12]) R(x, -8, 6, 8, "#c98a00", 1); c.fillStyle = "#ffd23f"; ol(c, 2.5); c.beginPath(); c.moveTo(-28, -90); c.lineTo(-26, -104); c.lineTo(-21, -96); c.lineTo(-17, -106); c.lineTo(-13, -96); c.lineTo(-8, -104); c.lineTo(-6, -90); c.closePath(); c.fill(); c.stroke(); break; }
  }
};

// ---------- food ----------
const __food0 = drawStrengthArt;
drawStrengthArt = function (c, t) {
  if (t <= 10) return __food0(c, t);
  ol(c, 3);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const dot = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  switch (t) {
    case 11: c.strokeStyle = "#c9a26a"; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(6, -6); c.lineTo(28, -26); c.moveTo(12, -4); c.lineTo(32, -20); c.stroke(); ol(c, 3);
      c.fillStyle = "#e23a3a"; c.beginPath(); c.moveTo(-28, -2); c.quadraticCurveTo(-26, 26, 0, 26); c.quadraticCurveTo(26, 26, 28, -2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd9a0"; c.beginPath(); c.ellipse(0, -2, 28, 8, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#f3c26b"; c.lineWidth = 2; c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(-10, -6, -4, -2); c.quadraticCurveTo(2, 2, 10, -3); c.stroke(); dot(-10, -3, 4.5, "#fff"); dot(-10, -3, 2, "#ffb02a"); dot(10, -1, 4.5, "#ffd0e0"); R(14, -6, 8, 8, "#2f7a3a", 2); break;
    case 12: c.fillStyle = "#d9954f"; c.beginPath(); c.moveTo(-13, -2); c.lineTo(13, -2); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "rgba(90,50,10,.5)"; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-8, 2); c.lineTo(5, 20); c.moveTo(8, 2); c.lineTo(-5, 20); c.stroke(); ol(c, 3); dot(0, -8, 14, "#ff9fc8"); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(0, -8, 14, 0, 7); c.stroke(); dot(0, -22, 11, "#9be8c8"); c.beginPath(); c.arc(0, -22, 11, 0, 7); c.stroke(); dot(0, -32, 4.5, "#e23a3a"); c.beginPath(); c.arc(0, -32, 4.5, 0, 7); c.stroke(); break;
    case 13: R(-24, -2, 48, 22, "#f4b8d8", 5); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-24, -2); for (let x = -24; x <= 24; x += 8) c.quadraticCurveTo(x + 4, 8, x + 8, -2); c.lineTo(24, -10); c.lineTo(-24, -10); c.closePath(); c.fill(); c.stroke(); R(-24, -18, 48, 10, "#f4b8d8", 4); dot(-8, -22, 7, "#e23a3a"); c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.arc(-8, -22, 7, 0, 7); c.stroke(); c.fillStyle = "#4fd66b"; c.beginPath(); c.ellipse(-8, -29, 4, 2.5, 0, 0, 7); c.fill(); dot(10, -20, 3, "#ffe066"); break;
    case 14: R(-24, 10, 48, 10, "#e6b566", 6); R(-26, 3, 52, 8, "#6b3a1f", 4); c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-26, 3); c.lineTo(26, 3); c.lineTo(20, 12); c.lineTo(10, 6); c.lineTo(0, 14); c.lineTo(-10, 6); c.lineTo(-20, 12); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#4fd66b"; c.beginPath(); c.moveTo(-26, 0); for (let x = -26; x <= 26; x += 8) c.lineTo(x + 4, x % 16 ? -5 : 1); c.lineTo(26, 0); c.closePath(); c.fill(); c.stroke(); R(-22, -6, 44, 5, "#e23a3a", 2); c.fillStyle = "#e6b566"; c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(0, -36, 26, -6); c.closePath(); c.fill(); c.stroke(); for (const [x, y] of [[-10, -16], [0, -22], [10, -16], [-3, -12]]) dot(x, y, 1.6, "#fff3c8"); break;
    case 15: c.save(); c.shadowColor = "#ffd23f"; c.shadowBlur = 14; c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 8, 28, Math.PI, 0); c.closePath(); c.fill(); c.restore(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, 8, 28, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#e6a800"; c.beginPath(); c.arc(0, -20, 4, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#c9d6e2"; c.beginPath(); c.ellipse(0, 12, 36, 8, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-12, -6, 5, 10, 0.6, 0, 7); c.fill(); c.fillStyle = "#fff8b0"; ol(c, 1.5); star(c, 24, -16, 6); c.fill(); c.stroke(); star(c, -26, -14, 4); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; ol(c, 2); c.beginPath(); c.moveTo(-10, -26); c.lineTo(-11, -36); c.lineTo(-5, -31); c.lineTo(0, -38); c.lineTo(5, -31); c.lineTo(11, -36); c.lineTo(10, -26); c.closePath(); c.fill(); c.stroke(); break;
  }
};
