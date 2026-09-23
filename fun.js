"use strict";
// Extras that make the game more addictive: combos, daily challenges, legendary fights, treasure, boosts, storms,
// pets, titles, big-number effects and Legend rebirth. Loaded before game.js.
// Uses state, settings, g, FISH, RARITIES, W, H, WATER_Y, DECK_Y, BUCKET_X, INK, ctx, Snd, save, fmt, popup, splash,
// tier, clamp, lerp, rand, outline, curMap, myRank, switchMap, refreshModal, bodyEl, GEAR_CATS at call time.

const fx = {
  combo: 0, shake: 0, coins: [], rings: [], chests: [], chestClock: 35 + Math.random() * 35, toasts: [],
  legend: "idle", legendClock: 50 + Math.random() * 40, fight: null, hold: false,
  boost: { lucky: 0, frenzy: 0 }, storm: 0, stormClock: 200 + Math.random() * 180, stormFlash: 3,
  petClock: 30, petHop: 0, dayClock: 0, titleClock: 3, started: false,
};
const FX_KEYS = ["combo", "daily", "legend", "chests", "storm", "pets", "titles", "fx"];
const on = k => settings[k] !== false;
const LEGEND_NEED = 250000;

function F() {
  const f = state.fun || (state.fun = {});
  const d = { stars: 0, runEarned: 0, streak: 0, bestStreak: 0, lastDay: "", daily: { day: "", goals: [], all: false }, stock: { lucky: 0, frenzy: 0 }, pets: [], pet: "", title: "", seen: {}, stats: {}, mast: {}, records: {}, order: null, spinDay: "", petGifts: 0, lastSeen: 0 };
  for (const k of Object.keys(d)) if (f[k] === undefined) f[k] = d[k];
  for (const k of ["chests", "legends", "bestCombo", "storms", "dailies", "doubles", "triples", "gemsTotal", "time", "bestCatch"]) if (typeof f.stats[k] !== "number") f.stats[k] = 0;
  for (const k of ["lucky", "frenzy"]) if (typeof f.stock[k] !== "number") f.stock[k] = 0;
  return f;
}
const toast = (text, color = "#c8f7c5") => { fx.toasts.push({ text, color, life: 2.8 }); };
const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const dailyRng = s => { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; };

// ---------- multipliers used by game.js ----------
const comboMult = () => (on("combo") && fx.combo >= 2 ? 1 + Math.min(fx.combo - 1, 10) * 0.2 : 1);
const legendMult = () => 1 + 0.25 * F().stars;
const funLuck = () => (fx.boost.lucky > 0 ? 1.6 : 1) * (fx.storm > 0 ? 1.5 : 1) * mapT().luck * extraLuck();
const funBite = () => (fx.boost.frenzy > 0 ? 1.8 : 1) * extraBite() * lmBite();
const funWear = () => { const w = (fx.storm > 0 ? 2 : 1) * mapT().wear * extraWear(); return Math.floor(w) + (Math.random() < w % 1 ? 1 : 0); };
function funReset() { if (g.fish && !g.fish.junk && g.fish.rarity >= 2) extraMiss(); if (fx.combo >= 3 && on("combo")) toast("COMBO LOST at x" + fx.combo, "#ffb3b3"); fx.combo = 0; g.legend = false; }
function funCatchMult(f) { // called right before the money is added
  fx.combo++; const s = F().stats; if (fx.combo > s.bestCombo) s.bestCombo = fx.combo;
  return comboMult() * legendMult() * (g.legend ? 4 : 1) * moreMult(f);
}

// ---------- daily challenges ----------
const DAILY_TYPES = [
  { t: "fish", txt: n => `Catch ${n} fish`, need: r => 8 + Math.floor(r() * 9) },
  { t: "unc", txt: n => `Catch ${n} Uncommon-or-better fish`, need: r => 3 + Math.floor(r() * 4) },
  { t: "rare", txt: n => `Catch ${n} Rare-or-better fish`, need: r => 1 + Math.floor(r() * 2) },
  { t: "earn", txt: n => `Earn ${fmt(n)} from fish`, need: () => Math.max(500, Math.round(state.money * 0.06 / 100) * 100) },
  { t: "combo", txt: n => `Get a x${n} catch combo`, need: r => 4 + Math.floor(r() * 4), only: () => on("combo") },
  { t: "chest", txt: () => "Open a treasure chest or bottle", need: () => 1, only: () => on("chests") },
];
function genDaily(key) {
  const r = dailyRng(key), pool = DAILY_TYPES.filter(d => !d.only || d.only()), goals = [];
  const rw = Math.round(Math.max(300, state.money * 0.04) / 50) * 50;
  while (goals.length < 3 && pool.length) { const d = pool.splice(Math.floor(r() * pool.length), 1)[0]; goals.push({ t: d.t, need: d.need(r), p: 0, done: false, rw }); }
  return { day: key, goals, all: false };
}
const dailyTxt = gl => DAILY_TYPES.find(d => d.t === gl.t).txt(gl.need);
function dailyAdd(type, n) {
  if (!on("daily")) return;
  const d = F().daily;
  for (const gl of d.goals) {
    if (gl.t !== type || gl.done) continue;
    if (type === "combo") gl.p = Math.max(gl.p, n); else gl.p += n;
    if (gl.p >= gl.need) {
      gl.p = gl.need; gl.done = true; state.money += gl.rw; F().stats.dailies++;
      toast("DAILY DONE: " + dailyTxt(gl) + "  +" + fmt(gl.rw), "#ffe066"); Snd.chime(); save();
    }
  }
  if (!d.all && d.goals.length && d.goals.every(x => x.done)) {
    d.all = true; F().stock.lucky++; const bonus = d.goals[0].rw * 2; state.money += bonus;
    toast("ALL DAILIES DONE! +" + fmt(bonus) + " and a Lucky Hour!", "#ffe066"); Snd.rewardReady(); save(); addGems(2, "all dailies");
  }
}
function checkDay() {
  const f = F(), today = dayKey();
  if (f.lastDay !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    f.streak = f.lastDay === dayKey(y) ? f.streak + 1 : 1; f.bestStreak = Math.max(f.bestStreak, f.streak);
    f.lastDay = today;
    if (on("daily")) {
      const bonus = Math.round(Math.min(f.streak, 7) * Math.max(100, state.money * 0.02) / 10) * 10;
      state.money += bonus; toast("DAY " + f.streak + " STREAK!  Daily bonus +" + fmt(bonus), "#ffe066");
    }
    save();
  }
  if (on("daily") && f.daily.day !== today) { f.daily = genDaily(today); save(); }
}

