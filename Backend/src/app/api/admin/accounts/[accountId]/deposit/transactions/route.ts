import { NextRequest, NextResponse } from "next/server";
import { adminContext } from "@/lib/deposits/admin";
import { listTransactions, postTransaction } from "@/lib/deposits/repository";
import { transactionInput, listQuery } from "@/lib/deposits/schemas";
import { readRequestBody } from "@/lib/request-body";
import { jsonError } from "@/lib/http";
type Ctx = { params: Promise<{ accountId: string }> };
export async function POST(req: NextRequest, ctx: Ctx) {
 try { const { actor, accountId } = await adminContext(req, ctx.params);
 return NextResponse.json(await postTransaction(accountId, actor.userId, transactionInput.parse(await readRequestBody(req))), { status: 201 }); }
 catch(e) { return jsonError(e); }
}
export async function GET(req: NextRequest, ctx: Ctx) {
 try { const { accountId } = await adminContext(req, ctx.params); return NextResponse.json(await listTransactions(accountId, listQuery.parse(Object.fromEntries(req.nextUrl.searchParams)))); }
 catch(e) { return jsonError(e); }
}
