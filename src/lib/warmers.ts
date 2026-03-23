/**
 * Server-side background warmers.
 *
 * Called exactly once at server startup via instrumentation.ts → register().
 * Never import this file from React components or client-side code.
 *
 * Add any setInterval / setTimeout background jobs here so they are
 * initialised outside of the HMR module graph and never re-run on hot reload.
 */

let started = false;

export function startWarmers(): void {
  if (started) return;
  started = true;

  // No background warmers are active yet.
  // Add jobs here, for example:
  //
  // const INTERVAL_MS = 10 * 60 * 1000; // 10 min
  // setInterval(() => {
  //   fetch('http://localhost:3007/api/some-endpoint').catch(() => {});
  // }, INTERVAL_MS);
}
