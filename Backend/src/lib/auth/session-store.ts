import { createHash, timingSafeEqual } from "node:crypto";

import { ensureRedisConnected } from "@/lib/redis";
import type { AuthContext, SessionRecord } from "@/lib/auth/types";

const SESSION_PREFIX = "auth:session:";
const MEMBER_SESSIONS_PREFIX = "auth:member-sessions:";

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

function memberSessionsKey(memberId: string) {
  return `${MEMBER_SESSIONS_PREFIX}${memberId}`;
}

export async function createSession(
  context: AuthContext,
  refreshToken: string,
  refreshExpiresAt: number,
) {
  const redis = await ensureRedisConnected();
  const ttl = Math.max(1, refreshExpiresAt - Math.floor(Date.now() / 1000));
  const record: SessionRecord = {
    ...context,
    refreshHash: hashRefreshToken(refreshToken),
    expiresAt: refreshExpiresAt,
  };
  await redis
    .multi()
    .set(sessionKey(context.sessionId), JSON.stringify(record), "EX", ttl)
    .sadd(memberSessionsKey(context.memberId), context.sessionId)
    .expire(memberSessionsKey(context.memberId), ttl)
    .exec();
}

export async function getSession(sessionId: string): Promise<SessionRecord | null> {
  const redis = await ensureRedisConnected();
  const value = await redis.get(sessionKey(sessionId));
  return value ? (JSON.parse(value) as SessionRecord) : null;
}

export async function sessionExists(sessionId: string) {
  const redis = await ensureRedisConnected();
  return (await redis.exists(sessionKey(sessionId))) === 1;
}

export async function rotateSession(
  sessionId: string,
  oldRefreshToken: string,
  newRefreshToken: string,
) {
  const redis = await ensureRedisConnected();
  const key = sessionKey(sessionId);
  const record = await getSession(sessionId);
  if (!record) return null;

  const presented = Buffer.from(hashRefreshToken(oldRefreshToken));
  const expected = Buffer.from(record.refreshHash);
  if (presented.length !== expected.length || !timingSafeEqual(presented, expected)) {
    await redis.del(key);
    return null;
  }

  const nextRecord = { ...record, refreshHash: hashRefreshToken(newRefreshToken) };
  const ttl = Math.max(1, record.expiresAt - Math.floor(Date.now() / 1000));

  // WATCH prevents two concurrent refresh requests from both succeeding.
  await redis.watch(key);
  const current = await redis.get(key);
  if (current !== JSON.stringify(record)) {
    await redis.unwatch();
    return null;
  }
  const result = await redis.multi().set(key, JSON.stringify(nextRecord), "EX", ttl).exec();
  return result ? nextRecord : null;
}

export async function revokeSession(sessionId: string) {
  const redis = await ensureRedisConnected();
  const record = await getSession(sessionId);
  const transaction = redis.multi().del(sessionKey(sessionId));
  if (record) transaction.srem(memberSessionsKey(record.memberId), sessionId);
  await transaction.exec();
}

export async function revokeMemberSessions(memberId: string) {
  const redis = await ensureRedisConnected();
  const indexKey = memberSessionsKey(memberId);
  const sessionIds = await redis.smembers(indexKey);
  if (!sessionIds.length) return;
  await redis.del(...sessionIds.map(sessionKey), indexKey);
}
