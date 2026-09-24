"use strict";
// A one-time, dismissible nudge on iPhone/iPad Safari: "Add to Home Screen" turns this into a real app icon.
// iOS Safari doesn't show its own install prompt like Android does, so most people never find the Share-sheet
// option unless someone points it out. Loaded before game.js; only touches the DOM and localStorage.

const A2HS_KEY = "pwrfisher_a2hs_v1";

function isIosSafari() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS reports as a Mac, but has touch
  if (!iOS) return false;
  if (window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)) return false; // already installed
  if (/CriOS|FxiOS|EdgiOS|OPiOS|mercury|GSA|FBAN|FBAV|Instagram/.test(ua)) return false; // Chrome/Firefox/Edge/in-app browsers on iOS: the steps differ or Add to Home Screen isn't offered the same way
  return true;
}

function showAddToHome() {
  try { if (localStorage.getItem(A2HS_KEY)) return; } catch (e) {}
  if (!isIosSafari()) return;

  const el = document.createElement("div"); el.className = "a2hs";
  el.innerHTML = `
    <svg class="a2hsIcon" viewBox="0 0 24 24" fill="none" stroke="#2b6ad8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v12"></path><path d="M8 7l4-4 4 4"></path>
      <rect x="4" y="11" width="16" height="10" rx="2"></rect>
    </svg>
    <div class="a2hsText">Play this like a real app! Tap the <b>Share</b> button below, then <b>"Add to Home Screen"</b>.</div>
    <button class="a2hsClose" aria-label="Dismiss">&times;</button>`;
  document.body.appendChild(el);

  const dismiss = () => { el.classList.add("a2hsOut"); setTimeout(() => el.remove(), 300); try { localStorage.setItem(A2HS_KEY, "1"); } catch (e) {} };
  el.querySelector(".a2hsClose").onclick = dismiss;
  setTimeout(dismiss, 15000); // it goes away on its own too, so it never sticks around and gets in the way
  requestAnimationFrame(() => el.classList.add("a2hsIn"));
}

window.addEventListener("load", () => setTimeout(showAddToHome, 3500));
