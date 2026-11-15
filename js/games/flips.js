import { full, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { makeCanvas, FX, drawSprite, circus } from '../kit.js';

const TIME = 50, TAU = Math.PI * 2;

export default {
  id: 'trampolin', name: 'Saltos Mortales', animal: 'tigre', colors: ['#2e9bff', '#ff8fc7'],
  how: 'Mantené apretado en el aire para girar y soltá para frenar. ¡Caé de pie! Cada mortal suma y te hace saltar más alto.',
  mode: 'turns', countdown: true,
  stars: best => best >= 30 ? 3 : best >= 12 ? 2 : 1,
  fmt: s => `${s} pts`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { t: sprite(full('tigre'), 240, 340) };
    await ready(img);
    const S = env.data = { fx: new FX(), y: 0, vy: 0, rot: 0, total: 0, hold: false, combo: 0, dip: 0, t: 0, score: 0, lives: 3, hurt: 0, running: false, done: null };
    hud.score(0); hud.lives(3); hud.time(1);
    const unit = () => Math.min(v.W, v.H * 0.62) / 400;
    const G = 1500;
    const launch = u => { S.vy = Math.sqrt(2 * G * (235 + Math.min(S.combo, 6) * 38)) * u; S.y = 0.01; S.total = 0; sfx.boing(); };

    scope.on(v.cv, 'pointerdown', e => { e.preventDefault(); S.hold = true; });
    scope.on(window, 'pointerup', () => { S.hold = false; });
    scope.on(window, 'pointercancel', () => { S.hold = false; });

    scope.loop((dt, now) => {
      const { g, W, H } = v, u = unit(), gy = H * 0.8, cx = W / 2;
      S.dip = Math.max(0, S.dip - dt * 4); S.hurt = Math.max(0, S.hurt - dt);
      if (S.running) {
        S.t += dt; hud.time(1 - S.t / TIME);
        if (S.y <= 0 && S.hurt <= 0.4) launch(u);
        if (S.y > 0) {
          S.vy -= G * u * dt; S.y += S.vy * dt;
          if (S.hold) { S.rot += 9.5 * dt; S.total += 9.5 * dt; }
          if (S.y <= 0) {
            S.y = 0; S.dip = 1;
            const off = Math.abs(((S.rot % TAU) + TAU + Math.PI) % TAU - Math.PI);
            const flips = Math.round(S.total / TAU);
            if (off < 0.8) {
              S.rot = 0;
              if (flips > 0) {
                S.combo++;
                const pts = flips * (S.combo >= 3 ? 2 : 1);
                S.score += pts; hud.score(S.score); sfx.good(); buzz(25);
                S.fx.burst(cx, gy - 40 * u, ['#ffd93b', '#fff', '#ff8fc7'], 12 + flips * 6, 300);
                S.fx.text(cx, gy - 150 * u, `${flips === 1 ? '¡Mortal!' : flips === 2 ? '¡Doble mortal!' : '¡Triple mortal!'} +${pts}`, '#ffd93b');
                if (S.combo === 3) S.fx.text(cx, gy - 200 * u, '¡Racha x2!', '#7af08a');
              } else S.combo = Math.max(0, S.combo - 1);
            } else {
              S.combo = 0; S.lives--; S.hurt = 0.9; hud.lives(S.lives); sfx.bad(); buzz(160);
              S.fx.text(cx, gy - 120 * u, '¡Ay!', '#ff6b6b');
              stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
            }
          }
        }
        if (S.t >= TIME || S.lives <= 0) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 900); }
      }
      S.fx.update(dt);

      // ---- dibujo ----
      circus(g, W, H, 0, now, u, H * 0.9);
      // trampolín
      const tw = 150 * u, dip = S.dip * 26 * u * (S.y <= 0 ? 1 : 0.4);
      g.strokeStyle = '#3d2817'; g.lineWidth = 7 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - tw, gy); g.lineTo(cx - tw + 14 * u, gy + 60 * u); g.moveTo(cx + tw, gy); g.lineTo(cx + tw - 14 * u, gy + 60 * u); g.stroke();
      g.strokeStyle = '#2e9bff'; g.lineWidth = 12 * u;
      g.beginPath(); g.moveTo(cx - tw, gy); g.quadraticCurveTo(cx, gy + dip * 2, cx + tw, gy); g.stroke();
      g.strokeStyle = '#a9d6ff'; g.lineWidth = 3 * u;
      g.beginPath(); g.moveTo(cx - tw, gy - 3 * u); g.quadraticCurveTo(cx, gy + dip * 2 - 3 * u, cx + tw, gy - 3 * u); g.stroke();
      // altura de la racha
      for (let i = 0; i < 6; i++) {
        g.fillStyle = i < S.combo ? '#ffd93b' : 'rgba(255,255,255,.25)';
        g.beginPath(); g.arc(W - 22 * u, gy - 30 * u - i * 24 * u, 8 * u, 0, 7); g.fill();
      }
      // tigre
      const tw2 = 104 * u, th = tw2 * 170 / 120;
      const sh = Math.max(0.3, 1 - S.y / (500 * u));
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, gy + dip + 4 * u, tw2 * 0.4 * sh, 7 * u * sh, 0, 0, 7); g.fill();
      const fallen = S.hurt > 0 && S.y <= 0;
      if (!(S.hurt && Math.floor(now * 14) % 2 && !fallen)) {
        drawSprite(g, img.t, cx, gy - S.y - th / 2 + dip + (fallen ? th * 0.2 : 0), tw2, th, fallen ? Math.PI / 2 : S.rot, 1, S.y <= 0 && !fallen ? 1 - S.dip * 0.12 : 1);
      }
      if (S.y > 0 && S.total > TAU * 0.6) {
        g.font = `700 ${Math.round(34 * u)}px Fredoka, sans-serif`; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = '#3d2817'; g.fillStyle = '#fff';
        const n = 'x' + Math.round(S.total / TAU);
        g.strokeText(n, cx + 90 * u, gy - S.y - th / 2); g.fillText(n, cx + 90 * u, gy - S.y - th / 2);
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
