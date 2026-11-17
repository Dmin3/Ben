import { NextRequest, NextResponse } from "next/server";

import {
  clearOnboardingCookie,
  setAuthCookies,
  setOnboardingCookie,
} from "@/lib/auth/cookies";
import { issueOnboardingToken } from "@/lib/auth/jwt";
import { consumeOAuthState, exchangeOAuthCode } from "@/lib/auth/oauth";
import { completeOAuth } from "@/lib/auth/service";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/types";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/http";

type Context = { params: Promise<{ provider: string }> };

export async function GET(request: NextRequest, context: Context) {
  const frontend = new URL("/auth/callback", getEnv().FRONTEND_URL);
  try {
    const { provider } = await context.params;
    if (!OAUTH_PROVIDERS.includes(provider as OAuthProvider)) {
      throw new AppError(404, "OAUTH_PROVIDER_NOT_FOUND", "지원하지 않는 OAuth 제공자입니다.");
    }
    const code = request.nextUrl.searchParams.get("code");
    const stateValue = request.nextUrl.searchParams.get("state");
    const oauthError = request.nextUrl.searchParams.get("error");
    if (oauthError) throw new AppError(401, "OAUTH_DENIED", oauthError);
    if (!code || !stateValue) {
      throw new AppError(400, "OAUTH_CALLBACK_INVALID", "code 또는 state가 없습니다.");
    }

    const state = await consumeOAuthState(provider as OAuthProvider, stateValue);
    const profile = await exchangeOAuthCode(provider as OAuthProvider, code);
    const result = await completeOAuth(profile, state);
    if (result.kind === "ONBOARDING") {
      frontend.searchParams.set("success", "1");
      frontend.searchParams.set("result", "ONBOARDING");
      if (result.requestStatus) {
        frontend.searchParams.set("membershipStatus", result.requestStatus);
      }
      const response = NextResponse.redirect(frontend);
      setOnboardingCookie(response, await issueOnboardingToken(result.userId));
      return response;
    }
    frontend.searchParams.set("success", "1");
    frontend.searchParams.set("result", "AUTHENTICATED");
    frontend.searchParams.set("accountType", result.context.memberType);
    const response = NextResponse.redirect(frontend);
    setAuthCookies(response, result.tokens);
    clearOnboardingCookie(response);
    return response;
  } catch (error) {
    const appError = error instanceof AppError ? error : null;
    frontend.searchParams.set("success", "0");
    frontend.searchParams.set("error", appError?.code ?? "OAUTH_FAILED");
    return NextResponse.redirect(frontend);
  }
}
