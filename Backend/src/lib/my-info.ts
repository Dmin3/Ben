import { and, asc, count, desc, eq } from "drizzle-orm";

import {
  accountAddresses,
  accountContacts,
  accountManagerAssignments,
  accountMembers,
  accounts,
  benStaffProfiles,
  localCredentials,
  oauthIdentities,
  users,
} from "@/db/schema";
import { getDb } from "@/db/client";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { revokeMemberSessions } from "@/lib/auth/session-store";
import type { AuthContext } from "@/lib/auth/types";
import { AppError } from "@/lib/http";

type CompanyUpdate = {
  name?: string;
  nameEn?: string | null;
  ceoName?: string | null;
  businessType?: string | null;
  address?: string | null;
};

type ContactInput = { name: string; title: string; phone: string; email: string };
type AddressInput = { name: string; address: string; recipient: string; phone: string };

function assertCompanyOwner(actor: AuthContext) {
  if (actor.memberType !== "MAIN" || actor.role !== "OWNER") {
    throw new AppError(403, "OWNER_REQUIRED", "고객사 메인 계정만 수정할 수 있습니다.");
  }
}

function maskBusinessNumber(last4: string | null) {
  return last4 ? `***-**-*${last4}` : null;
}

async function requireActiveMember(actor: AuthContext) {
  const [member] = await getDb()
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      profileImageUrl: users.profileImageUrl,
      userStatus: users.status,
      accountId: accounts.id,
      accountCode: accounts.code,
      accountName: accounts.name,
      customerNo: accounts.customerNo,
      nameEn: accounts.nameEn,
      ceoName: accounts.ceoName,
      businessType: accounts.businessType,
      address: accounts.address,
      businessNumberLast4: accounts.businessNumberLast4,
      accountActive: accounts.active,
      memberId: accountMembers.id,
      memberType: accountMembers.type,
      role: accountMembers.role,
      authMethod: accountMembers.authMethod,
      memberStatus: accountMembers.status,
      joinedAt: accountMembers.createdAt,
    })
    .from(accountMembers)
    .innerJoin(users, eq(users.id, accountMembers.userId))
    .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
    .where(and(eq(accountMembers.id, actor.memberId), eq(accountMembers.accountId, actor.accountId)))
    .limit(1);

  if (!member) throw new AppError(404, "MEMBER_NOT_FOUND", "회원 정보를 찾을 수 없습니다.");
  if (member.userStatus !== "ACTIVE" || member.memberStatus !== "ACTIVE" || !member.accountActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "비활성화된 계정입니다.");
  }
  return member;
}

export async function getMyInfo(actor: AuthContext) {
  const db = getDb();
  const member = await requireActiveMember(actor);
  const [contactRows, addresses, credentials, identities, assignments] = await Promise.all([
    db.select().from(accountContacts).where(eq(accountContacts.accountId, actor.accountId)).limit(1),
    db
      .select({
        id: accountAddresses.id,
        name: accountAddresses.name,
        address: accountAddresses.address,
        recipient: accountAddresses.recipient,
        phone: accountAddresses.phone,
        isDefault: accountAddresses.isDefault,
      })
      .from(accountAddresses)
      .where(eq(accountAddresses.accountId, actor.accountId))
      .orderBy(desc(accountAddresses.isDefault), asc(accountAddresses.createdAt)),
    db
      .select({ loginId: localCredentials.loginId })
      .from(localCredentials)
      .where(eq(localCredentials.memberId, actor.memberId))
      .limit(1),
    db
      .select({
        provider: oauthIdentities.provider,
        email: oauthIdentities.emailSnapshot,
        linkedAt: oauthIdentities.createdAt,
      })
      .from(oauthIdentities)
      .where(eq(oauthIdentities.userId, actor.userId))
      .orderBy(asc(oauthIdentities.provider)),
    db
      .select({ managerUserId: accountManagerAssignments.managerUserId })
      .from(accountManagerAssignments)
      .where(eq(accountManagerAssignments.accountId, actor.accountId))
      .limit(1),
  ]);

  let benManager = null;
  if (assignments[0]) {
    const [manager] = await db
      .select({
        name: users.name,
        email: users.email,
        title: benStaffProfiles.title,
        phone: benStaffProfiles.phone,
        description: benStaffProfiles.description,
      })
      .from(users)
      .innerJoin(benStaffProfiles, eq(benStaffProfiles.userId, users.id))
      .where(eq(users.id, assignments[0].managerUserId))
      .limit(1);
    benManager = manager ?? null;
  }

  const canManageCompany = member.memberType === "MAIN" && member.role === "OWNER";
  return {
    profile: {
      userId: member.userId,
      name: member.name,
      email: member.email,
      profileImageUrl: member.profileImageUrl,
      companyName: member.accountName,
      customerNo: member.customerNo ?? member.accountCode,
      joinedAt: member.joinedAt,
      memberType: member.memberType,
      role: member.role,
    },
    company: {
      name: member.accountName,
      nameEn: member.nameEn,
      businessNo: maskBusinessNumber(member.businessNumberLast4),
      ceoName: member.ceoName,
      businessType: member.businessType,
      address: member.address,
      certificate: null,
    },
    contact: contactRows[0]
      ? {
          name: contactRows[0].name,
          title: contactRows[0].title,
          phone: contactRows[0].phone,
          email: contactRows[0].email,
        }
      : null,
    addresses,
    benManager,
    account: {
      loginId: credentials[0]?.loginId ?? null,
      authMethod: member.authMethod,
      linkedProviders: identities,
      canChangePassword: Boolean(credentials[0]),
    },
    capabilities: {
      canEditCompany: canManageCompany,
      canEditContact: canManageCompany,
      canManageAddresses: canManageCompany,
      canChangePassword: Boolean(credentials[0]),
    },
  };
}

