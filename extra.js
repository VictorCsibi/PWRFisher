"use strict";
// The second big bundle from IDEAS.md: flying rewards, fireworks, victory spins, jumping fisherman, tournament, crafting,
// skill tree, Legend mode, quest board, piggy bank, restaurant, boat, perfect reel, night fish, boss fish, map events,
// seasons, dive mini-game, weekly goals, charms, cosmetics, dock decor, photo, save codes, performance mode and more.
// Loaded before game.js (only defines things). Uses game globals at call time.

const X = () => { // everything new is saved inside state.fun.x
  const f = F(); if (!f.x) f.x = {};
  const d = { mats: { scrap: 0, scale: 0 }, pts: 0, ptsFish: 0, skill: {}, quest: 0, piggy: 0, boat: 0, charms: {}, own: {}, skin: "", hat: "", decor: {}, legendMode: false, week: "", weekly: [], diveAt: 0, tbest: 0, timers: { shiny: 0, deep: 0 } };
  for (const k of Object.keys(d)) if (f.x[k] === undefined) f.x[k] = d[k];
  return f.x;
};
const ex = { flyers: [], works: [], victory: null, jump: 0, sad: 0, miss: 0, rest: null, restClock: 240, boss: 0, bossClock: 420, ev: null, evClock: 200, tour: null, tens: null, reelHold: false, pullClock: 2, fog: 0, fogClock: 260, rainbow: 0, wasRain: false, chirp: 6, piggyFull: false, season: null, tick: 0 };
const NIGHT = new Set(["Glow Minnow", "Lanternfish", "Anglerfish", "Ghost Shark", "Ice Angler", "Ember Angler", "Void Angler", "Ghost Koi", "Moonfish"]);
const isNight = () => typeof phaseName === "function" && phaseName(g.tod) === "NIGHT";
const nightOK = f => !NIGHT.has(f.name) || isNight();

// ---------- skills ----------
const SKILLS = [
  { id: "reel", name: "Strong Arms", note: "+6% reel speed per level" },
  { id: "sell", name: "Haggler", note: "+3% sell value per level" },
  { id: "luck", name: "Lucky Streak", note: "+6% chance for rarer fish per level" },
  { id: "thrift", name: "Thrifty", note: "-15% re-string cost per level" },
  { id: "gems", name: "Gem Hunter", note: "+8% chance of a bonus gem from rare fish per level" },
];
const skillLv = id => X().skill[id] || 0;
const skillReel = () => 1 + 0.06 * skillLv("reel");
const skillSell = () => 1 + 0.03 * skillLv("sell");
const skillLuck = () => 1 + 0.06 * skillLv("luck");
const skillThrift = () => Math.max(0.25, 1 - 0.15 * skillLv("thrift"));

// ---------- boat ----------
const BOATS = [{ name: "No boat yet", cost: 0, gems: 0 }, { name: "Rowboat", cost: 6000, gems: 12 }, { name: "Motorboat", cost: 30000, gems: 25 }, { name: "Yacht", cost: 150000, gems: 40 }];
const boatLuck = () => 1 + 0.05 * X().boat;
const boatReel = () => 1 + 0.05 * X().boat;

// ---------- charms ----------
const CHARMS = [
  { id: "clover", name: "Lucky Clover", note: "+5% chance of rarer fish", luck: 1.05 },
  { id: "coin", name: "Old Coin", note: "+5% sell value", sell: 1.05 },
  { id: "shell", name: "Sea Shell", note: "line wears 10% slower", wear: 0.9 },
  { id: "feather", name: "Gull Feather", note: "fish bite 8% faster", bite: 1.08 },
  { id: "pearl", name: "Tiny Pearl", note: "+4% sell and +4% luck", sell: 1.04, luck: 1.04 },
  { id: "tooth", name: "Shark Tooth", note: "+8% sell value", sell: 1.08 },
];
const charmMul = k => CHARMS.reduce((m, c) => m * (X().charms[c.id] && c[k] ? c[k] : 1), 1);
function giveCharm(why) {
  const left = CHARMS.filter(c => !X().charms[c.id]); if (!left.length) return false;
  const c = left[Math.floor(Math.random() * left.length)]; X().charms[c.id] = 1; toast(`NEW CHARM: ${c.name}!  ${c.note}`, "#e3c8ff"); Snd.rewardReady(); save(); return true;
}

// ---------- Legend mode ----------
const lmOn = () => !!(F().stars >= 1 && X().legendMode);
const lmSell = () => (lmOn() ? 2 : 1), lmBite = () => (lmOn() ? 0.8 : 1), lmWear = () => (lmOn() ? 1.5 : 1), lmJunk = () => (lmOn() ? 0.1 : 0);

// ---------- everything that changes what a catch is worth (added to moreMult) ----------
function extraMult(f) {
  let m = skillSell() * charmMul("sell") * lmSell();
  if (ex.rest && ex.rest.names.includes(f.name)) m *= 2;
  if (g.boss) m *= 3;
  if (ex.season) m *= 1.05;
  if (ex.rainbow > 0) m *= 1.1;
  if (g.perfect && g.perfectReel) m *= 1.6; else if (g.perfectReel) m *= 1.25;
  return m;
}
const mysteryChance = () => 0.1 * (ex.fog > 0 ? 3 : 1);
const shinyChance = () => (X().timers.shiny > 0 ? 0.25 : 0.03);
const extraLuck = () => skillLuck() * boatLuck() * charmMul("luck") * (X().timers.deep > 0 ? 1.3 : 1) * (ex.ev && ex.ev.kind === "whale" ? 1.3 : 1);
const extraBite = () => charmMul("bite") * (ex.ev && ex.ev.kind === "birds" ? 1.3 : 1);
const extraWear = () => charmMul("wear") * lmWear();

