import { head } from '../art.js';
import { sfx, buzz } from '../audio.js';

const PADS = [
  { a: 'leon', c: '#e8472b', n: 60 }, { a: 'elefante', c: '#2e86de', n: 64 },
  { a: 'mono', c: '#27ae60', n: 67 }, { a: 'tucan', c: '#f39a1e', n: 72 },
];

export default {
  id: 'coro', name: 'Coro Animal', animal: 'leon', colors: ['#ff5fa2', '#ffd93b'],
  how: 'Mirá y escuchá en qué orden cantan los animales, y después repetilo igual. ¡Cada vez es más largo!',
  mode: 'turns', countdown: true,
  stars: best => best >= 10 ? 3 : best >= 6 ? 2 : 1,
  fmt: s => `${s} ${s === 1 ? 'ronda' : 'rondas'}`,

  setup({ stage, hud }) {
    stage.innerHTML = `<div class="coro"><div class="coro-msg">¡Prepará el oído!</div>
      <div class="coro-grid">${PADS.map((p, i) => `<button class="coro-pad" data-i="${i}" style="--c:${p.c}">${head(p.a)}</button>`).join('')}</div></div>`;
    hud.score(0); hud.lives(3); hud.time(null);
  },

  play({ stage, scope, hud }) {
    return new Promise(resolve => {
      const pads = [...stage.querySelectorAll('.coro-pad')], $msg = stage.querySelector('.coro-msg');
      const seq = [];
      let pos = 0, open = false, score = 0, lives = 3;
      const msg = (t, cls = '') => { $msg.textContent = t; $msg.className = 'coro-msg ' + cls; };
      const flash = (i, ms) => {
        pads[i].classList.add('on'); sfx.note(PADS[i].n);
        scope.timeout(() => pads[i].classList.remove('on'), ms);
      };
      const show = async () => {
        open = false; msg('👀 ¡Mirá y escuchá!');
        await scope.wait(700);
        const d = Math.max(280, 620 - seq.length * 28);
        for (const i of seq) { flash(i, d * 0.65); await scope.wait(d); }
        pos = 0; open = true; msg('👉 ¡Tu turno!', 'go');
      };
      const next = () => {
        let i;
        do { i = (Math.random() * 4) | 0; } while (seq.length >= 2 && seq[seq.length - 1] === i && seq[seq.length - 2] === i);
        seq.push(i); show();
      };
      pads.forEach((pad, i) => scope.on(pad, 'pointerdown', async e => {
        e.preventDefault();
        if (!open) return;
        flash(i, 200);
        if (i === seq[pos]) {
          if (++pos < seq.length) return;
          open = false; score++; hud.score(score); buzz(25);
          msg('¡Muy bien!', 'ok');
          scope.timeout(() => sfx.good(), 260);
          await scope.wait(900);
          next();
        } else {
          open = false; lives--; hud.lives(lives); sfx.bad(); buzz(160);
          stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
          if (lives <= 0) { msg('¡Se terminó!', 'bad'); scope.timeout(() => resolve(score), 900); return; }
          msg('¡Ups! Probá otra vez', 'bad');
          await scope.wait(1000);
          show();
        }
      }));
      next();
    });
  },
};
