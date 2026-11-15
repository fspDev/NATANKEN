// Service worker de NATÁNKEN: guarda todo el juego para usarlo sin internet.
const VERSION = '__BUILD__';
const CACHE = 'natanken-' + VERSION;
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'fonts/fredoka.woff2',
  'img/logo.jpg', 'img/icon-192.png', 'img/icon-512.png', 'img/icon-maskable-512.png',
  'js/app.js', 'js/art.js', 'js/audio.js', 'js/kit.js',
  'js/games/memory.js', 'js/games/race.js', 'js/games/meerkats.js',
  'js/games/fruits.js', 'js/games/kangaroo.js', 'js/games/balloons.js',
  'js/games/tower.js', 'js/games/snake.js', 'js/games/trapeze.js',
  'js/games/flips.js', 'js/games/balance.js', 'js/games/choir.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('natanken-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
