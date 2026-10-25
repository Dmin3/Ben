import { NextResponse } from "next/server";
import { z } from "zod";

import { registerMainAccount } from "@/lib/auth/service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({
  accountCode: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9-]+$/, "고객사 코드는 영문, 숫자, 하이픈만 사용할 수 있습니다."),
  email: z.email(),
  password: z.string().min(10).max(128),
  name: z.string().trim().min(2).max(80),
  accountName: z.string().trim().min(2).max(100),
});

export async function POST(request: Request) {
  try {
    const result = await registerMainAccount(schema.parse(await readRequestBody(request)));
    const response = NextResponse.json(
      {
        accessToken: result.tokens.accessToken,
        expiresAt: result.tokens.accessExpiresAt,
        account: {
          id: result.context.accountId,
          code: result.accountCode,
          memberType: result.context.memberType,
          role: result.context.role,
        },
      },
      { status: 201 },
    );
    setAuthCookies(response, result.tokens);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
