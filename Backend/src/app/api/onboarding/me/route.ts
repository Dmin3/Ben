import { NextRequest, NextResponse } from "next/server";

import { requireOnboardingAuth } from "@/lib/auth/onboarding-auth";
import { getOnboardingStatus } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOnboardingAuth(request);
    return NextResponse.json(await getOnboardingStatus(auth.userId));
  } catch (error) {
    return jsonError(error);
  }
}
