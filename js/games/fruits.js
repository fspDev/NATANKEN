import { full, ITEMS, FRUITS, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, pick, clamp, lerp, makeCanvas, FX, drawSprite, cloud, hills } from '../kit.js';

const TIME = 40;
const JUICE = { manzana: '#e8472b', naranja: '#ff9f1c', banana: '#ffd93b', sandia: '#ff5a5f', frutilla: '#ff3b4e', uvas: '#9b5de5' };

export default {
  id: 'frutas', name: 'Lluvia de Frutas', animal: 'mono', colors: ['#27ae60', '#ffd93b'],
  how: 'Mové al mono con el dedo para atrapar las frutas. ¡Esquivá las piedras!',
  mode: 'turns', countdown: true,
  stars: best => best >= 32 ? 3 : best >= 16 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { mono: sprite(full('mono'), 240, 340), arbol: sprite(ITEMS.arbol(), 200, 260), estrella: sprite(ITEMS.estrella()), piedra: sprite(ITEMS.piedra()) };
    FRUITS.forEach(f => { img[f] = sprite(ITEMS[f]()); });
    await ready(img);
    const S = env.data = { fx: new FX(), items: [], px: v.W / 2, tx: v.W / 2, score: 0, lives: 3, t: 0, next: 0.4, running: false, hurt: 0, gulp: 0, done: null };
    hud.score(0); hud.lives(3); hud.time(1);

    const move = e => { if (e.buttons || e.pointerType !== 'mouse' || e.type === 'pointerdown') S.tx = v.pos(e).x; };
    scope.on(v.cv, 'pointerdown', move);
    scope.on(v.cv, 'pointermove', move);

    scope.loop((dt, now) => {
      const { g, W, H } = v;
      const u = Math.min(W, H * 0.7) / 400;
      const gy = H * 0.88, mw = 118 * u, mh = mw * 170 / 120, bw = mw * 1.2, by = gy - mh * 0.5;

      if (S.running) {
        S.t += dt; S.next -= dt;
        const k = clamp(S.t / TIME, 0, 1);
        hud.time(1 - k);
        if (S.next <= 0) {
          S.next = lerp(0.85, 0.4, k) * rand(0.75, 1.25);
          const r = Math.random();
          const type = r < lerp(0.14, 0.24, k) ? 'piedra' : r > 0.94 ? 'estrella' : pick(FRUITS);
          S.items.push({ type, x: rand(34 * u, W - 34 * u), y: -40, vy: H * lerp(0.32, 0.6, k) * rand(0.85, 1.15), rot: rand(0, 6), vr: rand(-3, 3), r: 27 * u });
        }
        if (S.t >= TIME || S.lives <= 0) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 700); }
      }
      S.px = lerp(S.px, clamp(S.tx, bw / 2, W - bw / 2), 1 - Math.pow(0.0001, dt));
      S.hurt = Math.max(0, S.hurt - dt); S.gulp = Math.max(0, S.gulp - dt);

      for (const it of S.items) {
        it.y += it.vy * dt; it.rot += it.vr * dt;
        if (S.running && !it.gone && it.y + it.r * 0.5 >= by && it.y < by + 26 * u && Math.abs(it.x - S.px) < bw / 2) {
          it.gone = true; S.gulp = 0.18;
          if (it.type === 'piedra') {
            S.lives--; S.hurt = 0.5; hud.lives(S.lives); sfx.bad(); buzz(150);
            S.fx.burst(it.x, by, ['#9aa3ad', '#6f7882'], 10, 240); S.fx.text(it.x, by - 30, '¡Ay!', '#ff6b6b');
            stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
          } else {
            const pts = it.type === 'estrella' ? 5 : 1;
            S.score += pts; hud.score(S.score);
            it.type === 'estrella' ? sfx.good() : sfx.coin(); buzz(15);
            S.fx.burst(it.x, by, it.type === 'estrella' ? ['#ffd93b', '#fff'] : [JUICE[it.type], '#fff'], pts > 1 ? 22 : 10, 260);
            S.fx.text(it.x, by - 30, '+' + pts, pts > 1 ? '#ffd93b' : '#fff');
          }
        } else if (!it.gone && it.y > gy - it.r * 0.4) {
          it.gone = true;
          S.fx.burst(it.x, gy, it.type === 'piedra' ? '#9aa3ad' : (JUICE[it.type] || '#ffd93b'), 7, 160, 5);
        }
      }
      S.items = S.items.filter(it => !it.gone);
      S.fx.update(dt);

      // ---- dibujo ----
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#6ecbff'); sky.addColorStop(0.7, '#d8f6ff'); sky.addColorStop(1, '#f4ffd9');
      g.fillStyle = sky; g.fillRect(0, 0, W, H);
      cloud(g, ((now * 12) % (W + 200)) - 150, H * 0.12, 1.1 * u);
      cloud(g, ((now * 7 + W * 0.6) % (W + 200)) - 150, H * 0.26, 0.8 * u);
      hills(g, W, gy - 40 * u, 90 * u, '#a5dd7e', 60, 380 * u, H);
      hills(g, W, gy - 10 * u, 60 * u, '#7cc957', 200, 300 * u, H);
      const tw = 150 * u, th = tw * 1.3;
      g.drawImage(img.arbol, -tw * 0.35, gy - th + 8, tw, th);
      g.drawImage(img.arbol, W - tw * 0.65, gy - th + 8, tw, th);
      g.fillStyle = '#58a83a'; g.fillRect(0, gy - 6, W, H - gy + 6);
      g.fillStyle = '#6fc04a'; g.fillRect(0, gy - 6, W, 12 * u);
      g.fillStyle = '#4c9a2a';
      for (let x = 12; x < W; x += 46 * u) { g.beginPath(); g.ellipse(x + Math.sin(x) * 8, gy + 30 * u + Math.cos(x * 3) * 14 * u, 9 * u, 4 * u, 0, 0, 7); g.fill(); }

      // mono
      const wob = Math.sin(now * 9) * 2 * u * (Math.abs(S.tx - S.px) > 4 ? 2.5 : 1);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(S.px, gy + 2, mw * 0.45, 8 * u, 0, 0, 7); g.fill();
      const shakeX = S.hurt ? Math.sin(now * 60) * 6 * u : 0;
      if (!(S.hurt && Math.floor(now * 16) % 2)) g.drawImage(img.mono, S.px - mw / 2 + shakeX, gy - mh + wob, mw, mh);
      // canasta
      const sq = S.gulp ? 1 + S.gulp * 0.8 : 1, bh = 46 * u;
      g.save(); g.translate(S.px + shakeX, by + wob); g.scale(sq, 2 - sq);
      g.fillStyle = '#c98a45'; g.strokeStyle = '#3d2817'; g.lineWidth = 3; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(-bw / 2, 0); g.lineTo(bw / 2, 0); g.lineTo(bw * 0.36, bh); g.lineTo(-bw * 0.36, bh); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#8a5a2a'; g.lineWidth = 2;
      for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(-bw / 2 + i * 5 * u, bh * i / 3); g.lineTo(bw / 2 - i * 5 * u, bh * i / 3); g.stroke(); }
      for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * bw * 0.17, 2); g.lineTo(i * bw * 0.13, bh - 2); g.stroke(); }
      g.fillStyle = '#e2a75c'; g.strokeStyle = '#3d2817'; g.lineWidth = 3;
      g.beginPath(); g.roundRect(-bw / 2 - 4 * u, -7 * u, bw + 8 * u, 13 * u, 6 * u); g.fill(); g.stroke();
      g.restore();

      for (const it of S.items) drawSprite(g, img[it.type], it.x, it.y, it.r * 2.1, it.r * 2.1, it.rot);
      S.fx.draw(g);
      if (S.hurt > 0.3) { g.fillStyle = `rgba(255,60,60,${(S.hurt - 0.3) * 1.2})`; g.fillRect(0, 0, W, H); }
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
