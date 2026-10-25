import { beforeEach, describe, expect, it } from "vitest";

import { issueTokenPair, verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";
import { resetEnvForTests } from "@/lib/env";

beforeEach(() => {
  Object.assign(process.env, {
    NODE_ENV: "test",
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    REDIS_URL: "redis://localhost:6379",
    JWT_ACCESS_SECRET: "a".repeat(32),
    JWT_REFRESH_SECRET: "b".repeat(32),
    ACCESS_TOKEN_TTL_SECONDS: "900",
    REFRESH_TOKEN_TTL_SECONDS: "604800",
    APP_BASE_URL: "http://localhost:3000",
    FRONTEND_URL: "http://localhost:3001",
    AUTH_COOKIE_SECURE: "false",
  });
  resetEnvForTests();
});

describe("JWT token pair", () => {
  const context = {
    userId: "user-id",
    accountId: "account-id",
    memberId: "member-id",
    memberType: "MAIN" as const,
    role: "OWNER" as const,
    sessionId: "session-id",
  };

  it("round-trips the access context", async () => {
    const pair = await issueTokenPair(context);
    await expect(verifyAccessToken(pair.accessToken)).resolves.toEqual(context);
  });

  it("creates a refresh token tied to the session", async () => {
    const pair = await issueTokenPair(context);
    const claims = await verifyRefreshToken(pair.refreshToken);
    expect(claims.userId).toBe(context.userId);
    expect(claims.sessionId).toBe(context.sessionId);
    expect(claims.expiresAt).toBe(pair.refreshExpiresAt);
  });
});
