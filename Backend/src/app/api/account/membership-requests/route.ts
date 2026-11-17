import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { listMembershipRequests } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    return NextResponse.json(await listMembershipRequests(auth));
  } catch (error) {
    return jsonError(error);
  }
}
