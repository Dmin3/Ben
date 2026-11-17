import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { approveMembershipRequest } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";

type Context = { params: Promise<{ requestId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { requestId } = await context.params;
    return NextResponse.json(await approveMembershipRequest(auth, requestId));
  } catch (error) {
    return jsonError(error);
  }
}