// ---------- titles ----------
const speciesN = () => FISH.filter(f => state.caught[f.name] > 0).length;
const TITLES = [
  { id: "rookie", name: "Rookie Angler", need: "Start fishing", ok: () => true },
  { id: "weekend", name: "Weekend Warrior", need: "Catch 50 fish", ok: () => state.total >= 50 },
  { id: "book", name: "Bookworm", need: "Catch 30 kinds of fish", ok: () => speciesN() >= 30 },
  { id: "combo", name: "Combo King", need: "Get a x10 combo", ok: () => F().stats.bestCombo >= 10 },
  { id: "chest", name: "Treasure Hunter", need: "Open 5 chests", ok: () => F().stats.chests >= 5 },
  { id: "storm", name: "Storm Chaser", need: "Fish through 3 storms", ok: () => F().stats.storms >= 3 },
  { id: "daily", name: "Daily Devotee", need: "Reach a 5 day streak", ok: () => F().bestStreak >= 5 },
  { id: "pet", name: "Pet Parent", need: "Adopt a pet", ok: () => F().pets.length > 0 },
  { id: "legend", name: "Legend Slayer", need: "Land a legendary fish", ok: () => F().stats.legends >= 1 },
  { id: "mil", name: "Millionaire", need: "Earn $1,000,000 from fish", ok: () => (state.stats.earned || 0) >= 1000000 },
  { id: "star", name: "Star Angler", need: "Do a Legend reset", ok: () => F().stars >= 1 },
];
function titleNow() { const f = F(); const t = TITLES.find(x => x.id === f.title && f.seen[x.id]); if (t) return t; const un = TITLES.filter(x => f.seen[x.id]); return un[un.length - 1] || TITLES[0]; }
function checkTitles() {
  const f = F();
  for (const t of TITLES) if (!f.seen[t.id] && t.ok()) { f.seen[t.id] = 1; if (t.id !== "rookie") { toast("TITLE UNLOCKED: " + t.name, "#e3c8ff"); Snd.chime(); } save(); }
}

// ---------- pets ----------
const PETS = [
  { id: "cat", name: "Whiskers the Cat", gems: 6, cost: 3000, pct: 0.006, cap: 400, every: [40, 70] },
  { id: "pelican", name: "Pete the Pelican", gems: 14, cost: 20000, pct: 0.009, cap: 1800, every: [38, 65] },
  { id: "otter", name: "Otto the Otter", gems: 22, cost: 90000, pct: 0.012, cap: 9000, every: [35, 60] },
  { id: "penguin", name: "Pip the Penguin", gems: 30, cost: 300000, pct: 0.016, cap: 40000, every: [32, 55] },
];
function petGift() {
  const p = PETS.find(x => x.id === F().pet); if (!p) return;
  const amt = Math.round(clamp(state.money * p.pct, 25, p.cap) * petBoost()); // pets level up and find more
  F().petGifts = (F().petGifts || 0) + 1; if (F().petGifts % 8 === 0) toast(p.name.split(" ")[0] + " reached level " + petLevel() + "!", "#c8f7c5");
  state.money += amt; save(); refreshModal(); fx.petHop = 0.7; Snd.coin();
  popup("+" + fmt(amt), W - 268, DECK_Y - 90, "#9cf5b6", 1.6, 30); popup(p.name.split(" ")[0] + " found a fish!", W - 268, DECK_Y - 122, "#fff", 1.6, 22);
}

// ---------- chests and bottles ----------
function spawnChest() {
  const bottle = Math.random() < 0.4;
  fx.chests.push({ x: rand(320, W - 420), life: 26, bottle, ph: rand(0, 6), vx: rand(-8, 8) });
  toast(bottle ? "A message in a bottle! Click it!" : "A treasure chest floats by! Click it!", "#ffe066"); Snd.rewardReady();
}
function openChest(c) {
  const f = F(), r = Math.random(); f.stats.chests++; dailyAdd("chest", 1);
  let msg, big = false;
  if (c.bottle) {
    if (r < 0.75) { const a = Math.round(Math.max(60, state.money * 0.02) * rand(0.7, 1.4) / 5) * 5; state.money += a; msg = "+" + fmt(a); }
    else { f.stock.frenzy++; msg = "Bait Frenzy boost!"; }
  } else if (r < 0.5) { const a = Math.round(Math.max(150, state.money * 0.06) * rand(0.7, 1.5) / 5) * 5; state.money += a; msg = "+" + fmt(a); }
  else if (r < 0.68) { f.stock.lucky++; msg = "Lucky Hour boost!"; }
  else if (r < 0.84) { f.stock.frenzy++; msg = "Bait Frenzy boost!"; }
  else { const a = Math.round(Math.max(600, state.money * 0.2) / 5) * 5; state.money += a; msg = "JACKPOT +" + fmt(a); big = true; }
  popup(msg, c.x, WATER_Y - 40, big ? "#ffe066" : "#fff", 2, big ? 46 : 36);
  coinBurst(c.x, WATER_Y, big ? 36 : 16); if (on("fx")) fx.shake = Math.max(fx.shake, big ? 10 : 4);
  if (Math.random() < (c.bottle ? 0.08 : 0.2)) addGems(c.bottle ? 1 : 1 + Math.floor(Math.random() * 2), c.bottle ? "bottle" : "chest");
  Snd.chime(); save(); refreshModal();
}
// returns true if the click was used up by the extras
function funClick(x, y) {
  if (g.mode === "fight") { fightClick(); return true; }
  for (let i = fx.chests.length - 1; i >= 0; i--) {
    const c = fx.chests[i];
    if (Math.abs(x - c.x) < 52 && y > WATER_Y - 70 && y < WATER_Y + 60) { fx.chests.splice(i, 1); openChest(c); return true; }
  }
  return false;
}

