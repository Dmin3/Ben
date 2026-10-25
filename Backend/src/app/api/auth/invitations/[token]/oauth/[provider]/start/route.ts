import { NextResponse } from "next/server";

import { createOAuthAuthorizationUrl } from "@/lib/auth/oauth";
import { findInvitationForToken } from "@/lib/auth/service";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/types";
import { AppError, jsonError } from "@/lib/http";

type Context = { params: Promise<{ token: string; provider: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { token, provider } = await context.params;
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new AppError(404, "OAUTH_PROVIDER_NOT_FOUND", "지원하지 않는 OAuth 제공자입니다.");
    }
    const invitation = await findInvitationForToken(token);
    if (invitation.provider !== provider.toUpperCase()) {
      throw new AppError(400, "INVITATION_PROVIDER_MISMATCH", "초대에 지정된 SSO 제공자가 아닙니다.");
    }
    return NextResponse.redirect(
      await createOAuthAuthorizationUrl({
        action: "INVITE",
        provider: provider as OAuthProvider,
        accountId: invitation.accountId,
        memberId: invitation.memberId,
        invitationId: invitation.id,
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}
