import { z } from "zod";

const nullableText = (max: number) => z.string().trim().min(1).max(max).nullable().optional();

export const companyUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    nameEn: nullableText(160),
    ceoName: nullableText(80),
    businessType: nullableText(160),
    address: nullableText(500),
  })
  .refine((value) => Object.keys(value).length > 0, "수정할 회사 정보를 입력해 주세요.");

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(80),
  phone: z.string().trim().regex(/^0\d{1,2}-\d{3,4}-\d{4}$/),
  email: z.email().max(254).transform((value) => value.toLowerCase()),
});

export const addressSchema = z.object({
  name: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(500),
  recipient: z.string().trim().min(1).max(80),
  phone: z.string().trim().regex(/^0\d{1,2}-\d{3,4}-\d{4}$/),
});

export const addressUpdateSchema = addressSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "수정할 배송지 정보를 입력해 주세요.");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z
      .string()
      .min(10)
      .max(128)
      .regex(/[A-Za-z]/, "영문자를 포함해야 합니다.")
      .regex(/\d/, "숫자를 포함해야 합니다."),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "현재 비밀번호와 다른 비밀번호를 입력해 주세요.",
  });

export const addressIdSchema = z.uuid();