// ---------- after a catch ----------
function extraAfterCatch(f, net) {
  const x = X(), n = g.multi || 1;
  if (f.junk) return;
  x.mats.scale += n * (1 + f.rarity);
  const first = state.caught[f.name] === n;
  if (first) ex.victory = { f, t: 0 };
  if (f.rarity >= 3 || g.legend) ex.jump = 0.001; // the fisherman jumps for joy
  fx.petHop = Math.max(fx.petHop, 0.5); // the pet reacts
  if (f.rarity >= 2 && Math.random() < 0.08 * skillLv("gems")) addGems(1, "gem hunter");
  if (g.boss) { addGems(2, "boss fish"); toast("BOSS FISH LANDED! x3 value", "#ff9a9a"); if (Math.random() < 0.5) giveCharm(); g.boss = false; ex.boss = 0; }
  if (f.rarity >= 3 && Math.random() < 0.05) giveCharm();
  g.perfectReel = false;
  // flying "+$"
  ex.flyers.push({ txt: "+" + fmt(net), x: W - BUCKET_X, y: DECK_Y - 60, tx: 70, ty: WATER_Y + 36 + 57, t: 0, col: "#ffd23f", size: 30 });
  // quests, tournament, weekly
  if (ex.tour) ex.tour.score += net;
  questCheck(); weeklyAdd("fish", n); if (f.rarity >= 1) weeklyAdd("unc", n); if (f.rarity >= 2) weeklyAdd("rare", n); weeklyAdd("earn", net);
}
function extraJunk() { X().mats.scrap += 1; if (Math.random() < 0.02) giveCharm(); ex.sad = 0.6; }
function extraMiss() { ex.miss = 0.7; }

// ---------- flying rewards + fireworks ----------
function flyGems(n) { for (let i = 0; i < Math.min(n, 6); i++) ex.flyers.push({ txt: "", gem: true, x: W / 2 + (i - 2) * 30, y: 210, tx: 50, ty: WATER_Y + 36 + 138, t: -i * 0.08, col: "#4fe0ff", size: 30 }); }
function fireworks() { for (let b = 0; b < 6; b++) { const cx = rand(200, W - 200), cy = rand(60, WATER_Y - 40), col = ["#ffd23f", "#ff5fa2", "#4d9dff", "#4fd66b", "#fff"][b % 5], delay = b * 0.25; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, s = rand(80, 200); ex.works.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.2, t: -delay, col }); } } }

// ---------- quests ----------
const speciesCount = () => FISH.filter(f => state.caught[f.name] > 0).length;
const QUESTS = [
  { who: "Marina the baker", text: "I need fish for my pies! Catch 8 fish.", need: 8, val: () => state.total, money: 150, gems: 0 },
  { who: "Captain Finn", text: "Bring me something rare, sailor: catch a Rare fish or better.", need: 1, val: () => rarityCount(2), money: 500, gems: 0 },
  { who: "Marina the baker", text: "The pie shop is booming! Catch 25 fish.", need: 25, val: () => state.total, money: 400, gems: 0 },
  { who: "Doc Barnacle", text: "I study fish. Find 10 different kinds.", need: 10, val: speciesCount, money: 800, gems: 0 },
  { who: "Captain Finn", text: "The harbour needs coin. Earn $5,000 from fish.", need: 5000, val: () => state.stats.earned || 0, money: 1500, gems: 0 },
  { who: "Little Lily", text: "Can you catch 6 fish in a row without junk? A combo of 6!", need: 6, val: () => F().stats.bestCombo, money: 1000, gems: 0 },
  { who: "Marina the baker", text: "A whole fish feast! Catch 100 fish.", need: 100, val: () => state.total, money: 2500, gems: 1 },
  { who: "Captain Finn", text: "Only the best angler can do this: 5 Epic fish or better.", need: 5, val: () => rarityCount(3), money: 6000, gems: 2 },
  { who: "Little Lily", text: "I heard a legend lives in the deep. Land a legendary fish!", need: 1, val: () => F().stats.legends, money: 10000, gems: 3 },
  { who: "The whole town", text: "You are our hero! Fill 40 kinds in your Fish Book.", need: 40, val: speciesCount, money: 20000, gems: 4 },
];
function questCheck() {
  const x = X(), q = QUESTS[x.quest]; if (!q) return;
  if (q.val() >= q.need) {
    state.money += q.money; toast(`QUEST DONE for ${q.who}!  +${fmt(q.money)}`, "#ffe066"); if (q.gems) addGems(q.gems, "quest"); Snd.rewardReady(); x.quest++; save();
    const nq = QUESTS[x.quest]; if (nq) toast(`New quest from ${nq.who}: see the Boosts page`, "#bfe3ff");
  }
}

// ---------- weekly goals ----------
const weekKey = () => { const d = new Date(), t = new Date(d.getFullYear(), 0, 1); return d.getFullYear() + "-W" + Math.ceil(((d - t) / 86400000 + t.getDay() + 1) / 7); };
const WEEK_TYPES = [
  { t: "fish", txt: n => `Catch ${n} fish this week`, need: r => 80 + Math.floor(r() * 60) },
  { t: "unc", txt: n => `Catch ${n} Uncommon-or-better fish`, need: r => 25 + Math.floor(r() * 15) },
  { t: "rare", txt: n => `Catch ${n} Rare-or-better fish`, need: r => 8 + Math.floor(r() * 6) },
  { t: "earn", txt: n => `Earn ${fmt(n)} from fish this week`, need: () => Math.max(3000, Math.round(state.money * 0.4 / 500) * 500) },
];
function weeklyCheck() {
  const x = X(), wk = weekKey(); if (x.week === wk) return;
  const r = dailyRng("week" + wk), pool = WEEK_TYPES.slice(); x.weekly = [];
  while (x.weekly.length < 3) { const d = pool.splice(Math.floor(r() * pool.length), 1)[0]; x.weekly.push({ t: d.t, need: d.need(r), p: 0, done: false, gems: 1 + (x.weekly.length ? 1 : 0), money: Math.max(1000, Math.round(state.money * 0.1 / 100) * 100) }); }
  x.week = wk; save();
}
function weeklyAdd(t, n) {
  for (const w of X().weekly) { if (w.t !== t || w.done) continue; w.p += n; if (w.p >= w.need) { w.p = w.need; w.done = true; state.money += w.money; toast(`WEEKLY GOAL DONE!  +${fmt(w.money)}`, "#ffe066"); addGems(w.gems, "weekly goal"); save(); } }
}
const weeklyTxt = w => WEEK_TYPES.find(d => d.t === w.t).txt(w.need);

// ---------- crafting ----------
const RECIPES = [
  { id: "sweet", name: "Sweet Bait", note: "fish bite much faster for 90 seconds", scrap: 8, scale: 0, run: () => { fx.boost.frenzy += 90; } },
  { id: "shiny", name: "Shiny Lure", note: "shiny fish are 8x more likely for 90 seconds", scrap: 4, scale: 6, run: () => { X().timers.shiny += 90; } },
  { id: "deep", name: "Deep Lure", note: "rarer fish for 90 seconds", scrap: 0, scale: 12, run: () => { X().timers.deep += 90; } },
];

