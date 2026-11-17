import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { updateMyContact } from "@/lib/my-info";
import { contactSchema } from "@/lib/my-info-schemas";
import { readRequestBody } from "@/lib/request-body";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = contactSchema.parse(await readRequestBody(request));
    return NextResponse.json(await updateMyContact(auth, input));
  } catch (error) {
    return jsonError(error);
  }
}
