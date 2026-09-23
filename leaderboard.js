"use strict";
// The public leaderboard: the biggest single catches from every player who has this game open, anywhere.
// Talks to a small Cloudflare Worker + D1 database (see the leaderboard-worker folder next to this game).
// Loaded before start.js. Uses RARITIES, F, fmt, save, Snd, document, fetch at call time.

const LB_API = "https://pwr-fisher-leaderboard.isher.workers.dev";
const LB_NAME_KEY = "pwrfisher_lb_name";

function lbName() { try { return localStorage.getItem(LB_NAME_KEY) || ""; } catch (e) { return ""; } }
function lbSetName(n) { try { localStorage.setItem(LB_NAME_KEY, n); } catch (e) {} }

async function lbFetchTop() {
  const r = await fetch(LB_API + "/top"); const j = await r.json();
  if (!j.ok) throw new Error(j.error || "failed");
  return j.top;
}
async function lbSubmit(name, fish, rarity, value) {
  const r = await fetch(LB_API + "/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, fish, rarity, value }) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "failed");
  return j.rank;
}

// ---------- the leaderboard panel on the start screen ----------
async function openLeaderboard() {
  document.getElementById("mapPick").hidden = true;
  const box = document.getElementById("leadPick"); box.hidden = false;
  await renderLeaderboard();
}
function closeLeaderboard() { document.getElementById("leadPick").hidden = true; }

async function renderLeaderboard() {
  const body = document.getElementById("leadBody");
  body.innerHTML = '<p class="leadmsg">Loading...</p>';
  let top;
  try { top = await lbFetchTop(); } catch (e) { body.innerHTML = '<p class="leadmsg">Could not reach the leaderboard. Check your connection and try again.</p>'; return; }

  body.innerHTML = "";
  const list = document.createElement("div"); list.className = "leadlist";
  if (!top.length) list.innerHTML = '<p class="leadmsg">Nobody has submitted a catch yet — be the first!</p>';
  top.forEach((row, i) => {
    const R = RARITIES[row.rarity] || RARITIES[0];
    const r = document.createElement("div"); r.className = "leadrow";
    r.innerHTML = `<b class="leadrank">#${i + 1}</b><span class="leadwho">${escapeHtml(row.name)}</span><span class="leadfish" style="color:${R.col}">${escapeHtml(row.fish)}</span><b class="leadval">${fmt(row.value)}</b>`;
    list.appendChild(r);
  });
  body.appendChild(list);

  // let the player submit their own best catch (if they have one worth showing)
  const f = typeof F === "function" ? F() : null;
  const best = f && f.stats && f.stats.bestCatch;
  const sub = document.createElement("div"); sub.className = "leadsubmit";
  if (best && best > 0) {
    const already = f.lbSubmitted;
    sub.innerHTML = `<p>Your best catch: <b>${escapeHtml(f.stats.bestCatchFish || "a fish")}</b> for <b>${fmt(best)}</b></p>`;
    const row = document.createElement("div"); row.className = "leadsubmitrow";
    const inp = document.createElement("input"); inp.type = "text"; inp.maxLength = 20; inp.placeholder = "Your name"; inp.value = lbName(); inp.className = "leadname";
    const btn = document.createElement("button"); btn.className = "act"; btn.textContent = already ? "SUBMITTED" : "SUBMIT TO LEADERBOARD"; btn.disabled = !!already;
    btn.onclick = async () => {
      const name = inp.value.trim() || "Angler"; lbSetName(name); btn.disabled = true; btn.textContent = "SENDING...";
      try {
        const rank = await lbSubmit(name, f.stats.bestCatchFish || "a fish", f.stats.bestCatchRarity || 0, best);
        f.lbSubmitted = true; if (typeof save === "function") save();
        btn.textContent = "SENT!  RANK #" + rank; if (typeof Snd !== "undefined") Snd.rewardReady();
        await renderLeaderboard();
      } catch (e) { btn.disabled = false; btn.textContent = "COULDN'T SEND - TRY AGAIN"; }
    };
    row.appendChild(inp); row.appendChild(btn); sub.appendChild(row);
  } else {
    sub.innerHTML = '<p class="leadmsg">Catch a fish in game, then come back here to submit your best one!</p>';
  }
  body.appendChild(sub);
}
function escapeHtml(s) { const d = document.createElement("div"); d.textContent = String(s); return d.innerHTML; }

document.getElementById("mLead").onclick = () => (document.getElementById("leadPick").hidden ? openLeaderboard() : closeLeaderboard());
