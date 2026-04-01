export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

// Handle incoming push messages — shows a native OS notification
sw.addEventListener('push', (event: Event) => {
  const pushEvent = event as PushEvent;
  if (!pushEvent.data) return;

  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = pushEvent.data.json();
  } catch {
    data = { title: 'Eastern Estate', body: pushEvent.data.text() };
  }

  const title = data.title || 'Eastern Estate';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };

  (event as ExtendableEvent).waitUntil(sw.registration.showNotification(title, options));
});

// Clicking the notification opens / focuses the app at the right URL
sw.addEventListener('notificationclick', (event: Event) => {
  const e = event as NotificationEvent;
  e.notification.close();
  const url = e.notification.data?.url || '/';

  e.waitUntil(
    (sw.clients as any).matchAll({ type: 'window', includeUncontrolled: true }).then((clients: any[]) => {
      const existing = clients.find((c: any) => c.url.includes(url) && 'focus' in c);
      if (existing) return existing.focus();
      return (sw.clients as any).openWindow(url);
    }),
  );
});
