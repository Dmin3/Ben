import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { postJson } from '@/lib/api'
import { AuthShell, ErrorAlert } from '../auth-shell'
import { PhoneVerify, type VerifiedPhone } from '../phone-verify'
import { BackToSignup, FormInput, PendingNotice, PersonFields, SectionTitle } from './form-parts'
import { subSignupSchema, type SubSignupValues } from './schema'

/** 직원(서브 계정) 자체 가입: 회사 코드로 합류 요청 → 회사 대표가 승인하면 로그인 가능 */
export default function SubSignup() {
  const { t } = useTranslation()
  const [phone, setPhone] = useState<VerifiedPhone | null>(null)
  const [phoneError, setPhoneError] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const form = useForm<SubSignupValues>({
    resolver: zodResolver(subSignupSchema),
    defaultValues: { invitationCode: '', name: '', email: '', password: '', confirm: '' },
  })

  const onSubmit = async (v: SubSignupValues) => {
    setError(null)
    if (!phone) return setPhoneError('validation.phoneVerify')
    const res = await postJson('/api/auth/sub/register', {
      invitationCode: v.invitationCode,
      name: v.name,
      email: v.email,
      password: v.password,
      phone: phone.phone,
      phoneVerificationToken: phone.token,
    })
    if (res.ok) setDone(true)
    else setError(res.code)
  }

  if (done) {
    return (
      <AuthShell title={t('signup.subTitle')} compact>
        <PendingNotice />
      </AuthShell>
    )
  }

  return (
    <AuthShell title={t('signup.subTitle')} compact>
      <BackToSignup />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit, () => !phone && setPhoneError('validation.phoneVerify'))}
          className="space-y-8"
        >
          <section className="space-y-4">
            <SectionTitle>{t('signup.joinSection')}</SectionTitle>
            <FormInput
              name="invitationCode"
              label={t('signup.accountCode')}
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="ABCD1234EFGH"
              hint={t('signup.joinCodeHint')}
            />
          </section>
          <section className="space-y-4">
            <SectionTitle>{t('signup.personSection')}</SectionTitle>
            <PhoneVerify
              purpose="SUB_SIGNUP"
              error={phoneError}
              onChange={(v) => {
                setPhone(v)
                setPhoneError(undefined)
              }}
            />
            <PersonFields />
          </section>

          <div className="space-y-3">
            <ErrorAlert code={error} />
            <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={form.formState.isSubmitting}>
              {t('signup.submitSub')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </AuthShell>
  )
}
