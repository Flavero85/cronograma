/* 05/11/2025 22:05 */

const CACHE_NAME = 'rotina-flavero-cache-v1.5'; // (ATUALIZADO) Nova versão do cache
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

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // Deleta caches antigos
                    }
                })
            );
        })
    );
});

// --- (NOVO) Listeners de Notificação ---

// Evento 'push' (para notificações push reais, se um servidor fosse usado)
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Rotina Flavero', body: 'Confira suas tarefas!' };
    
    const options = {
        body: data.body,
        icon: 'icon-192x192.png',
        badge: 'icon-192x192.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Evento 'notificationclick' (o que acontece ao clicar na notificação)
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Fecha a notificação

    // Foca o cliente (app) se ele estiver aberto, ou abre um novo
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Se o app já estiver aberto, foca nele
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            // Se não estiver aberto, abre uma nova janela
            return clients.openWindow('/');
        })
    );
});