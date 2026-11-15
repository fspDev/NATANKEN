// Sonidos y música sintetizados con WebAudio (sin archivos, funciona offline).
let ctx = null, master = null, musicBus = null;
let muted = localStorage.getItem('nk-mute') === '1';
let musicTimer = null, step = 0, nextTime = 0;

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.16;
    musicBus.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (!musicTimer) startMusic();
}

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  localStorage.setItem('nk-mute', muted ? '1' : '0');
  if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.03);
  return muted;
}

function tone(freq, dur, { type = 'sine', vol = 0.25, when = 0, to = null, bus = master } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.03);
}

function noise(dur, { vol = 0.25, when = 0, freq = 1800 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq;
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t);
}

const midi = n => 440 * Math.pow(2, (n - 69) / 12);

export const sfx = {
  tap: (p = 0) => tone(520 + p * 90, 0.07, { type: 'triangle', vol: 0.2 }),
  click: () => { tone(660, 0.06, { type: 'triangle', vol: 0.2 }); tone(990, 0.08, { type: 'triangle', vol: 0.15, when: 0.05 }); },
  pop: () => { noise(0.09, { vol: 0.4, freq: 1400 }); tone(700, 0.1, { to: 180, vol: 0.2 }); },
  flip: () => tone(340, 0.08, { type: 'triangle', to: 620, vol: 0.16 }),
  good: () => [0, 4, 7, 12].forEach((s, i) => tone(midi(76 + s), 0.14, { type: 'triangle', vol: 0.2, when: i * 0.06 })),
  coin: () => { tone(midi(88), 0.08, { type: 'square', vol: 0.09 }); tone(midi(93), 0.2, { type: 'square', vol: 0.09, when: 0.07 }); },
  bad: () => { tone(220, 0.28, { type: 'sawtooth', to: 90, vol: 0.16 }); noise(0.15, { vol: 0.15, freq: 300 }); },
  jump: () => tone(300, 0.2, { type: 'sine', to: 760, vol: 0.2 }),
  boing: () => tone(180, 0.25, { type: 'triangle', to: 420, vol: 0.22 }),
  beep: () => tone(midi(72), 0.16, { type: 'triangle', vol: 0.25 }),
  go: () => { tone(midi(84), 0.4, { type: 'triangle', vol: 0.28 }); tone(midi(79), 0.4, { type: 'triangle', vol: 0.16 }); },
  bonk: () => { tone(160, 0.12, { type: 'square', to: 80, vol: 0.14 }); noise(0.06, { vol: 0.3, freq: 900 }); },
  roar: () => { tone(120, 0.5, { type: 'sawtooth', to: 70, vol: 0.2 }); noise(0.45, { vol: 0.14, freq: 260 }); },
  win: () => [72, 76, 79, 84, 79, 84, 88].forEach((n, i) =>
    tone(midi(n), i === 6 ? 0.6 : 0.16, { type: 'triangle', vol: 0.24, when: i * 0.12 })),
  star: (i = 0) => tone(midi(84 + i * 4), 0.3, { type: 'triangle', vol: 0.24 }),
};

// ---- Música de fondo: melodía alegre en bucle ----
const LEAD = [
  72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 81, 0, 79, 0, 0, 0,
  76, 0, 74, 0, 72, 0, 74, 0, 76, 0, 79, 0, 72, 0, 0, 0,
  72, 76, 79, 84, 79, 76, 79, 0, 77, 81, 84, 81, 79, 0, 0, 0,
  76, 0, 74, 0, 72, 0, 71, 0, 72, 0, 0, 0, 67, 0, 72, 0,
];
const BASS = [48, 53, 55, 48, 48, 53, 55, 48];
const STEP = 60 / 126 / 2;

function schedule() {
  if (!ctx || ctx.state !== 'running') return;
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + 0.25) {
    const when = nextTime - ctx.currentTime;
    const i = step % LEAD.length;
    if (LEAD[i]) tone(midi(LEAD[i]), STEP * 1.6, { type: 'triangle', vol: 0.5, when, bus: musicBus });
    if (i % 4 === 0) tone(midi(BASS[(i / 8) | 0]), STEP * 2.4, { type: 'sine', vol: 0.7, when, bus: musicBus });
    if (i % 4 === 2) tone(midi(BASS[(i / 8) | 0] + 7), STEP * 1.5, { type: 'sine', vol: 0.45, when, bus: musicBus });
    step++; nextTime += STEP;
  }
}

function startMusic() {
  musicTimer = setInterval(schedule, 80);
}

document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend(); else ctx.resume();
});

export const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* sin vibración */ } };
