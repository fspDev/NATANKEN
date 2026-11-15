// Arte vectorial de NATÁNKEN: animales, frutas y decorados dibujados en SVG.
const OL = '#3d2817';
const st = (w = 3) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const eyes = (y = 58, dx = 17, r = 6.5) =>
  `<g class="a-eyes">${[-1, 1].map(s =>
    `<ellipse cx="${60 + s * dx}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#2a1a10"/>` +
    `<circle cx="${60 + s * dx + r * 0.3}" cy="${y - r * 0.4}" r="${r * 0.36}" fill="#fff"/>`).join('')}</g>`;
const blush = (y = 72, dx = 26, r = 6) =>
  [-1, 1].map(s => `<ellipse cx="${60 + s * dx}" cy="${y}" rx="${r}" ry="${r * 0.65}" fill="#ff6b6b" opacity=".4"/>`).join('');
const smile = (y = 80, w = 7) => `<path d="M${60 - w} ${y} Q60 ${y + w} ${60 + w} ${y}" fill="none" ${st(2.5)}/>`;
const catNose = (y = 72, c = '#7a3b1d') =>
  `<path d="M54.5 ${y} h11 l-5.5 6z" fill="${c}" ${st(2)}/>` +
  `<path d="M60 ${y + 6} v3 M60 ${y + 9} q-5 5 -9 0 M60 ${y + 9} q5 5 9 0" fill="none" ${st(2.5)}/>`;
