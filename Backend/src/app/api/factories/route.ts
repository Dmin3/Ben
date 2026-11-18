import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { factoryListQuerySchema } from "@/lib/factories/schemas";
import { listFactories } from "@/lib/factories/service";
import { jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const query = factoryListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await listFactories(auth, query));
  } catch (error) {
    return jsonError(error);
  }
}