// ---------- per frame ----------
function extraUpdate(dt) {
  const x = X();
  const inHot = !!(g.hot || (mx.hot && g.land && Math.abs(g.land.x - mx.hot.x) < 130)); // reeling in a hot spot: no line-tension game
  weeklyCheck();
  x.timers.shiny = Math.max(0, x.timers.shiny - dt); x.timers.deep = Math.max(0, x.timers.deep - dt);
  const fishPts = Math.floor((state.total || 0) / 100); if (fishPts > x.ptsFish) { x.pts += fishPts - x.ptsFish; x.ptsFish = fishPts; toast("SKILL POINT earned! Spend it in the Boosts page", "#e3c8ff"); }
  if (!ex.season) { const m = new Date().getMonth(); ex.season = m >= 11 || m <= 1 ? { kind: "snow", name: "Winter" } : m <= 4 ? { kind: "petals", name: "Spring" } : m <= 7 ? { kind: "sparks", name: "Summer" } : { kind: "leaves", name: "Autumn" }; toast(`${ex.season.name.toUpperCase()} SEASON: fish sell +5%`, "#bfe3ff"); }
  // piggy bank: fills while you play
  const avg = (tier("rod") + tier("line") + tier("bait")) / 3, cap = 600 + 200 * avg; x.piggy = Math.min(cap, x.piggy + dt * 0.05 * avg * 3);
  if (x.piggy >= cap && !ex.piggyFull) { ex.piggyFull = true; toast("Your piggy bank is full!", "#ffe066"); } else if (x.piggy < cap * 0.9) ex.piggyFull = false;
  // restaurant
  if (ex.rest) { ex.rest.left -= dt; if (ex.rest.left <= 0) ex.rest = null; } else { ex.restClock -= dt; if (ex.restClock <= 0) { ex.restClock = rand(360, 480); const pool = FISH.filter(f => f.maps.includes(state.map) && f.rarity <= 2); if (pool.length >= 2) { const a = pool[Math.floor(Math.random() * pool.length)], b = pool[Math.floor(Math.random() * pool.length)]; ex.rest = { names: [a.name, b.name], left: 300 }; toast(`THE RESTAURANT WANTS ${a.name.toUpperCase()} AND ${b.name.toUpperCase()}: sell for x2!`, "#ffd0a0"); Snd.rewardReady(); } } }
  // boss fish
  if (onE()) { ex.bossClock -= dt; if (ex.bossClock <= 0 && g.wanderers) { ex.bossClock = rand(540, 720); spawnBoss(); } }
  // map events (whale / diving birds)
  if (ex.ev) { ex.ev.left -= dt; if (ex.ev.left <= 0) ex.ev = null; } else if (onE()) { ex.evClock -= dt; if (ex.evClock <= 0) { ex.evClock = rand(200, 300); ex.ev = Math.random() < 0.5 ? { kind: "whale", left: 30, x: 0 } : { kind: "birds", left: 30, x: 0 }; toast(ex.ev.kind === "whale" ? "A WHALE SWIMS BY! Rarer fish come out" : "BIRDS ARE DIVING! Fish bite faster", "#bfe3ff"); Snd.chime(); } }
  // tournament
  if (ex.tour) { ex.tour.left -= dt; for (const r of ex.tour.rivals) r.score += r.rate * dt * (0.6 + Math.random() * 0.8); if (ex.tour.left <= 0) endTournament(); }
  // timers for the little effects
  if (ex.jump > 0) ex.jump += dt * 1.6; if (ex.jump > 1) ex.jump = 0;
  ex.sad = Math.max(0, ex.sad - dt); ex.miss = Math.max(0, ex.miss - dt);
  if (ex.victory) { ex.victory.t += dt; if (ex.victory.t > 1.6) ex.victory = null; }
  for (const f of ex.flyers) f.t += dt * 1.2; ex.flyers = ex.flyers.filter(f => f.t < 1);
  for (const p of ex.works) { p.t += dt; if (p.t > 0) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; } } ex.works = ex.works.filter(p => p.t < p.life);
  // the music follows the map and gets a driving beat in fights and big combos
  if (ex.trackMap !== state.map) { ex.trackMap = state.map; Snd.setMap(state.map); }
  { const want = g.mode === "fight" || fx.combo >= 5 ? 1 : 0; ex.inten = (ex.inten || 0) + (want - (ex.inten || 0)) * Math.min(1, dt * 0.8); Snd.setIntensity(ex.inten > 0.05 ? ex.inten : 0); }
  // birds chirp, quests are checked
  ex.chirp -= dt; if (ex.chirp <= 0) { ex.chirp = rand(5, 12); if (settings.ambient && ["bay", "lake", "forest", "blossom", "oasis"].includes(state.map) && Snd.chirp) Snd.chirp(); }
  ex.tick -= dt; if (ex.tick <= 0) { ex.tick = 1; questCheck(); }
  // money rolling sound
  if (g.moneyShown != null && Math.abs(state.money - g.moneyShown) > 8 && Snd.tick && (ex.tickSnd = (ex.tickSnd || 0) - dt) <= 0) { ex.tickSnd = 0.07; Snd.tick(); }
  // weather: fog rolls in now and then (more mystery bites), and a rainbow shows after the rain
  if (ex.fog > 0) { ex.fog -= dt; if (ex.fog <= 0) toast("The fog lifts.", "#e8f0ff"); } else if (onE()) { ex.fogClock -= dt; if (ex.fogClock <= 0) { ex.fogClock = rand(300, 480); ex.fog = 60; toast("FOG rolls in... mystery bites are 3x more likely", "#e8f0ff"); } }
  if (g.raining) ex.wasRain = true; else if (ex.wasRain) { ex.wasRain = false; if (g.rain < 0.6 && onE()) { ex.rainbow = 45; toast("A RAINBOW! Fish sell +10% while it lasts", "#ffe066"); } }
  ex.rainbow = Math.max(0, ex.rainbow - dt);
  // line tension (manual mode): a heavy fish pulls, hold to reel and let go when the line gets tight
  { const heavy = settings.manual && !inHot && g.mode === "reel" && g.fish && !g.fish.junk && g.fish.size >= 5; // no tension game for a hot-spot catch
    if (heavy) {
      const T = ex.tens = ex.tens || { v: 0.25, pull: 0 };
      ex.pullClock -= dt; if (ex.pullClock <= 0) { ex.pullClock = rand(1.4, 2.8); T.pull = 0.8; }
      T.pull = Math.max(0, T.pull - dt);
      T.v = clamp(T.v + dt * ((ex.reelHold ? 0.32 : -0.3) + (T.pull > 0 ? 0.5 : 0)), 0, 1.05);
      if (!ex.reelHold) g.timer -= dt * 1.3; // no reeling while you are not holding
      if (T.pull > 0) g.timer -= dt * 0.6; // the fish drags the line back
      g.timer = Math.max(0, g.timer);
      if (T.v >= 1) { ex.tens = null; toast("THE LINE SNAPPED under the strain!", "#ff9a9a"); checkSnap(true); }
    } else ex.tens = null;
  }
  // a "perfect reel" now just happens now and then on a manual reel (no bar to hit)
  if (g.mode === "reel") { if (!ex.reelRolled) { ex.reelRolled = true; if (settings.manual && g.fish && !g.fish.junk && Math.random() < 0.12) { g.perfectReel = true; toast("PERFECT REEL!  +25% value", "#ffe066"); Snd.chime(); } } } else ex.reelRolled = false;
}
function extraReelClick() {} // (the green timing bar is gone)
function spawnBoss() {
  const pool = FISH.filter(f => f.maps.includes(state.map) && f.size <= tier("line") + 1).sort((a, b) => b.value - a.value); if (!pool.length) return;
  const f = pool[0], w = makeWanderer(false); w.f = f; w.sz = 1.35; w.s = Math.min(300, f.len * 1.35); w.dy = clamp(f.minDist + 0.1, 0.05, 0.95); w.y = WATER_Y + 60 + w.dy * (H - 36 - WATER_Y - 120); w.boss = true; w.x = W - 20 - Math.random() * 100; w.v = -25;
  g.wanderers.push(w); toast(`A BOSS FISH APPEARED: ${f.name.toUpperCase()}!  Catch it for x3 and gems`, "#ff9a9a"); Snd.rewardReady();
}

