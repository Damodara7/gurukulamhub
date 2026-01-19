// src/instrumentation.ts
/**
 * Next.js Instrumentation Hook
 * 
 * Runs once per server instance on Node.js runtime.
 * Safe for production (no dynamic import, no eval).
 */

import { initializeSuperAdmin } from '@/scripts/seedSuperAdmin';

export async function register() {
  // Only run in Node.js runtime
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  console.log('🔧 Server instrumentation hook registered');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) {
    console.warn('⚠️  SUPER_ADMIN_EMAIL not set - skipping SUPER_ADMIN initialization');
    return;
  }

  try {
    await initializeSuperAdmin();
    console.log('✅ SUPER_ADMIN initialization completed on server startup');
  } catch (err: any) {
    console.error('⚠️  SUPER_ADMIN initialization failed on startup (non-critical):', err.message);
  }
}
