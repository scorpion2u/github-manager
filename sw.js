const CACHE_NAME = 'links-manager-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 页面导航请求（含分享菜单带来的 ?title=&text=&url= 参数）统一回退到缓存的 index.html，
  // 保证系统分享进来时离线也能打开，且不会因为 query string 而缓存不命中
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});