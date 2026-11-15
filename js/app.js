import { head, full, tent, ANIMALS, AVATAR_IDS, ITEMS } from './art.js';
import { initAudio, sfx, toggleMute, isMuted, buzz } from './audio.js';
import { makeScope, rand, pick } from './kit.js';
import memory from './games/memory.js';
import race from './games/race.js';
import meerkats from './games/meerkats.js';
import fruits from './games/fruits.js';
import kangaroo from './games/kangaroo.js';
import balloons from './games/balloons.js';
import tower from './games/tower.js';
import snake from './games/snake.js';
import trapeze from './games/trapeze.js';
import flips from './games/flips.js';
import balance from './games/balance.js';
import choir from './games/choir.js';

const GAMES = [memory, race, meerkats, fruits, kangaroo, balloons, tower, snake, trapeze, flips, balance, choir];
const COLORS = ['#e8472b', '#2e86de', '#27ae60', '#f39a1e'];
const $screen = document.getElementById('screen');
const $mute = document.getElementById('mute');

// ---------- estado guardado ----------
const store = Object.assign({ players: ['leon'], best: {}, records: {} }, (() => {
  try { return JSON.parse(localStorage.getItem('nk-state')) || {}; } catch (e) { return {}; }
})());
const save = () => { try { localStorage.setItem('nk-state', JSON.stringify(store)); } catch (e) { /* sin espacio */ } };
const players = () => store.players.map((animal, i) => ({ animal, color: COLORS[i], name: ANIMALS[animal].name, i }));
const totalStars = () => GAMES.reduce((n, g) => n + (store.best[g.id] || 0), 0);

// ---------- navegación ----------
let current = 'home', quitGame = null;
function show(cls, html) {
  $screen.innerHTML = `<div class="screen ${cls}">${html}</div>`;
  document.getElementById('app').dataset.screen = cls.split(' ')[0];
  return $screen.firstElementChild;
}
function go(name, fn) {
  if (current === 'home' && name !== 'home') history.pushState({ nk: 1 }, '');
  current = name; fn();
}
window.addEventListener('popstate', () => {
  if (current === 'home') return;
  if (current === 'players') { current = 'home'; home(); return; }
  history.pushState({ nk: 1 }, '');
  if (current === 'game') quitGame && quitGame();
  else if (current === 'results') { current = 'park'; park(); }
  else if (current === 'park') { current = 'players'; playersScreen(); }
});
const tap = (el, fn) => el.addEventListener('click', e => { initAudio(); fn(e); });

$mute.textContent = isMuted() ? '🔇' : '🔊';
tap($mute, () => { $mute.textContent = toggleMute() ? '🔇' : '🔊'; sfx.click(); });
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('pointerdown', initAudio, { once: true });

let installEvt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); installEvt = e;
  const b = document.getElementById('install'); if (b) b.hidden = false;
});

// ---------- inicio ----------
function home() {
  const el = show('home', `
    <div class="logo-wrap"><div class="logo-glow"></div><img class="logo" src="img/logo.jpg" alt="NATÁNKEN" draggable="false"></div>
    <p class="tagline">¡El parque de juegos de los animales!</p>
    <button class="btn big play" id="play"><span>▶</span> ¡JUGAR!</button>
    <button class="btn small ghost" id="install" ${installEvt ? '' : 'hidden'}>📲 Instalar en el celu</button>
    <div class="peek">
      ${['jirafa', 'leon', 'mono', 'elefante'].map((a, i) => `<button class="peeker p${i}" data-a="${a}">${full(a)}</button>`).join('')}
    </div>`);
  tap(el.querySelector('#play'), () => { sfx.click(); go('players', playersScreen); });
  tap(el.querySelector('#install'), async () => {
    if (!installEvt) return;
    installEvt.prompt(); await installEvt.userChoice; installEvt = null;
    el.querySelector('#install').hidden = true;
  });
  el.querySelectorAll('.peeker').forEach(b => tap(b, () => {
    b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
    b.dataset.a === 'leon' ? sfx.roar() : sfx.boing(); buzz(20);
  }));
}