const ear = (x, y, r, c, inner) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${st()}/><circle cx="${x}" cy="${y}" r="${r * 0.52}" fill="${inner}"/>`;

export const ANIMALS = {
  leon: {
    name: 'León', color: '#f9c04a', belly: '#fff3d6',
    head: () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = i * Math.PI / 6;
        return `<circle cx="${(60 + Math.cos(a) * 36).toFixed(1)}" cy="${(62 + Math.sin(a) * 36).toFixed(1)}" r="14" fill="#d9601f" ${st()}/>`;
      }).join('') +
      `<circle cx="60" cy="62" r="38" fill="#d9601f"/>` +
      `<circle cx="60" cy="62" r="34" fill="#e8772a" opacity=".6"/>` +
      ear(33, 35, 10, '#f9c04a', '#e98a5a') + ear(87, 35, 10, '#f9c04a', '#e98a5a') +
      `<circle cx="60" cy="64" r="29" fill="#f9c04a" ${st()}/>` +
      `<ellipse cx="60" cy="78" rx="15" ry="11" fill="#fff3d6"/>` +
      eyes(60, 13, 5.5) + blush(71, 22, 5) + catNose(72),
  },
  jirafa: {
    name: 'Jirafa', color: '#fbd052', belly: '#fde9a8',
    head: () =>
      `<path d="M47 30 L44 12 M73 30 L76 12" fill="none" ${st(5)}/>` +
      `<circle cx="44" cy="11" r="6" fill="#a8621f" ${st()}/><circle cx="76" cy="11" r="6" fill="#a8621f" ${st()}/>` +
      `<ellipse cx="24" cy="40" rx="13" ry="8" transform="rotate(-25 24 40)" fill="#fbd052" ${st()}/>` +
      `<ellipse cx="96" cy="40" rx="13" ry="8" transform="rotate(25 96 40)" fill="#fbd052" ${st()}/>` +
      `<ellipse cx="60" cy="58" rx="28" ry="33" fill="#fbd052" ${st()}/>` +
      `<path d="M40 38 l9 -5 l5 8 l-8 5z M70 34 l9 3 l-2 9 l-8 -3z M36 56 l6 -3 l3 8 l-6 2z M80 54 l6 4 l-4 7 l-5 -4z M56 28 l7 0 l-1 6 l-6 0z" fill="#d9862b"/>` +
      `<ellipse cx="60" cy="86" rx="25" ry="17" fill="#fde9a8" ${st()}/>` +
      `<ellipse cx="51" cy="82" rx="2.5" ry="3.5" fill="${OL}"/><ellipse cx="69" cy="82" rx="2.5" ry="3.5" fill="${OL}"/>` +
      eyes(56, 15, 6) + blush(68, 22, 5) + smile(90, 8),
  },
  elefante: {
    name: 'Elefante', color: '#b3c5da', belly: '#d6e2ee',
    head: () =>
      `<circle cx="22" cy="54" r="21" fill="#9fb4cc" ${st()}/><circle cx="24" cy="54" r="13" fill="#f2a7b5"/>` +
      `<circle cx="98" cy="54" r="21" fill="#9fb4cc" ${st()}/><circle cx="96" cy="54" r="13" fill="#f2a7b5"/>` +
      `<circle cx="60" cy="54" r="32" fill="#b3c5da" ${st()}/>` +
      `<path d="M50 66 Q46 100 60 106 Q76 110 78 96 Q79 90 72 91 Q70 97 66 94 Q64 86 69 66 Z" fill="#b3c5da" ${st()}/>` +
      `<path d="M52 80 q7 3 13 0 M52 90 q6 3 11 0" fill="none" ${st(2)} opacity=".5"/>` +
      eyes(52, 16, 6) + blush(64, 25, 5.5),
  },
  mono: {
    name: 'Mono', color: '#8a5a3a', belly: '#f6d2a8',
    head: () =>
      ear(21, 60, 13, '#8a5a3a', '#f3c9a0') + ear(99, 60, 13, '#8a5a3a', '#f3c9a0') +
      `<path d="M52 26 q4 -14 12 -10 q-4 2 -3 10z" fill="#8a5a3a" ${st()}/>` +
      `<circle cx="60" cy="60" r="35" fill="#8a5a3a" ${st()}/>` +
      `<circle cx="47" cy="54" r="15" fill="#f6d2a8"/><circle cx="73" cy="54" r="15" fill="#f6d2a8"/>` +
      `<ellipse cx="60" cy="76" rx="25" ry="17" fill="#f6d2a8"/>` +
      eyes(55, 13, 6) + blush(72, 23, 5) +
      `<ellipse cx="56.5" cy="69" rx="1.8" ry="2.4" fill="${OL}"/><ellipse cx="63.5" cy="69" rx="1.8" ry="2.4" fill="${OL}"/>` +
      `<path d="M46 78 Q60 92 74 78" fill="none" ${st(2.5)}/>`,
  },
  cebra: {
    name: 'Cebra', color: '#ffffff', belly: '#e9e9ee',
    head: () =>
      `<ellipse cx="36" cy="24" rx="9" ry="15" transform="rotate(-18 36 24)" fill="#fff" ${st()}/><ellipse cx="36" cy="25" rx="4" ry="9" transform="rotate(-18 36 25)" fill="#f2a7b5"/>` +
      `<ellipse cx="84" cy="24" rx="9" ry="15" transform="rotate(18 84 24)" fill="#fff" ${st()}/><ellipse cx="84" cy="25" rx="4" ry="9" transform="rotate(18 84 25)" fill="#f2a7b5"/>` +
      `<path d="M50 26 q2 -16 10 -17 q8 1 10 17z" fill="#2b2b33" ${st()}/>` +
      `<ellipse cx="60" cy="58" rx="27" ry="33" fill="#fff" ${st()}/>` +
      `<path d="M60 27 v14 M50 29 l3 11 M70 29 l-3 11 M34 52 l11 3 M35 64 l10 0 M86 52 l-11 3 M85 64 l-10 0" fill="none" stroke="#2b2b33" stroke-width="4.5" stroke-linecap="round"/>` +
      `<ellipse cx="60" cy="88" rx="22" ry="15" fill="#5b5b66" ${st()}/>` +
      `<ellipse cx="52" cy="85" rx="2.5" ry="3.5" fill="#1d1d22"/><ellipse cx="68" cy="85" rx="2.5" ry="3.5" fill="#1d1d22"/>` +
      `<path d="M53 94 Q60 99 67 94" fill="none" stroke="#1d1d22" stroke-width="2.5" stroke-linecap="round"/>` +
      eyes(58, 13, 6) + blush(70, 20, 4.5),
  },
  hipo: {
    name: 'Hipopótamo', color: '#b79bd4', belly: '#d9c7ee',
    head: () =>
      ear(35, 28, 9, '#b79bd4', '#f2a7b5') + ear(85, 28, 9, '#b79bd4', '#f2a7b5') +
      `<ellipse cx="60" cy="52" rx="33" ry="30" fill="#b79bd4" ${st()}/>` +
      `<rect x="45" y="96" width="9" height="11" rx="3" fill="#fff" ${st(2.5)}/><rect x="66" y="96" width="9" height="11" rx="3" fill="#fff" ${st(2.5)}/>` +
      `<ellipse cx="60" cy="82" rx="38" ry="21" fill="#cdb6e6" ${st()}/>` +
      `<ellipse cx="46" cy="74" rx="4" ry="5.5" fill="#8d6fb0"/><ellipse cx="74" cy="74" rx="4" ry="5.5" fill="#8d6fb0"/>` +
      `<path d="M44 90 Q60 100 76 90" fill="none" ${st(2.5)}/>` +
      eyes(46, 15, 6) + blush(60, 27, 5),
  },
  coco: {
    name: 'Cocodrilo', color: '#6bb23a', belly: '#d8ef9f',
    head: () =>
      `<circle cx="40" cy="38" r="15" fill="#6bb23a" ${st()}/><circle cx="80" cy="38" r="15" fill="#6bb23a" ${st()}/>` +
      `<ellipse cx="60" cy="62" rx="36" ry="27" fill="#6bb23a" ${st()}/>` +
      `<circle cx="40" cy="38" r="9.5" fill="#fff" ${st(2)}/><circle cx="80" cy="38" r="9.5" fill="#fff" ${st(2)}/>` +
      `<g class="a-eyes"><circle cx="41" cy="39" r="5" fill="#2a1a10"/><circle cx="79" cy="39" r="5" fill="#2a1a10"/><circle cx="43" cy="37" r="1.8" fill="#fff"/><circle cx="81" cy="37" r="1.8" fill="#fff"/></g>` +
      `<ellipse cx="60" cy="84" rx="41" ry="20" fill="#86c94f" ${st()}/>` +
      `<ellipse cx="50" cy="74" rx="2.5" ry="3.5" fill="#3f7a1e"/><ellipse cx="70" cy="74" rx="2.5" ry="3.5" fill="#3f7a1e"/>` +
      `<path d="M22 86 Q60 100 98 86" fill="none" ${st(2.5)}/>` +
      `<path d="M30 89.5 l4 7 l4 -5.5z M46 93.5 l4 7 l4 -6.5z M66 94.5 l4 6.5 l4 -7.5z M82 91 l4 5.5 l4 -7z" fill="#fff" ${st(1.8)}/>` +
      `<circle cx="32" cy="62" r="3" fill="#4f9426"/><circle cx="88" cy="62" r="3" fill="#4f9426"/><circle cx="60" cy="52" r="3" fill="#4f9426"/>`,
  },
  tucan: {
    name: 'Tucán', color: '#2b2b33', belly: '#ffffff',
    head: () =>
      `<path d="M52 24 q2 -14 10 -12 q-1 5 2 6 q5 -5 9 0 q-6 3 -7 10z" fill="#2b2b33" ${st()}/>` +
      `<circle cx="60" cy="58" r="35" fill="#2b2b33" ${st()}/>` +
      `<path d="M30 62 Q32 96 60 93 Q88 96 90 62 Q76 50 60 54 Q44 50 30 62Z" fill="#fff"/>` +
      `<path d="M43 62 Q60 50 77 62 Q80 98 60 110 Q40 98 43 62Z" fill="#ff9f1c" ${st()}/>` +
      `<path d="M49 96 Q60 110 71 96 Q60 101 49 96Z" fill="#e8472b"/>` +
      `<path d="M45 78 Q60 86 75 78" fill="none" ${st(2.5)}/>` +
      `<ellipse cx="54" cy="66" rx="2" ry="1.4" fill="${OL}"/><ellipse cx="66" cy="66" rx="2" ry="1.4" fill="${OL}"/>` +
      `<circle cx="42" cy="46" r="9" fill="#6ec6ff" ${st(2)}/><circle cx="78" cy="46" r="9" fill="#6ec6ff" ${st(2)}/>` +
      `<g class="a-eyes"><circle cx="42" cy="46" r="5" fill="#2a1a10"/><circle cx="78" cy="46" r="5" fill="#2a1a10"/><circle cx="44" cy="44" r="1.8" fill="#fff"/><circle cx="80" cy="44" r="1.8" fill="#fff"/></g>`,
  },
  panda: {
    name: 'Panda', color: '#ffffff', belly: '#e9e9ee',
    head: () =>
      `<circle cx="30" cy="31" r="13" fill="#2b2b33" ${st()}/><circle cx="90" cy="31" r="13" fill="#2b2b33" ${st()}/>` +
      `<circle cx="60" cy="62" r="35" fill="#fff" ${st()}/>` +
      `<ellipse cx="44" cy="58" rx="10" ry="13" transform="rotate(18 44 58)" fill="#2b2b33"/><ellipse cx="76" cy="58" rx="10" ry="13" transform="rotate(-18 76 58)" fill="#2b2b33"/>` +
      `<g class="a-eyes"><circle cx="45" cy="57" r="5" fill="#fff"/><circle cx="75" cy="57" r="5" fill="#fff"/><circle cx="46" cy="57" r="2.8" fill="#1d1d22"/><circle cx="74" cy="57" r="2.8" fill="#1d1d22"/></g>` +
      blush(74, 25, 5) +
      `<ellipse cx="60" cy="73" rx="5.5" ry="4" fill="#2b2b33"/>` +
      `<path d="M60 77 v3 M60 80 q-5 5 -9 0 M60 80 q5 5 9 0" fill="none" ${st(2.5)}/>`,
  },
  tigre: {
    name: 'Tigre', color: '#ff9a2e', belly: '#fff3d6',
    head: () =>
      ear(31, 32, 12, '#ff9a2e', '#fff3d6') + ear(89, 32, 12, '#ff9a2e', '#fff3d6') +
      `<circle cx="60" cy="62" r="35" fill="#ff9a2e" ${st()}/>` +
      `<path d="M60 28 l-4 12 h8z M46 31 l1 11 l6 -3z M74 31 l-1 11 l-6 -3z M26 56 l11 2 l-10 5z M94 56 l-11 2 l10 5z M28 72 l10 -1 l-8 6z M92 72 l-10 -1 l8 6z" fill="#3d2817"/>` +
      `<ellipse cx="48" cy="78" rx="13" ry="10" fill="#fff3d6"/><ellipse cx="72" cy="78" rx="13" ry="10" fill="#fff3d6"/>` +
      eyes(58, 14, 6) + catNose(71, '#f2788f'),
  },
  suricata: {
    name: 'Suricata', color: '#e2b77a', belly: '#f5deb5',
    head: () =>
      `<circle cx="31" cy="42" r="8" fill="#6b4a2e" ${st()}/><circle cx="89" cy="42" r="8" fill="#6b4a2e" ${st()}/>` +
      `<ellipse cx="60" cy="60" rx="29" ry="32" fill="#e2b77a" ${st()}/>` +
      `<ellipse cx="46" cy="56" rx="9" ry="11" fill="#6b4a2e"/><ellipse cx="74" cy="56" rx="9" ry="11" fill="#6b4a2e"/>` +
      `<g class="a-eyes"><circle cx="46" cy="56" r="5.5" fill="#1d120a"/><circle cx="74" cy="56" r="5.5" fill="#1d120a"/><circle cx="48" cy="54" r="2" fill="#fff"/><circle cx="76" cy="54" r="2" fill="#fff"/></g>` +
      `<ellipse cx="60" cy="77" rx="13" ry="10" fill="#f5deb5" ${st(2.5)}/>` +
      `<ellipse cx="60" cy="72" rx="4.5" ry="3.2" fill="#2a1a10"/>` + smile(79, 5) + blush(72, 24, 4.5),
  },
  canguro: {
    name: 'Canguro', color: '#d79a62', belly: '#f3d3ad',
    head: () =>
      `<ellipse cx="40" cy="24" rx="9" ry="20" transform="rotate(-16 40 24)" fill="#d79a62" ${st()}/><ellipse cx="40" cy="26" rx="4" ry="13" transform="rotate(-16 40 26)" fill="#f2a7b5"/>` +
      `<ellipse cx="80" cy="24" rx="9" ry="20" transform="rotate(16 80 24)" fill="#d79a62" ${st()}/><ellipse cx="80" cy="26" rx="4" ry="13" transform="rotate(16 80 26)" fill="#f2a7b5"/>` +
      `<ellipse cx="60" cy="64" rx="27" ry="31" fill="#d79a62" ${st()}/>` +
      `<ellipse cx="60" cy="83" rx="17" ry="12" fill="#f3d3ad" ${st(2.5)}/>` +
      `<ellipse cx="60" cy="77" rx="5" ry="3.5" fill="#2a1a10"/>` + smile(85, 6) +
      eyes(60, 14, 6) + blush(72, 23, 4.5),
  },
};

ANIMALS.vibora = {
  name: 'Víbora', color: '#4fbf5a', belly: '#b9ec8f',
  head: () =>
    `<path d="M60 92 v14 l-7 9 M60 106 l7 9" fill="none" stroke="#e8472b" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<ellipse cx="60" cy="60" rx="37" ry="34" fill="#4fbf5a" ${st()}/>` +
    `<ellipse cx="60" cy="78" rx="25" ry="13" fill="#b9ec8f"/>` +
    `<circle cx="38" cy="38" r="5" fill="#379a44"/><circle cx="82" cy="38" r="5" fill="#379a44"/><circle cx="60" cy="31" r="4" fill="#ffd93b"/>` +
    `<ellipse cx="55" cy="70" rx="1.6" ry="2.2" fill="#2a1a10"/><ellipse cx="65" cy="70" rx="1.6" ry="2.2" fill="#2a1a10"/>` +
    eyes(54, 15, 7) + blush(70, 26, 5) + smile(80, 8),
};

export const ANIMAL_IDS = Object.keys(ANIMALS);
export const AVATAR_IDS = ['leon', 'jirafa', 'elefante', 'mono', 'cebra', 'hipo', 'coco', 'tucan', 'panda', 'tigre'];

const svg = (vb, inner, cls = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${cls ? ` class="${cls}"` : ''}>${inner}</svg>`;

