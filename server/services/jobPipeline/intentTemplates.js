export const INTENTS = {
  APM_48H: {
    queries: [
      'associate product manager',
      'associate pm',
      'junior product manager',
      'entry level product manager',
      'graduate product manager',
      'new grad product manager',
      'apm program',
    ],
    freshnessHours: 48,
    mode: 'apm',
    remote: true,
  },
  PM_48H: {
    queries: [
      'product manager',
      'remote product manager',
      'platform product manager',
      'ai product manager',
      'data product manager',
    ],
    freshnessHours: 48,
    mode: 'pm',
    remote: true,
  },
};

// Intent → provider-specific freshness param mappings

export function freshnessToJSearchDatePosted(hours) {
  if (hours <= 24) return 'today';
  if (hours <= 72) return '3days';
  if (hours <= 168) return 'week';
  return 'all';
}

export function freshnessToAdzunaDays(hours) {
  return Math.max(1, Math.ceil(hours / 24));
}

export function cutoffFromHours(hours) {
  return Date.now() - hours * 60 * 60 * 1000;
}
