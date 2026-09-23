"use strict";
// A big bundle of "make it more satisfying and addictive" features (see IDEAS.md): hot spots, Golden Hour, mystery bites,
// rare-fish warnings, market prices, gear mastery, fish records, fish orders, daily spin, mystery box, wind, perfect throws,
// pet levels, daily shop sale, offline earnings, stats, a tutorial and a pause key.
// Loaded before game.js (only defines things). Uses state, settings, g, FISH, MAPS, MAP_ORDER, RARITIES, REWARD_GOALS, W, H, WATER_Y,
// DECK_Y, ctx, INK, Snd, save, fmt, toast, addGems, F, fx, dayKey, dailyRng, tier, clamp, lerp, rand, itemCost at call time.

const mx = { wind: 0, windTarget: 0, windClock: 20, hot: null, hotClock: 60 + Math.random() * 40, golden: 0, goldenClock: 300 + Math.random() * 200, started: false, sync: 5, tutorial: false };
const onE = () => settings.events !== false;

// ---------- market prices: every kind of fish is worth a bit more or less for a few minutes ----------
const marketMult = name => Math.round((0.8 + 0.5 * dailyRng(name + Math.floor(Date.now() / 240000))()) * 20) / 20;
const masteryStars = t => Math.min(5, Math.floor(((F().mast || {})[t] || 0) / 50));

// everything that changes what a catch is worth
function moreMult(f) {
  let m = marketMult(f.name) * (1 + 0.03 * masteryStars(tier("rod")));
  if (mx.golden > 0) m *= 1.5;
  if (g.perfect) m *= 1.25;
  if (g.mystery) m *= 1.5;
  return m * extraMult(f);
}

// wind pushes every throw a little to the left or right
const windPush = () => mx.wind * 45;

// ---------- after a catch ----------
function moreAfterCatch(f, net) {
  const F_ = F(), n = g.multi || 1;
  g.wob = 1; // the bucket wobbles
  if (f.rarity >= 2) Snd.stinger(f.rarity);
  const rod = tier("rod"); F_.mast[rod] = (F_.mast[rod] || 0) + n; // gear mastery: a star for every 50 fish with the same rod
  if (F_.mast[rod] < 300 && Math.floor(F_.mast[rod] / 50) > Math.floor((F_.mast[rod] - n) / 50)) toast("ROD MASTERY UP!  +3% sell value with this rod", "#e3c8ff");
  const cm = Math.round(f.len * (g.sizeMul || 1) * (g.big ? 1.3 : 1) * 0.9), rec = F_.records[f.name]; // personal bests
  if (!rec || cm > rec.cm) { F_.records[f.name] = { cm }; if (rec && g.banner) g.banner.sub += "  -  NEW RECORD " + cm + " cm!"; }
  if (net > (F_.stats.bestCatch || 0)) { F_.stats.bestCatch = net; F_.stats.bestCatchFish = f.name; F_.stats.bestCatchRarity = f.rarity; F_.lbSubmitted = false; } // a new personal best can be sent to the leaderboard
  const mk = marketMult(f.name); if (g.banner && Math.abs(mk - 1) >= 0.1) g.banner.sub += `  -  market ${mk > 1 ? "+" : ""}${Math.round((mk - 1) * 100)}%`;
  if (g.mystery && g.banner) g.banner.text = "MYSTERY! " + g.banner.text;
  const o = F_.order; // fish orders
  if (o && o.name === f.name) {
    o.have += n;
    if (o.have >= o.need) { state.money += o.reward; toast(`ORDER DONE: ${o.need} ${o.name}  +${fmt(o.reward)}`, "#ffe066"); if (o.gems) addGems(o.gems, "order"); Snd.rewardReady(); F_.order = null; newOrder(); save(); }
  }
  const goal = REWARD_GOALS.filter(gl => gl.id.startsWith("catch") && !goalClaimed(gl) && !goalDone(gl)).sort((a, b) => a.need - b.need)[0]; // how close is the next reward?
  if (goal) { const left = goal.need - (state.total || 0); if (left > 0 && left <= 5) toast(`${left} MORE FISH FOR: ${goal.name.toUpperCase()}`, "#bfe3ff"); }
  g.perfect = false; g.mystery = false; g.hot = false;
}
function newOrder() {
  const maxS = tier("line") + 1, pool = FISH.filter(f => f.maps.includes(state.map) && f.rarity <= 2 && f.size <= maxS);
  const f = pool.length ? pool[Math.floor(Math.random() * pool.length)] : FISH[0], need = 2 + Math.floor(Math.random() * 4);
  F().order = { name: f.name, need, have: 0, reward: Math.round(f.value * 0.5 * need * 5 / 10) * 10 + 100, gems: f.rarity >= 1 ? 1 : 0 };
}

