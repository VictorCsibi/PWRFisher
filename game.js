"use strict";

// ---------- Config ----------
// World is 1280 wide; its height follows the window so the game fills the whole screen (see layout()).
const W = 1280;
let H = 720, WATER_Y = 260, DECK_Y = 250;
const INK = "#1b1b2f";
const SAVE_KEY = "pwrfisher_save_v1";
const BUCKET_X = 46;
const DAY_SECONDS = 240; // one full day/night cycle

// The scene is authored with the dock on the LEFT and mirrored when drawn, so the dock ends up on the right.
// size   = biggest-fish tier: needs Line tier+1 >= size to land it, Bucket tier+1 >= size to keep it
// minDist = how far/deep you must cast (0..1) to find it
const FISH = [
  { name: "Minnow",      size: 1,  minDist: 0.0,  weight: 50, value: 5,    color: "#9bd4ff", len: 34,  ry: 0.17, pointy: 0.1,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Sardine",     size: 1,  minDist: 0.0,  weight: 40, value: 8,    color: "#c9d6e2", len: 48,  ry: 0.13, pointy: 0.4,  tail: "fork",  dorsal: "soft",   deco: "dots",    mouth: "small" },
  { name: "Perch",       size: 2,  minDist: 0.0,  weight: 35, value: 15,   color: "#ffb84d", len: 58,  ry: 0.27, pointy: 0.15, tail: "fan",   dorsal: "spikes", deco: "stripes", mouth: "small" },
  { name: "Bluegill",    size: 2,  minDist: 0.1,  weight: 30, value: 20,   color: "#4ecdc4", len: 64,  ry: 0.40, pointy: 0.0,  tail: "round", dorsal: "soft",   deco: "ear",     mouth: "small", finScale: 1.3 },
  { name: "Clownfish",   size: 2,  minDist: 0.05, weight: 26, value: 25,   color: "#ff8a1f", len: 46,  ry: 0.28, pointy: 0.1,  tail: "round", dorsal: "soft",   deco: "clown",   mouth: "small" },
  { name: "Seahorse",    size: 3,  minDist: 0.15, weight: 14, value: 55,   color: "#ffb84d", len: 66,  ry: 0.45, special: "seahorse" },
  { name: "Flounder",    size: 3,  minDist: 0.2,  weight: 20, value: 40,   color: "#c9a66b", len: 84,  ry: 0.34, pointy: 0.25, tail: "round", dorsal: "none",   deco: "blotch",  mouth: "small", eyeY: 0.4, eyeX: 0.45 },
  { name: "Trout",       size: 3,  minDist: 0.2,  weight: 22, value: 35,   color: "#ff8fab", len: 80,  ry: 0.21, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small" },
  { name: "Bass",        size: 4,  minDist: 0.3,  weight: 16, value: 60,   color: "#7bd94f", len: 94,  ry: 0.26, pointy: 0.1,  tail: "fan",   dorsal: "spikes", deco: "lateral", mouth: "wide" },
  { name: "Pufferfish",  size: 4,  minDist: 0.3,  weight: 14, value: 75,   color: "#ffe08a", len: 66,  ry: 0.42, special: "puffer" },
  { name: "Jellyfish",   size: 4,  minDist: 0.35, weight: 14, value: 90,   color: "#ff8fc8", len: 74,  ry: 0.32, special: "jelly" },
  { name: "Golden Fish", size: 4,  minDist: 0.5,  weight: 2,  value: 600,  color: "#ffd23f", len: 72,  ry: 0.30, pointy: 0.0,  tail: "fan",   dorsal: "sail",   deco: "shine",   mouth: "small", tailLen: 0.38, tailH: 1.5, sparkle: true },
  { name: "Salmon",      size: 5,  minDist: 0.4,  weight: 12, value: 100,  color: "#ff6f59", len: 106, ry: 0.20, pointy: 0.45, tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small" },
  { name: "Eel",         size: 5,  minDist: 0.45, weight: 10, value: 140,  color: "#6b8e4e", len: 150, ry: 0.08, special: "eel" },
  { name: "Catfish",     size: 6,  minDist: 0.5,  weight: 8,  value: 150,  color: "#a68a6d", len: 120, ry: 0.23, pointy: 0.0,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  { name: "Octopus",     size: 6,  minDist: 0.55, weight: 8,  value: 210,  color: "#c75bff", len: 100, ry: 0.30, special: "octopus" },
  { name: "Tuna",        size: 7,  minDist: 0.6,  weight: 6,  value: 250,  color: "#4d7cff", len: 134, ry: 0.24, pointy: 0.6,  tail: "fork",  dorsal: "soft",   deco: "tuna",    mouth: "small", tailH: 1.4 },
  { name: "Anglerfish",  size: 7,  minDist: 0.75, weight: 4,  value: 320,  color: "#4a3a7a", len: 110, ry: 0.36, special: "angler" },
  { name: "Manta Ray",   size: 8,  minDist: 0.65, weight: 4,  value: 380,  color: "#3b4a78", len: 200, ry: 0.10, special: "ray" },
  { name: "Swordfish",   size: 8,  minDist: 0.7,  weight: 4,  value: 400,  color: "#7c5cff", len: 165, ry: 0.16, pointy: 0.8,  tail: "fork",  dorsal: "sail",   deco: "tuna",    mouth: "none",  bill: true, tailH: 1.5 },
  { name: "Shark",       size: 9,  minDist: 0.8,  weight: 2,  value: 800,  color: "#8fa3b8", len: 185, ry: 0.20, pointy: 0.75, tail: "shark", dorsal: "tri",    deco: "shark",   mouth: "shark", tailH: 1.1 },
  { name: "Giant Whale", size: 10, minDist: 0.9,  weight: 1,  value: 1500, color: "#3d5a9e", len: 215, ry: 0.33, pointy: 0.15, tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3 },

  // ---- Sunny Bay extras ----
  { name: "Parrotfish",    size: 4,  minDist: 0.35, weight: 7,   value: 130,  color: "#3ddc97", len: 84,  ry: 0.27, pointy: 0.05, tail: "fan",   dorsal: "soft",   deco: "stripes", mouth: "wide" },
  { name: "Lionfish",      size: 4,  minDist: 0.4,  weight: 3.5, value: 340,  color: "#e8503a", len: 70,  ry: 0.27, pointy: 0.15, tail: "fan",   dorsal: "spikes", deco: "stripes", mouth: "small", tailLen: 0.32 },
  { name: "Moonfish",      size: 5,  minDist: 0.5,  weight: 3.5, value: 520,  color: "#9bb7ff", len: 100, ry: 0.46, pointy: 0.0,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small", finScale: 1.5 },
  { name: "Sea Dragon",    size: 6,  minDist: 0.55, weight: 0.6, value: 2600, color: "#7dffb0", len: 90,  ry: 0.45, special: "seahorse" },
  // ---- Cabin Lake ----
  { name: "Koi",           size: 3,  minDist: 0.15, weight: 9,   value: 90,   color: "#ffffff", len: 80,  ry: 0.22, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "koi",     mouth: "small" },
  { name: "Walleye",       size: 3,  minDist: 0.2,  weight: 14,  value: 55,   color: "#c7b86a", len: 76,  ry: 0.20, pointy: 0.4,  tail: "fork",  dorsal: "spikes", deco: "lateral", mouth: "wide" },
  { name: "Pike",          size: 4,  minDist: 0.3,  weight: 9,   value: 110,  color: "#4c9a4e", len: 110, ry: 0.13, pointy: 0.7,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "wide" },
  { name: "Muskie",        size: 7,  minDist: 0.6,  weight: 4,   value: 380,  color: "#3f7d5a", len: 160, ry: 0.14, pointy: 0.7,  tail: "fork",  dorsal: "soft",   deco: "stripes", mouth: "wide" },
  { name: "Sturgeon",      size: 8,  minDist: 0.7,  weight: 3.5, value: 520,  color: "#7a7f8a", len: 170, ry: 0.17, pointy: 0.55, tail: "shark", dorsal: "spikes", deco: "blotch",  mouth: "cat", tailH: 1.1 },
  { name: "Golden Koi",    size: 9,  minDist: 0.8,  weight: 1.6, value: 1600, color: "#ffd23f", len: 120, ry: 0.24, pointy: 0.3,  tail: "fan",   dorsal: "soft",   deco: "shine",   mouth: "small", tailLen: 0.35, tailH: 1.4, sparkle: true },
  { name: "Lake Serpent",  size: 10, minDist: 0.9,  weight: 0.5, value: 4200, color: "#2f9e6f", len: 260, ry: 0.07, special: "eel", band: "#8fe0b8" },
  // ---- Frozen Sea ----
  { name: "Arctic Char",   size: 2,  minDist: 0.05, weight: 30,  value: 22,   color: "#9fd3ff", len: 62,  ry: 0.20, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small" },
  { name: "Cod",           size: 3,  minDist: 0.15, weight: 24,  value: 34,   color: "#8a9a7a", len: 86,  ry: 0.24, pointy: 0.2,  tail: "round", dorsal: "soft",   deco: "spots",   mouth: "cat" },
  { name: "Frost Jelly",   size: 4,  minDist: 0.35, weight: 12,  value: 120,  color: "#bfe9ff", len: 74,  ry: 0.32, special: "jelly" },
  { name: "Ice Angler",    size: 7,  minDist: 0.6,  weight: 3.5, value: 700,  color: "#6fb7ff", len: 110, ry: 0.36, special: "angler" },
  { name: "Beluga",        size: 8,  minDist: 0.7,  weight: 3.6, value: 900,  color: "#f3f7ff", len: 210, ry: 0.32, pointy: 0.1,  tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3 },
  { name: "Narwhal",       size: 9,  minDist: 0.8,  weight: 1.8, value: 2100, color: "#b5c3d6", len: 200, ry: 0.30, pointy: 0.2,  tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3, bill: true },
  { name: "Orca",          size: 10, minDist: 0.9,  weight: 0.6, value: 4800, color: "#1f2433", len: 220, ry: 0.33, pointy: 0.15, tail: "fluke", dorsal: "tri",    deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3 },
  // ---- Ember Isle ----
  { name: "Magma Puffer",  size: 4,  minDist: 0.3,  weight: 12,  value: 260,  color: "#ff6a3d", len: 66,  ry: 0.42, special: "puffer" },
  { name: "Lava Eel",      size: 5,  minDist: 0.45, weight: 9,   value: 380,  color: "#e0451f", len: 150, ry: 0.08, special: "eel", band: "#ffb84d" },
  { name: "Ember Octopus", size: 6,  minDist: 0.5,  weight: 7,   value: 520,  color: "#ff7a3d", len: 100, ry: 0.30, special: "octopus" },
  { name: "Ember Angler",  size: 7,  minDist: 0.65, weight: 3.5, value: 800,  color: "#b0301f", len: 110, ry: 0.36, special: "angler" },
  { name: "Cinder Ray",    size: 8,  minDist: 0.7,  weight: 3.4, value: 1100, color: "#4a2a2a", len: 200, ry: 0.10, special: "ray" },
  { name: "Obsidian Shark",size: 9,  minDist: 0.8,  weight: 1.6, value: 2600, color: "#2a2430", len: 190, ry: 0.20, pointy: 0.75, tail: "shark", dorsal: "tri",    deco: "shark",   mouth: "shark", tailH: 1.1 },
  { name: "Phoenix Koi",   size: 10, minDist: 0.9,  weight: 0.5, value: 6000, color: "#ff6a2f", len: 130, ry: 0.28, pointy: 0.0,  tail: "fan",   dorsal: "sail",   deco: "shine",   mouth: "small", tailLen: 0.45, tailH: 1.7, sparkle: true },
  // ---- Snowy Forest ----
  { name: "Frost Perch",      size: 2,  minDist: 0.05, weight: 26,  value: 24,   color: "#bfe6ff", len: 56,  ry: 0.27, pointy: 0.15, tail: "fan",   dorsal: "spikes", deco: "stripes", mouth: "small" },
  { name: "Icicle Pike",      size: 5,  minDist: 0.45, weight: 7,   value: 210,  color: "#cfe9f5", len: 120, ry: 0.13, pointy: 0.7,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "wide" },
  { name: "Winter Koi",       size: 6,  minDist: 0.55, weight: 3.5, value: 480,  color: "#e6f3ff", len: 90,  ry: 0.22, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "koi",     mouth: "small", patch: "#6fb7ff" },
  { name: "Aurora Salmon",    size: 8,  minDist: 0.7,  weight: 3.5, value: 900,  color: "#7cf0c8", len: 130, ry: 0.20, pointy: 0.45, tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small", sparkle: true },
  { name: "Crystal Sturgeon", size: 9,  minDist: 0.8,  weight: 1.6, value: 2300, color: "#bfe9ff", len: 170, ry: 0.17, pointy: 0.55, tail: "shark", dorsal: "spikes", deco: "blotch",  mouth: "cat", tailH: 1.1 },
  { name: "Frost Serpent",    size: 10, minDist: 0.9,  weight: 0.5, value: 5200, color: "#8fd0ff", len: 250, ry: 0.07, special: "eel", band: "#e8f6ff" },

  // ---- more fish: Sunny Bay ----
  { name: "Angelfish",       size: 3,  minDist: 0.15, weight: 18,  value: 45,   color: "#ffe066", len: 64,  ry: 0.42, pointy: 0.0,  tail: "round", dorsal: "sail",   deco: "stripes", mouth: "small", finScale: 1.4 },
  { name: "Blue Tang",       size: 3,  minDist: 0.2,  weight: 16,  value: 50,   color: "#2b8cff", len: 60,  ry: 0.30, pointy: 0.2,  tail: "fan",   dorsal: "soft",   deco: "lateral", mouth: "small" },
  { name: "Barracuda",       size: 5,  minDist: 0.45, weight: 8,   value: 170,  color: "#9aa7b8", len: 150, ry: 0.12, pointy: 0.8,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "wide" },
  { name: "Mahi Mahi",       size: 6,  minDist: 0.55, weight: 6,   value: 260,  color: "#7bd94f", len: 140, ry: 0.24, pointy: 0.5,  tail: "fork",  dorsal: "sail",   deco: "shine",   mouth: "small", tailH: 1.3 },
  { name: "Stingray",        size: 6,  minDist: 0.55, weight: 5,   value: 290,  color: "#c9a26a", len: 130, ry: 0.10, special: "ray" },
  { name: "Giant Squid",     size: 9,  minDist: 0.8,  weight: 1.6, value: 2400, color: "#e23a5a", len: 170, ry: 0.30, special: "octopus" },
  // ---- more fish: Cabin Lake ----
  { name: "Crappie",         size: 2,  minDist: 0.05, weight: 24,  value: 26,   color: "#c8d88a", len: 56,  ry: 0.34, pointy: 0.05, tail: "round", dorsal: "spikes", deco: "spots",   mouth: "small" },
  { name: "Rainbow Trout",   size: 3,  minDist: 0.2,  weight: 16,  value: 60,   color: "#ff9fd8", len: 84,  ry: 0.21, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "lateral", mouth: "small" },
  { name: "Carp",            size: 4,  minDist: 0.25, weight: 14,  value: 65,   color: "#c9a26a", len: 100, ry: 0.26, pointy: 0.1,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  { name: "Snakehead",       size: 5,  minDist: 0.4,  weight: 8,   value: 190,  color: "#5a6a3a", len: 120, ry: 0.15, pointy: 0.5,  tail: "fan",   dorsal: "soft",   deco: "blotch",  mouth: "wide" },
  { name: "Albino Catfish",  size: 7,  minDist: 0.6,  weight: 4,   value: 340,  color: "#f4e8d8", len: 130, ry: 0.23, pointy: 0.0,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  { name: "Alligator Gar",   size: 8,  minDist: 0.7,  weight: 3.5, value: 640,  color: "#6b7a4a", len: 175, ry: 0.13, pointy: 0.9,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "none", bill: true },
  // ---- more fish: Snowy Forest ----
  { name: "Snow Minnow",     size: 1,  minDist: 0.0,  weight: 40,  value: 6,    color: "#e8f6ff", len: 30,  ry: 0.17, pointy: 0.1,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Brook Trout",     size: 3,  minDist: 0.15, weight: 20,  value: 40,   color: "#ff8f6b", len: 78,  ry: 0.21, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "small" },
  { name: "Arctic Grayling", size: 4,  minDist: 0.35, weight: 10,  value: 100,  color: "#b8a0ff", len: 96,  ry: 0.20, pointy: 0.3,  tail: "fork",  dorsal: "sail",   deco: "spots",   mouth: "small" },
  { name: "Burbot",          size: 4,  minDist: 0.3,  weight: 9,   value: 95,   color: "#8a8a6a", len: 100, ry: 0.17, pointy: 0.2,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  { name: "Frost Puffer",    size: 4,  minDist: 0.3,  weight: 9,   value: 140,  color: "#bfe6ff", len: 70,  ry: 0.42, special: "puffer" },
  { name: "Glacier Catfish", size: 6,  minDist: 0.5,  weight: 5,   value: 240,  color: "#9fd0e8", len: 120, ry: 0.23, pointy: 0.0,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  // ---- more fish: Frozen Sea ----
  { name: "Capelin",         size: 1,  minDist: 0.0,  weight: 36,  value: 6,    color: "#c6d8e8", len: 34,  ry: 0.13, pointy: 0.4,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Icefish",         size: 3,  minDist: 0.15, weight: 14,  value: 55,   color: "#e8f6ff", len: 74,  ry: 0.16, pointy: 0.5,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small", sparkle: true },
  { name: "Halibut",         size: 5,  minDist: 0.4,  weight: 8,   value: 180,  color: "#8a7a5a", len: 130, ry: 0.34, pointy: 0.25, tail: "round", dorsal: "none",   deco: "blotch",  mouth: "small", eyeY: 0.4, eyeX: 0.45 },
  { name: "Lion's Mane",     size: 5,  minDist: 0.45, weight: 8,   value: 170,  color: "#ff9a6b", len: 90,  ry: 0.32, special: "jelly" },
  { name: "Dumbo Octopus",   size: 6,  minDist: 0.55, weight: 6,   value: 280,  color: "#ffb8d8", len: 90,  ry: 0.30, special: "octopus" },
  { name: "Greenland Shark", size: 9,  minDist: 0.8,  weight: 1.8, value: 2400, color: "#5a6470", len: 200, ry: 0.20, pointy: 0.75, tail: "shark", dorsal: "tri",    deco: "shark",   mouth: "shark", tailH: 1.1 },
  // ---- more fish: Ember Isle ----
  { name: "Cinder Minnow",   size: 1,  minDist: 0.0,  weight: 40,  value: 8,    color: "#ff8a5a", len: 32,  ry: 0.17, pointy: 0.1,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Firefish",        size: 2,  minDist: 0.05, weight: 26,  value: 30,   color: "#ff5a2a", len: 56,  ry: 0.26, pointy: 0.15, tail: "fan",   dorsal: "spikes", deco: "stripes", mouth: "small" },
  { name: "Lava Jelly",      size: 4,  minDist: 0.35, weight: 12,  value: 220,  color: "#ff6a3d", len: 74,  ry: 0.32, special: "jelly" },
  { name: "Coal Catfish",    size: 5,  minDist: 0.45, weight: 9,   value: 200,  color: "#2a2028", len: 110, ry: 0.23, pointy: 0.0,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "cat" },
  { name: "Molten Marlin",   size: 8,  minDist: 0.7,  weight: 3.5, value: 1200, color: "#e0451f", len: 165, ry: 0.16, pointy: 0.8,  tail: "fork",  dorsal: "sail",   deco: "tuna",    mouth: "none", bill: true, tailH: 1.5 },
  { name: "Inferno Whale",   size: 10, minDist: 0.9,  weight: 0.6, value: 6800, color: "#8a2a1a", len: 220, ry: 0.33, pointy: 0.15, tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3 },

  // ---- Cherry Blossom Pond ----
  { name: "Sakura Koi",      size: 2,  minDist: 0.05, weight: 26,  value: 30,   color: "#ffd0e6", len: 70,  ry: 0.22, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "koi",     mouth: "small", patch: "#ff8fc0" },
  { name: "Kohaku Koi",      size: 4,  minDist: 0.3,  weight: 12,  value: 110,  color: "#ffffff", len: 92,  ry: 0.22, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "koi",     mouth: "small", patch: "#e23a3a" },
  { name: "Tancho Koi",      size: 5,  minDist: 0.4,  weight: 7,   value: 210,  color: "#ffffff", len: 100, ry: 0.22, pointy: 0.3,  tail: "fan",   dorsal: "soft",   deco: "koi",     mouth: "small", patch: "#e23a3a", tailLen: 0.3 },
  { name: "Ogon Koi",        size: 6,  minDist: 0.55, weight: 5,   value: 320,  color: "#ffd23f", len: 105, ry: 0.23, pointy: 0.3,  tail: "fan",   dorsal: "soft",   deco: "shine",   mouth: "small", sparkle: true },
  { name: "Ghost Koi",       size: 8,  minDist: 0.7,  weight: 3.5, value: 800,  color: "#e8f6ff", len: 130, ry: 0.22, pointy: 0.3,  tail: "fan",   dorsal: "sail",   deco: "glint",   mouth: "small", sparkle: true, tailLen: 0.36 },
  { name: "Dragon Koi",      size: 10, minDist: 0.9,  weight: 0.6, value: 5500, color: "#e23a3a", len: 200, ry: 0.18, pointy: 0.5,  tail: "fan",   dorsal: "sail",   deco: "shine",   mouth: "small", sparkle: true, tailLen: 0.4, tailH: 1.5 },
  // ---- Mangrove Swamp ----
  { name: "Mudskipper",      size: 2,  minDist: 0.05, weight: 26,  value: 28,   color: "#8a8a5a", len: 52,  ry: 0.22, pointy: 0.2,  tail: "round", dorsal: "sail",   deco: "spots",   mouth: "small" },
  { name: "Piranha",         size: 3,  minDist: 0.15, weight: 16,  value: 60,   color: "#c8402a", len: 58,  ry: 0.30, pointy: 0.1,  tail: "fork",  dorsal: "soft",   deco: "stripes", mouth: "shark" },
  { name: "Bowfin",          size: 4,  minDist: 0.3,  weight: 12,  value: 100,  color: "#5a7a3a", len: 100, ry: 0.16, pointy: 0.3,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "wide" },
  { name: "Electric Eel",    size: 6,  minDist: 0.55, weight: 5,   value: 300,  color: "#e0c030", len: 160, ry: 0.07, special: "eel", band: "#fff3a0" },
  { name: "River Shark",     size: 8,  minDist: 0.7,  weight: 3.5, value: 850,  color: "#7a8a7a", len: 170, ry: 0.20, pointy: 0.75, tail: "shark", dorsal: "tri",    deco: "shark",   mouth: "shark", tailH: 1.1 },
  { name: "Cypress Sturgeon",size: 9,  minDist: 0.8,  weight: 1.8, value: 2100, color: "#4a6a4a", len: 180, ry: 0.17, pointy: 0.55, tail: "shark", dorsal: "spikes", deco: "blotch",  mouth: "cat", tailH: 1.1 },
  { name: "Swamp Serpent",   size: 10, minDist: 0.9,  weight: 0.5, value: 4600, color: "#3a7a4a", len: 250, ry: 0.07, special: "eel", band: "#9fe08a" },
  // ---- Desert Oasis ----
  { name: "Pupfish",         size: 1,  minDist: 0.0,  weight: 40,  value: 6,    color: "#5fa8e8", len: 30,  ry: 0.22, pointy: 0.1,  tail: "round", dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Tilapia",         size: 2,  minDist: 0.05, weight: 26,  value: 26,   color: "#d8c890", len: 62,  ry: 0.30, pointy: 0.1,  tail: "round", dorsal: "spikes", deco: "stripes", mouth: "small" },
  { name: "Tigerfish",       size: 4,  minDist: 0.3,  weight: 12,  value: 110,  color: "#c88a3a", len: 100, ry: 0.20, pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "stripes", mouth: "shark" },
  { name: "Nile Perch",      size: 6,  minDist: 0.5,  weight: 6,   value: 260,  color: "#8a9aa8", len: 150, ry: 0.24, pointy: 0.25, tail: "fan",   dorsal: "spikes", deco: "lateral", mouth: "wide" },
  { name: "Lungfish",        size: 8,  minDist: 0.7,  weight: 3.5, value: 700,  color: "#a08a6a", len: 170, ry: 0.10, pointy: 0.3,  tail: "round", dorsal: "soft",   deco: "blotch",  mouth: "small" },
  { name: "Pharaoh Fish",    size: 10, minDist: 0.9,  weight: 0.5, value: 5000, color: "#ffd23f", len: 150, ry: 0.26, pointy: 0.1,  tail: "fan",   dorsal: "sail",   deco: "shine",   mouth: "small", sparkle: true, tailLen: 0.4, tailH: 1.5 },
  // ---- Pirate Cove ----
  { name: "Cutlassfish",     size: 3,  minDist: 0.15, weight: 16,  value: 55,   color: "#c9d6e2", len: 130, ry: 0.07, pointy: 0.8,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "shark" },
  { name: "Barnacle Puffer", size: 4,  minDist: 0.3,  weight: 12,  value: 100,  color: "#8a6a4a", len: 66,  ry: 0.42, special: "puffer" },
  { name: "Skeleton Fish",   size: 5,  minDist: 0.4,  weight: 7,   value: 230,  color: "#f4f4f0", len: 96,  ry: 0.20, pointy: 0.4,  tail: "fork",  dorsal: "spikes", deco: "stripes", mouth: "shark" },
  { name: "Treasure Fish",   size: 7,  minDist: 0.6,  weight: 4,   value: 520,  color: "#ffd23f", len: 110, ry: 0.28, pointy: 0.1,  tail: "fan",   dorsal: "soft",   deco: "shine",   mouth: "small", sparkle: true },
  { name: "Ghost Shark",     size: 9,  minDist: 0.8,  weight: 1.6, value: 2300, color: "#c9d6e8", len: 190, ry: 0.20, pointy: 0.75, tail: "shark", dorsal: "tri",    deco: "shark",   mouth: "shark", tailH: 1.1 },
  { name: "Kraken",          size: 10, minDist: 0.9,  weight: 0.5, value: 6200, color: "#8a2a5a", len: 300, ry: 0.30, special: "octopus" },
  // ---- Deep Abyss ----
  { name: "Lanternfish",     size: 1,  minDist: 0.0,  weight: 40,  value: 10,   color: "#4aa8c8", len: 30,  ry: 0.2,  pointy: 0.3,  tail: "fork",  dorsal: "soft",   deco: "dots",    mouth: "small" },
  { name: "Bristlemouth",    size: 2,  minDist: 0.05, weight: 26,  value: 28,   color: "#2a5a8a", len: 46,  ry: 0.14, pointy: 0.4,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Hatchetfish",     size: 3,  minDist: 0.15, weight: 16,  value: 70,   color: "#c9d6e2", len: 56,  ry: 0.38, pointy: 0.2,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Viperfish",       size: 5,  minDist: 0.4,  weight: 8,   value: 240,  color: "#3a4a6a", len: 110, ry: 0.16, pointy: 0.7,  tail: "fork",  dorsal: "soft",   deco: "spots",   mouth: "shark" },
  { name: "Gulper Eel",      size: 7,  minDist: 0.6,  weight: 4,   value: 520,  color: "#2a2a3a", len: 200, ry: 0.08, special: "eel", band: "#4a4a6a" },
  { name: "Oarfish",         size: 9,  minDist: 0.8,  weight: 1.6, value: 2600, color: "#c9d6e2", len: 280, ry: 0.07, special: "eel", band: "#e23a5a" },
  { name: "Leviathan",       size: 10, minDist: 0.9,  weight: 0.5, value: 7500, color: "#1a2a4a", len: 260, ry: 0.33, pointy: 0.15, tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3, sparkle: true },
  // ---- Alien Planet ----
  { name: "Glow Minnow",     size: 1,  minDist: 0.0,  weight: 40,  value: 12,   color: "#7affd0", len: 30,  ry: 0.17, pointy: 0.1,  tail: "fork",  dorsal: "soft",   deco: "glint",   mouth: "small", sparkle: true },
  { name: "Star Guppy",      size: 2,  minDist: 0.05, weight: 26,  value: 34,   color: "#ffd23f", len: 36,  ry: 0.26, pointy: 0.1,  tail: "fan",   dorsal: "soft",   deco: "glint",   mouth: "small" },
  { name: "Plasma Tetra",    size: 3,  minDist: 0.15, weight: 18,  value: 80,   color: "#ff5fe0", len: 56,  ry: 0.26, pointy: 0.2,  tail: "fork",  dorsal: "soft",   deco: "lateral", mouth: "small", sparkle: true },
  { name: "Asteroid Puffer", size: 4,  minDist: 0.3,  weight: 12,  value: 160,  color: "#a08aff", len: 66,  ry: 0.42, special: "puffer" },
  { name: "Nebula Jelly",    size: 5,  minDist: 0.4,  weight: 8,   value: 260,  color: "#b45cff", len: 84,  ry: 0.32, special: "jelly" },
  { name: "UFO Squid",       size: 6,  minDist: 0.55, weight: 6,   value: 380,  color: "#7affd0", len: 100, ry: 0.30, special: "octopus" },
  { name: "Comet Ray",       size: 7,  minDist: 0.6,  weight: 4,   value: 620,  color: "#5fd8ff", len: 170, ry: 0.10, special: "ray" },
  { name: "Void Angler",     size: 8,  minDist: 0.7,  weight: 3.5, value: 900,  color: "#2a1a4a", len: 120, ry: 0.36, special: "angler" },
  { name: "Galaxy Eel",      size: 9,  minDist: 0.8,  weight: 1.6, value: 2500, color: "#7a5aff", len: 220, ry: 0.07, special: "eel", band: "#ffffff" },
  { name: "Cosmic Whale",    size: 10, minDist: 0.9,  weight: 0.5, value: 8200, color: "#5a3ad8", len: 240, ry: 0.33, pointy: 0.15, tail: "fluke", dorsal: "none",   deco: "whale",   mouth: "whale", eye: 0.13, tailLen: 0.3, tailH: 1.3, sparkle: true },
];

// rarity comes from how likely a fish is to bite
const RARITIES = [
  { name: "Common",    col: "#9aa7b8" }, { name: "Uncommon", col: "#4fd66b" }, { name: "Rare", col: "#4d9dff" },
  { name: "Epic",      col: "#b45cff" }, { name: "Legendary", col: "#ffb020" }, { name: "Mythic", col: "#ff5fa2" },
];
const rarityOf = w => (w >= 20 ? 0 : w >= 10 ? 1 : w >= 5 ? 2 : w >= 3 ? 3 : w >= 1 ? 4 : 5);

// which fish live in which map
const MAP_POOLS = {
  ...NEW_MAP_POOLS,
  blossom: ["Minnow", "Crappie", "Sakura Koi", "Koi", "Rainbow Trout", "Carp", "Kohaku Koi", "Tancho Koi", "Ogon Koi", "Albino Catfish", "Ghost Koi", "Golden Koi", "Dragon Koi"],
  swamp: ["Minnow", "Mudskipper", "Crappie", "Piranha", "Bowfin", "Carp", "Snakehead", "Eel", "Catfish", "Electric Eel", "Albino Catfish", "River Shark", "Alligator Gar", "Cypress Sturgeon", "Swamp Serpent"],
  oasis: ["Pupfish", "Minnow", "Tilapia", "Bluegill", "Koi", "Tigerfish", "Carp", "Snakehead", "Eel", "Nile Perch", "Catfish", "Albino Catfish", "Lungfish", "Alligator Gar", "Golden Koi", "Pharaoh Fish"],
  pirate: ["Minnow", "Sardine", "Perch", "Clownfish", "Cutlassfish", "Barnacle Puffer", "Bass", "Skeleton Fish", "Octopus", "Tuna", "Treasure Fish", "Swordfish", "Shark", "Ghost Shark", "Giant Squid", "Kraken"],
  abyss: ["Lanternfish", "Minnow", "Bristlemouth", "Hatchetfish", "Jellyfish", "Viperfish", "Octopus", "Anglerfish", "Gulper Eel", "Manta Ray", "Giant Squid", "Oarfish", "Leviathan"],
  alien: ["Glow Minnow", "Star Guppy", "Plasma Tetra", "Asteroid Puffer", "Nebula Jelly", "UFO Squid", "Comet Ray", "Void Angler", "Galaxy Eel", "Cosmic Whale"],
  bay: ["Minnow", "Sardine", "Perch", "Bluegill", "Clownfish", "Seahorse", "Flounder", "Trout", "Bass", "Pufferfish", "Jellyfish", "Golden Fish", "Salmon", "Eel", "Catfish", "Octopus", "Tuna", "Anglerfish", "Manta Ray", "Swordfish", "Shark", "Giant Whale", "Parrotfish", "Lionfish", "Moonfish", "Sea Dragon", "Angelfish", "Blue Tang", "Barracuda", "Mahi Mahi", "Stingray", "Giant Squid"],
  lake: ["Minnow", "Perch", "Bluegill", "Koi", "Walleye", "Trout", "Pike", "Bass", "Golden Fish", "Salmon", "Eel", "Catfish", "Muskie", "Sturgeon", "Golden Koi", "Lake Serpent", "Crappie", "Rainbow Trout", "Carp", "Snakehead", "Albino Catfish", "Alligator Gar"],
  forest: ["Minnow", "Frost Perch", "Arctic Char", "Perch", "Trout", "Walleye", "Pike", "Salmon", "Eel", "Icicle Pike", "Winter Koi", "Muskie", "Aurora Salmon", "Crystal Sturgeon", "Frost Serpent", "Snow Minnow", "Brook Trout", "Arctic Grayling", "Burbot", "Frost Puffer", "Glacier Catfish"],
  arctic: ["Minnow", "Sardine", "Arctic Char", "Cod", "Trout", "Frost Jelly", "Salmon", "Octopus", "Ice Angler", "Beluga", "Narwhal", "Orca", "Capelin", "Icefish", "Halibut", "Lion's Mane", "Dumbo Octopus", "Greenland Shark"],
  volcano: ["Minnow", "Sardine", "Perch", "Flounder", "Bass", "Magma Puffer", "Lava Eel", "Ember Octopus", "Tuna", "Ember Angler", "Cinder Ray", "Swordfish", "Obsidian Shark", "Phoenix Koi", "Cinder Minnow", "Firefish", "Lava Jelly", "Coal Catfish", "Molten Marlin", "Inferno Whale"],
};
for (const f of FISH) { f.rarity = rarityOf(f.weight); f.maps = []; }
for (const [id, names] of Object.entries(MAP_POOLS)) for (const n of names) FISH.find(f => f.name === n).maps.push(id);

// ---------- Save ----------
let state = load();
function load() {
  const cats = ["rod", "line", "bait", "bucket", "chair", "strength"];
  const fresh = { money: 0, owned: {}, equipped: {}, caught: {}, total: 0, rank: 1, license: { has: false, casts: 0 }, stats: { junk: 0, earned: 0, naps: 0 }, claimed: {}, lineUses: 0, codes: [], shiny: {}, map: "bay", ownedMaps: ["bay"], story: { seen: false, reached: false, deal: false, cut: 0 }, fun: {}, gems: 0 };
  for (const c of cats) { fresh.owned[c] = [1]; fresh.equipped[c] = 1; }
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) {
      fresh.money = s.money || 0; fresh.caught = s.caught || {}; fresh.total = s.total || 0;
      fresh.rank = s.rank || 1; fresh.codes = s.codes || []; fresh.lineUses = s.lineUses || 0; if (s.license) Object.assign(fresh.license, s.license); fresh.claimed = s.claimed || {}; if (s.stats) Object.assign(fresh.stats, s.stats); fresh.shiny = s.shiny || {}; if (s.map && MAPS[s.map]) fresh.map = s.map; if (Array.isArray(s.ownedMaps)) fresh.ownedMaps = s.ownedMaps; if (s.story) Object.assign(fresh.story, s.story); fresh.story.deal = false; // the company job offer no longer exists
      if (s.fun) fresh.fun = s.fun; fresh.gems = s.gems || 0;
      if (s.equipped && s.owned) {
        for (const c of cats) { if (s.owned[c]) fresh.owned[c] = s.owned[c]; if (s.equipped[c]) fresh.equipped[c] = s.equipped[c]; }
      } else if (s.lv) { // save from the old level-based version
        const lv = { rod: s.lv.rod, line: Math.max(s.lv.line || 1, s.lv.dist || 1), bait: s.lv.bait, bucket: s.lv.bucket };
        for (const c of cats) { const n = lv[c] || 1; fresh.owned[c] = Array.from({ length: n }, (_, i) => i + 1); fresh.equipped[c] = n; }
      }
    }
  } catch (e) {}
  return fresh;
}
function save() { if (window.__resetting) return; if (typeof jail !== "undefined" && jail.open) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }

// ---------- Helpers ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const fmt = n => "$" + Math.floor(n).toLocaleString();
const tier = cat => state.equipped[cat];
const bucketScale = () => 1 + Math.min(tier("bucket") - 1, 12) * 0.025; // buckets stay a sensible size
const mixRGB = (a, b, t) => `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

function outline(width = 4) { ctx.lineWidth = width; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.lineCap = "round"; }

// ---------- Game state ----------
const HAND = { x: 214, y: 210 };
const rodLen = () => 98 + Math.min(tier("rod"), 15) * 2.2; // slim, realistic rods: 100-131 px

const g = {
  t: 0, wob: 0, zoom: 1, slow: 0, hot: false, perfect: false, mystery: false, moneyShown: null, paused: false, lastLandX: null, aim: 0.5, aimLock: null, arcH: 150, holding: false, startLock: null, power: 0, powerDir: 1, powerLock: null, lastPower: 0.6,
  mode: "idle", // idle, windup, flight, wait, bite, reel, catch
  timer: 0,
  rodAngle: -55, rodTarget: -55, rodK: 6,
  bobber: { x: 0, y: 0 },
  start: { x: 0, y: 0 }, land: { x: 0, y: 0 }, flightDur: 1,
  dist: 0, biteAt: 0, fish: null, big: false, reelDur: 1, catchFrom: null, catchTo: null, fits: true,
  particles: [], popups: [], banner: null, dead: [],
  clouds: [{ x: 120, y: 60, s: 1 }, { x: 520, y: 100, s: 0.8 }, { x: 900, y: 45, s: 1.2 }, { x: 1180, y: 110, s: 0.9 }],
  birds: [{ x: 200, y: 110, s: 1, v: 30 }, { x: 260, y: 135, s: 0.8, v: 30 }, { x: 800, y: 80, s: 0.9, v: 22 }],
  boatX: 640,
  // day / night
  tod: 10,           // hour of day, 0..24
  stars: Array.from({ length: 120 }, () => ({ x: rand(0, W), yf: Math.random(), r: rand(0.8, 2.2), ph: rand(0, 6) })),
  // weather
  rain: 0, raining: false, rainClock: rand(30, 70), reelTick: 0, lock: null, shiny: false, clickBoost: 0, sit: 0, casts: 0, restLen: 6, jumpers: [], jumpClock: 3, escape: null, approach: null, approachAt: 0, flash: 0, flashClock: rand(4, 10),
  drops: Array.from({ length: 260 }, () => ({ x: rand(0, W + 100), y: rand(0, 300), v: rand(520, 720) })),
  ripples: [],
  // sky visitors (planes, balloons)
  sky: null, skyClock: rand(6, 14),
  bgFish: [], bubbles: [], snow: Array.from({ length: 70 }, () => ({ x: rand(0, W), yf: Math.random(), v: rand(4, 12) })),
  deco: { kelp: [], coral: [], rocks: [] },
};

// size everything to the window: taller window = deeper ocean
// the money and the buttons live under the water; shrink the button column if the window is short
function placeSideButtons() {
  const bar = document.querySelector(".bar"), stage = document.getElementById("stage"); if (!bar || !stage.clientHeight) return;
  bar.style.top = ((WATER_Y + 214) / H * 100) + "%"; bar.style.transform = "none";
  const k = stage.clientHeight / H, need = bar.offsetHeight / k, room = H - (WATER_Y + 214) - 12;
  bar.style.transformOrigin = "top left"; bar.style.transform = need > room ? `scale(${Math.max(0.5, room / need)})` : "none";
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeSideButtons());
function layout() {
  const vw = window.innerWidth, vh = window.innerHeight;
  H = clamp(Math.round(W * vh / vw), 620, 3200); // tall phone screens need a much bigger H, or the canvas gets cropped on the sides
  canvas.width = W; canvas.height = H;
  WATER_Y = Math.max(250, Math.round(H * 0.33));
  DECK_Y = WATER_Y - 10;
  document.getElementById("modal").style.top = ((WATER_Y + 150) / H * 100) + "%";
  placeSideButtons();
  HAND.y = DECK_Y - 40;
  document.getElementById("stage").style.setProperty("--u", (Math.max(vw, 760) / W) + "px"); // on a phone-width screen, scale the UI as if the screen were 640px wide so text and buttons stay readable

  // ocean floor decorations and ambient fish depend on the height
  const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  g.deco.kelp = Array.from({ length: 14 }, (_, i) => ({ x: rnd(i, 1) * W, h: 70 + rnd(i, 2) * 110, ph: rnd(i, 3) * 6 }));
  g.deco.coral = Array.from({ length: 9 }, (_, i) => ({ x: rnd(i, 4) * W, col: ["#ff7eb6", "#ff9f43", "#b45cff", "#ff5a5f"][i % 4], s: 0.8 + rnd(i, 5) * 0.8 }));
  g.deco.rocks = Array.from({ length: 8 }, (_, i) => ({ x: rnd(i, 6) * W, s: 0.8 + rnd(i, 7) * 1.4 }));
  buildEcosystem();
}

// where the rod tip is in the world, including the rocking of a floating platform
function rodTipWorld() { const t = rodTip(); return deckXform(t.x, t.y); }

function rodTip() {
  const a = g.rodAngle * Math.PI / 180;
  const hp = handPos();
  return { x: hp.x + Math.cos(a) * rodLen(), y: hp.y + Math.sin(a) * rodLen() };
}

// ---------- Day / night ----------
const SKY_KEYS = [
  [0,    [10, 14, 48],   [30, 42, 96],    1],
  [4.5,  [26, 32, 90],   [70, 60, 120],   0.85],
  [5.5,  [70, 80, 170],  [255, 140, 110], 0.5],   // sunrise begins
  [6.5,  [120, 150, 235],[255, 190, 120], 0.2],   // sunrise glow
  [7.5,  [88, 191, 255], [255, 241, 207], 0.03],
  [9,    [88, 191, 255], [200, 240, 255], 0],
  [16.5, [88, 191, 255], [200, 240, 255], 0],
  [17.5, [100, 150, 240],[255, 215, 140], 0.1],
  [18.5, [150, 100, 190],[255, 130, 80],  0.35],  // sunset
  [19.5, [70, 50, 130],  [210, 90, 110],  0.65],
  [21,   [14, 18, 60],   [36, 48, 100],   1],
  [24,   [10, 14, 48],   [30, 42, 96],    1],
];
function skyState(h) {
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
    if (h <= b[0]) {
      const t = (h - a[0]) / (b[0] - a[0]);
      return { top: a[1].map((v, k) => lerp(v, b[1][k], t)), bot: a[2].map((v, k) => lerp(v, b[2][k], t)), dark: lerp(a[3], b[3], t) };
    }
  }
  return { top: SKY_KEYS[0][1], bot: SKY_KEYS[0][2], dark: 1 };
}
const LOCK_TOD = { sunrise: 6.2, day: 12, sunset: 18.5, night: 0 };
const TIME_LIMIT = 120; // a manually set sunrise / sunset / night always turns back into day after 2 minutes
function phaseName(h) { return h < 4.5 || h >= 20.5 ? "NIGHT" : h < 7.5 ? "SUNRISE" : h < 17 ? "DAY" : "SUNSET"; }
function timeLabel() {
  const h = g.tod, hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  if (g.lock) {
    if (g.lock.mode === "day") return "DAY (locked)";
    const sec = Math.ceil(g.lock.left);
    return `${phaseName(h)} - day in ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  }
  return `${phaseName(h)} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function setTimeMode(mode) {
  g.lock = mode === "auto" ? null : { mode, left: TIME_LIMIT };
  if (g.lock) g.tod = LOCK_TOD[mode];
  Snd.chime(); refreshModal();
}
const isRain = () => g.rain > 0.5;

// ---------- Fishing logic ----------
function reelSpeedMult() { return (1 + (tier("rod") - 1) * 0.2) * skillReel() * boatReel(); }
function biteSpeedMult() { return (1 + (tier("bait") - 1) * 0.25) * funBite() * mapT().bite; }

function startCast() {
  if (g.mode !== "idle") return;
  g.mode = "windup"; g.timer = 0;
  g.rodTarget = -150; g.rodK = 14;
}

// ---------- manual casting: hold to charge the throw, move the mouse up/down to pick the arc, release to throw ----------
// how far THIS line can go at most. Every line throws far, and each upgrade adds a big step (the steps are biggest for the first lines; the last ones run out of screen)
const lineTier = () => 1 + 0.9 * (tier("line") - 1) + 0.1 * (tier("rod") - 1);
const maxLandX = () => lerp(880, W - 30, (1 - Math.exp(-(lineTier() - 1) / 7)) / (1 - Math.exp(-23 / 7)));
// how far the throw really goes: the charge (power) times how good the arc is. A medium arc (45 degrees) goes farthest; a very flat or very steep arc goes shorter.
const arcFactor = aim => Math.sin(2 * (lerp(4, 86, aim) * Math.PI / 180)); // arc from almost flat (4 degrees) to almost straight up (86): the middle goes farthest, the ends go only a little way, even with the best line
const manualLandX = (power, aim) => clamp(lerp(370, maxLandX(), clamp(power * arcFactor(aim), 0, 1)) + windPush(), 300, W - 20); // wind pushes the throw a little
const manualArcH = aim => 25 + 145 * aim;
const manualReady = () => settings.manual && g.mode === "idle" && g.timer >= 0.4 && !story.active && !licenseBlocked() && !menu.open;
function manualHold() { if (manualReady() && !g.holding) { g.holding = true; g.power = 0; g.powerDir = 1; } }
function manualRelease() {
  if (!g.holding) return; g.holding = false;
  if (!manualReady()) return;
  g.perfect = g.power >= 0.95 && Math.abs(g.aim - 0.5) <= 0.1; if (g.perfect) { toast("PERFECT THROW!  faster bites, +25% value", "#ffe066"); Snd.chime(); }
  g.aimLock = g.aim; g.powerLock = Math.max(0.05, g.power); g.lastPower = g.powerLock; g.startLock = rodTipWorld(); startCast();
}
function updateModeBtn() { const b = document.getElementById("modeBtn"); if (b) { b.textContent = settings.manual ? "MANUAL" : "AUTO"; b.classList.toggle("on", !!settings.manual); } }

function launch() {
  // a better line casts farther and sinks deeper
  let landX;
  if (settings.manual) { const a = g.aimLock != null ? g.aimLock : g.aim, p = g.powerLock != null ? g.powerLock : g.power; landX = manualLandX(p, a); g.arcH = manualArcH(a); }
  else { const p = rand(0.6, 1), a = rand(0.3, 0.7); landX = manualLandX(p, a); g.arcH = manualArcH(a); } // auto mode picks a random charge and arc each cast, so no line has one fixed distance
  g.dist = clamp((landX - 340) / (W - 430), 0, 1); g.lastLandX = landX; if (!settings.manual) g.perfect = false;
  g.start = (settings.manual && g.startLock) ? g.startLock : rodTipWorld(); g.startLock = null; // the throw starts exactly where the aim line started
  g.land = { x: landX, y: WATER_Y + 6 };
  g.flightDur = 0.55 + (landX - 250) / 1200;
  g.mode = "flight"; g.timer = 0;
  g.rodTarget = -25; g.rodK = 30;
  if (settings.tired) g.casts++;
  if (licenseOn() && state.license.has) state.license.casts++; // every cast uses up the license
  Snd.cast();
}

// how likely a fish is to be the one that bites: better bait (and a better line) pull in the rarer, bigger kinds; rain pulls in the big ones
function fishWeightNow(f, noDepth) {
  const b = tier("bait"), luck = 1 + (Math.min(b, 10) - 1) * 0.3 + Math.max(0, b - 10) * 0.1 + Math.max(0, tier("line") - 10) * 0.08; // tiers 11+ add a little extra luck
  const depthFit = 0.04 + 0.96 * Math.exp(-Math.pow(f.size - (1 + g.dist * 9), 2) / (2 * 1.7 * 1.7)) * (1 + f.size * 0.25 * g.dist); // shallow water holds small fish, deep water holds the big ones
  return f.weight * Math.pow(luck * funLuck(), f.size / 2) * (isRain() ? 1 + (f.size - 1) * 0.4 : 1) * (noDepth ? 1 : depthFit);
}
function weightedPick(list, wf) {
  const weights = list.map(wf), total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r <= 0) return list[i]; }
  return list[0];
}
function pickFish() {
  const maxSize = tier("line") + 1;
  const pool = FISH.filter(f => f.maps.includes(state.map) && f.size <= maxSize && f.minDist <= g.dist + 0.001);
  const goods = pool.filter(f => f.rarity >= 2), lows = pool.filter(f => f.rarity < 2);
  if (goods.length && lows.length) { const want = Math.random() < goodChance() ? goods : lows; pool.length = 0; pool.push(...want); } // better gear = more good fish, never more than 50%
  return weightedPick(pool, fishWeightNow);
}
// the fish that bites is a real fish swimming in the water: one of the wanderers that this line and hook can reach
function pickWaterFish() {
  const maxSize = tier("line") + 1, ws = g.wanderers || [];
  const hx = g.land ? g.land.x : W / 2, hy = WATER_Y + hookDepth();
  const near = w => Math.hypot(w.x - hx, (w.y - hy) * 0.7); // how far a fish is from the hook
  const elig = ws.filter(w => w.f.size <= maxSize && w.f.minDist <= g.dist + 0.001 && nightOK(w.f)); // some fish only bite at night
  if (!elig.length) { // nothing your line can reach is swimming out there: the closest fish is drawn in and turns into a fitting one
    const f = pickFish(); let w = null, best = 1e9;
    for (const c of ws) { const d = near(c); if (d < best) { best = d; w = c; } }
    return { f, w };
  }
  let pool = elig;
  if (g.hot || g.perfect) { const rare = elig.filter(w => w.f.rarity >= 2 && near(w) < 520); if (rare.length) pool = rare; } // a hot spot or perfect throw pulls in a rare fish that is nearby
  let w = pool[0]; for (const c of pool) if (near(c) < near(w)) w = c; // the fish that bites is the one that was already closest to your hook, so you can see it coming
  return { f: w.f, w };
}

function splash(x, y, n = 14) {
  for (let i = 0; i < n; i++) {
    g.particles.push({ x, y, vx: rand(-90, 90), vy: rand(-220, -80), life: rand(0.4, 0.8), r: rand(2, 5) });
  }
}
// x is given in on-screen (mirrored) coordinates
function popup(text, x, y, color = "#fff", life = 1.4, size = 34) { g.popups.push({ text, x, y, life, color, size }); }

const FLIGHT = 0.8, DROP = 0.5;
const bigMul = () => (g.big ? 1.3 : 1) * (g.sizeMul || 1); // rain makes fish bigger, and so does deeper water

function catchTarget(len) {
  const bs = bucketScale();
  const mouthY = DECK_Y - 36 * bs;
  if (g.fits) return { x: BUCKET_X, y: mouthY - 10 };
  return { x: clamp(BUCKET_X + 45 * bs + len * 0.25, 0, 92), y: mouthY - 10 };
}

function updateWeather(dt) {
  if (!settings.rain || curMap().noWeather) g.raining = false; // no rain (or ember storms) on Ember Isle
  else if (curMap().alwaysWeather) g.raining = true; // the Deep Abyss is always stormy
  else {
    g.rainClock -= dt;
    if (g.rainClock <= 0) {
      g.raining = !g.raining;
      g.rainClock = g.raining ? rand(12, 20) : rand(60, 120); // short showers
    }
  }
  g.rain += ((g.raining ? 1 : 0) - g.rain) * Math.min(1, dt * 0.6);

  const wk = curMap().weather.kind, sp = wk === "snow" ? 0.15 : wk === "petals" ? 0.2 : wk === "ember" ? 0.55 : wk === "meteor" ? 0.8 : 1;
  for (const d of g.drops) {
    d.y += d.v * sp * dt; d.x -= (wk === "snow" || wk === "petals" ? Math.sin(g.t * 1.3 + d.v) * 22 : 70) * dt;
    if (d.y > WATER_Y) {
      if (g.rain > 0.1 && wk === "rain" && Math.random() < 0.35) g.ripples.push({ x: d.x, life: 0.7 });
      d.y = rand(-60, 0); d.x = rand(0, W + 100);
    }
  }
  for (const r of g.ripples) r.life -= dt;
  g.ripples = g.ripples.filter(r => r.life > 0);

  // lightning
  if (g.rain > 0.7 && wk !== "snow" && wk !== "petals") { g.flashClock -= dt; if (g.flashClock <= 0) { g.flash = 0.7; g.flashClock = rand(5, 14); Snd.thunder(); } }
  g.flash = Math.max(0, g.flash - dt * 1.6);
}

function updateSky(dt) {
  g.skyClock -= dt;
  if (!g.sky && g.skyClock <= 0 && settings.sky) {
    const plane = Math.random() < 0.7, dir = Math.random() < 0.5 ? 1 : -1;
    g.sky = { kind: plane ? "plane" : "balloon", v: dir * (plane ? rand(90, 130) : rand(14, 22)), x: dir > 0 ? -150 : W + 150, y: plane ? rand(40, WATER_Y * 0.42) : rand(70, WATER_Y * 0.4), age: 0 };
  }
  if (g.sky) {
    g.sky.x += g.sky.v * dt; g.sky.age += dt;
    if (g.sky.x < -170 || g.sky.x > W + 170) { g.sky = null; g.skyClock = rand(15, 40); }
  }
}

// ---------- Tiredness (chair) and line wear ----------
const CHAIR_X = 124;
const chairScale = () => 1 + Math.min(tier("chair") - 1, 12) * 0.015;
function handPos() {
  const s = g.sit || 0; if (s <= 0) return HAND;
  return { x: lerp(HAND.x, CHAIR_X + 28, s), y: lerp(HAND.y, DECK_Y - 26 * chairScale() - 12, s) };
}
function startRest() {
  g.mode = "rest"; g.timer = 0; g.restLen = restTime(tier("chair")); g.rodTarget = -75; g.rodK = 6;
  state.stats.naps++;
  Snd.rest();
}
const lineLifeOf = t => Math.round(8 + t * 5 + t * t * 0.6);      // better lines last MUCH longer
const lineLife = () => lineLifeOf(tier("line"));
const lineRiskStart = () => lineLife() * Math.min(0.92, 0.45 + 0.05 * (tier("line") - 1)); // weak lines start snapping much sooner
const restringCost = () => Math.max(1, Math.round(10 * tier("line") * skillThrift()));
// returns true if the line snapped on this reel
function snapChance() { // 0 while the line is still fresh
  const S = lineLife(), t = tier("line"), over = (state.lineUses || 0) - lineRiskStart();
  if (over <= 0) return 0;
  return 0.4 * clamp(Math.max(0.01, 0.06 - 0.005 * (t - 1)) + over / (S * 0.5) * Math.max(0.05, 0.5 - 0.04 * (t - 1)), 0, Math.max(0.05, 0.7 - 0.05 * (t - 1))); // better lines: lower chance, and a lower ceiling (lines now snap 60% less often)
}
function checkSnap(force) { // force = the line tension got too high
  if (!settings.snap && !force) return false;
  if (!force) {
    state.lineUses = (state.lineUses || 0) + funWear();
    const p = snapChance();
    if (p <= 0) { save(); return false; }
    if (Math.random() >= p) { save(); return false; }
  }
  const loss = Math.min(state.money, Math.round(clamp(state.money * 0.04, 10, 150 + 120 * tier("line"))));
  state.money -= loss; state.lineUses = 0; funReset(); save(); refreshModal();
  if (g.fish) { const p = fishPose(); g.escape = { f: g.fish, L: g.fish.len * bigMul(), x: p.x, y: p.y, life: 1.3, shiny: g.shiny, side: g.fishSide || 1 }; } // the fish swims off
  g.fish = null; g.big = false; g.shiny = false; g.mode = "idle"; g.timer = 0;
  splash(g.bobber.x, WATER_Y, 14); Snd.snap();
  g.banner = { text: `SNAP! Line broke  -${fmt(loss)}`, sub: "THE FISH GOT AWAY - NEW LINE STRUNG", life: 2.8, color: "#ff5a5f", subColor: "#fff" };
  return true;
}

// ---------- fish that come to the hook ----------
function startApproach() {
  let w = null;
  if (Math.random() < junkChance()) g.fish = pickJunk();
  else { const p = pickWaterFish(); g.fish = p.f; w = p.w; }
  g.mystery = !g.fish.junk && onE() && Math.random() < mysteryChance(); // a mystery bite: you only see a shadow until it lands
  if (!g.fish.junk && g.fish.rarity >= 2 && onE()) toast("A " + RARITIES[g.fish.rarity].name.toUpperCase() + " FISH IS COMING!", RARITIES[g.fish.rarity].col);
  g.multi = g.fish.junk ? 1 : rollMulti(); // very rarely a strong rod + line hauls in 2 or 3 fish at once
  const isJunk = !!g.fish.junk; g.sizeMul = isJunk ? 1 : clamp((0.75 + 0.6 * g.dist) * rand(0.92, 1.08), 0.7, 1.45); // the same kind of fish is bigger the deeper you fish
  g.big = !isJunk && isRain(); g.shiny = !isJunk && Math.random() < shinyChance();
  let dx = rand(190, 300), dy = rand(-85, 95), side = Math.random() < 0.5 ? -1 : 1;
  g.boss = !!(w && w.boss && !isJunk); g.perfectReel = false;
  if (w) { // it swims in from where it really was; the ocean loses that fish and a new one appears far away later
    const hx = g.land ? g.land.x : w.x, hy = WATER_Y + hookDepth();
    dx = clamp(Math.abs(w.x - hx), 110, 720); dy = clamp(w.y - hy, -150, 150); side = w.x >= hx ? 1 : -1;
    if (!g.fish.junk) g.sizeMul = w.sz || g.sizeMul; // it is exactly as big as it looked in the water
    const i = g.wanderers.indexOf(w); if (i >= 0) g.wanderers.splice(i, 1); g.wRespawn = (g.wRespawn || 0) + 1;
  }
  g.fishSide = side; // the fish comes from the left OR the right of the hook
  g.approach = { side, dx, dy, t0: g.timer, dur: Math.max(0.5, g.biteAt - g.timer), ph: rand(0, 6) };
}
function hookPos() {
  const b = g.bobber, depth = hookDepth();
  let hx = b.x, hy = b.y + 26;
  if (g.mode === "wait") { hy = WATER_Y + depth + Math.sin(g.t * 2) * 4; }
  else if (g.mode === "bite" || g.mode === "fight") { hx = b.x + Math.sin(g.timer * 40) * 3; hy = WATER_Y + depth; }
  else if (g.mode === "reel") { const u = clamp(g.timer / g.reelDur, 0, 1); hx = b.x + 30 * (1 - u); hy = WATER_Y + depth * (1 - u * u); }
  return { x: hx, y: hy };
}
// where the fish is (its centre) while it approaches, nibbles and gets reeled in. Its mouth sits on the hook.
function fishPose() {
  const f = g.fish; if (!f) return null;
  const L = f.len * bigMul(), hk = hookPos();
  let mx = hk.x, my = hk.y, rot = 0;
  if (g.mode === "wait" && g.approach) {
    const A = g.approach, u = clamp((g.timer - A.t0) / A.dur, 0, 1), k = Math.pow(1 - u, 2.2);
    mx += (A.side || 1) * A.dx * k; my += A.dy * k + Math.sin(g.t * 5 + A.ph) * 6 * k; rot = Math.sin(g.t * 5 + A.ph) * 0.08 * k;
  } else if (g.mode === "bite" || g.mode === "fight") {
    mx += Math.sin(g.timer * 32) * 3; my += Math.sin(g.timer * 41) * 2; rot = Math.sin(g.timer * 28) * 0.15;
  } else if (g.mode === "reel") {
    const k = 1 - clamp(g.timer / g.reelDur, 0, 1);
    mx += Math.sin(g.timer * 13) * 4 * k; my += Math.sin(g.timer * 17) * 5 * k; rot = Math.sin(g.timer * 15) * 0.14 * k;
  }
  const sd = g.fishSide || 1; // which side of the hook the fish is on (its mouth is on the hook)
  return { x: mx + sd * L * 0.48, y: my, dir: -sd, rot };
}

// ---------- fish leaping out of the water ----------
function spawnJumper() {
  const pool = FISH.filter(f => f.maps.includes(state.map) && !f.special && f.len <= 130);
  const f = pool[Math.floor(Math.random() * pool.length)]; if (!f) return;
  const x = rand(440, W - 90), dir = Math.random() < 0.5 ? -1 : 1;
  g.jumpers.push({ f, len: Math.min(110, f.len * rand(0.75, 1.05)), x, y: WATER_Y + 6, vx: dir * rand(40, 130), vy: -rand(340, 480), out: false, dead: false });
  splash(x, WATER_Y, 8); Snd.jump();
}
function updateJumpers(dt) {
  if (g.escape) { g.escape.x += 230 * dt * (g.escape.side || 1); g.escape.life -= dt; if (g.escape.life <= 0) g.escape = null; }
  g.jumpClock -= dt;
  if (g.jumpClock <= 0) { g.jumpClock = rand(4, 9); if (settings.bgFish) spawnJumper(); }
  for (const j of g.jumpers) {
    j.vy += 900 * dt; j.x += j.vx * dt; j.y += j.vy * dt;
    if (!j.out && j.y < WATER_Y - 2) j.out = true;
    if (j.out && j.y >= WATER_Y) { splash(j.x, WATER_Y, 9); Snd.jump(); j.dead = true; }
  }
  g.jumpers = g.jumpers.filter(j => !j.dead);
}
function drawJumpers() {
  for (const j of g.jumpers) {
    const s = fishSprite(j.f, j.len);
    ctx.save(); ctx.translate(j.x, j.y);
    if (j.vx >= 0) ctx.rotate(Math.atan2(j.vy, j.vx) * 0.85); else { ctx.scale(-1, 1); ctx.rotate(Math.atan2(j.vy, -j.vx) * 0.85); }
    ctx.drawImage(s.c, -s.w / 2, -s.h / 2); ctx.restore();
  }
}

function update(dt) {
  g.t += dt; g.timer += dt;
  g.clickBoost = Math.max(0, g.clickBoost - dt * 0.2); // click boost fades if you stop clicking
  if (g.lock) {
    g.tod = LOCK_TOD[g.lock.mode];
    if (g.lock.mode !== "day") { g.lock.left -= dt; if (g.lock.left <= 0) { g.lock = null; g.tod = 8; refreshModal(); } }
  } else g.tod = (g.tod + dt * 24 / DAY_SECONDS) % 24;
  updateWeather(dt); updateSky(dt); updateStory(dt); updateRankFx(dt); updateRewards(dt); updateLicense(dt); funUpdate(dt); moreUpdate(dt); extraUpdate(dt);
  checkStory(); // the one-time fisherman story: as soon as you reach $20,000+ (even if you spend it)

  g.rodAngle += (g.rodTarget - g.rodAngle) * Math.min(1, dt * g.rodK);
  if (g.mode !== "rest" && g.sit > 0) g.sit = Math.max(0, g.sit - dt * 3); // never stay seated outside a break

  switch (story.active || licenseBlocked() ? "story" : g.mode) {
    case "idle":
      if (settings.tired && g.casts >= tiredCasts(tier("strength"))) { startRest(); break; } // too tired: sit down
      g.rodTarget = -55 + Math.sin(g.t * 2) * 3; g.rodK = 6;
      { const tip = rodTipWorld(); g.bobber = { x: tip.x + 4, y: tip.y + 46 + Math.sin(g.t * 3) * 3 }; }
      if (g.holding) { g.power += g.powerDir * dt * 0.9; if (g.power >= 1) { g.power = 1; g.powerDir = -1; } else if (g.power <= 0) { g.power = 0; g.powerDir = 1; } } // power bounces up and down while held
      if (!settings.manual && g.timer > 0.8) startCast(); // auto mode casts by itself; manual mode waits for you to aim and throw
      break;
    case "rest": {
      const T = g.timer, L = g.restLen;
      if (!settings.tired) { g.sit = 0; g.casts = 0; g.mode = "idle"; g.timer = 0; break; }
      g.rodTarget = -75; g.rodK = 6;
      g.sit = T < 0.6 ? T / 0.6 : (T < L + 0.6 ? 1 : Math.max(0, 1 - (T - L - 0.6) / 0.6)); // sit down, sleep, stand up
      if (T >= L + 1.2) { g.sit = 0; g.casts = 0; g.mode = "idle"; g.timer = 0; Snd.wake(); }
      break;
    }
    case "windup":
      { const tip = rodTipWorld(); g.bobber = { x: tip.x, y: tip.y + 40 }; }
      if (g.timer >= (settings.manual ? 0.1 : 0.4)) launch();
      break;
    case "flight": {
      const u = clamp(g.timer / g.flightDur, 0, 1);
      g.bobber.x = lerp(g.start.x, g.land.x, u);
      g.bobber.y = lerp(g.start.y, g.land.y, u) - Math.sin(u * Math.PI) * (g.arcH || 150);
      if (u >= 1) {
        splash(g.land.x, WATER_Y, 16); Snd.splash();
        g.mode = "wait"; g.timer = 0;
        g.biteAt = Math.max(1.1, rand(1.2, 3.2) / biteSpeedMult() * (isRain() ? 1.8 : 1)); // rain: slower bites
        g.approachAt = Math.max(0, g.biteAt - 1.6); g.fish = null; g.approach = null; // the fish shows up a moment before it bites
        moreLanded(); // hot spots and perfect throws make bites faster
        g.rodTarget = -35;
      }
      break;
    }
    case "wait":
      g.bobber.x = g.land.x; g.bobber.y = WATER_Y + 4 + Math.sin(g.t * 3) * 2.5;
      if (!g.fish && g.timer >= g.approachAt) startApproach();
      if (g.timer >= g.biteAt) {
        if (!g.fish) startApproach();
        g.mode = "bite"; g.timer = 0; Snd.bite(); if (g.fish && g.fish.rarity >= 4 && onE()) g.slow = 0.5; // a beat of slow motion for a legendary
        splash(g.land.x, WATER_Y, 10);
      }
      break;
    case "bite":
      g.bobber.y = WATER_Y + 4 + Math.abs(Math.sin(g.timer * 22)) * 14;
      g.bobber.x = g.land.x + Math.sin(g.timer * 40) * 3;
      g.rodTarget = -45 + Math.sin(g.timer * 30) * 4; g.rodK = 30;
      if (g.timer >= 0.7 && !funStartFight()) {
        g.mode = "reel"; g.timer = 0;
        g.reelDur = (1.4 + g.fish.size * 0.3) / reelSpeedMult() * (0.7 + g.dist * 0.8);
      }
      break;
    case "fight": funFight(dt); break;
    case "reel": {
      g.timer += dt * (settings.manual ? 0.3 : g.clickBoost); // auto: every click makes the reel faster (up to +60%); manual: a steady +30%
      const u = clamp(g.timer / g.reelDur, 0, 1);
      g.bobber.x = lerp(g.land.x, 350, u);
      g.bobber.y = WATER_Y + 4 + Math.sin(g.timer * 14) * 3;
      g.rodTarget = -40 + Math.sin(g.timer * 16) * 10; g.rodK = 30;
      if (Math.random() < dt * 14) splash(g.bobber.x, WATER_Y, 1);
      g.reelTick -= dt; if (g.reelTick <= 0) { Snd.reelTick(); g.reelTick = 0.1; }
      if (u >= 1) {
        if (checkSnap()) break;
        const endPose = fishPose();
        g.mode = "catch"; g.timer = 0;
        g.catchFrom = { x: endPose.x, y: WATER_Y };
        g.fits = g.fish.size <= tier("bucket") + 1;
        g.catchTo = catchTarget(g.fish.len * bigMul());
        splash(g.bobber.x, WATER_Y, 12 + (g.fish.size || 1) * 4); Snd.fishOut(); // bigger fish, bigger splash
        g.rodTarget = -140; g.rodK = 20; // swing the fish back over his shoulder toward the bucket
      }
      break;
    }
    case "catch":
      if (g.timer >= FLIGHT + DROP) {
        const f = g.fish, big = g.big;
        if (f.junk) { // not a fish: it plonks into the bucket for pocket change
          state.money += f.value; state.stats.junk++; const tr = junkTreasure(); extraJunk(); save(); refreshModal();
          g.banner = { text: `Yuck! ${f.name}  +${fmt(f.value)}`, sub: tr || "JUNK", life: 2.2, color: "#b8c0cc", subColor: "#8c96a4" };
          Snd.junk(); funReset();
        } else if (g.fits) {
          let value = f.value * (1 + (tier("rod") - 1) * 0.15) * mapT().sell * (big ? 1.5 : 1) * (g.shiny ? 3 : 1) * (1 + Math.max(0, tier("bucket") - 10) * 0.1) * FISH_VALUE * (g.multi || 1) * Math.pow(g.sizeMul || 1, 1.5); // top buckets keep fish fresh
          if (state.story.deal) value *= DEAL_MULT;
          value = Math.max(1, Math.round(value * funCatchMult(f)));
          const cut = state.story.deal ? Math.round(value * DEAL_CUT) : 0, net = value - cut;
          state.money += net; state.total += g.multi || 1; state.stats.earned += net; state.story.cut = (state.story.cut || 0) + cut;
          const first = !state.caught[f.name];
          state.caught[f.name] = (state.caught[f.name] || 0) + (g.multi || 1);
          if (g.shiny) state.shiny[f.name] = (state.shiny[f.name] || 0) + 1;
          const R = RARITIES[f.rarity];
          g.banner = { text: `${g.multi === 3 ? "TRIPLE CATCH! " : g.multi === 2 ? "DOUBLE CATCH! " : ""}${first ? "NEW! " : ""}${g.shiny ? "SHINY " : ""}${(g.sizeMul || 1) >= 1.25 ? "HUGE " : (g.sizeMul || 1) <= 0.82 ? "TINY " : ""}${big ? "BIG " : ""}${f.name}  +${fmt(net)}`, sub: R.name.toUpperCase() + (cut ? `  -  company cut ${fmt(cut)}` : ""), life: 2.8, color: g.shiny ? "#ffe066" : R.col, subColor: R.col };
          popup("+" + fmt(net), W - BUCKET_X, DECK_Y - 100, "#ffd23f");
          Snd.catchGood(first, big, f.rarity, g.shiny);
          funAfterCatch(f, net, g.shiny, big);
          checkRank();
          save(); refreshModal();
        } else {
          g.dead.push({ f, x: g.catchTo.x, life: 8, mul: big ? 1.3 : 1 }); funReset();
          if (g.dead.length > 3) g.dead.shift();
          g.banner = { text: `${f.name} too big! Upgrade bucket`, life: 2.6, color: "#ff5a5f" };
          Snd.catchBad();
        }
        g.fish = null; g.mode = "idle"; g.timer = 0;
      }
      break;
  }

  for (const p of g.particles) { p.life -= dt; p.vy += 600 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  g.particles = g.particles.filter(p => p.life > 0 && p.y < WATER_Y + 30);
  for (const p of g.popups) { p.life -= dt; p.y -= 40 * dt; }
  g.popups = g.popups.filter(p => p.life > 0);
  for (const d of g.dead) d.life -= dt;
  g.dead = g.dead.filter(d => d.life > 0);
  if (g.banner) { g.banner.life -= dt; if (g.banner.life <= 0) g.banner = null; }

  for (const c of g.clouds) { c.x += 8 * c.s * dt; if (c.x > W + 120) c.x = -160; }
  for (const b of g.birds) { b.x += b.v * dt; if (b.x > W + 40) b.x = -40; }
  g.boatX += 6 * dt; if (g.boatX > W + 80) g.boatX = -80;
  updateEcosystem(dt); updateJumpers(dt);
  if (Math.random() < dt * 3) g.bubbles.push({ x: rand(0, W), y: H - 40, r: rand(3, 7), life: 14 });
  for (const b of g.bubbles) { b.y -= 50 * dt; b.x += Math.sin(b.y / 15) * 0.3; b.life -= dt; }
  g.bubbles = g.bubbles.filter(b => b.y > WATER_Y + 12 && b.life > 0);
  for (const s of g.snow) { s.yf += s.v * dt / (H - WATER_Y); if (s.yf > 1) s.yf = 0; }
}

// ---------- Fish drawing ----------
function bodyPath(c, rx, ry, pointy) {
  c.beginPath(); c.moveTo(rx, 0);
  const c1x = lerp(rx, rx * 0.55, pointy), c1y = lerp(-ry * 1.2, -ry * 0.7, pointy);
  c.bezierCurveTo(c1x, c1y, -rx * 0.1, -ry * 1.15, -rx * 0.85, -ry * 0.28);
  c.lineTo(-rx * 0.85, ry * 0.28);
  c.bezierCurveTo(-rx * 0.1, ry * 1.15, c1x, -c1y, rx, 0);
  c.closePath();
}

function tailPath(c, type, tx, tl, th) {
  c.beginPath(); c.moveTo(tx + 2, 0);
  switch (type) {
    case "fork":  c.lineTo(tx - tl, -th); c.quadraticCurveTo(tx - tl * 0.45, 0, tx - tl, th); break;
    case "fan":   c.bezierCurveTo(tx - tl * 0.3, -th * 1.2, tx - tl, -th * 1.3, tx - tl, -th * 0.6); c.quadraticCurveTo(tx - tl * 0.8, 0, tx - tl, th * 0.6); c.bezierCurveTo(tx - tl, th * 1.3, tx - tl * 0.3, th * 1.2, tx + 2, 0); break;
    case "round": c.quadraticCurveTo(tx - tl * 0.5, -th, tx - tl, -th * 0.5); c.quadraticCurveTo(tx - tl * 0.7, 0, tx - tl, th * 0.5); c.quadraticCurveTo(tx - tl * 0.5, th, tx + 2, 0); break;
    case "shark": c.lineTo(tx - tl * 1.05, -th * 1.7); c.lineTo(tx - tl * 0.55, -th * 0.1); c.lineTo(tx - tl * 0.8, th * 0.9); break;
    case "fluke": c.lineTo(tx - tl, -th * 1.8); c.quadraticCurveTo(tx - tl * 0.6, -th * 0.5, tx - tl * 0.5, 0); c.quadraticCurveTo(tx - tl * 0.6, th * 0.5, tx - tl, th * 1.8); break;
  }
  c.closePath();
}

function dorsalPath(c, type, rx, ry) {
  const top = -ry * 0.85;
  c.beginPath();
  switch (type) {
    case "spikes": {
      const n = 5, x0 = rx * 0.4, x1 = -rx * 0.45;
      c.moveTo(x0, top);
      for (let i = 0; i < n; i++) {
        const a = lerp(x0, x1, i / n), b = lerp(x0, x1, (i + 1) / n);
        c.lineTo((a + b) / 2, top - ry * 0.7); c.lineTo(b, top);
      }
      break;
    }
    case "tri":  c.moveTo(rx * 0.2, top); c.quadraticCurveTo(rx * 0.05, -ry * 2.2, -rx * 0.12, -ry * 2.5); c.lineTo(-rx * 0.4, top); break;
    case "sail": c.moveTo(rx * 0.35, top); c.lineTo(rx * 0.05, -ry * 3.1); c.quadraticCurveTo(-rx * 0.2, -ry * 2, -rx * 0.55, top); break;
    case "soft": c.moveTo(rx * 0.3, top); c.quadraticCurveTo(0, -ry * 2, -rx * 0.5, top); break;
    case "none": c.moveTo(-rx * 0.35, top); c.lineTo(-rx * 0.5, -ry * 1.15); c.lineTo(-rx * 0.6, top); break;
  }
  c.closePath();
}

function star(c, x, y, r) {
  c.beginPath();
  c.moveTo(x, y - r); c.lineTo(x + r * .3, y - r * .3); c.lineTo(x + r, y); c.lineTo(x + r * .3, y + r * .3);
  c.lineTo(x, y + r); c.lineTo(x - r * .3, y + r * .3); c.lineTo(x - r, y); c.lineTo(x - r * .3, y - r * .3); c.closePath();
}

const SPOTS = [[.4, -.35], [.15, -.5], [-.1, -.3], [-.3, -.5], [-.5, -.25], [.05, -.1], [-.25, -.05], [.3, -.05]];

// f = species, len = pixel length, faces right when dir = 1. opts: { dead, silhouette }
function drawFish(c, x, y, f, len, dir = 1, opts = {}) {
  if (f.special) return drawSpecial(c, x, y, f, len, dir, opts);
  const rx = len / 2, ry = len * f.ry;
  const lw = clamp(len / 22, 2, 4.5);
  const finScale = f.finScale || 1;
  const tl = len * (f.tailLen || 0.27), th = ry * (f.tailH || 1);
  const color = opts.silhouette ? "#3a3a4a" : f.color;

  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = "round"; c.lineCap = "round";
  const finFill = () => { c.fillStyle = color; c.fill(); if (!opts.silhouette) { c.fillStyle = "rgba(0,0,0,.14)"; c.fill(); } c.stroke(); };

  // bill (swordfish) sits behind the body
  if (f.bill) {
    c.beginPath(); c.moveTo(rx * 0.8, -ry * 0.18); c.lineTo(rx * 1.5, 0); c.lineTo(rx * 0.8, ry * 0.18); c.closePath();
    c.fillStyle = opts.silhouette ? color : "#cfd8e8"; c.fill(); c.stroke();
  }
  // catfish barbels
  if (f.mouth === "cat") {
    for (const k of [-1, 1]) for (const j of [0.5, 1]) {
      c.beginPath(); c.moveTo(rx * 0.9, ry * 0.15);
      c.quadraticCurveTo(rx * 1.15, ry * (0.15 + k * 0.4 * j), rx * (1.25 + 0.15 * j), ry * (0.3 + k * 0.9 * j)); c.stroke();
    }
  }
  // tail + dorsal
  tailPath(c, f.tail, -rx * 0.82, tl, th); finFill();
  dorsalPath(c, f.dorsal, rx, ry); finFill();

  // body
  bodyPath(c, rx, ry, f.pointy); c.fillStyle = color; c.fill();
  if (!opts.silhouette) {
    c.save(); bodyPath(c, rx, ry, f.pointy); c.clip();
    // belly
    c.fillStyle = "rgba(255,255,255,.4)";
    c.fillRect(-rx, ry * 0.28, rx * 2.2, ry);
    switch (f.deco) {
      case "stripes": c.fillStyle = "rgba(30,60,20,.5)"; for (let i = 0; i < 5; i++) c.fillRect(-rx * 0.55 + i * rx * 0.27, -ry, rx * 0.11, ry * 2); break;
      case "spots": c.fillStyle = "rgba(60,20,40,.55)"; for (const [sx, sy] of SPOTS) { c.beginPath(); c.arc(sx * rx, sy * ry * 2, Math.max(1.5, len / 60), 0, 7); c.fill(); } break;
      case "lateral": c.fillStyle = "rgba(0,40,0,.45)"; c.fillRect(-rx * 0.8, -ry * 0.12, rx * 1.6, ry * 0.26); break;
      case "clown": c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 2; for (const [cx0, w] of [[.42, .16], [-.05, .2], [-.6, .12]]) { c.fillRect(rx * cx0, -ry, rx * w, ry * 2); c.strokeRect(rx * cx0, -ry, rx * w, ry * 2); } break;
      case "koi": c.fillStyle = f.patch || "#ff7a2f"; for (const [sx, sy, r] of [[.3, -.3, .32], [-.2, .1, .4], [-.55, -.25, .28]]) { c.beginPath(); c.ellipse(sx * rx, sy * ry, r * rx * 0.6, r * ry * 1.6, 0.4, 0, 7); c.fill(); } c.fillStyle = "#222"; c.beginPath(); c.arc(-.05 * rx, -.5 * ry, ry * 0.16, 0, 7); c.fill(); break;
      case "glint": c.fillStyle = "rgba(255,255,255,.75)"; c.fillRect(-rx * 0.8, -ry * 0.1, rx * 1.6, ry * 0.22); break;
      case "dots": c.fillStyle = "rgba(20,30,50,.6)"; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(rx * 0.5 - i * rx * 0.24, -ry * 0.3, Math.max(1.2, len / 40), 0, 7); c.fill(); } break;
      case "ear": c.fillStyle = "rgba(10,30,60,.7)"; c.beginPath(); c.ellipse(rx * 0.22, ry * 0.05, ry * 0.2, ry * 0.26, 0, 0, 7); c.fill(); break;
      case "tuna": c.fillStyle = "rgba(10,10,60,.5)"; c.fillRect(-rx, -ry, rx * 2.2, ry * 0.85); c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(-rx, ry * 0.15, rx * 2.2, ry); break;
      case "shark": c.fillStyle = "#f3f7fb"; c.beginPath(); c.moveTo(rx, ry * 0.3); c.quadraticCurveTo(0, ry * 0.05, -rx, ry * 0.3); c.lineTo(-rx, ry); c.lineTo(rx, ry); c.fill();
        c.strokeStyle = "rgba(20,30,50,.6)"; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(rx * (0.05 - i * 0.07), -ry * 0.3); c.lineTo(rx * (-0.02 - i * 0.07), ry * 0.3); c.stroke(); } break;
      case "whale": c.fillStyle = "#e8f0ff"; c.beginPath(); c.moveTo(rx, ry * 0.2); c.quadraticCurveTo(0, -ry * 0.1, -rx, ry * 0.2); c.lineTo(-rx, ry * 1.2); c.lineTo(rx, ry * 1.2); c.fill();
        c.strokeStyle = "rgba(60,90,160,.35)"; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(rx * (0.6 - i * 0.2), ry * 0.22); c.lineTo(rx * (0.6 - i * 0.2), ry * 0.9); c.stroke(); } break;
      case "blotch": c.fillStyle = "rgba(40,25,10,.4)"; for (const [sx, sy] of SPOTS) { c.beginPath(); c.ellipse(sx * rx, sy * ry * 1.6, len / 26, len / 40, 0.5, 0, 7); c.fill(); } break;
      case "shine": c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 2.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-rx * 0.1 - i * rx * 0.25, -ry * 0.1, ry * 0.4, 1.9, 3.7); c.stroke(); } break;
    }
    c.restore();
  }
  bodyPath(c, rx, ry, f.pointy); c.stroke();

  // tuna finlets
  if (f.deco === "tuna" && !opts.silhouette) {
    c.fillStyle = "#ffe04a"; c.lineWidth = Math.max(1.5, lw * 0.6);
    for (let i = 0; i < 3; i++) { const fx = -rx * (0.45 + i * 0.14); c.beginPath(); c.moveTo(fx + 6, -ry * 0.4); c.lineTo(fx, -ry * 0.75); c.lineTo(fx - 5, -ry * 0.3); c.closePath(); c.fill(); c.stroke(); }
  }
  // pectoral fin
  c.lineWidth = lw;
  c.beginPath(); c.moveTo(rx * 0.22, ry * 0.3); c.lineTo(-rx * 0.15 * finScale, ry * 0.95 * finScale + ry * 0.2); c.lineTo(-rx * 0.2, ry * 0.25); c.closePath(); finFill();

  if (!opts.silhouette) {
    // eye
    const ex = rx * (f.eyeX || 0.58), ey = -ry * (f.eyeY || 0.18), er = clamp(ry * (f.eye || 0.32), 2.5, 13);
    if (opts.dead) {
      c.lineWidth = Math.max(2.5, er * 0.35);
      c.beginPath(); c.moveTo(ex - er, ey - er); c.lineTo(ex + er, ey + er); c.moveTo(ex + er, ey - er); c.lineTo(ex - er, ey + er); c.stroke();
    } else {
      c.lineWidth = Math.max(1.5, lw * 0.6);
      c.fillStyle = "#fff"; c.beginPath(); c.arc(ex, ey, er, 0, 7); c.fill(); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.arc(ex + er * 0.25, ey, er * 0.5, 0, 7); c.fill();
    }
    // mouth
    c.lineWidth = Math.max(1.5, lw * 0.7); c.strokeStyle = INK;
    switch (f.mouth) {
      case "small": c.beginPath(); if (opts.dead) { c.moveTo(rx * 0.95, ry * 0.15); c.lineTo(rx * 0.78, ry * 0.1); } else c.arc(rx * 0.78, ry * 0.12, ry * 0.2, 0.2, 1.5); c.stroke(); break;
      case "wide":  c.beginPath(); c.moveTo(rx * 0.98, ry * 0.02); c.lineTo(rx * 0.5, ry * (opts.dead ? 0.2 : 0.12)); c.stroke(); break;
      case "cat":   c.beginPath(); c.moveTo(rx * 0.97, ry * 0.15); c.lineTo(rx * 0.7, ry * 0.25); c.stroke(); break;
      case "shark": {
        c.beginPath(); c.moveTo(rx * 0.85, ry * 0.32); c.quadraticCurveTo(rx * 0.6, ry * 0.5, rx * 0.35, ry * 0.36); c.stroke();
        c.fillStyle = "#fff"; c.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) { const tx = rx * (0.78 - i * 0.12); c.beginPath(); c.moveTo(tx, ry * 0.36 + i * ry * 0.01); c.lineTo(tx - rx * 0.05, ry * 0.36 + ry * 0.2); c.lineTo(tx - rx * 0.1, ry * 0.36); c.closePath(); c.fill(); c.stroke(); }
        break;
      }
      case "whale": c.beginPath(); if (opts.dead) { c.moveTo(rx * 0.85, ry * 0.3); c.lineTo(rx * 0.4, ry * 0.35); } else c.arc(rx * 0.55, ry * 0.05, ry * 0.5, 0.15, 1.15); c.stroke(); break;
    }
    // sparkles for the golden fish
    if (f.sparkle && !opts.dead) {
      const tt = Date.now() / 300;
      c.fillStyle = "#fff8b0"; c.lineWidth = 1.5;
      [[rx * 0.2, -ry * 2.0], [-rx * 0.7, ry * 1.7], [rx * 1.05, -ry * 1.3]].forEach(([sx, sy], i) => { star(c, sx, sy, len * 0.1 * (0.6 + 0.4 * Math.sin(tt + i * 2))); c.fill(); c.stroke(); });
    }
  }
  c.restore();
}


// ---------- Special-shaped fish (not the standard body + tail template) ----------
function xEye(c, x, y, r, dead) {
  c.save();
  if (dead) {
    c.strokeStyle = INK; c.lineWidth = Math.max(2, r * 0.4); c.lineCap = "round";
    c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke();
  } else {
    c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = Math.max(1.5, r * 0.3);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(x + r * 0.25, y, r * 0.5, 0, 7); c.fill();
  }
  c.restore();
}

function drawSpecial(c, x, y, f, len, dir, o) {
  const sil = !!o.silhouette, dead = !!o.dead, col = sil ? "#3a3a4a" : f.color;
  const lw = clamp(len / 24, 2, 4.5), rx = len / 2, t = Date.now() / 1000;
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = "round"; c.lineCap = "round"; c.fillStyle = col;
  switch (f.special) {
    case "puffer": {
      const r = len * 0.4;
      c.beginPath(); c.moveTo(-r * 0.9, 0); c.lineTo(-r * 1.6, -r * 0.5); c.lineTo(-r * 1.6, r * 0.5); c.closePath(); c.fill(); c.stroke();
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        c.beginPath(); c.moveTo(Math.cos(a - 0.17) * r * 0.95, Math.sin(a - 0.17) * r * 0.95); c.lineTo(Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4); c.lineTo(Math.cos(a + 0.17) * r * 0.95, Math.sin(a + 0.17) * r * 0.95); c.closePath(); c.fill(); c.stroke();
      }
      c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
      if (!sil) {
        c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(0, r * 0.78, r * 1.1, r * 0.5, 0, 0, 7); c.fill();
        c.fillStyle = "rgba(120,80,0,.35)"; for (const [sx, sy] of [[-.3, -.4], [0, -.6], [.2, -.3], [-.5, -.1]]) { c.beginPath(); c.arc(sx * r, sy * r, r * 0.07, 0, 7); c.fill(); } c.restore();
        c.fillStyle = col; c.beginPath(); c.moveTo(-r * 0.1, r * 0.1); c.lineTo(-r * 0.5, r * 0.5); c.lineTo(-r * 0.05, r * 0.45); c.closePath(); c.fill(); c.stroke();
        xEye(c, r * 0.4, -r * 0.25, r * 0.24, dead);
        c.beginPath(); if (dead) { c.moveTo(r * 0.88, r * 0.15); c.lineTo(r * 0.62, r * 0.15); } else c.arc(r * 0.82, r * 0.12, r * 0.1, 0, 7); c.stroke();
      }
      break;
    }
    case "eel": {
      const N = 30, amp = len * 0.06, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N; pts.push([rx - u * len * 0.95, Math.sin(u * Math.PI * 3 + (dead ? 0 : t * 3)) * amp * (0.3 + u * 0.7)]); }
      for (const pass of [0, 1]) for (let i = 0; i < N; i++) {
        const u = i / N, w = lerp(len * 0.1, len * 0.03, u);
        c.lineWidth = pass ? w : w + lw * 2; c.strokeStyle = pass ? (sil || i % 8 < 5 ? col : (f.band || "#a6c47a")) : INK;
        c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke();
      }
      c.lineWidth = lw; c.strokeStyle = INK; c.fillStyle = col;
      c.beginPath(); c.ellipse(pts[0][0] - len * 0.02, pts[0][1], len * 0.075, len * 0.055, 0, 0, 7); c.fill(); c.stroke();
      if (!sil) {
        xEye(c, pts[0][0] + len * 0.005, pts[0][1] - len * 0.02, len * 0.025, dead);
        c.beginPath(); c.moveTo(pts[0][0] + len * 0.05, pts[0][1] + len * 0.012); c.lineTo(pts[0][0] - len * 0.01, pts[0][1] + len * 0.02); c.stroke();
      }
      break;
    }
    case "jelly": {
      const r = len * 0.4, by = -len * 0.08;
      for (let k = -2; k <= 2; k++) for (const [cc, w] of [[INK, 5], [col, 2.5]]) {
        c.strokeStyle = cc; c.lineWidth = w; c.beginPath(); const bx = k * r * 0.4; c.moveTo(bx, by);
        for (let s = 1; s <= 6; s++) c.lineTo(bx + Math.sin(t * 3 + s + k) * 4, by + s * len * 0.09);
        c.stroke();
      }
      c.strokeStyle = INK; c.lineWidth = lw;
      c.beginPath(); c.moveTo(-r, by); c.bezierCurveTo(-r, by - r * 1.5, r, by - r * 1.5, r, by);
      for (let i = 0; i < 4; i++) c.quadraticCurveTo(r - (i + 0.5) * r * 0.5, by + r * 0.3, r - (i + 1) * r * 0.5, by);
      c.closePath(); c.save(); c.globalAlpha *= 0.9; c.fillStyle = col; c.fill(); c.restore(); c.stroke();
      if (!sil) {
        c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.ellipse(-r * 0.4, by - r * 0.7, r * 0.22, r * 0.12, -0.5, 0, 7); c.fill();
        xEye(c, -r * 0.28, by - r * 0.28, r * 0.15, dead); xEye(c, r * 0.28, by - r * 0.28, r * 0.15, dead);
      }
      break;
    }
    case "seahorse": {
      const h = len; c.translate(0, h * 0.1);
      const body = () => { c.beginPath(); c.moveTo(0, -h * 0.32); c.bezierCurveTo(h * 0.18, -h * 0.1, -h * 0.12, h * 0.05, 0, h * 0.22); c.bezierCurveTo(h * 0.08, h * 0.4, h * 0.3, h * 0.4, h * 0.28, h * 0.24); c.bezierCurveTo(h * 0.26, h * 0.14, h * 0.16, h * 0.16, h * 0.18, h * 0.24); };
      for (const [cc, w] of [[INK, h * 0.21], [col, h * 0.15]]) { c.strokeStyle = cc; c.lineWidth = w; body(); c.stroke(); }
      c.strokeStyle = INK; c.lineWidth = lw; c.fillStyle = col;
      c.beginPath(); c.arc(0, -h * 0.36, h * 0.13, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.roundRect(h * 0.07, -h * 0.4, h * 0.2, h * 0.07, h * 0.03); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-h * 0.06, -h * 0.47); c.lineTo(-h * 0.14, -h * 0.6); c.lineTo(h * 0.0, -h * 0.5); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = sil ? col : "#ffe066"; c.beginPath(); c.moveTo(-h * 0.03, -h * 0.12); c.lineTo(-h * 0.2, -h * 0.02); c.lineTo(-h * 0.03, h * 0.08); c.closePath(); c.fill(); c.stroke();
      if (!sil) {
        c.lineWidth = 2; c.strokeStyle = "rgba(120,50,0,.5)";
        for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-h * 0.05, -h * 0.2 + i * h * 0.09); c.lineTo(h * 0.08, -h * 0.18 + i * h * 0.09); c.stroke(); }
        xEye(c, h * 0.03, -h * 0.38, h * 0.045, dead);
      }
      break;
    }
    case "angler": {
      const ax = len * 0.42, ay = len * 0.36;
      c.beginPath(); c.moveTo(-ax * 0.8, 0); c.lineTo(-ax * 1.35, -ay * 0.5); c.lineTo(-ax * 1.35, ay * 0.5); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = lw * 1.3; c.beginPath(); c.moveTo(ax * 0.2, -ay * 0.85); c.quadraticCurveTo(ax * 0.7, -ay * 1.9, ax * 1.15, -ay * 1.25); c.stroke();
      const lx = ax * 1.15, ly = -ay * 1.25;
      if (!sil && !dead) {
        const gr = c.createRadialGradient(lx, ly, 1, lx, ly, len * 0.22); gr.addColorStop(0, "rgba(255,255,160,.95)"); gr.addColorStop(1, "rgba(255,255,160,0)");
        c.fillStyle = gr; c.beginPath(); c.arc(lx, ly, len * 0.22, 0, 7); c.fill();
      }
      c.lineWidth = lw; c.fillStyle = sil ? col : "#fff9a0"; c.beginPath(); c.arc(lx, ly, len * 0.045, 0, 7); c.fill(); c.stroke();
      c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, ax, ay, 0, 0, 7); c.fill(); c.stroke();
      if (!sil) {
        c.fillStyle = "rgba(255,255,255,.12)"; c.beginPath(); c.ellipse(-ax * 0.1, -ay * 0.45, ax * 0.55, ay * 0.25, 0, 0, 7); c.fill();
        c.strokeStyle = INK; c.lineWidth = lw; c.beginPath(); c.moveTo(ax * 0.95, ay * 0.1); c.quadraticCurveTo(ax * 0.3, ay * 0.9, -ax * 0.1, ay * 0.35); c.stroke();
        c.fillStyle = "#fff"; c.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const u = (i + 0.5) / 5, p0 = [ax * 0.95, ay * 0.1], p1 = [ax * 0.3, ay * 0.9], p2 = [-ax * 0.1, ay * 0.35];
          const px = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], py = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1];
          c.beginPath(); c.moveTo(px - ax * 0.05, py); c.lineTo(px, py - ay * 0.26); c.lineTo(px + ax * 0.05, py); c.closePath(); c.fill(); c.stroke();
        }
        xEye(c, ax * 0.45, -ay * 0.3, ay * 0.2, dead);
      }
      break;
    }
    case "ray": {
      const ry = len * 0.36;
      c.beginPath(); c.moveTo(-rx * 0.5, 0); c.quadraticCurveTo(-rx * 0.9, ry * 0.25, -rx * 1.25, 0); c.stroke();
      c.beginPath(); c.moveTo(rx * 0.9, 0); c.quadraticCurveTo(rx * 0.4, -ry * 1.2, -rx * 0.2, -ry); c.quadraticCurveTo(-rx * 0.1, -ry * 0.2, -rx * 0.6, 0);
      c.quadraticCurveTo(-rx * 0.1, ry * 0.2, -rx * 0.2, ry); c.quadraticCurveTo(rx * 0.4, ry * 1.2, rx * 0.9, 0); c.closePath(); c.fill(); c.stroke();
      if (!sil) {
        c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(rx * 0.2, 0, rx * 0.4, ry * 0.3, 0, 0, 7); c.fill();
        c.fillStyle = col; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(rx * 0.86, k * ry * 0.08); c.lineTo(rx * 1.12, k * ry * 0.2); c.lineTo(rx * 0.78, k * ry * 0.22); c.closePath(); c.fill(); c.stroke(); }
        xEye(c, rx * 0.6, -ry * 0.16, ry * 0.09, dead); xEye(c, rx * 0.6, ry * 0.16, ry * 0.09, dead);
      }
      break;
    }
    case "octopus": {
      const r = len * 0.3; c.translate(-len * 0.02, -r * 0.35);
      for (let k = 0; k < 6; k++) {
        const bx = -r * 0.8 + k * r * 0.32;
        for (const [cc, w] of [[INK, len * 0.1], [col, len * 0.065]]) {
          c.strokeStyle = cc; c.lineWidth = w; c.beginPath(); c.moveTo(bx, r * 0.5);
          c.bezierCurveTo(bx + Math.sin(t * 2 + k) * 6, r * 1.2, bx - r * 0.5 + Math.cos(t * 2 + k) * 6, r * 1.5, bx - r * 0.2 + (k % 2 ? r * 0.55 : -r * 0.55), r * 1.9); c.stroke();
        }
      }
      c.strokeStyle = INK; c.lineWidth = lw; c.fillStyle = col;
      c.beginPath(); c.ellipse(0, -r * 0.1, r * 0.95, r * 0.9, 0, 0, 7); c.fill(); c.stroke();
      if (!sil) {
        c.fillStyle = "rgba(255,255,255,.28)"; for (const [sx, sy] of [[-.5, -.5], [.1, -.7], [.5, -.4]]) { c.beginPath(); c.arc(sx * r, sy * r, r * 0.1, 0, 7); c.fill(); }
        xEye(c, -r * 0.35, -r * 0.05, r * 0.22, dead); xEye(c, r * 0.35, -r * 0.05, r * 0.22, dead);
        c.beginPath(); if (dead) { c.moveTo(-r * 0.2, r * 0.4); c.lineTo(r * 0.2, r * 0.4); } else c.arc(0, r * 0.2, r * 0.25, 0.3, Math.PI - 0.3); c.stroke();
      }
      break;
    }
  }
  c.restore();
}

// ---------- Scene drawing ----------
function cloud(x, y, s, fill = "#fff") {
  const bumps = [[0, 0, 30], [32, -14, 38], [70, 0, 30], [35, 8, 34]];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  outline(5);
  for (const [bx, by, r] of bumps) { ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = fill;
  for (const [bx, by, r] of bumps) { ctx.beginPath(); ctx.arc(bx, by, r - 1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

function wavePath(yBase, amp, len, speed, phase) {
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) ctx.lineTo(x, yBase + Math.sin(x / len + g.t * speed + phase) * amp);
  ctx.lineTo(W, H); ctx.closePath();
}

// [x fraction, height above the waterline]
const PEAKS = [[0, 20], [0.08, 100], [0.18, 50], [0.30, 135], [0.43, 55], [0.54, 100], [0.67, 42], [0.80, 120], [0.92, 55], [1, 95], [1, 0]];
const hillY = x => WATER_Y - 22 - Math.sin(x / 85) * 14 - Math.sin(x / 33) * 4;

function drawMountains() {
  const pk = PEAKS.map(([xf, h]) => [xf * W, WATER_Y - h]);
  outline(4); ctx.fillStyle = "#a9bdf0";
  ctx.beginPath(); pk.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineTo(0, WATER_Y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; outline(3);
  for (const [x, y] of [pk[1], pk[3], pk[5], pk[7], pk[9]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 26, y + 22); ctx.lineTo(x - 12, y + 30); ctx.lineTo(x, y + 22); ctx.lineTo(x + 12, y + 32); ctx.lineTo(x + 26, y + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = "#63d276"; outline(4);
  ctx.beginPath(); ctx.moveTo(0, WATER_Y + 4);
  for (let x = 0; x <= W; x += 10) ctx.lineTo(x, hillY(x));
  ctx.lineTo(W, WATER_Y + 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let x = 25; x < W; x += 58) {
    const y = hillY(x) + 2, h = 30 + ((x * 7) % 13);
    ctx.fillStyle = "#7a4a1d"; outline(3); ctx.fillRect(x - 3, y - 6, 6, 8);
    ctx.fillStyle = "#1f9d55";
    for (let k = 0; k < 2; k++) {
      const by = y - 6 - k * h * 0.32, w = 15 - k * 4;
      ctx.beginPath(); ctx.moveTo(x, by - h * 0.5); ctx.lineTo(x + w, by); ctx.lineTo(x - w, by); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
}

function drawBoat() {
  const x = g.boatX, y = WATER_Y + Math.sin(g.t * 1.4) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(g.t * 1.4) * 0.03);
  outline(3);
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-2, -52); ctx.lineTo(-30, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ff5a5f"; ctx.beginPath(); ctx.moveTo(4, -8); ctx.lineTo(4, -44); ctx.lineTo(24, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7a4a1d"; ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(32, -8); ctx.lineTo(24, 6); ctx.lineTo(-26, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawBird(b) {
  const flap = Math.sin(g.t * 6 + b.x * 0.05) * 5 * b.s;
  ctx.save(); ctx.translate(b.x, b.y + Math.sin(g.t + b.x * 0.02) * 4);
  outline(3); ctx.beginPath(); ctx.moveTo(-14 * b.s, flap); ctx.quadraticCurveTo(-6 * b.s, -8 * b.s, 0, 0); ctx.quadraticCurveTo(6 * b.s, -8 * b.s, 14 * b.s, flap); ctx.stroke();
  ctx.restore();
}

function drawSkyVisitor() {
  const o = g.sky; if (!o) return;
  const face = o.v > 0 ? 1 : -1;
  ctx.save(); ctx.translate(o.x, o.y + Math.sin(g.t * 1.2) * (o.kind === "balloon" ? 5 : 1.5));
  if (o.kind === "plane") {
    // contrail
    for (let i = 1; i <= 9; i++) { ctx.fillStyle = `rgba(255,255,255,${0.75 - i * 0.075})`; ctx.beginPath(); ctx.arc(-face * (34 + i * 14), Math.sin(i) * 2, 5 + i * 0.9, 0, 7); ctx.fill(); }
    ctx.scale(face, 1); outline(3);
    ctx.fillStyle = "#8fa3b8"; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-22, -22); ctx.lineTo(-10, -22); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); // far wing
    ctx.fillStyle = "#ff5a5f"; ctx.beginPath(); ctx.moveTo(-32, -2); ctx.lineTo(-40, -22); ctx.lineTo(-28, -22); ctx.lineTo(-18, -2); ctx.closePath(); ctx.fill(); ctx.stroke(); // tail
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(0, 0, 38, 12, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ff5a5f"; ctx.fillRect(-26, 1, 44, 4);
    ctx.fillStyle = "#8ddcff"; ctx.beginPath(); ctx.ellipse(18, -4, 8, 5, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#b8c4d4"; ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-24, 24); ctx.lineTo(-10, 24); ctx.lineTo(10, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); // near wing
    ctx.save(); ctx.translate(40, 0); ctx.scale(1, Math.sin(g.t * 40)); ctx.fillStyle = INK; ctx.fillRect(-2, -14, 4, 28); ctx.restore(); // propeller
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(39, 0, 3, 0, 7); ctx.fill();
    if (Math.floor(g.t * 2) % 2) { ctx.fillStyle = "#ff3b3b"; ctx.beginPath(); ctx.arc(-38, -22, 3, 0, 7); ctx.fill(); } // blinking light
  } else {
    outline(3);
    const cols = ["#ff5a5f", "#ffd23f", "#4d9dff", "#ffd23f", "#ff5a5f"];
    // ropes run from the envelope down to the corners of the basket
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath();
    for (const [x1, y1, x2] of [[-19, 30, -13], [19, 30, 13], [-8, 36, -6], [8, 36, 6]]) { ctx.moveTo(x1, y1); ctx.lineTo(x2, 58); }
    ctx.stroke();
    const flame = 1 + Math.sin(g.t * 14) * 0.15; // burner flame between envelope and basket
    ctx.fillStyle = "#ffb02a"; ctx.beginPath(); ctx.moveTo(-4, 50); ctx.quadraticCurveTo(0, 38 - 6 * flame, 4, 50); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#a0703a"; outline(3); ctx.beginPath(); ctx.roundRect(-15, 58, 30, 19, 4); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-15, 65); ctx.lineTo(15, 65); ctx.moveTo(-5, 58); ctx.lineTo(-5, 77); ctx.moveTo(5, 58); ctx.lineTo(5, 77); ctx.stroke();
    // striped envelope
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 32, 38, 0, 0, 7); ctx.clip();
    cols.forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(-32 + i * 12.8, -40, 13, 80); });
    ctx.restore(); outline(3); ctx.beginPath(); ctx.ellipse(0, 0, 32, 38, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = "#ff5a5f"; ctx.beginPath(); ctx.moveTo(-10, 36); ctx.lineTo(10, 36); ctx.lineTo(4, 42); ctx.lineTo(-4, 42); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawHorizonGlow() {
  const rise = Math.max(0, 1 - Math.abs(g.tod - 6.2) / 1.6), set = Math.max(0, 1 - Math.abs(g.tod - 18.5) / 1.7);
  for (const [k, x, col] of [[rise, W * 0.3, "255,170,90"], [set, W * 0.7, "255,110,70"]]) {
    if (k < 0.02) continue;
    ctx.save(); ctx.translate(x, WATER_Y - 20); ctx.scale(2.4, 1);
    const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, 150); gr.addColorStop(0, `rgba(${col},${0.75 * k})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 150, Math.PI, 0); ctx.fill(); ctx.restore();
    // glitter on the water
    ctx.save(); ctx.translate(x, WATER_Y + 2); ctx.scale(2.4, 1);
    const wg = ctx.createRadialGradient(0, 0, 4, 0, 0, 120); wg.addColorStop(0, `rgba(${col},${0.45 * k})`); wg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI); ctx.fill(); ctx.restore();
  }
}

function drawBackground() {
  const sk = skyState(g.tod), dark = sk.dark, rain = g.rain, M = curMap();
  if (M.sky) { const ta = M.sky.amt * (1 - dark * 0.65); sk.top = sk.top.map((v, i) => lerp(v, M.sky.top[i], ta)); sk.bot = sk.bot.map((v, i) => lerp(v, M.sky.bot[i], ta)); }
  const grey = [112, 122, 138];
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y);
  sky.addColorStop(0, mixRGB(sk.top, grey, rain * 0.65)); sky.addColorStop(1, mixRGB(sk.bot, grey, rain * 0.55));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // stars + moon at night
  const nightA = clamp((dark - 0.35) / 0.65, 0, 1) * (1 - rain * 0.85);
  if (nightA > 0.02) {
    ctx.fillStyle = "#fff";
    for (const s of g.stars) { ctx.globalAlpha = nightA * (0.55 + 0.45 * Math.sin(g.t * 2 + s.ph)); ctx.beginPath(); ctx.arc(s.x, s.yf * WATER_Y * 0.8, s.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    const hh = g.tod < 12 ? g.tod + 24 : g.tod, u = clamp((hh - 19) / 10, 0, 1);
    const mx = lerp(W - 200, 200, u), my = WATER_Y * 0.62 - Math.sin(u * Math.PI) * WATER_Y * 0.42;
    ctx.globalAlpha = nightA;
    const glow = ctx.createRadialGradient(mx, my, 10, mx, my, 90); glow.addColorStop(0, "rgba(255,248,200,.5)"); glow.addColorStop(1, "rgba(255,248,200,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(mx, my, 90, 0, 7); ctx.fill();
    outline(4); ctx.fillStyle = "#fff8d6"; ctx.beginPath(); ctx.arc(mx, my, 30, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(190,180,140,.5)"; for (const [cx, cy, r] of [[-9, -6, 6], [8, 8, 5], [6, -12, 3.5]]) { ctx.beginPath(); ctx.arc(mx + cx, my + cy, r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  if (M.drawSkyExtra) M.drawSkyExtra(dark, rain);
  // clouds (greyer at night and in rain)
  const cFill = mixRGB(mixRGB([255, 255, 255], [150, 160, 190], dark * 0.7).match(/\d+/g).map(Number), [120, 128, 142], rain * 0.7);
  if (settings.clouds) for (const c of g.clouds) cloud(c.x, c.y, c.s, cFill);
  if (rain > 0.02 && settings.clouds) {
    ctx.globalAlpha = rain;
    for (let i = 0; i < 7; i++) cloud(i * (W / 6) - 60 + Math.sin(g.t * 0.2 + i) * 20, 18 + (i % 2) * 22, 1.5, "#66707f");
    ctx.globalAlpha = 1;
  }
  if (settings.sky && dark < 0.6 && rain < 0.5) { ctx.globalAlpha = 1 - dark; for (const b of g.birds) drawBird(b); ctx.globalAlpha = 1; }
  if (settings.sky) drawSkyVisitor();
  drawHorizonGlow();
  M.drawFar();

  // ---- ocean: from the surface down to the deep ----
  const water = ctx.createLinearGradient(0, WATER_Y, 0, H);
  for (const [st, col] of M.water) water.addColorStop(st, col);
  ctx.fillStyle = water; wavePath(WATER_Y, 4, 38, 1.6, 0); ctx.fill();
  outline(4); ctx.beginPath();
  for (let x = 0; x <= W; x += 10) { const y = WATER_Y + Math.sin(x / 38 + g.t * 1.6) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();

  // sunbeams under the surface (fade with depth, night and rain)
  const beam = 0.07 * (1 - dark) * (1 - rain * 0.6);
  if (beam > 0.003) {
    for (let i = 0; i < 7; i++) {
      const x = i * W / 6 + Math.sin(g.t * 0.3 + i) * 30;
      const gr = ctx.createLinearGradient(0, WATER_Y, 0, H * 0.85); gr.addColorStop(0, `rgba(255,255,255,${beam * 2})`); gr.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x - 20, WATER_Y); ctx.lineTo(x + 20, WATER_Y); ctx.lineTo(x + 110, H * 0.85); ctx.lineTo(x - 70, H * 0.85); ctx.closePath(); ctx.fill();
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const x = ((i * 170 + g.t * 12) % (W + 100)) - 50, y = WATER_Y + 40 + (i % 4) * 40;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50, y); ctx.stroke();
  }

  drawSeabed();

  // ambient fish (real species, deeper = stranger)
  drawReefBack();
  if (settings.bgFish) drawEcoFish();
  drawReefFront();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 2;
  if (settings.bubbles) for (const b of g.bubbles) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke(); }
  ctx.fillStyle = "rgba(220,240,255,.5)";
  for (const s of g.snow) { ctx.beginPath(); ctx.arc(s.x + Math.sin(g.t + s.yf * 20) * 6, WATER_Y + 30 + s.yf * (H - WATER_Y - 30), 1.8, 0, 7); ctx.fill(); }
}

function drawSeabed() {
  const fl = H - 36;
  if (curMap().wreck) { ctx.save(); ctx.translate(W * 0.36, fl + 6); ctx.rotate(-0.12); outline(4);
  ctx.fillStyle = "#6b4a2a"; ctx.beginPath(); ctx.moveTo(-90, -40); ctx.lineTo(90, -46); ctx.lineTo(70, 0); ctx.lineTo(-70, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#4a321c"; ctx.fillRect(-4, -110, 8, 70); ctx.strokeRect(-4, -110, 8, 70);
  ctx.fillStyle = "#c9b98a"; ctx.beginPath(); ctx.moveTo(4, -106); ctx.lineTo(44, -80); ctx.lineTo(4, -62); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#8ddcff"; for (const px of [-50, -20, 10, 40]) { ctx.beginPath(); ctx.arc(px, -22, 7, 0, 7); ctx.fill(); ctx.stroke(); }
  ctx.restore(); }

  // sand
  ctx.fillStyle = curMap().sand; outline(4);
  ctx.beginPath(); ctx.moveTo(-4, H + 4);
  for (let x = -4; x <= W + 20; x += 20) ctx.lineTo(x, fl + Math.sin(x / 110) * 8);
  ctx.lineTo(W + 4, H + 4); ctx.closePath(); ctx.fill(); ctx.stroke();

  outline(4); ctx.fillStyle = curMap().rock;
  for (const r of g.deco.rocks) { ctx.beginPath(); ctx.ellipse(r.x, fl + 6, 26 * r.s, 15 * r.s, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  for (const c of g.deco.coral) {
    for (const [col, w] of [[INK, 12 * c.s], [c.col, 6.5 * c.s]]) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath();
      ctx.moveTo(c.x, fl + 4); ctx.lineTo(c.x, fl - 34 * c.s); ctx.moveTo(c.x, fl - 18 * c.s); ctx.lineTo(c.x - 15 * c.s, fl - 38 * c.s); ctx.moveTo(c.x, fl - 12 * c.s); ctx.lineTo(c.x + 15 * c.s, fl - 32 * c.s); ctx.stroke();
    }
  }
  ctx.strokeStyle = curMap().kelpCol; ctx.lineWidth = 8;
  for (const k of g.deco.kelp) {
    ctx.beginPath(); ctx.moveTo(k.x, fl + 4);
    const segs = Math.round(k.h / 16);
    for (let s = 1; s <= segs; s++) ctx.lineTo(k.x + Math.sin(g.t * 1.4 + s * 0.7 + k.ph) * (4 + s), fl + 4 - s * 16);
    ctx.stroke();
  }
}

function drawDock() {
  const fl = H - 36;
  ctx.fillStyle = "#7a4a1d"; outline(4);
  for (const px of [50, 190, 320, 400]) { ctx.fillRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); ctx.strokeRect(px - 10, DECK_Y + 16, 20, fl - DECK_Y - 12); }
  ctx.fillStyle = "#d9954f";
  ctx.fillRect(-10, DECK_Y, 430, 18); ctx.strokeRect(-10, DECK_Y, 430, 18);
  ctx.lineWidth = 3;
  for (let x = 30; x < 420; x += 44) { ctx.beginPath(); ctx.moveTo(x, DECK_Y); ctx.lineTo(x, DECK_Y + 18); ctx.stroke(); }
  ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.beginPath(); ctx.moveTo(-10, DECK_Y + 4); ctx.lineTo(418, DECK_Y + 4); ctx.stroke();

  // lantern post at the end of the dock (its glow is drawn after the night tint)
  outline(4); ctx.fillStyle = "#7a4a1d";
  ctx.fillRect(316, DECK_Y - 120, 12, 120); ctx.strokeRect(316, DECK_Y - 120, 12, 120);
  ctx.fillStyle = "#ffe066"; ctx.beginPath(); ctx.roundRect(308, DECK_Y - 152, 28, 30, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(304, DECK_Y - 152); ctx.lineTo(322, DECK_Y - 166); ctx.lineTo(340, DECK_Y - 152); ctx.closePath(); ctx.fill();
}

function drawBucket() {
  const bs = bucketScale();
  ctx.save(); ctx.translate(BUCKET_X, DECK_Y); ctx.scale(bs, bs);
  { const w = g.wob || 0, s = Math.abs(Math.sin(g.t * 22)); ctx.rotate(Math.sin(g.t * 30) * 0.1 * w); ctx.scale(1 + 0.1 * w * s, 1 - 0.12 * w * s); } // wobbles when a fish lands
  drawBucketArt(ctx, tier("bucket"));
  ctx.restore();
}

// Bucket back rim is drawn first so fish drop *into* the bucket and vanish behind the front.
function drawBucketBack() {
  const bs = bucketScale();
  ctx.save(); ctx.translate(BUCKET_X, DECK_Y); ctx.scale(bs, bs);
  { const w = g.wob || 0, s = Math.abs(Math.sin(g.t * 22)); ctx.rotate(Math.sin(g.t * 30) * 0.1 * w); ctx.scale(1 + 0.1 * w * s, 1 - 0.12 * w * s); }
  outline(4); ctx.fillStyle = "#3a2a3a";
  ctx.beginPath(); ctx.ellipse(0, -36, 28, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawDead() {
  for (const d of g.dead) {
    const len = d.f.len * d.mul;
    ctx.save(); ctx.globalAlpha = clamp(d.life, 0, 1);
    drawFish(ctx, d.x, DECK_Y - len * d.f.ry - 1, d.f, len, 1, { dead: true });
    ctx.restore();
  }
}

function drawChair() {
  if (!settings.tired) return;
  const cs = chairScale();
  ctx.save(); ctx.translate(CHAIR_X, DECK_Y); ctx.scale(cs, cs); drawChairArt(ctx, tier("chair")); ctx.restore();
}

function drawStickman() {
  const sit = g.sit || 0, ss = sit * sit * (3 - 2 * sit);
  const tip = rodTip(), hp = handPos();
  const lean0 = g.mode === "windup" ? -6 : (g.mode === "reel" ? 4 + Math.sin(g.t * 16) * 2 : (g.mode === "catch" ? -8 : 0));
  const lean = lean0 - 5 * ss;
  const seatTop = 26 * chairScale();
  const bx = 190 + lean0 * 0.5 - (190 - CHAIR_X) * ss;
  const hipY = lerp(DECK_Y - 42, DECK_Y - seatTop - 5, ss), neckY = hipY - 50 + 0 * ss;
  const rk = myRank(), hx = bx + lean * 1.3, G = { bx, lean, hipY, neckY, hx, footY: DECK_Y };
  const body = () => { outline(7); ctx.strokeStyle = "#111"; };
  outfitBack(ctx, rk, G);
  body();
  const hip = { x: bx, y: hipY };
  const fA = { x: lerp(bx - 18, bx + 30, ss), y: DECK_Y }, fB = { x: lerp(bx + 20, bx + 24, ss), y: DECK_Y };
  const kA = { x: lerp((bx + bx - 18) / 2, bx + 26, ss), y: lerp((hipY + DECK_Y) / 2, hipY + 3, ss) };
  const kB = { x: lerp((bx + bx + 20) / 2, bx + 20, ss), y: lerp((hipY + DECK_Y) / 2, hipY + 6, ss) };
  drawLegsPose(ctx, rk, hip, kA, fA, kB, fB);
  body();
  ctx.beginPath(); ctx.moveTo(bx, hipY); ctx.lineTo(bx + lean, neckY); ctx.stroke();
  outfitTorso(ctx, rk, G);
  body();
  const sh = { x: bx + lean, y: neckY + 8 };
  const a = g.rodAngle * Math.PI / 180;
  const back = { x: hp.x - Math.cos(a) * 18, y: hp.y - Math.sin(a) * 18 };
  ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x + 8, sh.y + 14); ctx.lineTo(hp.x, hp.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x + 2, sh.y + 22); ctx.lineTo(back.x, back.y); ctx.stroke();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(hx, neckY - 16, 17, 0, Math.PI * 2); ctx.fill();
  if (g.mode === "rest" && sit > 0.5) { // eyes shut
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(hx + 4, neckY - 19); ctx.lineTo(hx + 12, neckY - 19); ctx.stroke();
  } else {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx + 8, neckY - 19, 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(hx + 10, neckY - 19, 2, 0, 7); ctx.fill();
  }
  outfitHead(ctx, rk, G);
  drawCosHat(ctx, hx, neckY - 16 - 20);

  ctx.save(); { const sf = rodSkinFilter(); if (sf) ctx.filter = sf; } drawRod(ctx, back.x, back.y, tip.x, tip.y, tier("rod")); ctx.restore(); // rod skins
  ctx.fillStyle = RODS[tier("rod") - 1].reel; outline(3);
  const rx = hp.x + Math.cos(a) * 14, ry = hp.y + Math.sin(a) * 14 + 8;
  ctx.beginPath(); ctx.arc(rx, ry, 7, 0, 7); ctx.fill(); ctx.stroke();

  if (g.mode === "rest" && sit > 0.7) { // Z z z
    for (let k = 0; k < 3; k++) {
      const ph = (g.t * 0.6 + k / 3) % 1;
      ctx.save(); ctx.translate(hx + 26 + k * 8, neckY - 36 - ph * 40); ctx.scale(-1, 1); ctx.globalAlpha = 1 - ph;
      ctx.font = (16 + k * 5) + "px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.strokeStyle = INK; ctx.lineWidth = 4;
      ctx.strokeText("Z", 0, 0); ctx.fillText("Z", 0, 0); ctx.restore();
    }
  }
}

function hookDepth() { return 40 + g.dist * (H - WATER_Y - 150); } // farther cast = deeper water

function drawHook(x, y) {
  ctx.save(); ctx.lineCap = "round";
  for (const [col, w] of [[INK, 4.5], ["#e6edf5", 2]]) {
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 3); ctx.arc(x - 5, y + 3, 5, 0, Math.PI * 0.9); ctx.stroke();
  }
  ctx.restore();
}

function drawLine() {
  if (g.mode === "catch" || g.mode === "rest") return; // fish is flying, or he is asleep
  const lt = tier("line"), tip = rodTipWorld(), b = g.bobber;
  const sag = (g.mode === "flight" || g.mode === "windup") ? 10 : (g.mode === "reel" ? 6 : 22);
  strokeLine(ctx, lt, tip.x, tip.y, (tip.x + b.x) / 2, Math.max(tip.y, b.y) + sag, b.x, b.y);

  const hk = hookPos(), hx = hk.x, hy = hk.y;
  strokeLine(ctx, lt, b.x, b.y, (b.x + hx) / 2, (b.y + hy) / 2, hx, hy - 9, 0.6);
  drawBait(ctx, tier("bait"), hx - 3, hy + 9, 1);
  drawHook(hx, hy);

  drawBobber(ctx, lt, b.x, b.y, 1);
  if (g.mode === "bite" || g.mode === "fight") {
    ctx.save(); ctx.translate(b.x, b.y - 30 - Math.sin(g.timer * 20) * 4); ctx.scale(-1, 1); // undo the scene mirror so the text reads normally
    ctx.fillStyle = "#ff5a5f"; ctx.font = "44px Bangers, Impact, sans-serif"; ctx.textAlign = "center";
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeText("!", 0, 0); ctx.fillText("!", 0, 0);
    ctx.restore();
  }
}

// The fish is only shown once it leaves the water.
function paintFish(f, L, dir, dead, alpha, shiny) {
  ctx.save(); ctx.globalAlpha = alpha;
  if (shiny) { ctx.shadowColor = "#ffe066"; ctx.shadowBlur = 26; }
  if (f.junk) drawJunk(ctx, 0, 0, f, L, dir); else drawFish(ctx, 0, 0, f, L, dir, { dead });
  ctx.shadowBlur = 0;
  if (shiny) { ctx.fillStyle = "#fff8b0"; ink(2); for (const [sx, sy, r] of [[-L * 0.45, -L * 0.3, 9], [L * 0.1, L * 0.35, 7], [L * 0.5, -L * 0.2, 8]]) { star(ctx, sx, sy, r * (0.6 + 0.4 * Math.sin(g.t * 10 + sx))); ctx.fill(); ctx.stroke(); } }
  ctx.restore();
}

// The fish is on screen from the moment it swims up to the hook until it drops into the bucket.
function drawHookedFish() {
  const e = g.escape;
  if (e) { ctx.save(); ctx.translate(e.x, e.y); paintFish(e.f, e.L, e.side || 1, false, clamp(e.life / 0.6, 0, 1), e.shiny); ctx.restore(); }
  const f = g.fish; if (!f) return;
  const L = f.len * bigMul();
  if (g.mode === "wait" || g.mode === "bite" || g.mode === "fight" || g.mode === "reel") {
    const p = fishPose(); if (!p) return;
    if ((g.multi || 1) > 1 && g.mode !== "wait") for (let i = 1; i < g.multi; i++) { ctx.save(); ctx.translate(p.x - p.dir * 0 + (g.fishSide || 1) * i * L * 0.22, p.y + (i % 2 ? 1 : -1) * (10 + i * 8)); ctx.rotate(p.rot * 0.7 + i * 0.12); paintFish(f, L * 0.92, p.dir, false, 0.95, g.shiny); ctx.restore(); }
    ctx.save(); if (g.mystery) ctx.filter = "brightness(0)"; ctx.translate(p.x, p.y); ctx.rotate(p.rot); paintFish(f, L, p.dir, false, 0.97, g.shiny); ctx.restore();
    return;
  }
  if (g.mode !== "catch") return;
  const from = g.catchFrom, to = g.catchTo, bs = bucketScale();
  let x, y, sc = 1, dead = false;
  if (g.timer < FLIGHT) {
    const u = g.timer / FLIGHT;
    x = lerp(from.x, to.x, u);
    y = lerp(from.y + 10, to.y, easeOut(u)) - Math.sin(u * Math.PI) * Math.min(190, WATER_Y - 40);
    if (g.fits) sc = lerp(1, Math.min(1, 38 * bs / L), u);
  } else {
    const v = clamp((g.timer - FLIGHT) / DROP, 0, 1);
    x = to.x;
    if (g.fits) {
      sc = Math.min(1, 38 * bs / L);
      y = lerp(to.y, DECK_Y - 12, v * v);
    } else {
      const floorY = DECK_Y - L * f.ry - 1;
      y = lerp(to.y, floorY, v * v) - Math.abs(Math.sin(v * Math.PI * 2)) * 16 * (1 - v);
      dead = v > 0.6;
    }
  }
  const spin = g.timer < FLIGHT ? -(g.timer / FLIGHT) * Math.PI * 2 : 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin); ctx.scale(sc, sc);
  if ((g.multi || 1) > 1) for (let i = 1; i < g.multi; i++) { ctx.save(); ctx.translate(i * L * 0.2, (i % 2 ? 1 : -1) * (10 + i * 8)); ctx.rotate(i * 0.15); paintFish(f, L * 0.92, -1, dead || (!g.fits && g.timer >= FLIGHT), 1, g.shiny); ctx.restore(); }
  paintFish(f, L, -1, dead || (!g.fits && g.timer >= FLIGHT), 1, g.shiny);
  ctx.restore();
}

function drawFront() {
  if (g.mode === "wait") {
    for (let i = 0; i < 2; i++) {
      const ph = ((g.t * 0.8 + i * 0.5) % 1);
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - ph)})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(g.bobber.x, WATER_Y + 8, 10 + ph * 26, 3 + ph * 6, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.fillStyle = curMap().front;
  wavePath(WATER_Y + 6, 4, 30, 2.2, 1.5); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= W; x += 10) { const y = WATER_Y + 6 + Math.sin(x / 30 + g.t * 2.2 + 1.5) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();

  ctx.fillStyle = "#d9f4ff"; outline(2);
  for (const p of g.particles) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.stroke(); }
}

function drawRain() {
  if (g.rain < 0.03) return;
  const wk = curMap().weather, n = Math.round(g.drops.length * g.rain);
  if (wk.kind === "snow") {
    ctx.fillStyle = `rgba(255,255,255,${0.85 * g.rain})`;
    for (let i = 0; i < n; i++) { const d = g.drops[i]; ctx.beginPath(); ctx.arc(d.x, d.y, 1.6 + (d.v % 3) * 0.6, 0, 7); ctx.fill(); }
    return;
  }
  if (wk.kind === "petals") { // drifting cherry blossom petals
    ctx.fillStyle = `rgba(${wk.color},${0.9 * g.rain})`;
    for (let i = 0; i < n; i++) { const d = g.drops[i]; ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(g.t * 2 + d.v); ctx.beginPath(); ctx.ellipse(0, 0, 4, 2.2, 0, 0, 7); ctx.fill(); ctx.restore(); }
    return;
  }
  ctx.save(); ctx.strokeStyle = `rgba(${wk.color},${0.6 * g.rain})`; ctx.lineWidth = wk.kind === "ember" || wk.kind === "meteor" ? 3 : 2; ctx.lineCap = "round";
  if (wk.kind === "ember") { ctx.shadowColor = "#ff7a2f"; ctx.shadowBlur = 8; }
  if (wk.kind === "meteor") { ctx.shadowColor = `rgb(${wk.color})`; ctx.shadowBlur = 10; }
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const d = g.drops[i]; ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - (wk.kind === "meteor" ? 14 : 4), d.y + (wk.kind === "ember" ? 10 : wk.kind === "meteor" ? 24 : 18)); }
  ctx.stroke(); ctx.restore();
  if (wk.kind !== "rain") return;
  ctx.lineWidth = 2;
  for (const r of g.ripples) { const p = 1 - r.life / 0.7; ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - p)})`; ctx.beginPath(); ctx.ellipse(r.x, WATER_Y + 6, 3 + p * 12, 1 + p * 3, 0, 0, 7); ctx.stroke(); }
}

// darkening for night / storms, then light sources on top so they glow
function drawLighting() {
  const dark = skyState(g.tod).dark;
  const a = clamp(0.5 * dark + 0.25 * g.rain, 0, 0.7);
  if (a > 0.01) { ctx.fillStyle = `rgba(4,10,40,${a})`; ctx.fillRect(0, 0, W, H); }
  const glowA = clamp(dark * 0.9 + g.rain * 0.3, 0.12, 1);
  const lampP = deckXform(322, DECK_Y - 137), lx = lampP.x, ly = lampP.y, R = 55 + 90 * glowA;
  const glow = ctx.createRadialGradient(lx, ly, 3, lx, ly, R); glow.addColorStop(0, `rgba(255,236,150,${0.75 * glowA})`); glow.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(lx, ly, R, 0, 7); ctx.fill();
  if (glowA > 0.4) { // lantern light on the water
    const wg = ctx.createRadialGradient(lx, WATER_Y + 6, 4, lx, WATER_Y + 6, 120); wg.addColorStop(0, `rgba(255,236,150,${0.35 * glowA})`); wg.addColorStop(1, "rgba(255,236,150,0)");
    ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(lx, WATER_Y + 10, 130, 26, 0, 0, 7); ctx.fill();
  }
  if (state.map === "volcano") { // the volcano lights up the whole scene
    const vx = W * 0.66, vy = WATER_Y - 200, vg = ctx.createRadialGradient(vx, vy, 10, vx, vy, 540); vg.addColorStop(0, "rgba(255,120,40,.38)"); vg.addColorStop(1, "rgba(255,90,30,0)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  if (state.map === "lake" && dark > 0.25) { // cabin window glows at night
    const wgl = ctx.createRadialGradient(-3, DECK_Y - 43, 2, -3, DECK_Y - 43, 90); wgl.addColorStop(0, `rgba(255,220,120,${0.7 * dark})`); wgl.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = wgl; ctx.beginPath(); ctx.arc(-3, DECK_Y - 43, 90, 0, 7); ctx.fill();
  }
  if (g.flash > 0.01) { ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.6})`; ctx.fillRect(0, 0, W, H); }
}

function chip(text, x, y, bg) {
  ctx.save(); ctx.font = "22px Bangers, Impact, sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = bg; outline(3); ctx.beginPath(); ctx.roundRect(x, y, w, 34, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillText(text, x + 12, y + 18); ctx.restore();
}

function barChip(label, frac, col, x, y) {
  ctx.save(); const w = 232, h = 30;
  ctx.fillStyle = "rgba(255,255,255,.9)"; outline(3); ctx.beginPath(); ctx.roundRect(x, y, w, h, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, Math.max(6, (w - 6) * clamp(frac, 0, 1)), h - 6, 9); ctx.fill();
  ctx.fillStyle = INK; ctx.font = "18px Bangers, Impact, sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText(label, x + w / 2, y + h / 2 + 1); ctx.restore();
}

function drawHUD() {
  ctx.save(); ctx.translate(0, WATER_Y + 36); // the money sits a bit down in the water
  ctx.fillStyle = "rgba(255,255,255,.92)"; outline(5);
  ctx.beginPath(); ctx.roundRect(14, 14, 330, 86, 20); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(60, 57, 29, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.font = "40px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("$", 60, 59);
  ctx.textAlign = "left"; ctx.font = "56px Bangers, Impact, sans-serif"; g.moneyShown = g.moneyShown == null ? state.money : g.moneyShown + (state.money - g.moneyShown) * 0.14; if (Math.abs(state.money - g.moneyShown) < 1) g.moneyShown = state.money; ctx.fillText(fmt(Math.round(g.moneyShown)), 102, 60); // the number rolls up
  ctx.fillStyle = "rgba(255,255,255,.92)"; outline(4); ctx.beginPath(); ctx.roundRect(14, 108, 200, 58, 16); ctx.fill(); ctx.stroke(); // gems
  drawGemIcon(ctx, 50, 138, 21); ctx.fillStyle = INK; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.font = "42px Bangers, Impact, sans-serif"; ctx.fillText(String(state.gems || 0), 84, 140);
  ctx.restore();
  // the only other thing on the side: a warning that shows up just before the line snaps
  if (settings.snap && snapChance() >= 0.06) {
    const pulse = 0.5 + 0.5 * Math.sin(g.t * 8), txt = "YOUR LINE IS ABOUT TO SNAP! Re-string it in the Lines shop";
    ctx.save(); ctx.font = "26px Bangers, Impact, sans-serif"; ctx.textBaseline = "middle"; const w = ctx.measureText(txt).width + 30;
    ctx.fillStyle = `rgba(255,${90 + pulse * 60},${95 + pulse * 40},.96)`; outline(4); ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, 14, w, 44, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(txt, W / 2, 37); ctx.restore();
  }
  // rank progress circle (top right): money and kinds of fish together
  { const P = rankProgress(), cx = W - 66, cy = 66, R = 46;
    ctx.save(); ctx.fillStyle = "rgba(255,255,255,.92)"; outline(5); ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 11; ctx.lineCap = "round"; ctx.strokeStyle = "#e3e9f2"; ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, 7); ctx.stroke();
    if (P.pct > 0.005) { ctx.strokeStyle = P.max ? "#ffb020" : "#4fd66b"; ctx.beginPath(); ctx.arc(cx, cy, R - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * P.pct); ctx.stroke(); }
    ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "30px Bangers, Impact, sans-serif"; ctx.fillText(P.max ? "MAX" : Math.floor(P.pct * 100) + "%", cx, cy + 1);
    ctx.font = "16px Bangers, Impact, sans-serif"; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.fillStyle = "#fff"; ctx.strokeText("NEXT RANK", cx, cy + R + 22); ctx.fillText("NEXT RANK", cx, cy + R + 22);
    ctx.restore(); }
  { const n = claimableCount(), txt = n ? `REWARDS (${n})` : "REWARDS"; if (rewBtn.textContent !== txt) rewBtn.textContent = txt; } // ready rewards show on the button, not on screen
  const hints = { wait: "Waiting for a bite...", reel: settings.manual ? "Reeling in... (manual mode reels 30% faster)" : "Reeling in... CLICK to reel faster!" };
  if (settings.manual && g.mode === "idle" && g.timer > 0.3 && !story.active && !licenseBlocked()) hints.idle = g.holding ? "Move the mouse UP / DOWN to pick the arc  -  RELEASE to throw!" : "HOLD the mouse down, then move UP / DOWN to change the arc, RELEASE to throw  (farther = deeper = rarer fish)  -  wind " + (windPush() > 3 ? "<<" : windPush() < -3 ? ">>" : "calm");
  if (hints[g.mode]) {
    ctx.save(); ctx.font = "26px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.fillStyle = "#fff";
    ctx.strokeText(hints[g.mode], W / 2, 108); ctx.fillText(hints[g.mode], W / 2, 108); ctx.restore();
  }
  if (g.holding && manualReady()) { // throw power meter
    ctx.save(); ctx.fillStyle = "rgba(255,255,255,.92)"; outline(4); ctx.beginPath(); ctx.roundRect(W / 2 - 150, 122, 300, 30, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = g.power > 0.85 ? "#ff5a5f" : g.power > 0.5 ? "#ffd23f" : "#4fd66b"; ctx.beginPath(); ctx.roundRect(W / 2 - 150, 122, Math.max(10, 300 * g.power), 30, 12); ctx.fill();
    ctx.fillStyle = INK; ctx.font = "20px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("THROW POWER " + Math.round(g.power * 100) + "%", W / 2, 138); ctx.restore();
  }
  if (g.clickBoost > 0.005) { // click-speed meter
    const pct = Math.round(g.clickBoost * 100), fillW = 220 * (g.clickBoost / CLICK_MAX);
    ctx.save(); ctx.fillStyle = "rgba(255,255,255,.9)"; outline(3); ctx.beginPath(); ctx.roundRect(W / 2 - 110, 122, 220, 22, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = pct >= 60 ? "#ff5a5f" : "#4fd66b"; ctx.beginPath(); ctx.roundRect(W / 2 - 110, 122, Math.max(8, fillW), 22, 10); ctx.fill();
    ctx.fillStyle = INK; ctx.font = "18px Bangers, Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("REEL SPEED +" + pct + "%", W / 2, 134); ctx.restore();
  }
  if (g.banner) {
    const a = clamp(g.banner.life / 0.4, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center";
    ctx.font = "50px Bangers, Impact, sans-serif"; ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.fillStyle = g.banner.color;
    const y = 165 - (1 - a) * 10;
    ctx.strokeText(g.banner.text, W / 2, y); ctx.fillText(g.banner.text, W / 2, y);
    if (g.banner.sub) { ctx.font = "28px Bangers, Impact, sans-serif"; ctx.lineWidth = 6; ctx.fillStyle = g.banner.subColor || "#fff"; ctx.strokeText(g.banner.sub, W / 2, y + 34); ctx.fillText(g.banner.sub, W / 2, y + 34); }
    ctx.restore();
  }
  if (g.rewardToast) {
    const a = clamp(g.rewardToast.life / 0.5, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.font = "34px Bangers, Impact, sans-serif"; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.fillStyle = "#c8f7c5";
    ctx.strokeText(g.rewardToast.text, W / 2, 232); ctx.fillText(g.rewardToast.text, W / 2, 232); ctx.restore();
  }
  if (g.confetti) for (const c of g.confetti) { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = c.col; ctx.fillRect(-5, -3, 10, 6); ctx.restore(); }
  if (g.rankBanner) {
    const rb = g.rankBanner, al = clamp(rb.life / 0.6, 0, 1), pop = 1 + Math.max(0, rb.life - 3.7) * 1.4;
    ctx.save(); ctx.globalAlpha = al; ctx.textAlign = "center"; ctx.translate(W / 2, WATER_Y + 90); ctx.scale(pop, pop); ctx.lineJoin = "round"; ctx.strokeStyle = INK;
    ctx.font = "76px Bangers, Impact, sans-serif"; ctx.lineWidth = 14; ctx.fillStyle = "#ffd23f"; ctx.strokeText("RANK UP!", 0, 0); ctx.fillText("RANK UP!", 0, 0);
    ctx.font = "54px Bangers, Impact, sans-serif"; ctx.lineWidth = 11; ctx.fillStyle = "#fff"; ctx.strokeText(rb.name.toUpperCase(), 0, 56); ctx.fillText(rb.name.toUpperCase(), 0, 56);
    ctx.font = "26px Bangers, Impact, sans-serif"; ctx.lineWidth = 7; ctx.strokeText("You look more like a real pro now!", 0, 94); ctx.fillText("You look more like a real pro now!", 0, 94);
    ctx.restore();
  }
  for (const p of g.popups) {
    ctx.save(); ctx.globalAlpha = clamp(p.life, 0, 1); ctx.textAlign = "center"; ctx.font = (p.size || 34) + "px Bangers, Impact, sans-serif";
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.fillStyle = p.color; ctx.strokeText(p.text, p.x, p.y); ctx.fillText(p.text, p.x, p.y); ctx.restore();
  }
}

function drawAim() { // the curved throw line (manual mode)
  if (!settings.manual || g.mode !== "idle" || story.active || licenseBlocked() || menu.open) return;
  const st = rodTipWorld(), landX = manualLandX(g.holding ? g.power : g.lastPower, g.aim), arcH = manualArcH(g.aim), ly = WATER_Y + 6;
  const pts = []; for (let i = 0; i <= 32; i++) { const u = i / 32; pts.push([lerp(st.x, landX, u), lerp(st.y, ly, u) - Math.sin(u * Math.PI) * arcH]); }
  const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.setLineDash([]); ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.globalAlpha = 0.6; path(); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.setLineDash([12, 10]); ctx.lineDashOffset = -g.t * 40; ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; path(); ctx.stroke(); ctx.setLineDash([]);
  if (g.lastLandX) { ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(g.lastLandX, ly + 6, 20, 6, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); } // where the last throw landed
  const pulse = 1 + Math.sin(g.t * 6) * 0.08; // landing target on the water
  ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(landX, ly + 6, 26 * pulse, 8 * pulse, 0, 0, 7); ctx.stroke();
  ctx.strokeStyle = "#ff5a5f"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(landX, ly + 6, 26 * pulse, 8 * pulse, 0, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(landX - 8, ly); ctx.lineTo(landX + 8, ly + 12); ctx.moveTo(landX + 8, ly); ctx.lineTo(landX - 8, ly + 12); ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.save(); funShakeApply();
  // scene is authored dock-left; mirror it so the dock sits on the right
  ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1);
  { const z = g.zoom || 1; if (z > 1.001 && g.land) { const zx = g.land.x, zy = WATER_Y + 90; ctx.translate(zx, zy); ctx.scale(z, z); ctx.translate(-zx, -zy); } } // a little zoom when a fish bites
  drawBackground();
  // boats and ice floes rock on the waves; the dock and the volcano pier do not
  const M = curMap(), bob = deckBob(), whole = !!(M.bob && M.bob.whole), buckMove = !!(M.bob && M.bob.bucket);
  const moved = fn => { ctx.save(); applyDeck(ctx); fn(); ctx.restore(); };
  if (whole) moved(() => M.drawPlatform()); else M.drawPlatform();
  moved(() => { drawDead(); drawChair(); ctx.save(); ctx.translate(extraShakeX(), -extraJumpY()); drawStickman(); ctx.restore(); funDrawPet(); extraDrawDock(); });
  drawLine();
  drawAim();
  drawVisitor();
  if (buckMove) moved(drawBucketBack); else drawBucketBack();
  drawHookedFish();
  if (buckMove) moved(drawBucket); else drawBucket();
  drawJumpers();
  drawFront();
  drawRain();
  drawLighting();
  ctx.restore();
  funDrawWorld();
  moreDrawWorld();
  extraDrawWorld();
  drawHUD();
  extraDrawHUD();
  funDrawHUD();
  ctx.restore();
}

// ---------- UI ----------
const modalEl = document.getElementById("modal");
const bodyEl = document.getElementById("modalBody");
const tabsEl = document.getElementById("tabs");
const moneyText = () => fmt(state.money) + "   \u25C6 " + (state.gems || 0); // money and gems
const modal = { open: false, tab: "rod", start: "" };
const SHOP_TABS = ["rod", "line", "bait", "bucket", "chair", "strength", "pets"];
const PAGE_TITLE = { rod: "Rods", line: "Lines", bait: "Baits", bucket: "Buckets", chair: "Chairs", strength: "Food", pets: "Pets", rewards: "Rewards", fun: "Boosts", book: "Fish Book", settings: "Settings" };
const rewBtn = document.getElementById("rewBtn");

function openModal(tab, startKind) { if (g.mode === "fight") return; if (typeof story !== "undefined" && story.active) return; // no shopping while the fisherman is talking
  modal.open = true; modal.tab = tab; modal.start = startKind || ""; modalEl.classList.toggle("startmode", !!startKind); modalEl.hidden = false; refreshModal(); }
function closeModal() { modal.open = false; modal.start = ""; modalEl.classList.remove("startmode"); modalEl.hidden = true; }

function refreshModal() {
  if (!modal.open) return;
  document.getElementById("modalMoney").textContent = moneyText();
  const shop = SHOP_TABS.includes(modal.tab), i = SHOP_TABS.indexOf(modal.tab);
  tabsEl.textContent = PAGE_TITLE[modal.tab] + (shop ? `  (${i + 1}/${SHOP_TABS.length})` : "");
  document.getElementById("navL").hidden = document.getElementById("navR").hidden = !shop;
  bodyEl.classList.toggle("withnav", shop);
  const side = document.getElementById("shopSide"); side.hidden = !shop; // every shop section listed on the right
  if (shop) { side.innerHTML = ""; for (const k of SHOP_TABS) { const b = document.createElement("button"); b.className = "sidebtn" + (k === modal.tab ? " on" : ""); b.textContent = PAGE_TITLE[k]; b.onclick = () => { modal.tab = k; bodyEl.scrollTop = 0; refreshModal(); }; side.appendChild(b); } }
  if (modal.tab === "book") renderCollection(); else if (modal.tab === "settings") renderSettings(); else if (modal.tab === "rewards") renderRewards(); else if (modal.tab === "fun") renderFun(); else if (modal.tab === "pets") renderPets(); else renderShop();
}
const shopStep = d => { const n = SHOP_TABS.length; modal.tab = SHOP_TABS[(SHOP_TABS.indexOf(modal.tab) + d + n) % n]; bodyEl.scrollTop = 0; refreshModal(); };
document.getElementById("navL").onclick = () => shopStep(-1);
document.getElementById("navR").onclick = () => shopStep(1);

function renderShop() {
  const cat = CATS[modal.tab];
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  if (modal.tab === "line" && settings.snap) {
    const wr = document.createElement("div"); wr.className = "wearrow";
    const S = lineLife(), used = state.lineUses || 0, cost = restringCost();
    wr.innerHTML = `<span>Your line has been reeled <b>${used}</b> times. It starts getting risky after about <b>${Math.round(lineRiskStart())}</b>.</span>`;
    const rb = document.createElement("button"); rb.className = "act"; rb.textContent = `RE-STRING ${fmt(cost)}`; rb.disabled = used === 0 || state.money < cost;
    rb.onclick = () => { if (state.money < cost) return; state.money -= cost; state.lineUses = 0; save(); Snd.equip(); refreshModal(); };
    wr.appendChild(rb); bodyEl.appendChild(wr);
  }
  { const hint = document.createElement("div"); hint.className = "shophint"; hint.textContent = shopHint(modal.tab); bodyEl.appendChild(hint); } // what to save up for
  const grid = document.createElement("div"); grid.className = "grid";
  cat.items.forEach((item, i) => {
    const t = i + 1, owned = state.owned[modal.tab].includes(t), equipped = state.equipped[modal.tab] === t;
    const price = shopPrice(modal.tab, t), sale = isSale(modal.tab, t);
    const card = document.createElement("div"); card.className = "card" + (equipped ? " equipped" : "") + (!owned && !modal.start && state.money >= price ? " afford" : "");
    const c = document.createElement("canvas"); c.width = 200; c.height = 110;
    drawItemIcon(c.getContext("2d"), modal.tab, t);
    card.appendChild(c);
    card.insertAdjacentHTML("beforeend", `<b>${item.name}</b><small>${cat.stat(t)}</small>` + (sale && !owned ? '<i class="sale">SALE -30% today!</i>' : "") + (modal.tab === "rod" && owned && masteryStars(t) ? `<small>${"\u2605".repeat(masteryStars(t))} mastery</small>` : ""));
    const btn = document.createElement("button");
    if (modal.start) { btn.textContent = equipped ? "EQUIPPED" : owned ? "OWNED" : fmt(price); btn.disabled = true; btn.className = equipped ? "on" : ""; }
    else if (equipped) { btn.textContent = "EQUIPPED"; btn.className = "on"; btn.disabled = true; }
    else if (owned) { btn.textContent = "EQUIP"; btn.className = "equip"; btn.onclick = () => { state.equipped[modal.tab] = t; save(); Snd.equip(); refreshModal(); }; }
    else {
      btn.textContent = "BUY " + fmt(price); btn.disabled = state.money < price;
      btn.onclick = () => {
        if (state.money < price) return;
        state.money -= price; state.owned[modal.tab].push(t); state.equipped[modal.tab] = t; save(); Snd.buy(); refreshModal();
      };
    }
    card.appendChild(btn);
    const gp = gemPrice(modal.tab, t); // good gear can also be bought with gems
    if (!owned && !modal.start && gp) {
      const gb = document.createElement("button"); gb.className = "gembtn"; gb.textContent = "\u25C6 " + gp; gb.disabled = (state.gems || 0) < gp;
      gb.onclick = () => { if ((state.gems || 0) < gp) return; state.gems -= gp; state.owned[modal.tab].push(t); state.equipped[modal.tab] = t; save(); Snd.buy(); refreshModal(); };
      card.appendChild(gb);
    }
    grid.appendChild(card);
  });
  bodyEl.appendChild(grid);
  bodyEl.scrollTop = scroll;
}

function switchMap() {
  g.mode = "idle"; g.timer = 0; g.fish = null; g.dead = []; g.particles = []; g.rodTarget = -55; g.dist = 0;
  if (curMap().noWeather) { g.raining = false; g.rain = 0; }
  spriteCache.clear(); buildEcosystem();
  g.banner = { text: `Welcome to ${curMap().name}`, sub: `Fish sell for x${mapT().sell}`, life: 2.8, color: "#fff", subColor: "#ffd23f" };
  Snd.chime(); refreshModal();
}

function renderMaps() {
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  const grid = document.createElement("div"); grid.className = "grid maps";
  for (const id of MAP_ORDER) {
    const M = MAPS[id], owned = state.ownedMaps.includes(id), here = state.map === id;
    const card = document.createElement("div"); card.className = "card" + (here ? " equipped" : "");
    const c = document.createElement("canvas"); c.width = 400; c.height = 220; drawMapIcon(c.getContext("2d"), id); card.appendChild(c);
    const count = FISH.filter(f => f.maps.includes(id)).length;
    card.insertAdjacentHTML("beforeend", `<b>${M.name}</b><small>${M.blurb}</small><small>Fish sell x${M.mult} &middot; ${count} kinds of fish</small>`);
    const btn = document.createElement("button");
    if (here) { btn.textContent = "YOU ARE HERE"; btn.className = "on"; btn.disabled = true; }
    else if (owned) { btn.textContent = "TRAVEL"; btn.className = "equip"; btn.onclick = () => { state.map = id; save(); switchMap(); }; }
    else {
      btn.textContent = "BUY " + fmt(M.price); btn.disabled = state.money < M.price;
      btn.onclick = () => { if (state.money < M.price) return; state.money -= M.price; state.ownedMaps.push(id); state.map = id; save(); Snd.buy(); switchMap(); };
    }
    card.appendChild(btn); grid.appendChild(card);
  }
  bodyEl.appendChild(grid); bodyEl.scrollTop = scroll;
}

let bookMap = "all";
function renderCollection() {
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  const bar = document.createElement("div"); bar.className = "seg bookbar";
  for (const id of ["all", ...MAP_ORDER]) {
    const b = document.createElement("button"); b.textContent = id === "all" ? "All" : MAPS[id].name; b.className = id === bookMap ? "on" : "";
    b.onclick = () => { bookMap = id; renderCollection(); }; bar.appendChild(b);
  }
  bodyEl.appendChild(bar);
  const grid = document.createElement("div"); grid.className = "grid";
  const list = FISH.filter(f => bookMap === "all" || f.maps.includes(bookMap)).sort((a, b) => a.rarity - b.rarity || a.value - b.value);
  for (const f of list) {
    const n = state.caught[f.name] || 0, R = RARITIES[f.rarity], shiny = state.shiny[f.name] || 0;
    const slot = document.createElement("div"); slot.className = "card slot"; slot.style.borderColor = R.col;
    const c = document.createElement("canvas"); c.width = 240; c.height = 120;
    drawFish(c.getContext("2d"), 125, 62, f, f.len * 0.72, 1, { silhouette: !n });
    slot.appendChild(c);
    slot.insertAdjacentHTML("beforeend", n
      ? `<b>${f.name}</b><small style="color:${R.col};font-weight:700">${R.name}</small><small>x${n} &middot; ${fmt(f.value)} &middot; Size ${f.size}${shiny ? " &middot; &#9733;" + shiny : ""}</small>${bookExtra(f)}`
      : `<b>???</b><small style="color:${R.col};font-weight:700">${R.name}</small><small>Size ${f.size}</small>`);
    grid.appendChild(slot);
  }
  bodyEl.appendChild(grid); bodyEl.scrollTop = scroll;
  const found = FISH.filter(f => state.caught[f.name]).length;
  tabsEl.textContent = `Fish Book  ${found}/${FISH.length}`;
}

const toggleModal = tab => {
  const same = tab === "shop" ? SHOP_TABS.includes(modal.tab) : modal.tab === tab;
  if (modal.open && same) closeModal(); else openModal(tab === "shop" ? (SHOP_TABS.includes(modal.tab) ? modal.tab : "rod") : tab);
};
document.getElementById("shopBtn").onclick = () => toggleModal("shop");
document.getElementById("rewBtn").onclick = () => toggleModal("rewards");
document.getElementById("boostBtn").onclick = () => toggleModal("fun");
document.getElementById("colBtn").onclick = () => toggleModal("book");
document.getElementById("setBtn").onclick = () => toggleModal("settings");
document.getElementById("closeBtn").onclick = closeModal;
document.getElementById("modeBtn").onclick = () => { settings.manual = !settings.manual; saveSettings(); updateModeBtn(); g.aimLock = null; };
updateModeBtn();
window.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if (!settings.manual || /INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) return;
  if (!g.holding) { if (e.code === "Space" && g.mode === "idle") { e.preventDefault(); if (!e.repeat) manualHold(); } return; } // arrows only work while the throw is being held
  if (e.key === "ArrowUp" || e.key === "w") g.aim = clamp(g.aim + 0.03, 0, 1);
  else if (e.key === "ArrowDown" || e.key === "s") g.aim = clamp(g.aim - 0.03, 0, 1);
  else if (e.code === "Space" && g.mode === "idle") { e.preventDefault(); if (!e.repeat) manualHold(); }
});
window.addEventListener("keyup", e => { if (e.code === "Space") manualRelease(); });
window.addEventListener("pointerup", () => { ex.reelHold = false; manualRelease(); });
window.addEventListener("pointermove", e => { // mouse height bends the throw
  if (!settings.manual || !g.holding) return; // the arc only changes while the mouse is held down
  const r = canvas.getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom) return;
  g.aim = clamp(1 - ((e.clientY - r.top) / r.height - 0.12) / 0.76, 0, 1); // mouse height picks how high the arc bends
});

// ---------- Clicking speeds up the reel ----------
const CLICK_MAX = 0.6, CLICK_STEP = 0.06;
canvas.addEventListener("pointerdown", e => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
  if (funClick(x, y)) return;
  if (settings.manual) { if (g.mode === "reel") { ex.reelHold = true; extraReelClick(); } else manualHold(); return; } // manual mode: hold to charge, release to throw; there is no +1 clicking
  g.clickBoost = Math.min(CLICK_MAX, g.clickBoost + CLICK_STEP);
  { const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 18; popup("+1", x + Math.cos(a) * d, y + Math.sin(a) * d, "#fff", 0.8, 30); } // +1 pops up on a random side of the pointer
  Snd.reelTick();
});

// ---------- Codes ----------
const CODES = { "0517": { money: 100000, gems: 500 } };
function redeemCode(raw) {
  const code = String(raw).trim().toLowerCase();
  if (!code) return { ok: false, msg: "Type a code first." };
  const c = CODES[code];
  if (!c) return { ok: false, msg: "That code isn't valid." };
  state.money += c.money; state.gems = (state.gems || 0) + (c.gems || 0); save(); Snd.buy(); // codes can be used as many times as you like
  checkStory(); // the fisherman comes right away if this pushed you to $20,000+
  popup("+" + fmt(c.money) + (c.gems ? "  +" + c.gems + " gems" : ""), 380, 50, "#ffd23f", 2, 40);
  document.getElementById("modalMoney").textContent = moneyText();
  return { ok: true, msg: "Code accepted! +" + fmt(c.money) + (c.gems ? " and " + c.gems + " gems" : "") };
}

// ---------- Settings tab ----------
function renderSettings() {
  const scroll = bodyEl.scrollTop;
  bodyEl.innerHTML = "";
  const wrap = document.createElement("div"); wrap.className = "settings";
  const section = title => { const d = document.createElement("div"); d.className = "sect"; d.innerHTML = `<h3>${title}</h3>`; wrap.appendChild(d); return d; };
  const row = (parent, label, note) => { const r = document.createElement("div"); r.className = "row"; const l = document.createElement("label"); l.innerHTML = label + (note ? `<small>${note}</small>` : ""); r.appendChild(l); parent.appendChild(r); return r; };
  const toggle = (parent, key, label, note, after) => {
    const r = row(parent, label, note), b = document.createElement("button");
    const paint = () => { b.className = "sw" + (settings[key] ? " on" : ""); b.textContent = settings[key] ? "ON" : "OFF"; };
    paint(); b.onclick = () => { settings[key] = !settings[key]; saveSettings(); Snd.apply(); Snd.toggle(settings[key]); if (after) after(); paint(); };
    r.appendChild(b);
  };
  const slider = (parent, key, label, preview) => {
    const r = row(parent, label), i = document.createElement("input");
    i.type = "range"; i.min = 0; i.max = 100; i.value = Math.round(settings[key] * 100);
    i.oninput = () => { settings[key] = i.value / 100; saveSettings(); Snd.apply(); };
    i.onchange = () => { if (preview) preview(); };
    r.appendChild(i);
  };

  const audio = section("Audio");
  toggle(audio, "music", "Music", "Chill lo-fi music to relax to");
  slider(audio, "musicVol", "Music volume");
  toggle(audio, "sfx", "Sound effects", "Splashes, reeling, catches");
  slider(audio, "sfxVol", "Effects volume", () => Snd.catchGood(false, false));
  toggle(audio, "ambient", "Ambience", "Water and rain sounds");
  slider(audio, "ambVol", "Ambience volume");
  toggle(audio, "keys", "Clicky keys", "Keyboard clicks on buttons and key presses");
  toggle(audio, "newCatch", "New catch sound", "A special jingle the first time you catch a kind of fish", () => { if (settings.newCatch) Snd.newCatchPreview(); });

  const world = section("World");
  {
    const note = g.lock && g.lock.mode !== "day" ? `Turns back into day in ${Math.ceil(g.lock.left)}s` : "Auto runs the full sunrise, day, sunset and night cycle";
    const r = row(world, "Time of day", note);
    const seg = document.createElement("div"); seg.className = "seg";
    for (const [mode, label] of [["auto", "Auto"], ["sunrise", "Sunrise"], ["day", "Day"], ["sunset", "Sunset"], ["night", "Night"]]) {
      const b = document.createElement("button"); b.textContent = label;
      b.className = mode === (g.lock ? g.lock.mode : "auto") ? "on" : "";
      b.onclick = () => setTimeMode(mode); seg.appendChild(b);
    }
    r.appendChild(seg);
  }
  toggle(world, "clouds", "Clouds", "Show clouds in the sky");
  toggle(world, "rain", "Rain", "Random short showers (bigger fish, slower bites)", () => { if (!settings.rain) g.raining = false; renderSettings(); });
  {
    const r = row(world, "Make it rain now", curMap().noWeather ? "No weather on this map" : "A short shower");
    const b = document.createElement("button"); b.className = "act"; b.textContent = "RAIN"; b.disabled = !settings.rain || !!curMap().noWeather;
    b.onclick = () => { g.raining = true; g.rainClock = rand(12, 20); };
    r.appendChild(b);
  }

  const look = section("Scenery");
  toggle(look, "sky", "Sky visitors", "Birds, planes and hot-air balloons");
  toggle(look, "bgFish", "Ocean life", "The fish, turtles, jellyfish and crabs of the reef");
  toggle(look, "bubbles", "Bubbles", "Bubbles rising from the sea floor");
  toggle(look, "chips", "Info badges", "Time of day and rain badges");

  const ex = section("Extras");
  toggle(ex, "combo", "Catch combos", "Catch fish in a row for a money multiplier (junk or a snap breaks it)", () => { fx.combo = 0; });
  toggle(ex, "daily", "Daily challenges", "Login streak bonus and 3 daily goals");
  toggle(ex, "legend", "Legendary fish fights", "Now and then a golden shadow brings a tension mini-game");
  toggle(ex, "multi", "Multi catches", "Very rarely a strong rod and line hauls in 2 or 3 fish at once", () => {});
  toggle(ex, "bonuses", "Lucky bonuses", "Discovery bonus for each new fish, a lucky x3 every 25th catch, and a Fish of the Day worth x3", () => {});
  toggle(ex, "events", "Special events", "Hot spots, Golden Hour, mystery bites, slow-motion and rare-fish warnings", () => {});
  toggle(ex, "chests", "Treasure chests and bottles", "Loot floats by - click it!");
  toggle(ex, "storm", "Storm events", "Rare fish bite more, but your line wears faster");
  toggle(ex, "pets", "Pets on the dock", "Adopted pets bring you fish");
  toggle(ex, "titles", "Title under the stickman", "Shows your favourite achievement title");
  toggle(ex, "fx", "Big effects", "Coin fountains, screen shake and rings on big catches");

  const codes = section("Codes");
  {
    const r = row(codes, "Redeem a code", "Got a secret code? Type it here (works every time)");
    const inp = document.createElement("input"); inp.type = "text"; inp.className = "codebox"; inp.placeholder = "Enter code"; inp.maxLength = 16; inp.autocomplete = "off"; inp.spellcheck = false;
    const b = document.createElement("button"); b.className = "act"; b.textContent = "REDEEM";
    const msg = document.createElement("div"); msg.className = "codemsg";
    const go = () => { const res = redeemCode(inp.value); msg.textContent = res.msg; msg.style.color = res.ok ? "#1e9e5a" : "#c0392b"; if (res.ok) inp.value = ""; };
    b.onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); };
    r.appendChild(inp); r.appendChild(b); codes.appendChild(msg);
  }

  const data = section("Game");
  toggle(data, "license", "Fishing license", "Renew every " + LICENSE_CASTS + " casts (click the warning), or the ranger takes your fishing gear", () => { renderSettings(); });
  if (licenseOn() && state.license.has) {
    const r = row(data, "Renew license now", "Pay the fee early and get " + LICENSE_CASTS + " fresh casts");
    const b = document.createElement("button"); b.className = "act"; b.textContent = "RENEW " + fmt(licenseFee()); b.disabled = (state.license.casts || 0) === 0;
    b.onclick = () => { renewLicense(); renderSettings(); };
    r.appendChild(b);
  }
  toggle(data, "skipIntro", "Skip the start screen", "The game opens straight into fishing (the MENU button still opens the start screen)", () => {});
  toggle(data, "cb", "Colour-blind colours", "Rarity colours that are easier to tell apart", () => applyPalette());
  extraSettings(data, row);
  toggle(data, "manual", "Manual casting", "You throw the line yourself: hold the mouse to charge the power, move up/down to pick the arc, release to throw. Reeling is 30% faster and +1 clicking is off", () => updateModeBtn());
  toggle(data, "tired", "Tiredness and breaks", "He gets tired and sits on the chair to rest", () => { renderSettings(); });
  toggle(data, "snap", "Line wear and snapping", "Lines wear out and can snap (you lose money)", () => { renderSettings(); });
  {
    const r = row(data, "Reset progress", "Wipes EVERYTHING and starts a brand new game (asks first)");
    const b = document.createElement("button"); b.className = "act danger"; b.textContent = "RESET";
    b.onclick = () => { document.getElementById("resetAsk").hidden = false; };
    r.appendChild(b);
  }
  {
    const r = row(data, "Default settings", "Put every setting back");
    const b = document.createElement("button"); b.className = "act"; b.textContent = "DEFAULTS";
    b.onclick = () => { Object.assign(settings, DEFAULT_SETTINGS); saveSettings(); Snd.apply(); renderSettings(); };
    r.appendChild(b);
  }
  bodyEl.appendChild(wrap);
  bodyEl.scrollTop = scroll;
}

document.getElementById("resetNo").onclick = () => { document.getElementById("resetAsk").hidden = true; };
document.getElementById("resetYes").onclick = () => {
  window.__resetting = true; // nothing may save again
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(JAIL_KEY); } catch (e) {}
  location.reload();
};
window.addEventListener("resize", layout);
layout();

// ---------- Loop ----------
let last = performance.now();
function frame(now) {
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (g.slow > 0) { g.slow -= dt; dt *= 0.25; } // slow motion
  if (menu.open) { Snd.setRain(0); requestAnimationFrame(frame); return; } // the start screen is showing
  if (g.paused) { draw(); requestAnimationFrame(frame); return; }
  update(dt); draw(); Snd.setRain(g.rain * ({ rain: 1, ember: 0.4, snow: 0.12, petals: 0.1, meteor: 0.3 }[curMap().weather.kind]));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
