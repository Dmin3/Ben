import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { deleteMyAddress, updateMyAddress } from "@/lib/my-info";
import { addressIdSchema, addressUpdateSchema } from "@/lib/my-info-schemas";
import { readRequestBody } from "@/lib/request-body";

type Context = { params: Promise<{ addressId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { addressId } = await context.params;
    const input = addressUpdateSchema.parse(await readRequestBody(request));
    return NextResponse.json(await updateMyAddress(auth, addressIdSchema.parse(addressId), input));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { addressId } = await context.params;
    await deleteMyAddress(auth, addressIdSchema.parse(addressId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return jsonError(error);
  }
}