// ---------- when the line lands ----------
function moreLanded() {
  g.hot = !!(settings.manual && mx.hot && Math.abs(g.land.x - mx.hot.x) < 80); // hot spots are for manual throwing only
  if (g.hot) { g.biteAt *= 0.55; toast("HOT SPOT! Fish bite faster and rarer ones come", "#ffb86b"); Snd.chime(); }
  if (g.perfect) g.biteAt *= 0.6;
  if (g.hot || g.perfect) g.approachAt = Math.max(0, g.biteAt - 1.6);
}

// ---------- junk can hide treasure ----------
function junkTreasure() {
  const r = Math.random();
  if (r < 0.03) { addGems(1, "found in junk"); return "A GEM WAS INSIDE!"; }
  if (r < 0.11) { const a = 40 + Math.floor(Math.random() * 260); state.money += a; return "TREASURE INSIDE!  +" + fmt(a); }
  return "";
}

// ---------- per frame ----------
function moreUpdate(dt) {
  if (!mx.started) { mx.started = true; moreInit(); }
  const F_ = F(); F_.stats.time += dt;
  g.wob = Math.max(0, (g.wob || 0) - dt * 2.5);
  const zt = (g.mode === "bite" || g.mode === "fight") ? 1.05 : 1; g.zoom = (g.zoom || 1) + (zt - (g.zoom || 1)) * Math.min(1, dt * 6); // a little zoom when a fish bites
  mx.sync -= dt; if (mx.sync <= 0) { mx.sync = 8; F_.lastSeen = Date.now(); }
  mx.windClock -= dt; if (mx.windClock <= 0) { mx.windClock = rand(25, 60); mx.windTarget = rand(-1, 1); } mx.wind += (mx.windTarget - mx.wind) * Math.min(1, dt * 0.3);
  if (!onE()) { mx.hot = null; mx.golden = 0; return; }
  if (!settings.manual) { mx.hot = null; mx.wasManual = false; } // auto mode never gets hot spots
  else if (!mx.wasManual) { mx.wasManual = true; mx.hotClock = Math.min(mx.hotClock, 6); } // a hot spot shows up soon after you switch to manual
  else if (mx.hot) { mx.hot.life -= dt; if (mx.hot.life <= 0) mx.hot = null; }
  else { mx.hotClock -= dt; if (mx.hotClock <= 0) { mx.hotClock = rand(80, 140); const far = Math.max(600, Math.min(720, maxLandX() - 30)); mx.hot = { x: rand(560, far), life: 50 }; Snd.rewardReady(); } } // always within reach of your line and close to the dock
  if (mx.golden > 0) { mx.golden -= dt; if (mx.golden <= 0) toast("Golden Hour is over.", "#ffe9a8"); }
  else { mx.goldenClock -= dt; if (mx.goldenClock <= 0) { mx.goldenClock = rand(360, 540); mx.golden = 60; toast("GOLDEN HOUR! Every fish sells for x1.5 for a minute", "#ffe066"); Snd.rewardReady(); } }
}
function moreInit() {
  for (const id of MAP_ORDER) { // one Fish Book page reward per map
    const pool = FISH.filter(f => f.maps.includes(id));
    REWARD_GOALS.push({ id: "page_" + id, group: 1, name: `Complete the ${MAPS[id].name} Fish Book page`, need: pool.length, reward: Math.round(pool.length * 60 / 50) * 50, gems: 3, items: null, val: () => pool.filter(f => state.caught[f.name] > 0).length });
  }
  const F_ = F(); if (!F_.order) newOrder();
  const last = F_.lastSeen; // offline earnings from your fishing trap
  if (last) {
    const mins = Math.min(180, (Date.now() - last) / 60000);
    if (mins >= 2) { const rate = Math.round(4 * (tier("rod") + tier("line") + tier("bait")) / 3 * (1 + 0.25 * F_.pets.length)), earned = Math.round(mins * rate); if (earned > 0) { state.money += earned; toast(`WELCOME BACK! Your fishing trap earned ${fmt(earned)}`, "#c8f7c5"); save(); } }
  }
  F_.lastSeen = Date.now();
}

