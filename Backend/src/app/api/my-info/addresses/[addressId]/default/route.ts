import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/request-auth";
import { jsonError } from "@/lib/http";
import { setMyDefaultAddress } from "@/lib/my-info";
import { addressIdSchema } from "@/lib/my-info-schemas";

type Context = { params: Promise<{ addressId: string }> };

export async function PUT(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { addressId } = await context.params;
    return NextResponse.json(await setMyDefaultAddress(auth, addressIdSchema.parse(addressId)));
  } catch (error) {
    return jsonError(error);
  }
}
