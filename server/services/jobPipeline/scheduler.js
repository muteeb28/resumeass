import { runIngestion } from './ingestion.js';

const INTERVAL_MS = 12 * 60 * 60 * 1000; // every 12h — 2 runs/day × 4 calls = 8 calls/day
const INITIAL_DELAY_MS = 10 * 1000;       // 10s after server start

export function startJobScheduler() {
  console.log('[JobScheduler] Starting — first run in 10s, then every 12h');

  setTimeout(async () => {
    await runIngestion().catch((err) =>
      console.error('[JobScheduler] Ingestion error:', err.message)
    );

    setInterval(async () => {
      await runIngestion().catch((err) =>
        console.error('[JobScheduler] Ingestion error:', err.message)
      );
    }, INTERVAL_MS);
  }, INITIAL_DELAY_MS);
}
