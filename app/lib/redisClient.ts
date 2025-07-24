import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error("FATAL: Upstash Redis URL or Token is not defined.");
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

export default redis;