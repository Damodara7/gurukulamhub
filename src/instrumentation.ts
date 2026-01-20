/**
 * Next.js Instrumentation Hook
 * 
 * This file runs once when the Next.js server starts.
 * Perfect for initialization code that should run only once per server instance.
 * 
 * Note: This requires experimental.instrumentationHook to be enabled in next.config.mjs
 * 
 * IMPORTANT: This file is kept minimal to avoid eval() errors in Edge runtime.
 * The actual SUPER_ADMIN initialization is handled in src/app/[lang]/layout.jsx
 * which only runs in Node.js runtime.
 */

// Explicitly set runtime to Node.js to prevent Edge runtime compilation
export const runtime = 'nodejs'

export async function register() {
  // Minimal implementation - just return to avoid any code that triggers eval() in Edge runtime
  // The actual initialization is handled elsewhere (in layout.jsx) to avoid Edge runtime issues
  return
}