// ---------- tournament (optional, from the Boosts page) ----------
const RIVAL_NAMES = ["Captain Red", "Big Bertha", "Old Pete", "Skipper Sue", "Mad Mike"];
function startTournament() {
  const base = Math.max(300, (state.stats.earned || 0) / Math.max(1, (X().timers ? F().stats.time : 1)) * 1.2); // about how much you earn per second
  ex.tour = { left: 180, score: 0, rivals: RIVAL_NAMES.map((n, i) => ({ name: n, score: 0, rate: base * (0.7 + i * 0.12) })) }; toast("TOURNAMENT! Earn the most in 3 minutes", "#ffe066"); Snd.rewardReady();
}
function endTournament() {
  const t = ex.tour; ex.tour = null; const board = [{ name: "YOU", score: t.score }, ...t.rivals].sort((a, b) => b.score - a.score), place = board.findIndex(b => b.name === "YOU") + 1;
  const rw = Math.round(Math.max(500, state.money * 0.08) * (7 - place) / 6 / 10) * 10; state.money += rw;
  toast(`TOURNAMENT OVER: you came ${place}${["st", "nd", "rd"][place - 1] || "th"}!  +${fmt(rw)}`, "#ffe066"); if (place === 1) addGems(5, "tournament win"); else if (place === 2) addGems(3, "tournament"); else if (place === 3) addGems(1, "tournament");
  if (t.score > X().tbest) X().tbest = Math.round(t.score); Snd.rankUp(); save();
}

