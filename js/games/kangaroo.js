import { kangarooSide, ITEMS, FRUITS, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, pick, clamp, makeCanvas, FX, drawSprite, cloud, hills } from '../kit.js';

const OBS = [
  { img: 'piedra', w: 64, h: 64 },
  { img: 'tronco', w: 92, h: 66 },
  { img: 'cactus', w: 58, h: 84 },
];

export default {
  id: 'canguro', name: 'Canguro Saltarín', animal: 'canguro', colors: ['#2e86de', '#ffd93b'],
  how: 'Tocá la pantalla para saltar. ¡Tocá dos veces para un súper salto! Juntá frutas y esquivá obstáculos.',
  mode: 'turns', countdown: true,
  stars: best => best >= 35 ? 3 : best >= 14 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = {
      k: sprite(kangarooSide(), 300), piedra: sprite(ITEMS.piedra()), tronco: sprite(ITEMS.tronco(), 270, 192),
      cactus: sprite(ITEMS.cactus(), 192, 270), arbol: sprite(ITEMS.arbol(), 200, 260), estrella: sprite(ITEMS.estrella()),
    };
    FRUITS.forEach(f => { img[f] = sprite(ITEMS[f]()); });
    await ready(img);
    const S = env.data = { fx: new FX(), y: 0, vy: 0, jumps: 0, obs: [], picks: [], scroll: 0, t: 0, score: 0, lives: 3, inv: 0, land: 0, running: false, over: false, toObs: 500, toPick: 300, done: null };
    hud.score(0); hud.lives(3); hud.time(null);

    const unit = () => Math.min(v.W, v.H * 0.62) / 400;
    scope.on(v.cv, 'pointerdown', e => {
      e.preventDefault();
      if (!S.running || S.jumps >= 2) return;
      const u = unit();
      S.vy = (S.jumps ? 840 : 980) * u; S.jumps++;
      S.jumps === 2 ? sfx.boing() : sfx.jump();
      if (S.jumps === 2) S.fx.ring(v.W * 0.24, v.H * 0.8 - S.y - 40 * u, '#fff', 46 * u);
    });

    scope.loop((dt, now) => {
      const { g, W, H } = v;
      const u = unit(), gy = H * 0.8, kx = W * 0.24, ks = 124 * u;
      const speed = S.running ? (290 + Math.min(S.t, 70) * 4.6) * u : 0;

      if (S.running) {
        S.t += dt; S.scroll += speed * dt;
        S.toObs -= speed * dt; S.toPick -= speed * dt;
        if (S.toObs <= 0) {
          const o = pick(OBS);
          S.obs.push({ ...o, x: W + 80 * u, rot: 0, vy: 0, dy: 0 });
          S.toObs = speed * rand(1.2, 2.1);
        }
        if (S.toPick <= 0) {
          const star = Math.random() < 0.14;
          S.picks.push({ type: star ? 'estrella' : pick(FRUITS), x: W + 60 * u, h: star ? rand(200, 250) * u : rand(36, 190) * u, ph: rand(0, 6) });
          S.toPick = speed * rand(0.5, 1.1);
        }
      }
      // física del canguro
      if (S.y > 0 || S.vy > 0) {
        S.vy -= 2600 * u * dt; S.y += S.vy * dt;
        if (S.y <= 0) {
          S.y = 0; S.vy = 0; S.jumps = 0; S.land = 0.16;
          if (!S.over) S.fx.burst(kx - 10 * u, gy, ['#e9c27a', '#fff3d6'], 6, 130, 5);
        }
      }
      S.land = Math.max(0, S.land - dt); S.inv = Math.max(0, S.inv - dt);
      const kcx = kx, kcy = gy - S.y - ks * 0.45;

      for (const o of S.obs) {
        o.x -= speed * dt;
        if (o.hit) { o.vy += 1800 * u * dt; o.dy += o.vy * dt; o.x += 380 * u * dt; o.rot += dt * 9; continue; }
        if (S.running && !o.passed && o.x < kx - ks * 0.3) { o.passed = true; S.score++; hud.score(S.score); }
        if (S.running && !S.inv && Math.abs(o.x - kcx) < ks * 0.26 + o.w * u * 0.34 && Math.abs((gy - o.h * u / 2) - kcy) < ks * 0.38 + o.h * u * 0.38) {
          o.hit = true; o.vy = -620 * u; o.passed = true;
          S.lives--; S.inv = 1.6; hud.lives(S.lives); sfx.bad(); buzz(160);
          S.fx.burst(o.x, gy - o.h * u / 2, ['#fff', '#ffd93b', '#ff6b6b'], 14, 300);
          stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
          if (S.lives <= 0) {
            S.running = false; S.over = true; S.vy = 700 * u; S.jumps = 2;
            scope.timeout(() => S.done && S.done(S.score), 1100);
          }
        }
      }
      S.obs = S.obs.filter(o => o.x > -120 * u && o.dy < H);
      for (const p of S.picks) {
        p.x -= speed * dt;
        const py = gy - p.h - Math.sin(now * 4 + p.ph) * 6 * u;
        if (S.running && Math.abs(p.x - kcx) < ks * 0.42 && Math.abs(py - kcy) < ks * 0.5) {
          p.gone = true;
          const pts = p.type === 'estrella' ? 3 : 1;
          S.score += pts; hud.score(S.score);
          pts > 1 ? sfx.good() : sfx.coin();
          S.fx.burst(p.x, py, pts > 1 ? ['#ffd93b', '#fff'] : ['#fff', '#ffd93b', '#ff9f1c'], pts > 1 ? 18 : 8, 220);
          S.fx.text(p.x, py - 20, '+' + pts, pts > 1 ? '#ffd93b' : '#fff');
        }
      }
      S.picks = S.picks.filter(p => !p.gone && p.x > -60 * u);
      S.fx.update(dt);

      // ---- dibujo ----
      const sky = g.createLinearGradient(0, 0, 0, gy);
      sky.addColorStop(0, '#58bdf5'); sky.addColorStop(1, '#ffe9b8');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      const sx = W * 0.78, sy = H * 0.16;
      const glow = g.createRadialGradient(sx, sy, 10, sx, sy, 130 * u);
      glow.addColorStop(0, 'rgba(255,240,170,.9)'); glow.addColorStop(1, 'rgba(255,240,170,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, gy);
      g.fillStyle = '#ffe066'; g.beginPath(); g.arc(sx, sy, 38 * u, 0, 7); g.fill();
      for (let i = 0; i < 3; i++) {
        const cx = W + 160 - ((S.scroll * 0.08 + now * 8 + i * (W + 200) / 3) % (W + 320));
        cloud(g, cx, H * (0.1 + i * 0.09), (0.7 + i * 0.25) * u);
      }
      hills(g, W, gy - 20 * u, 150 * u, '#b9e08f', S.scroll * 0.12, 520 * u, H);
      hills(g, W, gy, 90 * u, '#8fd066', S.scroll * 0.3 + 300, 380 * u, H);
      const gap = 330 * u, tw = 120 * u, th = tw * 1.3, off = (S.scroll * 0.55) % gap;
      for (let x = -off - tw; x < W + tw; x += gap) g.drawImage(img.arbol, x, gy - th + 6, tw, th);
      // suelo
      g.fillStyle = '#e9c27a'; g.fillRect(0, gy, W, H - gy);
      g.fillStyle = '#d9ad5f';
      const dg = 90 * u, doff = S.scroll % dg;
      for (let x = -doff; x < W + dg; x += dg) {
        g.beginPath(); g.ellipse(x + 20 * u, gy + 44 * u, 16 * u, 5 * u, 0, 0, 7); g.fill();
        g.beginPath(); g.ellipse(x + 62 * u, gy + 92 * u, 22 * u, 6 * u, 0, 0, 7); g.fill();
      }
      g.fillStyle = '#58a83a'; g.fillRect(0, gy - 4, W, 16 * u);
      g.fillStyle = '#6fc04a'; g.fillRect(0, gy - 4, W, 6 * u);
      g.fillStyle = '#58a83a';
      for (let x = -doff; x < W + dg; x += dg / 2) { g.beginPath(); g.moveTo(x, gy + 11 * u); g.lineTo(x + 7 * u, gy + 22 * u); g.lineTo(x + 14 * u, gy + 11 * u); g.fill(); }

      for (const p of S.picks) {
        const py = gy - p.h - Math.sin(now * 4 + p.ph) * 6 * u, s = (p.type === 'estrella' ? 54 : 44) * u;
        drawSprite(g, img[p.type], p.x, py, s, s, Math.sin(now * 3 + p.ph) * 0.15);
      }
      for (const o of S.obs) drawSprite(g, img[o.img], o.x, gy - o.h * u / 2 + 4 * u + o.dy, o.w * u, o.h * u, o.rot);

      // canguro
      const air = S.y > 0;
      const run = S.running && !air ? Math.abs(Math.sin(now * 11)) : 0;
      const sh = clamp(1 - S.y / (300 * u), 0.35, 1);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(kx, gy + 4 * u, ks * 0.34 * sh, 7 * u * sh, 0, 0, 7); g.fill();
      let rot = air ? clamp(-S.vy / (2400 * u), -0.32, 0.36) : Math.sin(now * 11) * 0.05 * (S.running ? 1 : 0);
      if (S.over) rot = now * 9;
      const sq = S.land ? 1 - S.land * 1.2 : air ? 1.05 : 1;
      if (!(S.inv && !S.over && Math.floor(now * 14) % 2)) {
        g.save(); g.translate(kx, gy - S.y - run * 12 * u);
        g.rotate(rot); g.scale(2 - sq, sq);
        g.drawImage(img.k, -ks / 2, -ks * 0.94, ks, ks);
        g.restore();
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
