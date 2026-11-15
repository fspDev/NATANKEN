import { head, ITEMS, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, pick, clamp, lerp, makeCanvas, FX, cloud, hills } from '../kit.js';

const TIME = 35;
const COLORS = [
  ['#ff5a5f', '#c9353b', '#ffb3b5'], ['#2e9bff', '#1b6fc4', '#a9d6ff'], ['#ffd93b', '#e0a800', '#fff3b0'],
  ['#3ecf6e', '#22994a', '#b4f0c8'], ['#b06cf0', '#7d3fc0', '#dcc0fa'], ['#ff8fc7', '#d95c9c', '#ffd0e8'], ['#ff9f1c', '#d67a00', '#ffd9a0'],
];

export default {
  id: 'globos', name: 'Fiesta de Globos', animal: 'tucan', colors: ['#ff5fa2', '#7ad7ff'],
  how: 'Reventá todos los globos que puedas. Los dorados valen más. ¡No toques al cocodrilo dormilón!',
  mode: 'turns', countdown: true,
  stars: best => best >= 40 ? 3 : best >= 20 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { estrella: sprite(ITEMS.estrella()), coco: sprite(head('coco')) };
    await ready(img);
    const S = env.data = { fx: new FX(), list: [], t: 0, next: 0.2, score: 0, running: false, done: null };
    hud.score(0); hud.time(1); hud.lives(null);

    scope.on(v.cv, 'pointerdown', e => {
      e.preventDefault();
      if (!S.running) return;
      const p = v.pos(e);
      for (let i = S.list.length - 1; i >= 0; i--) {
        const b = S.list[i];
        const dx = (p.x - b.cx) / (b.r * 1.2), dy = (p.y - b.y) / (b.r * 1.4);
        if (dx * dx + dy * dy > 1) continue;
        S.list.splice(i, 1);
        sfx.pop();
        if (b.type === 'bad') {
          S.score = Math.max(0, S.score - 2); sfx.bad(); buzz(140);
          S.fx.burst(b.cx, b.y, ['#6bb23a', '#3f7a1e'], 16, 300); S.fx.text(b.cx, b.y, '-2', '#ff6b6b');
          stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
        } else {
          const pts = b.type === 'gold' ? 3 : 1;
          S.score += pts; buzz(15);
          if (pts > 1) sfx.good();
          S.fx.burst(b.cx, b.y, [b.c[0], b.c[2], '#fff'], pts > 1 ? 26 : 14, 320);
          S.fx.ring(b.cx, b.y, b.c[2], b.r * 1.3);
          S.fx.text(b.cx, b.y, '+' + pts, pts > 1 ? '#ffd93b' : '#fff');
        }
        hud.score(S.score);
        break;
      }
    });

    scope.loop((dt, now) => {
      const { g, W, H } = v;
      const u = Math.min(W, H * 0.7) / 400;
      if (S.running) {
        S.t += dt; S.next -= dt;
        const k = clamp(S.t / TIME, 0, 1);
        hud.time(1 - k);
        if (S.next <= 0) {
          S.next = lerp(0.6, 0.27, k) * rand(0.7, 1.3);
          const r = Math.random();
          const type = r < 0.13 ? 'bad' : r > 0.92 ? 'gold' : 'n';
          const rad = (type === 'n' ? rand(34, 46) : 44) * u;
          S.list.push({ type, x: rand(rad, W - rad), cx: 0, y: H + rad * 2, r: rad, ph: rand(0, 6), vy: H * lerp(0.17, 0.33, k) * rand(0.8, 1.25) * (type === 'gold' ? 1.3 : 1), c: type === 'gold' ? ['#ffd93b', '#e0a800', '#fff8cc'] : type === 'bad' ? ['#7d8b99', '#55616d', '#b9c3cd'] : pick(COLORS) });
        }
        if (S.t >= TIME) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 600); }
      }
      for (const b of S.list) { b.y -= b.vy * dt; b.cx = b.x + Math.sin(now * 1.6 + b.ph) * 14 * u; }
      S.list = S.list.filter(b => b.y > -b.r * 3);
      S.fx.update(dt);

      // ---- fondo ----
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#4fb6f7'); sky.addColorStop(0.75, '#c8efff'); sky.addColorStop(1, '#fff6cf');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      cloud(g, ((now * 10) % (W + 220)) - 160, H * 0.16, 1.2 * u);
      cloud(g, ((now * 6 + W * 0.5) % (W + 220)) - 160, H * 0.36, 0.85 * u);
      cloud(g, ((now * 14 + W * 0.8) % (W + 220)) - 160, H * 0.55, 0.65 * u);
      // rueda gigante
      const fx0 = W * 0.76, fy0 = H * 0.8, fr = 92 * u;
      g.strokeStyle = '#e8718d'; g.lineWidth = 5 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(fx0 - 46 * u, H); g.moveTo(fx0, fy0); g.lineTo(fx0 + 46 * u, H); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 4 * u;
      g.beginPath(); g.arc(fx0, fy0, fr, 0, 7); g.stroke();
      g.beginPath(); g.arc(fx0, fy0, fr * 0.62, 0, 7); g.stroke();
      for (let i = 0; i < 8; i++) {
        const a = now * 0.35 + i * Math.PI / 4, x = fx0 + Math.cos(a) * fr, y = fy0 + Math.sin(a) * fr;
        g.strokeStyle = '#fff'; g.lineWidth = 2.5 * u;
        g.beginPath(); g.moveTo(fx0, fy0); g.lineTo(x, y); g.stroke();
        g.fillStyle = COLORS[i % COLORS.length][0];
        g.beginPath(); g.roundRect(x - 11 * u, y, 22 * u, 17 * u, 6 * u); g.fill();
      }
      g.fillStyle = '#ffd93b'; g.beginPath(); g.arc(fx0, fy0, 9 * u, 0, 7); g.fill();
      hills(g, W, H - 26 * u, 60 * u, '#9bd873', 100, 340 * u, H);
      hills(g, W, H - 4 * u, 44 * u, '#6fc04a', 260, 260 * u, H);
      // banderines
      g.strokeStyle = '#3d2817'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 6); g.quadraticCurveTo(W / 2, 46 * u, W, 6); g.stroke();
      const nF = 9;
      for (let i = 0; i < nF; i++) {
        const tt = (i + 0.5) / nF, x = tt * W, y = 6 + 2 * tt * (1 - tt) * (46 * u - 6);
        g.fillStyle = COLORS[i % COLORS.length][0];
        g.beginPath(); g.moveTo(x - 11 * u, y - 1); g.lineTo(x + 11 * u, y - 1); g.lineTo(x + Math.sin(now * 3 + i) * 3 * u, y + 24 * u); g.closePath(); g.fill();
      }

      // ---- globos ----
      for (const b of S.list) {
        const x = b.cx, y = b.y, rx = b.r, ry = b.r * 1.18, tilt = Math.cos(now * 1.6 + b.ph) * 0.1;
        g.strokeStyle = 'rgba(61,40,23,.55)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, y + ry + 6 * u);
        g.bezierCurveTo(x + 10 * u * Math.sin(now * 3 + b.ph), y + ry + 30 * u, x - 10 * u * Math.sin(now * 3 + b.ph), y + ry + 55 * u, x, y + ry + 80 * u);
        g.stroke();
        g.save(); g.translate(x, y); g.rotate(tilt);
        const gr = g.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.1, 0, 0, ry * 1.05);
        gr.addColorStop(0, b.c[2]); gr.addColorStop(0.45, b.c[0]); gr.addColorStop(1, b.c[1]);
        g.fillStyle = gr; g.strokeStyle = '#3d2817'; g.lineWidth = 3;
        g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = b.c[1];
        g.beginPath(); g.moveTo(0, ry - 1); g.lineTo(-7 * u, ry + 9 * u); g.lineTo(7 * u, ry + 9 * u); g.closePath(); g.fill(); g.stroke();
        if (b.type === 'gold') g.drawImage(img.estrella, -rx * 0.62, -rx * 0.62, rx * 1.24, rx * 1.24);
        else if (b.type === 'bad') {
          g.drawImage(img.coco, -rx * 0.8, -rx * 0.78, rx * 1.6, rx * 1.6);
          g.fillStyle = '#fff'; g.font = `700 ${Math.round(16 * u)}px Fredoka, sans-serif`; g.textAlign = 'left';
          g.fillText('z', rx * 0.55, -ry * 0.75 - Math.sin(now * 2) * 3); g.fillText('Z', rx * 0.8, -ry * 1.0 - Math.sin(now * 2 + 1) * 3);
        }
        g.fillStyle = 'rgba(255,255,255,.55)';
        g.beginPath(); g.ellipse(-rx * 0.42, -ry * 0.45, rx * 0.16, ry * 0.26, -0.5, 0, 7); g.fill();
        g.restore();
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
