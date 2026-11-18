import { NextResponse } from "next/server";
import { z } from "zod";
import { registerSubAccountRequest } from "@/lib/auth/service";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({
  mainAccountCode: z.string().trim().min(3).max(30),
  email: z.email(),
  password: z.string().min(10).max(128),
  name: z.string().trim().min(2).max(80),
  phone: z.string(),
  phoneVerificationToken: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    return NextResponse.json(await registerSubAccountRequest(schema.parse(await readRequestBody(request))), { status: 202 });
  } catch (error) {
    return jsonError(error);
  }
}
