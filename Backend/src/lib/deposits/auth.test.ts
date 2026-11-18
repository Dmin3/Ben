import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), rows: vi.fn() }));
vi.mock("@/lib/auth/request-auth", () => ({ requireAuth: mocks.auth }));
vi.mock("@/db/client", () => ({
 getDb: () => ({ select: () => {
  const chain = { from: () => chain, innerJoin: () => chain, where: () => chain, limit: mocks.rows };
  return chain;
 } }),
}));
import { depositAuth } from "./auth";
beforeEach(() => {
 mocks.auth.mockResolvedValue({ userId:"u", accountId:"a", memberId:"m", memberType:"SUB", role:"MEMBER" });
 mocks.rows.mockResolvedValue([{ systemRole:"USER" }]);
});
it("permits sub-account reads but rejects admin writes", async () => {
 const req = new NextRequest("http://localhost/api/deposit");
 expect((await depositAuth(req)).memberType).toBe("SUB");
 await expect(depositAuth(req,true)).rejects.toMatchObject({status:403});
});
it("does not confuse customer OWNER with BEN_ADMIN", async () => {
 mocks.auth.mockResolvedValue({ userId:"u", accountId:"a", memberId:"m", memberType:"MAIN", role:"OWNER" });
 await expect(depositAuth(new NextRequest("http://localhost"),true)).rejects.toMatchObject({status:403});
 mocks.rows.mockResolvedValue([{systemRole:"BEN_ADMIN"}]);
 expect((await depositAuth(new NextRequest("http://localhost"),true)).userId).toBe("u");
});
it("rejects inactive or missing memberships even with valid JWT", async () => {
 mocks.rows.mockResolvedValue([]);
 await expect(depositAuth(new NextRequest("http://localhost"))).rejects.toMatchObject({status:403});
});