// ---------- jugadores ----------
function playersScreen() {
  const el = show('players', `
    <h1 class="title">¿Cuántos juegan?</h1>
    <div class="count">${[1, 2, 3, 4].map(n => `<button class="count-btn" data-n="${n}">${n}</button>`).join('')}</div>
    <div class="plist"></div>
    <p class="hint">Tocá las flechas para elegir tu animal</p>
    <div class="row"><button class="btn small ghost" id="back">‹ Volver</button><button class="btn big" id="park">¡Al parque! <span>›</span></button></div>`);
  const list = el.querySelector('.plist');
  const render = () => {
    el.querySelectorAll('.count-btn').forEach(b => b.classList.toggle('on', +b.dataset.n === store.players.length));
    list.className = 'plist n' + store.players.length;
    list.innerHTML = players().map(p => `
      <div class="pcard" style="--c:${p.color}">
        <button class="arrow" data-i="${p.i}" data-d="-1">‹</button>
        <div class="pcard-av">${full(p.animal)}</div>
        <button class="arrow" data-i="${p.i}" data-d="1">›</button>
        <div class="pcard-name">${p.name}</div>
      </div>`).join('');
    list.querySelectorAll('.arrow').forEach(b => tap(b, () => {
      const i = +b.dataset.i, d = +b.dataset.d;
      let k = AVATAR_IDS.indexOf(store.players[i]);
      do { k = (k + d + AVATAR_IDS.length) % AVATAR_IDS.length; } while (store.players.includes(AVATAR_IDS[k]));
      store.players[i] = AVATAR_IDS[k]; save(); sfx.tap(i); render();
      const av = list.children[i].querySelector('.pcard-av');
      av.classList.add('swap');
    }));
  };
  el.querySelectorAll('.count-btn').forEach(b => tap(b, () => {
    const n = +b.dataset.n;
    while (store.players.length > n) store.players.pop();
    while (store.players.length < n) store.players.push(AVATAR_IDS.find(a => !store.players.includes(a)));
    save(); sfx.click(); render();
  }));
  tap(el.querySelector('#back'), () => { sfx.click(); history.back(); });
  tap(el.querySelector('#park'), () => { sfx.click(); go('park', park); });
  render();
}

