import type { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";

export const ACCESS_COOKIE = "ben_access_token";
export const REFRESH_COOKIE = "ben_refresh_token";

type CookieTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
};

export function setAuthCookies(response: NextResponse, tokens: CookieTokens) {
  const secure = getEnv().AUTH_COOKIE_SECURE;
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(tokens.accessExpiresAt * 1000),
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    expires: new Date(tokens.refreshExpiresAt * 1000),
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    path: "/api/auth",
    maxAge: 0,
  });
}
