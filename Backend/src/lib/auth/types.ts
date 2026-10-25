export const OAUTH_PROVIDERS = ["google", "kakao", "naver"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
export type DbOAuthProvider = Uppercase<OAuthProvider>;

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type MemberType = "MAIN" | "SUB";
export type AuthMethod = "LOCAL_ONLY" | "SSO_ONLY" | "BOTH";

export type OAuthStateAction =
  | "MAIN_LOGIN"
  | "SUB_LOGIN"
  | "MAIN_SIGNUP"
  | "LINK"
  | "INVITE";

export type OAuthStateRecord = {
  action: OAuthStateAction;
  provider: OAuthProvider;
  accountId?: string;
  accountCode?: string;
  accountName?: string;
  userId?: string;
  memberId?: string;
  sessionId?: string;
  invitationId?: string;
};

export type AuthContext = {
  userId: string;
  accountId: string;
  memberId: string;
  memberType: MemberType;
  role: MemberRole;
  sessionId: string;
};

export type SessionRecord = AuthContext & {
  refreshHash: string;
  expiresAt: number;
};

export type OAuthProfile = {
  provider: OAuthProvider;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  profileImageUrl: string | null;
};
