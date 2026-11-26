import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Users } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getJson, postJson } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AuthShell, ErrorAlert } from './auth-shell'
import { PhoneVerify, type VerifiedPhone } from './phone-verify'
import { CompanyFields, FormInput, NameInput, PendingNotice } from './signup/form-parts'
import {
  createCompanySchema,
  joinCompanySchema,
  tempAccountCode,
  type CreateCompanyValues,
  type JoinCompanyValues,
} from './signup/schema'

type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'UNMATCHED'
type OnboardingMe = {
  id: string
  name: string
  email: string | null
  phone: string | null
  membershipRequest: { id: string; status: MembershipStatus } | null
}

const ME_KEY = ['onboarding', 'me']

/** 휴대폰 번호를 아직 못 받았으면 SMS 인증을 붙인다. 받았으면 아무것도 그리지 않는다 */
function usePhoneStep(needed: boolean) {
  const [phone, setPhone] = useState<VerifiedPhone | null>(null)
  const [error, setError] = useState<string>()
  const ok = !needed || !!phone
  const view = needed && (
    <PhoneVerify
      purpose="SSO_SIGNUP"
      error={error}
      onChange={(v) => {
        setPhone(v)
        setError(undefined)
      }}
    />
  )
  const check = () => {
    if (!ok) setError('validation.phoneVerify')
    return ok
  }
  const body = phone ? { phone: phone.phone, phoneVerificationToken: phone.token } : {}
  return { view, check, body }
}
type PhoneStep = ReturnType<typeof usePhoneStep>

function CreateCompany({ phone }: { phone: PhoneStep }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<CreateCompanyValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { name: '', accountName: '', businessNo: '' },
  })

  const onSubmit = async (v: CreateCompanyValues) => {
    setError(null)
    if (!phone.check()) return
    const res = await postJson('/api/onboarding/main-account', {
      name: v.name,
      accountName: v.accountName,
      businessRegistrationNumber: v.businessNo,
      accountCode: tempAccountCode(),
      ...phone.body,
    })
    if (res.ok) navigate('/', { replace: true })
    else setError(res.code)
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit, phone.check)} className="space-y-4">
        <NameInput />
        <CompanyFields />
        <ErrorAlert code={error} />
        <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={form.formState.isSubmitting}>
          {t('signup.submitMain')}
        </Button>
      </form>
    </FormProvider>
  )
}

function JoinCompany({ phone }: { phone: PhoneStep }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<JoinCompanyValues>({
    resolver: zodResolver(joinCompanySchema),
    defaultValues: { name: '', invitationCode: '' },
  })

  const onSubmit = async (v: JoinCompanyValues) => {
    setError(null)
    if (!phone.check()) return
    const res = await postJson('/api/onboarding/membership-requests', {
      name: v.name,
      invitationCode: v.invitationCode,
      ...phone.body,
    })
    // 접수되면 상태를 다시 읽어 대기 안내로 바뀐다
    if (res.ok) await queryClient.invalidateQueries({ queryKey: ME_KEY })
    else setError(res.code)
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit, phone.check)} className="space-y-4">
        <NameInput />
        <FormInput
          name="invitationCode"
          label={t('signup.accountCode')}
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="ABCD1234EFGH"
          hint={t('signup.joinCodeHint')}
        />
        <ErrorAlert code={error} />
        <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={form.formState.isSubmitting}>
          {t('signup.submitSub')}
        </Button>
      </form>
    </FormProvider>
  )
}

/**
 * 간편 로그인으로 처음 온 사람 (/auth/callback?result=ONBOARDING).
 * BE가 30분짜리 가입 쿠키를 준 상태에서 회사를 새로 만들거나 기존 회사에 합류 요청을 보낸다
 */
export default function Onboarding() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const { data: res } = useQuery({
    queryKey: ME_KEY,
    queryFn: () => getJson<OnboardingMe>('/api/onboarding/me'),
    retry: false,
  })
  // 간편 로그인 공급자가 휴대폰 번호를 안 줬으면 SMS 인증을 한 번 받는다 (회사 만들기/합류 공통)
  const phone = usePhoneStep(!!res?.ok && !res.data.phone)

  if (!res) return <AuthShell title={t('signup.onboardingTitle')} compact>{null}</AuthShell>
  // 가입 쿠키가 없거나 30분이 지났으면 간편 로그인부터 다시
  if (!res.ok) return <Navigate to={`/login?error=${encodeURIComponent(res.code)}`} replace />

  const me = res.data
  if (me.membershipRequest?.status === 'PENDING') {
    return (
      <AuthShell title={t('signup.onboardingTitle')} compact>
        <PendingNotice />
      </AuthShell>
    )
  }

  const modes = [
    { key: 'create', icon: Building2, label: t('signup.createCompany') },
    { key: 'join', icon: Users, label: t('signup.joinCompany') },
  ] as const

  return (
    <AuthShell title={t('signup.onboardingTitle')} compact>
      <div className="space-y-6">
        <p className="-mt-3 text-sm text-muted-foreground">{t('signup.onboardingWelcome')}</p>
        {me.membershipRequest?.status === 'REJECTED' && (
          <p className="rounded-lg bg-warning-subtle px-3 py-2.5 text-[13px]">{t('signup.rejected')}</p>
        )}

        {phone.view}

        <div role="radiogroup" aria-label={t('signup.onboardingTitle')} className="grid grid-cols-2 gap-2">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={mode === m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-4 text-sm font-semibold transition-colors',
                mode === m.key ? 'border-primary bg-primary-soft/50 text-primary' : 'hover:bg-muted',
              )}
            >
              <m.icon className="size-5" />
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {mode === 'create' ? t('signup.mainDesc') : t('signup.subDesc')}
        </p>

        {/* 공급자 이름은 닉네임일 수 있어 채우지 않고 실명을 직접 받는다 */}
        {mode === 'create' ? <CreateCompany phone={phone} /> : <JoinCompany phone={phone} />}
      </div>
    </AuthShell>
  )
}
