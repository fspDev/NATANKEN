import { full, ITEMS, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, lerp, makeCanvas, FX, drawSprite, circus } from '../kit.js';

const AMP = 1.0; // amplitud del balanceo (radianes)

export default {
  id: 'trapecio', name: 'Mono Trapecista', animal: 'mono', colors: ['#e8472b', '#ffd93b'],
  how: 'El mono se hamaca solo. Tocá para soltarte en el momento justo y volar hasta el próximo trapecio.',
  mode: 'turns', countdown: true,
  stars: best => best >= 22 ? 3 : best >= 9 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { mono: sprite(full('mono'), 240, 340), estrella: sprite(ITEMS.estrella()) };
    await ready(img);
    const unit = () => Math.min(v.W, v.H * 0.62) / 400;
    const S = env.data = { fx: new FX(), bars: [], stars: [], on: 0, best: 0, m: null, cam: 0, t: 0, score: 0, lives: 3, running: false, done: null, spin: 0 };
    hud.score(0); hud.lives(3); hud.time(null);

    const addBar = () => {
      const u = unit(), prev = S.bars[S.bars.length - 1], i = S.bars.length;
      const L = rand(135, 165) * u;
      const gap = prev ? rand(1.4, lerp(1.7, 1.95, Math.min(1, i / 25))) * L : 0;
      const b = { x: prev ? prev.x + gap : v.W * 0.3, y: v.H * rand(0.1, 0.16), L, w: Math.sqrt(900 * u / L) * rand(0.95, 1.1), ph: rand(0, 6) };
      S.bars.push(b);
      if (prev && Math.random() < 0.45) S.stars.push({ x: (prev.x + b.x) / 2, y: b.y + b.L * rand(0.5, 0.95) });
    };
    for (let i = 0; i < 6; i++) addBar();
    const barPos = (b, t) => {
      const a = AMP * Math.sin(b.w * t + b.ph);
      return { a, x: b.x + Math.sin(a) * b.L, y: b.y + Math.cos(a) * b.L, da: AMP * b.w * Math.cos(b.w * t + b.ph) };
    };

    scope.on(v.cv, 'pointerdown', e => {
      e.preventDefault();
      if (!S.running || S.m) return;
      const b = S.bars[S.on], p = barPos(b, S.t);
      S.m = { x: p.x, y: p.y, vx: b.L * Math.cos(p.a) * p.da, vy: -b.L * Math.sin(p.a) * p.da, rot: Math.PI - p.a, from: S.on, air: 0 };
      S.spin = Math.sign(S.m.vx || 1) * 7.5;
      sfx.jump();
    });

    scope.loop((dt, now) => {
      const { g, W, H } = v, u = unit();
      if (S.running || S.m) S.t += dt;
      if (S.m) {
        const m = S.m;
        m.vy += 900 * u * dt; m.x += m.vx * dt; m.y += m.vy * dt; m.rot += S.spin * dt; m.air += dt;
        for (const s of S.stars) {
          if (!s.got && Math.hypot(s.x - m.x, s.y - (m.y + 40 * u)) < 52 * u) {
            s.got = true; S.score += 2; hud.score(S.score); sfx.good();
            S.fx.burst(s.x - S.cam, s.y, ['#ffd93b', '#fff'], 18, 260); S.fx.text(s.x - S.cam, s.y - 20, '+2', '#ffd93b');
          }
        }
        for (let i = 0; i < S.bars.length; i++) {
          if (i === m.from && m.air < 0.5) continue;
          const p = barPos(S.bars[i], S.t);
          if (Math.hypot(p.x - m.x, p.y - m.y) < 58 * u) {
            S.on = i; S.m = null;
            if (i > S.best) {
              const pts = i - S.best; S.best = i; S.score += pts; hud.score(S.score);
              S.fx.text(p.x - S.cam, p.y - 30, pts > 1 ? `¡Doble! +${pts}` : '+1', pts > 1 ? '#ffd93b' : '#fff');
              pts > 1 ? sfx.good() : sfx.coin();
            } else sfx.tap();
            S.fx.burst(p.x - S.cam, p.y, ['#fff', '#ffd93b'], 8, 200); buzz(20);
            while (S.bars.length < S.best + 6) addBar();
            break;
          }
        }
        if (S.m && m.y > H + 80 * u) {
          S.m = null; S.lives--; hud.lives(S.lives); sfx.bad(); buzz(160);
          stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
          S.on = S.best;
          if (S.lives <= 0) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 900); }
        }
      }
      const cur = S.m || barPos(S.bars[S.on], S.t);
      S.cam = lerp(S.cam, cur.x - W * 0.36, 1 - Math.pow(0.01, dt));
      S.fx.update(dt);

      // ---- dibujo ----
      const floor = H * 0.93;
      circus(g, W, H, S.cam * 0.35, now, u, floor);
      // red de seguridad
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5;
      const ny = H * 0.84, ns = 22 * u, no = ((S.cam % ns) + ns) % ns;
      for (let x = -no; x < W + ns; x += ns) { g.beginPath(); g.moveTo(x, ny); g.lineTo(x + ns, ny + ns); g.moveTo(x + ns, ny); g.lineTo(x, ny + ns); g.stroke(); }
      g.strokeStyle = '#ffd93b'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, ny); g.lineTo(W, ny); g.stroke();

      for (const s of S.stars) {
        if (s.got) continue;
        const x = s.x - S.cam;
        if (x > -40 && x < W + 40) drawSprite(g, img.estrella, x, s.y + Math.sin(now * 4 + s.x) * 5 * u, 46 * u, 46 * u, Math.sin(now * 2) * 0.2);
      }
      const mw = 78 * u, mh = mw * 170 / 120;
      S.bars.forEach((b, i) => {
        const p = barPos(b, S.t), x = p.x - S.cam, ax = b.x - S.cam;
        if (ax < -220 * u || ax > W + 220 * u) return;
        g.strokeStyle = '#f5e9c8'; g.lineWidth = 3;
        for (const s of [-1, 1]) { g.beginPath(); g.moveTo(ax + s * 14 * u, b.y - 4); g.lineTo(x + s * 22 * u * Math.cos(p.a), p.y - s * 22 * u * Math.sin(p.a)); g.stroke(); }
        g.fillStyle = '#ffd93b'; g.strokeStyle = '#3d2817'; g.lineWidth = 2.5;
        g.beginPath(); g.roundRect(ax - 20 * u, b.y - 12 * u, 40 * u, 12 * u, 5 * u); g.fill(); g.stroke();
        g.save(); g.translate(x, p.y); g.rotate(-p.a);
        g.fillStyle = i <= S.best ? '#3ecf6e' : '#ff5a5f';
        g.beginPath(); g.roundRect(-30 * u, -5 * u, 60 * u, 10 * u, 5 * u); g.fill(); g.stroke();
        if (!S.m && i === S.on) { g.rotate(Math.PI); g.drawImage(img.mono, -mw / 2, -mh + 8 * u, mw, mh); }
        g.restore();
      });
      if (S.m) drawSprite(g, img.mono, S.m.x - S.cam, S.m.y + mh * 0.45, mw, mh, S.m.rot);
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
