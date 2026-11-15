// Utilidades compartidas por los mini juegos.
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[(Math.random() * arr.length) | 0];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Ámbito de vida de una partida: al terminar limpia timers, bucles y eventos. */
export function makeScope() {
  const cleanups = [];
  const s = {
    dead: false,
    add(fn) { cleanups.push(fn); },
    timeout(fn, ms) {
      const t = setTimeout(() => { if (!s.dead) fn(); }, ms);
      cleanups.push(() => clearTimeout(t));
    },
    wait(ms) { return new Promise(r => s.timeout(r, ms)); },
    on(el, ev, fn, opts) {
      el.addEventListener(ev, fn, opts);
      cleanups.push(() => el.removeEventListener(ev, fn, opts));
    },
    loop(fn) {
      let last = performance.now(), id = 0;
      const tick = t => {
        if (s.dead) return;
        const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
        last = t;
        fn(dt, t / 1000);
        id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
      cleanups.push(() => cancelAnimationFrame(id));
    },
    end() {
      if (s.dead) return;
      s.dead = true;
      cleanups.forEach(f => f());
    },
  };
  return s;
}

/** Canvas que ocupa todo el escenario, nítido en pantallas de alta densidad. */
export function makeCanvas(stage, scope) {
  const cv = document.createElement('canvas');
  cv.className = 'cv';
  stage.appendChild(cv);
  const v = { cv, g: cv.getContext('2d'), W: 0, H: 0 };
  const fit = () => {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    v.W = Math.max(1, r.width); v.H = Math.max(1, r.height);
    cv.width = Math.round(v.W * dpr); cv.height = Math.round(v.H * dpr);
    v.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  scope.on(window, 'resize', fit);
  v.pos = e => {
    const r = cv.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  return v;
}

/** Partículas y textos flotantes. */
export class FX {
  constructor() { this.parts = []; this.texts = []; this.rings = []; }
  burst(x, y, colors, n = 14, speed = 260, size = 7) {
    const cs = Array.isArray(colors) ? colors : [colors];
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(speed * 0.3, speed);
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - speed * 0.3, life: rand(0.4, 0.9), t: 0, r: rand(size * 0.5, size), c: pick(cs), rot: rand(0, 6), sq: Math.random() < 0.5 });
    }
  }
  ring(x, y, color, r = 50) { this.rings.push({ x, y, c: color, r, t: 0 }); }
  text(x, y, str, color = '#fff') { this.texts.push({ x, y, str, c: color, t: 0 }); }
  update(dt) {
    for (const p of this.parts) { p.t += dt; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8; }
    this.parts = this.parts.filter(p => p.t < p.life);
    for (const t of this.texts) { t.t += dt; t.y -= 70 * dt; }
    this.texts = this.texts.filter(t => t.t < 0.9);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < 0.35);
  }
  draw(g) {
    for (const r of this.rings) {
      const k = r.t / 0.35;
      g.globalAlpha = 1 - k; g.strokeStyle = r.c; g.lineWidth = 6 * (1 - k) + 1;
      g.beginPath(); g.arc(r.x, r.y, r.r * (0.4 + k), 0, Math.PI * 2); g.stroke();
    }
    for (const p of this.parts) {
      g.globalAlpha = Math.max(0, 1 - p.t / p.life);
      g.fillStyle = p.c;
      if (p.sq) {
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); g.restore();
      } else { g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill(); }
    }
    g.globalAlpha = 1;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const t of this.texts) {
      const k = t.t / 0.9, s = 1 + Math.sin(Math.min(1, k * 4) * Math.PI) * 0.4;
      g.globalAlpha = 1 - k * k;
      g.font = `700 ${Math.round(30 * s)}px Fredoka, sans-serif`;
      g.lineWidth = 6; g.strokeStyle = '#3d2817'; g.lineJoin = 'round';
      g.strokeText(t.str, t.x, t.y); g.fillStyle = t.c; g.fillText(t.str, t.x, t.y);
    }
    g.globalAlpha = 1;
  }
}

/** Dibuja una imagen centrada, con rotación y escala. */
export function drawSprite(g, img, x, y, w, h = w, rot = 0, sx = 1, sy = 1) {
  g.save(); g.translate(x, y);
  if (rot) g.rotate(rot);
  if (sx !== 1 || sy !== 1) g.scale(sx, sy);
  g.drawImage(img, -w / 2, -h / 2, w, h);
  g.restore();
}

export function cloud(g, x, y, s) {
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.beginPath();
  g.arc(x, y, 22 * s, 0, 7); g.arc(x + 26 * s, y - 10 * s, 28 * s, 0, 7); g.arc(x + 58 * s, y, 22 * s, 0, 7);
  g.rect(x, y - 4 * s, 58 * s, 26 * s);
  g.fill();
}

export function hills(g, W, baseY, amp, color, offset, period = 260, H = 2000) {
  g.fillStyle = color;
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W + 20; x += 20) {
    g.lineTo(x, baseY - (Math.sin((x + offset) / period * Math.PI * 2) * 0.5 + 0.5) * amp - Math.sin((x + offset) / (period * 0.37)) * amp * 0.12);
  }
  g.lineTo(W + 20, H); g.closePath(); g.fill();
}

/** Fondo de carpa de circo con franjas, reflectores y público. */
export function circus(g, W, H, offset, now, u, floorY = H) {
  const sw = 70 * u, off = ((offset % (sw * 2)) + sw * 2) % (sw * 2);
  g.fillStyle = '#7a1f3d'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#93284a';
  for (let x = -off; x < W + sw; x += sw * 2) g.fillRect(x, 0, sw, H);
  const shade = g.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, 'rgba(20,0,30,.55)'); shade.addColorStop(0.5, 'rgba(20,0,30,0)'); shade.addColorStop(1, 'rgba(20,0,30,.45)');
  g.fillStyle = shade; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2; i++) {
    const cx = W * (0.25 + i * 0.5) + Math.sin(now * 0.7 + i * 2) * W * 0.18;
    const cone = g.createLinearGradient(0, 0, 0, H * 0.9);
    cone.addColorStop(0, 'rgba(255,240,170,.28)'); cone.addColorStop(1, 'rgba(255,240,170,0)');
    g.fillStyle = cone;
    g.beginPath(); g.moveTo(W * (0.1 + i * 0.8), 0); g.lineTo(cx - 90 * u, H * 0.9); g.lineTo(cx + 90 * u, H * 0.9); g.closePath(); g.fill();
  }
  // público
  const cols = ['#ffd93b', '#ff8fc7', '#7ad7ff', '#3ecf6e', '#ff9f1c', '#b06cf0'];
  for (let row = 0; row < 3; row++) {
    const y = floorY - (2 - row) * 20 * u, r = 13 * u, gap = 30 * u;
    const o = ((offset * (0.5 + row * 0.2)) % gap + gap) % gap;
    for (let x = -o - (row % 2) * gap / 2, i = 0; x < W + gap; x += gap, i++) {
      g.fillStyle = cols[(i + row * 2) % cols.length];
      g.globalAlpha = 0.55 + row * 0.15;
      g.beginPath(); g.arc(x, y - Math.abs(Math.sin(now * 5 + i * 1.7 + row)) * 4 * u, r, 0, 7); g.fill();
    }
  }
  g.globalAlpha = 1;
  g.fillStyle = '#4a1226'; g.fillRect(0, floorY + 8 * u, W, H - floorY);
}