// ---------- drawing (screen space, after the scene) ----------
function moreDrawWorld() {
  const c = ctx;
  if (mx.golden > 0) { c.save(); c.fillStyle = `rgba(255,205,80,${0.09 + 0.04 * Math.sin(g.t * 3)})`; c.fillRect(0, 0, W, H); c.restore(); }
  if (mx.hot) { // a big glowing hot spot on the water
    const sx = W - mx.hot.x, sy = WATER_Y + 8, p = 0.6 + 0.4 * Math.sin(g.t * 4), a = Math.min(1, mx.hot.life / 3, (50 - mx.hot.life) / 1.5 + 0.2);
    c.save(); c.globalAlpha = Math.max(0.15, a);
    const beam = c.createLinearGradient(0, sy, 0, sy + 300); beam.addColorStop(0, `rgba(255,220,110,${0.55 * p})`); beam.addColorStop(1, "rgba(255,180,60,0)"); c.fillStyle = beam; c.beginPath(); c.moveTo(sx - 46, sy); c.lineTo(sx + 46, sy); c.lineTo(sx + 100, sy + 300); c.lineTo(sx - 100, sy + 300); c.closePath(); c.fill();
    const gr = c.createRadialGradient(sx, sy + 6, 6, sx, sy + 6, 170); gr.addColorStop(0, `rgba(255,230,120,${0.85 * p})`); gr.addColorStop(0.5, `rgba(255,170,60,${0.4 * p})`); gr.addColorStop(1, "rgba(255,150,60,0)"); c.fillStyle = gr; c.fillRect(sx - 180, sy - 100, 360, 230);
    c.strokeStyle = "#fff3a0"; c.lineWidth = 5; for (let i = 0; i < 3; i++) { const k = (g.t * 0.7 + i / 3) % 1; c.globalAlpha = Math.max(0.15, a) * (1 - k); c.beginPath(); c.ellipse(sx, sy + 6, 26 + k * 100, 7 + k * 24, 0, 0, 7); c.stroke(); }
    c.globalAlpha = Math.max(0.15, a); c.fillStyle = "#fff8c0"; for (let i = 0; i < 8; i++) { const ang = g.t * 1.2 + i, r = 30 + (i % 3) * 22; c.beginPath(); c.arc(sx + Math.cos(ang) * r, sy + 6 + Math.sin(ang) * r * 0.25 - Math.abs(Math.sin(g.t * 3 + i)) * 20, 3, 0, 7); c.fill(); }
    c.font = "34px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.lineWidth = 7; c.lineJoin = "round"; c.strokeStyle = INK; c.fillStyle = "#ffe066"; c.strokeText("HOT SPOT", sx, sy - 40 - Math.abs(Math.sin(g.t * 3)) * 6); c.fillText("HOT SPOT", sx, sy - 40 - Math.abs(Math.sin(g.t * 3)) * 6);
    c.beginPath(); c.moveTo(sx - 12, sy - 28); c.lineTo(sx + 12, sy - 28); c.lineTo(sx, sy - 12); c.closePath(); c.fill(); c.lineWidth = 4; c.stroke();
    c.restore();
  }
  if (onE() && g.fish && !g.fish.junk && g.fish.rarity >= 2 && ["wait", "bite", "reel", "fight"].includes(g.mode)) { // rarity-coloured glow while a good fish is on
    const col = RARITIES[g.fish.rarity].col, gr = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, col); c.save(); c.globalAlpha = 0.22 + 0.1 * Math.sin(g.t * 6); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.restore();
  }
  if (fx.combo >= 3) { // lucky streak aura around the fisherman
    const r = 70 + Math.min(fx.combo, 12) * 3, gr = c.createRadialGradient(W - 190, DECK_Y - 60, 8, W - 190, DECK_Y - 60, r);
    gr.addColorStop(0, "rgba(255,220,90,.55)"); gr.addColorStop(1, "rgba(255,200,60,0)"); c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.6 + 0.3 * Math.sin(g.t * 5); c.fillStyle = gr; c.beginPath(); c.arc(W - 190, DECK_Y - 60, r, 0, 7); c.fill(); c.restore();
  }
  if (g.paused && !mx.tutorial) {
    c.save(); c.fillStyle = "rgba(10,20,50,.45)"; c.fillRect(0, 0, W, H); c.font = "110px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.lineWidth = 14; c.strokeStyle = INK; c.fillStyle = "#fff";
    c.strokeText("PAUSED", W / 2, H / 2); c.fillText("PAUSED", W / 2, H / 2); c.font = "34px Bangers, Impact, sans-serif"; c.lineWidth = 7; c.strokeText("press P to keep fishing", W / 2, H / 2 + 60); c.fillText("press P to keep fishing", W / 2, H / 2 + 60); c.restore();
  }
}

