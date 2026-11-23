import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, accounts, accountMembers, membershipRequests } from "@/db/schema";
import { generateInvitationCode, getInvitationCode } from "./invitation-code";
import { effectiveRole } from "./roles";
import { requestMembership } from "./service";
import type { AuthContext } from "./types";
it("generates 12 uppercase alphanumeric characters",()=>{for(let i=0;i<100;i++)expect(generateInvitationCode()).toMatch(/^[A-Z0-9]{12}$/)});
it("maps only four public roles",()=>{
 expect(effectiveRole("SUPER_ADMIN","MAIN")).toBe("SUPER_ADMIN");
 expect(effectiveRole("BEN_ADMIN","MAIN")).toBe("ADMIN");
 expect(effectiveRole("USER","MAIN")).toBe("MAIN");
 expect(effectiveRole("USER","SUB")).toBe("SUB");
});
describe.skipIf(process.env.BEN_INVITATION_DB_TEST!=="1")("invitation DB integration",()=>{
 let owner:AuthContext, sub:AuthContext;
 let applicant:string;
 const ids:string[]=[];
 beforeAll(async()=>{
  process.loadEnvFile(".env.local");
  const db=getDb();
  const [u]=await db.insert(users).values({name:"invite test owner"}).returning();ids.push(u.id);
  const [a]=await db.insert(accounts).values({code:"test-"+randomUUID(),name:"invite test",ownerUserId:u.id}).returning();
  const [m]=await db.insert(accountMembers).values({accountId:a.id,userId:u.id,type:"MAIN",role:"OWNER"}).returning();
  owner={userId:u.id,accountId:a.id,memberId:m.id,memberType:"MAIN",role:"OWNER",sessionId:randomUUID()};
  const [v]=await db.insert(users).values({name:"invite test sub"}).returning();ids.push(v.id);
  const [n]=await db.insert(accountMembers).values({accountId:a.id,userId:v.id,type:"SUB",role:"MEMBER"}).returning();
  sub={...owner,userId:v.id,memberId:n.id,memberType:"SUB",role:"MEMBER"};
  const [p]=await db.insert(users).values({name:"invite applicant",phone:"019"+String(Date.now()).slice(-8)}).returning();ids.push(p.id);applicant=p.id;
 });
 afterAll(async()=>{
  if(owner){await getDb().delete(membershipRequests).where(eq(membershipRequests.accountId,owner.accountId));await getDb().delete(accountMembers).where(eq(accountMembers.accountId,owner.accountId));await getDb().delete(accounts).where(eq(accounts.id,owner.accountId));}
  for(const id of ids)await getDb().delete(users).where(eq(users.id,id));
 });
 it("owner alone can view/rotate; old code invalid; pending request survives",async()=>{
  const first=await getInvitationCode(owner);
  expect((await getInvitationCode(owner)).invitationCode).toBe(first.invitationCode);
  await expect(getInvitationCode(sub)).rejects.toMatchObject({status:403});
  await expect(getInvitationCode(sub,true)).rejects.toMatchObject({status:403});
  await requestMembership(applicant,"신청자",first.invitationCode);
  const second=await getInvitationCode(owner,true);
  expect(second.invitationCode).not.toBe(first.invitationCode);
  await expect(requestMembership(applicant,"신청자",first.invitationCode)).rejects.toMatchObject({status:404});
  const rows=await getDb().select().from(membershipRequests).where(eq(membershipRequests.userId,applicant));
  expect(rows[0].status).toBe("PENDING");
  expect((await getInvitationCode(owner)).invitationCode).toBe(second.invitationCode);
 });
});

