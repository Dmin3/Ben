import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";

import { and, count, desc, eq, gt, isNull, ne, or } from "drizzle-orm";

import {
  accountInvitations,
  accountMembers,
  accounts,
  localCredentials,
  membershipRequests,
  oauthIdentities,
  users,
} from "@/db/schema";
import { getDb } from "@/db/client";
import { AppError } from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { issueTokenPair } from "@/lib/auth/jwt";
import {
  createSession,
  revokeMemberSessions,
  sessionExists,
} from "@/lib/auth/session-store";
import { getEnv } from "@/lib/env";
import { consumePhoneVerification, normalizePhone } from "@/lib/auth/phone-verification";
import type {
  AuthContext,
  AuthMethod,
  MemberRole,
  OAuthProfile,
  OAuthStateRecord,
} from "@/lib/auth/types";

const providerName = (provider: OAuthProfile["provider"]) =>
  provider.toUpperCase() as "GOOGLE" | "KAKAO" | "NAVER";

export function normalizeAccountCode(value: string) {
  return value.trim().toLowerCase();
}

function invitationHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function startSession(context: Omit<AuthContext, "sessionId">) {
  const authContext: AuthContext = { ...context, sessionId: randomUUID() };
  const tokens = await issueTokenPair(authContext);
  await createSession(authContext, tokens.refreshToken, tokens.refreshExpiresAt);
  return { context: authContext, tokens };
}

function assertActive(match: {
  userStatus: string;
  memberStatus: string;
  accountActive: boolean;
}) {
  if (
    match.userStatus !== "ACTIVE" ||
    match.memberStatus !== "ACTIVE" ||
    !match.accountActive
  ) {
    throw new AppError(403, "ACCOUNT_DISABLED", "비활성화된 계정입니다.");
  }
}

export async function registerMainAccount(input: {
  accountCode: string;
  email: string;
  password: string;
  name: string;
  accountName: string;
  businessRegistrationNumber: string;
  phone: string;
  phoneVerificationToken: string;
}) {
  const db = getDb();
  const phone = await consumePhoneVerification(input.phoneVerificationToken, input.phone, "MAIN_SIGNUP");
  const accountCode = normalizeAccountCode(input.accountCode);
  const email = input.email.trim().toLowerCase();
  const normalizedBusinessNumber = normalizeBusinessNumber(input.businessRegistrationNumber);
  const businessHash = businessNumberHash(normalizedBusinessNumber);
  const [existingUser, existingPhone, existingAccount, existingBusiness] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1),
    db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1),
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.code, accountCode)).limit(1),
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.businessNumberHash, businessHash)).limit(1),
  ]);
  if (existingUser.length) throw new AppError(409, "EMAIL_EXISTS", "이미 가입된 이메일입니다.");
  if (existingPhone.length) throw new AppError(409, "PHONE_EXISTS", "이미 가입된 휴대폰번호입니다.");
  if (existingAccount.length) {
    throw new AppError(409, "ACCOUNT_CODE_EXISTS", "이미 사용 중인 고객사 코드입니다.");
  }

  if (existingBusiness.length) {
    throw new AppError(409, "BUSINESS_NUMBER_EXISTS", "이미 등록된 사업자등록번호입니다.");
  }

  const passwordHash = await hashPassword(input.password);
  const result = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ email, emailVerified: false, phone, phoneVerifiedAt: new Date(), name: input.name.trim() })
      .returning();
    const [account] = await tx
      .insert(accounts)
      .values({
        code: accountCode,
        name: input.accountName.trim(),
        ownerUserId: user.id,
        businessNumberHash: businessHash,
        businessNumberLast4: normalizedBusinessNumber.slice(-4),
      })
      .returning();
    const [member] = await tx
      .insert(accountMembers)
      .values({
        accountId: account.id,
        userId: user.id,
        type: "MAIN",
        role: "OWNER",
        authMethod: "LOCAL_ONLY",
        permissions: ["*"],
      })
      .returning();
    await tx.insert(localCredentials).values({
      memberId: member.id,
      accountId: account.id,
      loginId: email,
      passwordHash,
    });
    return { user, account, member };
  });

  const session = await startSession({
    userId: result.user.id,
    accountId: result.account.id,
    memberId: result.member.id,
    memberType: "MAIN",
    role: "OWNER",
  });
  return { ...session, accountCode };
}

