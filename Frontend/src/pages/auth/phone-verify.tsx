import { CheckCircle2 } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Field } from '@/components/form/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { postJson } from '@/lib/api'
import { useErrorText } from './error-text'

export type PhonePurpose = 'MAIN_SIGNUP' | 'SUB_SIGNUP' | 'SSO_SIGNUP'
export type VerifiedPhone = { phone: string; token: string }

const RESEND_SECONDS = 60 // BE 재발송 제한과 같다
const CODE_SECONDS = 180 // BE 인증번호 유효시간 (응답의 expiresIn이 우선)
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const digits = (v: string) => v.replace(/\D/g, '')
const isMobile = (v: string) => /^01[016789]\d{7,8}$/.test(digits(v))

/**
 * 휴대폰 SMS 인증: 번호 → 인증번호 받기(3분 유효) → 6자리 확인 → 1회용 토큰(10분).
 * 가입 폼 안에 들어가므로 버튼은 모두 type="button", 엔터는 폼 제출 대신 각 단계를 실행한다
 */
export function PhoneVerify({
  purpose,
  onChange,
  error,
}: {
  purpose: PhonePurpose
  onChange: (v: VerifiedPhone | null) => void
  /** 부모 폼 제출 시 인증을 안 했을 때의 에러 (번역 키) */
  error?: string
}) {
  const { t } = useTranslation()
  const errorText = useErrorText()
  const id = useId()
  const codeRef = useRef<HTMLInputElement>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'input' | 'sent' | 'verified'>('input')
  const [cooldown, setCooldown] = useState(0)
  const [remaining, setRemaining] = useState(0) // 인증번호 남은 시간(초)
  const [busy, setBusy] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string>()

  // 인증번호 칸이 처음 나타나면 바로 입력할 수 있게
  useEffect(() => {
    if (step === 'sent') codeRef.current?.focus()
  }, [step])

  // 재전송 대기와 인증번호 유효시간을 1초마다 함께 줄인다
  useEffect(() => {
    if (cooldown <= 0 && remaining <= 0) return
    const timer = setTimeout(() => {
      setCooldown((s) => Math.max(0, s - 1))
      setRemaining((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearTimeout(timer)
  }, [cooldown, remaining])

  const send = async () => {
    setApiError(null)
    if (!isMobile(phone)) return setInputError('validation.mobile')
    setInputError(undefined)
    setBusy(true)
    const res = await postJson<{ expiresIn?: number }>('/api/auth/phone/send', { phone: digits(phone), purpose })
    setBusy(false)
    if (!res.ok) return setApiError(res.code)
    setStep('sent')
    setCode('')
    setCooldown(RESEND_SECONDS)
    setRemaining(res.data?.expiresIn ?? CODE_SECONDS)
    codeRef.current?.focus() // 재전송일 때. 처음 보낼 때는 위 effect가 맞춘다
  }

  const verify = async () => {
    setApiError(null)
    if (remaining <= 0) return setApiError('SMS_CODE_EXPIRED')
    if (!/^\d{6}$/.test(code)) return setApiError('SMS_CODE_INVALID')
    setBusy(true)
    const res = await postJson<{ verificationToken: string; phone: string }>('/api/auth/phone/verify', {
      phone: digits(phone),
      code,
      purpose,
    })
    setBusy(false)
    if (!res.ok) return setApiError(res.code)
    setStep('verified')
    setRemaining(0)
    onChange({ phone: res.data.phone, token: res.data.verificationToken })
  }

  const reset = () => {
    setStep('input')
    setCode('')
    setRemaining(0)
    setApiError(null)
    onChange(null)
  }

  const onEnter = (e: KeyboardEvent, action: () => void) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (!busy) action()
  }

  const verified = step === 'verified'
  const expired = step === 'sent' && remaining <= 0

  return (
    <div className="space-y-3">
      <Field label={t('signup.phone')} htmlFor={`${id}-phone`} required error={inputError ?? (verified ? undefined : error)}>
        <div className="flex gap-2">
          <Input
            id={`${id}-phone`}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => onEnter(e, send)}
            disabled={verified}
            aria-invalid={!!inputError}
            className="h-12 flex-1 rounded-lg px-4 text-[15px]"
          />
          {verified ? (
            <Button type="button" variant="outline" className="h-12 rounded-lg px-4" onClick={reset}>
              {t('signup.changePhone')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-12 min-w-28 rounded-lg px-4 tabular-nums"
              onClick={send}
              disabled={busy || cooldown > 0}
            >
              {step === 'input'
                ? t('signup.sendCode')
                : cooldown > 0
                  ? t('signup.resendIn', { count: cooldown })
                  : t('signup.resend')}
            </Button>
          )}
        </div>
      </Field>

      {step === 'sent' && (
        <Field label={t('signup.code')} htmlFor={`${id}-code`} hint={<span className="font-normal text-muted-foreground">{t('signup.codeHint')}</span>}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={codeRef}
                id={`${id}-code`}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(digits(e.target.value))}
                onKeyDown={(e) => onEnter(e, verify)}
                disabled={expired}
                aria-describedby={`${id}-timer`}
                className="h-12 rounded-lg pr-16 pl-4 text-[15px] tracking-[0.3em] tabular-nums"
              />
              {/* 남은 시간. 매초 읽어주지 않게 live 영역으로 두지 않는다 */}
              <span
                id={`${id}-timer`}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-semibold text-destructive tabular-nums"
              >
                <span className="sr-only">{t('signup.timeLeft')} </span>
                {mmss(remaining)}
              </span>
            </div>
            <Button type="button" className="h-12 min-w-28 rounded-lg px-4" onClick={verify} disabled={busy || expired}>
              {t('signup.verify')}
            </Button>
          </div>
        </Field>
      )}

      {verified && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
          <CheckCircle2 className="size-4" />
          {t('signup.phoneVerified')}
        </p>
      )}
      {expired && !apiError && (
        <p role="alert" className="text-xs text-destructive">
          {errorText('SMS_CODE_EXPIRED')}
        </p>
      )}
      {apiError && (
        <p role="alert" className="text-xs text-destructive">
          {errorText(apiError)}
        </p>
      )}
    </div>
  )
}
