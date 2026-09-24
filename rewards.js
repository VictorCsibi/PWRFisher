"use strict";
// Rewards: goals like "catch 50 fish" that pay out money. Loaded before game.js.
// Uses state, FISH, RARITIES, RANKS, myRank, g, Snd, save, fmt, popup, bodyEl, refreshModal, checkStory at call time.

const m$ = n => "$" + Math.floor(n).toLocaleString(); // (fmt lives in game.js, which loads later)
const speciesCaught = () => FISH.filter(f => state.caught[f.name] > 0).length;
const rarityCaught = r => FISH.some(f => f.rarity >= r && state.caught[f.name] > 0) ? 1 : 0;
const shinyTotal = () => Object.values(state.shiny || {}).reduce((a, b) => a + b, 0);

const REWARD_GROUPS = ["Catching fish", "Fish Book", "Rare finds", "Shiny fish", "Money", "Odd jobs", "Explorer", "Ranks", "Challenges", "Gear", "Gems"];
const rarityCount = r => FISH.reduce((n, f) => n + (f.rarity >= r ? (state.caught[f.name] || 0) : 0), 0); // how many fish of that rarity or better
// each goal keeps its id (the number the old goal had) so old claims and free-gear rewards still match; needs are much higher and the easy rewards are smaller
const REWARD_GOALS = [
  ...[[10, 25, 40], [25, 75, 150], [50, 200, 400], [100, 500, 1200], [250, 1000, 3500], [500, 2000, 9000], [1000, 4000, 25000]].map(([id, n, r]) => ({ id: "catch" + id, group: 0, name: `Catch ${n} fish`, need: n, reward: r, val: () => state.total || 0 })),
  ...[[5, 10, 100], [10, 20, 400], [20, 40, 1800], [30, 60, 5000]].map(([id, n, r]) => ({ id: "book" + id, group: 1, name: `Catch ${n} kinds of fish`, need: n, reward: r, val: speciesCaught })),
  { id: "bookall", group: 1, name: "Complete the whole Fish Book", need: 999, reward: 60000, val: () => (speciesCaught() >= FISH.length ? 999 : speciesCaught()), show: () => `${speciesCaught()} / ${FISH.length}` },
  ...[[1, "Uncommon", 30, 80], [2, "Rare", 15, 500], [3, "Epic", 8, 2500], [4, "Legendary", 4, 10000], [5, "Mythic", 2, 30000]].map(([r, nm, n, rw]) => ({ id: "rare" + r, group: 2, name: `Catch ${n} ${nm} fish (or better)`, need: n, reward: rw, val: () => rarityCount(r) })),
  ...[[1, 2, 1200], [5, 8, 5000], [15, 25, 20000]].map(([id, n, r]) => ({ id: "shiny" + id, group: 3, name: `Catch ${n} Shiny fish`, need: n, reward: r, val: shinyTotal })),
  ...[[1000, 5000, 80], [10000, 50000, 500], [100000, 500000, 5000], [1000000, 5000000, 50000]].map(([id, n, r]) => ({ id: "earn" + id, group: 4, name: `Earn ${m$(n)} from fish`, need: n, reward: r, val: () => state.stats.earned || 0, show: () => `${fmt(Math.min(state.stats.earned || 0, n))} / ${fmt(n)}` })),
  ...[[5, 15, 30], [20, 60, 200]].map(([id, n, r]) => ({ id: "junk" + id, group: 5, name: `Reel in ${n} pieces of junk`, need: n, reward: r, val: () => state.stats.junk || 0 })),
  ...[[5, 15, 60], [25, 60, 400]].map(([id, n, r]) => ({ id: "nap" + id, group: 5, name: `Take ${n} naps in the chair`, need: n, reward: r, val: () => state.stats.naps || 0 })),
  ...[[2, 3, 60], [3, 5, 250], [5, 8, 1200], [8, 10, 4000], [11, 16, 15000]].map(([id, n, r]) => ({ id: "maps" + id, group: 6, name: id === 11 ? "Visit every map" : `Visit ${n} maps`, need: n, reward: r, val: () => state.ownedMaps.length })),
  ...[[3, 3, 2000], [4, 4, 6000], [5, 5, 15000], [6, 6, 40000]].map(([id, n, r]) => ({ id: "rank" + id, group: 7, name: `Reach the rank of ${RANKS[n - 1].name}`, need: n, reward: r, val: () => myRank() })),
];

