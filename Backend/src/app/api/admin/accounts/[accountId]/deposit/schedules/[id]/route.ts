import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { depositSchedules } from "@/db/schema";
import { adminContext } from "@/lib/deposits/admin";
import { scheduleStatus } from "@/lib/deposits/schemas";
import { readRequestBody } from "@/lib/request-body";
import { AppError, jsonError } from "@/lib/http";
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ accountId: string; id: string }> }) {
 try { const { accountId } = await adminContext(req, ctx.params);
 const id = z.uuid().parse((await ctx.params).id);
 const body = scheduleStatus.parse(await readRequestBody(req));
 const [item] = await getDb().update(depositSchedules).set(body).where(and(eq(depositSchedules.accountId, accountId), eq(depositSchedules.id, id))).returning();
 if (!item) throw new AppError(404, "SCHEDULE_NOT_FOUND", "예정 내역이 없습니다.");
 return NextResponse.json(item); } catch(e) { return jsonError(e); }
}
