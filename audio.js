"use strict";
// Settings + all sound. Everything is synthesized with WebAudio, so there are no audio files.

const SETTINGS_KEY = "pwrfisher_settings_v1";
const DEFAULT_SETTINGS = {
  music: true, musicVol: 0.5,
  sfx: true, sfxVol: 0.8,
  ambient: true, ambVol: 0.5,
  keys: true, newCatch: true, manual: false, skipIntro: false, cb: false, events: true, bonuses: true, combo: true, multi: true, daily: true, legend: true, chests: true, storm: true, pets: true, titles: true, fx: true, license: true, tired: true, snap: true,
  clouds: true, rain: true, sky: true, bgFish: true, bubbles: true, chips: true,
};
const settings = (() => {
  try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(SETTINGS_KEY))); }
  catch (e) { return Object.assign({}, DEFAULT_SETTINGS); }
})();
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {} }

const Snd = (() => {
  let ac = null, master, musicBus, sfxBus, ambBus, musicIn, delayIn, noiseBuf, rainGain, waterGain;
  let nextChord = 0, chordIdx = 0;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function reverb(seconds, decay) {
    const conv = ac.createConvolver(), len = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    conv.buffer = buf; return conv;
  }

  function init() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicBus = ac.createGain(); sfxBus = ac.createGain(); ambBus = ac.createGain();
    for (const b of [musicBus, sfxBus, ambBus]) b.connect(master);

    // shared white noise
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // music: dry + reverb + echo
    musicIn = ac.createGain(); musicIn.connect(musicBus);
    const mrev = reverb(3.2, 2.4), mrevGain = ac.createGain(); mrevGain.gain.value = 0.7;
    musicIn.connect(mrev); mrev.connect(mrevGain); mrevGain.connect(musicBus);
    delayIn = ac.createGain(); const delay = ac.createDelay(1.5), fb = ac.createGain();
    delay.delayTime.value = 0.46; fb.gain.value = 0.38; delayIn.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(musicIn);

    // sfx reverb (for bells)
    sfxRev = reverb(1.3, 3); const srg = ac.createGain(); srg.gain.value = 0.5; sfxRev.connect(srg); srg.connect(sfxBus);

    // ambience: rain hiss + gentle water lapping
    const rs = ac.createBufferSource(); rs.buffer = noiseBuf; rs.loop = true;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7000;
    rainGain = ac.createGain(); rainGain.gain.value = 0; rs.connect(hp); hp.connect(lp); lp.connect(rainGain); rainGain.connect(ambBus); rs.start();
    const ws = ac.createBufferSource(); ws.buffer = noiseBuf; ws.loop = true; ws.playbackRate.value = 0.6;
    const wl = ac.createBiquadFilter(); wl.type = "lowpass"; wl.frequency.value = 420;
    waterGain = ac.createGain(); waterGain.gain.value = 0.16;
    const lfo = ac.createOscillator(), lfoG = ac.createGain(); lfo.frequency.value = 0.13; lfoG.gain.value = 0.09; lfo.connect(lfoG); lfoG.connect(waterGain.gain); lfo.start();
    ws.connect(wl); wl.connect(waterGain); waterGain.connect(ambBus); ws.start();

    apply(true);
    scheduleMusic(); setInterval(scheduleMusic, 1000);
    const hint = document.getElementById("soundHint"); if (hint) hint.hidden = true;
  }
  let sfxRev;

  function apply(instant) {
    if (!ac) return;
    const set = (node, v) => { if (instant) node.gain.value = v; else node.gain.setTargetAtTime(v, ac.currentTime, 0.08); };
    set(musicBus, settings.music ? settings.musicVol * 0.9 : 0);
    set(sfxBus, settings.sfx ? settings.sfxVol : 0);
    set(ambBus, settings.ambient ? settings.ambVol : 0);
  }
  function setRain(r) { if (ac) rainGain.gain.setTargetAtTime(r * 0.55, ac.currentTime, 0.4); }

  // ---------- building blocks ----------
  function noise(dest, t, dur, o) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ac.createBiquadFilter(); f.type = o.type || "bandpass"; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.freq, t); if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(o.freqEnd, t + dur);
    const g = ac.createGain(); const peak = o.gain || 0.3, att = o.attack || 0.003;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function tone(dest, t, o) {
    const osc = ac.createOscillator(); osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(o.f, t); if (o.fEnd) osc.frequency.exponentialRampToValueAtTime(o.fEnd, t + o.dur);
    const g = ac.createGain(); const att = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.gain || 0.3, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g); g.connect(dest); osc.start(t); osc.stop(t + o.dur + 0.05);
  }
  function bell(dest, t, f, gain = 0.22, dur = 1.1, wet = true) {
    tone(dest, t, { f, dur, gain, type: "sine" });
    tone(dest, t, { f: f * 2.76, dur: dur * 0.4, gain: gain * 0.25, type: "sine" });
    if (wet) { tone(sfxRev, t, { f, dur, gain: gain * 0.5, type: "sine" }); }
  }
  const on = () => ac && settings.sfx;
  const T = () => ac.currentTime;

  // ---------- music: chill lo-fi, slow and soft ----------
  const BEAT = 60 / 72, CHORD_DUR = BEAT * 8;
  const PROG = [
    { bass: 41, notes: [57, 60, 64, 67] },   // Fmaj9
    { bass: 40, notes: [55, 59, 62, 64] },   // Em7
    { bass: 38, notes: [53, 57, 60, 64] },   // Dm9
    { bass: 43, notes: [53, 59, 62, 64] },   // G13
  ];
  const MELODY = [64, 67, 69, 72, 74, 76, 79];
  // a different feel for different places: every map plays one of these tracks
  const TRACKS = {
    default: { prog: PROG, mel: MELODY, shift: 0 },
    neon:  { prog: [{ bass: 45, notes: [57, 60, 64, 67] }, { bass: 41, notes: [53, 57, 60, 64] }, { bass: 36, notes: [55, 60, 64, 67] }, { bass: 43, notes: [55, 59, 62, 66] }], mel: [69, 72, 76, 79, 81, 84], shift: 0, arp: true },
    sky:   { prog: [{ bass: 36, notes: [60, 64, 67, 71] }, { bass: 43, notes: [59, 62, 67, 71] }, { bass: 45, notes: [57, 60, 64, 67] }, { bass: 41, notes: [57, 60, 64, 65] }], mel: [72, 74, 76, 79, 81, 84], shift: 0 },
    candy: { prog: [{ bass: 36, notes: [64, 67, 72, 76] }, { bass: 45, notes: [61, 64, 69, 73] }, { bass: 38, notes: [62, 65, 69, 72] }, { bass: 43, notes: [62, 67, 71, 74] }], mel: [76, 79, 81, 84, 86, 88], shift: 0, arp: true },
    ruins: { prog: [{ bass: 38, notes: [50, 53, 57, 60] }, { bass: 43, notes: [55, 58, 62, 65] }, { bass: 41, notes: [53, 57, 60, 64] }, { bass: 40, notes: [52, 55, 59, 62] }], mel: [62, 65, 67, 69, 72], shift: 0 },
    cold:  { prog: PROG, mel: [67, 71, 74, 79], shift: -2, drums: false },
    dark:  { prog: [{ bass: 34, notes: [46, 50, 53, 57] }, { bass: 33, notes: [45, 48, 52, 55] }, { bass: 31, notes: [43, 46, 50, 53] }, { bass: 29, notes: [41, 45, 48, 52] }], mel: [58, 60, 62, 65], shift: 0 },
  };
  const MAPTRACK = { neon: "neon", alien: "neon", sky: "sky", candy: "candy", ruins: "ruins", forest: "cold", arctic: "cold", swamp: "dark", volcano: "dark", abyss: "dark", pirate: "dark" };
  let track = TRACKS.default, intensity = 0;

  function pad(t, midi, gain) { // warm, slow pad underneath everything
    const f = mtof(midi), end = t + CHORD_DUR + 1.5;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 1.6); g.gain.linearRampToValueAtTime(gain * 0.8, t + CHORD_DUR - 0.5); g.gain.linearRampToValueAtTime(0.0001, end);
    for (const [type, mul, det] of [["triangle", 1, 0], ["sine", 2, 5]]) {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = f * mul; o.detune.value = det + rnd(-3, 3);
      o.connect(lp); o.start(t); o.stop(end + 0.1);
    }
    lp.connect(g); g.connect(musicIn);
  }
  function keys(t, midi, gain, dur = 1.8) { // soft electric piano
    const f = mtof(midi);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2300; lp.Q.value = 0.4;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [type, mul, gg] of [["sine", 1, 1], ["triangle", 2, 0.22], ["sine", 4, 0.06]]) {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = f * mul; o.detune.value = rnd(-5, 5);
      const og = ac.createGain(); og.gain.value = gg; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    }
    lp.connect(g); g.connect(musicIn);
    const w = ac.createGain(); w.gain.value = 0.28; g.connect(w); w.connect(delayIn);
  }
  function bassNote(t, midi, gain, dur) {
    tone(musicIn, t, { f: mtof(midi), dur, gain, type: "sine", attack: 0.02 });
    tone(musicIn, t, { f: mtof(midi) * 2, dur: dur * 0.5, gain: gain * 0.2, type: "triangle", attack: 0.02 });
  }
  function playChord(t, c0) {
    const sh = track.shift, c = { bass: c0.bass + sh, notes: c0.notes.map(m => m + sh) }, MEL = track.mel;
    c.notes.forEach(m => pad(t, m, 0.02));
    bassNote(t, c.bass, 0.2, BEAT * 3.4); bassNote(t + BEAT * 3.5, c.bass, 0.13, BEAT * 1.2); bassNote(t + BEAT * 4, c.bass + (Math.random() < 0.5 ? 0 : 7), 0.16, BEAT * 3.3);
    const roll = (tt, vel, notes) => notes.forEach((m, i) => keys(tt + i * 0.035 + rnd(0, 0.012), m, 0.05 * vel, 2.2));
    roll(t, 1, c.notes); roll(t + BEAT * 3, 0.55, c.notes.slice(1)); roll(t + BEAT * 4, 0.9, c.notes); roll(t + BEAT * 7, 0.5, c.notes.slice(2));
    for (let b = 0.5; b < 8; b += 0.5) if (Math.random() < 0.15 + intensity * 0.25) keys(t + b * BEAT + rnd(0, 0.03), MEL[Math.floor(Math.random() * MEL.length)] + sh, 0.062, 1.6);
    if (track.arp) for (let i = 0; i < 16; i++) keys(t + i * BEAT / 2, c.notes[i % 4] + 12, 0.03 + intensity * 0.02, 0.5); // neon and candy tracks sparkle with a quick arpeggio
    // a very soft lo-fi beat: kick, snare, swung hats and a little vinyl crackle
    if (track.drums !== false) for (let i = 0; i < 16; i++) {
      const tt = t + i * BEAT / 2 + (i % 2 ? BEAT * 0.07 : 0);
      if (intensity > 0 && i % 2 === 0) tone(musicIn, tt, { f: 130, fEnd: 50, dur: 0.18, gain: 0.2 * intensity, type: "sine" }); // fights and big combos add a driving beat
      if (intensity > 0 && i % 4 === 2) noise(musicIn, tt, 0.1, { freq: 2200, q: 0.8, gain: 0.08 * intensity });
      if (i % 8 === 0 || i % 8 === 5) tone(musicIn, tt, { f: 115, fEnd: 48, dur: 0.22, gain: 0.24, type: "sine" });
      if (i % 8 === 2 || i % 8 === 6) noise(musicIn, tt, 0.13, { freq: 1900, q: 0.7, gain: 0.05 });
      noise(musicIn, tt, 0.03, { type: "highpass", freq: 7500, gain: i % 2 ? 0.01 : 0.018 });
      if (Math.random() < 0.35) noise(musicBus, tt + rnd(0, BEAT / 2), 0.008, { type: "highpass", freq: 3000, gain: 0.03 });
    }
  }
  function scheduleMusic() {
    if (!ac) return;
    const now = ac.currentTime;
    if (nextChord < now) nextChord = now + 0.2;
    while (nextChord < now + 6) { playChord(nextChord, track.prog[chordIdx % track.prog.length]); nextChord += CHORD_DUR; chordIdx++; }
  }
  function newCatchJingle(t) { // "you found something new!"
    [659, 784, 1047, 1319].forEach((f, i) => bell(sfxBus, t + i * 0.07, f, 0.2, 0.7));
    [1047, 1319, 1568].forEach(f => bell(sfxBus, t + 0.34, f, 0.16, 1.5));
    noise(sfxBus, t + 0.3, 0.7, { type: "highpass", freq: 5000, gain: 0.08, attack: 0.1 });
    tone(sfxBus, t + 0.34, { f: 2093, dur: 1.0, gain: 0.06, type: "sine" });
  }

  // ---------- sound effects ----------
  return {
    init, apply, setRain,
    setMap(id) { const k = MAPTRACK[id] || "default"; if (TRACKS[k] !== track) { track = TRACKS[k]; chordIdx = 0; } },
    setIntensity(v) { intensity = v; },
    // mechanical keyboard: a sharp tick plus a low thock on press, a lighter clack on release
    keyDown() { if (!on() || !settings.keys) return; const t = T(); noise(sfxBus, t, 0.03, { freq: rnd(3400, 4400), q: 1.3, gain: 0.32 }); tone(sfxBus, t, { f: rnd(190, 230), fEnd: 85, dur: 0.07, type: "triangle", gain: 0.34 }); },
    // buttons feel like mechanical keyboard keys: a deep "thock" plus a sharp click going down, a light click coming back up
    btnDown() { if (!on() || !settings.keys) return; const t = T(); noise(sfxBus, t, 0.035, { freq: rnd(2600, 3400), q: 1.8, gain: 0.42 }); tone(sfxBus, t, { f: rnd(150, 175), fEnd: 62, dur: 0.11, type: "triangle", gain: 0.5 }); tone(sfxBus, t, { f: rnd(1500, 1800), fEnd: 900, dur: 0.02, type: "square", gain: 0.06 }); },
    btnHover() { if (!on() || !settings.keys) return; const t = T(); noise(sfxBus, t, 0.025, { freq: rnd(3000, 3800), q: 1.6, gain: 0.26 }); tone(sfxBus, t, { f: rnd(190, 225), fEnd: 90, dur: 0.07, type: "triangle", gain: 0.3 }); }, // a lighter key tick when the mouse just moves over a button
    btnUp() { if (!on() || !settings.keys) return; const t = T(); noise(sfxBus, t, 0.022, { type: "highpass", freq: rnd(5000, 6500), gain: 0.2 }); tone(sfxBus, t, { f: rnd(420, 480), fEnd: 240, dur: 0.05, type: "triangle", gain: 0.16 }); },
    keyUp() { if (!on() || !settings.keys) return; const t = T(); noise(sfxBus, t, 0.02, { type: "highpass", freq: rnd(4500, 6000), gain: 0.14 }); tone(sfxBus, t, { f: rnd(300, 350), fEnd: 190, dur: 0.045, type: "triangle", gain: 0.12 }); },
    toggle(v) { if (!on()) return; const t = T(); tone(sfxBus, t, { f: v ? 620 : 470, fEnd: v ? 860 : 340, dur: 0.09, gain: 0.22 }); },
    equip() { if (!on()) return; const t = T(); tone(sfxBus, t, { f: 520, fEnd: 880, dur: 0.1, gain: 0.25, type: "triangle" }); bell(sfxBus, t + 0.05, 1318, 0.12, 0.5); },
    buy() { if (!on()) return; const t = T(); noise(sfxBus, t, 0.05, { type: "highpass", freq: 6000, gain: 0.3 }); [1568, 2093, 2637].forEach((f, i) => bell(sfxBus, t + 0.05 + i * 0.075, f, 0.2, 0.9)); },
    cast() { if (!on()) return; const t = T(); noise(sfxBus, t, 0.5, { freq: 500, freqEnd: 2600, q: 1.6, gain: 0.32, attack: 0.12 }); noise(sfxBus, t + 0.25, 0.35, { freq: 2600, freqEnd: 600, q: 1.6, gain: 0.18, attack: 0.05 }); },
    splash() { if (!on()) return; const t = T(); noise(sfxBus, t, 0.4, { type: "lowpass", freq: 3000, freqEnd: 500, gain: 0.5, q: 0.7 }); for (let i = 0; i < 3; i++) tone(sfxBus, t + 0.05 + i * rnd(0.05, 0.1), { f: rnd(500, 800), fEnd: rnd(900, 1400), dur: 0.08, gain: 0.14 }); },
    bite() { if (!on()) return; const t = T(); tone(sfxBus, t, { f: 520, fEnd: 660, dur: 0.1, gain: 0.32, type: "triangle" }); tone(sfxBus, t + 0.11, { f: 780, fEnd: 1000, dur: 0.14, gain: 0.32, type: "triangle" }); },
    reelTick() { if (!on()) return; const t = T(); noise(sfxBus, t, 0.02, { freq: rnd(2600, 3400), q: 2, gain: 0.2 }); tone(sfxBus, t, { f: rnd(900, 1200), dur: 0.015, type: "square", gain: 0.05 }); },
    fishOut() { if (!on()) return; const t = T(); tone(sfxBus, t, { f: 250, fEnd: 750, dur: 0.2, gain: 0.26 }); noise(sfxBus, t, 0.25, { type: "highpass", freq: 2500, gain: 0.16, attack: 0.05 }); },
    catchGood(first, big, rarity = 0, shiny = false) {
      if (!on()) return; const t = T() + 0.75; // lands in the bucket
      tone(sfxBus, t, { f: 320, fEnd: 110, dur: 0.16, gain: 0.5 }); noise(sfxBus, t, 0.12, { type: "lowpass", freq: 900, gain: 0.22 });
      let notes = [1318, 1760];
      if (big) notes = [1047, 1319, 1568];
      if (first || rarity >= 2) notes = [523, 659, 784, 1047];
      if (rarity >= 4 || shiny) notes = [523, 659, 784, 1047, 1319, 1568];
      if (rarity >= 5) notes = [392, 523, 659, 784, 1047, 1319, 1568, 2093];
      if (first && settings.newCatch) { if (!(rarity >= 4 || shiny)) notes = [1318, 1760]; newCatchJingle(t + 0.3); }
      notes.forEach((f, i) => bell(sfxBus, t + 0.1 + i * 0.09, f, 0.24, 1.2));
    },
    newCatchPreview() { if (on()) newCatchJingle(T()); },
    jump() { if (!on()) return; const t = T(); noise(sfxBus, t, 0.2, { type: "lowpass", freq: 2400, freqEnd: 600, gain: 0.16 }); },
    rewardReady() { if (!on()) return; const t = T(); [1047, 1319].forEach((f, i) => bell(sfxBus, t + i * 0.12, f, 0.2, 1.0)); },
    rankUp() { if (!on()) return; const t = T() + 0.2; noise(sfxBus, t, 0.8, { freq: 800, freqEnd: 4200, q: 1, gain: 0.25, attack: 0.3 });
      [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => bell(sfxBus, t + i * 0.13, f, 0.26, 1.4)); },
    junk() { if (!on()) return; const t = T() + 0.75; // a sad clunk
      tone(sfxBus, t, { f: 260, fEnd: 120, dur: 0.24, gain: 0.4, type: "triangle" }); noise(sfxBus, t, 0.1, { freq: 1800, q: 2, gain: 0.2 });
      tone(sfxBus, t + 0.22, { f: 200, fEnd: 85, dur: 0.34, gain: 0.3, type: "triangle" }); },
    snap() { if (!on()) return; const t = T(); // twang!
      tone(sfxBus, t, { f: 1400, fEnd: 260, dur: 0.35, gain: 0.3, type: "sawtooth" }); noise(sfxBus, t, 0.08, { type: "highpass", freq: 3000, gain: 0.4 });
      tone(sfxBus, t + 0.25, { f: 200, fEnd: 90, dur: 0.3, gain: 0.25, type: "triangle" }); },
    rest() { if (!on()) return; const t = T(); [523, 440, 349].forEach((f, i) => tone(sfxBus, t + i * 0.22, { f, dur: 0.5, gain: 0.16, type: "sine", attack: 0.05 })); },
    wake() { if (!on()) return; const t = T(); [523, 659, 784].forEach((f, i) => bell(sfxBus, t + i * 0.09, f, 0.18, 0.9)); },
    catchBad() { if (!on()) return; const t = T() + 1.0; tone(sfxBus, t, { f: 140, fEnd: 45, dur: 0.28, gain: 0.7 }); noise(sfxBus, t, 0.14, { type: "lowpass", freq: 420, gain: 0.3 }); tone(sfxBus, t + 0.18, { f: 330, fEnd: 190, dur: 0.4, gain: 0.2, type: "triangle" }); },
    thunder() { if (!on()) return; const t = T() + 0.25; noise(sfxBus, t, 0.08, { type: "highpass", freq: 1500, gain: 0.5 }); noise(sfxBus, t + 0.05, 2.6, { type: "lowpass", freq: 260, freqEnd: 60, gain: 0.9, attack: 0.15, q: 0.5 }); },
    // rarity stingers, a coin tick, bird chirps and a combo melody
    stinger(r) { if (!on()) return; const t = T() + 0.9; if (r >= 5) { [392, 494, 587, 784, 988, 1175].forEach((f, i) => { bell(sfxBus, t + i * 0.1, f, 0.22, 1.6); tone(sfxBus, t + i * 0.1, { f: f / 2, dur: 0.6, gain: 0.08, type: "sawtooth" }); }); } else if (r === 4) { [523, 659, 784, 1047].forEach((f, i) => bell(sfxBus, t + i * 0.09, f, 0.2, 1.3)); } else if (r === 3) { [587, 740, 880].forEach((f, i) => bell(sfxBus, t + i * 0.08, f, 0.16, 1)); } else if (r === 2) { bell(sfxBus, t, 880, 0.14, 0.8); bell(sfxBus, t + 0.1, 1320, 0.1, 0.8); } },
    tick() { if (!on()) return; tone(sfxBus, T(), { f: rnd(1900, 2300), dur: 0.03, type: "square", gain: 0.05 }); },
    chirp() { if (!on() || !settings.ambient) return; const t = T(), base = rnd(2200, 3200); for (let i = 0; i < 3; i++) tone(ambBus, t + i * 0.09, { f: base * (1 + i * 0.12), fEnd: base * (1.3 + i * 0.1), dur: 0.07, gain: 0.06 }); },
    combo(n) { if (!on()) return; const t = T(), sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21], f = 523 * Math.pow(2, sc[Math.min(n, sc.length - 1)] / 12); bell(sfxBus, t, f, 0.16, 0.7); bell(sfxBus, t + 0.07, f * 1.5, 0.12, 0.7); if (n >= 4) bell(sfxBus, t + 0.14, f * 2, 0.1, 0.7); }, // the combo plays up a little scale
    coin() { if (!on()) return; const t = T(); bell(sfxBus, t, 1568, 0.1, 0.35, false); bell(sfxBus, t + 0.06, 2093, 0.1, 0.35, false); },
    chime() { if (!on()) return; const t = T(); [784, 988, 1319].forEach((f, i) => bell(sfxBus, t + i * 0.1, f, 0.18, 1)); },
  };
})();

// mechanical-keyboard clicks on every button press and every keypress
window.addEventListener("pointerdown", e => { Snd.init(); if (e.target.closest && e.target.closest("button")) Snd.btnDown(); }, true);
window.addEventListener("pointerover", e => { // hovering a button clicks too (mouse only, once per button)
  if (e.pointerType && e.pointerType !== "mouse") return;
  const b = e.target.closest && e.target.closest("button"); if (!b || b.disabled || (e.relatedTarget && b.contains(e.relatedTarget))) return;
  Snd.init(); Snd.btnHover();
}, true);
window.addEventListener("pointerup", e => { if (e.target.closest && e.target.closest("button")) Snd.btnUp(); }, true);
window.addEventListener("keydown", e => { Snd.init(); if (!e.repeat) Snd.keyDown(); }, true);
window.addEventListener("keyup", () => Snd.keyUp(), true);
