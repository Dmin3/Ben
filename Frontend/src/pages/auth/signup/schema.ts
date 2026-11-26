import { z } from 'zod'
import { newPassword } from '@/lib/validators'

// 형식은 BE 검증과 같게 맞춘다 (openapi.yaml)
// 초대 코드: 영문 대문자·숫자 12자리. 소문자·공백으로 입력해도 맞춰 보낸다
const invitationCode = z
  .string()
  .transform((v) => v.replace(/\s/g, '').toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]{12}$/, 'validation.invitationCode'))

export const companyFields = {
  accountName: z.string().trim().min(2, 'validation.companyName').max(100, 'validation.companyName'),
  businessNo: z
    .string()
    .trim()
    .regex(/^\d{3}-?\d{2}-?\d{5}$/, 'validation.businessNo'),
}

// ponytail: 회사 코드는 화면에서 뺐지만 BE가 아직 필수로 받아서 임의 값을 보낸다 (영문·숫자 10자).
// 직원 합류를 내 정보의 초대 코드로 바꿀 때 BE가 코드를 직접 만들거나 선택값으로 바꾸면 이 함수를 지운다
export const tempAccountCode = () => `c${crypto.randomUUID().replaceAll('-', '').slice(0, 9)}`

// 실명. 간편 로그인은 공급자 이름(닉네임일 수 있음)을 그대로 쓰지 않고 온보딩에서 다시 받는다
const name = z.string().trim().min(2, 'validation.name').max(80, 'validation.name')

const personFields = {
  name,
  email: z.email('validation.email'),
  password: newPassword,
  confirm: z.string(),
}

const samePassword = (v: { password: string; confirm: string }) => v.password === v.confirm
const mismatch = { path: ['confirm'], message: 'validation.passwordConfirm' }

export const mainSignupSchema = z.object({ ...personFields, ...companyFields }).refine(samePassword, mismatch)
export type MainSignupValues = z.infer<typeof mainSignupSchema>

export const subSignupSchema = z.object({ ...personFields, invitationCode }).refine(samePassword, mismatch)
export type SubSignupValues = z.infer<typeof subSignupSchema>

export const createCompanySchema = z.object({ name, ...companyFields })
export type CreateCompanyValues = z.infer<typeof createCompanySchema>

export const joinCompanySchema = z.object({ name, invitationCode })
export type JoinCompanyValues = z.infer<typeof joinCompanySchema>
