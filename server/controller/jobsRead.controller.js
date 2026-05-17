import Job from '../models/Job.model.js';
import { getIngestionMeta, runIngestion } from '../services/jobPipeline/ingestion.js';
import { INDIA_SOURCES } from '../services/jobPipeline/normalizer.js';

const HOUR_MS    = 60 * 60 * 1000;
const DAY_MS     = 24 * HOUR_MS;
const CUTOFF_48H = 48 * HOUR_MS;
const MAX_AGE_MS = 7 * DAY_MS;

// Derived from the imported INDIA_SOURCES set — single source of truth in normalizer.js
const INDIA_SOURCE_LIST = [...INDIA_SOURCES];

const DISABLED_RESPONSE = {
  disabled: true,
  jobs: [],
  total: 0,
  message: 'Job discovery is temporarily disabled while we rebuild this feature.',
};

function msToPostedDate(ms) {
  if (!ms || ms <= 0) return 'Recently';
  const ageMs = Date.now() - ms;
  if (ageMs < 0 || ageMs > MAX_AGE_MS) return 'Recently';
  const mins = Math.floor(ageMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function buildJobView(job) {
  const postedMs = job.postedAt ? new Date(job.postedAt).getTime() : 0;
  return {
    id:         job.sourceId,
    title:      job.title,
    company:    job.company,
    location:   job.location,
    platform:   job.sourceLabel,
    postedDate: msToPostedDate(postedMs),
    postedAtMs: postedMs,
    url:        job.url,
    type:       job.jobType || 'Full-time',
    salary:     job.salary ?? undefined,
    tags:       job.tags ?? [],
    source:     job.source,
    category:   job.category   ?? undefined,
    categories: job.categories ?? [],
  };
}

export async function getJobs(req, res) {
  if (process.env.JOB_DISCOVERY_ENABLED !== 'true') {
    return res.json(DISABLED_RESPONSE);
  }
  try {
    const page   = Math.max(1, parseInt(req.query.page  ?? '1',  10));
    const limit  = Math.max(1, Math.min(50, parseInt(req.query.limit ?? '9', 10)));
    const search = (req.query.searchText ?? '').trim();
    const source = (req.query.source ?? '').trim().toLowerCase();
    const category = (req.query.category ?? '').trim();

    let filter;
    let sortOrder;

    if (source === 'talentd' || source === 'india') {
      // India board: return fresh jobs from all India-mode sources, sorted by recency.
      // source=talentd returns only Talentd; source=india returns all INDIA_SOURCE_LIST.
      const cutoff48h = new Date(Date.now() - CUTOFF_48H);
      filter = {
        isActive: true,
        source:   source === 'india' ? { $in: INDIA_SOURCE_LIST } : 'talentd',
        postedAt: { $gte: cutoff48h },
      };
      if (category) filter.categories = category; // array containment: doc's categories[] includes this value
      sortOrder = { postedAt: -1 };
    } else {
      // Legacy APM/PM/INTERN role-based browsing
      const roleParam = String(req.query.role ?? req.query.mode ?? 'pm').toLowerCase();
      let roleType = 'PM';
      if (roleParam === 'apm')    roleType = 'APM';
      if (roleParam === 'intern') roleType = 'INTERN';
      // Exclude all India-board sources from role-based browsing.
      // India sources have their own query path above with a mandatory freshness filter.
      filter = { isActive: true, roleType, source: { $nin: INDIA_SOURCE_LIST } };
      const locationFilter = (req.query.locationFilter ?? 'Worldwide').trim();
      if (locationFilter && locationFilter !== 'Worldwide') {
        if (locationFilter === 'Remote') {
          filter.remote = true;
        } else {
          filter.location = { $regex: locationFilter, $options: 'i' };
        }
      }
      sortOrder = { postedAt: -1, discoveredAt: -1 };
    }

    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sortOrder).skip((page - 1) * limit).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    const meta = getIngestionMeta();
    return res.json({
      jobs:  jobs.map(buildJobView),
      total,
      source: source || undefined,
      role:  source === 'talentd' ? undefined : (filter.roleType ?? 'pm').toLowerCase(),
      meta:  {
        lastIngested:   meta.lastIngestionAt,
        stats:          meta.stats,
        markedInactive: meta.stats?.markedInactive ?? 0,
      },
    });
  } catch (err) {
    console.error('[JobsReadController] getJobs error:', err);
    return res.status(500).json({ jobs: [], total: 0 });
  }
}

export async function getJobsMeta(req, res) {
  if (process.env.JOB_DISCOVERY_ENABLED !== 'true') {
    return res.json({ disabled: true, total: 0, bySource: [] });
  }
  try {
    const [total, bySource] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Job.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$sourceLabel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    const meta = getIngestionMeta();
    return res.json({ total, bySource, lastIngested: meta.lastIngestionAt, stats: meta.stats });
  } catch (err) {
    console.error('[JobsReadController] getJobsMeta error:', err);
    return res.status(500).json({ total: 0, bySource: [] });
  }
}

export async function triggerIngestion(req, res) {
  if (process.env.JOB_DISCOVERY_ENABLED !== 'true') {
    return res.json({ disabled: true, message: 'Job discovery is disabled.' });
  }
  res.json({ message: 'Ingestion started' });
  runIngestion().catch((err) =>
    console.error('[JobsReadController] Manual ingestion error:', err.message)
  );
}