// ---------- shop: a daily sale, a next-upgrade hint and mastery stars ----------
function saleItem() {
  const r = dailyRng("sale" + dayKey()), cats = ["rod", "line", "bait", "bucket", "chair", "strength"];
  return { cat: cats[Math.floor(r() * cats.length)], t: 4 + Math.floor(r() * 14) };
}
const isSale = (cat, t) => { const s = saleItem(); return s.cat === cat && s.t === t; };
const shopPrice = (cat, t) => (isSale(cat, t) ? Math.round(itemCost(cat, t) * 0.7 / 10) * 10 : itemCost(cat, t));
function shopHint(cat) { // "Next: X for $Y"
  const items = CATS[cat].items, next = Math.max(...state.owned[cat]) + 1;
  if (next > items.length) return "You own the best there is!";
  const p = shopPrice(cat, next), need = p - state.money;
  return `Next upgrade: ${items[next - 1].name} for ${fmt(p)}` + (need > 0 ? `  (${fmt(need)} more)` : "  - you can buy it now!");
}
const bookExtra = f => { const rec = (F().records || {})[f.name], n = state.caught[f.name] || 0, stars = n >= 100 ? 3 : n >= 10 ? 2 : n >= 1 ? 1 : 0; return (rec ? `<small>Best ${rec.cm} cm &middot; market x${marketMult(f.name)}</small>` : "") + (stars ? `<small style="color:#e6a800">${"\u2605".repeat(stars)}${"\u2606".repeat(3 - stars)} (10 and 100 catches)</small>` : "") + (NIGHT.has(f.name) ? "<small>Only bites at night</small>" : ""); };

// ---------- the Boosts page: spin, mystery box, order, stats ----------
function dailySpin() {
  const r = Math.random(), f = F();
  if (r < 0.55) { const a = Math.round(Math.max(200, state.money * 0.03) / 10) * 10; state.money += a; toast("SPIN: +" + fmt(a), "#ffe066"); }
  else if (r < 0.8) { if (Math.random() < 0.5) { f.stock.lucky++; toast("SPIN: a Lucky Hour boost!", "#d8ffb8"); } else { f.stock.frenzy++; toast("SPIN: a Bait Frenzy boost!", "#ffe0b8"); } }
  else if (r < 0.95) addGems(1, "daily spin"); else addGems(3, "daily spin JACKPOT");
  Snd.rewardReady(); save();
}
function mysteryBox() {
  const r = Math.random(), f = F();
  if (r < 0.5) { const a = Math.round(Math.max(500, state.money * 0.05) / 10) * 10; state.money += a; toast("MYSTERY BOX: +" + fmt(a), "#ffe066"); }
  else if (r < 0.8) { f.stock.lucky++; f.stock.frenzy++; toast("MYSTERY BOX: a Lucky Hour AND a Bait Frenzy!", "#d8ffb8"); }
  else if (r < 0.95) addGems(3, "mystery box"); else addGems(8, "mystery box JACKPOT");
  Snd.rewardReady(); save();
}
function renderMoreFun(section, row, btn) {
  const f = F(), today = dayKey();
  const sp = section("Daily spin");
  { const r = row(sp, "Spin the wheel", f.spinDay === today ? "Come back tomorrow for another spin!" : "One free spin a day: money, boosts or even gems"); btn(r, f.spinDay === today ? "USED" : "SPIN!", () => { f.spinDay = today; dailySpin(); }, f.spinDay === today); }
  const mb = section("Mystery box");
  { const r = row(mb, "Open a mystery box", "Costs 4 gems. Money, boosts, or a big gem win"); btn(r, "OPEN  ◆ 4", () => { state.gems -= 4; mysteryBox(); }, (state.gems || 0) < 4); }
  const od = section("Fish order");
  if (f.order) { const o = f.order, fish = FISH.find(x => x.name === o.name); row(od, `Deliver ${o.need} ${o.name}`, `${o.have} / ${o.need}  -  reward ${fmt(o.reward)}${o.gems ? " + ◆ " + o.gems : ""}. Found in: ${fish ? fish.maps.map(m => MAPS[m].name).join(", ") : "?"}`); }
  const st = section("Your stats"), h = Math.floor(f.stats.time / 3600), m = Math.floor(f.stats.time % 3600 / 60);
  const big = Object.entries(f.records || {}).sort((a, b) => b[1].cm - a[1].cm)[0];
  row(st, "Time played", `${h}h ${m}m`); row(st, "Fish caught", String(state.total || 0)); row(st, "Kinds in the Fish Book", `${FISH.filter(x => state.caught[x.name] > 0).length} / ${FISH.length}`);
  row(st, "Best single catch", fmt(f.stats.bestCatch || 0)); row(st, "Biggest fish", big ? `${big[0]} (${big[1].cm} cm)` : "none yet"); row(st, "Gems collected", String(f.stats.gemsTotal || 0));
  row(st, "Rod mastery", `${"★".repeat(masteryStars(tier("rod"))) || "none yet"} (a star for every 50 fish with your rod, +3% each)`);
}

