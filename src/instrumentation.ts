/**
 * Next.js Instrumentation Hook
 * Runs once per server instance (Node.js only)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  console.log('🔧 Server instrumentation hook registered');

  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    console.warn('⚠️  SUPER_ADMIN_EMAIL not set - skipping initialization');
    return;
  }

  try {
    // IMPORTANT: runtime require (not import)
    const { initializeSuperAdmin } = require('./scripts/seedSuperAdmin');

    await initializeSuperAdmin();
    console.log('✅ SUPER_ADMIN initialization completed on server startup');
  } catch (err: any) {
    console.error(
      '⚠️  SUPER_ADMIN initialization failed (non-critical):',
      err.message
    );
  }
}
