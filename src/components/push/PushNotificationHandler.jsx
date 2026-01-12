'use client'

// React Imports
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Config Imports
import { API_URLS } from '@/configs/apiConfig'

// Util Imports
import * as RestApi from '@/utils/restApiUtil'

/**
 * PushNotificationHandler Component
 *
 * This component handles automatic marking of notifications as read when:
 * 1. User opens the app from a push notification (via URL query parameter)
 * 2. User receives a postMessage from service worker when clicking notification
 *
 * It runs on every page load and checks for notificationId in URL or listens for messages.
 */
const PushNotificationHandler = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const processedNotificationIdsRef = useRef(new Set())

  useEffect(() => {
    // Only run if user is authenticated
    if (!session?.user?.id) {
      return
    }

    // Function to mark notification as read
    const markNotificationAsRead = async notificationId => {
      if (!notificationId) {
        return
      }

      // Prevent duplicate processing
      if (processedNotificationIdsRef.current.has(notificationId)) {
        console.log('[Push Notification Handler] Notification already processed:', notificationId)
        return
      }

      try {
        console.log('[Push Notification Handler] Marking notification as read:', notificationId)

        // Mark as processing
        processedNotificationIdsRef.current.add(notificationId)

        const result = await RestApi.put(API_URLS.v0.NOTIFICATIONS, {
          markAsRead: notificationId
        })

        if (result?.status === 'success') {
          console.log('[Push Notification Handler] ✅ Notification marked as read:', notificationId)

          // Remove notificationId from URL to clean it up
          if (typeof window !== 'undefined') {
            const currentUrl = new URL(window.location.href)
            if (currentUrl.searchParams.has('notificationId')) {
              currentUrl.searchParams.delete('notificationId')
              const newUrl = currentUrl.pathname + currentUrl.search + currentUrl.hash

              // Replace URL without reloading (clean URL)
              router.replace(newUrl, { scroll: false })
            }
          }
        } else {
          console.warn('[Push Notification Handler] ⚠️ Failed to mark notification as read:', result?.message)
          // Remove from processed set if failed so it can be retried
          processedNotificationIdsRef.current.delete(notificationId)
        }
      } catch (error) {
        console.error('[Push Notification Handler] ❌ Error marking notification as read:', error)
        // Remove from processed set if error so it can be retried
        processedNotificationIdsRef.current.delete(notificationId)
      }
    }

    // Check for notificationId in URL query parameters (using window.location to avoid Suspense issues)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const notificationIdFromUrl = urlParams.get('notificationId')

      if (notificationIdFromUrl) {
        console.log('[Push Notification Handler] Found notificationId in URL:', notificationIdFromUrl)
        markNotificationAsRead(notificationIdFromUrl)
      }
    }

    // Listen for postMessage from service worker (when user clicks notification on already open tab)
    const handleMessage = event => {
      // Verify message is from same origin
      if (event.origin !== window.location.origin) {
        return
      }

      if (event.data && event.data.type === 'NOTIFICATION_CLICKED' && event.data.notificationId) {
        console.log('[Push Notification Handler] Received notification click message:', event.data.notificationId)
        markNotificationAsRead(event.data.notificationId)
      }
    }

    // Add message listener
    window.addEventListener('message', handleMessage)

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [router, session])

  // This component doesn't render anything
  return null
}

export default PushNotificationHandler
