import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth/request-auth";
import { disableSubAccount, updateSubAccount } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  permissions: z.array(z.string().min(1).max(80)).max(100).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});
type Context = { params: Promise<{ memberId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { memberId } = await context.params;
    return NextResponse.json(
      await updateSubAccount(auth, memberId, updateSchema.parse(await readRequestBody(request))),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { memberId } = await context.params;
    await disableSubAccount(auth, memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
