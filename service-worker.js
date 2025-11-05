/* 05/11/2025 00:12 */

const CACHE_NAME = 'rotina-flavero-cache-v1';
// Caminhos dos ícones na raiz
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'icon-192x192.png',
    'icon-512x512.png'
];

// Evento de Instalação: Salva os arquivos estáticos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de Fetch: Responde com o cache (Cache-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retorna do cache
                if (response) {
                    return response;
                }
                // Se não, busca na rede
                return fetch(event.request);
            })
    );
});

// Evento de Ativação: Limpa caches antigos (se necessário)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});