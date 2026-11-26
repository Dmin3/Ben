import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Field } from '@/components/form/field'
import { PasswordInput } from '@/components/form/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getJson, postJson } from '@/lib/api'
import { isAdminRole, type AuthMe } from '@/lib/me'
import { cn } from '@/lib/utils'
import { AuthShell, ErrorAlert } from '../auth-shell'
import { SocialButtons } from './social-buttons'

const loginSchema = z.object({
  email: z.email('validation.email'),
  password: z.string().min(1, 'validation.required'),
  remember: z.boolean(),
})
type LoginValues = z.infer<typeof loginSchema>

const inputClass = 'h-12 rounded-lg px-4 text-[15px]'

type Mode = 'customer' | 'admin'

function LoginForm({ mode, onError }: { mode: Mode; onError: (code: string | null) => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
    const res = await postJson('/api/auth/main/login', v)
    if (!res.ok) return onError(res.code)
    // 고객·관리자 모두 같은 로그인 API. 로그인한 계정이 고른 탭과 맞는지 확인한다
    const me = await getJson<AuthMe>('/api/auth/me')
    if (!me.ok) return onError(me.code)
    const admin = isAdminRole(me.data.accountRole)
    if (admin !== (mode === 'admin')) {
      await postJson('/api/auth/logout', {})
      return onError(admin ? 'USE_ADMIN_LOGIN' : 'NOT_ADMIN')
    }
    queryClient.clear() // 이전 사용자의 화면 데이터가 남지 않게
    navigate(admin ? '/admin' : '/', { replace: true })
  }

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
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t('auth.passwordPlaceholder')}
            aria-invalid={!!errors.password}
            className={inputClass}
            {...register('password')}
          />
        </Field>

        <div className="flex items-center justify-between gap-3 text-[13px] text-muted-foreground">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="size-4 accent-primary" {...register('remember')} />
            {t('auth.remember')}
          </label>
          {mode === 'customer' && (
            <Link to="/find-account" className="hover:text-foreground">
              {t('auth.findAccount')}
            </Link>
          )}
        </div>

        <Button type="submit" className="h-12 w-full rounded-lg text-[15px] font-bold" disabled={isSubmitting}>
          {t('auth.submit')}
        </Button>
      </form>

      {mode === 'customer' && (
        <>
          <div className="flex items-center gap-3 text-xs text-subtle-foreground">
            <span className="h-px flex-1 bg-border" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-border" />
          </div>

          <SocialButtons />

          <p className="text-center text-[13px] text-muted-foreground">
            {t('auth.noAccount')}
            <Link to="/signup" className="ml-2 font-bold text-primary hover:underline">
              {t('auth.signup')}
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

export default function Login() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  // ?as=admin: 관리자 로그인 탭 (관리자 화면에서 로그인이 풀리면 이 탭으로 온다)
  const mode: Mode = params.get('as') === 'admin' ? 'admin' : 'customer'
  // 간편 로그인 실패 시 /auth/callback 이 ?error=코드 로 보내준다
  const [error, setError] = useState(params.get('error'))

  return (
    <AuthShell title={t('auth.title')}>
      <div className="mb-5 empty:hidden">
        <ErrorAlert code={error} />
      </div>
      <div role="tablist" aria-label={t('auth.title')} className="mb-6 grid grid-cols-2 rounded-xl bg-muted p-1">
        {(['customer', 'admin'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setError(null)
              setParams(m === 'admin' ? { as: 'admin' } : {}, { replace: true })
            }}
            className={cn(
              'h-10 rounded-lg text-sm font-semibold transition-colors',
              mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`auth.tabs.${m}`)}
          </button>
        ))}
      </div>
      <LoginForm key={mode} mode={mode} onError={setError} />
    </AuthShell>
  )
}
