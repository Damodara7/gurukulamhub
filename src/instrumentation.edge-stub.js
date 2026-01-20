/**
 * Edge Runtime Stub for Instrumentation Hook
 * 
 * This file is used as a replacement for instrumentation.ts when building for Edge runtime.
 * Edge runtime doesn't support dynamic imports or eval(), so we provide an empty stub.
 */

export const runtime = 'nodejs'

export async function register() {
  // Empty function for Edge runtime - instrumentation only runs in Node.js runtime
  return
}

