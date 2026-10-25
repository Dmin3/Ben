import { NextResponse } from "next/server";
import { z } from "zod";

import { createOAuthAuthorizationUrl } from "@/lib/auth/oauth";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/types";
import { AppError, jsonError } from "@/lib/http";
import { readRequestBody } from "@/lib/request-body";

const schema = z.object({
  accountCode: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9-]+$/),
  accountName: z.string().trim().min(2).max(100),
});
type Context = { params: Promise<{ provider: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { provider } = await context.params;
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new AppError(404, "OAUTH_PROVIDER_NOT_FOUND", "지원하지 않는 OAuth 제공자입니다.");
    }
    const body = schema.parse(await readRequestBody(request));
    const authorizationUrl = await createOAuthAuthorizationUrl({
      action: "MAIN_SIGNUP",
      provider: provider as OAuthProvider,
      accountCode: body.accountCode.toLowerCase(),
      accountName: body.accountName,
    });
    return NextResponse.json({ authorizationUrl: authorizationUrl.toString() });
  } catch (error) {
    return jsonError(error);
  }
}
