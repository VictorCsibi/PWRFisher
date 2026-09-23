"use strict";
// Fishing license: get one at the start and renew it every 50 casts. A clickable warning tells you when it is running out.
// If it expires and you do not renew in time, the ranger confiscates your fishing GEAR (your money is safe).
// Loaded before game.js. Uses state, settings, g, story, Snd, save, fmt, clamp, INK, ol, CATS at call time.

const LICENSE_CASTS = 50;   // casts a license is valid for
const LICENSE_GRACE = 20;   // seconds you have to renew once it has expired
const JAIL_KEY = "pwrfisher_jail_v1";
const GEAR_CATS = ["rod", "line", "bait", "bucket", "chair", "strength"];

const lic = { open: false, kind: "", left: 0, warned: 0, expired: false };
const jail = { open: false };

const licenseOn = () => settings.license !== false;
const licenseBlocked = () => lic.open || jail.open || lic.expired; // fishing is paused while any of these are up
const licenseFee = () => Math.min(state.money, Math.round(Math.max(20, Math.min(2500, state.money * 0.03))));
const castsLeft = () => Math.max(0, LICENSE_CASTS - (state.license.casts || 0));
const jailCount = () => { try { return parseInt(localStorage.getItem(JAIL_KEY) || "0", 10) || 0; } catch (e) { return 0; } };

const L = {};
function licDom() {
  if (L.root) return;
  L.root = document.getElementById("license"); L.title = document.getElementById("licTitle"); L.card = document.getElementById("licCard"); L.text = document.getElementById("licText");
  L.timerWrap = document.getElementById("licTimerWrap"); L.timer = document.getElementById("licTimer"); L.timerText = document.getElementById("licTimerText"); L.btn = document.getElementById("licBtn");
  L.jail = document.getElementById("jail"); L.jailCard = document.getElementById("jailCard"); L.jailText = document.getElementById("jailText"); L.jailBtn = document.getElementById("jailBtn");
  L.warn = document.getElementById("licWarn");
  L.btn.onclick = licenseButton; L.jailBtn.onclick = leaveJail; L.warn.onclick = renewLicense;
}

// the office (only for getting your very first license)
function openLicense() {
  licDom();
  if (typeof closeModal === "function") closeModal();
  lic.open = true; lic.kind = "get";
  L.title.textContent = "FISHING LICENSE OFFICE";
  L.text.innerHTML = "Welcome! You need a <b>fishing license</b> to fish here. It is valid for <b>" + LICENSE_CASTS + " casts</b>. A warning will pop up when it is running out: <b>click it to renew</b>. If it expires and you don't renew in time, the ranger will take your <b>fishing gear</b> (you keep your money).";
  L.btn.textContent = "GET MY LICENSE (FREE)"; L.timerWrap.hidden = true; drawLicenseCard(L.card.getContext("2d"), "new");
  L.root.hidden = false;
}
function closeLicense() { lic.open = false; if (L.root) L.root.hidden = true; }

function licenseButton() {
  state.license.has = true; state.license.casts = 0; lic.warned = 0; lic.expired = false; save(); Snd.chime(); closeLicense();
  g.banner = { text: "LICENSE GRANTED!", sub: "Valid for " + LICENSE_CASTS + " casts", life: 2.6, color: "#c8f7c5", subColor: "#fff" };
}
function renewLicense() {
  if (jail.open || !state.license.has) return;
  const fee = licenseFee(); state.money -= fee; state.license.casts = 0; lic.warned = 0; lic.expired = false; save(); Snd.buy();
  if (L.warn) L.warn.hidden = true;
  g.banner = { text: "LICENSE RENEWED!", sub: "Valid for " + LICENSE_CASTS + " more casts  -  paid " + fmt(fee), life: 2.6, color: "#c8f7c5", subColor: "#fff" };
  if (typeof refreshModal === "function") refreshModal();
}

// every frame
function updateLicense(dt) {
  licDom();
  if (!licenseOn()) { if (lic.open) closeLicense(); lic.expired = false; L.warn.hidden = true; return; }
  if (jail.open) { L.warn.hidden = true; return; }
  if (lic.open) { L.warn.hidden = true; return; }
  if (story.active) { L.warn.hidden = true; return; }
  if (!state.license.has) { openLicense(); return; }

  const left = castsLeft(), fee = licenseFee();
  if (!lic.expired && left <= 0 && g.mode === "idle") { lic.expired = true; lic.left = LICENSE_GRACE; Snd.snap(); } // fishing pauses until you renew

  if (lic.expired) {
    lic.left -= dt;
    L.warn.className = "licwarn red"; L.warn.hidden = false;
    L.warn.textContent = "LICENSE EXPIRED! CLICK TO RENEW (" + fmt(fee) + ") - the ranger comes in " + Math.ceil(Math.max(0, lic.left)) + "s";
    if (lic.left <= 0) goToJail();
    return;
  }
  if (left <= 10) {
    L.warn.className = "licwarn" + (left <= 3 ? " red" : ""); L.warn.hidden = false;
    L.warn.textContent = "LICENSE EXPIRES IN " + left + " CASTS - CLICK TO RENEW (" + fmt(fee) + ")";
    if (lic.warned < 1) { lic.warned = 1; Snd.rewardReady(); }
  } else L.warn.hidden = true;
}

