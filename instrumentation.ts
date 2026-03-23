/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * register() runs exactly once on server startup — before any route handler
 * is invoked and outside the HMR module graph, so background jobs started
 * here are never re-initialised on hot reload.
 *
 * Only the 'nodejs' runtime branch is reached during normal server operation.
 * The edge runtime branch is a no-op to satisfy the instrumentation contract.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWarmers } = await import('./src/lib/warmers');
    startWarmers();
  }
}
