import { randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accounts } from "@/db/schema";
import { AppError } from "@/lib/http";
import type { AuthContext } from "./types";
import { currentRole } from "./roles";
export function generateInvitationCode() {
 const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
 return Array.from({length:12},() => chars[randomInt(chars.length)]).join("");
}
export async function getInvitationCode(auth: AuthContext, refresh = false) {
 const role = await currentRole(auth);
 if (role.accountRole !== "MAIN" || role.role !== "OWNER")
  throw new AppError(403,"MAIN_REQUIRED","고객사 메인계정만 초대코드를 관리할 수 있습니다.");
 // Retry the extremely unlikely unique collision in a fresh transaction.
 for(let attempt=0; attempt<5; attempt++) {
  try {
   return await getDb().transaction(async tx => {
    const [account] = await tx.select().from(accounts).where(eq(accounts.id,auth.accountId)).for("update");
    if (!account || account.ownerUserId !== auth.userId) throw new AppError(403,"MAIN_REQUIRED","고객사 소유자가 아닙니다.");
    if (account.invitationCode && !refresh) return { invitationCode: account.invitationCode };
    let code = generateInvitationCode();
    while(code === account.invitationCode) code = generateInvitationCode();
    await tx.update(accounts).set({invitationCode:code,updatedAt:new Date()}).where(eq(accounts.id,auth.accountId));
    return {invitationCode:code};
   });
  } catch(error) {
   const dbError = error as {code?: string; cause?: {code?: string}};
   if(dbError.code !== "23505" && dbError.cause?.code !== "23505") throw error;
  }
 }
 throw new AppError(503,"INVITATION_CODE_RETRY","다시 시도해 주세요.");
}