const maxTier = cat => Math.max(...state.owned[cat]);
REWARD_GOALS.push(
  ...[["combo5", 5, 150, "Get a x5 catch combo"], ["combo10", 10, 600, "Get a x10 catch combo"], ["combo20", 20, 2500, "Get a x20 catch combo"]].map(([id, n, r, name]) => ({ id, group: 8, name, need: n, reward: r, val: () => F().stats.bestCombo })),
  ...[["chest5", 5, 200], ["chest25", 25, 1500]].map(([id, n, r]) => ({ id, group: 8, name: `Open ${n} chests or bottles`, need: n, reward: r, val: () => F().stats.chests })),
  ...[["daily3", 3, 300], ["daily15", 15, 2500]].map(([id, n, r]) => ({ id, group: 8, name: `Finish ${n} daily goals`, need: n, reward: r, val: () => F().stats.dailies })),
  ...[["streak3", 3, 200], ["streak7", 7, 1500]].map(([id, n, r]) => ({ id, group: 8, name: `Play ${n} days in a row`, need: n, reward: r, val: () => F().bestStreak })),
  { id: "storm3", group: 8, name: "Fish through 3 storms", need: 3, reward: 400, val: () => F().stats.storms },
  ...[["legend1", 1, 1500], ["legend5", 5, 8000]].map(([id, n, r]) => ({ id, group: 8, name: n === 1 ? "Land a legendary fish" : `Land ${n} legendary fish`, need: n, reward: r, val: () => F().stats.legends })),
  { id: "multi1", group: 8, name: "Land a double or triple catch", need: 1, reward: 600, val: () => F().stats.doubles + F().stats.triples },
  { id: "triple1", group: 8, name: "Land a triple catch", need: 1, reward: 2000, val: () => F().stats.triples },
  { id: "pet1", group: 8, name: "Adopt a pet", need: 1, reward: 300, val: () => F().pets.length },
  ...["rod", "line", "bait", "bucket"].flatMap(cat => [[5, 100], [10, 600], [15, 3000], [20, 15000]].map(([t, r]) => ({ id: `own_${cat}${t}`, group: 9, name: `Own a tier ${t} ${cat}`, need: t, reward: r, val: () => maxTier(cat) }))),
  ...[["gems10", 5, 300], ["gems30", 15, 1000], ["gems75", 40, 4000], ["gems150", 80, 15000]].map(([id, n, r]) => ({ id, group: 10, name: `Collect ${n} gems`, need: n, reward: r, val: () => F().stats.gemsTotal })),
);
// gems for goals: small goals give 1-2, big goals give a lot
const GEM_BY_ID = {
  catch10: 1, catch25: 1, catch50: 2, catch100: 3, catch250: 5, catch500: 8, catch1000: 14,
  book5: 1, book10: 2, book20: 5, book30: 10, bookall: 40, rare1: 1, rare2: 2, rare3: 4, rare4: 7, rare5: 12, shiny1: 2, shiny5: 5, shiny15: 10,
  earn1000: 1, earn10000: 3, earn100000: 8, earn1000000: 16, junk5: 1, junk20: 2, nap5: 1, nap25: 3, maps2: 1, maps3: 1, maps5: 2, maps8: 3, maps11: 6,
  rank3: 4, rank4: 8, rank5: 14, rank6: 25,
  combo5: 1, combo10: 3, combo20: 6, chest5: 1, chest25: 4, daily3: 2, daily15: 6, streak3: 2, streak7: 5, storm3: 2, legend1: 5, legend5: 12, multi1: 3, triple1: 6, pet1: 2,
  gems10: 1, gems30: 3, gems75: 6, gems150: 12,
};
for (const cat of ["rod", "line", "bait", "bucket"]) for (const [t, n] of [[5, 1], [10, 3], [15, 6], [20, 10]]) GEM_BY_ID[`own_${cat}${t}`] = n;
for (const gl of REWARD_GOALS) { const n = GEM_BY_ID[gl.id] || 0; gl.gems = n <= 1 ? n : Math.ceil(n / 2); } // gems are rare: goals give about half as many as before

// bigger goals also hand out free gear (cat: tier). The best gear is equipped automatically if it beats what you have.
const REWARD_ITEMS = {
  catch100: { bait: 3 }, catch250: { chair: 3 }, catch500: { rod: 5 }, catch1000: { line: 7, strength: 6 },
  book10: { strength: 3 }, book20: { bucket: 4 }, book30: { rod: 6, bait: 5 },
  bookall: { rod: 15, line: 15, bait: 15, bucket: 15, chair: 15, strength: 15 },
  rare3: { bait: 6 }, rare4: { bucket: 7 }, rare5: { rod: 9, line: 9 },
  shiny5: { chair: 6 }, shiny15: { bucket: 9, bait: 9 },
  earn100000: { line: 6 }, earn1000000: { rod: 12, line: 12 },
  junk20: { bucket: 2 }, nap25: { chair: 5 }, maps3: { strength: 5 }, maps5: { chair: 9 }, maps8: { rod: 11, line: 11 }, maps11: { rod: 13, line: 13, bait: 13 },
  rank5: { rod: 7 }, rank6: { rod: 10, chair: 10 },
};
for (const gl of REWARD_GOALS) gl.items = REWARD_ITEMS[gl.id] || null;
const itemName = (cat, t) => CATS[cat].items[t - 1].name;
function giveItem(cat, t) {
  if (!state.owned[cat].includes(t)) state.owned[cat].push(t);
  if (t > state.equipped[cat]) state.equipped[cat] = t;
}