// ---------- effects ----------
function coinBurst(x, y, n) { for (let i = 0; i < n; i++) fx.coins.push({ x, y, vx: rand(-260, 120), vy: rand(-520, -220), life: rand(0.8, 1.5), r: rand(6, 10) }); if (n > 0) Snd.coin(); }
function funShakeApply() { if (fx.shake > 0.3 && on("fx")) ctx.translate(rand(-fx.shake, fx.shake), rand(-fx.shake, fx.shake)); }

// three small extras that keep "one more cast" tempting
function fishOfDay() { // one fish a day sells for x3 (a fish you can actually catch: Common to Rare)
  const pool = FISH.filter(f => f.rarity <= 2), r = dailyRng("fotd" + dayKey()); return pool[Math.floor(r() * pool.length)];
}
function bonusCatch(f, net) {
  if (!on("bonuses")) return;
  const n = g.multi || 1, bx = W - BUCKET_X;
  if (state.caught[f.name] === n) { // discovery bonus: the first time you ever catch a kind of fish
    const b = Math.max(20, Math.round(f.value * 3 * mapT().sell)); state.money += b; F().runEarned += b; state.stats.earned += b;
    popup("+" + fmt(b) + " DISCOVERY!", bx - 60, DECK_Y - 175, "#7dffb0", 2.2, 30);
  }
  if (Math.floor(state.total / 25) > Math.floor((state.total - n) / 25)) { // every 25th catch is a lucky one
    const b = net * 2; state.money += b; F().runEarned += b; state.stats.earned += b;
    toast("LUCKY " + state.total + "TH CATCH!  x3  +" + fmt(b), "#ffe066"); coinBurst(bx, DECK_Y - 60, 34); if (on("fx")) fx.shake = Math.max(fx.shake, 9); Snd.rewardReady();
  }
  if (f.name === fishOfDay().name) { // the fish of the day
    const b = net * 2; state.money += b; F().runEarned += b; state.stats.earned += b;
    popup("FISH OF THE DAY x3  +" + fmt(b), bx - 60, DECK_Y - 215, "#ffd23f", 2.4, 32); coinBurst(bx, DECK_Y - 60, 20);
  }
}
function funAfterCatch(f, net, shiny, big) {
  const F_ = F(); F_.runEarned += net; bonusCatch(f, net);
  { const gr = [0, 0, 1, 2, 3, 5][f.rarity] || 0, chance = [0, 0, 0.06, 0.12, 0.25, 1][f.rarity] || 0; if (gr && Math.random() < chance) addGems(gr, RARITIES[f.rarity].name + " fish"); } // rarer fish sometimes drop gems (the very rare ones always do)
  if (shiny) addGems(1, "shiny");
  if (g.multi === 2) F_.stats.doubles++; if (g.multi === 3) { F_.stats.triples++; addGems(1, "triple catch"); }
  dailyAdd("fish", 1); if (f.rarity >= 1) dailyAdd("unc", 1); if (f.rarity >= 2) dailyAdd("rare", 1); dailyAdd("earn", net); dailyAdd("combo", fx.combo);
  const R = RARITIES[f.rarity], bx = W - BUCKET_X, by = DECK_Y - 60;
  if (on("fx")) {
    coinBurst(bx, by, clamp(4 + Math.floor(Math.log10(net + 1) * 4), 4, 28));
    fx.rings.push({ x: bx, y: by, r: 10, life: 0.8, col: R.col });
    if (f.rarity >= 3) fx.shake = Math.max(fx.shake, 7 + f.rarity * 2);
    if (f.rarity >= 4 || shiny) g.flash = Math.max(g.flash, 0.7);
  }
  if (on("combo") && fx.combo >= 2) { Snd.combo(fx.combo); if (fx.combo >= 3) popup(`COMBO x${fx.combo}!  money x${comboMult().toFixed(1)}`, bx - 120, by - 60, "#ff9a3c", 1.5, 38); }
  if (g.legend) {
    F_.stats.legends++; if (g.banner) { g.banner.text = "LEGENDARY! " + g.banner.text; g.banner.color = "#ffe066"; }
    if (on("fx")) { fx.shake = 18; coinBurst(bx, by, 40); }
    g.legend = false; Snd.rewardReady(); addGems(3, "legendary fish");
  }
  moreAfterCatch(f, net);
  extraAfterCatch(f, net);
  checkTitles();
}

