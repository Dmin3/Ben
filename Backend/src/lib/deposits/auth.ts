import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db/client";
import { accountMembers, accounts, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/request-auth";
import { AppError } from "@/lib/http";

export async function depositAuth(request: NextRequest, admin = false) {
  const auth = await requireAuth(request);
  const [user] = await getDb().select({ systemRole: users.systemRole }).from(users)
    .innerJoin(accountMembers, eq(accountMembers.userId, users.id))
    .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
    .where(and(eq(users.id, auth.userId), eq(users.status, "ACTIVE"), eq(accountMembers.id, auth.memberId),
      eq(accountMembers.accountId, auth.accountId), eq(accountMembers.status, "ACTIVE"), eq(accounts.active, true))).limit(1);
  if (!user || (admin && (auth.memberType === "SUB" || !["BEN_ADMIN", "SUPER_ADMIN"].includes(user.systemRole))))
    throw new AppError(403, "DEPOSIT_FORBIDDEN", "예치금 처리 권한이 없습니다.");
  return auth;
}
