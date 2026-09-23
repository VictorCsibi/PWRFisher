"use strict";
// Four more maps: Neon Harbour, Sky Lake, Candy Lagoon and Ancient Ruins.
// Loaded after start.js (needs MAP_TRAITS) and before game.js. Uses ctx, W, WATER_Y, DECK_Y, INK, ink(), hills(), fogBand(), pineTree(),
// lanternPost(), shore(), cloud(), MAPS, MAP_ORDER, drawMapIcon, OCEAN_WEATHER at call time.

// which fish live where (only kinds that already exist; game.js reads this when it builds the fish lists)
const NEW_MAP_POOLS = {
  neon: ["Sardine", "Minnow", "Glow Minnow", "Star Guppy", "Plasma Tetra", "Perch", "Lionfish", "Angelfish", "Moonfish", "Barracuda", "Stingray", "Electric Eel", "Hatchetfish", "Lanternfish", "Tuna", "Swordfish", "Manta Ray", "Shark", "Anglerfish", "Giant Squid", "Kraken"],
  sky: ["Minnow", "Perch", "Bluegill", "Crappie", "Koi", "Rainbow Trout", "Trout", "Salmon", "Golden Fish", "Sakura Koi", "Kohaku Koi", "Tancho Koi", "Ogon Koi", "Golden Koi", "Ghost Koi", "Aurora Salmon", "Winter Koi", "Crystal Sturgeon", "Dragon Koi", "Phoenix Koi"],
  candy: ["Minnow", "Sardine", "Clownfish", "Parrotfish", "Angelfish", "Blue Tang", "Mahi Mahi", "Seahorse", "Lionfish", "Pufferfish", "Jellyfish", "Golden Fish", "Firefish", "Moonfish", "Octopus", "Manta Ray", "Sea Dragon", "Giant Whale"],
  ruins: ["Minnow", "Catfish", "Eel", "Tigerfish", "Lungfish", "Nile Perch", "Pharaoh Fish", "Albino Catfish", "Alligator Gar", "Skeleton Fish", "Treasure Fish", "Ghost Shark", "Octopus", "Giant Squid", "Oarfish", "Swamp Serpent", "Cypress Sturgeon", "Golden Koi", "Leviathan"],
};

// ---------- NEON HARBOUR ----------
function farNeon() {
  const cols = ["#2a1a5a", "#3a2470", "#4a3088"];
  for (let L = 0; L < 3; L++) {
    const base = WATER_Y - 6, hgt = 130 - L * 26; ink(3);
    for (let x = -10 + L * 22; x < W; x += 58 + L * 8) {
      const h = hgt * (0.5 + ((x * 13 + L * 7) % 10) / 10); ctx.fillStyle = cols[L]; ctx.fillRect(x, base - h, 50, h); ctx.strokeRect(x, base - h, 50, h);
      ctx.fillStyle = L === 2 ? "#ffe066" : L === 1 ? "#5fffe0" : "#ff7ad9";
      for (let wy = base - h + 8; wy < base - 8; wy += 14) for (let wx = x + 6; wx < x + 44; wx += 12) if (((wx * 3 + wy * 7) % 5) < 2) ctx.fillRect(wx, wy, 6, 8);
    }
  }
  ctx.lineWidth = 4;
  for (const [x, col, y] of [[W * 0.2, "#5fffe0", 90], [W * 0.5, "#ff5fe0", 130], [W * 0.78, "#ffe066", 104]]) { ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.strokeRect(x - 28, WATER_Y - y, 56, 26); ctx.beginPath(); ctx.moveTo(x - 20, WATER_Y - y + 13); ctx.lineTo(x + 20, WATER_Y - y + 13); ctx.stroke(); ctx.shadowBlur = 0; }
  fogBand(0.25);
}
function platformNeon() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#3a3f5a"; ink(4); ctx.fillRect(px - 9, DECK_Y + 16, 18, fl - DECK_Y - 12); ctx.strokeRect(px - 9, DECK_Y + 16, 18, fl - DECK_Y - 12); }
  ctx.fillStyle = "#4a4f6a"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.strokeStyle = "#5fffe0"; ctx.shadowColor = "#5fffe0"; ctx.shadowBlur = 10; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, DECK_Y + 4); ctx.lineTo(420, DECK_Y + 4); ctx.stroke(); ctx.shadowBlur = 0;
  lanternPost("#ff5fe0", "#2a2f4a");
}

