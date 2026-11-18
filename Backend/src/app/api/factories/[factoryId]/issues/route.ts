import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { factoryIdSchema } from "@/lib/factories/schemas";
import { listFactoryIssues } from "@/lib/factories/service";
import { jsonError } from "@/lib/http";

type Context = { params: Promise<{ factoryId: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { factoryId } = await context.params;
    return NextResponse.json(await listFactoryIssues(auth, factoryIdSchema.parse(factoryId)));
  } catch (error) {
    return jsonError(error);
  }
}