// ---------- parque ----------
const MAP_H = 250 + (GAMES.length - 1) * 205 + 230;
function park() {
  const pts = GAMES.map((g, i) => ({ x: i % 2 ? 292 : 108, y: 250 + i * 205 }));
  let d = `M200 40 C200 120 ${pts[0].x} 140 ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` C${pts[i - 1].x} ${pts[i - 1].y + 110} ${pts[i].x} ${pts[i].y - 110} ${pts[i].x} ${pts[i].y}`;
  const deco = (html, x, y, w, cls = '') => `<div class="deco ${cls}" style="left:${x / 4}%;top:${y / MAP_H * 100}%;width:${w / 4}%">${html}</div>`;
  const tree = ITEMS.arbol();
  const wheel = `<svg viewBox="0 0 120 130"><path d="M60 60 L38 128 M60 60 L82 128" stroke="#e8718d" stroke-width="5" stroke-linecap="round"/>
    <g class="wheel-spin"><circle cx="60" cy="60" r="50" fill="none" stroke="#fff" stroke-width="4"/><circle cx="60" cy="60" r="30" fill="none" stroke="#fff" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4, x = 60 + Math.cos(a) * 50, y = 60 + Math.sin(a) * 50; return `<path d="M60 60 L${x.toFixed(1)} ${y.toFixed(1)}" stroke="#fff" stroke-width="2.5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="${['#ff5a5f', '#2e9bff', '#ffd93b', '#3ecf6e', '#b06cf0', '#ff8fc7', '#ff9f1c', '#7ad7ff'][i]}" stroke="#3d2817" stroke-width="2.5"/>`; }).join('')}</g>
    <circle cx="60" cy="60" r="8" fill="#ffd93b" stroke="#3d2817" stroke-width="3"/></svg>`;
  const pond = `<svg viewBox="0 0 160 90"><ellipse cx="80" cy="50" rx="76" ry="36" fill="#58a83a"/><ellipse cx="80" cy="48" rx="70" ry="31" fill="#7ad7ff" stroke="#3d2817" stroke-width="3"/><path class="ripple" d="M30 44 q10 -6 20 0 M96 62 q10 -6 20 0 M60 30 q8 -5 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`;
  const flowers = c => `<svg viewBox="0 0 60 30">${[[10, 18], [30, 10], [50, 19]].map(([x, y]) => `<g>${[0, 72, 144, 216, 288].map(r => `<circle cx="${x}" cy="${y - 5}" r="4" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="3" fill="#ffd93b"/></g>`).join('')}</svg>`;
  const balloonsSvg = `<svg viewBox="0 0 60 90"><path d="M18 34 L30 88 M42 30 L30 88 M30 44 L30 88" stroke="#3d2817" stroke-width="1.5" fill="none"/><ellipse cx="18" cy="20" rx="13" ry="16" fill="#ff5a5f" stroke="#3d2817" stroke-width="2.5"/><ellipse cx="42" cy="17" rx="13" ry="16" fill="#2e9bff" stroke="#3d2817" stroke-width="2.5"/><ellipse cx="30" cy="30" rx="13" ry="16" fill="#ffd93b" stroke="#3d2817" stroke-width="2.5"/></svg>`;

  const el = show('park', `
    <header class="park-top">
      <button class="round-btn" id="back">‹</button>
      <div class="park-title">NATÁNKEN</div>
      <div class="stars-pill">⭐ <b>${totalStars()}</b>/${GAMES.length * 3}</div>
    </header>
    <div class="park-scroll"><div class="park-map" style="aspect-ratio:400/${MAP_H}">
      <svg class="road" viewBox="0 0 400 ${MAP_H}" preserveAspectRatio="none">
        <path d="${d}" fill="none" stroke="#c99f55" stroke-width="58" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#f6dfa6" stroke-width="48" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 18" stroke-linecap="round" opacity=".8"/>
      </svg>
      <div class="arch"><span>¡BIENVENIDOS!</span></div>
      ${deco(wheel, 250, 60, 150, 'wheel')}
      ${deco(tree, 6, 60, 80)}${deco(tree, 300, 380, 90)}${deco(tree, 10, 560, 84)}${deco(tree, 320, 800, 80)}${deco(tree, 4, 1010, 90)}${deco(tree, 310, 1200, 86)}${deco(tree, 150, 1380, 80)}
      ${deco(pond, 215, 640, 170)}${deco(head('hipo'), 268, 632, 62, 'bob')}
      ${deco(pond, 20, 1222, 160)}${deco(head('coco'), 66, 1218, 60, 'bob')}
      ${deco(full('jirafa'), 44, 395, 70, 'sway')}${deco(full('panda'), 300, 990, 62, 'sway')}${deco(full('tigre'), 250, 1392, 62, 'sway')}
      ${deco(balloonsSvg, 180, 330, 44, 'float')}${deco(balloonsSvg, 180, 960, 44, 'float')}
      ${deco(flowers('#ff8fc7'), 190, 200, 60)}${deco(flowers('#fff'), 30, 520, 60)}${deco(flowers('#ff5a5f'), 200, 770, 60)}${deco(flowers('#b06cf0'), 150, 1130, 60)}${deco(flowers('#ff8fc7'), 20, 1400, 60)}
      ${deco(tree, 300, 1600, 86)}${deco(tree, 8, 1790, 84)}${deco(tree, 316, 2030, 84)}${deco(tree, 6, 2230, 88)}${deco(tree, 306, 2440, 84)}${deco(tree, 160, 2610, 80)}
      ${deco(wheel, 20, 1560, 130, 'wheel')}${deco(pond, 215, 1870, 170)}${deco(head('coco'), 268, 1862, 62, 'bob')}
      ${deco(full('cebra'), 44, 2030, 66, 'sway')}${deco(full('elefante'), 296, 2230, 66, 'sway')}${deco(full('tucan'), 60, 2440, 60, 'sway')}${deco(full('hipo'), 250, 2620, 64, 'sway')}
      ${deco(balloonsSvg, 180, 1560, 44, 'float')}${deco(balloonsSvg, 180, 2190, 44, 'float')}
      ${deco(flowers('#fff'), 200, 1750, 60)}${deco(flowers('#ff5a5f'), 210, 1990, 60)}${deco(flowers('#b06cf0'), 190, 2380, 60)}${deco(flowers('#ff8fc7'), 30, 2640, 60)}
      ${GAMES.map((g, i) => {
        const s = store.best[g.id] || 0;
        return `<button class="booth" data-g="${i}" style="left:${pts[i].x / 4}%;top:${pts[i].y / MAP_H * 100}%;--d:${i * 90}ms">
          <span class="booth-in">
            <span class="booth-animal">${head(g.animal)}</span>
            <span class="booth-tent">${tent(g.colors[0], g.colors[1])}</span>
            <span class="booth-name" style="--c:${g.colors[0]}">${g.name}</span>
            <span class="booth-stars">${[1, 2, 3].map(n => `<i class="${n <= s ? 'on' : ''}">★</i>`).join('')}</span>
          </span></button>`;
      }).join('')}
    </div></div>`);
  tap(el.querySelector('#back'), () => { sfx.click(); history.back(); });
  el.querySelectorAll('.booth').forEach(b => tap(b, () => { sfx.click(); intro(GAMES[+b.dataset.g]); }));
  if (park.scroll) el.querySelector('.park-scroll').scrollTop = park.scroll;
  el.querySelector('.park-scroll').addEventListener('scroll', e => { park.scroll = e.target.scrollTop; }, { passive: true });
}

function intro(game) {
  const ps = players();
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="card intro">
      <div class="intro-art"><span class="intro-tent">${tent(game.colors[0], game.colors[1])}</span><span class="intro-animal">${head(game.animal)}</span></div>
      <h2>${game.name}</h2>
      <p>${game.how}</p>
      <div class="intro-players">${ps.map(p => `<span class="chip" style="--c:${p.color}">${head(p.animal)}</span>`).join('')}
        <em>${ps.length === 1 ? '1 jugador' : game.mode === 'turns' ? 'Juegan por turnos' : '¡Todos juntos!'}</em></div>
      <div class="row"><button class="btn small ghost" id="no">Volver</button><button class="btn big" id="yes">¡Empezar!</button></div>
    </div>`;
  $screen.firstElementChild.appendChild(m);
  tap(m.querySelector('#no'), () => { sfx.click(); m.remove(); });
  tap(m, e => { if (e.target === m) m.remove(); });
  tap(m.querySelector('#yes'), () => { sfx.click(); current = 'game'; runGame(game); });
}

