import type { NextRequest } from "next/server";

import { ONBOARDING_COOKIE } from "@/lib/auth/cookies";
import { verifyOnboardingToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/http";

export async function requireOnboardingAuth(request: NextRequest) {
  const token = request.cookies.get(ONBOARDING_COOKIE)?.value;
  if (!token) {
    throw new AppError(401, "ONBOARDING_AUTH_REQUIRED", "가입 세션이 필요합니다.");
  }
  try {
    return await verifyOnboardingToken(token);
  } catch {
    throw new AppError(401, "ONBOARDING_SESSION_EXPIRED", "가입 세션이 만료되었습니다.");
  }
}