export async function loginMainWithPassword(input: { email: string; password: string }) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const [match] = await db
    .select({
      userId: users.id,
      userStatus: users.status,
      accountId: accounts.id,
      accountActive: accounts.active,
      memberId: accountMembers.id,
      memberStatus: accountMembers.status,
      role: accountMembers.role,
      authMethod: accountMembers.authMethod,
      passwordHash: localCredentials.passwordHash,
    })
    .from(users)
    .innerJoin(accountMembers, eq(accountMembers.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
    .innerJoin(localCredentials, eq(localCredentials.memberId, accountMembers.id))
    .where(and(eq(users.email, email), eq(accountMembers.type, "MAIN")))
    .limit(1);

  if (!match || !(await verifyPassword(match.passwordHash, input.password))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "로그인 정보가 올바르지 않습니다.");
  }
  if (match.authMethod === "SSO_ONLY") {
    throw new AppError(403, "SSO_LOGIN_REQUIRED", "SSO 로그인을 사용해야 하는 계정입니다.");
  }
  assertActive(match);
  await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, match.userId));
  return startSession({
    userId: match.userId,
    accountId: match.accountId,
    memberId: match.memberId,
    memberType: "MAIN",
    role: match.role,
  });
}

export async function loginSubWithPassword(input: {
  accountCode: string;
  loginId: string;
  password: string;
}) {
  const db = getDb();
  const [match] = await db
    .select({
      userId: users.id,
      userStatus: users.status,
      accountId: accounts.id,
      accountActive: accounts.active,
      memberId: accountMembers.id,
      memberStatus: accountMembers.status,
      role: accountMembers.role,
      authMethod: accountMembers.authMethod,
      passwordHash: localCredentials.passwordHash,
    })
    .from(localCredentials)
    .innerJoin(accountMembers, eq(accountMembers.id, localCredentials.memberId))
    .innerJoin(accounts, eq(accounts.id, localCredentials.accountId))
    .innerJoin(users, eq(users.id, accountMembers.userId))
    .where(
      and(
        eq(accounts.code, normalizeAccountCode(input.accountCode)),
        eq(localCredentials.loginId, input.loginId.trim().toLowerCase()),
        eq(accountMembers.type, "SUB"),
      ),
    )
    .limit(1);

  if (!match || !(await verifyPassword(match.passwordHash, input.password))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "로그인 정보가 올바르지 않습니다.");
  }
  if (match.authMethod === "SSO_ONLY") {
    throw new AppError(403, "SSO_LOGIN_REQUIRED", "SSO 로그인을 사용해야 하는 계정입니다.");
  }
  assertActive(match);
  await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, match.userId));
  return startSession({
    userId: match.userId,
    accountId: match.accountId,
    memberId: match.memberId,
    memberType: "SUB",
    role: match.role,
  });
}

export async function loginWithPassword(input: {
  accountCode?: string;
  loginId: string;
  password: string;
}) {
  return input.accountCode
    ? loginSubWithPassword({ ...input, accountCode: input.accountCode })
    : loginMainWithPassword({ email: input.loginId, password: input.password });
}

async function findOAuthMembership(
  profile: OAuthProfile,
  memberType: "MAIN" | "SUB",
  accountCode?: string,
) {
  const provider = providerName(profile.provider);
  const conditions = [
    eq(oauthIdentities.provider, provider),
    eq(oauthIdentities.providerSubject, profile.subject),
    eq(accountMembers.type, memberType),
    ne(accountMembers.authMethod, "LOCAL_ONLY"),
    eq(accountMembers.ssoProvider, provider),
    eq(accountMembers.status, "ACTIVE"),
    eq(users.status, "ACTIVE"),
    eq(accounts.active, true),
  ];
  if (accountCode) conditions.push(eq(accounts.code, normalizeAccountCode(accountCode)));

  const [match] = await getDb()
    .select({
      userId: users.id,
      accountId: accounts.id,
      memberId: accountMembers.id,
      memberType: accountMembers.type,
      role: accountMembers.role,
    })
    .from(oauthIdentities)
    .innerJoin(users, eq(users.id, oauthIdentities.userId))
    .innerJoin(accountMembers, eq(accountMembers.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
    .where(and(...conditions))
    .limit(1);
  if (!match) throw new AppError(401, "OAUTH_ACCOUNT_NOT_FOUND", "연결된 SSO 계정을 찾을 수 없습니다.");
  return match;
}

async function findAnyOAuthMembership(profile: OAuthProfile) {
  const [match] = await getDb()
    .select({
      userId: users.id,
      accountId: accounts.id,
      memberId: accountMembers.id,
      memberType: accountMembers.type,
      role: accountMembers.role,
    })
    .from(oauthIdentities)
    .innerJoin(users, eq(users.id, oauthIdentities.userId))
    .innerJoin(accountMembers, eq(accountMembers.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
    .where(
      and(
        eq(oauthIdentities.provider, providerName(profile.provider)),
        eq(oauthIdentities.providerSubject, profile.subject),
        ne(accountMembers.authMethod, "LOCAL_ONLY"),
        eq(accountMembers.status, "ACTIVE"),
        eq(users.status, "ACTIVE"),
        eq(accounts.active, true),
      ),
    )
    .limit(1);
  return match;
}

async function ensureOnboardingUser(profile: OAuthProfile) {
  if (!profile.email || !profile.emailVerified) {
    throw new AppError(400, "OAUTH_EMAIL_REQUIRED", "확인된 이메일 제공 동의가 필요합니다.");
  }
  const db = getDb();
  const provider = providerName(profile.provider);
  let providerPhone: string | null = null;
  if (profile.phone) {
    try { providerPhone = normalizePhone(profile.phone); } catch { providerPhone = null; }
  }
  const [identity] = await db
    .select({ userId: oauthIdentities.userId })
    .from(oauthIdentities)
    .where(
      and(
        eq(oauthIdentities.provider, provider),
        eq(oauthIdentities.providerSubject, profile.subject),
      ),
    )
    .limit(1);
  if (identity) {
    await db
      .update(users)
      .set({
        name: profile.name,
        profileImageUrl: profile.profileImageUrl,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, identity.userId));
    return identity.userId;
  }

  const [sameEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, profile.email))
    .limit(1);
  if (sameEmail) {
    throw new AppError(
      409,
      "OAUTH_EMAIL_ALREADY_REGISTERED",
      "동일 이메일 계정이 있습니다. 로그인 후 SSO 연결을 진행해 주세요.",
    );
  }
  if (providerPhone) {
    const [occupiedPhone] = await db.select({ id: users.id }).from(users).where(eq(users.phone, providerPhone)).limit(1);
    if (occupiedPhone) throw new AppError(409, "PHONE_EXISTS", "해당 휴대폰번호로 가입된 계정이 있습니다.");
  }

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: profile.email,
        emailVerified: true,
        phone: providerPhone,
        phoneVerifiedAt: providerPhone ? new Date() : null,
        name: profile.name,
        profileImageUrl: profile.profileImageUrl,
        lastLoginAt: new Date(),
      })
      .returning();
    await tx.insert(oauthIdentities).values({
      userId: user.id,
      provider,
      providerSubject: profile.subject,
      emailSnapshot: profile.email,
    });
    return user.id;
  });
}

