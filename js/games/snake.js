import { ITEMS, FRUITS, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { pick, makeCanvas, FX, drawSprite } from '../kit.js';

const TIME = 60, COLS = 9;

export default {
  id: 'viborita', name: 'Viborita Glotona', animal: 'vibora', colors: ['#3ecf6e', '#ffd93b'],
  how: 'Deslizá el dedo para girar la viborita. Comé frutas para crecer, ¡pero no te muerdas la cola!',
  mode: 'turns', countdown: true,
  stars: best => best >= 20 ? 3 : best >= 9 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { estrella: sprite(ITEMS.estrella()) };
    FRUITS.forEach(f => { img[f] = sprite(ITEMS[f]()); });
    await ready(img);
    const rows = Math.max(8, Math.floor(v.H / Math.floor(v.W / COLS)));
    const mid = rows >> 1;
    const S = env.data = {
      fx: new FX(), rows, snake: [{ x: 3, y: mid }, { x: 2, y: mid }, { x: 1, y: mid }], from: null,
      dir: [1, 0], q: [], food: null, star: null, starT: 8, acc: 0, t: 0, score: 0, running: false, dead: 0, done: null,
    };
    S.from = S.snake.map(s => ({ ...s }));
    hud.score(0); hud.time(1); hud.lives(null);

    const free = () => {
      for (let i = 0; i < 300; i++) {
        const c = { x: (Math.random() * COLS) | 0, y: (Math.random() * rows) | 0 };
        if (!S.snake.some(s => s.x === c.x && s.y === c.y) && !(S.food && S.food.x === c.x && S.food.y === c.y)) return c;
      }
      return { x: 0, y: 0 };
    };
    S.food = { ...free(), type: pick(FRUITS) };

    const turn = (dx, dy) => {
      const last = S.q.length ? S.q[S.q.length - 1] : S.dir;
      if ((dx === last[0] && dy === last[1]) || (dx === -last[0] && dy === -last[1])) return;
      if (S.q.length < 2) S.q.push([dx, dy]);
    };
    let start = null;
    scope.on(v.cv, 'pointerdown', e => { e.preventDefault(); start = { x: e.clientX, y: e.clientY }; });
    scope.on(v.cv, 'pointermove', e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy));
      start = { x: e.clientX, y: e.clientY };
    });
    scope.on(window, 'pointerup', () => { start = null; });
    scope.on(window, 'keydown', e => {
      const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (k) turn(k[0], k[1]);
    });

    const geo = () => {
      const cell = Math.min(v.W / COLS, v.H / rows);
      return { cell, ox: (v.W - cell * COLS) / 2, oy: (v.H - cell * rows) / 2 };
    };
    const center = (c, G) => ({ x: G.ox + (c.x + 0.5) * G.cell, y: G.oy + (c.y + 0.5) * G.cell });

    const step = G => {
      if (S.q.length) S.dir = S.q.shift();
      const old = S.snake.map(s => ({ ...s })), h = old[0];
      const nh = { x: (h.x + S.dir[0] + COLS) % COLS, y: (h.y + S.dir[1] + rows) % rows };
      const eat = S.food.x === nh.x && S.food.y === nh.y;
      const body = eat ? old : old.slice(0, -1);
      if (body.some(s => s.x === nh.x && s.y === nh.y)) {
        S.running = false; S.dead = 0.001; sfx.bad(); buzz(200);
        stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
        scope.timeout(() => S.done && S.done(S.score), 1100);
        return;
      }
      S.snake = [nh, ...body];
      S.from = S.snake.map((s, i) => i === 0 ? old[0] : old[i - 1]);
      const p = center(nh, G);
      if (eat) {
        S.score++; hud.score(S.score); sfx.coin(); buzz(15);
        S.fx.burst(p.x, p.y, ['#fff', '#ffd93b', '#ff9f1c'], 10, 220); S.fx.text(p.x, p.y - 20, '+1');
        S.food = { ...free(), type: pick(FRUITS) };
      }
      if (S.star && S.star.x === nh.x && S.star.y === nh.y) {
        S.score += 3; hud.score(S.score); sfx.good(); S.star = null; S.starT = 10;
        S.fx.burst(p.x, p.y, ['#ffd93b', '#fff'], 20, 260); S.fx.text(p.x, p.y - 20, '+3', '#ffd93b');
      }
    };

    scope.loop((dt, now) => {
      const { g, W, H } = v, G = geo(), c = G.cell;
      if (S.running) {
        S.t += dt; S.acc += dt; S.starT -= dt;
        hud.time(1 - S.t / TIME);
        if (S.starT <= 0) { S.star = S.star ? null : free(); S.starT = S.star ? 6 : 10; }
        const iv = Math.max(0.105, 0.21 - S.score * 0.004);
        while (S.running && S.acc >= iv) { S.acc -= iv; step(G); }
        S.k = S.acc / iv;
        if (S.running && S.t >= TIME) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 600); }
      }
      if (S.dead) S.dead += dt;
      S.fx.update(dt);

      g.fillStyle = '#2f7d22'; g.fillRect(0, 0, W, H);
      for (let y = 0; y < rows; y++) for (let x = 0; x < COLS; x++) {
        g.fillStyle = (x + y) % 2 ? '#8fd66a' : '#9fe07a';
        g.fillRect(G.ox + x * c, G.oy + y * c, c + 0.5, c + 0.5);
      }
      const f = center(S.food, G);
      drawSprite(g, img[S.food.type], f.x, f.y + Math.sin(now * 5) * c * 0.06, c * 0.95, c * 0.95, Math.sin(now * 3) * 0.12);
      if (S.star) { const s = center(S.star, G); drawSprite(g, img.estrella, s.x, s.y, c * (1 + Math.sin(now * 8) * 0.1), c * (1 + Math.sin(now * 8) * 0.1), now * 2); }

      // viborita con movimiento suave entre casillas
      const k = S.running ? (S.k || 0) : 1;
      const pts = S.snake.map((s, i) => {
        const a = S.from[i] || s;
        const wrap = Math.abs(a.x - s.x) > 1 || Math.abs(a.y - s.y) > 1;
        return center(wrap ? s : { x: a.x + (s.x - a.x) * k, y: a.y + (s.y - a.y) * k }, G);
      });
      const r = c * 0.47;
      g.fillStyle = '#3d2817';
      pts.forEach((p, i) => { g.beginPath(); g.arc(p.x, p.y, (i ? r : r * 1.16) + 3, 0, 7); g.fill(); });
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        g.fillStyle = S.dead && Math.floor(S.dead * 12) % 2 ? '#ff6b6b' : i === 0 ? '#4fbf5a' : i % 2 ? '#62cf6b' : '#3da94a';
        g.beginPath(); g.arc(p.x, p.y, i ? r : r * 1.16, 0, 7); g.fill();
        if (i && i % 2) { g.fillStyle = '#ffd93b'; g.beginPath(); g.arc(p.x, p.y, r * 0.3, 0, 7); g.fill(); }
      }
      const hp = pts[0], [dx, dy] = S.dir;
      if (Math.sin(now * 9) > 0.2) {
        g.strokeStyle = '#e8472b'; g.lineWidth = c * 0.09; g.lineCap = 'round';
        g.beginPath(); g.moveTo(hp.x + dx * r, hp.y + dy * r); g.lineTo(hp.x + dx * r * 1.7, hp.y + dy * r * 1.7); g.stroke();
      }
      for (const s of [-1, 1]) {
        const ex = hp.x + dx * r * 0.3 - dy * s * r * 0.5, ey = hp.y + dy * r * 0.3 + dx * s * r * 0.5;
        g.fillStyle = '#fff'; g.strokeStyle = '#3d2817'; g.lineWidth = 2;
        g.beginPath(); g.arc(ex, ey, r * 0.36, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(ex + dx * r * 0.12, ey + dy * r * 0.12, r * 0.19, 0, 7); g.fill();
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