// ---------- partida ----------
function overlay(el, html, cls) {
  const o = document.createElement('div');
  o.className = 'overlay ' + cls; o.innerHTML = html;
  el.appendChild(o);
  return o;
}
async function countdown(el, scope) {
  const o = overlay(el, '', 'count-ov');
  for (const t of ['3', '2', '1', '¡YA!']) {
    if (scope.dead) return;
    o.innerHTML = `<b class="${t.length > 1 ? 'go' : ''}">${t}</b>`;
    t.length > 1 ? sfx.go() : sfx.beep();
    await scope.wait(t.length > 1 ? 500 : 650);
  }
  o.remove();
}
async function turnBanner(el, p, scope) {
  const o = overlay(el, `<div class="turn" style="--c:${p.color}"><small>Turno de</small><div class="turn-av">${full(p.animal)}</div><strong>${p.name}</strong><em>Tocá para empezar</em></div>`, 'turn-ov');
  sfx.good();
  await new Promise(r => { o.addEventListener('pointerdown', r, { once: true }); scope.add(r); });
  o.remove();
}

async function runGame(game) {
  const ps = players(), multi = ps.length > 1;
  const el = show('game', `
    <div class="hud">
      <button class="round-btn hud-x" aria-label="Salir">✕</button>
      <div class="hud-player"></div>
      <div class="hud-lives" hidden></div>
      <div class="hud-score">⭐ <b>0</b></div>
    </div>
    <div class="timebar" hidden><i></i></div>
    <div class="stage"></div>`);
  const stage = el.querySelector('.stage');
  const $p = el.querySelector('.hud-player'), $s = el.querySelector('.hud-score b'), $l = el.querySelector('.hud-lives'), $t = el.querySelector('.timebar');
  const bump = n => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); };
  const hud = {
    player(p, announce) {
      $p.style.setProperty('--c', p.color);
      $p.innerHTML = `<span class="chip">${head(p.animal)}</span><b>${p.name}</b>`;
      if (announce) { bump($p); sfx.tap(p.i); }
    },
    title(t) { $p.style.setProperty('--c', '#f39a1e'); $p.innerHTML = `<b style="padding-left:.7em">${t}</b>`; },
    score(n) { $s.parentNode.hidden = n === null; if (n !== null && $s.textContent !== String(n)) { $s.textContent = n; bump($s.parentNode); } },
    time(f) { $t.hidden = f === null; if (f !== null) { $t.firstElementChild.style.transform = `scaleX(${Math.max(0, f)})`; $t.classList.toggle('low', f < 0.25); } },
    lives(n) { $l.hidden = n === null; if (n !== null) $l.innerHTML = [1, 2, 3].map(i => `<i class="${i <= n ? '' : 'off'}">❤️</i>`).join(''); },
  };
  let scope = null, quit = false;
  quitGame = () => { if (quit) return; quit = true; scope && scope.end(); current = 'park'; park(); };
  tap(el.querySelector('.hud-x'), () => { sfx.click(); quitGame(); });

  const round = async (p, group) => {
    stage.innerHTML = ''; stage.className = 'stage';
    scope = makeScope();
    const env = { stage, scope, hud, player: p, players: group };
    hud.player(p); hud.score(0); hud.time(null); hud.lives(null);
    if (game.setup) await game.setup(env);
    if (quit) return null;
    if (multi && game.mode === 'turns') await turnBanner(el, p, scope);
    if (quit) return null;
    if (game.countdown) await countdown(el, scope);
    if (quit) return null;
    const res = await game.play(env);
    if (quit) return null;
    scope.end();
    return res;
  };

  let scores;
  if (game.mode === 'together') {
    scores = await round(ps[0], ps);
    if (quit) return;
  } else {
    scores = [];
    for (const p of ps) {
      const s = await round(p, [p]);
      if (quit) return;
      scores.push(s);
      if (multi) {
        const o = overlay(el, `<div class="turn" style="--c:${p.color}"><div class="turn-av">${full(p.animal)}</div><strong>${game.fmt(s, true)}</strong></div>`, 'turn-ov');
        sfx.good(); await new Promise(r => setTimeout(r, 1300)); o.remove();
        if (quit) return;
      }
    }
  }
  results(game, ps, scores);
}

