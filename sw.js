const CACHE_NAME="pali-grammar-review-v11-7";
const ASSETS=[
  "./index.html",
  "./style.css",
  "./app.js",
  "./sentence-analysis-data.js",
  "./linguistics-tips-data.js",
  "./learning-routes-data.js",
  "./dictionary-sites-data.js",
  "./token-analysis-data.js",
  "./module-guides-data.js",
  "./confusion-pairs-data.js",
  "./sentence-patterns-data.js",
  "./buddhist-reading-data.js",
  "./buddhist-background-data.js",
  "./academic-training-data.js",
  "./terminology-glossary-data.js",
  "./grammar.json",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./cache-reset.html"
];

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req, {cache:"no-store"}).then(res => {
      const copy=res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(req, copy)).catch(()=>null);
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match("./index.html")))
  );
});
