import { Settings } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsDialog } from '@/components/layout/settings-dialog'
import { Logo } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'
import { useErrorText } from './error-text'
import { BrandPanel } from './login/brand-panel'

const YEAR = new Date().getFullYear()

export function ErrorAlert({ code }: { code: string | null }) {
  const message = useErrorText()(code)
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-destructive">
      {message}
    </p>
  )
}

/**
 * 로그인·가입 화면 공통 틀: 왼쪽 브랜드 영역 + 오른쪽 폼.
 * compact: 모바일에서 브랜드 영역을 숨긴다 (입력이 긴 가입 화면)
 */
export function AuthShell({
  title,
  compact,
  children,
}: {
  title: string
  compact?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

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

      <BrandPanel className={cn(compact && 'max-lg:hidden')} />

      <section
        className={cn(
          'relative flex justify-center px-5 pb-10 lg:items-center lg:py-12',
          compact && 'pt-8',
        )}
      >
        {settingsButton('absolute top-4 right-4 hidden lg:block')}
        <div className="w-full max-w-[400px]">
          <h1
            className={cn(
              'mb-6 text-2xl font-bold lg:mb-7 lg:text-[28px]',
              // 로그인은 모바일에서 브랜드 문구가 제목 역할을 한다
              !compact && 'sr-only lg:not-sr-only',
            )}
          >
            {title}
          </h1>
          {children}
        </div>
      </section>

      <footer className="pb-8 text-center text-xs text-subtle-foreground lg:hidden">© {YEAR} BEN LOGISTICS</footer>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </main>
  )
}