/** Cabeza del animal (SVG en línea, con ojos que pestañean por CSS). */
export const head = id => svg('0 0 120 120', ANIMALS[id].head(), 'animal');

/** Animal de cuerpo entero. */
export function full(id) {
  const a = ANIMALS[id];
  const body =
    `<ellipse cx="45" cy="161" rx="13" ry="7" fill="${a.color}" ${st()}/><ellipse cx="75" cy="161" rx="13" ry="7" fill="${a.color}" ${st()}/>` +
    `<ellipse cx="31" cy="128" rx="8" ry="14" transform="rotate(22 31 128)" fill="${a.color}" ${st()}/>` +
    `<ellipse cx="89" cy="128" rx="8" ry="14" transform="rotate(-22 89 128)" fill="${a.color}" ${st()}/>` +
    `<ellipse cx="60" cy="132" rx="27" ry="30" fill="${a.color}" ${st()}/>` +
    `<ellipse cx="60" cy="138" rx="16" ry="19" fill="${a.belly}"/>`;
  return svg('0 0 120 170', `<g class="a-body">${body}</g><g class="a-head">${a.head()}</g>`, 'animal full');
}

/** Canguro de perfil para el juego de saltos. */
export function kangarooSide() {
  const c = '#d79a62', b = '#f3d3ad';
  return svg('0 0 140 140',
    `<path d="M44 92 Q12 96 5 126 Q26 122 52 108Z" fill="${c}" ${st()}/>` +
    `<ellipse cx="70" cy="18" rx="6" ry="16" transform="rotate(-22 70 18)" fill="#b97c47" ${st()}/>` +
    `<ellipse cx="60" cy="82" rx="25" ry="33" transform="rotate(14 60 82)" fill="${c}" ${st()}/>` +
    `<ellipse cx="68" cy="88" rx="13" ry="20" transform="rotate(14 68 88)" fill="${b}"/>` +
    `<path d="M58 92 Q70 104 82 90" fill="none" ${st(2.5)}/>` +
    `<circle cx="70" cy="88" r="8" fill="${c}" ${st(2.5)}/><ellipse cx="65" cy="80" rx="2.5" ry="5" transform="rotate(-15 65 80)" fill="${c}" ${st(2)}/><ellipse cx="75" cy="80" rx="2.5" ry="5" transform="rotate(15 75 80)" fill="${c}" ${st(2)}/>` +
    `<circle cx="67.5" cy="87" r="1.4" fill="#2a1a10"/><circle cx="72.5" cy="87" r="1.4" fill="#2a1a10"/>` +
    `<ellipse cx="52" cy="108" rx="17" ry="13" fill="${c}" ${st()}/>` +
    `<rect x="46" y="120" width="44" height="11" rx="5.5" fill="${c}" ${st()}/>` +
    `<path d="M78 70 Q92 72 96 82" fill="none" ${st(7)}/><path d="M78 70 Q92 72 96 82" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>` +
    `<ellipse cx="86" cy="44" rx="17" ry="15" fill="${c}" ${st()}/>` +
    `<ellipse cx="101" cy="50" rx="11" ry="9" fill="${b}" ${st(2.5)}/>` +
    `<ellipse cx="80" cy="20" rx="6.5" ry="17" transform="rotate(-8 80 20)" fill="${c}" ${st()}/><ellipse cx="80" cy="22" rx="3" ry="11" transform="rotate(-8 80 22)" fill="#f2a7b5"/>` +
    `<ellipse cx="90" cy="41" rx="4" ry="4.8" fill="#2a1a10"/><circle cx="91.3" cy="39.3" r="1.5" fill="#fff"/>` +
    `<ellipse cx="109" cy="46" rx="3.5" ry="2.8" fill="#2a1a10"/>` +
    `<path d="M98 54 q5 4 9 0" fill="none" ${st(2.2)}/>` +
    `<ellipse cx="82" cy="51" rx="4.5" ry="3" fill="#ff6b6b" opacity=".4"/>`);
}

