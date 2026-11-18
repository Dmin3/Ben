import { NextRequest, NextResponse } from "next/server";
import { depositAuth } from "@/lib/deposits/auth";
import { listAlerts } from "@/lib/deposits/repository";
import { listQuery } from "@/lib/deposits/schemas";
import { jsonError } from "@/lib/http";
export async function GET(req: NextRequest) {
 try { const auth = await depositAuth(req); const q = listQuery.parse(Object.fromEntries(req.nextUrl.searchParams)); return NextResponse.json({ items: await listAlerts(auth.accountId, q.page, q.pageSize), page: q.page, pageSize: q.pageSize }); }
 catch(e) { return jsonError(e); }
}