export async function updateMyCompany(actor: AuthContext, input: CompanyUpdate) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  const [company] = await getDb()
    .update(accounts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(accounts.id, actor.accountId))
    .returning({
      name: accounts.name,
      nameEn: accounts.nameEn,
      ceoName: accounts.ceoName,
      businessType: accounts.businessType,
      address: accounts.address,
    });
  return company;
}

export async function updateMyContact(actor: AuthContext, input: ContactInput) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  const [contact] = await getDb()
    .insert(accountContacts)
    .values({ accountId: actor.accountId, ...input })
    .onConflictDoUpdate({
      target: accountContacts.accountId,
      set: { ...input, updatedAt: new Date() },
    })
    .returning();
  return contact;
}

export async function createMyAddress(actor: AuthContext, input: AddressInput) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  return getDb().transaction(async (tx) => {
    const [total] = await tx
      .select({ value: count() })
      .from(accountAddresses)
      .where(eq(accountAddresses.accountId, actor.accountId));
    if (total.value >= 20) {
      throw new AppError(409, "ADDRESS_LIMIT_EXCEEDED", "배송지는 최대 20개까지 등록할 수 있습니다.");
    }
    const [address] = await tx
      .insert(accountAddresses)
      .values({ accountId: actor.accountId, ...input, isDefault: total.value === 0 })
      .returning();
    return address;
  });
}

export async function updateMyAddress(actor: AuthContext, addressId: string, input: Partial<AddressInput>) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  const [address] = await getDb()
    .update(accountAddresses)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(accountAddresses.id, addressId), eq(accountAddresses.accountId, actor.accountId)))
    .returning();
  if (!address) throw new AppError(404, "ADDRESS_NOT_FOUND", "배송지를 찾을 수 없습니다.");
  return address;
}

export async function setMyDefaultAddress(actor: AuthContext, addressId: string) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  return getDb().transaction(async (tx) => {
    const [target] = await tx
      .select({ id: accountAddresses.id })
      .from(accountAddresses)
      .where(and(eq(accountAddresses.id, addressId), eq(accountAddresses.accountId, actor.accountId)))
      .limit(1);
    if (!target) throw new AppError(404, "ADDRESS_NOT_FOUND", "배송지를 찾을 수 없습니다.");
    await tx
      .update(accountAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(accountAddresses.accountId, actor.accountId), eq(accountAddresses.isDefault, true)));
    const [address] = await tx
      .update(accountAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(accountAddresses.id, addressId))
      .returning();
    return address;
  });
}

export async function deleteMyAddress(actor: AuthContext, addressId: string) {
  assertCompanyOwner(actor);
  await requireActiveMember(actor);
  const [address] = await getDb()
    .select({ isDefault: accountAddresses.isDefault })
    .from(accountAddresses)
    .where(and(eq(accountAddresses.id, addressId), eq(accountAddresses.accountId, actor.accountId)))
    .limit(1);
  if (!address) throw new AppError(404, "ADDRESS_NOT_FOUND", "배송지를 찾을 수 없습니다.");
  if (address.isDefault) {
    throw new AppError(409, "DEFAULT_ADDRESS_DELETE_FORBIDDEN", "기본 배송지는 삭제할 수 없습니다.");
  }
  await getDb()
    .delete(accountAddresses)
    .where(and(eq(accountAddresses.id, addressId), eq(accountAddresses.accountId, actor.accountId)));
}

export async function changeMyPassword(actor: AuthContext, currentPassword: string, newPassword: string) {
  await requireActiveMember(actor);
  const [credential] = await getDb()
    .select({ passwordHash: localCredentials.passwordHash })
    .from(localCredentials)
    .where(eq(localCredentials.memberId, actor.memberId))
    .limit(1);
  if (!credential) {
    throw new AppError(409, "LOCAL_LOGIN_NOT_CONFIGURED", "비밀번호 로그인이 설정되지 않은 계정입니다.");
  }
  if (!(await verifyPassword(credential.passwordHash, currentPassword))) {
    throw new AppError(401, "CURRENT_PASSWORD_MISMATCH", "현재 비밀번호가 올바르지 않습니다.");
  }
  if (await verifyPassword(credential.passwordHash, newPassword)) {
    throw new AppError(400, "PASSWORD_UNCHANGED", "현재 비밀번호와 다른 비밀번호를 입력해 주세요.");
  }
  const passwordHash = await hashPassword(newPassword);
  await getDb()
    .update(localCredentials)
    .set({ passwordHash, passwordChangedAt: new Date(), failedAttempts: 0, lockedUntil: null })
    .where(eq(localCredentials.memberId, actor.memberId));
  await revokeMemberSessions(actor.memberId);
  return { success: true, reauthRequired: true };
}
