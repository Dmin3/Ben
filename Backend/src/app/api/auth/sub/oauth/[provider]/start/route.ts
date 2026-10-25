import { NextRequest, NextResponse } from "next/server";

import { createOAuthAuthorizationUrl } from "@/lib/auth/oauth";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/types";
import { AppError, jsonError } from "@/lib/http";

type Context = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const { provider } = await context.params;
    const accountCode = request.nextUrl.searchParams.get("accountCode")?.trim().toLowerCase();
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new AppError(404, "OAUTH_PROVIDER_NOT_FOUND", "지원하지 않는 OAuth 제공자입니다.");
    }
    if (!accountCode) throw new AppError(400, "ACCOUNT_CODE_REQUIRED", "고객사 코드가 필요합니다.");
    return NextResponse.redirect(
      await createOAuthAuthorizationUrl({
        action: "SUB_LOGIN",
        provider: provider as OAuthProvider,
        accountCode,
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}
