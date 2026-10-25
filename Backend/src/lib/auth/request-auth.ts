import type { NextRequest } from "next/server";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { sessionExists } from "@/lib/auth/session-store";
import { AppError } from "@/lib/http";

export async function requireAuth(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const token = bearer ?? request.cookies.get(ACCESS_COOKIE)?.value;

  if (!token) throw new AppError(401, "AUTH_REQUIRED", "로그인이 필요합니다.");

  try {
    const context = await verifyAccessToken(token);
    if (!(await sessionExists(context.sessionId))) {
      throw new AppError(401, "SESSION_EXPIRED", "세션이 만료되었습니다.");
    }
    return context;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "INVALID_ACCESS_TOKEN", "Access Token이 유효하지 않습니다.");
  }
}
