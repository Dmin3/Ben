import { NextRequest, NextResponse } from "next/server";
import { depositAuth } from "@/lib/deposits/auth";
import { listTransactions } from "@/lib/deposits/repository";
import { listQuery } from "@/lib/deposits/schemas";
import { jsonError } from "@/lib/http";
export async function GET(req: NextRequest) {
 try { const auth = await depositAuth(req); return NextResponse.json(await listTransactions(auth.accountId, listQuery.parse(Object.fromEntries(req.nextUrl.searchParams)))); }
 catch(e) { return jsonError(e); }
}
