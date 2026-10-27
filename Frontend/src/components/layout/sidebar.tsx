import { Settings, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import logoDark from '@/assets/logo-dark.svg'
import logo from '@/assets/logo.svg'
import { cn } from '@/lib/utils'
import { SettingsDialog } from './settings-dialog'

export type NavItem = {
  to: string
  label: string
  /** 모바일 하단 탭 아이콘 */
  icon: LucideIcon
}

type User = {
  name: string
  company: string
}

/** 라이트/다크에 맞는 로고 (다크는 글자만 밝게 바꾼 버전) */
export function Logo({ className }: { className?: string }) {
  return (
    <>
      <img src={logo} alt="BEN Logistics" className={cn('w-auto dark:hidden', className)} />
      <img src={logoDark} alt="BEN Logistics" className={cn('hidden w-auto dark:block', className)} />
    </>
  )
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {name[0]}
    </div>
  )
}

/** 데스크톱(lg 이상): 왼쪽 고정 사이드바. 아래 사용자 카드를 누르면 설정 모달 */
export function Sidebar({ items, user }: { items: NavItem[]; user: User }) {
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <aside className="sticky top-0 hidden h-svh w-44 shrink-0 flex-col border-r bg-sidebar px-3 py-5 lg:flex">
      <div className="mb-5 px-1">
        <Logo className="h-8" />
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label={t('nav.openSettings')}
        title={t('nav.openSettings')}
        className="mt-auto flex items-center gap-2.5 rounded-xl bg-muted p-2.5 text-left transition-colors hover:bg-accent"
      >
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{t('common.customerName', { name: user.name })}</div>
          <div className="truncate text-xs text-muted-foreground">{user.company}</div>
        </div>
      </button>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  )
}

/** 모바일(lg 미만): 상단 로고 + 설정 + 내 정보 */
export function MobileHeader({ user, profileTo }: { user: User; profileTo: string }) {
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-sidebar px-4 lg:hidden">
      <Logo className="h-9" />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label={t('nav.openSettings')}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <Settings className="size-5" />
        </button>
        <NavLink to={profileTo} aria-label={t('nav.myInfo')}>
          <Avatar name={user.name} />
        </NavLink>
      </div>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </header>
  )
}

/** 모바일(lg 미만): 하단 고정 탭 바. 아이폰 홈 바 영역만큼 아래 여백을 둔다 */
export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 grid border-t bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-2 text-[11px]',
              isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="size-5" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
