import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { changeMyPassword } from "@/lib/my-info";
import { passwordChangeSchema } from "@/lib/my-info-schemas";
import { readRequestBody } from "@/lib/request-body";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = passwordChangeSchema.parse(await readRequestBody(request));
    return NextResponse.json(
      await changeMyPassword(auth, input.currentPassword, input.newPassword),
    );
  } catch (error) {
    return jsonError(error);
  }
}
