import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPhoneCode } from "@/lib/auth/phone-verification";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({ phone: z.string(), purpose: z.enum(["MAIN_SIGNUP", "SUB_SIGNUP", "SSO_SIGNUP"]) });
export async function POST(request: Request) {
  try { const body = schema.parse(await readRequestBody(request)); return NextResponse.json(await requestPhoneCode(body.phone, body.purpose), { status: 202 }); }
  catch (error) { return jsonError(error); }
}
