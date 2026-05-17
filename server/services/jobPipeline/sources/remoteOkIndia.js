import { guessJobType } from '../classifier.js';

export const name      = 'RemoteOK India';
export const sourceKey = 'remoteok-india';

const REMOTEOK_API = 'https://remoteok.com/api';

export async function fetch() {
  let data;
  try {
    const res = await globalThis.fetch(REMOTEOK_API, {
      headers: {
        'User-Agent': 'ResumeBot/1.0 contact:muteebmasoodi28@gmail.com',
        'Accept':     'application/json',
      },
    });
    if (!res.ok) return [];
    data = await res.json();
  } catch {
    return [];
  }

  const seen = new Set();
  const jobs = [];

  // RemoteOK wraps the response: first element is a legend object, rest are jobs
  for (const item of Array.isArray(data) ? data : []) {
    if (!item?.id || !item?.position) continue;

    const id = `remoteok-india-${item.id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const epochMs = item.epoch ? Number(item.epoch) * 1000 : null;

    jobs.push({
      sourceId:      id,
      title:         item.position,
      company:       item.company ?? '',
      location:      item.location || 'Remote',
      url:           item.url ?? `https://remoteok.com/remote-jobs/${item.id}`,
      tags:          Array.isArray(item.tags) ? item.tags : [],
      jobType:       guessJobType(item.position),
      remote:        true, // all RemoteOK listings are remote by definition
      source:        sourceKey,
      sourceLabel:   name,
      sourcePostedAt: epochMs ? new Date(epochMs) : undefined,
      ...(item.salary_min && item.salary_max
        ? { salary: `$${item.salary_min}–$${item.salary_max}` }
        : {}),
    });
  }

  return jobs;
}
