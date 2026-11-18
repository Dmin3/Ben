import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setAuthCookies } from "@/lib/auth/cookies";
import { requireOnboardingAuth } from "@/lib/auth/onboarding-auth";
import { createMainForOnboarding } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({
  accountCode: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9-]+$/),
  accountName: z.string().trim().min(2).max(100),
  businessRegistrationNumber: z.string().trim().min(10).max(12),
  phone: z.string().optional(),
  phoneVerificationToken: z.string().min(20).optional(),
});
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOnboardingAuth(request);
    const result = await createMainForOnboarding(auth.userId, schema.parse(await readRequestBody(request)));
    const response = NextResponse.json({ accessToken: result.tokens.accessToken, expiresAt: result.tokens.accessExpiresAt, account: { id: result.context.accountId, code: result.accountCode, memberType: "MAIN", role: "OWNER" } }, { status: 201 });
    setAuthCookies(response, result.tokens);
    return response;
  } catch (error) { return jsonError(error); }
}
