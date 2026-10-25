import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { accountMembers, accounts, users } from "@/db/schema";
import { getDb } from "@/db/client";
import { requireAuth } from "@/lib/auth/request-auth";
import { AppError, jsonError } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const [profile] = await getDb()
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        profileImageUrl: users.profileImageUrl,
        accountId: accounts.id,
        accountCode: accounts.code,
        accountName: accounts.name,
        memberId: accountMembers.id,
        memberType: accountMembers.type,
        role: accountMembers.role,
        permissions: accountMembers.permissions,
      })
      .from(accountMembers)
      .innerJoin(users, eq(users.id, accountMembers.userId))
      .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
      .where(and(eq(accountMembers.id, auth.memberId), eq(accountMembers.accountId, auth.accountId)))
      .limit(1);
    if (!profile) throw new AppError(404, "MEMBER_NOT_FOUND", "사용자 정보를 찾을 수 없습니다.");
    return NextResponse.json(profile);
  } catch (error) {
    return jsonError(error);
  }
}
