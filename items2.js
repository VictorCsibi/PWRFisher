"use strict";
// Chairs (shorter breaks) and Strength (get tired later). Loaded right after items.js, before game.js.
// Uses INK, ol(), star(), CATS, COST_MULT, drawItemIcon at call time.

const CHAIRS = [
  { name: "Wooden Stool" }, { name: "Folding Chair" }, { name: "Camping Chair" }, { name: "Rocking Chair" }, { name: "Deck Chair" },
  { name: "Cozy Armchair" }, { name: "Recliner" }, { name: "Blanket Chair" }, { name: "Golden Armchair" }, { name: "Royal Throne" },
];
const STRENGTHS = [ // the "Food" shop tab: better food keeps him going longer before he needs a break
  { name: "Water Bottle" }, { name: "Fresh Apple" }, { name: "Banana" }, { name: "Sandwich" }, { name: "Hot Soup" },
  { name: "Pizza Slice" }, { name: "Sushi Plate" }, { name: "Steak Dinner" }, { name: "Feast Platter" }, { name: "Golden Apple" },
];
const tiredCasts = t => 10 + (t - 1) * 4;                 // casts before he needs a break
const restTime = t => t <= 10 ? 6 - (t - 1) * 0.5 : Math.max(0.3, 1.5 - (t - 10) * 0.25);   // seconds of rest (tier 15: a quick 0.3s catnap)
COST_MULT.chair = 0.8; COST_MULT.strength = 0.9;
CATS.chair = { label: "Chairs", items: CHAIRS, stat: t => `Breaks last only ${restTime(t).toFixed(1)}s` };
CATS.strength = { label: "Food", items: STRENGTHS, stat: t => `Keeps you going for ${tiredCasts(t)} casts before a break` };

// chair art: origin bottom-centre, facing right, seat top at y = -26
function drawChairArt(c, t) {
  ol(c, 3.5);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const L = (x1, y1, x2, y2, col, w = 5) => { c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); ol(c, 3.5); };
  switch (t) {
    case 1: for (const x of [-11, -1, 9]) R(x, -22, 5, 22, "#8f5f30", 1); R(-16, -27, 32, 7, "#b5783e"); break;
    case 2: L(-12, 0, 12, -24, "#7a4a1d"); L(12, 0, -12, -24, "#7a4a1d"); L(-15, -26, -15, -54, "#7a4a1d"); R(-17, -54, 8, 28, "#2b6ad8"); R(-16, -28, 32, 6, "#2b6ad8"); break;
    case 3: L(-12, 0, -8, -24, "#7b8794"); L(12, 0, 8, -24, "#7b8794"); R(-20, -56, 9, 30, "#3f8f4a"); R(-17, -29, 34, 7, "#3f8f4a"); R(17, -30, 9, 7, "#9aa7b8", 2); c.fillStyle = "#ffe066"; c.beginPath(); c.arc(21.5, -36, 4.5, 0, 7); c.fill(); c.stroke(); break;
    case 4: L(-26, -3, 0, 5, "#8a5a2b", 6); L(0, 5, 26, -3, "#8a5a2b", 6); L(-14, 2, -14, -24, "#8a5a2b"); L(14, 2, 14, -24, "#8a5a2b"); R(-17, -28, 34, 6, "#b5783e"); L(-16, -28, -19, -62, "#8a5a2b"); for (const y of [-36, -46, -56]) R(-21, y, 10, 5, "#c99060", 2); break;
    case 5: L(-6, 0, 16, -24, "#c99a5a"); L(-18, 0, -8, -52, "#c99a5a"); c.fillStyle = "#e23a3a"; c.beginPath(); c.moveTo(-24, -6); c.lineTo(-16, -6); c.lineTo(-6, -54); c.lineTo(-18, -56); c.closePath(); c.fill(); c.stroke(); R(-14, -28, 30, 5, "#e23a3a"); c.fillStyle = "#fff"; c.fillRect(-4, -28, 6, 5); c.fillRect(8, -28, 6, 5); break;
    case 6: for (const x of [-16, 10]) R(x, -8, 6, 8, "#5a3a1a", 1); R(-22, -62, 15, 40, "#2fb3a8", 9); R(-18, -32, 38, 12, "#2fb3a8", 6); R(-15, -42, 32, 9, "#1f8f86", 4); break;
    case 7: for (const x of [-16, 8]) R(x, -8, 6, 8, "#3a2410", 1); c.fillStyle = "#a3243a"; c.beginPath(); c.moveTo(-26, -20); c.lineTo(-18, -66); c.lineTo(-8, -64); c.lineTo(-6, -26); c.closePath(); c.fill(); c.stroke(); R(-20, -32, 38, 12, "#a3243a", 5); R(16, -30, 30, 9, "#8a1c2e", 4); R(-14, -44, 30, 9, "#7a1526", 4); break;
    case 8: for (const x of [-16, 10]) R(x, -8, 6, 8, "#5a3a1a", 1); R(-22, -62, 15, 40, "#f08a3a", 9); R(-18, -32, 38, 12, "#f08a3a", 6); c.fillStyle = "#e6f3ff"; ol(c, 2.5); c.beginPath(); c.moveTo(-18, -34); c.lineTo(30, -30); c.lineTo(34, -12); c.lineTo(-18, -20); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "rgba(90,120,200,.6)"; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-14 + k * 11, -34 + k); c.lineTo(-14 + k * 11, -14); c.stroke(); } ol(c, 3.5); R(-18, -52, 14, 12, "#ffd23f", 6); break;
    case 9: for (const x of [-16, 10]) R(x, -8, 6, 8, "#8a5a00", 1); R(-22, -64, 15, 42, "#ffd23f", 9); R(-18, -32, 38, 12, "#ffd23f", 6); R(-15, -42, 32, 9, "#e6a800", 4); ol(c, 2); for (const [x, y, col] of [[-15, -56, "#e23a3a"], [-15, -46, "#4d9dff"], [4, -26, "#4fd66b"]]) { c.fillStyle = col; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); c.stroke(); } break;
    case 10: c.save(); c.shadowColor = "#ffd23f"; c.shadowBlur = 14; R(-24, -84, 16, 60, "#7a2fa8", 6); c.restore(); R(-20, -32, 42, 12, "#7a2fa8", 5); R(-6, -40, 24, 8, "#e23a3a", 4); R(-4, -44, 26, 6, "#ffd23f", 3); for (const x of [-16, 12]) R(x, -8, 6, 8, "#c98a00", 1);
      c.fillStyle = "#ffd23f"; ol(c, 2.5); c.beginPath(); c.moveTo(-26, -84); c.lineTo(-24, -98); c.lineTo(-19, -90); c.lineTo(-14, -100); c.lineTo(-9, -90); c.lineTo(-4, -98); c.lineTo(-6, -84); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = "#e23a3a"; c.beginPath(); c.arc(-15, -70, 4, 0, 7); c.fill(); c.stroke(); break;
  }
}

