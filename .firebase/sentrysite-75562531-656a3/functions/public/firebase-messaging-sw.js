
// This service worker will handle background push notifications.
// It's currently a placeholder and will be populated in a future step.

// Scripts for firebase and firebase messaging will be imported here.
self.addEventListener('install', function(event) {
  console.log('Firebase Messaging Service Worker installing...');
});

self.addEventListener('activate', function(event) {
  console.log('Firebase Messaging Service Worker activating...');
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const notificationTitle = 'Sentrybase';
  const notificationOptions = {
    body: 'You have a new notification.',
    icon: '/favicon.ico'
  };

  event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  // Add logic to open a specific URL on notification click
});
