import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOnboardingAuth } from "@/lib/auth/onboarding-auth";
import { getOnboardingStatus, requestMembership } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const requestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  invitationCode: z.string().trim().regex(/^[A-Z0-9]{12}$/),
  phone: z.string().optional(),
  phoneVerificationToken: z.string().min(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireOnboardingAuth(request);
    const status = await getOnboardingStatus(auth.userId);
    return NextResponse.json(status.membershipRequest);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOnboardingAuth(request);
    const body = requestSchema.parse(await readRequestBody(request));
    return NextResponse.json(
      await requestMembership(auth.userId, body.name, body.invitationCode, body.phone, body.phoneVerificationToken),
      { status: 202 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
