import { head, ITEMS, AVATAR_IDS } from '../art.js';
import { sfx, buzz } from '../audio.js';
import { shuffle } from '../kit.js';

export default {
  id: 'memoria', name: 'Memoria Animal', animal: 'elefante', colors: ['#8e5bd9', '#ffd93b'],
  how: 'Da vuelta las cartas y encontrá las parejas de animales.',
  mode: 'together', countdown: false,
  stars: (best, multi) => multi ? 2 : best >= 80 ? 3 : best >= 50 ? 2 : 1,
  fmt: (s, multi) => multi ? `${s} ${s === 1 ? 'pareja' : 'parejas'}` : `${s} pts`,

  play({ stage, scope, hud, players }) {
    return new Promise(resolve => {
      const multi = players.length > 1;
      const pairs = multi ? 10 : 8;
      const deck = shuffle(AVATAR_IDS).slice(0, pairs);
      const cards = shuffle([...deck, ...deck]);
      stage.innerHTML = `<div class="mem-bg"></div><div class="mem-grid" style="--rows:${cards.length / 4}">${cards.map((a, i) =>
        `<button class="mem-card" data-i="${i}" style="--d:${i * 35}ms"><span class="mem-in">
          <span class="mem-face mem-back">${ITEMS.pata()}</span>
          <span class="mem-face mem-front">${head(a)}</span></span></button>`).join('')}</div>`;
      const els = [...stage.querySelectorAll('.mem-card')];
      const scores = players.map(() => 0);
      let turn = 0, first = null, lock = false, found = 0, tries = 0;
      hud.player(players[0]);
      hud.score(0);

      const flip = el => {
        const i = +el.dataset.i;
        if (lock || el.classList.contains('up')) return;
        el.classList.add('up'); sfx.flip();
        if (first === null) { first = i; return; }
        lock = true; tries++;
        const a = first, b = i; first = null;
        if (cards[a] === cards[b]) {
          scope.timeout(() => {
            els[a].classList.add('ok'); els[b].classList.add('ok');
            sfx.good(); buzz(30);
            scores[turn]++; found++;
            hud.score(multi ? scores[turn] : found);
            lock = false;
            if (found === pairs) {
              scope.timeout(() => resolve(multi ? scores : [Math.max(10, 100 - Math.max(0, tries - pairs) * 6)]), 900);
            }
          }, 420);
        } else {
          scope.timeout(() => {
            els[a].classList.add('no'); els[b].classList.add('no');
          }, 420);
          scope.timeout(() => {
            els[a].classList.remove('up', 'no'); els[b].classList.remove('up', 'no');
            if (multi) {
              turn = (turn + 1) % players.length;
              hud.player(players[turn], true);
              hud.score(scores[turn]);
            }
            lock = false;
          }, 1050);
        }
      };
      els.forEach(el => scope.on(el, 'pointerdown', () => flip(el)));
    });
  },
};
