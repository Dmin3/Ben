import Redis from "ioredis";

import { getEnv } from "@/lib/env";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(getEnv().REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    });
  }
  return globalForRedis.redis;
}

export async function ensureRedisConnected() {
  const redis = getRedis();
  if (redis.status === "wait") await redis.connect();
  return redis;
}
