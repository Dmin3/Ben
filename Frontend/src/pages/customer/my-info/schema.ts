import { z } from 'zod'

// 에러 메시지는 번역 키. Field 컴포넌트가 화면 언어로 바꿔 보여준다
const required = z.string().trim().min(1, 'validation.required')
const phone = z
  .string()
  .trim()
  .regex(/^0\d{1,2}-\d{3,4}-\d{4}$/, 'validation.phone')

export const companySchema = z.object({
  name: required,
  nameEn: required,
  businessNo: z
    .string()
    .trim()
    .regex(/^\d{3}-\d{2}-\d{5}$/, 'validation.businessNo'),
  ceo: required,
  businessType: required,
  address: required,
  certificate: z.string(),
})
export type CompanyForm = z.infer<typeof companySchema>

export const contactSchema = z.object({
  name: required,
  title: required,
  phone,
  email: z.email('validation.email'),
})
export type ContactForm = z.infer<typeof contactSchema>

export const addressSchema = z.object({
  name: required,
  address: required,
  recipient: required,
  phone,
})
export type AddressForm = z.infer<typeof addressSchema>

export const passwordSchema = z
  .object({
    current: z.string().min(1, 'validation.currentPassword'),
    next: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(/[A-Za-z]/, 'validation.passwordLetter')
      .regex(/\d/, 'validation.passwordDigit'),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ['confirm'], message: 'validation.passwordMismatch' })
  .refine((v) => v.next !== v.current, { path: ['next'], message: 'validation.passwordSame' })
export type PasswordForm = z.infer<typeof passwordSchema>