async function createMainFromOAuth(profile: OAuthProfile, state: OAuthStateRecord) {
  if (!state.accountCode || !state.accountName || !state.businessRegistrationNumber) {
    throw new AppError(400, "OAUTH_SIGNUP_INVALID", "고객사 가입 정보가 없습니다.");
  }
  if (!profile.email || !profile.emailVerified) {
    throw new AppError(400, "OAUTH_EMAIL_REQUIRED", "확인된 이메일 제공 동의가 필요합니다.");
  }
  const db = getDb();
  let phone: string | null = null;
  if (profile.phone) {
    try { phone = normalizePhone(profile.phone); } catch { phone = null; }
  }
  if (!phone) {
    throw new AppError(400, "PHONE_VERIFICATION_REQUIRED", "SSO에서 휴대폰번호를 제공하지 않았습니다. 통합 SSO 가입 후 SMS 인증을 진행해 주세요.");
  }
  const accountCode = normalizeAccountCode(state.accountCode);
  const normalizedBusinessNumber = normalizeBusinessNumber(state.businessRegistrationNumber);
  const businessHash = businessNumberHash(normalizedBusinessNumber);
  const [existingAccount, existingBusiness, existingUser, existingPhone, existingIdentity] = await Promise.all([
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.code, accountCode)).limit(1),
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.businessNumberHash, businessHash)).limit(1),
    db.select({ id: users.id }).from(users).where(eq(users.email, profile.email)).limit(1),
    db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1),
    db
      .select({ id: oauthIdentities.id })
      .from(oauthIdentities)
      .where(
        and(
          eq(oauthIdentities.provider, providerName(profile.provider)),
          eq(oauthIdentities.providerSubject, profile.subject),
        ),
      )
      .limit(1),
  ]);
  if (existingAccount.length) throw new AppError(409, "ACCOUNT_CODE_EXISTS", "이미 사용 중인 고객사 코드입니다.");
  if (existingBusiness.length) {
    throw new AppError(409, "BUSINESS_NUMBER_EXISTS", "이미 등록된 사업자등록번호입니다.");
  }
  if (existingUser.length || existingIdentity.length) {
    throw new AppError(409, "ACCOUNT_EXISTS", "이미 가입된 사용자입니다.");
  }
  if (existingPhone.length) throw new AppError(409, "PHONE_EXISTS", "이미 가입된 휴대폰번호입니다.");

  const created = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: profile.email,
        emailVerified: true,
        phone,
        phoneVerifiedAt: new Date(),
        name: profile.name,
        profileImageUrl: profile.profileImageUrl,
        lastLoginAt: new Date(),
      })
      .returning();
    const [account] = await tx
      .insert(accounts)
      .values({
        code: accountCode,
        name: state.accountName!,
        ownerUserId: user.id,
        businessNumberHash: businessHash,
        businessNumberLast4: normalizedBusinessNumber.slice(-4),
      })
      .returning();
    const [member] = await tx
      .insert(accountMembers)
      .values({
        accountId: account.id,
        userId: user.id,
        type: "MAIN",
        role: "OWNER",
        authMethod: "SSO_ONLY",
        ssoProvider: providerName(profile.provider),
        permissions: ["*"],
      })
      .returning();
    await tx.insert(oauthIdentities).values({
      userId: user.id,
      provider: providerName(profile.provider),
      providerSubject: profile.subject,
      emailSnapshot: profile.email,
    });
    return { user, account, member };
  });
  return startSession({
    userId: created.user.id,
    accountId: created.account.id,
    memberId: created.member.id,
    memberType: "MAIN",
    role: "OWNER",
  });
}