// ---------- resultados ----------
function confetti(el) {
  const cols = ['#ff5a5f', '#2e9bff', '#ffd93b', '#3ecf6e', '#b06cf0', '#ff8fc7', '#ff9f1c'];
  const box = document.createElement('div'); box.className = 'confetti';
  box.innerHTML = Array.from({ length: 70 }, () =>
    `<i style="left:${rand(0, 100)}%;background:${pick(cols)};--x:${rand(-80, 80)}px;--r:${rand(360, 1080)}deg;animation-delay:${rand(0, 1.6)}s;animation-duration:${rand(2.2, 3.8)}s;width:${rand(6, 12)}px;height:${rand(8, 16)}px"></i>`).join('');
  el.appendChild(box);
}

function results(game, ps, scores) {
  const multi = ps.length > 1;
  const rank = ps.map((p, i) => ({ p, s: scores[i] })).sort((a, b) => b.s - a.s);
  const best = rank[0].s, tie = multi && rank[1].s === best;
  const stars = game.stars(best, multi);
  const prev = store.best[game.id] || 0;
  if (stars > prev) store.best[game.id] = stars;
  const isRecord = !multi && best > (store.records[game.id] || 0);
  if (!multi && isRecord) store.records[game.id] = best;
  save();
  const title = !multi ? (stars === 3 ? '¡Espectacular!' : stars === 2 ? '¡Muy bien!' : '¡Buen intento!') : tie ? '¡Empate!' : `¡Ganó ${rank[0].p.name}!`;
  const el = show('results', `
    <h1 class="title">${title}</h1>
    <div class="podium n${rank.length}">
      ${rank.map((r, i) => `<div class="pod ${r.s === best ? 'win' : ''}" style="--c:${r.p.color};--d:${i * 150}ms">
        ${multi && r.s === best ? '<span class="crown">👑</span>' : ''}
        <div class="pod-av">${full(r.p.animal)}</div>
        <b>${r.p.name}</b><span class="pod-score">${game.fmt(r.s, multi)}</span></div>`).join('')}
    </div>
    <div class="big-stars">${[1, 2, 3].map(n => `<i class="${n <= stars ? 'on' : ''}" style="--d:${500 + n * 280}ms">★</i>`).join('')}</div>
    ${isRecord && prev ? '<div class="record">¡Nuevo récord!</div>' : ''}
    <div class="row"><button class="btn small ghost" id="park">Al parque</button><button class="btn big" id="again">↻ Otra vez</button></div>`);
  confetti(el);
  sfx.win();
  for (let n = 1; n <= stars; n++) setTimeout(() => { if (el.isConnected) sfx.star(n - 1); }, 500 + n * 280);
  current = 'results';
  tap(el.querySelector('#park'), () => { sfx.click(); current = 'park'; park(); });
  tap(el.querySelector('#again'), () => { sfx.click(); current = 'game'; runGame(game); });
}

// ---------- offline ----------
if ('serviceWorker' in navigator) {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!local || location.search.includes('sw')) {
    const had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) location.reload(); });
  }
}

home();
