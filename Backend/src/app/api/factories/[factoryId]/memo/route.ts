import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { factoryIdSchema, factoryMemoSchema } from "@/lib/factories/schemas";
import { updateFactoryMemo } from "@/lib/factories/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

type Context = { params: Promise<{ factoryId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { factoryId } = await context.params;
    const input = factoryMemoSchema.parse(await readRequestBody(request));
    return NextResponse.json(await updateFactoryMemo(auth, factoryIdSchema.parse(factoryId), input));
  } catch (error) {
    return jsonError(error);
  }
}
