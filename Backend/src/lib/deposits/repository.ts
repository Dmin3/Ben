import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { accounts, depositTransactions as ledger, depositSchedules, depositAlerts, depositInvoices, remittanceAccounts } from "@/db/schema";
import { AppError } from "@/lib/http";
import { listQuery, transactionInput } from "./schemas";
import type { z } from "zod";

export async function assertAccount(id: string) {
  const [account] = await getDb().select({ id: accounts.id }).from(accounts).where(and(eq(accounts.id, id), eq(accounts.active, true))).limit(1);
  if (!account) throw new AppError(404, "ACCOUNT_NOT_FOUND", "고객사를 찾을 수 없습니다.");
}

export async function summary(accountId: string) {
  const db = getDb();
  const [totals] = await db.select({
    balance: sql<string>`coalesce(sum(${ledger.amount}),0)::text`,
    totalCharged: sql<string>`coalesce(sum(case when ${ledger.amount}>0 then ${ledger.amount} else 0 end),0)::text`,
    totalUsed: sql<string>`coalesce(sum(case when ${ledger.amount}<0 then -${ledger.amount} else 0 end),0)::text`,
    asOf: sql<string | null>`max(${ledger.createdAt})::text`,
  }).from(ledger).where(eq(ledger.accountId, accountId));
  const [next] = await db.select({ id: depositSchedules.id, label: depositSchedules.label, date: depositSchedules.dueOn, amount: depositSchedules.amount })
    .from(depositSchedules).where(and(eq(depositSchedules.accountId, accountId), eq(depositSchedules.status, "PENDING")))
    .orderBy(asc(depositSchedules.dueOn), asc(depositSchedules.id)).limit(1);
  const alerts = await listAlerts(accountId, 1, 3);
  const methods = await db.select().from(remittanceAccounts).where(eq(remittanceAccounts.active, true)).orderBy(asc(remittanceAccounts.id));
  const invoices = await db.select({ id: depositInvoices.id, fileName: depositInvoices.fileName, createdAt: depositInvoices.createdAt })
    .from(depositInvoices).where(eq(depositInvoices.accountId, accountId)).orderBy(desc(depositInvoices.createdAt));
  return { summary: { ...totals, currency: "CNY", next: next ?? null }, alerts, remittanceAccounts: methods, invoices,
    capabilities: { canRead: true, canDownload: true, canWrite: false } };
}

export async function listTransactions(accountId: string, query: z.infer<typeof listQuery>, exporting = false) {
  // Window calculation precedes all filters so each row keeps its actual historical balance.
  const months = { "3m": 3, "6m": 6, "1y": 12, all: 0 }[query.period];
  const rows = await getDb().execute(sql`
    WITH history AS (
      SELECT id, occurred_on AS date, description, order_code AS "orderId", amount,
        CASE WHEN amount > 0 THEN 'in' ELSE 'out' END AS type,
        sum(amount) OVER (ORDER BY occurred_on, created_at, id)::text AS balance,
        reversal_of AS "reversalOf", created_at
      FROM deposit_transactions WHERE account_id = ${accountId}
    )
    SELECT id, date, description, "orderId", amount::text, type, balance, "reversalOf",
      count(*) OVER()::int AS total
    FROM history WHERE
      (${query.type} = 'all' OR type = ${query.type})
      AND (${months} = 0 OR date >= (CURRENT_DATE - ${months} * INTERVAL '1 month')::date)
    ORDER BY date DESC, created_at DESC, id DESC
    LIMIT ${exporting ? 10001 : query.pageSize} OFFSET ${exporting ? 0 : (query.page - 1) * query.pageSize}
  `);
  if (exporting && rows.length > 10000) throw new AppError(400, "EXPORT_TOO_LARGE", "기간을 줄여 10,000건 이하로 다운로드해 주세요.");
  const totalRows = await getDb().execute(sql`SELECT count(*)::int AS total FROM deposit_transactions
    WHERE account_id = ${accountId}
      AND (${query.type} = 'all' OR (${query.type} = 'in' AND amount > 0) OR (${query.type} = 'out' AND amount < 0))
      AND (${months} = 0 OR occurred_on >= (CURRENT_DATE - ${months} * INTERVAL '1 month')::date)`);
  return { items: rows.map(row => { const item = { ...row }; delete item.total; return item; }), total: rows[0]?.total ?? totalRows[0]?.total ?? 0, page: query.page, pageSize: query.pageSize };
}

export async function listAlerts(accountId: string, page: number, pageSize: number) {
  return getDb().select({ id: depositAlerts.id, type: depositAlerts.type, message: depositAlerts.message,
    date: depositAlerts.createdAt, link: depositAlerts.link }).from(depositAlerts)
    .where(eq(depositAlerts.accountId, accountId)).orderBy(desc(depositAlerts.createdAt), desc(depositAlerts.id))
    .limit(pageSize).offset((page - 1) * pageSize);
}

export async function postTransaction(accountId: string, actor: string, input: z.infer<typeof transactionInput>, reversalOf?: string) {
  return getDb().transaction(async tx => {
    await tx.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, accountId)).for("update");
    const [prior] = await tx.select().from(ledger).where(and(eq(ledger.accountId, accountId), eq(ledger.requestKey, input.requestKey)));
    if (prior) {
      if (prior.amount !== Number(input.amount).toFixed(2) || prior.description !== input.description ||
          prior.occurredOn !== input.occurredOn || prior.reversalOf !== (reversalOf ?? null) || prior.orderCode !== (input.orderCode ?? null))
        throw new AppError(409, "IDEMPOTENCY_CONFLICT", "같은 requestKey에 다른 요청이 있습니다.");
      return prior;
    }
    if (reversalOf) {
      const [reversed] = await tx.select({ id: ledger.id }).from(ledger).where(eq(ledger.reversalOf, reversalOf));
      if (reversed) throw new AppError(409, "ALREADY_REVERSED", "이미 취소한 거래입니다.");
    }
    const [entry] = await tx.insert(ledger).values({ accountId, createdBy: actor, ...input, reversalOf }).returning();
    return entry;
  });
}

export async function invoice(accountId: string, id: string) {
  const [item] = await getDb().select().from(depositInvoices).where(and(eq(depositInvoices.accountId, accountId), eq(depositInvoices.id, id))).limit(1);
  if (!item) throw new AppError(404, "INVOICE_NOT_FOUND", "인보이스가 없습니다.");
  return item;
}
