import { NextRequest, NextResponse } from "next/server";

import { createOAuthAuthorizationUrl } from "@/lib/auth/oauth";
import { requireAuth } from "@/lib/auth/request-auth";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/types";
import { AppError, jsonError } from "@/lib/http";

type Context = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: Context) {
  try {
    const auth = await requireAuth(request);
    const { provider } = await context.params;
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new AppError(404, "OAUTH_PROVIDER_NOT_FOUND", "지원하지 않는 OAuth 제공자입니다.");
    }
    return NextResponse.redirect(
      await createOAuthAuthorizationUrl({
        action: "LINK",
        provider: provider as OAuthProvider,
        accountId: auth.accountId,
        userId: auth.userId,
        memberId: auth.memberId,
        sessionId: auth.sessionId,
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}
