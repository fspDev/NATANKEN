import { full, sprite, ready } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { makeCanvas, FX, circus } from '../kit.js';

export default {
  id: 'equilibrio', name: 'Panda Equilibrista', animal: 'panda', colors: ['#b06cf0', '#ffffff'],
  how: 'El panda camina por la cuerda floja. Apretá a la izquierda o a la derecha de la pantalla para que no se caiga. ¡Ojo con el viento!',
  mode: 'turns', countdown: true,
  stars: best => best >= 45 ? 3 : best >= 20 ? 2 : 1,
  fmt: s => `${s} m`,

  async setup(env) {
    const { stage, scope, hud } = env;
    const v = makeCanvas(stage, scope);
    const img = { p: sprite(full('panda'), 240, 340) };
    await ready(img);
    const S = env.data = { fx: new FX(), a: 0, va: 0, input: 0, wind: 0, t: 0, walk: 0, score: 0, lives: 3, fall: 0, grace: 1.2, running: false, done: null, touches: new Map() };
    hud.score(0); hud.lives(3); hud.time(null);

    const refresh = () => { let i = 0; S.touches.forEach(d => { i += d; }); S.input = Math.sign(i); };
    scope.on(v.cv, 'pointerdown', e => { e.preventDefault(); S.touches.set(e.pointerId, v.pos(e).x < v.W / 2 ? -1 : 1); refresh(); });
    const up = e => { S.touches.delete(e.pointerId); refresh(); };
    scope.on(window, 'pointerup', up); scope.on(window, 'pointercancel', up);
    scope.on(window, 'keydown', e => { if (e.key === 'ArrowLeft') S.input = -1; if (e.key === 'ArrowRight') S.input = 1; });
    scope.on(window, 'keyup', () => { S.input = 0; });

    scope.loop((dt, now) => {
      const { g, W, H } = v, u = Math.min(W, H * 0.62) / 400, ry = H * 0.66, cx = W / 2;
      if (S.running) {
        if (S.fall > 0) {
          S.fall -= dt; S.a += S.va * dt; S.va += Math.sign(S.a) * 6 * dt;
          if (S.fall <= 0) {
            if (S.lives <= 0) { S.running = false; scope.timeout(() => S.done && S.done(S.score), 500); }
            else { S.a = 0; S.va = 0; S.grace = 1.2; }
          }
        } else {
          S.t += dt; S.grace = Math.max(0, S.grace - dt);
          const diff = 1 + Math.min(S.t, 70) / 45;
          S.wind = S.grace > 0 ? 0 : (Math.sin(S.t * 0.8) * 1.3 + Math.sin(S.t * 2.1 + 1) * 0.9 + Math.sin(S.t * 0.31 + 4) * 1.2) * diff;
          S.va += (3 * diff * Math.sin(S.a) + S.wind * 0.35 + S.input * 6.5 - S.va * 0.9) * dt;
          S.a += S.va * dt;
          S.walk += dt * 1.0;
          if (Math.floor(S.walk) > S.score) { S.score = Math.floor(S.walk); hud.score(S.score); if (S.score % 10 === 0) { sfx.good(); S.fx.text(cx, ry - 230 * u, `¡${S.score} metros!`, '#ffd93b'); } }
          if (Math.abs(S.a) > 1.15) {
            S.fall = 1.1; S.lives--; hud.lives(S.lives); sfx.bad(); buzz(180);
            stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
          }
        }
      }
      S.fx.update(dt);

      // ---- dibujo ----
      const scroll = S.walk * 70 * u;
      circus(g, W, H, scroll * 0.4, now, u, H * 0.93);
      // postes y cuerda
      const gap = 420 * u, po = ((scroll % gap) + gap) % gap;
      for (let x = -po + gap * 0.3; x < W + gap; x += gap) {
        g.fillStyle = '#ffd93b'; g.strokeStyle = '#3d2817'; g.lineWidth = 3;
        g.beginPath(); g.roundRect(x - 7 * u, ry - 6 * u, 14 * u, H, 5 * u); g.fill(); g.stroke();
        g.fillStyle = '#e8472b'; g.beginPath(); g.moveTo(x, ry - 6 * u); g.lineTo(x, ry - 40 * u); g.lineTo(x + 26 * u + S.wind * 3 * u, ry - 30 * u); g.lineTo(x, ry - 20 * u); g.fill(); g.stroke();
      }
      const sag = 8 * u + Math.abs(S.a) * 6 * u;
      g.strokeStyle = '#f5e9c8'; g.lineWidth = 5 * u; g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, ry); g.quadraticCurveTo(cx, ry + sag * 2, W, ry); g.stroke();
      // panda con su vara
      const pw = 112 * u, ph = pw * 170 / 120, drop = S.fall > 0 ? (1.1 - S.fall) * (1.1 - S.fall) * 500 * u : 0;
      g.save(); g.translate(cx, ry + sag + drop); g.rotate(S.a);
      const bob = S.fall > 0 ? 0 : Math.abs(Math.sin(S.walk * 6)) * 5 * u;
      g.drawImage(img.p, -pw / 2, -ph + 6 * u - bob, pw, ph);
      g.save(); g.translate(0, -ph * 0.3 - bob); g.rotate(-S.a * 0.6 - S.va * 0.15);
      g.strokeStyle = '#3d2817'; g.lineWidth = 9 * u; g.beginPath(); g.moveTo(-150 * u, 0); g.lineTo(150 * u, 0); g.stroke();
      g.strokeStyle = '#ff8fc7'; g.lineWidth = 5 * u; g.beginPath(); g.moveTo(-150 * u, 0); g.lineTo(150 * u, 0); g.stroke();
      g.fillStyle = '#ffd93b'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 150 * u, 0, 9 * u, 0, 7); g.fill(); }
      g.restore(); g.restore();
      // indicador de viento
      if (Math.abs(S.wind) > 0.6 && S.fall <= 0) {
        const d = Math.sign(S.wind), n = Math.min(3, Math.ceil(Math.abs(S.wind) / 1.2));
        g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 4 * u; g.lineCap = 'round';
        for (let i = 0; i < n; i++) {
          const y = H * 0.2 + i * 26 * u, x = cx - d * 80 * u + ((now * 160 * d * u + i * 50) % (160 * u));
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + d * 46 * u, y); g.lineTo(x + d * 32 * u, y - 10 * u); g.moveTo(x + d * 46 * u, y); g.lineTo(x + d * 32 * u, y + 10 * u); g.stroke();
        }
      }
      // zonas de control
      g.font = `700 ${Math.round(44 * u)}px Fredoka, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const s of [-1, 1]) {
        g.fillStyle = S.input === s ? 'rgba(255,217,59,.9)' : 'rgba(255,255,255,.28)';
        g.beginPath(); g.arc(cx + s * W * 0.34, H * 0.88, 36 * u, 0, 7); g.fill();
        g.fillStyle = '#3d2817'; g.fillText(s < 0 ? '‹' : '›', cx + s * W * 0.34, H * 0.875);
      }
      S.fx.draw(g);
    });
  },

  play(env) {
    return new Promise(resolve => { env.data.done = resolve; env.data.running = true; });
  },
};
