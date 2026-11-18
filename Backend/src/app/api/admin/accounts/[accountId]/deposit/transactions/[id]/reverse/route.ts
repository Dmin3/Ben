import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { depositTransactions } from "@/db/schema";
import { adminContext } from "@/lib/deposits/admin";
import { postTransaction } from "@/lib/deposits/repository";
import { reversalInput } from "@/lib/deposits/schemas";
import { readRequestBody } from "@/lib/request-body";
import { AppError, jsonError } from "@/lib/http";
export async function POST(req: NextRequest, ctx: { params: Promise<{ accountId: string; id: string }> }) {
 try {
  const { actor, accountId } = await adminContext(req, ctx.params);
  const id = z.uuid().parse((await ctx.params).id);
  const body = reversalInput.parse(await readRequestBody(req));
  const [original] = await getDb().select().from(depositTransactions).where(and(eq(depositTransactions.id, id), eq(depositTransactions.accountId, accountId)));
  if (!original) throw new AppError(404, "TRANSACTION_NOT_FOUND", "거래가 없습니다.");
  if (original.reversalOf) throw new AppError(409, "REVERSAL_NOT_ALLOWED", "취소 거래를 다시 취소할 수 없습니다.");
  const amount = original.amount.startsWith("-") ? original.amount.slice(1) : "-" + original.amount;
  return NextResponse.json(await postTransaction(accountId, actor.userId, { ...body, amount, orderCode: original.orderCode ?? undefined }, id), { status: 201 });
 } catch(e) { return jsonError(e); }
}