async function linkOAuth(profile: OAuthProfile, state: OAuthStateRecord) {
  if (!state.userId || !state.memberId || !state.sessionId) {
    throw new AppError(400, "OAUTH_LINK_INVALID", "SSO 연결 정보가 없습니다.");
  }
  if (!(await sessionExists(state.sessionId))) {
    throw new AppError(401, "SESSION_EXPIRED", "SSO 연결 세션이 만료되었습니다.");
  }
  const db = getDb();
  const provider = providerName(profile.provider);
  const [occupied] = await db
    .select({ userId: oauthIdentities.userId })
    .from(oauthIdentities)
    .where(and(eq(oauthIdentities.provider, provider), eq(oauthIdentities.providerSubject, profile.subject)))
    .limit(1);
  if (occupied && occupied.userId !== state.userId) {
    throw new AppError(409, "OAUTH_IDENTITY_IN_USE", "다른 사용자에게 연결된 SSO 계정입니다.");
  }

  await db.transaction(async (tx) => {
    if (!occupied) {
      await tx.insert(oauthIdentities).values({
        userId: state.userId!,
        provider,
        providerSubject: profile.subject,
        emailSnapshot: profile.email,
      });
    }
    await tx
      .update(accountMembers)
      .set({ authMethod: "BOTH", ssoProvider: provider, updatedAt: new Date() })
      .where(and(eq(accountMembers.id, state.memberId!), eq(accountMembers.userId, state.userId!)));
  });
  const [membership] = await db
    .select({
      userId: accountMembers.userId,
      accountId: accountMembers.accountId,
      memberId: accountMembers.id,
      memberType: accountMembers.type,
      role: accountMembers.role,
    })
    .from(accountMembers)
    .where(
      and(
        eq(accountMembers.id, state.memberId),
        eq(accountMembers.userId, state.userId),
        eq(accountMembers.status, "ACTIVE"),
      ),
    )
    .limit(1);
  if (!membership) throw new AppError(403, "MEMBERSHIP_INACTIVE", "활성화된 계정 소속 정보가 없습니다.");
  return membership;
}

async function acceptInvitation(profile: OAuthProfile, state: OAuthStateRecord) {
  if (!state.invitationId) throw new AppError(400, "INVITATION_INVALID", "초대 정보가 없습니다.");
  const db = getDb();
  const provider = providerName(profile.provider);
  const [invitation] = await db
    .select({
      id: accountInvitations.id,
      email: accountInvitations.email,
      accountId: accountInvitations.accountId,
      memberId: accountInvitations.memberId,
      userId: accountMembers.userId,
      role: accountMembers.role,
    })
    .from(accountInvitations)
    .innerJoin(accountMembers, eq(accountMembers.id, accountInvitations.memberId))
    .where(
      and(
        eq(accountInvitations.id, state.invitationId),
        eq(accountInvitations.provider, provider),
        isNull(accountInvitations.acceptedAt),
        isNull(accountInvitations.revokedAt),
        gt(accountInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!invitation) throw new AppError(410, "INVITATION_EXPIRED", "초대가 만료되었거나 취소되었습니다.");
  if (!profile.emailVerified || profile.email?.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new AppError(403, "INVITATION_EMAIL_MISMATCH", "초대받은 이메일과 SSO 이메일이 일치하지 않습니다.");
  }

  const [occupied] = await db
    .select({ userId: oauthIdentities.userId })
    .from(oauthIdentities)
    .where(and(eq(oauthIdentities.provider, provider), eq(oauthIdentities.providerSubject, profile.subject)))
    .limit(1);
  if (occupied && occupied.userId !== invitation.userId) {
    throw new AppError(409, "OAUTH_IDENTITY_IN_USE", "다른 사용자에게 연결된 SSO 계정입니다.");
  }

  await db.transaction(async (tx) => {
    if (!occupied) {
      await tx.insert(oauthIdentities).values({
        userId: invitation.userId,
        provider,
        providerSubject: profile.subject,
        emailSnapshot: profile.email,
      });
    }
    await tx
      .update(users)
      .set({
        emailVerified: true,
        name: profile.name,
        profileImageUrl: profile.profileImageUrl,
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, invitation.userId));
    await tx
      .update(accountMembers)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(eq(accountMembers.id, invitation.memberId));
    await tx
      .update(accountInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(accountInvitations.id, invitation.id));
  });
  return startSession({
    userId: invitation.userId,
    accountId: invitation.accountId,
    memberId: invitation.memberId,
    memberType: "SUB",
    role: invitation.role,
  });
}

export async function completeOAuth(profile: OAuthProfile, state: OAuthStateRecord) {
  if (!profile.subject || profile.subject === "undefined") {
    throw new AppError(401, "OAUTH_PROFILE_INVALID", "OAuth 사용자 식별자가 없습니다.");
  }
  if (state.action === "MAIN_SIGNUP") {
    return { kind: "AUTHENTICATED" as const, ...(await createMainFromOAuth(profile, state)) };
  }
  if (state.action === "INVITE") {
    return { kind: "AUTHENTICATED" as const, ...(await acceptInvitation(profile, state)) };
  }
  if (state.action === "LINK") {
    const membership = await linkOAuth(profile, state);
    return { kind: "AUTHENTICATED" as const, ...(await startSession(membership)) };
  }
  if (state.action === "LOGIN") {
    const membership = await findAnyOAuthMembership(profile);
    if (membership) {
      await getDb()
        .update(users)
        .set({ lastLoginAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, membership.userId));
      return { kind: "AUTHENTICATED" as const, ...(await startSession(membership)) };
    }
    const userId = await ensureOnboardingUser(profile);
    const [request] = await getDb()
      .select({ status: membershipRequests.status })
      .from(membershipRequests)
      .where(eq(membershipRequests.userId, userId))
      .orderBy(desc(membershipRequests.requestedAt))
      .limit(1);
    return {
      kind: "ONBOARDING" as const,
      userId,
      requestStatus: request?.status ?? null,
    };
  }
  const membership = await findOAuthMembership(
    profile,
    state.action === "MAIN_LOGIN" ? "MAIN" : "SUB",
    state.accountCode,
  );
  await getDb().update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, membership.userId));
  return { kind: "AUTHENTICATED" as const, ...(await startSession(membership)) };
}

function normalizeBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{10}$/.test(digits)) {
    throw new AppError(400, "INVALID_BUSINESS_NUMBER", "사업자등록번호 형식이 올바르지 않습니다.");
  }
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const numbers = [...digits].map(Number);
  const sum = weights.reduce((total, weight, index) => total + weight * numbers[index], 0)
    + Math.floor((numbers[8] * 5) / 10);
  if ((10 - (sum % 10)) % 10 !== numbers[9]) {
    throw new AppError(400, "INVALID_BUSINESS_NUMBER", "유효하지 않은 사업자등록번호입니다.");
  }
  return digits;
}

function businessNumberHash(value: string) {
  return createHmac("sha256", getEnv().JWT_REFRESH_SECRET)
    .update(normalizeBusinessNumber(value))
    .digest("hex");
}

export async function getOnboardingStatus(userId: string) {
  const [user] = await getDb()
    .select({ id: users.id, email: users.email, name: users.name, phone: users.phone, phoneVerifiedAt: users.phoneVerifiedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  const [request] = await getDb()
    .select({ id: membershipRequests.id, status: membershipRequests.status })
    .from(membershipRequests)
    .where(eq(membershipRequests.userId, userId))
    .orderBy(desc(membershipRequests.requestedAt))
    .limit(1);
  return { ...user, membershipRequest: request ?? null };
}

export async function requestMembership(userId: string, name: string, accountCode: string, rawPhone?: string, verificationToken?: string) {
  const db = getDb();
  const [currentUser] = await db.select({ phone: users.phone }).from(users).where(eq(users.id, userId)).limit(1);
  if (!currentUser) throw new AppError(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  const phone = currentUser.phone ?? (rawPhone && verificationToken
    ? await consumePhoneVerification(verificationToken, rawPhone, "SSO_SIGNUP")
    : null);
  if (!phone) throw new AppError(400, "PHONE_VERIFICATION_REQUIRED", "SSO에서 휴대폰번호를 제공하지 않아 SMS 인증이 필요합니다.");
  const [account] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.code, normalizeAccountCode(accountCode)), eq(accounts.active, true)))
    .limit(1);
  if (!account) throw new AppError(404, "MAIN_ACCOUNT_NOT_FOUND", "신청할 메인계정을 찾을 수 없습니다.");
  const [occupied] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
  if (occupied && occupied.id !== userId) throw new AppError(409, "PHONE_EXISTS", "이미 가입된 휴대폰번호입니다.");

  await db.transaction(async (tx) => {
    await tx.update(users).set({ name: name.trim(), phone, phoneVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
    await tx
      .update(membershipRequests)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(
        and(
          eq(membershipRequests.userId, userId),
          or(
            eq(membershipRequests.status, "PENDING"),
            eq(membershipRequests.status, "UNMATCHED"),
          ),
        ),
      );
    await tx.insert(membershipRequests).values({
      userId,
      accountId: account.id,
      businessNumberHash: null,
      status: "PENDING",
    });
  });
  return { status: "PENDING" as const, message: "소속 승인 요청이 접수되었습니다." };
}

export async function registerSubAccountRequest(input: {
  mainAccountCode: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  phoneVerificationToken: string;
}) {
  const db = getDb();
  const phone = await consumePhoneVerification(input.phoneVerificationToken, input.phone, "SUB_SIGNUP");
  const email = input.email.trim().toLowerCase();
  const [account] = await db.select({ id: accounts.id }).from(accounts)
    .where(and(eq(accounts.code, normalizeAccountCode(input.mainAccountCode)), eq(accounts.active, true))).limit(1);
  if (!account) throw new AppError(404, "MAIN_ACCOUNT_NOT_FOUND", "신청할 메인계정을 찾을 수 없습니다.");
  const [sameEmail, samePhone] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1),
    db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1),
  ]);
  if (sameEmail.length) throw new AppError(409, "EMAIL_EXISTS", "이미 가입된 이메일입니다.");
  if (samePhone.length) throw new AppError(409, "PHONE_EXISTS", "이미 가입된 휴대폰번호입니다.");
  const passwordHash = await hashPassword(input.password);
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      email, name: input.name.trim(), phone, phoneVerifiedAt: new Date(),
    }).returning();
    const [request] = await tx.insert(membershipRequests).values({
      userId: user.id,
      accountId: account.id,
      businessNumberHash: null,
      requestedLoginId: email,
      pendingPasswordHash: passwordHash,
      status: "PENDING",
    }).returning({ id: membershipRequests.id, status: membershipRequests.status });
    return request;
  });
}

