import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPhoneCode } from "@/lib/auth/phone-verification";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({ phone: z.string(), code: z.string().regex(/^\d{6}$/), purpose: z.enum(["MAIN_SIGNUP", "SUB_SIGNUP", "SSO_SIGNUP"]) });
export async function POST(request: Request) {
  try { const body = schema.parse(await readRequestBody(request)); return NextResponse.json(await verifyPhoneCode(body.phone, body.code, body.purpose)); }
  catch (error) { return jsonError(error); }
}
