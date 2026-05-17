export const SOURCE_STATUS = Object.freeze({
  WORKING_WITH_FRESH_DATE: 'WORKING_WITH_FRESH_DATE',
  WORKING_NO_DATE_AVAILABLE: 'WORKING_NO_DATE_AVAILABLE',
  BROKEN_API: 'BROKEN_API',
  BROKEN_HTML_PARSER: 'BROKEN_HTML_PARSER',
  BLOCKED: 'BLOCKED',
  PLACEHOLDER: 'PLACEHOLDER',
  UNSUPPORTED: 'UNSUPPORTED',
});

export const FRESHNESS_STATUS = Object.freeze({
  FRESH: 'FRESH',
  STALE: 'STALE',
  UNKNOWN_DATE: 'UNKNOWN_DATE',
});

export const ROLE_TYPE = Object.freeze({
  PM: 'PM',
  APM: 'APM',
  INTERN: 'INTERN',
});

export const INGESTION_WINDOW_HOURS = 168;

export const PM_KEYWORDS = [
  'product manager',
  'associate product manager',
  'apm',
  'junior product manager',
  'entry level product manager',
  'product owner',
];

export const PM_REJECT_KEYWORDS = [
  'project manager',
  'program manager',
  'marketing manager',
  'sales manager',
  'account manager',
  'engineering manager',
];
