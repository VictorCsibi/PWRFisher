"use strict";
// The one-time story: at $20,000 another fisherman rows up and offers you a job (for a cut of your sales).
// Loaded before game.js. Uses state, W, WATER_Y, INK, ink(), Snd, save, closeModal, rand, lerp, clamp at call time.

const STORY_MONEY = 20000;
const DEAL_MULT = 1.5;   // sales multiplier if you take the job
const DEAL_CUT = 0.2;    // share of every sale the crew boss keeps

const story = { active: false, phase: "", step: 0, chars: 0, boatX: 0, choice: null, turn: 0 };

const STORY_PRE = [
  { w: "salty", t: "Ahoy there, young angler! I've been watching you fish from my boat all week." },
  { w: "salty", t: "Twenty thousand dollars already? That's mighty impressive!" },
  { w: "you",   t: "Thanks! I just really love fishing." },
  { w: "salty", t: "I run the biggest fishing company on this coast. My buyers pay top dollar for every catch." },
  { w: "salty", t: "Join my company, and everything you sell will fetch 1.5 times more!" },
  { w: "you",   t: "That sounds amazing... What's the catch?" },
  { w: "salty", t: "Ha! Sharp one. I keep a 20% cut of every sale. That's how the company stays afloat." },
  { w: "salty", t: "So, what do you say? Do you want to join my company?", choice: true },
];
const STORY_YES = [
  { w: "you",   t: "Deal! Even after your cut, I'll come out ahead." },
  { w: "salty", t: "Welcome to the company! Now go catch me some big ones." },
];
const STORY_NO = [
  { w: "you",   t: "Thanks, but I'd rather stay independent." },
  { w: "salty", t: "Suit yourself, kid. Good luck out there!" },
];
const storyLines = () => STORY_PRE.concat(story.choice === "yes" ? STORY_YES : story.choice === "no" ? STORY_NO : []);
const WHO = { salty: "Old Salty", you: "You" };

const sEl = {};
function storyDom() {
  if (sEl.root) return;
  sEl.root = document.getElementById("story"); sEl.bubble = document.getElementById("bubble"); sEl.who = document.getElementById("storyWho");
  sEl.text = document.getElementById("storyText"); sEl.choices = document.getElementById("storyChoices"); sEl.back = document.getElementById("storyBack");
  sEl.next = document.getElementById("storyNext"); sEl.page = document.getElementById("storyPage");
  sEl.back.onclick = storyBack; sEl.next.onclick = storyNext;
  sEl.choices.querySelectorAll("button").forEach(b => { b.onclick = () => storyChoose(b.dataset.c); });
}

// Called every frame and right after money changes (codes, sales): he comes the moment you reach $20,000+.
function checkStory() {
  return; // Old Salty and his job offer have been removed
  if (state.story.seen || story.active || (typeof licenseBlocked === "function" && licenseBlocked())) return;
  if (!state.story.reached && state.money >= STORY_MONEY) { state.story.reached = true; save(); }
  if (state.story.reached && g.mode !== "catch") startStory();
}

function startStory() {
  if (story.active || state.story.seen) return;
  storyDom();
  if (typeof closeModal === "function") closeModal();
  story.active = true; story.phase = "arrive"; story.step = 0; story.chars = 0; story.choice = null; story.boatX = W + 120; story.turn = 0;
  Snd.chime();
}

function storyLine() { return storyLines()[story.step]; }

function renderStory() {
  storyDom();
  const line = storyLine(); if (!line) return;
  const total = storyLines().length, atChoice = !!line.choice && !story.choice;
  const typed = Math.min(line.t.length, Math.floor(story.chars));
  sEl.who.textContent = WHO[line.w]; sEl.who.className = "who " + line.w;
  sEl.text.textContent = line.t.slice(0, typed);
  const done = typed >= line.t.length;
  sEl.choices.hidden = !(atChoice && done);
  sEl.page.textContent = `${story.step + 1} / ${story.choice ? total : STORY_PRE.length}`;
  sEl.back.disabled = story.step === 0 || (story.choice && story.step === STORY_PRE.length);
  sEl.next.hidden = atChoice;
  sEl.next.classList.toggle("finish", story.step === total - 1 && !!story.choice);
  // put the bubble near whoever is talking
  const u = window.innerWidth / W, you = line.w === "you";
  const spkX = you ? (W - 190) * u : (W - story.boatX) * u;
  sEl.root.classList.toggle("from-you", you);
  sEl.root.style.setProperty("--spk", spkX + "px");
}

