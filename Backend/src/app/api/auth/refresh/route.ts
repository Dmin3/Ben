import { NextRequest, NextResponse } from "next/server";

import { REFRESH_COOKIE, setAuthCookies } from "@/lib/auth/cookies";
import { issueTokenPair, verifyRefreshToken } from "@/lib/auth/jwt";
import { getSession, rotateSession } from "@/lib/auth/session-store";
import { AppError, jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) {
      throw new AppError(401, "REFRESH_TOKEN_REQUIRED", "Refresh Token이 없습니다.");
    }

    const claims = await verifyRefreshToken(refreshToken);
    const session = await getSession(claims.sessionId);
    if (!session || session.userId !== claims.userId) {
      throw new AppError(401, "SESSION_EXPIRED", "세션이 만료되었습니다.");
    }

    const tokens = await issueTokenPair(
      {
        userId: session.userId,
        accountId: session.accountId,
        memberId: session.memberId,
        memberType: session.memberType,
        role: session.role,
        sessionId: session.sessionId,
      },
      session.expiresAt,
    );
    const rotated = await rotateSession(session.sessionId, refreshToken, tokens.refreshToken);
    if (!rotated) {
      throw new AppError(401, "REFRESH_TOKEN_REUSED", "Refresh Token이 재사용되었거나 만료되었습니다.");
    }

    const response = NextResponse.json({
      accessToken: tokens.accessToken,
      expiresAt: tokens.accessExpiresAt,
    });
    setAuthCookies(response, tokens);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
