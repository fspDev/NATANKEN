import { full, AVATAR_IDS } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, shuffle } from '../kit.js';

export default {
  id: 'carrera', name: 'Carrera Salvaje', animal: 'cebra', colors: ['#e8472b', '#ffffff'],
  how: '¡Tocá tu botón lo más rápido que puedas para llegar primero a la meta!',
  mode: 'together', countdown: true,
  stars: best => best >= 4 ? 3 : best >= 3 ? 2 : 1,
  fmt: s => `${5 - s}º puesto`,

  setup({ stage, players, hud }) {
    hud.title('🏁 ¡A correr!'); hud.score(null);
    const used = players.map(p => p.animal);
    const cpuAnimals = shuffle(AVATAR_IDS.filter(a => !used.includes(a)));
    const runners = players.map((p, i) => ({ human: true, pi: i, animal: p.animal, color: p.color, prog: 0, place: 0 }));
    while (runners.length < 4) runners.push({ human: false, animal: cpuAnimals.pop(), color: '#9aa3ad', prog: 0, place: 0, speed: rand(0.04, 0.056) });
    stage.innerHTML = `
      <div class="race">
        <div class="race-track">
          <div class="race-crowd"></div>
          ${runners.map((r, i) => `<div class="lane" style="--c:${r.color}">
            <div class="lane-flag"></div>
            <div class="runner" data-r="${i}"><div class="runner-in">${full(r.animal)}</div>${r.human ? '' : '<b class="cpu">CPU</b>'}</div>
          </div>`).join('')}
        </div>
        <div class="race-pads n${players.length}">
          ${players.map((p, i) => `<button class="pad" data-p="${i}" style="--c:${p.color}">
            <span class="pad-av">${full(p.animal)}</span><span class="pad-txt">¡TOCÁ!</span></button>`).join('')}
        </div>
      </div>`;
    this._runners = runners;
  },

  play({ stage, scope, players }) {
    return new Promise(resolve => {
      const runners = this._runners;
      const els = runners.map((_, i) => stage.querySelector(`.runner[data-r="${i}"]`));
      const pads = [...stage.querySelectorAll('.pad')];
      let placed = 0, done = false;
      const TAPS = 42;

      const place = () => runners.forEach((r, i) => { els[i].style.left = `${2 + r.prog * 76}%`; });
      const hop = i => {
        const el = els[i].firstElementChild;
        el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop');
      };
      const arrive = (r, i) => {
        r.prog = 1; r.place = ++placed;
        els[i].classList.add('arrived');
        els[i].insertAdjacentHTML('beforeend', `<b class="medal m${r.place}">${r.place}º</b>`);
        if (r.human) { sfx.good(); buzz(60); pads[r.pi].classList.add('done'); }
        if (!done && runners.filter(x => x.human).every(x => x.place)) {
          done = true;
          scope.timeout(() => resolve(players.map((_, pi) => 5 - runners.find(x => x.pi === pi).place)), 1100);
        }
      };

      pads.forEach(pad => scope.on(pad, 'pointerdown', e => {
        e.preventDefault();
        const pi = +pad.dataset.p, i = runners.findIndex(r => r.pi === pi), r = runners[i];
        if (r.place) return;
        r.prog += 1 / TAPS;
        sfx.tap(pi); hop(i);
        pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
        if (r.prog >= 1) arrive(r, i);
        place();
      }));

      let hopT = 0;
      scope.loop(dt => {
        hopT += dt;
        runners.forEach((r, i) => {
          if (r.human || r.place) return;
          r.prog += r.speed * dt * (0.7 + Math.sin(hopT * 1.7 + i * 2) * 0.5 + 0.3);
          if (r.prog >= 1) arrive(r, i);
        });
        if (hopT > 0.28) { hopT -= 0.28; runners.forEach((r, i) => { if (!r.human && !r.place) hop(i); }); }
        place();
      });
    });
  },
};
