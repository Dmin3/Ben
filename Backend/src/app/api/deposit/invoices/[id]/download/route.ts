import { NextRequest } from "next/server";
import { z } from "zod";
import { depositAuth } from "@/lib/deposits/auth";
import { invoice } from "@/lib/deposits/repository";
import { jsonError } from "@/lib/http";
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
  const auth = await depositAuth(req);
  const item = await invoice(auth.accountId, z.uuid().parse((await ctx.params).id));
  return new Response(Buffer.from(item.contentBase64, "base64"), { headers: {
    "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(item.fileName),
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
  } });
 } catch(e) { return jsonError(e); }
}