// ---------- legendary fight ----------
function funStartFight() {
  if (!on("legend") || fx.legend !== "ready") return false;
  const maxS = tier("line") + 1;
  const pool = FISH.filter(f => f.maps.includes(state.map) && f.size <= maxS).sort((a, b) => b.value - a.value).slice(0, 3);
  if (!pool.length) { fx.legend = "idle"; return false; }
  g.fish = pool[Math.floor(Math.random() * pool.length)]; g.big = false; g.shiny = true; g.legend = true; g.multi = 1;
  fx.fight = { pos: 0, dir: 1, speed: 0.85, zc: 0.3 + Math.random() * 0.4, zw: 0.1, tries: 3, t: 0, limit: 15, res: null };
  fx.legend = "fight"; g.mode = "fight"; g.timer = 0; Snd.bite(); closeModal(); // the shop closes when a legendary fish bites
  toast("THE LEGENDARY FISH IS ON! CLICK when the red line is in the GREEN!", "#ffe066");
  return true;
}
// one click (or Space) while the fight is on
function fightClick() {
  const s = fx.fight; if (g.mode !== "fight" || !s || s.res) return;
  const hit = Math.abs(s.pos - s.zc) <= s.zw / 2;
  s.res = { ok: hit, t: 0.9 };
  if (hit) { Snd.chime(); if (on("fx")) fx.shake = Math.max(fx.shake, 8); }
  else { s.tries--; Snd.catchBad(); if (on("fx")) fx.shake = Math.max(fx.shake, 5); }
}
function funFight(dt) {
  const s = fx.fight; if (!s) { g.mode = "idle"; g.timer = 0; return; }
  s.t += dt;
  g.bobber.x = g.land.x + Math.sin(g.t * 40) * 3; g.bobber.y = WATER_Y + 4 + Math.abs(Math.sin(g.t * 22)) * 14;
  g.rodTarget = -45 + Math.sin(g.t * 30) * 8; g.rodK = 30;
  if (Math.random() < dt * 20) splash(g.bobber.x, WATER_Y, 1);
  if (s.res) { // show the result for a moment
    s.res.t -= dt; if (s.res.t > 0) return;
    if (s.res.ok) { fx.legend = "idle"; fx.legendClock = rand(80, 150); fx.fight = null; g.mode = "reel"; g.timer = 0; g.reelDur = 1.1; toast("GOT HIM! REEL HIM IN!", "#ffe066"); return; }
    if (s.tries > 0) { s.res = null; s.speed *= 1.18; s.zc = 0.15 + Math.random() * 0.7; s.pos = Math.random() < 0.5 ? 0 : 1; s.dir = s.pos ? -1 : 1; return; } // new round: faster line, new green spot
    fx.legend = "idle"; fx.legendClock = rand(60, 110); fx.fight = null;
    const p = fishPose(); if (g.fish && p) g.escape = { f: g.fish, L: g.fish.len, x: p.x, y: p.y, life: 1.3, shiny: true, side: g.fishSide || 1 };
    g.fish = null; g.shiny = false; g.legend = false; g.mode = "idle"; g.timer = 0; funReset();
    splash(g.bobber.x, WATER_Y, 14); Snd.snap(); g.banner = { text: "IT GOT AWAY!", sub: "A legend will come back...", life: 2.6, color: "#ff5a5f", subColor: "#fff" };
    return;
  }
  if (s.t >= s.limit) { s.tries = 0; s.res = { ok: false, t: 0.9 }; Snd.catchBad(); return; } // out of time
  s.pos += s.dir * s.speed * (1 + 0.35 * Math.sin(s.t * 2.3)) * dt;
  if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; }
}
window.addEventListener("keydown", e => { if (e.code === "Space" && g.mode === "fight" && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) { e.preventDefault(); if (!e.repeat) fightClick(); } });

// ---------- per-frame update ----------
function funUpdate(dt) {
  if (typeof story !== "undefined" && story.active) return;
  if (typeof licenseBlocked === "function" && licenseBlocked()) return;
  if (!fx.started) { fx.started = true; checkDay(); checkTitles(); }
  fx.dayClock -= dt; if (fx.dayClock <= 0) { fx.dayClock = 20; checkDay(); }
  fx.titleClock -= dt; if (fx.titleClock <= 0) { fx.titleClock = 3; checkTitles(); checkRank(); }
  const B = fx.boost; B.lucky = Math.max(0, B.lucky - dt); B.frenzy = Math.max(0, B.frenzy - dt);
  fx.shake = Math.max(0, fx.shake - dt * 30);
  for (const c of fx.coins) { c.life -= dt; c.vy += 1300 * dt; c.x += c.vx * dt; c.y += c.vy * dt; }
  fx.coins = fx.coins.filter(c => c.life > 0);
  for (const r of fx.rings) { r.life -= dt; r.r += 260 * dt; } fx.rings = fx.rings.filter(r => r.life > 0);
  if (fx.toasts.length) { fx.toasts[0].life -= dt; if (fx.toasts[0].life <= 0) fx.toasts.shift(); }
  if (fx.petHop > 0) fx.petHop -= dt;

  // legendary fish
  if (on("legend")) {
    if (fx.legend === "idle") { fx.legendClock -= dt; if (fx.legendClock <= 0) { fx.legend = "ready"; toast("A GOLDEN SHADOW! Your next bite is a LEGENDARY fish!", "#ffe066"); Snd.rewardReady(); } }
  } else if (fx.legend !== "idle" && g.mode !== "fight") fx.legend = "idle";
  // chests and bottles
  if (on("chests")) { fx.chestClock -= dt; if (fx.chestClock <= 0) { fx.chestClock = rand(45, 90); if (fx.chests.length < 2) spawnChest(); } }
  for (const c of fx.chests) { c.life -= dt; c.x += c.vx * dt; }
  fx.chests = fx.chests.filter(c => c.life > 0);
  // storms
  if (on("storm")) {
    if (fx.storm > 0) {
      fx.storm -= dt; if (settings.rain && !curMap().noWeather) g.raining = true;
      fx.stormFlash -= dt; if (fx.stormFlash <= 0) { fx.stormFlash = rand(3, 8); g.flash = 0.8; Snd.thunder(); }
      if (fx.storm <= 0) toast("The storm passes.", "#bfe3ff");
    } else { fx.stormClock -= dt; if (fx.stormClock <= 0) { fx.storm = 60; fx.stormClock = rand(240, 420); F().stats.storms++; toast("STORM! Rare fish bite more - but your line wears 2x", "#bfe3ff"); Snd.thunder(); g.flash = 0.9; } }
  } else fx.storm = 0;
  // pet
  if (on("pets") && F().pet) { fx.petClock -= dt; if (fx.petClock <= 0) { const p = PETS.find(x => x.id === F().pet); fx.petClock = p ? rand(p.every[0], p.every[1]) : 50; petGift(); } }
}

