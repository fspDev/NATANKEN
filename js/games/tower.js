import { head, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { lerp, makeCanvas, FX, cloud } from '../kit.js';

export default {
  id: 'torre', name: 'Torre de Bloques', animal: 'jirafa', colors: ['#ffb300', '#8e5bd9'],
  how: 'Tocá la pantalla para soltar el bloque justo arriba de la torre. ¡Hacela tan alta como la jirafa!',
  mode: 'turns', countdown: true,
  stars: best => best >= 25 ? 3 : best >= 12 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { j: sprite(head('jirafa')) };
    await ready(img);
    const S = env.data = { fx: new FX(), blocks: [{ x: v.W * 0.6, w: v.W * 0.44 }], falls: [], cur: null, cam: 0, score: 0, lives: 3, running: false, squash: 0, done: null };
    hud.score(0); hud.lives(3); hud.time(null);
    const unit = () => Math.min(v.W, v.H * 0.7) / 400;
    const hue = i => (i * 29 + 200) % 360;

    const spawn = () => {
      const top = S.blocks[S.blocks.length - 1], n = S.blocks.length;
      const dir = n % 2 ? 1 : -1;
      S.cur = { x: dir > 0 ? top.w / 2 : v.W - top.w / 2, w: top.w, dir, speed: v.W * (0.5 + Math.min(n, 32) * 0.024) };
    };
    spawn();

    scope.on(v.cv, 'pointerdown', e => {
      e.preventDefault();
      if (!S.running || !S.cur) return;
      const u = unit(), bh = 36 * u, n = S.blocks.length, top = S.blocks[n - 1], c = S.cur;
      const dx = c.x - top.x, ov = top.w - Math.abs(dx), yw = -(n + 0.5) * bh;
      if (ov < 12 * u) {
        S.falls.push({ x: c.x, y: yw, w: c.w, vy: 0, rot: 0, vr: dx > 0 ? 2.5 : -2.5, h: hue(n) });
        S.lives--; hud.lives(S.lives); sfx.bad(); buzz(150);
        stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
        if (S.lives <= 0) { S.running = false; S.cur = null; scope.timeout(() => S.done && S.done(S.score), 1000); return; }
      } else {
        const sy = v.H * 0.88 + yw + S.cam;
        let pts = 1;
        if (Math.abs(dx) < 7 * u) {
          S.blocks.push({ x: top.x, w: top.w }); pts = 2;
          sfx.good(); S.fx.ring(top.x, sy, '#fff', top.w * 0.6); S.fx.burst(top.x, sy, ['#fff', '#ffd93b'], 16, 260);
          S.fx.text(top.x, sy - 30, '¡Perfecto! +2', '#ffd93b');
        } else {
          const nx = top.x + dx / 2, cut = Math.abs(dx);
          S.blocks.push({ x: nx, w: ov });
          S.falls.push({ x: nx + Math.sign(dx) * (ov / 2 + cut / 2), y: yw, w: cut, vy: 0, rot: 0, vr: Math.sign(dx) * 3, h: hue(n) });
          sfx.bonk(); S.fx.text(nx, sy - 30, '+1', '#fff');
        }
        buzz(20); S.score += pts; hud.score(S.score); S.squash = 0.16;
      }
      spawn();
    });

    const block = (g, x, y, w, bh, h, u) => {
      g.fillStyle = `hsl(${h} 82% 58%)`; g.strokeStyle = '#3d2817'; g.lineWidth = 3;
      g.beginPath(); g.roundRect(x - w / 2, y - bh / 2, w, bh, Math.min(8 * u, w / 2)); g.fill(); g.stroke();
      g.fillStyle = `hsl(${h} 90% 74%)`;
      g.beginPath(); g.roundRect(x - w / 2 + 4, y - bh / 2 + 4, Math.max(0, w - 8), bh * 0.28, 4 * u); g.fill();
      g.fillStyle = `hsl(${h} 70% 44%)`;
      g.fillRect(x - w / 2 + 3, y + bh / 2 - bh * 0.2 - 1.5, Math.max(0, w - 6), bh * 0.2);
    };

    scope.loop((dt, now) => {
      const { g, W, H } = v;
      const u = unit(), bh = 36 * u, gy = H * 0.88, n = S.blocks.length;
      S.cam = lerp(S.cam, Math.max(0, n * bh - H * 0.42), 1 - Math.pow(0.02, dt));
      S.squash = Math.max(0, S.squash - dt);
      if (S.running && S.cur) {
        const c = S.cur;
        c.x += c.dir * c.speed * dt;
        if (c.x > W - c.w / 2) { c.x = W - c.w / 2; c.dir = -1; }
        if (c.x < c.w / 2) { c.x = c.w / 2; c.dir = 1; }
      }
      for (const f of S.falls) { f.vy += 2200 * u * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
      S.falls = S.falls.filter(f => f.y < 400);
      S.fx.update(dt);

      // cielo que cambia con la altura
      const k = Math.min(1, S.cam / (bh * 40));
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `hsl(${205 + k * 40} 85% ${64 - k * 30}%)`); sky.addColorStop(1, `hsl(${195 + k * 30} 90% ${88 - k * 20}%)`);
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        const cy = ((i * 260 * u + S.cam * 0.45) % (H + 160)) - 80;
        cloud(g, ((i * 137 + now * (6 + i * 2)) % (W + 200)) - 150, cy, (0.8 + i * 0.15) * u);
      }
      // suelo
      const sg = gy + S.cam;
      if (sg < H) {
        g.fillStyle = '#58a83a'; g.fillRect(0, sg, W, H - sg);
        g.fillStyle = '#6fc04a'; g.fillRect(0, sg, W, 10 * u);
      }
      // jirafa de cuello larguísimo
      const jx = W * 0.14, topY = gy - n * bh + S.cam, nw = 30 * u, hs = 96 * u;
      const headY = Math.min(topY - 6 * u, sg - 150 * u);
      g.fillStyle = '#fbd052'; g.strokeStyle = '#3d2817'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(jx, sg - 34 * u, 46 * u, 38 * u, 0, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.rect(jx - nw / 2, headY, nw, sg - 50 * u - headY); g.fill(); g.stroke();
      g.fillStyle = '#d9862b';
      for (let y = sg - 70 * u, i = 0; y > headY + hs * 0.3; y -= 34 * u, i++) {
        g.beginPath(); g.ellipse(jx + (i % 2 ? 5 : -5) * u, y, 7 * u, 9 * u, 0, 0, 7); g.fill();
      }
      g.drawImage(img.j, jx - hs / 2, headY - hs * 0.6 + Math.sin(now * 3) * 3 * u, hs, hs);

      // torre
      S.blocks.forEach((b, i) => {
        const y = gy - (i + 0.5) * bh + S.cam;
        if (y < -bh || y > H + bh) return;
        const top = i === n - 1 && S.squash;
        if (top) { g.save(); g.translate(b.x, y + bh / 2); g.scale(1 + S.squash * 0.8, 1 - S.squash * 1.6); g.translate(-b.x, -(y + bh / 2)); }
        block(g, b.x, y, b.w, bh, i ? hue(i) : 28, u);
        if (top) g.restore();
      });
      if (S.cur) block(g, S.cur.x, gy - (n + 0.5) * bh + S.cam - 6 * u, S.cur.w, bh, hue(n), u);
      for (const f of S.falls) {
        g.save(); g.translate(f.x, gy + f.y + S.cam); g.rotate(f.rot);
        block(g, 0, 0, f.w, bh, f.h, u); g.restore();
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
