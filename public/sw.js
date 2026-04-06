self.addEventListener('push', function (event) {
  if (event.data) {
    const data = JSON.parse(event.data.text());
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: data.url || '/'
        }
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// For periodically checking PRs and motivation
// (This would typically be triggered by a backend push, but we can simulate checks if needed)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'motivation-check') {
    event.waitUntil(checkMotivationAndNotify());
  }
});

async function checkMotivationAndNotify() {
  // Logic to fetch from /api/workouts/motivation and show notification
  // This requires the userId from indexedDB or similar since SW is stateless
  console.log('Periodic sync for motivation...');
}
