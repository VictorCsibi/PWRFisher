"use strict";
// Junk: no matter how good your rod is, now and then you reel up something that is not a fish.
// Loaded before game.js. Uses INK at call time.

const JUNK_CHANCE = 0.14; // per bite, the same for every rod, line and bait
const JUNK = [
  { name: "Old Boot",       kind: "boot",     len: 46, ry: 0.32, size: 1, value: 1, junk: true },
  { name: "Tin Can",        kind: "can",      len: 40, ry: 0.3,  size: 1, value: 1, junk: true },
  { name: "Seaweed Clump",  kind: "seaweed",  len: 50, ry: 0.28, size: 1, value: 1, junk: true },
  { name: "Empty Bottle",   kind: "bottle",   len: 46, ry: 0.28, size: 1, value: 2, junk: true },
  { name: "Soggy Sock",     kind: "sock",     len: 44, ry: 0.3,  size: 1, value: 1, junk: true },
  { name: "Old Tire",       kind: "tire",     len: 54, ry: 0.4,  size: 1, value: 2, junk: true },
];
const pickJunk = () => JUNK[Math.floor(Math.random() * JUNK.length)];

// centre-origin drawing, roughly `len` px wide
function drawJunk(c, x, y, j, len, dir = 1) {
  const s = len / 46;
  c.save(); c.translate(x, y); c.scale(dir * s, s);
  c.lineWidth = 3; c.strokeStyle = INK; c.lineJoin = "round"; c.lineCap = "round";
  switch (j.kind) {
    case "boot":
      c.fillStyle = "#8a5a2b"; c.beginPath(); c.moveTo(-10, -20); c.lineTo(8, -20); c.lineTo(8, 0); c.quadraticCurveTo(24, 2, 27, 12); c.lineTo(27, 20); c.lineTo(-11, 20); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = "#3a2410"; c.beginPath(); c.roundRect(-11, 14, 38, 8, 3); c.fill(); c.stroke();
      c.fillStyle = "#b07a44"; c.fillRect(-10, -20, 18, 6); c.strokeRect(-10, -20, 18, 6);
      c.lineWidth = 2; c.beginPath(); for (const k of [-8, -1, 6]) { c.moveTo(-6, k); c.lineTo(5, k + 2); } c.stroke();
      c.fillStyle = "#3a2410"; c.beginPath(); c.arc(18, 9, 2.5, 0, 7); c.fill(); // a hole
      c.strokeStyle = "#3f9a4a"; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -14); c.quadraticCurveTo(-20, -6, -14, 6); c.stroke(); // seaweed on it
      break;
    case "can":
      c.fillStyle = "#b8c0cc"; c.beginPath(); c.rect(-13, -14, 26, 32); c.fill(); c.stroke();
      c.fillStyle = "#d94a3a"; c.fillRect(-13, -3, 26, 12); c.strokeRect(-13, -3, 26, 12);
      c.fillStyle = "#8c96a4"; c.beginPath(); c.ellipse(0, -14, 13, 5, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = "#5a6270"; c.beginPath(); c.ellipse(1, -14, 7, 2.5, 0, 0, 7); c.fill();
      c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, 12); c.lineTo(-3, 16); c.stroke();
      break;
    case "seaweed":
      for (const [col, w] of [[INK, 9], ["#2fa04a", 5]]) {
        c.strokeStyle = col; c.lineWidth = w; c.beginPath();
        c.moveTo(-18, 14); c.bezierCurveTo(-24, -6, -8, -10, -10, -20); c.moveTo(-4, 16); c.bezierCurveTo(-12, 0, 8, -6, 2, -22);
        c.moveTo(10, 16); c.bezierCurveTo(0, 2, 20, -4, 14, -18); c.moveTo(22, 14); c.bezierCurveTo(14, 4, 30, -2, 26, -12); c.stroke();
      }
      break;
    case "bottle":
      c.fillStyle = "rgba(90,200,120,.75)"; c.beginPath(); c.roundRect(-10, -6, 20, 28, 5); c.fill(); c.stroke();
      c.beginPath(); c.roundRect(-4.5, -22, 9, 18, 3); c.fill(); c.stroke();
      c.fillStyle = "#a0703a"; c.beginPath(); c.roundRect(-5.5, -26, 11, 6, 2); c.fill(); c.stroke();
      c.fillStyle = "#fff"; c.fillRect(-10, 2, 20, 10); c.strokeRect(-10, 2, 20, 10);
      c.strokeStyle = "#d94a3a"; c.lineWidth = 2; c.beginPath(); c.moveTo(-6, 7); c.lineTo(6, 7); c.stroke();
      break;
    case "sock":
      c.fillStyle = "#f4f4f4"; c.beginPath(); c.moveTo(-10, -20); c.lineTo(6, -20); c.lineTo(6, 4); c.quadraticCurveTo(26, 4, 26, 16); c.quadraticCurveTo(26, 22, 18, 22); c.lineTo(-8, 22); c.quadraticCurveTo(-10, 22, -10, 14); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = "#d94a3a"; for (const k of [-16, -8]) { c.fillRect(-10, k, 16, 4); }
      c.fillStyle = "rgba(60,120,60,.6)"; c.beginPath(); c.arc(14, 14, 4, 0, 7); c.fill(); // slime
      break;
    case "tire":
      c.fillStyle = "#3a3f4a"; c.beginPath(); c.ellipse(0, 0, 25, 22, 0, 0, 7); c.fill(); c.stroke();
      c.fillStyle = "#1d2029"; c.beginPath(); c.ellipse(0, 0, 11, 9, 0, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = "#5a6070"; c.lineWidth = 2; c.beginPath(); for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; c.moveTo(Math.cos(an) * 16, Math.sin(an) * 14); c.lineTo(Math.cos(an) * 23, Math.sin(an) * 20); } c.stroke();
      break;
  }
  c.restore();
}
