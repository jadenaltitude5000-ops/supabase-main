
// This service worker file is intentionally left mostly blank for now.
// Firebase will automatically add its own logic to this file to handle
// background push notifications.

// You can add your own custom service worker logic here if needed,
// but for basic push notifications, this is often sufficient.

// For example, you could add event listeners for 'push' events
// to customize the notification that's shown.

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.', event.data.json());

  const { title, body, icon, image } = event.data.json().notification;

  const options = {
    body: body,
    icon: icon || '/favicon.ico',
    image: image,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

console.log('Sentrybase Service Worker Loaded');
