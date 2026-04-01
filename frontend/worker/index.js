// Custom service worker — handles PWA push notifications
// iOS requires showNotification() to always be called inside the push handler.

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Eastern Estate', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Eastern Estate';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icon-192.png',
    // badge and vibrate omitted — not supported on iOS and can cause silent failures
    data: { url: data.url || '/' },
  };

  // iOS mandates that showNotification() is always called — never skip it
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url) && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