// ---------- pets level up ----------
const petLevel = () => 1 + Math.floor((F().petGifts || 0) / 8);
const petBoost = () => 1 + 0.15 * (petLevel() - 1);

// ---------- tutorial, pause and tooltips ----------
const TUT = [
  ["WELCOME!", "The fisherman casts by himself. Real fish swim in the water and the one closest to your hook is the one that bites."],
  ["REEL IT IN", "Fish sell for money on their own. In auto mode, click to reel faster. The deeper you fish, the bigger the fish."],
  ["UPGRADE", "Use SHOP to buy better rods, lines and bait, and PETS for helpers. Rare fish give you gems, which buy top gear."],
  ["MANUAL MODE", "Press AUTO to switch to MANUAL: hold the mouse to charge the throw, move up/down to pick the arc, release to throw."],
  ["EXTRAS", "Hot spots, Golden Hour, chests and daily goals give bonuses. Press P to pause. Have fun!"],
];
function showTutorial() {
  try { if (localStorage.getItem("pwrfisher_tut_v1")) return; } catch (e) {}
  let i = 0; const el = document.createElement("div"); el.className = "overlay"; el.style.zIndex = 25;
  el.innerHTML = '<div class="lcard"><h3></h3><p></p><button class="yes" id="tutNext">NEXT</button> <button class="no" id="tutSkip">SKIP</button></div>';
  const show = () => { el.querySelector("h3").textContent = TUT[i][0]; el.querySelector("p").textContent = TUT[i][1]; el.querySelector("#tutNext").textContent = i === TUT.length - 1 ? "LET'S FISH!" : "NEXT (" + (i + 1) + "/" + TUT.length + ")"; };
  const done = () => { el.remove(); mx.tutorial = false; g.paused = false; try { localStorage.setItem("pwrfisher_tut_v1", "1"); } catch (e) {} };
  el.querySelector("#tutNext").onclick = () => { if (++i >= TUT.length) done(); else show(); }; el.querySelector("#tutSkip").onclick = done;
  document.getElementById("stage").appendChild(el); mx.tutorial = true; g.paused = true; show();
}
window.addEventListener("keydown", e => {
  if ((e.key === "p" || e.key === "P") && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || "") && !menu.open && !mx.tutorial) g.paused = !g.paused;
});
for (const [id, tip] of [["shopBtn", "Buy rods, lines, baits, buckets, chairs, food and pets"], ["rewBtn", "Goals that give money, gems and free gear"], ["boostBtn", "Boosts, daily goals, spin, mystery box, orders, stats"], ["colBtn", "Every fish you found"], ["setBtn", "Sound, scenery and game options"], ["modeBtn", "Auto casts for you. Manual: you throw the line"], ["menuBtn", "Back to the start screen (P pauses)"]]) { const b = document.getElementById(id); if (b) b.title = tip; }
