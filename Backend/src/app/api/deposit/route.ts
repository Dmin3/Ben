import { NextRequest, NextResponse } from "next/server";
import { depositAuth } from "@/lib/deposits/auth";
import { summary } from "@/lib/deposits/repository";
import { jsonError } from "@/lib/http";
export async function GET(req: NextRequest) {
 try { const auth = await depositAuth(req); return NextResponse.json(await summary(auth.accountId)); }
 catch(e) { return jsonError(e); }
}