export async function createMainForOnboarding(userId: string, input: {
  name: string;
  accountCode: string;
  accountName: string;
  businessRegistrationNumber: string;
  phone?: string;
  phoneVerificationToken?: string;
}) {
  const db = getDb();
  const [user] = await db.select({ id: users.id, phone: users.phone }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  const phone = user.phone ?? (input.phone && input.phoneVerificationToken
    ? await consumePhoneVerification(input.phoneVerificationToken, input.phone, "SSO_SIGNUP") : null);
  if (!phone) throw new AppError(400, "PHONE_VERIFICATION_REQUIRED", "SMS 휴대폰 인증이 필요합니다.");
  const accountCode = normalizeAccountCode(input.accountCode);
  const businessNumber = normalizeBusinessNumber(input.businessRegistrationNumber);
  const businessHash = businessNumberHash(businessNumber);
  const [sameCode, sameBusiness] = await Promise.all([
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.code, accountCode)).limit(1),
    db.select({ id: accounts.id }).from(accounts).where(eq(accounts.businessNumberHash, businessHash)).limit(1),
  ]);
  if (sameCode.length) throw new AppError(409, "ACCOUNT_CODE_EXISTS", "이미 사용 중인 고객사 코드입니다.");
  if (sameBusiness.length) throw new AppError(409, "BUSINESS_NUMBER_EXISTS", "이미 등록된 사업자등록번호입니다.");
  const created = await db.transaction(async (tx) => {
    await tx.update(users).set({ name: input.name.trim(), phone, phoneVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
    const [account] = await tx.insert(accounts).values({
      code: accountCode, name: input.accountName.trim(), ownerUserId: userId,
      businessNumberHash: businessHash, businessNumberLast4: businessNumber.slice(-4),
    }).returning();
    const [identity] = await tx.select({ provider: oauthIdentities.provider }).from(oauthIdentities).where(eq(oauthIdentities.userId, userId)).limit(1);
    const [member] = await tx.insert(accountMembers).values({
      accountId: account.id, userId, type: "MAIN", role: "OWNER", authMethod: "SSO_ONLY",
      ssoProvider: identity?.provider ?? null, permissions: ["*"],
    }).returning();
    return { account, member };
  });
  const session = await startSession({ userId, accountId: created.account.id, memberId: created.member.id, memberType: "MAIN", role: "OWNER" });
  return { ...session, accountCode };
}

function assertOwner(actor: AuthContext) {
  if (actor.memberType !== "MAIN" || actor.role !== "OWNER") {
    throw new AppError(403, "OWNER_REQUIRED", "고객사 메인 계정 권한이 필요합니다.");
  }
}

export async function listMembershipRequests(actor: AuthContext) {
  assertOwner(actor);
  return getDb()
    .select({
      id: membershipRequests.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      status: membershipRequests.status,
      requestedAt: membershipRequests.requestedAt,
    })
    .from(membershipRequests)
    .innerJoin(users, eq(users.id, membershipRequests.userId))
    .where(
      and(
        eq(membershipRequests.accountId, actor.accountId),
        eq(membershipRequests.status, "PENDING"),
      ),
    )
    .orderBy(desc(membershipRequests.requestedAt));
}

export async function approveMembershipRequest(actor: AuthContext, requestId: string) {
  assertOwner(actor);
  const db = getDb();
  const [request] = await db
    .select({
      id: membershipRequests.id,
      userId: membershipRequests.userId,
      provider: oauthIdentities.provider,
      requestedLoginId: membershipRequests.requestedLoginId,
      pendingPasswordHash: membershipRequests.pendingPasswordHash,
      memberLimit: accounts.memberLimit,
    })
    .from(membershipRequests)
    .innerJoin(accounts, eq(accounts.id, membershipRequests.accountId))
    .leftJoin(oauthIdentities, eq(oauthIdentities.userId, membershipRequests.userId))
    .where(
      and(
        eq(membershipRequests.id, requestId),
        eq(membershipRequests.accountId, actor.accountId),
        eq(membershipRequests.status, "PENDING"),
      ),
    )
    .limit(1);
  if (!request) throw new AppError(404, "MEMBERSHIP_REQUEST_NOT_FOUND", "승인 요청을 찾을 수 없습니다.");
  const [memberCount] = await db
    .select({ value: count() })
    .from(accountMembers)
    .where(eq(accountMembers.accountId, actor.accountId));
  if (Number(memberCount.value) >= request.memberLimit) {
    throw new AppError(409, "MEMBER_LIMIT_EXCEEDED", "고객사 계정 수 한도를 초과했습니다.");
  }
  const [existing] = await db
    .select({ id: accountMembers.id })
    .from(accountMembers)
    .where(
      and(
        eq(accountMembers.accountId, actor.accountId),
        eq(accountMembers.userId, request.userId),
      ),
    )
    .limit(1);
  if (existing) throw new AppError(409, "MEMBERSHIP_EXISTS", "이미 고객사에 소속된 사용자입니다.");

  return db.transaction(async (tx) => {
    const [member] = await tx
      .insert(accountMembers)
      .values({
        accountId: actor.accountId,
        userId: request.userId,
        type: "SUB",
        role: "MEMBER",
        authMethod: request.provider ? "SSO_ONLY" : "LOCAL_ONLY",
        ssoProvider: request.provider ?? null,
        status: "ACTIVE",
        createdByUserId: actor.userId,
      })
      .returning();
    if (request.requestedLoginId && request.pendingPasswordHash) {
      await tx.insert(localCredentials).values({
        memberId: member.id,
        accountId: actor.accountId,
        loginId: request.requestedLoginId,
        passwordHash: request.pendingPasswordHash,
      });
    }
    await tx
      .update(membershipRequests)
      .set({
        status: "APPROVED",
        reviewedByMemberId: actor.memberId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(membershipRequests.id, request.id));
    return member;
  });
}

export async function rejectMembershipRequest(
  actor: AuthContext,
  requestId: string,
  reason?: string,
) {
  assertOwner(actor);
  const [updated] = await getDb()
    .update(membershipRequests)
    .set({
      status: "REJECTED",
      reviewedByMemberId: actor.memberId,
      rejectionReason: reason?.trim() || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(membershipRequests.id, requestId),
        eq(membershipRequests.accountId, actor.accountId),
        eq(membershipRequests.status, "PENDING"),
      ),
    )
    .returning();
  if (!updated) throw new AppError(404, "MEMBERSHIP_REQUEST_NOT_FOUND", "승인 요청을 찾을 수 없습니다.");
  return updated;
}

export async function createSubAccount(
  actor: AuthContext,
  input: {
    loginId?: string;
    password?: string;
    name: string;
    email: string;
    role: Exclude<MemberRole, "OWNER">;
    permissions: string[];
    authMethod: AuthMethod;
    provider?: "GOOGLE" | "KAKAO" | "NAVER";
  },
) {
  if (actor.memberType !== "MAIN" || actor.role !== "OWNER") {
    throw new AppError(403, "SUB_ACCOUNT_FORBIDDEN", "서브계정을 생성할 권한이 없습니다.");
  }
  const needsLocal = input.authMethod !== "SSO_ONLY";
  const needsSso = input.authMethod !== "LOCAL_ONLY";
  if (needsLocal && (!input.loginId || !input.password)) {
    throw new AppError(400, "LOCAL_CREDENTIAL_REQUIRED", "자체 로그인 ID와 비밀번호가 필요합니다.");
  }
  if (needsSso && !input.provider) {
    throw new AppError(400, "SSO_PROVIDER_REQUIRED", "SSO 제공자를 지정해야 합니다.");
  }

  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const loginId = input.loginId?.trim().toLowerCase();
  if (loginId) {
    const duplicate = await db
      .select({ id: localCredentials.memberId })
      .from(localCredentials)
      .where(and(eq(localCredentials.accountId, actor.accountId), eq(localCredentials.loginId, loginId)))
      .limit(1);
    if (duplicate.length) throw new AppError(409, "LOGIN_ID_EXISTS", "이미 사용 중인 로그인 ID입니다.");
  }

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) {
    const duplicateMember = await db
      .select({ id: accountMembers.id })
      .from(accountMembers)
      .where(and(eq(accountMembers.accountId, actor.accountId), eq(accountMembers.userId, existingUser.id)))
      .limit(1);
    if (duplicateMember.length) throw new AppError(409, "MEMBER_EXISTS", "이미 고객사에 등록된 사용자입니다.");
  }
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const inviteToken = needsSso && input.authMethod === "SSO_ONLY"
    ? randomBytes(32).toString("base64url")
    : null;

  const created = await db.transaction(async (tx) => {
    const user = existingUser ?? (
      await tx
        .insert(users)
        .values({ email, emailVerified: false, name: input.name.trim() })
        .returning()
    )[0];
    const [member] = await tx
      .insert(accountMembers)
      .values({
        accountId: actor.accountId,
        userId: user.id,
        type: "SUB",
        role: input.role,
        authMethod: input.authMethod,
        ssoProvider: input.provider,
        status: inviteToken ? "INVITED" : "ACTIVE",
        permissions: input.permissions,
        createdByUserId: actor.userId,
      })
      .returning();
    if (needsLocal && loginId && passwordHash) {
      await tx.insert(localCredentials).values({
        memberId: member.id,
        accountId: actor.accountId,
        loginId,
        passwordHash,
      });
    }
    let invitationId: string | null = null;
    if (inviteToken && input.provider) {
      const [invitation] = await tx
        .insert(accountInvitations)
        .values({
          accountId: actor.accountId,
          memberId: member.id,
          email,
          provider: input.provider,
          tokenHash: invitationHash(inviteToken),
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
          createdByUserId: actor.userId,
        })
        .returning();
      invitationId = invitation.id;
    }
    return { user, member, invitationId };
  });

  return {
    id: created.member.id,
    userId: created.user.id,
    loginId: loginId ?? null,
    name: created.user.name,
    role: created.member.role,
    authMethod: created.member.authMethod,
    status: created.member.status,
    invitationUrl:
      inviteToken && input.provider
        ? `${getEnv().APP_BASE_URL}/api/auth/invitations/${inviteToken}/oauth/${input.provider.toLowerCase()}/start`
        : null,
  };
}

export async function findInvitationForToken(token: string) {
  const [invitation] = await getDb()
    .select({
      id: accountInvitations.id,
      provider: accountInvitations.provider,
      accountId: accountInvitations.accountId,
      memberId: accountInvitations.memberId,
    })
    .from(accountInvitations)
    .where(
      and(
        eq(accountInvitations.tokenHash, invitationHash(token)),
        isNull(accountInvitations.acceptedAt),
        isNull(accountInvitations.revokedAt),
        gt(accountInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!invitation) throw new AppError(410, "INVITATION_EXPIRED", "초대가 만료되었거나 취소되었습니다.");
  return invitation;
}

export async function listSubAccounts(actor: AuthContext) {
  if (actor.memberType !== "MAIN" || actor.role !== "OWNER") {
    throw new AppError(403, "SUB_ACCOUNT_FORBIDDEN", "서브계정을 조회할 권한이 없습니다.");
  }
  return getDb()
    .select({
      id: accountMembers.id,
      userId: users.id,
      loginId: localCredentials.loginId,
      name: users.name,
      email: users.email,
      role: accountMembers.role,
      authMethod: accountMembers.authMethod,
      ssoProvider: accountMembers.ssoProvider,
      status: accountMembers.status,
      permissions: accountMembers.permissions,
      createdAt: accountMembers.createdAt,
    })
    .from(accountMembers)
    .innerJoin(users, eq(users.id, accountMembers.userId))
    .leftJoin(localCredentials, eq(localCredentials.memberId, accountMembers.id))
    .where(and(eq(accountMembers.accountId, actor.accountId), eq(accountMembers.type, "SUB")));
}

export async function updateSubAccount(
  actor: AuthContext,
  memberId: string,
  input: {
    role?: "ADMIN" | "MEMBER";
    permissions?: string[];
    status?: "ACTIVE" | "DISABLED";
  },
) {
  if (actor.memberType !== "MAIN" || actor.role !== "OWNER") {
    throw new AppError(403, "SUB_ACCOUNT_FORBIDDEN", "서브계정을 수정할 권한이 없습니다.");
  }
  const [updated] = await getDb()
    .update(accountMembers)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(accountMembers.id, memberId),
        eq(accountMembers.accountId, actor.accountId),
        eq(accountMembers.type, "SUB"),
      ),
    )
    .returning();
  if (!updated) throw new AppError(404, "SUB_ACCOUNT_NOT_FOUND", "서브계정을 찾을 수 없습니다.");
  if (input.status === "DISABLED") await revokeMemberSessions(memberId);
  return updated;
}

export async function disableSubAccount(actor: AuthContext, memberId: string) {
  return updateSubAccount(actor, memberId, { status: "DISABLED" });
}
