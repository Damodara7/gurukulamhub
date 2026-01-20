/**
 * Next.js Instrumentation Hook
 * 
 * This file runs once when the Next.js server starts.
 * Perfect for initialization code that should run only once per server instance.
 * 
 * Note: This requires experimental.instrumentationHook to be enabled in next.config.mjs
 */

export async function register() {
  // This runs once when the server starts
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 Server instrumentation hook registered')
    
    // Initialize SUPER_ADMIN on server startup (runs only once per server instance)
    if (process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
      // Use dynamic import to avoid loading issues during build
      import('@/scripts/seedSuperAdmin')
        .then(({ initializeSuperAdmin }) => {
          // Run initialization asynchronously without blocking server startup
          initializeSuperAdmin()
            .then(() => {
              console.log('✅ SUPER_ADMIN initialization completed on server startup')
            })
            .catch((error) => {
              // Log error but don't crash the server
              console.error('⚠️  SUPER_ADMIN initialization failed on startup (non-critical):', error.message)
            })
        })
        .catch((error) => {
          // Only log if it's not a missing module error
          if (!error.message.includes('Cannot find module')) {
            console.error('⚠️  Could not load SUPER_ADMIN seed script:', error.message)
          }
        })
    } else {
      console.warn('⚠️  SUPER_ADMIN_EMAIL not set - skipping SUPER_ADMIN initialization')
    }
  }
}