function storyNext() {
  if (story.phase !== "talk") return;
  const line = storyLine(), typed = Math.floor(story.chars) >= line.t.length;
  if (!typed) { story.chars = line.t.length; renderStory(); return; }
  if (line.choice && !story.choice) return;
  if (story.step < storyLines().length - 1) { story.step++; story.chars = 0; renderStory(); return; }
  sEl.root.hidden = true; story.phase = "leave"; story.turn = 0; // conversation over: the boat turns around and he rows away
}
function storyBack() {
  if (story.phase !== "talk" || story.step === 0 || (story.choice && story.step === STORY_PRE.length)) return;
  story.step--; story.chars = 9999; renderStory();
}
function storyChoose(c) {
  story.choice = c;
  state.story.seen = true;                 // only ever happens once
  if (c === "yes") state.story.deal = true;
  save(); Snd.chime();
  story.step = STORY_PRE.length; story.chars = 0; renderStory();
}

function updateStory(dt) {
  if (!story.active) return;
  if (story.phase === "arrive") {
    story.boatX -= 420 * dt; // rows in fast
    if (story.boatX <= 430) { story.boatX = 430; story.phase = "talk"; story.step = 0; story.chars = 0; storyDom(); sEl.root.hidden = false; renderStory(); }
  } else if (story.phase === "talk") {
    const line = storyLine();
    if (story.chars < line.t.length) { const before = Math.floor(story.chars); story.chars += dt * 48; if (Math.floor(story.chars) !== before) renderStory(); }
    else renderStory();
    // keep the bubble tail pinned to the boat
  } else if (story.phase === "leave") {
    story.turn = Math.min(1, story.turn + dt / 0.9);           // swing the boat around first...
    if (story.turn > 0.55) story.boatX += 190 * dt;            // ...then row away
    if (story.boatX > W + 200) { story.active = false; story.phase = ""; state.story.seen = true; save(); if (typeof refreshModal === "function") refreshModal(); }
  }
}

window.addEventListener("keydown", e => {
  if (!story.active || story.phase !== "talk") return;
  if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") { e.preventDefault(); storyNext(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); storyBack(); }
});

