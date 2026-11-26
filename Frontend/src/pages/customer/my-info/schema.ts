import { z } from 'zod'
import { newPassword } from '@/lib/validators'

// 에러 메시지는 번역 키. Field 컴포넌트가 화면 언어로 바꿔 보여준다
const required = z.string().trim().min(1, 'validation.required')
const phone = z
  .string()
  .trim()
  .regex(/^0\d{1,2}-\d{3,4}-\d{4}$/, 'validation.phone')

// 사업자등록번호·사업자등록증은 BE가 내 정보에서 수정하지 않는다. 비워 두면 null로 보낸다
const optional = z.string().trim().max(500)
export const companySchema = z.object({
  name: required,
  nameEn: optional,
  ceo: optional,
  businessType: optional,
  address: optional,
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
    next: newPassword,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ['confirm'], message: 'validation.passwordMismatch' })
  .refine((v) => v.next !== v.current, { path: ['next'], message: 'validation.passwordSame' })
export type PasswordForm = z.infer<typeof passwordSchema>
