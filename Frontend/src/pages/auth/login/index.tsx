import { zodResolver } from '@hookform/resolvers/zod'
import type { ParseKeys } from 'i18next'
import { Eye, EyeOff, Settings } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Field } from '@/components/form/field'
import { SettingsDialog } from '@/components/layout/settings-dialog'
import { Logo } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { BrandPanel } from './brand-panel'
import { SocialButtons, type Provider } from './social-buttons'

const loginSchema = z.object({
  email: z.email('validation.email'),
  password: z.string().min(1, 'validation.required'),
  remember: z.boolean(),
})
type LoginValues = z.infer<typeof loginSchema>

const inputClass = 'h-12 rounded-lg px-4 text-[15px]'
const YEAR = new Date().getFullYear()

function LoginForm({ onError }: { onError: (code: string | null) => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  // ponytail: remember는 BE가 아직 받지 않는다 (지금은 항상 최대 7일 유지). BE가 쿠키 기간을 나눠주면 그대로 동작
  const onSubmit = async (v: LoginValues) => {
    onError(null)
    try {
      const res = await fetch('/api/auth/main/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(v),
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

  // 간편 로그인은 BE가 각 사 로그인 화면으로 보내고, 끝나면 /auth/callback 으로 돌아온다
  const startSocial = (provider: Provider) => location.assign(`/api/auth/main/oauth/${provider}/start`)

  return (
    <div className="space-y-6">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('auth.email')} htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder={t('auth.emailPlaceholder')}
            aria-invalid={!!errors.email}
            className={inputClass}
            {...register('email')}
          />
        </Field>
        <Field label={t('auth.password')} htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.passwordPlaceholder')}
              aria-invalid={!!errors.password}
              className={cn(inputClass, 'pr-12')}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 accent-primary" {...register('remember')} />
            {t('auth.remember')}
          </label>
          <Link to="/find-account" className="hover:text-foreground">
            {t('auth.findAccount')}
          </Link>
        </div>

        <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={isSubmitting}>
          {t('auth.submit')}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-subtle-foreground">
        <span className="h-px flex-1 bg-border" />
        {t('auth.or')}
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialButtons onSelect={startSocial} />

      <p className="text-center text-[13px] text-muted-foreground">
        {t('auth.noAccount')}
        <Link to="/signup" className="ml-2 font-bold text-primary hover:underline">
          {t('auth.signup')}
        </Link>
      </p>
    </div>
  )
}

export default function Login() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  // 간편 로그인 실패 시 /auth/callback 이 ?error=코드 로 보내준다
  const [error, setError] = useState(params.get('error'))
  const [settingsOpen, setSettingsOpen] = useState(false)

  const errorKey = `auth.errors.${error}`
  const errorMessage = error && t(i18n.exists(errorKey) ? (errorKey as ParseKeys) : 'auth.errors.default')

  const settingsButton = (className: string) => (
    <button
      type="button"
      onClick={() => setSettingsOpen(true)}
      aria-label={t('nav.openSettings')}
      className={cn('rounded-full p-2 text-muted-foreground hover:bg-muted', className)}
    >
      <Settings className="size-5" />
    </button>
  )

  return (
    <main className="min-h-svh bg-card lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]">
      {/* 모바일: 상단 로고 바 */}
      <header className="flex h-16 items-center justify-between border-b px-5 lg:hidden">
        <Logo className="h-8" />
        {settingsButton('-mr-2')}
      </header>

      <BrandPanel />

      <section className="relative flex justify-center px-5 pb-10 lg:items-center lg:py-12">
        {settingsButton('absolute top-4 right-4 hidden lg:block')}
        <div className="w-full max-w-[400px]">
          <h1 className="sr-only lg:not-sr-only lg:mb-7 lg:block lg:text-[28px] lg:font-bold">{t('auth.title')}</h1>
          {errorMessage && (
            <p role="alert" className="mb-5 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-destructive">
              {errorMessage}
            </p>
          )}
          <LoginForm onError={setError} />
        </div>
      </section>

      <footer className="pb-8 text-center text-xs text-subtle-foreground lg:hidden">
        © {YEAR} BEN LOGISTICS
      </footer>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  )
}
