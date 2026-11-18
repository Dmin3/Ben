import { NextRequest } from "next/server";
import { depositAuth } from "@/lib/deposits/auth";
import { listTransactions } from "@/lib/deposits/repository";
import { listQuery } from "@/lib/deposits/schemas";
import { transactionCsv } from "@/lib/deposits/csv";
import { jsonError } from "@/lib/http";
export async function GET(req: NextRequest) {
 try {
  const auth = await depositAuth(req);
  const result = await listTransactions(auth.accountId, listQuery.parse(Object.fromEntries(req.nextUrl.searchParams)), true);
  return new Response(transactionCsv(result.items), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="deposit-history.csv"', "Cache-Control": "no-store" } });
 } catch(e) { return jsonError(e); }
}