// ---------- SKY LAKE ----------
function skyIsland(x, y, s) {
  ink(3.5); ctx.fillStyle = "#8a6a4a"; ctx.beginPath(); ctx.moveTo(x - 60 * s, y); ctx.lineTo(x + 60 * s, y); ctx.lineTo(x + 20 * s, y + 50 * s); ctx.lineTo(x - 16 * s, y + 64 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7fd67a"; ctx.beginPath(); ctx.ellipse(x, y, 62 * s, 12 * s, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  pineTree(x - 20 * s, y - 6 * s, 30 * s, "#2f9a58"); pineTree(x + 18 * s, y - 6 * s, 24 * s, "#3fb868");
  ctx.fillStyle = "rgba(190,235,255,.8)"; ctx.fillRect(x + 30 * s, y + 4, 8 * s, WATER_Y - y - 4);
}
function farSky() {
  ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"].forEach((col, i) => { ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(W * 0.5, WATER_Y + 40, 300 - i * 10, Math.PI, 0); ctx.stroke(); });
  ctx.globalAlpha = 1;
  for (const [x, y, s] of [[W * 0.18, WATER_Y - 150, 1], [W * 0.5, WATER_Y - 200, 1.3], [W * 0.82, WATER_Y - 130, 0.9]]) skyIsland(x, y, s);
  hills(16, "#a8e6a0", 8, 120, 70, (x, y) => pineTree(x, y, 26, "#3fa860"));
  fogBand(0.5);
}
function platformSky() {
  ctx.fillStyle = "#8a6a4a"; ink(4); ctx.beginPath(); ctx.moveTo(-20, DECK_Y); ctx.lineTo(430, DECK_Y); ctx.lineTo(380, DECK_Y + 60); ctx.lineTo(300, DECK_Y + 96); ctx.lineTo(120, DECK_Y + 70); ctx.lineTo(-20, DECK_Y + 40); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7fd67a"; ctx.fillRect(-20, DECK_Y - 4, 450, 12); ctx.strokeRect(-20, DECK_Y - 4, 450, 12);
  ctx.fillStyle = "#b5773a"; ctx.fillRect(-10, DECK_Y - 2, 430, 10); ctx.strokeRect(-10, DECK_Y - 2, 430, 10);
  ctx.fillStyle = "#fff"; for (const x of [40, 220, 340]) { ctx.beginPath(); ctx.arc(x, DECK_Y + 80 + (x % 3) * 6, 14, 0, 7); ctx.arc(x + 14, DECK_Y + 84, 11, 0, 7); ctx.fill(); }
  lanternPost("#ffe9a8", "#8a6a4a");
}

// ---------- CANDY LAGOON ----------
function lollipop(x, y, s, col) { ink(3); ctx.strokeStyle = "#fff"; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 46 * s); ctx.stroke(); ink(3); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 58 * s, 16 * s, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(x, y - 58 * s, 8 * s, 0, 4.5); ctx.stroke(); }
function candyCane(x, y, s) { for (const [col, w] of [[INK, 11], ["#fff", 7]]) { ctx.strokeStyle = col; ctx.lineWidth = w * s; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 44 * s); ctx.arc(x + 10 * s, y - 44 * s, 10 * s, Math.PI, 0); ctx.stroke(); } ctx.strokeStyle = "#ff5a7a"; ctx.lineWidth = 4 * s; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 4 * s, y - 8 * s - k * 10 * s); ctx.lineTo(x + 4 * s, y - 14 * s - k * 10 * s); ctx.stroke(); } }
function farCandy() {
  for (const [x, r, col] of [[W * 0.12, 90, "#ff9ec7"], [W * 0.34, 120, "#9fe6c8"], [W * 0.6, 100, "#ffd06a"], [W * 0.86, 110, "#c8a0ff"]]) { ink(4); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, WATER_Y + 2, r, r * 0.72, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.6)"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x - r * 0.5 + i * r * 0.25, WATER_Y - r * 0.3 - (i % 2) * r * 0.2, 6, 0, 7); ctx.fill(); } }
  for (let x = 50, i = 0; x < W; x += 120, i++) { if (i % 2) candyCane(x, WATER_Y - 6, 1); else lollipop(x, WATER_Y - 6, 1, ["#ff5fa2", "#4fd6c8", "#ffd23f", "#b45cff"][i % 4]); }
  fogBand(0.25);
}
function platformCandy() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#fff"; ink(4); ctx.fillRect(px - 8, DECK_Y + 16, 16, fl - DECK_Y - 12); ctx.strokeRect(px - 8, DECK_Y + 16, 16, fl - DECK_Y - 12); ctx.fillStyle = "#ff5a7a"; for (let y = DECK_Y + 22; y < fl - 12; y += 28) ctx.fillRect(px - 8, y, 16, 10); }
  ctx.fillStyle = "#ffcfe0"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.fillStyle = "#fff"; for (let x = -4; x < 420; x += 34) ctx.fillRect(x, DECK_Y, 14, 18);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-10, DECK_Y, 430, 18);
  lanternPost("#ff9ec7", "#ff5a7a");
}

