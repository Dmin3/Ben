import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";

import {
  accountFactories,
  factories,
  factoryFiles,
  factoryIssues,
  factoryMetrics,
  factoryTags,
} from "@/db/schema";
import { getDb } from "@/db/client";
import type { FactoryListQuery } from "@/lib/factories/types";

const listFields = {
  id: factories.id,
  code: factories.code,
  name: factories.name,
  grade: factories.grade,
  category: factories.primaryCategory,
  region: factories.region,
  photoUrl: factories.photoUrl,
  deals: factoryMetrics.deals,
  totalAmount: factoryMetrics.totalAmount,
  onTimeRate: factoryMetrics.onTimeRate,
  defectRate: factoryMetrics.defectRate,
  avgLeadDays: factoryMetrics.avgLeadDays,
};

function searchCondition(q?: string) {
  if (!q) return undefined;
  const pattern = `%${q}%`;
  return or(
    ilike(factories.name, pattern),
    ilike(factories.primaryCategory, pattern),
    ilike(factories.region, pattern),
    sql`exists (
      select 1 from ${factoryTags}
      where ${factoryTags.factoryId} = ${factories.id}
      and ${factoryTags.tag} ilike ${pattern}
    )`,
  );
}

function orderBy(query: FactoryListQuery) {
  const column = {
    name: factories.name,
    deals: factoryMetrics.deals,
    amount: factoryMetrics.totalAmount,
    onTimeRate: factoryMetrics.onTimeRate,
    defectRate: factoryMetrics.defectRate,
    avgLeadDays: factoryMetrics.avgLeadDays,
  }[query.sort];
  return query.direction === "desc" ? desc(column) : asc(column);
}

export async function findFactoriesForAccount(accountId: string, query: FactoryListQuery) {
  const db = getDb();
  const where = and(
    eq(accountFactories.accountId, accountId),
    eq(accountFactories.status, "ACTIVE"),
    eq(factories.status, "ACTIVE"),
    searchCondition(query.q),
  );
  const [items, totalRows] = await Promise.all([
    db
      .select(listFields)
      .from(accountFactories)
      .innerJoin(factories, eq(factories.id, accountFactories.factoryId))
      .leftJoin(
        factoryMetrics,
        and(eq(factoryMetrics.accountId, accountFactories.accountId), eq(factoryMetrics.factoryId, factories.id)),
      )
      .where(where)
      .orderBy(orderBy(query), asc(factories.id))
      .limit(query.size)
      .offset((query.page - 1) * query.size),
    db
      .select({ value: count() })
      .from(accountFactories)
      .innerJoin(factories, eq(factories.id, accountFactories.factoryId))
      .leftJoin(
        factoryMetrics,
        and(eq(factoryMetrics.accountId, accountFactories.accountId), eq(factoryMetrics.factoryId, factories.id)),
      )
      .where(where),
  ]);
  const ids = items.map((item) => item.id);
  const tags = ids.length
    ? await db
        .select({ factoryId: factoryTags.factoryId, tag: factoryTags.tag })
        .from(factoryTags)
        .where(inArray(factoryTags.factoryId, ids))
        .orderBy(asc(factoryTags.tag))
    : [];
  return { items, tags, total: totalRows[0]?.value ?? 0 };
}

export async function findFactoryForAccount(accountId: string, factoryId: string) {
  const [row] = await getDb()
    .select({
      id: factories.id,
      code: factories.code,
      name: factories.name,
      legalName: factories.legalName,
      countryCode: factories.countryCode,
      region: factories.region,
      address: factories.address,
      manager: factories.managerName,
      category: factories.primaryCategory,
      grade: factories.grade,
      photoUrl: factories.photoUrl,
      memo: accountFactories.memo,
      firstOrderAt: accountFactories.firstOrderAt,
      lastOrderAt: accountFactories.lastOrderAt,
      deals: factoryMetrics.deals,
      totalAmount: factoryMetrics.totalAmount,
      onTimeRate: factoryMetrics.onTimeRate,
      defectRate: factoryMetrics.defectRate,
      avgLeadDays: factoryMetrics.avgLeadDays,
      yearly: factoryMetrics.yearly,
      categoryShare: factoryMetrics.categoryShare,
      calculatedAt: factoryMetrics.calculatedAt,
    })
    .from(accountFactories)
    .innerJoin(factories, eq(factories.id, accountFactories.factoryId))
    .leftJoin(
      factoryMetrics,
      and(eq(factoryMetrics.accountId, accountFactories.accountId), eq(factoryMetrics.factoryId, factories.id)),
    )
    .where(
      and(
        eq(accountFactories.accountId, accountId),
        eq(accountFactories.factoryId, factoryId),
        eq(accountFactories.status, "ACTIVE"),
        eq(factories.status, "ACTIVE"),
      ),
    )
    .limit(1);
  return row;
}

export function findFactoryTags(factoryId: string) {
  return getDb()
    .select({ tag: factoryTags.tag })
    .from(factoryTags)
    .where(eq(factoryTags.factoryId, factoryId))
    .orderBy(asc(factoryTags.tag));
}

export function findFactoryIssues(accountId: string, factoryId: string) {
  return getDb()
    .select({
      id: factoryIssues.id,
      type: factoryIssues.type,
      title: factoryIssues.title,
      orderCode: factoryIssues.orderCode,
      occurredAt: factoryIssues.occurredAt,
      resolved: factoryIssues.resolved,
      resolvedAt: factoryIssues.resolvedAt,
    })
    .from(factoryIssues)
    .where(and(eq(factoryIssues.accountId, accountId), eq(factoryIssues.factoryId, factoryId)))
    .orderBy(desc(factoryIssues.occurredAt));
}

export function findFactoryFiles(accountId: string, factoryId: string) {
  return getDb()
    .select({
      id: factoryFiles.id,
      name: factoryFiles.name,
      contentType: factoryFiles.contentType,
      sizeBytes: factoryFiles.sizeBytes,
      createdAt: factoryFiles.createdAt,
    })
    .from(factoryFiles)
    .where(
      and(
        eq(factoryFiles.factoryId, factoryId),
        or(isNull(factoryFiles.accountId), eq(factoryFiles.accountId, accountId)),
      ),
    )
    .orderBy(desc(factoryFiles.createdAt));
}

export async function saveFactoryMemo(accountId: string, factoryId: string, memo: string | null) {
  const [row] = await getDb()
    .update(accountFactories)
    .set({ memo, updatedAt: new Date() })
    .where(
      and(
        eq(accountFactories.accountId, accountId),
        eq(accountFactories.factoryId, factoryId),
        eq(accountFactories.status, "ACTIVE"),
      ),
    )
    .returning({ factoryId: accountFactories.factoryId, memo: accountFactories.memo });
  return row;
}

export function findFactoryOptions(accountId: string) {
  return getDb()
    .select({
      id: factories.id,
      name: factories.name,
      category: factories.primaryCategory,
      lastOrderAt: accountFactories.lastOrderAt,
      deals: factoryMetrics.deals,
    })
    .from(accountFactories)
    .innerJoin(factories, eq(factories.id, accountFactories.factoryId))
    .leftJoin(
      factoryMetrics,
      and(eq(factoryMetrics.accountId, accountFactories.accountId), eq(factoryMetrics.factoryId, factories.id)),
    )
    .where(
      and(
        eq(accountFactories.accountId, accountId),
        eq(accountFactories.status, "ACTIVE"),
        eq(factories.status, "ACTIVE"),
      ),
    )
    .orderBy(asc(factories.name));
}
