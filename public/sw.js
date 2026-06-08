const CACHE_NAME = 'hermetic-path-v1';
const OFFLINE_URLS = ['/', '/hu/dashboard', '/hu/practice'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = {}; }

  const title = data.title || 'Hermetic Path';
  const options = {
    body: data.body || 'Ideje a napi gyakorlásnak!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'reminder',
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || '/hu/practice' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/hu/practice';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
