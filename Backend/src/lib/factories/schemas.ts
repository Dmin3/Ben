import { z } from "zod";

export const factoryListQuerySchema = z.object({
  q: z.string().trim().max(100).optional().transform((value) => value || undefined),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["name", "deals", "amount", "onTimeRate", "defectRate", "avgLeadDays"]).default("name"),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

export const factoryIdSchema = z.uuid();

export const factoryMemoSchema = z.object({
  memo: z.string().trim().max(2000).nullable(),
});
