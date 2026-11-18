import { z } from "zod";
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(["all", "in", "out"]).default("all"),
  period: z.enum(["3m", "6m", "1y", "all"]).default("3m"),
});
const money = z.string().regex(/^-?(0|[1-9]\d{0,12})(\.\d{1,2})?$/).refine(v => Number(v) !== 0);
export const transactionInput = z.object({
  amount: money, description: z.string().trim().min(1).max(500),
  occurredOn: z.iso.date(), orderCode: z.string().trim().max(100).optional(),
  requestKey: z.uuid(),
});
export const reversalInput = z.object({ description: z.string().trim().min(1).max(500), occurredOn: z.iso.date(), requestKey: z.uuid() });
export const scheduleInput = z.object({
  label: z.string().trim().min(1).max(500), amount: money.refine(v => Number(v) > 0), dueOn: z.iso.date(),
});
export const scheduleStatus = z.object({ status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]) });
export const alertInput = z.object({
  type: z.enum(["correction", "topup", "confirmed"]), message: z.string().trim().min(1).max(2000),
  link: z.enum(["history", "invoice"]).optional(),
});