const leaf = (x, y, r = -30) => `<path d="M${x} ${y} q8 -12 18 -6 q-6 10 -18 6z" transform="rotate(${r} ${x} ${y})" fill="#4c9a2a" ${st(2)}/>`;
const shine = (x, y, rx = 5, ry = 8, r = -30) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="#fff" opacity=".45"/>`;

export const ITEMS = {
  manzana: () => svg('0 0 64 64',
    `<path d="M32 20 Q14 10 9 28 Q6 48 24 57 Q32 60 40 57 Q58 48 55 28 Q50 10 32 20Z" fill="#e8472b" ${st()}/>` +
    `<path d="M32 20 q0 -8 5 -12" fill="none" ${st()}/>` + leaf(36, 12, -10) + shine(20, 30)),
  naranja: () => svg('0 0 64 64',
    `<circle cx="32" cy="35" r="24" fill="#ff9f1c" ${st()}/>` + leaf(32, 12, -15) + shine(21, 27) +
    `<circle cx="38" cy="44" r="1.3" fill="#d67a00"/><circle cx="44" cy="36" r="1.3" fill="#d67a00"/><circle cx="30" cy="50" r="1.3" fill="#d67a00"/>`),
  banana: () => svg('0 0 64 64',
    `<path d="M10 20 Q12 52 46 54 Q56 54 58 46 Q36 46 22 16 Q14 12 10 20Z" fill="#ffd93b" ${st()}/>` +
    `<path d="M12 18 l-3 -7 l7 -2 l3 7z" fill="#8a5a3a" ${st(2)}/>` +
    `<path d="M18 26 Q26 44 46 49" fill="none" stroke="#f0b400" stroke-width="2.5" stroke-linecap="round"/>`),
  sandia: () => svg('0 0 64 64',
    `<path d="M4 26 A28 28 0 0 0 60 26Z" fill="#4c9a2a" ${st()}/>` +
    `<path d="M10 26 A22 22 0 0 0 54 26Z" fill="#ff5a5f"/>` +
    `<path d="M10 26 A22 22 0 0 0 54 26" fill="none" stroke="#d8ef9f" stroke-width="3"/>` +
    `<g fill="#2a1a10"><ellipse cx="22" cy="32" rx="1.8" ry="3"/><ellipse cx="32" cy="38" rx="1.8" ry="3"/><ellipse cx="42" cy="32" rx="1.8" ry="3"/><ellipse cx="32" cy="29" rx="1.5" ry="2.4"/></g>`),
  frutilla: () => svg('0 0 64 64',
    `<path d="M32 60 Q8 40 12 22 Q20 12 32 16 Q44 12 52 22 Q56 40 32 60Z" fill="#ff3b4e" ${st()}/>` +
    `<path d="M18 18 l8 -8 l6 6 l6 -6 l8 8 l-8 4 l-6 -3 l-6 3z" fill="#4c9a2a" ${st(2)}/>` +
    `<g fill="#ffe08a"><ellipse cx="24" cy="30" rx="1.5" ry="2.3"/><ellipse cx="34" cy="28" rx="1.5" ry="2.3"/><ellipse cx="43" cy="33" rx="1.5" ry="2.3"/><ellipse cx="28" cy="40" rx="1.5" ry="2.3"/><ellipse cx="38" cy="42" rx="1.5" ry="2.3"/><ellipse cx="32" cy="50" rx="1.5" ry="2.3"/></g>` + shine(19, 28, 3, 6)),
  uvas: () => svg('0 0 64 64',
    `<path d="M32 16 v-9" fill="none" ${st()}/>` + leaf(33, 10, -5) +
    [[22, 22], [32, 20], [42, 22], [27, 32], [37, 32], [32, 42], [22, 40], [42, 40], [32, 53]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="8" fill="#9b5de5" ${st(2.5)}/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2" fill="#fff" opacity=".5"/>`).join('')),
  estrella: () => svg('0 0 64 64',
    `<path d="M32 5 l8 17 l19 2.5 l-14 13 l3.5 18.5 l-16.5 -9 l-16.5 9 l3.5 -18.5 l-14 -13 l19 -2.5z" fill="#ffd93b" ${st()}/>` +
    `<circle cx="26" cy="29" r="2.6" fill="#2a1a10"/><circle cx="38" cy="29" r="2.6" fill="#2a1a10"/><path d="M27 36 q5 5 10 0" fill="none" ${st(2.2)}/>` + shine(22, 20, 2.5, 5)),
  piedra: () => svg('0 0 64 64',
    `<path d="M8 46 Q4 28 18 20 Q30 8 44 16 Q60 22 58 42 Q56 56 32 56 Q12 58 8 46Z" fill="#9aa3ad" ${st()}/>` +
    `<path d="M20 28 l8 -6 M38 24 l8 4" fill="none" stroke="#6f7882" stroke-width="2.5" stroke-linecap="round"/>` +
    `<path d="M22 34 l8 4 M42 34 l-8 4" fill="none" ${st(2.5)}/><circle cx="26" cy="40" r="2.5" fill="#2a1a10"/><circle cx="38" cy="40" r="2.5" fill="#2a1a10"/><path d="M27 49 q5 -4 10 0" fill="none" ${st(2.2)}/>`),
  tronco: () => svg('0 0 90 64',
    `<rect x="6" y="18" width="76" height="40" rx="18" fill="#a8693a" ${st()}/>` +
    `<ellipse cx="70" cy="38" rx="12" ry="20" fill="#e2b77a" ${st()}/><ellipse cx="70" cy="38" rx="6" ry="11" fill="none" stroke="#a8693a" stroke-width="2"/>` +
    `<path d="M18 30 h28 M22 44 h22" fill="none" stroke="#7d4a25" stroke-width="2.5" stroke-linecap="round"/>` + leaf(26, 20, -20)),
  cactus: () => svg('0 0 64 90',
    `<path d="M12 50 v-14 a6 6 0 0 1 12 0 v8 M52 44 v-14 a6 6 0 0 0 -12 0 v14" fill="none" ${st(13)}/>` +
    `<path d="M12 50 v-14 a6 6 0 0 1 12 0 v8 M52 44 v-14 a6 6 0 0 0 -12 0 v14" fill="none" stroke="#5fb04a" stroke-width="8" stroke-linecap="round"/>` +
    `<rect x="21" y="8" width="22" height="78" rx="11" fill="#5fb04a" ${st()}/>` +
    `<path d="M28 20 v56 M36 20 v56" fill="none" stroke="#3f8a2f" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="32" cy="9" r="5" fill="#ff6b9d" ${st(2)}/>`),
  arbol: () => svg('0 0 100 130',
    `<rect x="42" y="78" width="16" height="48" rx="6" fill="#8a5a3a" ${st()}/>` +
    `<circle cx="30" cy="62" r="24" fill="#3f8a2f" ${st()}/><circle cx="70" cy="62" r="24" fill="#3f8a2f" ${st()}/><circle cx="50" cy="36" r="28" fill="#4c9a2a" ${st()}/>` +
    `<circle cx="50" cy="62" r="22" fill="#4c9a2a"/><circle cx="40" cy="30" r="7" fill="#6bb23a" opacity=".7"/><circle cx="66" cy="56" r="6" fill="#6bb23a" opacity=".7"/>`),
  pata: () => svg('0 0 64 64',
    `<g fill="#fff" opacity=".9"><ellipse cx="32" cy="42" rx="14" ry="11"/><circle cx="14" cy="28" r="6"/><circle cx="26" cy="18" r="6.5"/><circle cx="40" cy="18" r="6.5"/><circle cx="51" cy="28" r="6"/></g>`),
};