// ---------- ANCIENT RUINS ----------
function column(x, y, h, broken) {
  ink(3.5); ctx.fillStyle = "#c8c0a8"; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 12, y - h);
  if (broken) { ctx.lineTo(x - 4, y - h - 8); ctx.lineTo(x + 2, y - h + 6); ctx.lineTo(x + 12, y - h - 4); } else { ctx.lineTo(x - 18, y - h); ctx.lineTo(x - 18, y - h - 8); ctx.lineTo(x + 18, y - h - 8); ctx.lineTo(x + 18, y - h); }
  ctx.lineTo(x + 12, y - h); ctx.lineTo(x + 12, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(90,80,60,.5)"; ctx.lineWidth = 2; for (const dx of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(x + dx, y - 4); ctx.lineTo(x + dx, y - h + 6); ctx.stroke(); }
  ctx.strokeStyle = "#5aa05a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 10, y - h * 0.3); ctx.quadraticCurveTo(x + 18, y - h * 0.5, x + 8, y - h * 0.7); ctx.stroke();
}
function farRuins() {
  hills(46, "#6a8a6a", 10, 110, 999, null); hills(22, "#4f7d5a", 8, 90, 999, null);
  for (const [x, h, b] of [[W * 0.15, 140, 0], [W * 0.25, 108, 1], [W * 0.62, 150, 0], [W * 0.72, 90, 1], [W * 0.86, 130, 0]]) column(x, WATER_Y - 6, h, b);
  ink(4); ctx.fillStyle = "#c8c0a8"; ctx.beginPath(); ctx.moveTo(W * 0.4 - 30, WATER_Y - 6); ctx.lineTo(W * 0.4 - 30, WATER_Y - 96); ctx.quadraticCurveTo(W * 0.4, WATER_Y - 140, W * 0.4 + 30, WATER_Y - 96); ctx.lineTo(W * 0.4 + 30, WATER_Y - 6); ctx.lineTo(W * 0.4 + 16, WATER_Y - 6); ctx.lineTo(W * 0.4 + 16, WATER_Y - 92); ctx.quadraticCurveTo(W * 0.4, WATER_Y - 120, W * 0.4 - 16, WATER_Y - 92); ctx.lineTo(W * 0.4 - 16, WATER_Y - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  fogBand(0.3);
}
function platformRuins() {
  const fl = shore();
  for (const px of [50, 190, 320, 400]) { ctx.fillStyle = "#a8a088"; ink(4); ctx.fillRect(px - 12, DECK_Y + 16, 24, fl - DECK_Y - 12); ctx.strokeRect(px - 12, DECK_Y + 16, 24, fl - DECK_Y - 12); }
  ctx.fillStyle = "#c8c0a8"; ink(4); ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.strokeStyle = "rgba(90,80,60,.5)"; ctx.lineWidth = 2; for (let x = 20; x < 420; x += 52) { ctx.beginPath(); ctx.moveTo(x, DECK_Y); ctx.lineTo(x, DECK_Y + 18); ctx.stroke(); }
  ctx.fillStyle = "#5aa05a"; for (let x = 10; x < 420; x += 38) { ctx.beginPath(); ctx.ellipse(x, DECK_Y, 9, 3, 0, Math.PI, 0); ctx.fill(); }
  lanternPost("#ff9a3a", "#8a8068");
}

// ---------- the map definitions ----------
Object.assign(MAPS, {
  neon: {
    id: "neon", name: "Neon Harbour", price: 0, mult: 1, weather: OCEAN_WEATHER,
    blurb: "A glowing night city on the water: skyscrapers, neon signs and a metal pier.",
    sky: { top: [30, 18, 84], bot: [230, 96, 176], amt: 0.85 }, sand: "#4a4a6a", rock: "#3a3f5a", kelpCol: "#2fe0b8", front: "rgba(90,60,200,.28)",
    water: [[0, "#2a86c8"], [0.25, "#1c4fa8"], [0.6, "#1a2a78"], [1, "#0a0d33"]],
    drawFar: farNeon, drawPlatform: platformNeon,
    eco: {
      reef: [["tube", 16], ["sponge", 10], ["fan", 8], ["urchin", 8], ["star", 5], ["grass", 10]], cols: ["#ff5fe0", "#5fffe0", "#ffe066", "#b45cff"], kelp: 6, grassCol: "#2fe0b8", surface: 0,
      schools: [
        { n: "Glow Minnow", count: 16, depth: 0.16, tint: "#7affd0", len: 28 }, { n: "Star Guppy", count: 12, depth: 0.3, tint: "#ff8ae8", len: 30 }, { n: "Plasma Tetra", count: 9, depth: 0.5, tint: "#5fd8ff", len: 44 },
        { n: "Sardine", count: 12, depth: 0.66, tint: "#c8e0ff", len: 30 }, { n: "Moonfish", count: 6, depth: 0.8, tint: "#e8f0ff", len: 50 },
      ],
      residents: [
        { n: "Lionfish", col: "#ff5fa2", deco: "stripes", len: 60 }, { n: "Angelfish", col: "#5fffe0", deco: "lateral", len: 52 }, { n: "Perch", col: "#ffe066", deco: "glint", len: 44 }, { n: "Moonfish", col: "#b45cff", deco: "glint", len: 50 },
        { n: "Star Guppy", col: "#ffd23f", deco: "glint", len: 34 }, { n: "Plasma Tetra", col: "#ff5fe0", deco: "lateral", len: 48 },
      ],
      roam: [{ name: "Manta Ray", len: 190, dy: 0.6, v: 22, alpha: 0.75 }, { name: "Shark", len: 170, dy: 0.5, v: 40, alpha: 0.8, pred: true }, { name: "Giant Squid", len: 240, dy: 0.84, v: 12, alpha: 0.4 }],
      turtles: 1, crabs: 2, crabCol: "#ff5fe0", jellies: 6, jellyCols: ["#ff5fe0", "#5fffe0", "#b45cff", "#ffe066"], seahorses: 2,
    },
  },
  sky: {
    id: "sky", name: "Sky Lake", price: 0, mult: 1, bob: { amp: 4, speed: 1.1, tilt: 0.02, whole: true, bucket: true }, weather: { name: "SNOW", kind: "snow", color: "255,255,255" },
    blurb: "A lake high above the clouds, with floating islands, waterfalls and a rainbow.",
    sky: { top: [110, 180, 255], bot: [235, 246, 255], amt: 0.8 }, sand: "#e8f0f0", rock: "#b8c8d8", kelpCol: "#5ac890", front: "rgba(180,230,255,.3)",
    water: [[0, "#9be8ff"], [0.25, "#5cc4f0"], [0.6, "#2a7ac0"], [1, "#123a78"]],
    drawFar: farSky, drawPlatform: platformSky,
    eco: {
      reef: [["grass", 30], ["clam", 5], ["star", 4], ["sponge", 4]], cols: ["#8ae0c8", "#a8e8ff", "#e8f0ff", "#c8b8ff"], kelp: 10, grassCol: "#5ac890", surface: 6,
      schools: [
        { n: "Minnow", count: 14, depth: 0.18, tint: "#dff4ff", len: 26 }, { n: "Perch", count: 9, depth: 0.32, tint: "#ffd94a", len: 40 }, { n: "Koi", count: 6, depth: 0.5, tint: "#fff5e6", len: 60 },
        { n: "Rainbow Trout", count: 7, depth: 0.66, tint: "#ff9fd8", len: 52 }, { n: "Golden Fish", count: 5, depth: 0.82, tint: "#ffd23f", len: 44 },
      ],
      residents: [
        { n: "Koi", col: "#fff", deco: "koi", len: 74 }, { n: "Ogon Koi", col: "#ffd23f", deco: "shine", len: 80 }, { n: "Sakura Koi", col: "#ffd0e6", deco: "koi", len: 66 }, { n: "Rainbow Trout", col: "#7fd8ff", deco: "lateral", len: 62 },
        { n: "Perch", col: "#8ae0c8", deco: "stripes", len: 44 },
      ],
      roam: [{ name: "Ghost Koi", len: 130, dy: 0.5, v: 26, alpha: 0.7 }, { name: "Dragon Koi", len: 200, dy: 0.78, v: 18, alpha: 0.5 }],
      turtles: 2, crabs: 0, crabCol: "#e0a08a", jellies: 3, jellyCols: ["#e8f0ff", "#b6e8ff"], seahorses: 0,
    },
  },
  candy: {
    id: "candy", name: "Candy Lagoon", price: 0, mult: 1, weather: { name: "SPRINKLES", kind: "petals", color: "255,170,220" },
    blurb: "A sugary lagoon with gumdrop hills, lollipops and candy canes. Everything is sweet.",
    sky: { top: [255, 190, 224], bot: [200, 255, 236], amt: 0.85 }, sand: "#ffd6e8", rock: "#e8a0c8", kelpCol: "#ff8ac8", front: "rgba(255,150,220,.3)",
    water: [[0, "#8ae8e0"], [0.25, "#4cc0d8"], [0.6, "#7a6ad8"], [1, "#3a1a78"]],
    drawFar: farCandy, drawPlatform: platformCandy,
    eco: {
      reef: [["tube", 18], ["brain", 14], ["fan", 12], ["anemone", 12], ["star", 8], ["sponge", 8]], cols: ["#ff8ac8", "#ffd06a", "#8ae8c8", "#c8a0ff"], kelp: 8, grassCol: "#ff8ac8", surface: 0,
      schools: [
        { n: "Minnow", count: 14, depth: 0.16, tint: "#ffd0e8", len: 26 }, { n: "Clownfish", count: 8, depth: 0.3, tint: "#ff8a1f", len: 34 }, { n: "Parrotfish", count: 7, depth: 0.5, tint: "#8ae8c8", len: 48 },
        { n: "Angelfish", count: 6, depth: 0.66, tint: "#ffe066", len: 46 }, { n: "Blue Tang", count: 7, depth: 0.8, tint: "#5fa8ff", len: 42 },
      ],
      residents: [
        { n: "Clownfish", col: "#ff5fa2", deco: "clown", len: 40 }, { n: "Parrotfish", col: "#b45cff", deco: "spots", len: 56 }, { n: "Angelfish", col: "#ffd23f", deco: "lateral", len: 50 }, { n: "Blue Tang", col: "#5fd8ff", deco: "glint", len: 44 },
        { n: "Pufferfish", col: "#ffb3d8", deco: "spots", len: 48 }, { n: "Lionfish", col: "#ff8ac8", deco: "stripes", len: 58 },
      ],
      roam: [{ name: "Manta Ray", len: 190, dy: 0.62, v: 22, alpha: 0.75 }, { name: "Giant Whale", len: 380, dy: 0.82, v: 9, alpha: 0.3 }],
      turtles: 2, crabs: 2, crabCol: "#ff8ac8", jellies: 8, jellyCols: ["#ff8fc8", "#b6a0ff", "#9be8ff", "#ffe066"], seahorses: 3,
    },
  },
  ruins: {
    id: "ruins", name: "Ancient Ruins", price: 0, mult: 1, weather: OCEAN_WEATHER,
    blurb: "Mossy stone columns and a broken arch rise from a green lake that hides old treasure.",
    sky: { top: [232, 170, 100], bot: [255, 232, 180], amt: 0.7 }, sand: "#8a8060", rock: "#6a705a", kelpCol: "#4a9a5a", front: "rgba(60,150,120,.3)",
    water: [[0, "#5ac8a0"], [0.25, "#2a9078"], [0.6, "#155a58"], [1, "#062a30"]],
    drawFar: farRuins, drawPlatform: platformRuins,
    eco: {
      reef: [["table", 12], ["sponge", 10], ["clam", 6], ["urchin", 8], ["grass", 16], ["brain", 8]], cols: ["#8a9a6a", "#6a8a7a", "#c8b878", "#4a8a6a"], kelp: 9, grassCol: "#4a9a5a", surface: 0,
      schools: [
        { n: "Minnow", count: 14, depth: 0.16, tint: "#c8d8a0", len: 26 }, { n: "Catfish", count: 6, depth: 0.32, tint: "#8a7a5a", len: 54 }, { n: "Tigerfish", count: 7, depth: 0.5, tint: "#d8b04a", len: 50 },
        { n: "Lungfish", count: 5, depth: 0.68, tint: "#8a9a5a", len: 60 }, { n: "Nile Perch", count: 6, depth: 0.82, tint: "#a8a8a0", len: 66 },
      ],
      residents: [
        { n: "Tigerfish", col: "#e0a83a", deco: "stripes", len: 56 }, { n: "Catfish", col: "#8a8a6a", deco: "spots", len: 62 }, { n: "Pharaoh Fish", col: "#ffd23f", deco: "shine", len: 70 }, { n: "Nile Perch", col: "#a8b0a0", deco: "lateral", len: 68 },
        { n: "Minnow", col: "#c8e0a0", deco: "glint", len: 28 },
      ],
      roam: [{ name: "Alligator Gar", len: 170, dy: 0.55, v: 28, alpha: 0.8, pred: true }, { name: "Ghost Shark", len: 200, dy: 0.72, v: 20, alpha: 0.5 }, { name: "Giant Squid", len: 240, dy: 0.86, v: 12, alpha: 0.35 }],
      turtles: 2, crabs: 2, crabCol: "#c8a060", jellies: 3, jellyCols: ["#a8e8c8", "#e8e0a0"], seahorses: 0,
    },
  },
});
MAP_ORDER.push("neon", "sky", "candy", "ruins");

// each new map has its own ups and downs
Object.assign(MAP_TRAITS, {
  neon:  { sell: 1.4, bite: 1.1, wear: 1.5, luck: 1.1, junk: 0.08, ups: ["Fish sell +40%", "Fish bite 10% faster", "Rare fish +10%"], downs: ["Line wears 50% faster (electric water)", "More junk (city litter)"] },
  sky:   { sell: 1.15, bite: 0.85, wear: 0.7, luck: 1.15, junk: 0, ups: ["Fish sell +15%", "Rare fish +15%", "Line lasts 30% longer"], downs: ["Thin air: bites 15% slower"] },
  candy: { sell: 0.85, bite: 1.35, wear: 1, luck: 1, junk: -0.12, ups: ["Bites 35% faster", "Almost no junk"], downs: ["Fish sell 15% less"] },
  ruins: { sell: 1.7, bite: 0.75, wear: 1.3, luck: 1.25, junk: 0.05, ups: ["Fish sell +70%", "Rare fish +25%"], downs: ["Bites 25% slower", "Line wears 30% faster"] },
});

// ---------- pictures for the map list ----------
const __mapIcon3 = drawMapIcon;
drawMapIcon = function (c, id) {
  if (!NEW_MAP_POOLS[id]) return __mapIcon3(c, id);
  const M = MAPS[id], w = 200, h = 110, wy = 62, sk = { neon: ["#2a1a6a", "#e2609c"], sky: ["#7ab8ff", "#eaf6ff"], candy: ["#ffc0e0", "#c8ffec"], ruins: ["#e8aa64", "#ffe8b4"] }[id];
  const g1 = c.createLinearGradient(0, 0, 0, wy); g1.addColorStop(0, sk[0]); g1.addColorStop(1, sk[1]); c.fillStyle = g1; c.fillRect(0, 0, w, h);
  c.lineJoin = "round"; c.lineWidth = 2.5; c.strokeStyle = INK;
  if (id === "neon") { for (const [x, bh, col] of [[10, 34, "#3a2470"], [40, 52, "#4a3088"], [78, 40, "#3a2470"], [112, 58, "#4a3088"], [150, 44, "#3a2470"]]) { c.fillStyle = col; c.fillRect(x, wy - bh, 30, bh); c.strokeRect(x, wy - bh, 30, bh); c.fillStyle = "#ffe066"; for (let yy = wy - bh + 6; yy < wy - 4; yy += 10) c.fillRect(x + 6, yy, 5, 5), c.fillRect(x + 18, yy, 5, 5); } c.strokeStyle = "#5fffe0"; c.lineWidth = 3; c.strokeRect(40, 16, 30, 12); c.strokeStyle = INK; }
  if (id === "sky") { for (const [x, y] of [[36, 26], [100, 14], [160, 30]]) { c.fillStyle = "#8a6a4a"; c.beginPath(); c.moveTo(x - 24, y); c.lineTo(x + 24, y); c.lineTo(x + 6, y + 20); c.lineTo(x - 8, y + 26); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#7fd67a"; c.beginPath(); c.ellipse(x, y, 25, 6, 0, Math.PI, 0); c.fill(); c.stroke(); } ["#ff5a5f", "#ffe066", "#4d9dff"].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.arc(100, wy + 10, 60 - i * 5, Math.PI, 0); c.stroke(); }); c.strokeStyle = INK; c.lineWidth = 2.5; }
  if (id === "candy") { for (const [x, r, col] of [[30, 30, "#ff9ec7"], [90, 40, "#9fe6c8"], [160, 32, "#ffd06a"]]) { c.fillStyle = col; c.beginPath(); c.ellipse(x, wy, r, r * 0.7, 0, Math.PI, 0); c.fill(); c.stroke(); } c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.moveTo(60, wy - 16); c.lineTo(60, wy - 36); c.stroke(); c.fillStyle = "#ff5fa2"; c.beginPath(); c.arc(60, wy - 42, 9, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke(); }
  if (id === "ruins") { for (const [x, ch] of [[30, 40], [70, 28], [120, 46], [168, 34]]) { c.fillStyle = "#c8c0a8"; c.fillRect(x - 6, wy - ch, 12, ch); c.strokeRect(x - 6, wy - ch, 12, ch); c.fillRect(x - 9, wy - ch - 4, 18, 5); c.strokeRect(x - 9, wy - ch - 4, 18, 5); } }
  const gw = c.createLinearGradient(0, wy, 0, h); for (const [s, col] of M.water) gw.addColorStop(s, col); c.fillStyle = gw; c.fillRect(0, wy, w, h - wy);
  c.fillStyle = { neon: "#4a4f6a", sky: "#b5773a", candy: "#ffcfe0", ruins: "#c8c0a8" }[id]; c.fillRect(100, wy - 4, 110, 10); c.strokeRect(100, wy - 4, 110, 10);
  for (const x of [112, 150, 188]) { c.fillRect(x - 3, wy + 6, 6, 30); c.strokeRect(x - 3, wy + 6, 6, 30); }
};

// ---------- the picture shown when you pick a map: a real snapshot of that map's scenery ----------
const MAP_ICON_TOD = { neon: 21.5, volcano: 19, pirate: 18.5, abyss: 12, alien: 12 };
drawMapIcon = function (c, id) {
  const w = c.canvas.width, h = c.canvas.height, M = MAPS[id]; // c is the 2D context of the picture
  const keep = { map: state.map, tod: g.tod, rain: g.rain, raining: g.raining, t: g.t, lock: g.lock };
  try {
    state.map = id; g.tod = MAP_ICON_TOD[id] || 11; g.rain = 0; g.lock = null;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "none"; ctx.globalAlpha = 1;
    ctx.translate(W, 0); ctx.scale(-1, 1); drawBackground(); M.drawPlatform(); ctx.restore(); // draws on the game canvas (hidden behind the start screen)
    const srcH = WATER_Y + H * 0.26, srcW = srcH * (w / h);
    c.clearRect(0, 0, w, h); c.drawImage(canvas, W - srcW, 0, srcW, srcH, 0, 0, w, h);
    const k = h / srcH, sx = W - srcW; // a little fisherman on the dock and some fish of that map
    const px = (W - 190 - sx) * k, py = DECK_Y * k; c.save(); c.strokeStyle = "#111"; c.fillStyle = "#111"; c.lineWidth = 4 * k * 2; c.lineCap = "round";
    c.beginPath(); c.moveTo(px, py - 46 * k); c.lineTo(px, py - 18 * k); c.moveTo(px, py - 18 * k); c.lineTo(px - 8 * k, py); c.moveTo(px, py - 18 * k); c.lineTo(px + 8 * k, py); c.stroke();
    c.beginPath(); c.arc(px, py - 56 * k, 8 * k, 0, 7); c.fill(); c.lineWidth = 2.5 * k * 2; c.beginPath(); c.moveTo(px - 4 * k, py - 36 * k); c.lineTo(px - 70 * k, py - 62 * k); c.stroke(); c.restore();
    const sc = M.eco.schools; sc.slice(0, 4).forEach((s, i) => { const f = { ...fishByName(s.n), color: s.tint }; c.save(); c.globalAlpha = 0.95; drawFish(c, w * (0.22 + i * 0.2), h * (0.66 + (i % 2) * 0.16), f, Math.min(64, s.len * 1.5) * k * 2.2, i % 2 ? 1 : -1, {}); c.restore(); });
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
  } finally { state.map = keep.map; g.tod = keep.tod; g.rain = keep.rain; g.raining = keep.raining; g.lock = keep.lock; }
};
