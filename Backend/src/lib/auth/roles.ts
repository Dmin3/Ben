import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, accounts, accountMembers } from "@/db/schema";
import { AppError } from "@/lib/http";
import type { AuthContext } from "./types";
export type AccountRole = "SUPER_ADMIN" | "ADMIN" | "MAIN" | "SUB";
export function effectiveRole(systemRole: string, memberType: string): AccountRole {
 if (systemRole === "SUPER_ADMIN") return "SUPER_ADMIN";
 if (systemRole === "BEN_ADMIN") return "ADMIN";
 return memberType === "MAIN" ? "MAIN" : "SUB";
}
export async function currentRole(auth: AuthContext) {
 const [row] = await getDb().select({ systemRole: users.systemRole, memberType: accountMembers.type, role: accountMembers.role })
 .from(users).innerJoin(accountMembers, eq(users.id, accountMembers.userId))
 .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
 .where(and(eq(users.id, auth.userId),eq(users.status,"ACTIVE"),eq(accountMembers.id,auth.memberId),
 eq(accountMembers.accountId,auth.accountId),eq(accountMembers.status,"ACTIVE"),eq(accounts.active,true))).limit(1);
 if (!row) throw new AppError(403,"ACCOUNT_DISABLED","활성 계정이 아닙니다.");
 return { ...row, accountRole: effectiveRole(row.systemRole,row.memberType) };
}

