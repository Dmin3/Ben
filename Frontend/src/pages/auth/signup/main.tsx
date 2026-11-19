import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api'
import { AuthShell, ErrorAlert } from '../auth-shell'
import { PhoneVerify, type VerifiedPhone } from '../phone-verify'
import { BackToSignup, CompanyFields, PersonFields, SectionTitle } from './form-parts'
import { mainSignupSchema, tempAccountCode, type MainSignupValues } from './schema'

/** 회사 대표(메인 계정) 자체 가입: 휴대폰 인증 → 본인 정보 → 회사 정보. 성공하면 바로 로그인된다 */
export default function MainSignup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState<VerifiedPhone | null>(null)
  const [phoneError, setPhoneError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<MainSignupValues>({
    resolver: zodResolver(mainSignupSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '', accountName: '', businessNo: '' },
  })

  const onSubmit = async (v: MainSignupValues) => {
    setError(null)
    if (!phone) return setPhoneError('validation.phoneVerify')
    const res = await postJson('/api/auth/main/register', {
      name: v.name,
      email: v.email,
      password: v.password,
      accountName: v.accountName,
      businessRegistrationNumber: v.businessNo,
      accountCode: tempAccountCode(),
      phone: phone.phone,
      phoneVerificationToken: phone.token,
    })
    if (res.ok) navigate('/', { replace: true })
    else setError(res.code)
  }

  return (
    <AuthShell title={t('signup.mainTitle')} compact>
      <BackToSignup />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, () => !phone && setPhoneError('validation.phoneVerify'))}
          className="space-y-8"
        >
          <section className="space-y-4">
            <SectionTitle>{t('signup.personSection')}</SectionTitle>
            <PhoneVerify
              purpose="MAIN_SIGNUP"
              error={phoneError}
              onChange={(v) => {
                setPhone(v)
                setPhoneError(undefined)
              }}
            />
            <PersonFields />
          </section>
          <section className="space-y-4">
            <SectionTitle>{t('signup.companySection')}</SectionTitle>
            <CompanyFields />
          </section>

          <div className="space-y-3">
            <ErrorAlert code={error} />
            <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={form.formState.isSubmitting}>
              {t('signup.submitMain')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </AuthShell>
  )
}
