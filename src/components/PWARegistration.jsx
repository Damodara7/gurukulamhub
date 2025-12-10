'use client'

import { useEffect } from 'react'

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('🚀 PWA: Service Worker API is available')
      
      // Check if service worker is already registered
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          console.log('✅ PWA: Service Worker is already registered')
          registrations.forEach((registration, index) => {
            console.log(`   Service Worker #${index + 1}:`, {
              scope: registration.scope,
              active: registration.active?.scriptURL || 'Not active',
              installing: registration.installing?.scriptURL || 'Not installing',
              waiting: registration.waiting?.scriptURL || 'Not waiting'
            })
          })
        } else {
          console.log('ℹ️ PWA: No service workers registered yet')
        }
      })

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 PWA: Service Worker controller changed')
      })

      // Check for manifest
      if ('serviceWorker' in navigator) {
        fetch('/manifest.json')
          .then(res => res.json())
          .then(manifest => {
            console.log('📱 PWA: Manifest loaded successfully', {
              name: manifest.name,
              short_name: manifest.short_name,
              icons: manifest.icons?.length || 0,
              display: manifest.display
            })
          })
          .catch(err => {
            console.error('❌ PWA: Failed to load manifest', err)
          })
      }

      // Check if app is installable
      let deferredPrompt
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 PWA: App is installable!')
        deferredPrompt = e
      })

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('📲 PWA: App is running in standalone mode (installed)')
      }
    } else {
      console.warn('⚠️ PWA: Service Workers are not supported in this browser')
    }
  }, [])

  return null // This component doesn't render anything
}