const goalDone = gl => gl.val() >= gl.need;
const goalClaimed = gl => !!state.claimed[gl.id];
const claimableCount = () => REWARD_GOALS.filter(gl => goalDone(gl) && !goalClaimed(gl)).length;

function claimReward(gl) {
  if (!goalDone(gl) || goalClaimed(gl)) return;
  state.claimed[gl.id] = true; state.money += gl.reward; if (gl.gems) { state.gems = (state.gems || 0) + gl.gems; F().stats.gemsTotal += gl.gems; }
  if (gl.items) {
    const names = Object.entries(gl.items).map(([cat, t]) => { giveItem(cat, t); return itemName(cat, t); });
    g.banner = { text: "FREE GEAR!", sub: names.join(", ").toUpperCase(), life: 3.2, color: "#c8f7c5", subColor: "#fff" };
    Snd.equip();
  }
  save(); Snd.buy();
  popup("+" + fmt(gl.reward), 380, 50, "#ffd23f", 2, 40);
  checkStory(); refreshModal();
}

// every half second: tell the player when a new goal is complete
const rewardSeen = new Set(); let rewardTimer = 0, rewardFirst = true;
function updateRewards(dt) {
  rewardTimer -= dt; if (rewardTimer > 0) return; rewardTimer = 0.5;
  for (const gl of REWARD_GOALS) {
    if (!goalDone(gl) || goalClaimed(gl) || rewardSeen.has(gl.id)) continue;
    rewardSeen.add(gl.id);
    if (!rewardFirst) { g.rewardToast = { text: `REWARD READY: ${gl.name}`, life: 3.2 }; Snd.rewardReady(); refreshModal(); }
  }
  rewardFirst = false;
  if (g.rewardToast) { g.rewardToast.life -= 0.5; if (g.rewardToast.life <= 0) g.rewardToast = null; }
}

function renderRewards() {
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  const done = REWARD_GOALS.filter(goalClaimed).length;
  const top = document.createElement("div"); top.className = "rewardtop";
  top.textContent = `Rewards claimed: ${done} / ${REWARD_GOALS.length}   -   ready to claim: ${claimableCount()}`;
  bodyEl.appendChild(top);
  const grid = document.createElement("div"); grid.className = "grid rewards";
  REWARD_GROUPS.forEach((name, gi) => {
    const h = document.createElement("h4"); h.className = "rgroup"; h.textContent = name; grid.appendChild(h);
    for (const gl of REWARD_GOALS.filter(x => x.group === gi)) {
      const v = Math.min(gl.val(), gl.need), ready = goalDone(gl), got = goalClaimed(gl);
      const card = document.createElement("div"); card.className = "card reward" + (ready && !got ? " claimable" : "") + (got ? " claimed" : "");
      card.innerHTML = `<b>${gl.name}</b><small>Reward: ${fmt(gl.reward)}${gl.gems ? " + \u25C6 " + gl.gems + " gems" : ""}${gl.items ? " + free gear" : ""}</small><div class="pbar"><i style="width:${Math.round(v / gl.need * 100)}%"></i><span>${gl.show ? gl.show() : `${v} / ${gl.need}`}</span></div>`;
      if (gl.items) { // little pictures of the free gear
        const row = document.createElement("div"); row.className = "rewitems";
        for (const [cat, t] of Object.entries(gl.items)) { const cv = document.createElement("canvas"); cv.width = 200; cv.height = 110; cv.title = itemName(cat, t); drawItemIcon(cv.getContext("2d"), cat, t); row.appendChild(cv); }
        card.appendChild(row);
      }
      const btn = document.createElement("button");
      if (got) { btn.textContent = "CLAIMED"; btn.className = "on"; btn.disabled = true; }
      else if (ready) { btn.textContent = "CLAIM " + fmt(gl.reward) + (gl.gems ? "  \u25C6 " + gl.gems : ""); btn.onclick = () => claimReward(gl); }
      else { btn.textContent = "IN PROGRESS"; btn.disabled = true; }
      card.appendChild(btn); grid.appendChild(card);
    }
  });
  bodyEl.appendChild(grid); bodyEl.scrollTop = scroll;
}
