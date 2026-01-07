/**
 * Push Notification Handler
 *
 * This file handles push notification events in the service worker.
 * It listens for push events and shows notifications to the user.
 */

// Listen for push notifications
self.addEventListener('push', event => {
  console.log('[Push Handler] Push event received:', event)

  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'default',
    requireInteraction: false,
    data: {
      url: '/'
    }
  }

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || data.data?.url || '/',
          ...data.data
        }
      }
    } catch (error) {
      console.error('[Push Handler] Error parsing push data:', error)
      // Use text data if JSON parsing fails
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  // Show notification
  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  })

  event.waitUntil(promiseChain)
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[Push Handler] Notification clicked:', event)

  event.notification.close()

  const notificationData = event.notification.data || {}
  const urlToOpen = notificationData.url || '/'

  // Handle action clicks
  if (event.action === 'open' || !event.action) {
    // Open the app or specific URL
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true
        })
        .then(clientList => {
          // Check if there's already a window open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }

          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  } else if (event.action === 'close') {
    // Just close the notification (already closed above)
    console.log('[Push Handler] Notification closed by user')
  }
})

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('[Push Handler] Notification closed:', event.notification.tag)
})