// the ranger takes your fishing gear, but never your money
function goToJail() {
  lic.expired = false; L.warn.hidden = true;
  for (const cat of GEAR_CATS) { state.owned[cat] = [1]; state.equipped[cat] = 1; }
  state.license.has = false; state.license.casts = 0; state.lineUses = 0;
  g.fish = null; g.mode = "idle"; g.timer = 0; g.escape = null;
  save();
  try { localStorage.setItem(JAIL_KEY, String(jailCount() + 1)); } catch (e) {}
  jail.open = true;
  drawJailScene(L.jailCard.getContext("2d"));
  L.jailText.innerHTML = "The ranger caught you fishing <b>without a license</b>! Your <b>fishing gear</b> (rod, line, bait, bucket, chair and food) was confiscated.<br>Your <b>money</b>, fish and maps are safe.<br>Times arrested: <b>" + jailCount() + "</b>";
  L.jail.hidden = false; Snd.catchBad();
  if (typeof refreshModal === "function") refreshModal();
}
function leaveJail() { jail.open = false; L.jail.hidden = true; save(); } // then the license office asks you to get a new license

// ---------- pictures ----------
function drawLicenseCard(c, status) {
  c.clearRect(0, 0, 320, 190); ol(c, 4);
  c.fillStyle = "#f8f4e0"; c.beginPath(); c.roundRect(4, 4, 312, 182, 14); c.fill(); c.stroke();
  c.fillStyle = "#2b6ad8"; c.fillRect(8, 8, 304, 36);
  c.fillStyle = "#fff"; c.font = "26px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FISHING LICENSE", 160, 27);
  c.fillStyle = "#cfe8ff"; ol(c, 3); c.fillRect(20, 58, 82, 96); c.strokeRect(20, 58, 82, 96);
  c.fillStyle = "#111"; c.beginPath(); c.arc(61, 110, 22, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(70, 106, 5, 0, 7); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(72, 106, 2.4, 0, 7); c.fill();
  c.fillStyle = "#ffd23f"; ol(c, 3); c.beginPath(); c.ellipse(61, 90, 30, 7, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(47, 89); c.quadraticCurveTo(61, 62, 75, 89); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = INK; c.textAlign = "left"; c.font = "20px Bangers, Impact, sans-serif";
  c.fillText("NAME: ANGLER", 116, 72); c.fillText("VALID: " + LICENSE_CASTS + " CASTS", 116, 98); c.fillText(status === "expired" ? "STATUS: EXPIRED" : "STATUS: " + (status === "new" ? "NEW" : "VALID"), 116, 124);
  for (let i = 0; i < 26; i++) { c.fillStyle = INK; c.fillRect(116 + i * 7, 138, 2 + (i * 5) % 4, 30); }
  c.save(); c.translate(230, 150); c.rotate(-0.35); c.font = "30px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.lineWidth = 4; c.strokeStyle = status === "expired" ? "#e23a3a" : "#2fa04a";
  c.strokeRect(-62, -20, 124, 40); c.fillStyle = status === "expired" ? "#e23a3a" : "#2fa04a"; c.fillText(status === "expired" ? "EXPIRED" : "APPROVED", 0, 2); c.restore();
}
function drawJailScene(c) {
  c.clearRect(0, 0, 320, 200);
  c.fillStyle = "#6a6f7a"; c.fillRect(0, 0, 320, 200);
  c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 2;
  for (let y = 0; y < 200; y += 20) { c.beginPath(); c.moveTo(0, y); c.lineTo(320, y); c.stroke(); for (let x = (y / 20) % 2 ? 0 : 20; x < 320; x += 40) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20); c.stroke(); } }
  c.fillStyle = "#1d2230"; c.fillRect(226, 26, 60, 50); ol(c, 4); c.strokeRect(226, 26, 60, 50);
  c.fillStyle = "#8ab4ff"; c.beginPath(); c.arc(256, 46, 9, 0, 7); c.fill();
  c.strokeStyle = "#111"; c.lineWidth = 8; c.lineCap = "round"; c.beginPath(); c.moveTo(150, 150); c.lineTo(178, 150); c.lineTo(178, 182); c.moveTo(150, 150); c.lineTo(150, 100); c.moveTo(150, 116); c.lineTo(174, 132); c.stroke();
  c.fillStyle = "#fff"; c.fillRect(140, 104, 22, 46); c.fillStyle = "#111"; for (let y = 106; y < 150; y += 10) c.fillRect(140, y, 22, 5);
  c.fillStyle = "#111"; c.beginPath(); c.arc(150, 84, 18, 0, 7); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(158, 82, 4, 0, 7); c.fill();
  c.fillStyle = "#111"; c.beginPath(); c.arc(140, 186, 12, 0, 7); c.fill(); c.strokeStyle = "#111"; c.lineWidth = 4; c.beginPath(); c.moveTo(150, 176); c.lineTo(146, 182); c.stroke();
  c.lineWidth = 8; c.strokeStyle = "#2a2f3c"; for (let x = 20; x < 320; x += 44) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 200); c.stroke(); }
  c.beginPath(); c.moveTo(0, 30); c.lineTo(320, 30); c.moveTo(0, 170); c.lineTo(320, 170); c.stroke();
  c.fillStyle = "#ffd23f"; ol(c, 3); c.fillRect(100, 6, 120, 26); c.strokeRect(100, 6, 120, 26); c.fillStyle = INK; c.font = "22px Bangers, Impact, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("JAIL", 160, 20);
}
