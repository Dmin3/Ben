import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/request-auth";
import { rejectMembershipRequest } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

type Context = { params: Promise<{ requestId: string }> };
const bodySchema = z.object({ reason: z.string().trim().max(500).optional() });

export async function POST(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { requestId } = await context.params;
    const body = bodySchema.parse(await readRequestBody(request));
    return NextResponse.json(await rejectMembershipRequest(auth, requestId, body.reason));
  } catch (error) {
    return jsonError(error);
  }
}
