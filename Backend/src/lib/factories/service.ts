import type { AuthContext } from "@/lib/auth/types";
import {
  findFactoriesForAccount,
  findFactoryFiles,
  findFactoryForAccount,
  findFactoryIssues,
  findFactoryOptions,
  findFactoryTags,
  saveFactoryMemo,
} from "@/lib/factories/repository";
import type { FactoryListQuery, FactoryMemoInput } from "@/lib/factories/types";
import { AppError } from "@/lib/http";

const grade = (value: "EXCELLENT" | "GOOD") => value.toLowerCase() as "excellent" | "good";
const issueType = (value: "DELAY" | "DEFECT" | "ETC") => value.toLowerCase() as "delay" | "defect" | "etc";

async function requireFactory(actor: AuthContext, factoryId: string) {
  const factory = await findFactoryForAccount(actor.accountId, factoryId);
  if (!factory) throw new AppError(404, "FACTORY_NOT_FOUND", "공장 정보를 찾을 수 없습니다.");
  return factory;
}

export async function listFactories(actor: AuthContext, query: FactoryListQuery) {
  const result = await findFactoriesForAccount(actor.accountId, query);
  const tagsByFactory = new Map<string, string[]>();
  for (const row of result.tags) {
    const tags = tagsByFactory.get(row.factoryId) ?? [];
    tags.push(row.tag);
    tagsByFactory.set(row.factoryId, tags);
  }
  return {
    items: result.items.map((item) => ({
      ...item,
      grade: grade(item.grade),
      tags: tagsByFactory.get(item.id) ?? [],
      deals: item.deals ?? 0,
      totalAmount: item.totalAmount ?? 0,
      onTimeRate: item.onTimeRate ?? 0,
      defectRate: item.defectRate ?? 0,
      avgLeadDays: item.avgLeadDays ?? 0,
    })),
    pagination: {
      page: query.page,
      size: query.size,
      total: result.total,
      totalPages: Math.ceil(result.total / query.size),
    },
  };
}

export async function getFactory(actor: AuthContext, factoryId: string) {
  const [factory, tags] = await Promise.all([
    requireFactory(actor, factoryId),
    findFactoryTags(factoryId),
  ]);
  return {
    factory: {
      id: factory.id,
      code: factory.code,
      name: factory.name,
      legalName: factory.legalName,
      countryCode: factory.countryCode,
      region: factory.region,
      address: factory.address,
      manager: factory.manager,
      category: factory.category,
      grade: grade(factory.grade),
      photoUrl: factory.photoUrl,
      tags: tags.map((row) => row.tag),
      memo: factory.memo,
      firstOrderAt: factory.firstOrderAt,
      lastOrderAt: factory.lastOrderAt,
    },
    metrics: {
      deals: factory.deals ?? 0,
      totalAmount: factory.totalAmount ?? 0,
      onTimeRate: factory.onTimeRate ?? 0,
      defectRate: factory.defectRate ?? 0,
      avgLeadDays: factory.avgLeadDays ?? 0,
      calculatedAt: factory.calculatedAt,
    },
    yearly: factory.yearly ?? [],
    categoryShare: factory.categoryShare ?? [],
    capabilities: {
      canEditMemo: actor.role === "OWNER" || actor.role === "ADMIN",
    },
  };
}

export async function listFactoryIssues(actor: AuthContext, factoryId: string) {
  await requireFactory(actor, factoryId);
  const items = await findFactoryIssues(actor.accountId, factoryId);
  return { items: items.map((item) => ({ ...item, type: issueType(item.type) })) };
}

export async function listFactoryFiles(actor: AuthContext, factoryId: string) {
  await requireFactory(actor, factoryId);
  return { items: await findFactoryFiles(actor.accountId, factoryId) };
}

export async function updateFactoryMemo(actor: AuthContext, factoryId: string, input: FactoryMemoInput) {
  if (actor.role !== "OWNER" && actor.role !== "ADMIN") {
    throw new AppError(403, "FACTORY_MEMO_WRITE_FORBIDDEN", "공장 메모를 수정할 권한이 없습니다.");
  }
  await requireFactory(actor, factoryId);
  const row = await saveFactoryMemo(actor.accountId, factoryId, input.memo);
  if (!row) throw new AppError(404, "FACTORY_NOT_FOUND", "공장 정보를 찾을 수 없습니다.");
  return row;
}

export async function listFactoryOptions(actor: AuthContext) {
  const rows = await findFactoryOptions(actor.accountId);
  return {
    items: rows.map((row) => ({
      value: row.id,
      name: row.name,
      description: [row.category, row.lastOrderAt ? `최근 거래 ${row.lastOrderAt.toISOString().slice(0, 7)}` : null]
        .filter(Boolean)
        .join(" · "),
      history: row.deals ?? 0,
    })),
  };
}
