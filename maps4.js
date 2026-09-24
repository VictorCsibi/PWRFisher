"use strict";
// The final map: Starfall Sanctuary, a floating ruin hanging in a starry void beyond a glowing rift.
// Only unlocked after doing a Legend reset once. Loaded after start.js (needs MAP_TRAITS) and before game.js.
// Uses ctx, g, W, H, WATER_Y, DECK_Y, INK, ink(), lerp, clamp, MAPS, MAP_ORDER, MAP_TRAITS, MAP_ITEMS, F, shore(), lanternPost() at call time.

// ---------- STARFALL SANCTUARY ----------
function farFinal() {
  for (let i = 0; i < 90; i++) { ctx.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(g.t * 1.1 + i * 1.7)); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc((i * 137) % W, (i * 53) % (WATER_Y * 0.78), 1 + (i % 3) * 0.6, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
  ["#7affd0", "#b45cff", "#5fd8ff"].forEach((col, i) => {
    ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.32; ctx.lineWidth = 14; ctx.shadowColor = col; ctx.shadowBlur = 18;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) { const y = WATER_Y * 0.22 + i * 26 + Math.sin(x / 140 + g.t * 0.6 + i) * 30; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  });
  const rx = W * 0.52, ry = WATER_Y * 0.4, rr = 92;
  ctx.save(); ctx.translate(rx, ry);
  const rg = ctx.createRadialGradient(0, 0, 8, 0, 0, rr); rg.addColorStop(0, "#fff"); rg.addColorStop(0.32, "#c88cff"); rg.addColorStop(1, "rgba(120,60,220,0)");
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, rr, 0, 7); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 20;
  for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.5 - k * 0.12; ctx.lineWidth = 4 - k; ctx.beginPath(); ctx.ellipse(0, 0, rr * 0.5 + k * 20 + Math.sin(g.t + k) * 4, rr * 0.48 + k * 18, g.t * 0.3 + k, 0, 7); ctx.stroke(); }
  ctx.restore();
  for (const [xf, y0, s, a] of [[0.14, WATER_Y * 0.5, 26, 0.3], [0.85, WATER_Y * 0.34, 20, -0.4], [0.7, WATER_Y * 0.6, 16, 0.6]]) {
    const x = W * xf + Math.sin(g.t * 0.5 + xf * 10) * 6, y = y0 + Math.sin(g.t * 0.4 + xf * 5) * 8;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ink(3); ctx.fillStyle = "#332c4a"; ctx.beginPath(); ctx.moveTo(-s, s * 0.6); ctx.lineTo(0, -s); ctx.lineTo(s, s * 0.5); ctx.lineTo(s * 0.3, s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#b45cff"; ctx.lineWidth = 2; ctx.shadowColor = "#b45cff"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(s * 0.3, s * 0.2); ctx.stroke();
    ctx.restore();
  }
  fogBand(0.18);
}
function platformFinal() {
  ink(4); const pg = ctx.createLinearGradient(0, DECK_Y - 10, 0, DECK_Y + 50); pg.addColorStop(0, "#4a4460"); pg.addColorStop(1, "#211c32");
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-30, DECK_Y); ctx.lineTo(430, DECK_Y); ctx.lineTo(400, DECK_Y + 50); ctx.lineTo(60, DECK_Y + 50); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#6a5a8a"; ctx.fillRect(-20, DECK_Y - 6, 440, 10); ctx.strokeRect(-20, DECK_Y - 6, 440, 10);
  ctx.save(); ctx.strokeStyle = "#b45cff"; ctx.shadowColor = "#b45cff"; ctx.shadowBlur = 12; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(20, DECK_Y + 2); ctx.lineTo(80, DECK_Y + 30); ctx.lineTo(160, DECK_Y + 10); ctx.lineTo(260, DECK_Y + 34); ctx.lineTo(360, DECK_Y + 6); ctx.stroke();
  ctx.restore();
  for (const [x, y, s] of [[10, DECK_Y + 66, 0.5], [372, DECK_Y + 76, 0.6]]) { ctx.save(); ctx.translate(x, y); ink(3); ctx.fillStyle = "#332c4a"; ctx.beginPath(); ctx.moveTo(-20 * s, 0); ctx.lineTo(0, -14 * s); ctx.lineTo(20 * s, 4 * s); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  lanternPost("#b45cff", "#332c4a");
}

MAP_ORDER.push("final");
if (typeof MAP_ICON_TOD !== "undefined") MAP_ICON_TOD.final = 12; // snapshot the picker preview at night, to match the void theme
Object.assign(MAPS, {
  final: {
    id: "final", name: "Starfall Sanctuary", price: 0, mult: 1, alwaysWeather: true, weather: { name: "STARFALL", kind: "meteor", color: "190,150,255" },
    blurb: "A broken temple floating in the void beyond a glowing rift. Only Legends may fish here.",
    sky: { top: [10, 6, 26], bot: [42, 22, 72], amt: 0.95 }, sand: "#241c3a", rock: "#3a3450", kelpCol: "#b45cff", front: "rgba(120,60,220,.3)",
    water: [[0, "#2a1a58"], [0.25, "#1a1040"], [0.6, "#0a0824"], [1, "#020208"]],
    bob: { amp: 6, speed: 0.9, tilt: 0.018, whole: true, bucket: true },
    drawFar: farFinal, drawPlatform: platformFinal,
    lock: { ok: () => typeof F === "function" && F().stars >= 1, why: "Do a Legend reset (reach max rank and prestige) to unlock this map." },
    eco: {
      reef: [["crystal", 22], ["star", 12], ["ember", 10], ["grass", 6]], cols: ["#b45cff", "#5fd8ff", "#7affd0", "#ffffff"], kelp: 4, grassCol: "#b45cff", surface: 0,
      schools: [
        { n: "Glow Minnow", count: 14, depth: 0.16, tint: "#7affd0", len: 28 }, { n: "Star Guppy", count: 10, depth: 0.3, tint: "#ffd23f", len: 30 }, { n: "Plasma Tetra", count: 8, depth: 0.48, tint: "#ff5fe0", len: 42 },
        { n: "Asteroid Puffer", count: 5, depth: 0.66, tint: "#a08aff", len: 44 }, { n: "Nebula Jelly", count: 4, depth: 0.82, tint: "#b45cff", len: 40 },
      ],
      residents: [
        { n: "Comet Ray", col: "#5fd8ff", deco: "glint", len: 60 }, { n: "Void Angler", col: "#2a1a4a", deco: "spots", len: 50 }, { n: "Galaxy Eel", col: "#7a5aff", deco: "lateral", len: 70 }, { n: "UFO Squid", col: "#7affd0", deco: "glint", len: 48 },
      ],
      roam: [{ name: "Cosmic Whale", len: 260, dy: 0.55, v: 14, alpha: 0.5 }, { name: "Leviathan", len: 280, dy: 0.7, v: 12, alpha: 0.4, pred: true }, { name: "Starfall Warden", len: 340, dy: 0.86, v: 8, alpha: 0.35, pred: true }],
      turtles: 0, crabs: 0, crabCol: "#b45cff", jellies: 6, jellyCols: ["#b45cff", "#5fd8ff", "#7affd0"], seahorses: 0,
    },
  },
});
Object.assign(MAP_TRAITS, {
  final: { sell: 2.2, bite: 0.65, wear: 3, luck: 1.4, junk: 0.15, ups: ["Fish sell +120%", "Rare fish +40%"], downs: ["Line wears 3x faster", "Bites 35% slower", "The most junk in the game"] },
});
