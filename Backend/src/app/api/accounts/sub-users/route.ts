import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/request-auth";
import { createSubAccount, listSubAccounts } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const createSchema = z.object({
  loginId: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._@-]+$/).optional(),
  password: z.string().min(10).max(128).optional(),
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  permissions: z.array(z.string().min(1).max(80)).max(100).default([]),
  authMethod: z.enum(["LOCAL_ONLY", "SSO_ONLY", "BOTH"]).default("SSO_ONLY"),
  provider: z.enum(["GOOGLE", "KAKAO", "NAVER"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    return NextResponse.json({ items: await listSubAccounts(auth) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const item = await createSubAccount(auth, createSchema.parse(await readRequestBody(request)));
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
