import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/request-auth";
import { currentRole } from "@/lib/auth/roles";
import { readRequestBody } from "@/lib/request-body";
import { AppError, jsonError } from "@/lib/http";
export async function PATCH(req:NextRequest,ctx:{params:Promise<{userId:string}>}) {
 try {
  const auth=await requireAuth(req);
  if((await currentRole(auth)).accountRole!=="SUPER_ADMIN") throw new AppError(403,"SUPER_ADMIN_REQUIRED","최고관리자 권한이 필요합니다.");
  const userId=z.uuid().parse((await ctx.params).userId);
  const body=z.object({systemRole:z.enum(["USER","BEN_ADMIN","SUPER_ADMIN"])}).parse(await readRequestBody(req));
  const result=await getDb().transaction(async tx=>{
   await tx.execute(sql`select pg_advisory_xact_lock(76423981)`);
   const [actor]=await tx.select().from(users).where(eq(users.id,auth.userId));
   if(actor?.systemRole!=="SUPER_ADMIN" || actor.status!=="ACTIVE") throw new AppError(403,"SUPER_ADMIN_REQUIRED","최고관리자 권한이 필요합니다.");
   const [target]=await tx.select().from(users).where(eq(users.id,userId));
   if(!target) throw new AppError(404,"USER_NOT_FOUND","사용자가 없습니다.");
   if(target.systemRole==="SUPER_ADMIN" && body.systemRole!=="SUPER_ADMIN") {
    const admins=await tx.select().from(users).where(eq(users.systemRole,"SUPER_ADMIN"));
    if(admins.filter(a=>a.status==="ACTIVE").length<=1) throw new AppError(409,"LAST_SUPER_ADMIN","마지막 최고관리자는 해제할 수 없습니다.");
   }
   const [updated]=await tx.update(users).set({systemRole:body.systemRole,updatedAt:new Date()}).where(eq(users.id,userId)).returning({id:users.id,systemRole:users.systemRole});
   return updated;
  });
  return NextResponse.json(result);
 }catch(e){return jsonError(e);}
}

