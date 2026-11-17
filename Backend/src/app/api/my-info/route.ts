import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { getMyInfo } from "@/lib/my-info";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    return NextResponse.json(await getMyInfo(auth));
  } catch (error) {
    return jsonError(error);
  }
}
