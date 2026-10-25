import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "WITHDRAWN",
]);
export const memberTypeEnum = pgEnum("member_type", ["MAIN", "SUB"]);
export const memberRoleEnum = pgEnum("member_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);
export const memberStatusEnum = pgEnum("member_status", [
  "ACTIVE",
  "INVITED",
  "DISABLED",
]);
export const oauthProviderEnum = pgEnum("oauth_provider", [
  "GOOGLE",
  "KAKAO",
  "NAVER",
]);
export const authMethodEnum = pgEnum("auth_method", [
  "LOCAL_ONLY",
  "SSO_ONLY",
  "BOTH",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email"),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name").notNull(),
    profileImageUrl: text("profile_image_url"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_unique")
      .on(table.email)
      .where(sql`${table.email} is not null`),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("accounts_owner_user_idx").on(table.ownerUserId)],
);

export const accountMembers = pgTable(
  "account_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: memberTypeEnum("type").notNull(),
    role: memberRoleEnum("role").notNull(),
    authMethod: authMethodEnum("auth_method").notNull().default("LOCAL_ONLY"),
    ssoProvider: oauthProviderEnum("sso_provider"),
    status: memberStatusEnum("status").notNull().default("ACTIVE"),
    permissions: jsonb("permissions")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("account_members_account_user_unique").on(
      table.accountId,
      table.userId,
    ),
    index("account_members_user_idx").on(table.userId),
    uniqueIndex("account_members_one_main_per_account")
      .on(table.accountId)
      .where(sql`${table.type} = 'MAIN'`),
    uniqueIndex("account_members_one_main_per_user")
      .on(table.userId)
      .where(sql`${table.type} = 'MAIN'`),
  ],
);

export const localCredentials = pgTable(
  "local_credentials",
  {
    memberId: uuid("member_id")
      .primaryKey()
      .references(() => accountMembers.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    loginId: text("login_id").notNull(),
    passwordHash: text("password_hash").notNull(),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("local_credentials_account_login_unique").on(
      table.accountId,
      table.loginId,
    ),
  ],
);

export const oauthIdentities = pgTable(
  "oauth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: oauthProviderEnum("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    emailSnapshot: text("email_snapshot"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("oauth_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
    uniqueIndex("oauth_identities_user_provider_unique").on(
      table.userId,
      table.provider,
    ),
  ],
);

export const accountInvitations = pgTable(
  "account_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => accountMembers.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    provider: oauthProviderEnum("provider").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("account_invitations_member_idx").on(table.memberId),
    index("account_invitations_account_idx").on(table.accountId),
  ],
);
