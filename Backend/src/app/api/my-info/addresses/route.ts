import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { createMyAddress } from "@/lib/my-info";
import { addressSchema } from "@/lib/my-info-schemas";
import { readRequestBody } from "@/lib/request-body";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = addressSchema.parse(await readRequestBody(request));
    return NextResponse.json(await createMyAddress(auth, input), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
