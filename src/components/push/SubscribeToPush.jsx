'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

/**
 * SubscribeToPush Component
 *
 * Auto-subscribes users to push notifications on login.
 * - Checks browser support
 * - Requests notification permission
 * - Subscribes to push notifications automatically
 * - Saves subscription to backend
 * - Syncs existing subscriptions
 *
 * Usage:
 * <SubscribeToPush />
 *
 * Note: This component has no UI - it works silently in the background.
 */
export default function SubscribeToPush() {
  const { data: session, status } = useSession()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState('default')

  // Check browser support and current subscription status
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if browser supports push notifications
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (!supported) {
      console.warn('⚠️ Push notifications are not supported in this browser')
      return
    }

    // Check current permission status
    if ('Notification' in window) {
      const currentPermission = Notification.permission
      setPermission(currentPermission)
      console.log('[SubscribeToPush] Notification permission:', currentPermission)
    }

    // Wait for service worker to be ready, then check subscription
    const checkWhenReady = async () => {
      try {
        // Wait for service worker registration
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.ready
          // Service worker is ready, now check subscription
          checkSubscriptionStatus()
        }
      } catch (error) {
        console.error('[SubscribeToPush] Error waiting for service worker:', error)
      }
    }

    checkWhenReady()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  // Check if user is already subscribed
  const checkSubscriptionStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    try {
      console.log('[SubscribeToPush] Checking subscription status...')
      const registration = await navigator.serviceWorker.ready
      console.log('[SubscribeToPush] Service worker ready')
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        setIsSubscribed(true)
        console.log('✅ User is already subscribed to push notifications')
        // Sync with backend only if user is authenticated
        if (status === 'authenticated' && session?.user) {
          const subscriptionJson = subscription.toJSON()
          try {
            const response = await fetch('/api/notifications/push/subscribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                endpoint: subscriptionJson.endpoint,
                keys: {
                  p256dh: subscriptionJson.keys?.p256dh,
                  auth: subscriptionJson.keys?.auth
                },
                userAgent: navigator.userAgent
              })
            })
            const result = await response.json()
            if (result.status === 'success') {
              console.log('✅ Push subscription synced with backend')
            } else {
              console.error('[SubscribeToPush] Failed to sync subscription:', result.message)
            }
          } catch (error) {
            console.error('[SubscribeToPush] Error syncing subscription:', error)
          }
        }
      } else {
        setIsSubscribed(false)
        console.log('[SubscribeToPush] No existing subscription found')
      }
    } catch (error) {
      console.error('[SubscribeToPush] Error checking subscription status:', error)
    }
  }, [status, session])

  // Convert VAPID public key from base64 URL to Uint8Array
  const urlBase64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    // Check if user is authenticated
    if (status !== 'authenticated' || !session?.user) {
      toast.error('Please log in to enable push notifications')
      return
    }

    // Check browser support
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser')
      return
    }

    setIsLoading(true)

    try {
      // 1. Request notification permission
      if (Notification.permission === 'default') {
        const permissionResult = await Notification.requestPermission()
        setPermission(permissionResult)

        if (permissionResult !== 'granted') {
          toast.error('Notification permission was denied')
          setIsLoading(false)
          return
        }
      } else if (Notification.permission === 'denied') {
        toast.error('Notification permission was previously denied. Please enable it in your browser settings.')
        setIsLoading(false)
        return
      }

      // 2. Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // 3. Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        throw new Error('VAPID public key is not configured')
      }

      // 4. Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // 5. Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      })

      // 6. Convert subscription to JSON
      const subscriptionJson = subscription.toJSON()

      // 7. Send subscription to backend
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth
          },
          userAgent: navigator.userAgent
        })
      })

      const result = await response.json()

      if (result.status === 'success') {
        setIsSubscribed(true)
        toast.success('Push notifications enabled successfully!')
        console.log('✅ Push subscription saved:', result.result)
      } else {
        throw new Error(result.message || 'Failed to save subscription')
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error(error.message || 'Failed to enable push notifications')
    } finally {
      setIsLoading(false)
    }
  }, [session, status, isSupported])

  // Auto-subscribe on mount (if user is authenticated and not already subscribed)
  useEffect(() => {
    console.log('[SubscribeToPush] Auto-subscribe effect triggered:', {
      status,
      isSupported,
      isSubscribed,
      isLoading,
      permission
    })

    // Only proceed if user is authenticated, browser supports it, not already subscribed, and not loading
    if (status === 'authenticated' && isSupported && !isSubscribed && !isLoading) {
      console.log('[SubscribeToPush] Conditions met, attempting to subscribe...')
      
      // First, double-check if already subscribed in browser (to avoid unnecessary subscription)
      const checkAndSubscribe = async () => {
        try {
          console.log('[SubscribeToPush] Waiting for service worker...')
          const registration = await navigator.serviceWorker.ready
          console.log('[SubscribeToPush] Service worker ready, checking existing subscription...')
          const existingSubscription = await registration.pushManager.getSubscription()

          // If already subscribed in browser, just update state and sync with backend
          if (existingSubscription) {
            console.log('[SubscribeToPush] Found existing subscription in browser, syncing with backend...')
            setIsSubscribed(true)
            // Only sync if user is authenticated
            if (status === 'authenticated' && session?.user) {
              const subscriptionJson = existingSubscription.toJSON()
              try {
                const response = await fetch('/api/notifications/push/subscribe', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    endpoint: subscriptionJson.endpoint,
                    keys: {
                      p256dh: subscriptionJson.keys?.p256dh,
                      auth: subscriptionJson.keys?.auth
                    },
                    userAgent: navigator.userAgent
                  })
                })
                const result = await response.json()
                if (result.status === 'success') {
                  console.log('✅ Push subscription synced with backend')
                } else {
                  console.error('[SubscribeToPush] Failed to sync subscription:', result.message)
                }
              } catch (error) {
                console.error('[SubscribeToPush] Error syncing subscription with backend:', error)
              }
            } else {
              console.warn('[SubscribeToPush] User not authenticated, skipping backend sync')
            }
            return // Already subscribed, don't subscribe again
          }

          console.log('[SubscribeToPush] No existing subscription, checking permission...')
          // If not subscribed, proceed with subscription based on permission
          // If permission is already granted, subscribe immediately
          if (permission === 'granted') {
            console.log('[SubscribeToPush] Permission already granted, subscribing...')
            subscribeToPush()
          }
          // If permission is default (not asked yet), request permission and then subscribe
          else if (permission === 'default') {
            console.log('[SubscribeToPush] Permission not asked yet, requesting permission...')
            // Request permission first, then subscribe will happen automatically
            Notification.requestPermission().then(result => {
              console.log('[SubscribeToPush] Permission result:', result)
              setPermission(result)
              if (result === 'granted') {
                console.log('[SubscribeToPush] Permission granted, subscribing...')
                subscribeToPush()
              } else {
                console.warn('[SubscribeToPush] Permission denied or dismissed:', result)
              }
            })
          }
          // If permission is denied, do nothing (user needs to enable in browser settings)
          else if (permission === 'denied') {
            console.warn('[SubscribeToPush] Permission was denied. User needs to enable it in browser settings.')
          }
        } catch (error) {
          console.error('[SubscribeToPush] Error checking subscription status before auto-subscribe:', error)
        }
      }

      checkAndSubscribe()
    } else {
      console.log('[SubscribeToPush] Auto-subscribe skipped:', {
        reason: !status === 'authenticated' ? 'not authenticated' :
                !isSupported ? 'not supported' :
                isSubscribed ? 'already subscribed' :
                isLoading ? 'loading' : 'unknown'
      })
    }
  }, [status, isSupported, isSubscribed, permission, isLoading, subscribeToPush])

  // This component has no UI - it works silently in the background
  return null
}
