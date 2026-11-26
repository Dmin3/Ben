import { Bell, Menu, Search, Settings } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router'
import { toast } from 'sonner'
import { Logo } from '@/components/layout/sidebar'
import { SettingsDialog } from '@/components/layout/settings-dialog'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { adminCounts } from '@/mocks/admin'
import { AdminNav } from './nav'
import { useMe } from '@/lib/me'

function Brand() {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5 px-1">
      <Logo className="h-8" />
      <span className="inline-block rounded bg-foreground px-1.5 py-0.5 text-[11px] font-bold text-background">{t('admin.badge')}</span>
    </div>
  )
}

/** 관리자 어드민 틀: 왼쪽 메뉴(모바일은 메뉴 창) + 상단 검색·알림·설정·날짜 */
export default function AdminLayout() {
  const { t, i18n } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: me, error } = useMe()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const alerts = adminCounts.newOrders
  // ponytail: 날짜는 화면을 연 시점 기준. 자정을 넘겨 켜두면 새로고침 전까지 어제 날짜
  const [now] = useState(() => new Date())
  const today = new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(now)

  // TODO(API): 통합 검색, 알림 목록
  const search = (e: FormEvent) => {
    e.preventDefault()
    toast(t('common.comingSoon'))
  }

  const userCard = (
    <button
      type="button"
      onClick={() => setSettingsOpen(true)}
      aria-label={t('nav.openSettings')}
      className="flex w-full items-center gap-2.5 rounded-xl bg-muted p-2.5 text-left transition-colors hover:bg-accent"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
        {me?.name[0]}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{me?.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{me?.isAdmin && t(`adminPages.accountRoles.${me.accountRole as 'SUPER_ADMIN' | 'ADMIN'}`)}</span>
      </span>
    </button>
  )

  // 관리자 화면은 수퍼관리자·관리자계정만. 로그인이 풀렸으면 관리자 로그인으로, 고객 계정은 고객 홈으로
  if ((error as { status?: number } | null)?.status === 401) return <Navigate to="/login?as=admin" replace />
  if (error) return null
  if (!me) return null
  if (!me.isAdmin) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-5 border-r bg-sidebar px-3 py-5 lg:flex">
        <Brand />
        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <AdminNav />
        </div>
        {userCard}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-sidebar px-4 lg:gap-4 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('admin.openMenu')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <form onSubmit={search} role="search" className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label={t('admin.search')}
              placeholder={t('admin.search')}
              className="h-10 w-full rounded-xl border bg-muted/40 pr-4 pl-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </form>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => toast(t('common.comingSoon'))}
              aria-label={t('admin.notifications')}
              className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <Bell className="size-5" />
              {alerts > 0 && (
                <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white tabular-nums">
                  {alerts}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t('nav.openSettings')}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <Settings className="size-5" />
            </button>
            <span className="ml-3 hidden text-sm font-medium tabular-nums md:block">{today}</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>

      {/* 모바일: 같은 메뉴를 전체 화면 창으로 */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="gap-5 pb-5">
          <DialogTitle className="sr-only">{t('admin.menu')}</DialogTitle>
          <Brand />
          <div className="flex-1">
            <AdminNav onNavigate={() => setMenuOpen(false)} />
          </div>
          {userCard}
        </DialogContent>
      </Dialog>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} showLogout />
    </div>
  )
}