// ---------- drawing (scene space: old x runs away from the dock) ----------
function drawVisitor() {
  if (!story.active) return;
  const x = story.boatX, bob = Math.sin(g.t * 1.6) * 2, y = WATER_Y + bob;
  const talking = story.phase === "talk" && storyLine() && storyLine().w === "salty" && story.chars < storyLine().t.length;
  // arriving he faces the dock; when he leaves the boat swings around to face the open water
  const e = story.turn * story.turn * (3 - 2 * story.turn), face = 1 - 2 * e;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(g.t * 1.3) * 0.02); ctx.scale(face, 1);
  // little green boat, bow toward the dock
  ink(4); ctx.fillStyle = "#2f8f7a"; ctx.beginPath(); ctx.moveTo(-74, -14); ctx.lineTo(62, -6); ctx.lineTo(46, 20); ctx.lineTo(-52, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4f4f4"; ctx.fillRect(-66, -4, 112, 6); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-66, -4, 112, 6);
  ctx.fillStyle = "#e8c98a"; ink(3); ctx.fillRect(-68, -16, 124, 6); ctx.strokeRect(-68, -16, 124, 6);
  // lantern on a pole at the bow
  ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-62, -14); ctx.lineTo(-62, -62); ctx.stroke();
  ctx.fillStyle = "#ffe066"; ink(3); ctx.beginPath(); ctx.roundRect(-70, -80, 16, 20, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.fillRect(-72, -84, 20, 4);
  // fish crate at the stern
  ctx.fillStyle = "#a0703a"; ink(3); ctx.fillRect(28, -34, 30, 20); ctx.strokeRect(28, -34, 30, 20);
  ctx.strokeStyle = "rgba(60,30,10,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(28, -24); ctx.lineTo(58, -24); ctx.stroke();
  ctx.fillStyle = "#ff8fab"; ink(2.5); ctx.beginPath(); ctx.ellipse(40, -36, 10, 4, -0.3, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(49, -37); ctx.lineTo(56, -42); ctx.lineTo(55, -33); ctx.closePath(); ctx.fill(); ctx.stroke();

  // the new Old Salty: yellow rain slicker, sou'wester hat, bushy grey beard
  const bx = 4, feet = -14, hip = feet - 34, neck = feet - 76;
  ctx.strokeStyle = "#111"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(bx, hip); ctx.lineTo(bx - 12, feet); ctx.moveTo(bx, hip); ctx.lineTo(bx + 14, feet); ctx.stroke();
  ctx.fillStyle = "#3a3f52"; ink(3); for (const fx of [bx - 12, bx + 14]) { ctx.beginPath(); ctx.roundRect(fx - 7, feet - 8, 17, 9, 3); ctx.fill(); ctx.stroke(); } // boots
  // arms: one waves when he talks, one holds the oar
  ctx.strokeStyle = "#111"; ctx.lineWidth = 7;
  const wave = talking ? Math.sin(g.t * 9) * 9 : 0;
  ctx.beginPath(); ctx.moveTo(bx, neck + 8); ctx.lineTo(bx - 20, neck + 22); ctx.lineTo(bx - 32, neck + 8 + wave); ctx.moveTo(bx, neck + 8); ctx.lineTo(bx + 18, neck + 26); ctx.lineTo(bx + 32, neck + 32); ctx.stroke();
  ctx.strokeStyle = "#7a4a1d"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx + 32, neck + 32); ctx.lineTo(bx + 62, neck + 74); ctx.stroke(); // oar
  ctx.fillStyle = "#a0703a"; ink(3); ctx.beginPath(); ctx.ellipse(bx + 64, neck + 78, 6, 14, -0.5, 0, 7); ctx.fill(); ctx.stroke();
  // slicker
  ctx.fillStyle = "#ffc61a"; ink(3.5); ctx.beginPath(); ctx.moveTo(bx - 15, neck + 4); ctx.lineTo(bx + 15, neck + 4); ctx.lineTo(bx + 20, hip + 14); ctx.lineTo(bx - 20, hip + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(120,80,0,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, neck + 6); ctx.lineTo(bx, hip + 14); ctx.stroke();
  ctx.fillStyle = "#6b4423"; for (const k of [0.25, 0.5, 0.75]) { ctx.beginPath(); ctx.arc(bx - 4, neck + 6 + (hip + 14 - neck - 6) * k, 2.4, 0, 7); ctx.fill(); }
  ctx.fillStyle = "#e6a800"; ctx.fillRect(bx + 6, hip - 6, 10, 9); ctx.strokeRect(bx + 6, hip - 6, 10, 9); // pocket
  // head
  const hy = neck - 16 + (talking ? Math.sin(g.t * 12) * 1.5 : 0);
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(bx, hy, 17, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(bx - 7, hy - 2, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(bx - 9, hy - 2, 2, 0, 7); ctx.fill();
  ctx.strokeStyle = "#e8e8e8"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(bx - 13, hy - 9); ctx.lineTo(bx - 3, hy - 7); ctx.stroke(); // bushy brow
  // beard + moustache
  ctx.fillStyle = "#cfd3da"; ink(2.5); ctx.beginPath(); ctx.moveTo(bx - 17, hy + 2); ctx.quadraticCurveTo(bx - 12, hy + 40, bx + 6, hy + 30); ctx.quadraticCurveTo(bx + 16, hy + 14, bx + 14, hy + 2); ctx.quadraticCurveTo(bx - 2, hy + 12, bx - 17, hy + 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(bx - 14, hy + 5, 8, 3.5, 0.15, 0, 7); ctx.fill(); ctx.stroke();
  // pipe
  ctx.strokeStyle = "#6b4423"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 10, hy + 9); ctx.lineTo(bx - 26, hy + 12); ctx.stroke(); ctx.fillStyle = "#4a2c1c"; ctx.beginPath(); ctx.roundRect(bx - 32, hy + 4, 8, 11, 2); ctx.fill();
  // sou'wester: yellow dome with a long brim at the back
  ctx.fillStyle = "#ffc61a"; ink(3.5);
  ctx.beginPath(); ctx.arc(bx, hy - 3, 19, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 20, hy - 6); ctx.quadraticCurveTo(bx - 4, hy - 12, bx + 22, hy - 4); ctx.quadraticCurveTo(bx + 34, hy + 8, bx + 26, hy + 24); ctx.quadraticCurveTo(bx + 14, hy + 2, bx - 20, hy - 6); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#e6a800"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 17, hy - 12); ctx.quadraticCurveTo(bx, hy - 19, bx + 17, hy - 12); ctx.stroke();
  ctx.restore();
}
