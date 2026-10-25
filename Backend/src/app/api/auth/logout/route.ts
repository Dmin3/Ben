import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { revokeSession } from "@/lib/auth/session-store";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const claims = await verifyRefreshToken(refreshToken);
      await revokeSession(claims.sessionId);
    } catch {
      // Logout remains idempotent even when the cookie is already invalid.
    }
  }
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
