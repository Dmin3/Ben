import { ChevronLeft, Clock } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Field } from '@/components/form/field'
import { PasswordInput } from '@/components/form/password-input'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const authInput = 'h-12 rounded-lg px-4 text-[15px]'

/** FormProvider 안에서 쓰는 라벨 + 입력. name으로 register와 에러를 연결한다 */
export function FormInput({
  name,
  label,
  hint,
  type,
  ...props
}: { name: string; label: string; hint?: ReactNode } & Omit<ComponentProps<typeof Input>, 'name'>) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors[name]?.message as string | undefined
  const input = {
    id: name,
    'aria-invalid': !!error,
    className: authInput,
    ...props,
    ...register(name),
  }
  return (
    <Field
      label={label}
      htmlFor={name}
      required
      error={error}
      hint={hint && <span className="font-normal text-muted-foreground">{hint}</span>}
    >
      {type === 'password' ? <PasswordInput {...input} /> : <Input type={type} {...input} />}
    </Field>
  )
}

/** 실명 (자체 가입, 간편 가입 온보딩 공통) */
export function NameInput() {
  const { t } = useTranslation()
  return <FormInput name="name" label={t('signup.name')} autoComplete="name" hint={t('signup.nameHint')} />
}

/** 실명 · 이메일 · 비밀번호 · 비밀번호 확인 (메인/서브 자체 가입 공통) */
export function PersonFields() {
  const { t } = useTranslation()
  return (
    <>
      <NameInput />
      <FormInput name="email" label={t('auth.email')} type="email" autoComplete="email" placeholder={t('auth.emailPlaceholder')} />
      <FormInput name="password" label={t('auth.password')} type="password" autoComplete="new-password" placeholder={t('signup.passwordRule')} />
      <FormInput name="confirm" label={t('signup.passwordConfirm')} type="password" autoComplete="new-password" />
    </>
  )
}

/** 회사명 · 사업자등록번호 (메인 가입, 간편 가입 회사 만들기 공통) */
export function CompanyFields() {
  const { t } = useTranslation()
  return (
    <>
      <FormInput name="accountName" label={t('signup.companyName')} autoComplete="organization" />
      <FormInput name="businessNo" label={t('signup.businessNo')} inputMode="numeric" placeholder="000-00-00000" />
    </>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="border-b pb-2 text-sm font-bold text-muted-foreground">{children}</h2>
}

export function BackToSignup() {
  const { t } = useTranslation()
  return (
    <Link to="/signup" className="-mt-3 mb-6 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" />
      {t('signup.back')}
    </Link>
  )
}

/** 직원 합류 요청을 보낸 뒤의 안내 */
export function PendingNotice() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Clock className="size-7" />
      </span>
      <div className="space-y-2">
        <p className="text-lg font-bold">{t('signup.pendingTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('signup.pendingBody')}</p>
      </div>
      <Link to="/login" replace className={cn(buttonVariants({ variant: 'outline' }), 'h-12 w-full rounded-lg')}>
        {t('signup.toLogin')}
      </Link>
    </div>
  )
}
