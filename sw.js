"use strict";
// Lets the game work offline: it loads from the network when it can (so updates show up) and from the cache when you are offline.
const CACHE = "pwr-fishing-v" + 1789959352;
const FILES = ["./", "index.html", "style.css", "icon.svg", "manifest.webmanifest", "audio.js", "extra.js", "fun.js", "game.js", "items.js", "items2.js", "items3.js", "items4.js", "junk.js", "license.js", "maps.js", "maps2.js", "maps3.js", "more.js", "ocean.js", "ranks.js", "rewards.js", "start.js", "story.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => { if (e.request.method !== "GET") return; e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request))); }); // network first (always the newest game), the cache is only for when you are offline