// ---------- drawing: the pet, in scene space (dock on the left, mirrored later) ----------
function drawPetShape(id, t, c = ctx) {
  c.save(); ol(c, 3);
  if (id === "cat") {
    c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(-14, -10); c.quadraticCurveTo(-32, -14, -26, -34 + Math.sin(t * 3) * 4); c.stroke();
    c.strokeStyle = "#ff9a3c"; c.lineWidth = 4; c.stroke(); ol(c, 3);
    c.fillStyle = "#ff9a3c"; c.beginPath(); c.ellipse(0, -13, 16, 12, 0, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.arc(14, -26, 10, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(6, -33); c.lineTo(8, -46); c.lineTo(15, -35); c.closePath(); c.moveTo(15, -35); c.lineTo(21, -45); c.lineTo(22, -30); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "#d9702a"; c.lineWidth = 2; for (const x of [-6, 0, 6]) { c.beginPath(); c.moveTo(x, -23); c.lineTo(x + 1, -16); c.stroke(); }
    c.fillStyle = INK; c.beginPath(); c.arc(18, -28, 1.8, 0, 7); c.arc(11, -28, 1.8, 0, 7); c.fill(); c.fillStyle = "#ff8fb1"; c.beginPath(); c.arc(21, -24, 1.6, 0, 7); c.fill();
  } else if (id === "pelican") {
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-3, -8); c.lineTo(-3, 0); c.moveTo(4, -8); c.lineTo(4, 0); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(0, -20, 15, 13, -0.1, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#cfd8e6"; c.beginPath(); c.ellipse(-3, -19, 9, 6, 0.2, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(11, -38, 8, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#ffb020"; c.beginPath(); c.moveTo(16, -40); c.lineTo(40, -34); c.quadraticCurveTo(30, -26, 16, -32); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(13, -40, 1.8, 0, 7); c.fill();
  } else if (id === "otter") {
    c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(-16, -8); c.quadraticCurveTo(-32, -6, -34, -14 + Math.sin(t * 3) * 3); c.stroke();
    c.strokeStyle = "#8a5a35"; c.lineWidth = 4; c.stroke(); ol(c, 3);
    c.fillStyle = "#8a5a35"; c.beginPath(); c.ellipse(0, -12, 18, 10, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#d9b38a"; c.beginPath(); c.ellipse(4, -9, 10, 5, 0, 0, 7); c.fill();
    c.fillStyle = "#8a5a35"; c.beginPath(); c.arc(17, -20, 9, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.arc(11, -28, 3, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#d9b38a"; c.beginPath(); c.ellipse(22, -17, 5, 4, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(19, -23, 1.8, 0, 7); c.arc(24, -19, 1.8, 0, 7); c.fill();
    c.lineWidth = 1.5; c.beginPath(); c.moveTo(25, -16); c.lineTo(33, -18); c.moveTo(25, -15); c.lineTo(33, -13); c.stroke();
  } else { // penguin
    c.fillStyle = "#ffb020"; c.beginPath(); c.ellipse(-4, -1, 6, 3, 0, 0, 7); c.ellipse(6, -1, 6, 3, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#2b2f45"; c.beginPath(); c.ellipse(0, -20, 13, 19, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(3, -17, 8, 14, 0, 0, 7); c.fill();
    c.fillStyle = "#2b2f45"; c.beginPath(); c.ellipse(-12, -20, 4, 10, 0.3 + Math.sin(t * 4) * 0.1, 0, 7); c.fill(); c.stroke();
    c.fillStyle = "#ffb020"; c.beginPath(); c.moveTo(10, -30); c.lineTo(20, -27); c.lineTo(10, -24); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(8, -33, 3.2, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(9, -33, 1.5, 0, 7); c.fill();
  }
  c.restore();
}
function funDrawPet() {
  if (!on("pets") || !F().pet) return;
  const hop = fx.petHop > 0 ? Math.abs(Math.sin(fx.petHop / 0.7 * Math.PI * 2)) * 16 : 0;
  ctx.save(); ctx.translate(268, DECK_Y - hop * 1.6 + Math.sin(g.t * 3) * 0.8); ctx.scale(1.9, 1.9); drawPetShape(F().pet, g.t); ctx.restore();
}

// ---------- drawing: things in screen space (unmirrored) ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function drawChest(c) {
  const bob = Math.sin(g.t * 2 + c.ph) * 4, y = WATER_Y + 6 + bob, a = clamp(c.life / 2, 0, 1);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(c.x, y); ctx.rotate(Math.sin(g.t * 1.6 + c.ph) * 0.1); outline(3);
  if (c.bottle) {
    ctx.fillStyle = "#7ed6a0"; rr(-12, -22, 24, 34, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c98b4a"; rr(-5, -32, 10, 12, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff6d6"; rr(-6, -12, 12, 18, 3); ctx.fill(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.moveTo(-3, -2); ctx.lineTo(3, -2); ctx.stroke();
  } else {
    ctx.fillStyle = "#b5773a"; rr(-24, -16, 48, 30, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#d59a52"; ctx.beginPath(); ctx.moveTo(-24, -14); ctx.quadraticCurveTo(0, -38, 24, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffd23f"; rr(-5, -12, 10, 12, 3); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(g.t * 6 + c.ph)); ctx.fillStyle = "#fff8c2"; ctx.font = "24px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.fillText("*", c.x + 26, y - 20); ctx.fillText("*", c.x - 30, y - 6); ctx.restore();
}
function funDrawWorld() {
  const c = ctx;
  if (fx.legend === "ready" && on("legend")) { // the golden shadow
    const x = ((g.t * 60) % (W + 300)) - 150, y = WATER_Y + 130 + Math.sin(g.t * 1.5) * 20;
    c.save(); c.globalAlpha = 0.55 + 0.25 * Math.sin(g.t * 4); c.fillStyle = "#ffd23f"; c.beginPath(); c.ellipse(x, y, 60, 22, 0, 0, 7); c.moveTo(x - 50, y); c.lineTo(x - 90, y - 20); c.lineTo(x - 90, y + 20); c.closePath(); c.fill();
    c.globalAlpha = 1; c.fillStyle = "#fff8c2"; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + 20 - i * 30 + Math.sin(g.t * 5 + i) * 6, y - 26 - i * 5, 2.5, 0, 7); c.fill(); } c.restore();
  }
  for (const ch of fx.chests) drawChest(ch);
  for (const r of fx.rings) { c.save(); c.globalAlpha = clamp(r.life / 0.8, 0, 1); c.lineWidth = 6; c.strokeStyle = r.col; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke(); c.restore(); }
  for (const p of fx.coins) { c.save(); c.globalAlpha = clamp(p.life * 2, 0, 1); c.translate(p.x, p.y); c.scale(Math.abs(Math.cos(p.life * 9)) * 0.7 + 0.3, 1); c.fillStyle = "#ffd23f"; outline(2.5); c.beginPath(); c.arc(0, 0, p.r, 0, 7); c.fill(); c.stroke(); c.fillStyle = "#fff3a0"; c.beginPath(); c.arc(-p.r * 0.25, -p.r * 0.25, p.r * 0.35, 0, 7); c.fill(); c.restore(); }
  if (fx.storm > 0) { c.save(); c.fillStyle = "rgba(20,30,70,.22)"; c.fillRect(0, 0, W, H); c.restore(); }
  if (on("titles")) { // title under the stickman
    const t = titleNow(), x = W - 190, y = DECK_Y + 46;
    c.save(); c.font = "17px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    const w = c.measureText(t.name).width + 20; c.fillStyle = "#fff2b8"; outline(3); rr(x - w / 2, y - 12, w, 24, 10); c.fill(); c.stroke(); c.fillStyle = INK; c.fillText(t.name, x, y + 1); c.restore();
  }
}
function funChips(nextY) {
  const F_ = F();
  if (on("combo") && fx.combo >= 2) chip(`COMBO x${fx.combo}  -  MONEY x${comboMult().toFixed(1)}`, 14, nextY(), "#ffd0a0");
  if (on("daily") && F_.daily.goals.length) { const dn = F_.daily.goals.filter(x => x.done).length; chip(`DAILY: ${dn}/${F_.daily.goals.length}`, 14, nextY(), dn === F_.daily.goals.length ? "#c8f7c5" : "#e8ddff"); }
  if (fx.boost.lucky > 0) chip(`LUCKY HOUR ${Math.ceil(fx.boost.lucky)}s`, 14, nextY(), "#d8ffb8");
  if (fx.boost.frenzy > 0) chip(`BAIT FRENZY ${Math.ceil(fx.boost.frenzy)}s`, 14, nextY(), "#ffe0b8");
  if (fx.storm > 0) chip(`STORM ${Math.ceil(fx.storm)}s: rare fish x1.5, line wear x2`, 14, nextY(), "#bfe3ff");
  if (fx.legend === "ready") chip("GOLDEN SHADOW: next bite is LEGENDARY!", 14, nextY(), "#ffe066");
}
function funDrawHUD() {
  const c = ctx;
  if (fx.toasts.length) { // toast queue
    const t = fx.toasts[0], a = clamp(t.life / 0.5, 0, 1);
    c.save(); c.globalAlpha = a; c.textAlign = "center"; c.font = "32px Bangers, Impact, sans-serif"; c.lineWidth = 7; c.strokeStyle = INK; c.fillStyle = t.color; c.lineJoin = "round";
    c.strokeText(t.text, W / 2, 270); c.fillText(t.text, W / 2, 270); c.restore();
  }
  if (g.mode === "fight" && fx.fight) { // the big timing bar
    const s = fx.fight, bx = W * 0.07, bw = W * 0.86, by = H * 0.2, bh = H * 0.55;
    c.save(); c.fillStyle = "rgba(10,20,50,.55)"; c.fillRect(0, 0, W, H);
    outline(6); c.fillStyle = "#fff"; rr(bx, by, bw, bh, 26); c.fill(); c.stroke();
    c.fillStyle = "#dff3ff"; rr(bx + 10, by + 10, bw - 20, bh - 20, 18); c.fill();
    const zx = bx + 10 + (s.zc - s.zw / 2) * (bw - 20), zw = s.zw * (bw - 20);
    c.fillStyle = "#3fd16b"; c.fillRect(zx, by + 10, zw, bh - 20); c.strokeStyle = "#1e8f45"; c.lineWidth = 4; c.strokeRect(zx, by + 10, zw, bh - 20);
    const lx = bx + 10 + s.pos * (bw - 20);
    c.strokeStyle = INK; c.lineWidth = 12; c.beginPath(); c.moveTo(lx, by + 4); c.lineTo(lx, by + bh - 4); c.stroke();
    c.strokeStyle = "#ff3b3b"; c.lineWidth = 7; c.beginPath(); c.moveTo(lx, by + 4); c.lineTo(lx, by + bh - 4); c.stroke();
    c.textAlign = "center"; c.lineJoin = "round"; c.lineWidth = 8; c.strokeStyle = INK; c.fillStyle = "#ffe066"; c.font = "54px Bangers, Impact, sans-serif";
    c.strokeText("LEGENDARY FISH!", W / 2, by - 50); c.fillText("LEGENDARY FISH!", W / 2, by - 50);
    c.font = "30px Bangers, Impact, sans-serif"; c.lineWidth = 6; c.fillStyle = "#fff";
    c.strokeText("CLICK (or press SPACE) when the RED line is in the GREEN!", W / 2, by - 14); c.fillText("CLICK (or press SPACE) when the RED line is in the GREEN!", W / 2, by - 14);
    c.font = "34px Bangers, Impact, sans-serif"; c.fillStyle = "#ffd23f"; const tl = "TRIES LEFT: " + s.tries + "     TIME: " + Math.max(0, Math.ceil(s.limit - s.t)) + "s"; c.strokeText(tl, W / 2, by + bh + 48); c.fillText(tl, W / 2, by + bh + 48);
    if (s.res) { c.font = "90px Bangers, Impact, sans-serif"; c.lineWidth = 12; c.fillStyle = s.res.ok ? "#4fd66b" : "#ff5a5f"; const t = s.res.ok ? "GOT HIM!" : (s.tries > 0 ? "MISSED!" : "IT ESCAPED!"); c.strokeText(t, W / 2, by + bh / 2 + 30); c.fillText(t, W / 2, by + bh / 2 + 30); }
    c.restore();
  }
}

// ---------- Legend rebirth ----------
const legendGain = () => Math.max(1, Math.floor(Math.sqrt(F().runEarned / LEGEND_NEED)));
function doLegend() {
  const f = F(); if (f.runEarned < LEGEND_NEED) return;
  const gain = legendGain();
  if (!confirm(`LEGEND RESET: you get ${gain} Legend star${gain > 1 ? "s" : ""} (+${gain * 25}% money on every fish, forever).\nYour money and gear go back to the start. Your Fish Book, rank, rewards and pets stay.\nContinue?`)) return;
  f.stars += gain; f.runEarned = 0; state.money = 0; state.lineUses = 0;
  for (const cat of GEAR_CATS) { state.owned[cat] = [1]; state.equipped[cat] = 1; }
  save(); switchMap(); checkTitles();
  fx.combo = 0; g.banner = { text: "A NEW LEGEND RISES!", sub: `${f.stars} Legend star${f.stars > 1 ? "s" : ""}: fish sell +${f.stars * 25}%`, life: 3.6, color: "#ffe066", subColor: "#fff" };
  Snd.rewardReady(); if (on("fx")) fx.shake = 14; refreshModal();
}

// ---------- the Extras tab ----------
const boostCost = () => Math.round(Math.max(500, state.money * 0.02) / 10) * 10;
function renderFun() {
  const scroll = bodyEl.scrollTop, f = F(); bodyEl.innerHTML = "";
  const wrap = document.createElement("div"); wrap.className = "settings";
  const section = t => { const d = document.createElement("div"); d.className = "sect"; d.innerHTML = `<h3>${t}</h3>`; wrap.appendChild(d); return d; };
  const row = (p, label, note) => { const r = document.createElement("div"); r.className = "row"; const l = document.createElement("label"); l.innerHTML = label + (note ? `<small>${note}</small>` : ""); r.appendChild(l); p.appendChild(r); return r; };
  const btn = (r, text, fn, dis, cls = "act") => { const b = document.createElement("button"); b.className = cls; b.textContent = text; b.disabled = !!dis; b.onclick = () => { fn(); refreshModal(); }; r.appendChild(b); return b; };

  const d = section("Daily challenges");
  row(d, `Login streak: ${f.streak} day${f.streak === 1 ? "" : "s"}`, `Best streak: ${f.bestStreak}. Come back every day for a bigger bonus (up to 7 days).`);
  if (!on("daily")) row(d, "Daily challenges are turned off", "Turn them on in Settings > Extras");
  for (const gl of f.daily.goals) row(d, dailyTxt(gl), gl.done ? "DONE!" : `${Math.min(gl.p, gl.need)} / ${gl.need}   -   reward ${fmt(gl.rw)}`);
  { const fd = fishOfDay(); row(d, "Fish of the Day: " + fd.name, "Sells for x3 today. Found in: " + (fd.maps.map(m => MAPS[m].name).join(", ") || "?")); }
  if (f.daily.goals.length) row(d, "Finish all three", f.daily.all ? "Bonus collected: money + a Lucky Hour" : "Bonus: double money and a Lucky Hour");

  const b = section("Boosts");
  row(b, "Lucky Hour  (you have " + f.stock.lucky + ")", "60 seconds: rare fish are much more likely to bite" + (fx.boost.lucky > 0 ? `  -  ACTIVE ${Math.ceil(fx.boost.lucky)}s` : ""));
  { const r = b.lastChild; btn(r, "USE", () => { f.stock.lucky--; fx.boost.lucky += 60; save(); Snd.chime(); }, f.stock.lucky < 1 || fx.boost.lucky > 0); btn(r, "BUY " + fmt(boostCost()), () => { state.money -= boostCost(); f.stock.lucky++; save(); Snd.buy(); }, state.money < boostCost()); btn(r, "\u25C6 2", () => { state.gems -= 2; f.stock.lucky++; save(); Snd.buy(); }, (state.gems || 0) < 2); }
  row(b, "Bait Frenzy  (you have " + f.stock.frenzy + ")", "60 seconds: fish bite much faster" + (fx.boost.frenzy > 0 ? `  -  ACTIVE ${Math.ceil(fx.boost.frenzy)}s` : ""));
  { const r = b.lastChild; btn(r, "USE", () => { f.stock.frenzy--; fx.boost.frenzy += 60; save(); Snd.chime(); }, f.stock.frenzy < 1 || fx.boost.frenzy > 0); btn(r, "BUY " + fmt(boostCost()), () => { state.money -= boostCost(); f.stock.frenzy++; save(); Snd.buy(); }, state.money < boostCost()); btn(r, "\u25C6 2", () => { state.gems -= 2; f.stock.frenzy++; save(); Snd.buy(); }, (state.gems || 0) < 2); }

  const l = section("Legend reset");
  row(l, `Legend stars: ${f.stars}`, `Every star gives +25% money on all fish, forever (now x${legendMult().toFixed(2)})`);
  const need = Math.min(f.runEarned, LEGEND_NEED);
  row(l, "Earn " + fmt(LEGEND_NEED) + " from fish this run", `${fmt(need)} / ${fmt(LEGEND_NEED)}`);
  { const r = row(l, "Do a Legend reset", f.runEarned >= LEGEND_NEED ? `You would earn ${legendGain()} star${legendGain() > 1 ? "s" : ""}. Money and gear start over. Fish Book, rank, rewards and pets stay.` : "Not ready yet"); btn(r, "RESET", doLegend, f.runEarned < LEGEND_NEED, "act danger"); }

  const t = section("Titles");
  const cur = titleNow();
  for (const ti of TITLES) {
    const un = !!f.seen[ti.id], r = row(t, un ? ti.name : "???", ti.need);
    btn(r, cur.id === ti.id ? "WEARING" : un ? "WEAR" : "LOCKED", () => { f.title = ti.id; save(); }, !un || cur.id === ti.id);
  }

  const s = section("Your records");
  row(s, "Best combo", "x" + f.stats.bestCombo); row(s, "Legendary fish landed", String(f.stats.legends)); row(s, "Chests and bottles opened", String(f.stats.chests));
  row(s, "Storms fished through", String(f.stats.storms)); row(s, "Daily challenges done", String(f.stats.dailies));

  renderMoreFun(section, row, btn);
  renderExtraFun(section, row, btn);
  bodyEl.appendChild(wrap); bodyEl.scrollTop = scroll;
}

// ---------- harder economy: bad catches never go away, good fish are capped at 50% ----------
const FISH_VALUE = 0.5; // every fish sells for half as much
const gearScore = () => clamp((tier("rod") + tier("line") + tier("bait") - 3) / 42, 0, 1); // 0 = starter gear, 1 = best gear
const junkChance = () => clamp(lerp(0.28, 0.14, gearScore()) + mapT().junk + lmJunk(), 0.03, 0.8);  // junk is rarer now: about 28% with starter gear and 14% with the best gear
const goodChance = () => lerp(0.12, 0.5, gearScore());   // chance that a real fish is a good one (Rare or better): 50% at most

// ---------- the Pets tab: a card for every pet ----------
function renderPets() {
  const scroll = bodyEl.scrollTop, f = F(); bodyEl.innerHTML = "";
  const grid = document.createElement("div"); grid.className = "grid";
  for (const pt of PETS) {
    const own = f.pets.includes(pt.id), here = f.pet === pt.id;
    const card = document.createElement("div"); card.className = "card" + (here ? " equipped" : "");
    const cv = document.createElement("canvas"); cv.width = 200; cv.height = 110; card.appendChild(cv);
    const c = cv.getContext("2d"); c.save(); c.translate(100, 96); c.scale(2.2, 2.2); drawPetShape(pt.id, 0, c); c.restore();
    card.insertAdjacentHTML("beforeend", `<b>${pt.name}</b><small>Brings you a fish worth about ${(pt.pct * 100).toFixed(1)}% of your money every ~${Math.round((pt.every[0] + pt.every[1]) / 2)}s (up to ${fmt(pt.cap)})</small>${here ? `<small>Level ${petLevel()}: finds ${Math.round((petBoost() - 1) * 100)}% more (a level every 8 gifts)</small>` : ""}`);
    const btn = document.createElement("button");
    if (!own) { btn.textContent = "ADOPT " + fmt(pt.cost); btn.disabled = state.money < pt.cost; btn.onclick = () => { state.money -= pt.cost; f.pets.push(pt.id); f.pet = pt.id; fx.petClock = 15; save(); Snd.buy(); checkTitles(); refreshModal(); }; }
    else if (here) { btn.textContent = "SEND HOME"; btn.className = "equip"; btn.onclick = () => { f.pet = ""; save(); refreshModal(); }; }
    else { btn.textContent = "CHOOSE"; btn.className = "equip"; btn.onclick = () => { f.pet = pt.id; fx.petClock = 15; save(); refreshModal(); }; }
    card.appendChild(btn);
    if (!own) { const gb = document.createElement("button"); gb.className = "gembtn"; gb.textContent = "\u25C6 " + pt.gems; gb.disabled = (state.gems || 0) < pt.gems; gb.onclick = () => { state.gems -= pt.gems; f.pets.push(pt.id); f.pet = pt.id; fx.petClock = 15; save(); Snd.buy(); checkTitles(); refreshModal(); }; card.appendChild(gb); }
    grid.appendChild(card);
  }
  bodyEl.appendChild(grid); bodyEl.scrollTop = scroll;
}

// ---------- rare multi catches: only with a strong rod AND a strong line (both tier 8+) ----------
function rollMulti() {
  if (!on("multi") || g.legend) return 1;
  const s = Math.min(tier("rod"), tier("line")); if (s < 8) return 1;
  const p = 0.015 + (s - 8) * 0.004, r = Math.random(); // tier 8: 1.5% ... tier 24: 8% for two or more, and a quarter of those are three
  return r < p * 0.25 ? 3 : r < p ? 2 : 1;
}

// ---------- the fish swimming in the water are the ones you catch ----------
// which kind swims in: better line and bait make the rarer, bigger kinds turn up more (a couple of sizes above what you can hook yet, so you can see what is out there)
function pickWaterSpecies() {
  const maxSize = tier("line") + 3, pool = FISH.filter(f => f.maps.includes(state.map) && f.size <= maxSize);
  if (!pool.length) return FISH[0];
  const goods = pool.filter(f => f.rarity >= 2), lows = pool.filter(f => f.rarity < 2); // good fish are never more than about half of the swimmers
  const list = goods.length && lows.length ? (Math.random() < goodChance() ? goods : lows) : pool;
  return weightedPick(list, f => fishWeightNow(f, true)); // the population does not depend on where you last cast; each kind lives at its own depth
}
function makeWanderer(initial) {
  const span = H - 36 - WATER_Y, f = pickWaterSpecies();
  const dy = clamp(f.minDist + rand(-0.05, 0.3), 0.02, 0.97), fromLeft = Math.random() < 0.5;
  const sz = clamp((0.75 + 0.6 * dy) * rand(0.92, 1.08), 0.7, 1.45); // deeper fish of the same kind are bigger; this is the size you will catch it at
  return { f, dy, x: initial ? rand(0, W) : (fromLeft ? -110 : W + 110), y: WATER_Y + 60 + dy * (span - 120), v: rand(14, 34) * (initial ? (Math.random() < 0.5 ? -1 : 1) : (fromLeft ? 1 : -1)), sz, boss: false, s: Math.min(280, f.len * sz), ph: rand(0, 6) };
}

// ---------- gems: a rarer currency you can also buy things with ----------
const gemPrice = (cat, t) => (t >= 7 ? Math.ceil((t - 6) * 1.75) : 0); // tier 7: 2 gems ... tier 24: 32 gems
function addGems(n, why) {
  if (n <= 0) return; state.gems = (state.gems || 0) + n; F().stats.gemsTotal += n;
  flyGems(n); toast(`+${n} GEM${n > 1 ? "S" : ""}${why ? "  (" + why + ")" : ""}`, "#8ff3ff"); Snd.chime(); save(); refreshModal();
}
function drawGemIcon(c, x, y, r) {
  c.save(); c.translate(x, y); c.lineJoin = "round"; ol(c, Math.max(2, r * 0.16));
  c.fillStyle = "#4fe0ff"; c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(-r * 0.55, -r * 0.9); c.lineTo(r * 0.55, -r * 0.9); c.lineTo(r, -r * 0.3); c.lineTo(0, r); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(-r * 0.55, -r * 0.9); c.lineTo(-r * 0.15, -r * 0.3); c.lineTo(-r * 0.75, -r * 0.3); c.closePath(); c.fill();
  c.fillStyle = "rgba(30,120,200,.35)"; c.beginPath(); c.moveTo(r * 0.55, -r * 0.9); c.lineTo(r * 0.15, -r * 0.3); c.lineTo(r, -r * 0.3); c.closePath(); c.fill();
  c.strokeStyle = "rgba(20,60,120,.4)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-r, -r * 0.3); c.lineTo(r, -r * 0.3); c.moveTo(-r * 0.15, -r * 0.3); c.lineTo(0, r); c.moveTo(r * 0.15, -r * 0.3); c.lineTo(0, r); c.stroke();
  c.restore();
}