// food icons, centred on (0,0), about 60px tall
function drawStrengthArt(c, t) {
  ol(c, 3);
  const R = (x, y, w, h, col, r = 3) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.stroke(); };
  const dot = (x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  switch (t) {
    case 1: R(-11, -12, 22, 34, "rgba(120,200,255,.8)", 6); R(-6, -22, 12, 12, "rgba(120,200,255,.8)", 3); R(-7, -28, 14, 7, "#2b6ad8", 2); c.fillStyle = "#fff"; c.fillRect(-11, 2, 22, 10); c.strokeRect(-11, 2, 22, 10); break;
    case 2: c.fillStyle = "#e23a3a"; c.beginPath(); c.arc(-6, 2, 13, 0, 7); c.arc(7, 2, 13, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.arc(-6, 2, 12, 0, 7); c.arc(7, 2, 12, 0, 7); c.fill(); c.strokeStyle = "#6b4423"; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -8); c.lineTo(3, -22); c.stroke(); c.fillStyle = "#4fd66b"; ol(c, 2.5); c.beginPath(); c.ellipse(12, -18, 9, 5, -0.4, 0, 7); c.fill(); c.stroke(); break;
    case 3: c.fillStyle = "#ffd93a"; c.beginPath(); c.moveTo(-24, -6); c.quadraticCurveTo(-4, 24, 26, -18); c.quadraticCurveTo(28, -10, 22, -4); c.quadraticCurveTo(0, 30, -26, 4); c.closePath(); c.fill(); c.stroke(); dot(-25, -1, 3.5, "#6b4423"); dot(24, -15, 3.5, "#6b4423"); c.strokeStyle = "rgba(160,110,0,.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-18, 8); c.quadraticCurveTo(0, 20, 20, -6); c.stroke(); break;
    case 4: R(-24, 6, 48, 12, "#e6b566", 6); c.fillStyle = "#4fd66b"; c.beginPath(); c.moveTo(-26, 6); for (let x = -26; x <= 26; x += 8) c.lineTo(x + 4, x % 16 ? 0 : 5); c.lineTo(26, 6); c.closePath(); c.fill(); c.stroke(); R(-22, -2, 44, 6, "#e23a3a", 3); c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-22, -2); c.lineTo(24, -2); c.lineTo(10, -8); c.lineTo(-22, -8); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#e6b566"; c.beginPath(); c.moveTo(-24, -8); c.quadraticCurveTo(0, -36, 24, -8); c.closePath(); c.fill(); c.stroke(); for (const [x, y] of [[-10, -16], [0, -22], [10, -16], [-3, -12]]) dot(x, y, 1.6, "#fff3c8"); break;
    case 5: c.strokeStyle = "rgba(190,190,200,.9)"; c.lineWidth = 3; c.lineCap = "round"; for (const x of [-10, 0, 10]) { c.beginPath(); c.moveTo(x, -6); c.quadraticCurveTo(x + 6, -14, x, -22); c.quadraticCurveTo(x - 6, -30, x, -34); c.stroke(); } ol(c, 3); c.fillStyle = "#f4f4f4"; c.beginPath(); c.moveTo(-28, -2); c.quadraticCurveTo(-26, 26, 0, 26); c.quadraticCurveTo(26, 26, 28, -2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ff9f43"; c.beginPath(); c.ellipse(0, -2, 28, 8, 0, 0, 7); c.fill(); c.stroke(); dot(-8, -3, 2.5, "#4fd66b"); dot(8, -2, 2.5, "#e23a3a"); dot(0, -4, 2, "#fff3c8"); break;
    case 6: c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-24, -14); c.lineTo(24, -14); c.lineTo(0, 28); c.closePath(); c.fill(); c.stroke(); R(-26, -22, 52, 10, "#d9954f", 5); for (const [x, y] of [[-8, -4], [8, -4], [0, 10]]) { dot(x, y, 5, "#e23a3a"); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 5, 0, 7); c.stroke(); } dot(-14, 4, 1.8, "#3fa04a"); dot(14, 3, 1.8, "#3fa04a"); break;
    case 7: for (const dx of [-14, 14]) { R(dx - 13, 2, 26, 16, "#fff", 8); c.fillStyle = "#ff8a4a"; c.beginPath(); c.roundRect(dx - 15, -6, 30, 14, 7); c.fill(); c.stroke(); c.strokeStyle = "rgba(255,255,255,.6)"; c.lineWidth = 2; c.beginPath(); c.moveTo(dx - 8, -2); c.lineTo(dx + 8, 2); c.stroke(); ol(c, 3); R(dx - 3, 2, 6, 16, "#22303a", 1); } break;
    case 8: c.fillStyle = "#a8452a"; c.beginPath(); c.moveTo(-26, -6); c.quadraticCurveTo(-20, -24, 2, -22); c.quadraticCurveTo(26, -22, 28, -2); c.quadraticCurveTo(28, 20, 4, 22); c.quadraticCurveTo(-24, 24, -26, -6); c.closePath(); c.fill(); c.stroke(); c.strokeStyle = "#4a1f10"; c.lineWidth = 3; for (const k of [-12, -2, 8]) { c.beginPath(); c.moveTo(k - 4, -14); c.lineTo(k + 8, 14); c.stroke(); } c.fillStyle = "#f4f4f4"; ol(c, 2.5); c.beginPath(); c.arc(18, 12, 6, 0, 7); c.fill(); c.stroke(); c.strokeStyle = "#f2c9a0"; c.lineWidth = 3; c.beginPath(); c.moveTo(-20, -6); c.quadraticCurveTo(-16, -18, 0, -17); c.stroke(); break;
    case 9: c.fillStyle = "#c9d6e2"; ol(c, 3); c.beginPath(); c.ellipse(0, 16, 36, 10, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#c9803a"; c.beginPath(); c.ellipse(-4, 2, 20, 13, 0.1, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#e6a458"; c.beginPath(); c.ellipse(-8, -2, 9, 5, 0, 0, 7); c.fill(); for (const dx of [-24, 16]) { c.fillStyle = "#c9803a"; c.beginPath(); c.arc(dx, 4, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(dx + (dx < 0 ? -6 : 6), 4, 3, 0, 7); c.fill(); c.stroke(); } for (const [x, y] of [[24, 12], [30, 10], [27, 15], [22, 16]]) { dot(x, y, 4, "#8a4fc9"); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 4, 0, 7); c.stroke(); } break;
    case 10: c.save(); c.shadowColor = "#ffd23f"; c.shadowBlur = 14; c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(-6, 2, 14, 0, 7); c.arc(8, 2, 14, 0, 7); c.fill(); c.restore(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(-6, 2, 13, 0, 7); c.arc(8, 2, 13, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(-6, 2, 13, Math.PI * 0.6, Math.PI * 1.5); c.stroke(); c.beginPath(); c.arc(8, 2, 13, Math.PI * 1.5, Math.PI * 0.4); c.stroke(); c.strokeStyle = "#6b4423"; c.lineWidth = 4; c.beginPath(); c.moveTo(1, -8); c.lineTo(4, -24); c.stroke(); c.fillStyle = "#4fd66b"; ol(c, 2.5); c.beginPath(); c.ellipse(14, -20, 10, 5, -0.4, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.ellipse(-10, -4, 4, 7, 0.5, 0, 7); c.fill(); c.fillStyle = "#fff8b0"; ol(c, 1.5); star(c, 22, 14, 6); c.fill(); c.stroke(); break;
  }
}

const __baseIcon = drawItemIcon;
drawItemIcon = function (c, cat, t) {
  if (cat === "chair") { c.clearRect(0, 0, 200, 110); c.save(); c.translate(100, 102); c.scale(1.3, 1.3); drawChairArt(c, t); c.restore(); return; }
  if (cat === "strength") { c.clearRect(0, 0, 200, 110); c.save(); c.translate(100, 55); c.scale(1.35, 1.35); drawStrengthArt(c, t); c.restore(); return; }
  __baseIcon(c, cat, t);
};
