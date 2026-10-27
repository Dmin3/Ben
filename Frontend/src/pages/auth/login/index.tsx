import { zodResolver } from '@hookform/resolvers/zod'
import type { ParseKeys } from 'i18next'
import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Field } from '@/components/form/field'
import { SettingsDialog } from '@/components/layout/settings-dialog'
import { Logo } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SocialButtons, type Provider } from './social-buttons'

/** main: 고객사 대표 계정 (이메일) / sub: 고객사가 발급한 계정 (고객사 코드 + 아이디) */
type LoginType = 'main' | 'sub'
const LOGIN_TYPES: LoginType[] = ['main', 'sub']

const required = z.string().trim().min(1, 'validation.required')
const schemaFor = (type: LoginType) =>
  z.object({
    accountCode: type === 'sub' ? required : z.string(),
    id: type === 'main' ? z.email('validation.email') : required,
    password: z.string().min(1, 'validation.required'),
  })
type LoginValues = { accountCode: string; id: string; password: string }

function LoginForm({ type, onError }: { type: LoginType; onError: (code: string | null) => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schemaFor(type)),
    defaultValues: { accountCode: '', id: '', password: '' },
  })

  const onSubmit = async (v: LoginValues) => {
    onError(null)
    const body =
      type === 'main'
        ? { email: v.id, password: v.password }
        : { accountCode: v.accountCode, loginId: v.id, password: v.password }
    try {
      const res = await fetch(`/api/auth/${type}/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        navigate('/', { replace: true })
      } else {
        const data = await res.json().catch(() => null)
        onError(data?.error?.code ?? 'default')
      }
    } catch {
      onError('default')
    }
  }

  // 간편 로그인은 BE가 각 사 로그인 화면으로 보내고, 끝나면 /auth/callback 으로 돌아온다. 서브 계정은 고객사 코드가 필요
  const startSocial = async (provider: Provider) => {
    if (type === 'main') {
      location.assign(`/api/auth/main/oauth/${provider}/start`)
    } else if (await trigger('accountCode')) {
      const code = encodeURIComponent(getValues('accountCode').trim())
      location.assign(`/api/auth/sub/oauth/${provider}/start?accountCode=${code}`)
    }
  }

  return (
    <div className="space-y-5">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {type === 'sub' && (
          <Field label={t('auth.accountCode')} htmlFor="accountCode" error={errors.accountCode?.message}>
            <Input
              id="accountCode"
              autoComplete="organization"
              placeholder={t('auth.accountCodePlaceholder')}
              aria-invalid={!!errors.accountCode}
              {...register('accountCode')}
            />
          </Field>
        )}
        <Field label={type === 'main' ? t('auth.email') : t('auth.loginId')} htmlFor="id" error={errors.id?.message}>
          <Input
            id="id"
            type={type === 'main' ? 'email' : 'text'}
            autoComplete="username"
            aria-invalid={!!errors.id}
            {...register('id')}
          />
        </Field>
        <Field label={t('auth.password')} htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </Field>
        <Button type="submit" className="h-11 w-full text-sm" disabled={isSubmitting}>
          {t('auth.submit')}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        {t('auth.or')}
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialButtons onSelect={startSocial} />
    </div>
  )
}

export default function Login() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const [type, setType] = useState<LoginType>('main')
  // 간편 로그인 실패 시 /auth/callback 이 ?error=코드 로 보내준다
  const [error, setError] = useState(params.get('error'))
  const [settingsOpen, setSettingsOpen] = useState(false)

  const errorKey = `auth.errors.${error}`
  const errorMessage = error && t(i18n.exists(errorKey) ? (errorKey as ParseKeys) : 'auth.errors.default')

  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-12">
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label={t('nav.openSettings')}
        className="absolute top-3 right-3 rounded-full p-2 text-muted-foreground hover:bg-muted"
      >
        <Settings className="size-5" />
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="h-16" />
        </div>

        <div className="space-y-5 rounded-2xl bg-card p-6 ring-1 ring-border sm:p-8">
          <h1 className="text-xl font-bold">{t('auth.title')}</h1>

          <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
            {LOGIN_TYPES.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={type === key}
                onClick={() => {
                  setType(key)
                  setError(null)
                }}
                className={cn(
                  'h-9 rounded-lg text-[13px] font-semibold transition-colors',
                  type === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(`auth.tabs.${key}`)}
              </button>
            ))}
          </div>

          {type === 'sub' && <p className="text-xs text-muted-foreground">{t('auth.subHint')}</p>}

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-destructive">
              {errorMessage}
            </p>
          )}

          {/* 탭이 바뀌면 입력값과 검증 규칙을 새로 시작 */}
          <LoginForm key={type} type={type} onError={setError} />
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  )
}
