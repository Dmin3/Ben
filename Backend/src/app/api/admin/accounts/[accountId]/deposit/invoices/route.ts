import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { depositInvoices } from "@/db/schema";
import { adminContext } from "@/lib/deposits/admin";
import { AppError, jsonError } from "@/lib/http";
export async function POST(req: NextRequest, ctx: { params: Promise<{ accountId: string }> }) {
 try {
  const { actor, accountId } = await adminContext(req, ctx.params);
  if (Number(req.headers.get("content-length")) > 3 * 1024 * 1024) throw new AppError(413, "FILE_TOO_LARGE", "PDF는 2MB까지 가능합니다.");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || file.size > 2 * 1024 * 1024 || file.type !== "application/pdf") throw new AppError(400, "INVALID_PDF", "2MB 이하 PDF 파일이 필요합니다.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0,5).toString() !== "%PDF-") throw new AppError(400, "INVALID_PDF", "PDF 형식이 아닙니다.");
  const [item] = await getDb().insert(depositInvoices).values({ accountId, createdBy: actor.userId, fileName: file.name.slice(0,200), contentBase64: bytes.toString("base64") }).returning({ id: depositInvoices.id, fileName: depositInvoices.fileName });
  return NextResponse.json(item, { status: 201 });
 } catch(e) { return jsonError(e); }
}
