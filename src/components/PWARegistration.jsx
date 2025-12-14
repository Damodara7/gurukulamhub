'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function PWARegistration() {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  // Check authentication status
  useEffect(() => {
    const authenticated = status === 'authenticated' && !!session?.user
    setIsAuthenticated(authenticated)

    if (authenticated) {
      console.log('✅ PWA: User is authenticated - PWA features enabled')
    } else {
      console.log('🔒 PWA: User is not authenticated - PWA install restricted')
    }
  }, [session, status])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('🚀 PWA: Service Worker API is available')

      // Check if service worker is already registered (it's auto-registered by PWA plugin)
      // We keep it registered for offline functionality, but control install via manifest
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          if (isAuthenticated) {
            console.log('✅ PWA: Service Worker is registered (User authenticated)')
            registrations.forEach((registration, index) => {
              console.log(`   Service Worker #${index + 1}:`, {
                scope: registration.scope,
                active: registration.active?.scriptURL || 'Not active',
                installing: registration.installing?.scriptURL || 'Not installing',
                waiting: registration.waiting?.scriptURL || 'Not waiting'
              })
            })
          } else {
            console.log('🔒 PWA: Service Worker is registered but install is restricted (User not authenticated)')
          }
        } else {
          console.log('ℹ️ PWA: No service workers registered yet')
        }
      })

      // Listen for service worker updates
      if (isAuthenticated) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 PWA: Service Worker controller changed')
        })
      }

      // Check for manifest (using dynamic API route that checks authentication)
      fetch('/api/manifest')
        .then(res => res.json())
        .then(manifest => {
          if (isAuthenticated) {
            console.log('📱 PWA: Manifest loaded successfully', {
              name: manifest.name,
              short_name: manifest.short_name,
              icons: manifest.icons?.length || 0,
              display: manifest.display
            })
          } else {
            console.log('🔒 PWA: Invalid manifest returned (no install icon)', {
              display: manifest.display,
              icons: manifest.icons?.length || 0
            })
          }
        })
        .catch(err => {
          console.error('❌ PWA: Failed to load manifest', err)
        })

      // Handle install prompt - ONLY for authenticated users
      const handleBeforeInstallPrompt = e => {
        if (isAuthenticated) {
          // User is logged in - allow install prompt
          console.log('💾 PWA: App is installable! (User authenticated)')
          e.preventDefault() // Prevent the default browser prompt
          setDeferredPrompt(e) // Store the event for later use

          // Store in window for potential custom install button
          window.deferredInstallPrompt = e
        } else {
          // User is not logged in - prevent install prompt completely
          console.log('🔒 PWA: Install prompt blocked (User not authenticated)')
          e.preventDefault() // Prevent the install prompt from showing
          // Clear any stored prompt
          setDeferredPrompt(null)
          window.deferredInstallPrompt = null
        }
      }

      // Handle app already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        if (isAuthenticated) {
          console.log('📲 PWA: App is running in standalone mode (installed)')
        }
      }

      // Add event listener for install prompt (Android Chrome/Edge)
      // Note: iOS Safari doesn't support beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // iOS Safari specific: Hide "Add to Home Screen" option for non-authenticated users
      // This is a workaround since iOS doesn't support beforeinstallprompt
      if (!isAuthenticated) {
        // Remove apple-mobile-web-app-capable meta tag for non-authenticated users
        // This makes iOS less likely to show install options
        const appleMetaTag = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
        if (appleMetaTag) {
          appleMetaTag.setAttribute('content', 'no')
          console.log('🔒 PWA: iOS install options restricted (User not authenticated)')
        }
      } else {
        // Restore apple-mobile-web-app-capable for authenticated users
        let appleMetaTag = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
        if (!appleMetaTag) {
          appleMetaTag = document.createElement('meta')
          appleMetaTag.setAttribute('name', 'apple-mobile-web-app-capable')
          document.head.appendChild(appleMetaTag)
        }
        appleMetaTag.setAttribute('content', 'yes')
        console.log('✅ PWA: iOS install options enabled (User authenticated)')
      }

      // Cleanup
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    } else {
      console.warn('⚠️ PWA: Service Workers are not supported in this browser')
    }
  }, [isAuthenticated])

  return null // This component doesn't render anything
}
