"use strict";
// A shareable "catch card" — a nice standalone picture of one fish you caught, to save or send to a friend.
// Loaded before game.js (only defines things). Uses INK, ol(), star(), RARITIES, FISH, drawFish, F, fmt, toast, Snd at call time.

function shareCard(fishName) {
  const f = FISH.find(x => x.name === fishName); if (!f) return;
  const n = state.caught[f.name] || 0; if (!n) return; // can only share a fish you actually have
  const R = RARITIES[f.rarity], shiny = (state.shiny && state.shiny[f.name]) || 0;
  const rec = (typeof F === "function" && F().records && F().records[f.name]) || null;
  const cm = rec ? rec.cm : Math.round(f.len * 0.9);

  const w = 640, h = 800, c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");

  // background: a soft gradient in the fish's own rarity colour
  const bg = x.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#eaf6ff"); bg.addColorStop(0.55, "#dff0ff"); bg.addColorStop(1, "#c9e8ff");
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  // a glow behind the fish in the rarity colour
  const glow = x.createRadialGradient(w / 2, 430, 40, w / 2, 430, 340);
  glow.addColorStop(0, R.col + "55"); glow.addColorStop(1, R.col + "00");
  x.fillStyle = glow; x.fillRect(0, 120, w, 620);
  // sparkle rays for rare+ catches
  if (f.rarity >= 3 || shiny) {
    x.save(); x.globalAlpha = 0.5; x.strokeStyle = R.col; x.lineWidth = 3;
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * 120, 430 + Math.sin(a) * 120); x.lineTo(w / 2 + Math.cos(a) * 300, 430 + Math.sin(a) * 300); x.stroke(); }
    x.restore();
  }

  // frame
  x.strokeStyle = INK; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  x.strokeStyle = R.col; x.lineWidth = 5; x.strokeRect(18, 18, w - 36, h - 36);

  // title
  x.textAlign = "center"; x.fillStyle = INK; x.font = "42px Bangers, Impact, sans-serif";
  x.fillText("PWR FISHING", w / 2, 76);
  x.font = "22px Bangers, Impact, sans-serif"; x.fillStyle = "#5a6b7a";
  x.fillText("MY CATCH", w / 2, 108);

  // the fish itself, nice and big, centred
  x.save();
  const fscale = clamp(300 / (f.len || 200), 0.55, 3.2);
  x.translate(w / 2, 430);
  x.scale(fscale, fscale);
  drawFish(x, 0, 0, f, f.len, 1, { silhouette: false });
  x.restore();
  if (shiny) { x.save(); x.font = "34px Bangers, Impact, sans-serif"; x.fillStyle = "#ffd23f"; x.strokeStyle = INK; x.lineWidth = 5; x.strokeText("★ SHINY ★", w / 2, 250); x.fillText("★ SHINY ★", w / 2, 250); x.restore(); }

  // fish name
  x.font = "58px Bangers, Impact, sans-serif"; x.lineWidth = 8; x.strokeStyle = INK; x.fillStyle = "#fff";
  x.strokeText(f.name, w / 2, 600); x.fillText(f.name, w / 2, 600);

  // rarity badge
  const badgeW = R.name.length * 20 + 50;
  x.fillStyle = R.col; ol(x, 4); x.beginPath(); x.roundRect(w / 2 - badgeW / 2, 622, badgeW, 46, 22); x.fill(); x.stroke();
  x.fillStyle = "#fff"; x.font = "26px Bangers, Impact, sans-serif"; x.fillText(R.name.toUpperCase(), w / 2, 653);

  // stats row
  x.font = "24px Bangers, Impact, sans-serif"; x.fillStyle = INK;
  const stats = [`WORTH ${fmt(f.value)}`, `${cm} CM LONG`, `CAUGHT x${n}`];
  x.fillText(stats.join("     •     "), w / 2, 706);

  // footer
  x.font = "20px Bangers, Impact, sans-serif"; x.fillStyle = "#5a6b7a";
  x.fillText("play free at pwr-fisher.pages.dev", w / 2, 760);

  c.toBlob(b => {
    const a = document.createElement("a"); a.download = "pwr-fishing-" + f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
    a.href = URL.createObjectURL(b); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
  toast("Catch card saved!", "#c8f7c5"); if (typeof Snd !== "undefined") Snd.chime();
}
