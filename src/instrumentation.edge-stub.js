/**
 * Edge Runtime Stub for Instrumentation Hook
 * 
 * This file is used as a replacement for instrumentation.ts when building for Edge runtime.
 * Edge runtime doesn't support dynamic imports or eval(), so we provide an empty stub.
 * 
 * IMPORTANT: This file uses CommonJS to avoid ES module compilation issues in Edge runtime.
 */

// Use CommonJS exports to avoid webpack eval() in Edge runtime
exports.runtime = 'nodejs'
exports.register = async function() {
  // Empty function - instrumentation doesn't run in Edge runtime
  return
}

