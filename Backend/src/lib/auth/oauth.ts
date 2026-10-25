import { randomBytes } from "node:crypto";

import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/http";
import { ensureRedisConnected } from "@/lib/redis";
import type {
  OAuthProfile,
  OAuthProvider,
  OAuthStateRecord,
} from "@/lib/auth/types";

const OAUTH_STATE_PREFIX = "auth:oauth-state:";

type ProviderConfig = {
  authorizeUrl: string;
  tokenUrl: string;
  profileUrl: string;
  clientId?: string;
  clientSecret?: string;
  scope: string;
};

function providerConfig(provider: OAuthProvider): ProviderConfig {
  const env = getEnv();
  const configs: Record<OAuthProvider, ProviderConfig> = {
    google: {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      profileUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: "openid email profile",
    },
    kakao: {
      authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
      tokenUrl: "https://kauth.kakao.com/oauth/token",
      profileUrl: "https://kapi.kakao.com/v2/user/me",
      clientId: env.KAKAO_CLIENT_ID,
      clientSecret: env.KAKAO_CLIENT_SECRET,
      scope: "account_email profile_nickname profile_image",
    },
    naver: {
      authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
      tokenUrl: "https://nid.naver.com/oauth2.0/token",
      profileUrl: "https://openapi.naver.com/v1/nid/me",
      clientId: env.NAVER_CLIENT_ID,
      clientSecret: env.NAVER_CLIENT_SECRET,
      scope: "",
    },
  };

  const config = configs[provider];
  if (!config.clientId || !config.clientSecret) {
    throw new AppError(503, "OAUTH_NOT_CONFIGURED", `${provider} OAuth가 설정되지 않았습니다.`);
  }
  return config;
}

function redirectUri(provider: OAuthProvider) {
  return `${getEnv().APP_BASE_URL}/api/auth/oauth/${provider}/callback`;
}

export async function createOAuthAuthorizationUrl(record: OAuthStateRecord) {
  const config = providerConfig(record.provider);
  const state = randomBytes(32).toString("base64url");
  const redis = await ensureRedisConnected();
  await redis.set(`${OAUTH_STATE_PREFIX}${state}`, JSON.stringify(record), "EX", 600);

  const url = new URL(config.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId!);
  url.searchParams.set("redirect_uri", redirectUri(record.provider));
  url.searchParams.set("state", state);
  if (config.scope) url.searchParams.set("scope", config.scope);
  if (record.provider === "google") url.searchParams.set("prompt", "select_account");
  return url;
}

export async function consumeOAuthState(provider: OAuthProvider, state: string) {
  const redis = await ensureRedisConnected();
  const stored = await redis.call("GETDEL", `${OAUTH_STATE_PREFIX}${state}`);
  if (typeof stored !== "string") {
    throw new AppError(400, "INVALID_OAUTH_STATE", "OAuth state가 만료되었거나 유효하지 않습니다.");
  }
  const record = JSON.parse(stored) as OAuthStateRecord;
  if (record.provider !== provider) {
    throw new AppError(400, "INVALID_OAUTH_STATE", "OAuth 제공자 정보가 일치하지 않습니다.");
  }
  return record;
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
): Promise<OAuthProfile> {
  const config = providerConfig(provider);
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId!,
    client_secret: config.clientSecret!,
    redirect_uri: redirectUri(provider),
    code,
  });

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    throw new AppError(401, "OAUTH_TOKEN_FAILED", `${provider} 토큰 발급에 실패했습니다.`);
  }
  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new AppError(401, "OAUTH_TOKEN_FAILED", `${provider} Access Token이 없습니다.`);
  }

  const profileResponse = await fetch(config.profileUrl, {
    headers: { authorization: `Bearer ${tokenData.access_token}` },
    cache: "no-store",
  });
  if (!profileResponse.ok) {
    throw new AppError(401, "OAUTH_PROFILE_FAILED", `${provider} 사용자 조회에 실패했습니다.`);
  }
  return normalizeProfile(provider, await profileResponse.json());
}

export function normalizeProfile(provider: OAuthProvider, raw: unknown): OAuthProfile {
  const data = raw as Record<string, unknown>;
  if (provider === "google") {
    return {
      provider,
      subject: String(data.sub),
      email: typeof data.email === "string" ? data.email.toLowerCase() : null,
      emailVerified: data.email_verified === true,
      name: typeof data.name === "string" ? data.name : "Google 사용자",
      profileImageUrl: typeof data.picture === "string" ? data.picture : null,
    };
  }
  if (provider === "kakao") {
    const account = (data.kakao_account ?? {}) as Record<string, unknown>;
    const profile = (account.profile ?? {}) as Record<string, unknown>;
    return {
      provider,
      subject: String(data.id),
      email: typeof account.email === "string" ? account.email.toLowerCase() : null,
      emailVerified: account.is_email_verified === true,
      name: typeof profile.nickname === "string" ? profile.nickname : "카카오 사용자",
      profileImageUrl:
        typeof profile.profile_image_url === "string" ? profile.profile_image_url : null,
    };
  }
  const response = (data.response ?? {}) as Record<string, unknown>;
  return {
    provider,
    subject: String(response.id),
    email: typeof response.email === "string" ? response.email.toLowerCase() : null,
    emailVerified: typeof response.email === "string",
    name: typeof response.name === "string" ? response.name : "네이버 사용자",
    profileImageUrl: typeof response.profile_image === "string" ? response.profile_image : null,
  };
}
