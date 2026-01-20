/**
 * Next.js Instrumentation Hook
 * 
 * This file runs once when the Next.js server starts.
 * Perfect for initialization code that should run only once per server instance.
 * 
 * Note: This requires experimental.instrumentationHook to be enabled in next.config.mjs
 */

// Explicitly set runtime to Node.js to prevent Edge runtime compilation
export const runtime = 'nodejs'

// Lazy load the seed script only when needed (avoids eval() in Edge runtime)
let seedSuperAdminModule: Promise<{ initializeSuperAdmin: () => Promise<void> }> | null = null

function getSeedSuperAdminModule(): Promise<{ initializeSuperAdmin: () => Promise<void> }> {
  if (!seedSuperAdminModule) {
    // This will only execute in Node.js runtime due to runtime='nodejs' export
    seedSuperAdminModule = import('@/scripts/seedSuperAdmin')
  }
  return seedSuperAdminModule
}

export async function register() {
  // Early return if not in Node.js runtime (should never happen with runtime='nodejs', but defensive)
  if (typeof process === 'undefined' || process.env.NEXT_RUNTIME !== 'nodejs') {
    return
  }
  
  console.log('🔧 Server instrumentation hook registered')
  
  // Initialize SUPER_ADMIN on server startup (runs only once per server instance)
  if (process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    // Use lazy-loaded import to avoid eval() issues in Edge runtime
    // The webpack config excludes this file from Edge compilation, so this should only run in Node.js
    getSeedSuperAdminModule()
      .then((module: { initializeSuperAdmin: () => Promise<void> }) => {
        const { initializeSuperAdmin } = module
        // Run initialization asynchronously without blocking server startup
        return initializeSuperAdmin()
      })
      .then(() => {
        console.log('✅ SUPER_ADMIN initialization completed on server startup')
      })
      .catch((error: Error) => {
        // Only log if it's not a missing module error
        if (!error.message?.includes('Cannot find module') && !error.message?.includes('Cannot resolve')) {
          console.error('⚠️  SUPER_ADMIN initialization failed on startup (non-critical):', error.message)
        }
      })
  } else {
    console.warn('⚠️  SUPER_ADMIN_EMAIL not set - skipping SUPER_ADMIN initialization')
  }
}