export const FRUITS = ['manzana', 'naranja', 'banana', 'sandia', 'frutilla', 'uvas'];

/** Carpa de feria para las atracciones del parque. */
export function tent(c1, c2) {
  const stripes = [0, 1, 2, 3, 4, 5].map(i => {
    const x0 = 10 + i * 16.67, x1 = x0 + 16.67;
    return `<path d="M60 14 L${x0.toFixed(1)} 58 L${x1.toFixed(1)} 58Z" fill="${i % 2 ? c2 : c1}"/>`;
  }).join('');
  const scallop = [0, 1, 2, 3, 4, 5].map(i =>
    `<path d="M${(10 + i * 16.67).toFixed(1)} 58 a8.33 8 0 0 0 16.67 0z" fill="${i % 2 ? c1 : c2}" ${st(2.5)}/>`).join('');
  return svg('0 0 120 120',
    `<rect x="16" y="56" width="88" height="56" rx="6" fill="#fff7e0" ${st()}/>` +
    `<path d="M44 112 v-30 a16 16 0 0 1 32 0 v30z" fill="#5b3a1e" ${st()}/>` +
    stripes + `<path d="M60 14 L10 58 H110Z" fill="none" ${st()}/>` + scallop +
    `<path d="M60 14 v-11" fill="none" ${st()}/><path class="flag" d="M60 3 l16 5 l-16 5z" fill="${c1}" ${st(2)}/>`);
}

/** Convierte un SVG en imagen para dibujar en canvas. */
export function sprite(svgText, w = 256, h = w) {
  const sized = svgText.replace('<svg ', `<svg width="${w}" height="${h}" `);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
  return img;
}
export const ready = imgs => Promise.all(Object.values(imgs).map(i => i.decode ? i.decode().catch(() => {}) : null));