// ---------- cosmetics ----------
const SKINS = [{ id: "", name: "Classic", gems: 0, f: "" }, { id: "gold", name: "Golden", gems: 4, f: "sepia(1) saturate(4) hue-rotate(-10deg) brightness(1.15)" }, { id: "ice", name: "Frosty", gems: 4, f: "hue-rotate(150deg) saturate(1.4) brightness(1.1)" }, { id: "fire", name: "Fiery", gems: 5, f: "hue-rotate(-40deg) saturate(2.4)" }, { id: "neon", name: "Neon", gems: 6, f: "hue-rotate(110deg) saturate(3) brightness(1.2)" }];
const HATS = [
  { id: "", name: "No hat", gems: 0 }, { id: "party", name: "Party hat", free: () => F().stats.triples >= 1, why: "Land a triple catch" }, { id: "crown", name: "Crown", free: () => F().stars >= 1, why: "Do a Legend reset" },
  { id: "cap", name: "Fisher cap", free: () => (state.total || 0) >= 100, why: "Catch 100 fish" }, { id: "wizard", name: "Wizard hat", gems: 5 }, { id: "halo", name: "Halo", gems: 8 },
];
const DECOR = [{ id: "flag", name: "Flag", gems: 2 }, { id: "pots", name: "Flower pots", gems: 3 }, { id: "rug", name: "Rug", gems: 3 }, { id: "sign", name: "Sign", gems: 2 }, { id: "glow", name: "Glow lanterns", gems: 5 }];
const hatOwned = h => !h.id || (h.free ? h.free() : !!X().own["hat_" + h.id]);
const rodSkinFilter = () => (SKINS.find(s => s.id === X().skin) || SKINS[0]).f;
function drawCosHat(c, x, y) { // above the head
  const h = X().hat; if (!h) return; c.save(); c.translate(x, y); c.lineJoin = "round"; c.lineWidth = 3; c.strokeStyle = INK;
  if (h === "party") { c.fillStyle = "#ff5fa2"; c.beginPath(); c.moveTo(-11, 0); c.lineTo(0, -30); c.lineTo(11, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(0, -31, 4, 0, 7); c.fill(); c.stroke(); }
  if (h === "crown") { c.fillStyle = "#ffd23f"; c.beginPath(); c.moveTo(-13, 2); c.lineTo(-15, -18); c.lineTo(-6, -8); c.lineTo(0, -22); c.lineTo(6, -8); c.lineTo(15, -18); c.lineTo(13, 2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ff5a5f"; c.beginPath(); c.arc(0, -6, 3, 0, 7); c.fill(); }
  if (h === "cap") { c.fillStyle = "#2b6ad8"; c.beginPath(); c.arc(0, 0, 13, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.fillRect(-2, -1, 20, 5); c.strokeRect(-2, -1, 20, 5); }
  if (h === "wizard") { c.fillStyle = "#5a3ad8"; c.beginPath(); c.moveTo(-14, 2); c.lineTo(2, -38); c.lineTo(15, 2); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#ffd23f"; c.beginPath(); c.arc(2, -16, 3, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 2, 20, 4, 0, 0, 7); c.fillStyle = "#4a2ab8"; c.fill(); c.stroke(); }
  if (h === "halo") { c.strokeStyle = "#ffe066"; c.lineWidth = 5; c.shadowColor = "#ffe066"; c.shadowBlur = 10; c.beginPath(); c.ellipse(0, -10, 14, 5, 0, 0, 7); c.stroke(); }
  c.restore();
}
function extraDrawDock() { // dock decorations, in scene space (dock on the left, mirrored later)
  const d = X().decor, c = ctx; c.save(); ol(c, 3);
  if (d.rug) { c.fillStyle = "#c8321a"; c.fillRect(70, DECK_Y - 4, 90, 5); c.strokeRect(70, DECK_Y - 4, 90, 5); c.fillStyle = "#ffd23f"; c.fillRect(74, DECK_Y - 3, 82, 2); }
  if (d.flag) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(20, DECK_Y); c.lineTo(20, DECK_Y - 90); c.stroke(); c.fillStyle = "#ff5a5f"; c.beginPath(); const w = Math.sin(g.t * 3) * 4; c.moveTo(20, DECK_Y - 90); c.quadraticCurveTo(42, DECK_Y - 92 + w, 60, DECK_Y - 84); c.quadraticCurveTo(42, DECK_Y - 76 - w, 20, DECK_Y - 72); c.closePath(); c.fill(); ol(c, 3); c.stroke(); }
  if (d.pots) { for (const x of [232, 300]) { c.fillStyle = "#b5773a"; c.beginPath(); c.moveTo(x - 8, DECK_Y - 14); c.lineTo(x + 8, DECK_Y - 14); c.lineTo(x + 6, DECK_Y); c.lineTo(x - 6, DECK_Y); c.closePath(); c.fill(); c.stroke(); for (const [dx, col] of [[-5, "#ff8fb1"], [0, "#ffd23f"], [5, "#ff5a5f"]]) { c.fillStyle = col; c.beginPath(); c.arc(x + dx, DECK_Y - 20 - Math.abs(dx), 4, 0, 7); c.fill(); c.stroke(); } } }
  if (d.sign) { c.fillStyle = "#a06a34"; c.fillRect(102, DECK_Y - 40, 4, 40); c.fillRect(70, DECK_Y - 62, 68, 26); c.strokeRect(70, DECK_Y - 62, 68, 26); c.fillStyle = "#fff"; c.font = "16px Bangers, Impact, sans-serif"; c.save(); c.translate(104, DECK_Y - 42); c.scale(-1, 1); c.textAlign = "center"; c.fillText("FISH!", 0, 0); c.restore(); }
  if (d.glow) { for (const x of [50, 350]) { const gl = c.createRadialGradient(x, DECK_Y - 14, 2, x, DECK_Y - 14, 34 + Math.sin(g.t * 3 + x) * 4); gl.addColorStop(0, "rgba(255,225,120,.8)"); gl.addColorStop(1, "rgba(255,200,80,0)"); c.fillStyle = gl; c.beginPath(); c.arc(x, DECK_Y - 14, 40, 0, 7); c.fill(); c.fillStyle = "#ffe066"; c.beginPath(); c.arc(x, DECK_Y - 14, 6, 0, 7); c.fill(); c.stroke(); } }
  c.restore();
}
const extraJumpY = () => (ex.jump > 0 ? Math.sin(Math.min(1, ex.jump) * Math.PI) * 34 : 0);
const extraShakeX = () => (ex.sad > 0 ? Math.sin(g.t * 40) * 4 * ex.sad : 0);

// ---------- drawing on screen ----------
function extraDrawWorld() {
  const c = ctx;
  if (onE() && isNight() && ["arctic", "forest", "sky"].includes(state.map)) { // northern lights
    c.save(); c.globalCompositeOperation = "lighter"; for (let b = 0; b < 4; b++) { const col = ["rgba(80,255,170,.22)", "rgba(80,200,255,.18)", "rgba(180,110,255,.16)", "rgba(80,255,200,.14)"][b]; c.fillStyle = col; c.beginPath(); c.moveTo(0, 30 + b * 22); for (let x = 0; x <= W; x += 30) c.lineTo(x, 50 + b * 22 + Math.sin(x * 0.006 + g.t * 0.5 + b) * 26 + Math.sin(x * 0.015 + g.t * 0.8) * 8); for (let x = W; x >= 0; x -= 30) c.lineTo(x, 110 + b * 22 + Math.sin(x * 0.005 + g.t * 0.4 + b * 2) * 30); c.closePath(); c.fill(); } c.restore();
  }
  if (ex.rainbow > 0) { c.save(); c.globalAlpha = Math.min(0.6, ex.rainbow / 5 * 0.6); ["#ff5a5f", "#ffb84d", "#ffe066", "#4fd66b", "#4d9dff", "#b45cff"].forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 12; c.beginPath(); c.arc(W * 0.42, WATER_Y + 60, 340 - i * 12, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }); c.restore(); }
  if (ex.fog > 0) { const a = Math.min(0.55, ex.fog / 6 * 0.55), gr = c.createLinearGradient(0, WATER_Y - 140, 0, WATER_Y + 220); gr.addColorStop(0, "rgba(235,242,255,0)"); gr.addColorStop(0.45, `rgba(235,242,255,${a})`); gr.addColorStop(1, "rgba(235,242,255,0)"); c.fillStyle = gr; c.fillRect(0, WATER_Y - 140, W, 360); }
  if (ex.season) { c.save(); for (let i = 0; i < 26; i++) { const k = ex.season.kind, sp = 20 + (i % 5) * 9, x = ((i * 97 + g.t * (k === "snow" ? 8 : 24) * (i % 2 ? 1 : -1) + Math.sin(g.t + i) * 20) % W + W) % W, y = ((i * 53 + g.t * sp) % (WATER_Y + 20)); c.globalAlpha = 0.65; if (k === "snow") { c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); } else if (k === "leaves") { c.fillStyle = ["#e08a2a", "#c8501a", "#d9a020"][i % 3]; c.save(); c.translate(x, y); c.rotate(g.t + i); c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, 7); c.fill(); c.restore(); } else if (k === "petals") { c.fillStyle = "#ffb3d3"; c.save(); c.translate(x, y); c.rotate(g.t + i); c.beginPath(); c.ellipse(0, 0, 4, 2.4, 0, 0, 7); c.fill(); c.restore(); } else { c.fillStyle = "#fff8b0"; c.globalAlpha = 0.5 + 0.5 * Math.sin(g.t * 3 + i); c.beginPath(); c.arc(x, y * 0.8, 1.8, 0, 7); c.fill(); } } c.restore(); }
  if (ex.ev && ex.ev.kind === "whale") { const p = 1 - ex.ev.left / 30, x = W + 200 - p * (W + 500), y = WATER_Y + 200; c.save(); c.globalAlpha = 0.45; drawFish(c, x, y, fishByName("Giant Whale"), 420, -1, {}); c.restore(); }
  if (ex.ev && ex.ev.kind === "birds") { c.save(); c.strokeStyle = "rgba(40,50,80,.85)"; c.lineWidth = 3; c.lineCap = "round"; for (let i = 0; i < 6; i++) { const p = (g.t * 0.5 + i * 0.17) % 1, x = W * (0.3 + 0.1 * i) + Math.sin(p * 6 + i) * 30, y = 40 + Math.abs(Math.sin(p * Math.PI)) * (WATER_Y - 30), f = Math.sin(g.t * 12 + i) * 5; c.beginPath(); c.moveTo(x - 12, y + f); c.quadraticCurveTo(x - 4, y - 6, x, y); c.quadraticCurveTo(x + 4, y - 6, x + 12, y + f); c.stroke(); } c.restore(); }
  if (g.wanderers && onE()) for (const w of g.wanderers) if (w.boss) { const sx = W - w.x, sy = w.y + Math.sin(g.t * 0.8 + w.ph) * 6; c.save(); c.strokeStyle = `rgba(255,80,80,${0.5 + 0.4 * Math.sin(g.t * 5)})`; c.lineWidth = 5; c.beginPath(); c.ellipse(sx, sy, w.s * 0.65, w.s * 0.4, 0, 0, 7); c.stroke(); c.restore(); }
  if (ex.victory) { const v = ex.victory, k = v.t / 1.6; c.save(); c.globalAlpha = Math.min(1, (1 - k) * 2); c.translate(W - BUCKET_X - 30, DECK_Y - 150 - k * 60); c.rotate(k * Math.PI * 4); const s = Math.min(1, 90 / v.f.len) * (1 + Math.sin(k * Math.PI) * 0.6); c.scale(s, s); drawFish(c, 0, 0, v.f, v.f.len, 1, {}); c.restore(); }
  for (const p of ex.works) if (p.t > 0) { c.save(); c.globalAlpha = Math.max(0, 1 - p.t / p.life); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, 3.5, 0, 7); c.fill(); c.restore(); }
  if (ex.miss > 0) { c.save(); const gr = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); gr.addColorStop(0, "rgba(255,0,0,0)"); gr.addColorStop(1, "rgba(255,40,40,.5)"); c.globalAlpha = ex.miss / 0.7; c.fillStyle = gr; c.fillRect(0, 0, W, H); c.restore(); }
}
function extraDrawHUD() {
  const c = ctx;
  if (ex.tens) { const T = ex.tens, bx = W / 2 - 170, by = 176; c.save(); c.fillStyle = "rgba(255,255,255,.92)"; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.roundRect(bx, by, 340, 34, 12); c.fill(); c.stroke(); c.fillStyle = T.v > 0.8 ? "#ff3b3b" : T.v > 0.55 ? "#ffd23f" : "#4fd66b"; c.beginPath(); c.roundRect(bx + 3, by + 3, Math.max(8, 334 * Math.min(1, T.v)), 28, 9); c.fill(); c.fillStyle = INK; c.font = "20px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("LINE TENSION", W / 2, by + 18); c.lineWidth = 6; c.strokeStyle = INK; c.fillStyle = T.pull > 0 ? "#ff9a9a" : "#fff"; c.textBaseline = "alphabetic"; c.strokeText(T.pull > 0 ? "IT PULLS! LET GO!" : "HOLD to reel - let go when the line is tight", W / 2, by - 8); c.fillText(T.pull > 0 ? "IT PULLS! LET GO!" : "HOLD to reel - let go when the line is tight", W / 2, by - 8); c.restore(); }
  for (const f of ex.flyers) { if (f.t < 0) continue; const k = f.t, e = k * k * (3 - 2 * k), x = lerp(f.x, f.tx, e), y = lerp(f.y, f.ty, e) - Math.sin(k * Math.PI) * 60; c.save(); c.globalAlpha = 1 - Math.max(0, k - 0.8) * 5; if (f.gem) drawGemIcon(c, x, y, 14); else { c.font = f.size + "px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.lineWidth = 6; c.strokeStyle = INK; c.fillStyle = f.col; c.strokeText(f.txt, x, y); c.fillText(f.txt, x, y); } c.restore(); }
  if (ex.tour) { const t = ex.tour, board = [{ name: "YOU", score: t.score }, ...t.rivals].sort((a, b) => b.score - a.score), place = board.findIndex(b => b.name === "YOU") + 1, txt = `TOURNAMENT ${Math.floor(t.left / 60)}:${String(Math.floor(t.left % 60)).padStart(2, "0")}   YOU ${fmt(t.score)}  (${place}/6)   LEADER ${board[0].name} ${fmt(board[0].score)}`; c.save(); c.font = "24px Bangers, Impact, sans-serif"; const w = c.measureText(txt).width + 30; c.fillStyle = "rgba(255,240,180,.95)"; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.roundRect(W / 2 - w / 2, 66, w, 38, 12); c.fill(); c.stroke(); c.fillStyle = INK; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, W / 2, 86); c.restore(); }
}

// ---------- the Boosts page: everything new ----------
function renderExtraFun(section, row, btn) {
  const x = X(), f = F();
  const pg = section("Piggy bank"), avg = (tier("rod") + tier("line") + tier("bait")) / 3, cap = Math.round(600 + 200 * avg);
  { const r = row(pg, `Piggy bank: ${fmt(Math.floor(x.piggy))} / ${fmt(cap)}`, "It fills while you fish. Break it open to take the money."); btn(r, "BREAK OPEN", () => { const a = Math.floor(x.piggy); state.money += a; x.piggy = 0; toast("The piggy bank gave " + fmt(a), "#ffe066"); Snd.coin(); save(); }, x.piggy < 20); }
  const q = QUESTS[x.quest], qs = section("Quest board");
  if (q) row(qs, `${q.who}`, `${q.text}  (${Math.min(q.val(), q.need)} / ${q.need})   Reward: ${fmt(q.money)}${q.gems ? " + ◆ " + q.gems : ""}`); else row(qs, "All quests done!", "The whole town thanks you.");
  const wk = section("Weekly goals"); for (const w of x.weekly) row(wk, weeklyTxt(w), w.done ? "DONE!" : `${Math.min(w.p, w.need)} / ${w.need}   Reward: ${fmt(w.money)} + ◆ ${w.gems}`);
  const cr = section("Crafting"); row(cr, `Materials: ${x.mats.scrap} scrap (from junk), ${x.mats.scale} scales (from fish)`, "Craft special baits that last 90 seconds");
  for (const rc of RECIPES) { const r = row(cr, rc.name, `${rc.note}. Needs ${rc.scrap ? rc.scrap + " scrap " : ""}${rc.scale ? rc.scale + " scales" : ""}`); btn(r, "CRAFT", () => { x.mats.scrap -= rc.scrap; x.mats.scale -= rc.scale; rc.run(); toast(rc.name + " is active!", "#d8ffb8"); Snd.chime(); save(); }, x.mats.scrap < rc.scrap || x.mats.scale < rc.scale); }
  const sk = section(`Skills  (${x.pts} point${x.pts === 1 ? "" : "s"}: 1 per rank and per 100 fish)`);
  for (const s of SKILLS) { const r = row(sk, `${s.name}  (level ${skillLv(s.id)} / 5)`, s.note); btn(r, "UPGRADE", () => { x.pts--; x.skill[s.id] = skillLv(s.id) + 1; Snd.buy(); save(); }, x.pts < 1 || skillLv(s.id) >= 5); }
  const bt = section("Your boat"), nb = BOATS[x.boat + 1];
  row(bt, BOATS[x.boat].name, `Each boat level: +5% chance of rarer fish and +5% reel speed`);
  if (nb) { const r = row(bt, "Next: " + nb.name, `${fmt(nb.cost)} or ◆ ${nb.gems}`); btn(r, "BUY " + fmt(nb.cost), () => { state.money -= nb.cost; x.boat++; Snd.buy(); save(); }, state.money < nb.cost); btn(r, "◆ " + nb.gems, () => { state.gems -= nb.gems; x.boat++; Snd.buy(); save(); }, (state.gems || 0) < nb.gems); }
  const ch = section("Charms"); row(ch, `${CHARMS.filter(c => x.charms[c.id]).length} / ${CHARMS.length} found`, "Found in chests, junk, epic fish and boss fish");
  for (const c of CHARMS) if (x.charms[c.id]) row(ch, c.name, c.note);
  const wd = section("Wardrobe and dock (cosmetics)");
  { const r = row(wd, "Rod skin: " + (SKINS.find(s => s.id === x.skin) || SKINS[0]).name, "Change how your rod looks"); for (const s of SKINS) { const own = !s.id || x.own["skin_" + s.id]; if (own) btn(r, s.name, () => { x.skin = s.id; save(); }, x.skin === s.id); else btn(r, s.name + " ◆" + s.gems, () => { x.own["skin_" + s.id] = 1; x.skin = s.id; state.gems -= s.gems; Snd.buy(); save(); }, (state.gems || 0) < s.gems); } }
  { const r = row(wd, "Hat: " + (HATS.find(h => h.id === x.hat) || HATS[0]).name, "Some hats are unlocked by achievements"); for (const h of HATS) { if (hatOwned(h)) btn(r, h.name, () => { x.hat = h.id; save(); }, x.hat === h.id); else if (h.gems) btn(r, h.name + " ◆" + h.gems, () => { x.own["hat_" + h.id] = 1; x.hat = h.id; state.gems -= h.gems; Snd.buy(); save(); }, (state.gems || 0) < h.gems); else row(wd, h.name + " (locked)", h.why); } }
  { const r = row(wd, "Dock decorations", "Buy with gems and they appear on your dock"); for (const d of DECOR) { if (x.decor[d.id]) btn(r, d.name + " (on)", () => { x.decor[d.id] = 0; x.own["decor_" + d.id] = 1; save(); }, false); else if (x.own["decor_" + d.id]) btn(r, d.name, () => { x.decor[d.id] = 1; save(); }, false); else btn(r, d.name + " ◆" + d.gems, () => { x.own["decor_" + d.id] = 1; x.decor[d.id] = 1; state.gems -= d.gems; Snd.buy(); save(); }, (state.gems || 0) < d.gems); } }
  const ac = section("Activities");
  { const r = row(ac, "Tournament", ex.tour ? "A tournament is running!" : `Earn the most in 3 minutes against 5 anglers. Your best: ${fmt(x.tbest)}`); btn(r, "START", () => { startTournament(); closeModal(); }, !!ex.tour); }
  { const wait = Math.max(0, x.diveAt + 600000 - Date.now()); const r = row(ac, "Dive!", wait > 0 ? `Come back in ${Math.ceil(wait / 60000)} min` : "30 seconds underwater: click the shells and pearls"); btn(r, "DIVE", () => { closeModal(); startDive(); }, wait > 0); }
  if (f.stars >= 1) { const r = row(ac, "Legend mode", "For Legend players: fish sell x2, but bites are slower, lines wear faster and there is more junk"); btn(r, x.legendMode ? "ON" : "OFF", () => { x.legendMode = !x.legendMode; save(); }); }
  { const r = row(ac, "Photo", "Save a picture of the game (also press C)"); btn(r, "TAKE PHOTO", () => takePhoto()); }
  if (f.stats.bestCatchFish) { const r = row(ac, "Share your best catch", `A nice card for your ${f.stats.bestCatchFish} (worth ${fmt(f.stats.bestCatch)}). You can also share any fish from the Fish Book.`); btn(r, "SHARE", () => shareCard(f.stats.bestCatchFish)); }
  if (ex.rest) row(ac, "Restaurant is buying", `${ex.rest.names.join(" and ")} sell for x2 for ${Math.ceil(ex.rest.left / 60)} more min`);
}

// ---------- dive mini-game ----------
function startDive() {
  const x = X(); x.diveAt = Date.now(); save();
  const el = document.createElement("div"); el.className = "overlay"; el.style.zIndex = 24; el.innerHTML = '<div class="lcard" style="width:44em"><h3>DIVE! click the shells and pearls</h3><canvas id="diveCv" width="640" height="340" style="border-radius:.6em;background:#0d4a8a"></canvas><p id="diveTxt"></p></div>';
  document.getElementById("stage").appendChild(el); const cv = el.querySelector("#diveCv"), c = cv.getContext("2d");
  const items = []; let left = 30, got = 0, pearls = 0, last = performance.now(), spawn = 0;
  cv.onpointerdown = e => { const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * 640, py = (e.clientY - r.top) / r.height * 340; for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; if (Math.hypot(px - it.x, py - it.y) < it.r + 10) { items.splice(i, 1); if (it.pearl) { pearls++; Snd.chime(); } else { got++; Snd.coin(); } break; } } };
  const step = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; left -= dt; spawn -= dt;
    if (spawn <= 0) { spawn = 0.35; items.push({ x: rand(30, 610), y: 350, vy: -rand(50, 110), r: 16, pearl: Math.random() < 0.12, ph: rand(0, 6) }); }
    for (const it of items) { it.y += it.vy * dt; it.x += Math.sin(now / 500 + it.ph) * 0.4; } while (items.length && items[0].y < -30) items.shift();
    c.clearRect(0, 0, 640, 340); const gr = c.createLinearGradient(0, 0, 0, 340); gr.addColorStop(0, "#2a8ad8"); gr.addColorStop(1, "#0a2a5a"); c.fillStyle = gr; c.fillRect(0, 0, 640, 340);
    for (const it of items) { c.save(); c.translate(it.x, it.y); c.lineWidth = 3; c.strokeStyle = INK; if (it.pearl) { c.fillStyle = "#fff"; c.shadowColor = "#fff"; c.shadowBlur = 12; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.stroke(); } else { c.fillStyle = "#ffb3c8"; c.beginPath(); c.moveTo(-16, 8); c.quadraticCurveTo(-16, -14, 0, -14); c.quadraticCurveTo(16, -14, 16, 8); c.closePath(); c.fill(); c.stroke(); c.lineWidth = 1.5; for (const k of [-8, 0, 8]) { c.beginPath(); c.moveTo(k, 8); c.lineTo(k * 0.6, -12); c.stroke(); } } c.restore(); }
    c.fillStyle = "#fff"; c.font = "26px Bangers, Impact, sans-serif"; c.fillText(`TIME ${Math.ceil(left)}   SHELLS ${got}   PEARLS ${pearls}`, 14, 30);
    if (left > 0 && el.isConnected) requestAnimationFrame(step); else finish();
  };
  const finish = () => { if (!el.isConnected) return; const money = Math.round(got * Math.max(15, state.money * 0.004) / 5) * 5; state.money += money; if (pearls) addGems(Math.ceil(pearls / 3), "pearls"); toast(`DIVE OVER: ${got} shells +${fmt(money)}, ${pearls} pearls`, "#ffe066"); el.remove(); save(); };
  el.addEventListener("click", e => { if (e.target === el) finish(); }); requestAnimationFrame(step);
}

