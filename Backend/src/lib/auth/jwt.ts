import { randomUUID } from "node:crypto";

import { jwtVerify, SignJWT } from "jose";

import { getEnv } from "@/lib/env";
import type { AuthContext } from "@/lib/auth/types";

const encoder = new TextEncoder();

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
};

function claims(context: AuthContext) {
  return {
    aid: context.accountId,
    mid: context.memberId,
    mtp: context.memberType,
    role: context.role,
    sid: context.sessionId,
  };
}

export async function issueTokenPair(
  context: AuthContext,
  refreshExpiresAt = Math.floor(Date.now() / 1000) + getEnv().REFRESH_TOKEN_TTL_SECONDS,
): Promise<TokenPair> {
  const env = getEnv();
  const now = Math.floor(Date.now() / 1000);
  const accessExpiresAt = now + env.ACCESS_TOKEN_TTL_SECONDS;

  const accessToken = await new SignJWT({ ...claims(context), typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(context.userId)
    .setIssuedAt(now)
    .setExpirationTime(accessExpiresAt)
    .setJti(randomUUID())
    .sign(encoder.encode(env.JWT_ACCESS_SECRET));

  const refreshToken = await new SignJWT({ sid: context.sessionId, typ: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(context.userId)
    .setIssuedAt(now)
    .setExpirationTime(refreshExpiresAt)
    .setJti(randomUUID())
    .sign(encoder.encode(env.JWT_REFRESH_SECRET));

  return { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt };
}

export async function verifyAccessToken(token: string): Promise<AuthContext> {
  const { payload } = await jwtVerify(token, encoder.encode(getEnv().JWT_ACCESS_SECRET), {
    algorithms: ["HS256"],
  });

  if (
    payload.typ !== "access" ||
    !payload.sub ||
    typeof payload.aid !== "string" ||
    typeof payload.mid !== "string" ||
    (payload.mtp !== "MAIN" && payload.mtp !== "SUB") ||
    !["OWNER", "ADMIN", "MEMBER"].includes(String(payload.role)) ||
    typeof payload.sid !== "string"
  ) {
    throw new Error("Invalid access token claims");
  }

  return {
    userId: payload.sub,
    accountId: payload.aid,
    memberId: payload.mid,
    memberType: payload.mtp,
    role: payload.role as AuthContext["role"],
    sessionId: payload.sid,
  };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(getEnv().JWT_REFRESH_SECRET), {
    algorithms: ["HS256"],
  });

  if (payload.typ !== "refresh" || !payload.sub || typeof payload.sid !== "string") {
    throw new Error("Invalid refresh token claims");
  }

  return {
    userId: payload.sub,
    sessionId: payload.sid,
    expiresAt: payload.exp,
  };
}
