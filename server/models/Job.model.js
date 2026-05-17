import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    sourceId: { type: String, index: true },
    sourceJobId: { type: String, index: true },
    dedupHash: { type: String, index: true },
    dedupFallbackKey: { type: String, index: true },
    normalizedTitle: { type: String, index: true },

    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    url: { type: String, required: true },
    description: String,
    salary: String,
    jobType: { type: String, default: 'Full-time' },
    tags: [String],
    remote: { type: Boolean, default: true },
    category:   { type: String,   index: true },
    categories: { type: [String], index: true },

    role: String,
    roleScore: { type: Number, default: 0, index: true },
    roleType: { type: String, enum: ['APM', 'PM', 'INTERN'], index: true },
    freshnessStatus: { type: String, enum: ['FRESH', 'STALE', 'UNKNOWN_DATE'], index: true },

    source: { type: String, required: true },
    sourceLabel: { type: String, required: true },
    rawPostedText: { type: String },
    sourceDatePostedRaw: { type: String },
    timestampSource: { type: String, enum: ['listing', 'detail'] },
    postedAt: { type: Date, index: true },
    sourcePostedAt: { type: Date, index: true },

    discoveredAt: { type: Date, default: Date.now, index: true },
    firstDiscoveredAt: { type: Date, default: Date.now, index: true },
    lastSeenAt: { type: Date, default: Date.now },

    freshnessScore: { type: Number, default: 0, index: true },

    isActive: { type: Boolean, default: true, index: true },

    // TTL index: Jobs expire after 7 days if not updated
    expireAt: { type: Date, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

JobSchema.index({ postedAt: -1 });
JobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true, sparse: true });
JobSchema.index({ roleType: 1, postedAt: -1 });
JobSchema.index({ source: 1, category:   1, isActive: 1 });
JobSchema.index({ source: 1, categories: 1, postedAt: -1 }); // supports category-filtered Talentd queries with sort

const Job = mongoose.models?.Job ?? mongoose.model('Job', JobSchema);
export default Job;