// ---------- photo, save code, performance mode, colour-blind colours ----------
function takePhoto() { const a = document.createElement("a"); a.download = "pwr-fishing-" + Date.now() + ".png"; document.getElementById("game").toBlob(b => { a.href = URL.createObjectURL(b); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }); toast("Photo saved!", "#c8f7c5"); Snd.chime(); }
window.addEventListener("keydown", e => { if ((e.key === "c" || e.key === "C") && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || "") && typeof menu !== "undefined" && !menu.open) takePhoto(); });
const CB_COLS = ["#8a8a8a", "#e69f00", "#56b4e9", "#cc79a7", "#0072b2", "#d55e00"];
let RAR_COLS = null;
function applyPalette() { RAR_COLS = RAR_COLS || RARITIES.map(r => r.col); RARITIES.forEach((r, i) => { r.col = settings.cb ? CB_COLS[i] : RAR_COLS[i]; }); }
function perfMode() { for (const k of ["bgFish", "bubbles", "sky", "clouds", "fx", "chips"]) settings[k] = false; saveSettings(); }
function saveCode() { try { return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); } catch (e) { return ""; } }
function loadCode(code) { try { const s = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if (!s || typeof s.money !== "number") return false; localStorage.setItem(SAVE_KEY, JSON.stringify(s)); location.reload(); return true; } catch (e) { return false; } }
function extraSettings(data, row) { // extra buttons in Settings > Game
  { const r = row(data, "Performance mode", "Turns off most background scenery and effects for slow computers"); const b = document.createElement("button"); b.className = "act"; b.textContent = "TURN ON"; b.onclick = () => { perfMode(); renderSettings(); }; r.appendChild(b); }
  { const r = row(data, "Save code", "Copy this code to move your game to another device"); const b = document.createElement("button"); b.className = "act"; b.textContent = "SHOW CODE"; const ta = document.createElement("textarea"); ta.style.cssText = "width:100%;height:4em;display:none;font-size:.7em"; ta.readOnly = true; b.onclick = () => { ta.value = saveCode(); ta.style.display = "block"; ta.select(); }; r.appendChild(b); data.appendChild(ta); }
  { const r = row(data, "Load a save code", "Paste a code here (this replaces your game)"); const ta = document.createElement("textarea"); ta.style.cssText = "width:100%;height:3em;font-size:.7em"; const b = document.createElement("button"); b.className = "act danger"; b.textContent = "LOAD"; b.onclick = () => { if (!loadCode(ta.value)) { b.textContent = "BAD CODE"; } }; r.appendChild(b); data.appendChild(ta); }
}
window.addEventListener("load", () => { applyPalette(); if (settings.skipIntro && typeof startGame === "function") startGame(); });
