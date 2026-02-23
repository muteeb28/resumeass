import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
const skipRedis = process.env.SKIP_REDIS === 'true' || !redisUrl;

let redis;

if (skipRedis) {
  if (!redisUrl) {
    console.warn("WARN: UPSTASH_REDIS_URL not set; Redis is disabled.");
  } else {
    console.warn("WARN: SKIP_REDIS=true set; Redis is disabled.");
  }
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
    quit: async () => null,
    on: () => {}
  };
} else {
  redis = new Redis(redisUrl);
  redis.on('error', (error) => {
    console.error("Redis error:", error?.message || error);
  });
}

export { redis };
