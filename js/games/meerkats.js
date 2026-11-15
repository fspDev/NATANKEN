import { full, head } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { rand, lerp } from '../kit.js';

const TIME = 30;

export default {
  id: 'suricatas', name: 'Suricatas Curiosas', animal: 'suricata', colors: ['#f39a1e', '#fff3d6'],
  how: 'Tocá a las suricatas cuando asoman. ¡Cuidado, no toques al cocodrilo!',
  mode: 'turns', countdown: true,
  stars: best => best >= 22 ? 3 : best >= 12 ? 2 : 1,
  fmt: s => `${s} pts`,

  setup({ stage }) {
    stage.innerHTML = `<div class="mk">
      <div class="mk-sky"></div>
      <div class="mk-grid">${Array.from({ length: 9 }, (_, i) => `
        <div class="hole" data-h="${i}">
          <div class="hole-clip"><div class="critter"></div></div>
          <div class="mound"></div>
        </div>`).join('')}</div></div>`;
  },

  play({ stage, scope, hud }) {
    return new Promise(resolve => {
      const holes = [...stage.querySelectorAll('.hole')].map(el => ({ el, critter: el.querySelector('.critter'), busy: false, type: null, id: 0 }));
      const suri = full('suricata'), coco = head('coco');
      let score = 0, t = 0, next = 0.3, ended = false;
      hud.score(0); hud.time(1);

      const hide = (h, id) => {
        if (h.id !== id) return;
        h.critter.classList.remove('up');
        h.type = null;
        scope.timeout(() => { if (h.id === id) h.busy = false; }, 260);
      };
      const spawn = () => {
        const free = holes.filter(h => !h.busy);
        if (!free.length) return;
        const h = free[(Math.random() * free.length) | 0];
        const k = t / TIME;
        h.busy = true; h.id++;
        h.type = Math.random() < lerp(0.12, 0.24, k) ? 'coco' : 'suri';
        h.critter.className = 'critter ' + h.type;
        h.critter.innerHTML = h.type === 'coco' ? coco : suri;
        void h.critter.offsetWidth;
        h.critter.classList.add('up');
        const id = h.id;
        scope.timeout(() => hide(h, id), lerp(1250, 760, k) * (h.type === 'coco' ? 1.15 : 1));
      };

      holes.forEach(h => scope.on(h.el, 'pointerdown', e => {
        e.preventDefault();
        if (ended || !h.type) return;
        const good = h.type === 'suri';
        h.type = null;
        const pop = document.createElement('b');
        pop.className = 'mk-pop ' + (good ? 'good' : 'bad');
        pop.textContent = good ? '+1' : '-2';
        h.el.appendChild(pop);
        scope.timeout(() => pop.remove(), 700);
        if (good) {
          score++; sfx.bonk(); buzz(20);
          h.critter.classList.add('hit');
        } else {
          score = Math.max(0, score - 2); sfx.bad(); buzz(120);
          h.critter.classList.add('chomp');
          stage.classList.remove('shake'); void stage.offsetWidth; stage.classList.add('shake');
        }
        hud.score(score);
        const id = h.id;
        scope.timeout(() => hide(h, id), 220);
      }));

      scope.loop(dt => {
        if (ended) return;
        t += dt; next -= dt;
        hud.time(1 - t / TIME);
        if (next <= 0) {
          spawn();
          if (t > 12 && Math.random() < 0.3) spawn();
          next = lerp(0.85, 0.42, t / TIME) * rand(0.8, 1.2);
        }
        if (t >= TIME) { ended = true; scope.timeout(() => resolve(score), 500); }
      });
    });
  },
};
