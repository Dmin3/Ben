import {
  boolean,
  numeric,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  primaryKey,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const depositTransactions = pgTable("deposit_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  description: text("description").notNull(),
  occurredOn: date("occurred_on").notNull(),
  orderCode: text("order_code"),
  reversalOf: uuid("reversal_of").unique(),
  requestKey: uuid("request_key").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("deposit_transactions_account_idx").on(t.accountId), uniqueIndex("deposit_request_unique").on(t.accountId, t.requestKey)]);

export const depositSchedules = pgTable("deposit_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  label: text("label").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  dueOn: date("due_on").notNull(),
  status: text("status").notNull().default("PENDING"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
});

export const depositAlerts = pgTable("deposit_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Small manually uploaded PDFs; migrate content to private object storage when configured.
export const depositInvoices = pgTable("deposit_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  fileName: text("file_name").notNull(),
  contentBase64: text("content_base64").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const remittanceAccounts = pgTable("remittance_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bank: text("bank").notNull(),
  swift: text("swift").notNull(),
  account: text("account").notNull(),
  holder: text("holder").notNull(),
  address: text("address").notNull(),
  active: boolean("active").notNull().default(true),
});

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "WITHDRAWN",
]);
export const systemRoleEnum = pgEnum("system_role", ["USER", "BEN_ADMIN"]);
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
export const membershipRequestStatusEnum = pgEnum("membership_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "UNMATCHED",
]);
export const factoryGradeEnum = pgEnum("factory_grade", ["EXCELLENT", "GOOD"]);
export const factoryStatusEnum = pgEnum("factory_status", ["ACTIVE", "INACTIVE"]);
export const accountFactoryStatusEnum = pgEnum("account_factory_status", ["ACTIVE", "ARCHIVED"]);
export const factoryIssueTypeEnum = pgEnum("factory_issue_type", ["DELAY", "DEFECT", "ETC"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email"),
    emailVerified: boolean("email_verified").notNull().default(false),
    phone: text("phone"),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    name: text("name").notNull(),
    profileImageUrl: text("profile_image_url"),
    systemRole: systemRoleEnum("system_role").notNull().default("USER"),
    status: userStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_unique")
      .on(table.email)
      .where(sql`${table.email} is not null`),
    uniqueIndex("users_phone_unique")
      .on(table.phone)
      .where(sql`${table.phone} is not null`),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    customerNo: text("customer_no").unique(),
    nameEn: text("name_en"),
    ceoName: text("ceo_name"),
    businessType: text("business_type"),
    address: text("address"),
    businessNumberHash: text("business_number_hash").unique(),
    businessNumberLast4: text("business_number_last4"),
    memberLimit: integer("member_limit").notNull().default(20),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("accounts_owner_user_idx").on(table.ownerUserId)],
);

export const accountContacts = pgTable("account_contacts", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accountAddresses = pgTable(
  "account_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address").notNull(),
    recipient: text("recipient").notNull(),
    phone: text("phone").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("account_addresses_account_idx").on(table.accountId),
    uniqueIndex("account_addresses_one_default_per_account")
      .on(table.accountId)
      .where(sql`${table.isDefault} = true`),
  ],
);

export const benStaffProfiles = pgTable("ben_staff_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  phone: text("phone"),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accountManagerAssignments = pgTable(
  "account_manager_assignments",
  {
    accountId: uuid("account_id")
      .primaryKey()
      .references(() => accounts.id, { onDelete: "cascade" }),
    managerUserId: uuid("manager_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("account_manager_assignments_manager_idx").on(table.managerUserId)],
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

export const membershipRequests = pgTable(
  "membership_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "cascade",
    }),
    businessNumberHash: text("business_number_hash"),
    requestedLoginId: text("requested_login_id"),
    pendingPasswordHash: text("pending_password_hash"),
    status: membershipRequestStatusEnum("status").notNull().default("PENDING"),
    reviewedByMemberId: uuid("reviewed_by_member_id").references(
      () => accountMembers.id,
      { onDelete: "set null" },
    ),
    rejectionReason: text("rejection_reason"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("membership_requests_user_idx").on(table.userId),
    index("membership_requests_account_status_idx").on(
      table.accountId,
      table.status,
    ),
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

export const factories = pgTable(
  "factories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    legalName: text("legal_name"),
    countryCode: text("country_code").notNull(),
    region: text("region").notNull(),
    address: text("address").notNull(),
    managerName: text("manager_name"),
    primaryCategory: text("primary_category").notNull(),
    grade: factoryGradeEnum("grade").notNull().default("GOOD"),
    status: factoryStatusEnum("status").notNull().default("ACTIVE"),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("factories_status_idx").on(table.status),
    index("factories_name_idx").on(table.name),
  ],
);

export const factoryTags = pgTable(
  "factory_tags",
  {
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factories.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => [primaryKey({ columns: [table.factoryId, table.tag] })],
);

export const accountFactories = pgTable(
  "account_factories",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factories.id, { onDelete: "cascade" }),
    status: accountFactoryStatusEnum("status").notNull().default("ACTIVE"),
    memo: text("memo"),
    firstOrderAt: timestamp("first_order_at", { withTimezone: true }),
    lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.accountId, table.factoryId] }),
    index("account_factories_factory_idx").on(table.factoryId),
    index("account_factories_account_status_idx").on(table.accountId, table.status),
  ],
);

export const factoryMetrics = pgTable(
  "factory_metrics",
  {
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factories.id, { onDelete: "cascade" }),
    deals: integer("deals").notNull().default(0),
    totalAmount: doublePrecision("total_amount").notNull().default(0),
    onTimeRate: doublePrecision("on_time_rate").notNull().default(0),
    defectRate: doublePrecision("defect_rate").notNull().default(0),
    avgLeadDays: integer("avg_lead_days").notNull().default(0),
    yearly: jsonb("yearly")
      .$type<Array<{ year: number; deals: number; amount: number }>>()
      .notNull()
      .default([]),
    categoryShare: jsonb("category_share")
      .$type<Array<{ name: string; deals: number }>>()
      .notNull()
      .default([]),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.factoryId] })],
);

export const factoryIssues = pgTable(
  "factory_issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factories.id, { onDelete: "cascade" }),
    type: factoryIssueTypeEnum("type").notNull(),
    title: text("title").notNull(),
    orderCode: text("order_code"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    resolved: boolean("resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("factory_issues_account_factory_idx").on(table.accountId, table.factoryId)],
);

export const factoryFiles = pgTable(
  "factory_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    factoryId: uuid("factory_id")
      .notNull()
      .references(() => factories.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").references(() => accounts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    objectKey: text("object_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("factory_files_factory_idx").on(table.factoryId),
    index("factory_files_account_idx").on(table.accountId),
  ],
);
