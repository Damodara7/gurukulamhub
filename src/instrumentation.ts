export const runtime = 'nodejs';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  console.log('🔧 Server instrumentation hook registered');

  try {
    const { initializeSuperAdmin } = require('../scripts/seedSuperAdmin.cjs');
    await initializeSuperAdmin();
    console.log('✅ SUPER_ADMIN initialization completed');
  } catch (err) {
    console.error('⚠️ SUPER_ADMIN init failed (non-critical):', err);
  }
}
