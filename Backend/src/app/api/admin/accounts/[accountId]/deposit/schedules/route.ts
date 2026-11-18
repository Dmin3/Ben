import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { depositSchedules } from "@/db/schema";
import { adminContext } from "@/lib/deposits/admin";
import { scheduleInput } from "@/lib/deposits/schemas";
import { readRequestBody } from "@/lib/request-body";
import { jsonError } from "@/lib/http";
export async function POST(req: NextRequest, ctx: { params: Promise<{ accountId: string }> }) {
 try { const { actor, accountId } = await adminContext(req, ctx.params);
 const body = scheduleInput.parse(await readRequestBody(req));
 const [item] = await getDb().insert(depositSchedules).values({ ...body, accountId, createdBy: actor.userId }).returning();
 return NextResponse.json(item, { status: 201 }); } catch(e) { return jsonError(e); }
}
