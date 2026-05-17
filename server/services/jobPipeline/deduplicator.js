import crypto from 'crypto';

function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeDedupHash(title, company) {
  const key = `${normalizeText(title)}|${normalizeText(company)}`;
  return crypto.createHash('md5').update(key).digest('hex');
}
