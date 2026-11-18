import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { users, accounts, depositTransactions } from "@/db/schema";
import { postTransaction, listTransactions, summary } from "./repository";
import { csvCell } from "./csv";
import { transactionInput } from "./schemas";

it("protects CSV formulas and preserves quoted content", () => {
 expect(csvCell("=1+1")).toBe("\"'=1+1\"");
 expect(csvCell('a"b')).toBe('"a""b"');
});
it("rejects excessive precision and zero ledger entries", () => {
 const base = { description: "test", occurredOn: "2026-11-18", requestKey: randomUUID() };
 expect(transactionInput.safeParse({ ...base, amount: "0" }).success).toBe(false);
 expect(transactionInput.safeParse({ ...base, amount: "1.001" }).success).toBe(false);
});
describe.skipIf(process.env.BEN_DEPOSIT_DB_TEST !== "1")("deposit real database", () => {
 let userId: string;
 let accountId: string;
 beforeAll(async () => {
  process.loadEnvFile(".env.local");
  const [u] = await getDb().insert(users).values({ name: "deposit isolated test" }).returning();
  userId = u.id;
  const [a] = await getDb().insert(accounts).values({ code: "test-" + randomUUID(), name: "deposit isolated test", ownerUserId: userId }).returning();
  accountId = a.id;
 });
 afterAll(async () => {
  if (accountId) { await getDb().delete(depositTransactions).where(eq(depositTransactions.accountId, accountId)); await getDb().delete(accounts).where(eq(accounts.id, accountId)); }
  if (userId) await getDb().delete(users).where(eq(users.id, userId));
 });
 it("keeps exact balances, filters without changing running balance, and deduplicates concurrent writes", async () => {
  const input = { amount: "100.10", description: "credit", occurredOn: "2026-11-01", requestKey: randomUUID() };
  const [a,b] = await Promise.all([postTransaction(accountId,userId,input), postTransaction(accountId,userId,input)]);
  expect(a.id).toBe(b.id);
  await postTransaction(accountId,userId,{ amount: "-30.05", description: "debit", occurredOn: "2026-11-02", requestKey: randomUUID() });
  const result = await listTransactions(accountId,{ type: "out", period: "all", page: 1, pageSize: 10 });
  expect(result.items[0].balance).toBe("70.05");
  expect((await summary(accountId)).summary.balance).toBe("70.05");
  expect((await listTransactions(randomUUID(),{ type: "all", period: "all", page: 1, pageSize: 10 })).items).toHaveLength(0);
  await expect(postTransaction(accountId,userId,{...input, amount:"200.00"})).rejects.toMatchObject({status:409});
  await postTransaction(accountId,userId,{ amount:"-100.10",description:"reverse",occurredOn:"2026-11-03",requestKey:randomUUID()},a.id);
  await expect(postTransaction(accountId,userId,{ amount:"-100.10",description:"reverse",occurredOn:"2026-11-03",requestKey:randomUUID()},a.id)).rejects.toMatchObject({status:409});
 });
});
