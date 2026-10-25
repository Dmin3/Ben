import { NextResponse } from "next/server";
import { z } from "zod";

import { loginMainWithPassword } from "@/lib/auth/service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const result = await loginMainWithPassword(schema.parse(await readRequestBody(request)));
    const response = NextResponse.json({
      accessToken: result.tokens.accessToken,
      expiresAt: result.tokens.accessExpiresAt,
      account: {
        id: result.context.accountId,
        memberType: "MAIN",
        role: result.context.role,
      },
    });
    setAuthCookies(response, result.tokens);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
