import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { listFactoryOptions } from "@/lib/factories/service";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    return NextResponse.json(await listFactoryOptions(auth));
  } catch (error) {
    return jsonError(error);
  }
}
