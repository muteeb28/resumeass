const SOURCE_TRUST = {
  // Tier 1 APIs
  remotive:          0.90,
  remoteok:          0.85,
  himalayas:         0.85,
  workingnomads:     0.80,
  jobicy:            0.75,
  // Tier 2 RSS
  weworkremotely:    0.85,
  nodesk:            0.70,
  jobspresso:        0.70,
  authenticjobs:     0.70,
  dynamitejobs:      0.65,
  skipthedrive:      0.65,
  // Tier 3 HTML
  remoterocketship:  0.70,
  echojobs:          0.70,
  arcdev:            0.75,
  justremote:        0.65,
  jobgether:         0.65,
  builtin:           0.75,
  wellfound:         0.80,
  dice:              0.70,
  powertofly:        0.65,
  contra:            0.60,
  remote100k:        0.65,
  virtualvocations:  0.65,
  skillsire:         0.60,
  remoteweek:        0.60,
  stillhiring:       0.65,
  vibehackers:       0.55,
  remoteimpact:      0.60,
  instahyre:         0.70,
};

export function computeFreshnessScore(job, now = Date.now()) {
  // Recency of source posting (0–50 pts, 7-day half-life)
  const ageMs = job.sourcePostedAt
    ? now - new Date(job.sourcePostedAt).getTime()
    : 7 * 24 * 60 * 60 * 1000;
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  const recency = 50 * Math.exp(-ageDays / 7);

  // Discovery novelty (0–30 pts, 12-hour half-life)
  const discoveryMs = job.firstDiscoveredAt
    ? now - new Date(job.firstDiscoveredAt).getTime()
    : 0;
  const discoveryHours = discoveryMs / (60 * 60 * 1000);
  const novelty = 30 * Math.exp(-discoveryHours / 12);

  // Source trust (0–20 pts, fixed per source)
  const trust = 20 * (SOURCE_TRUST[job.source] ?? 0.60);

  return Math.round(recency + novelty + trust);
}
