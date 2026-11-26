import { ChevronDown, CreditCard, Factory, FileText, House, JapaneseYen, Settings, Users, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router'
import type { Messages } from '@/i18n/locales/ko'
import { cn } from '@/lib/utils'
import { adminCounts } from '@/mocks/admin'
import { useDepositEntries } from './deposit/data'
import { useAdminUser } from './me'

type Tone = 'danger' | 'warning'
type NavKey = keyof Messages['admin']['nav']
type Leaf = {
  key: NavKey
  to: string
  count?: number
  tone?: Tone
  /** 최고관리자에게만 보인다 */
  superOnly?: boolean
  /** hold: 나중에 진행(링크 없음) / excel: 지금 쓰는 엑셀을 그대로 옮김 / super: 최고관리자 전용 표시 */
  tag?: 'hold' | 'excel' | 'super'
}
type Group = { key: NavKey; icon: LucideIcon; to?: string; tone?: Tone; children?: Leaf[] }

// 메뉴 구성은 기획 시안 "관리자 사이드바" 기준
const MENU: Group[] = [
  { key: 'home', icon: House, to: '/admin' },
  {
    key: 'orders',
    icon: FileText,
    tone: 'danger',
    children: [
      { key: 'orderSummary', to: '/admin/orders' },
      { key: 'newOrders', to: '/admin/orders/incoming', count: adminCounts.newOrders, tone: 'danger' },
      { key: 'sourcingItems', to: '/admin/sourcing/items' },
      { key: 'sourcingOrders', to: '/admin/sourcing/orders' },
      { key: 'sourcingInbound', to: '/admin/sourcing/inbound' },
    ],
  },
  {
    key: 'deposit',
    icon: JapaneseYen,
    tone: 'warning',
    children: [
      { key: 'depositHistory', to: '/admin/deposit' },
      { key: 'depositApprovals', to: '/admin/deposit/approvals', tone: 'warning', superOnly: true },
    ],
  },
  {
    key: 'supply',
    icon: Factory,
    children: [
      { key: 'factories', to: '/admin/factories' },
      { key: 'supplyDb', to: '/admin/supply-db', tag: 'hold' },
    ],
  },
  { key: 'customers', icon: Users, to: '/admin/customers' },
  {
    key: 'finance',
    icon: CreditCard,
    children: [
      { key: 'capital', to: '/admin/finance/capital', superOnly: true, tag: 'super' },
      { key: 'sales', to: '/admin/finance/sales' },
      { key: 'shipping', to: '/admin/finance/shipping', tag: 'excel' },
    ],
  },
  {
    key: 'settings',
    icon: Settings,
    children: [
      { key: 'notices', to: '/admin/settings/notices' },
      { key: 'roles', to: '/admin/settings/roles' },
      { key: 'activity', to: '/admin/settings/activity' },
      { key: 'sitePages', to: '/admin/settings/site', tag: 'hold' },
    ],
  },
]

const TONE = { danger: 'bg-destructive', warning: 'bg-warning' } as const

function Count({ value, tone = 'danger' }: { value?: number; tone?: Tone }) {
  if (!value) return null
  return (
    <span className={cn('ml-auto flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white tabular-nums', TONE[tone])}>
      {value}
    </span>
  )
}

function Tag({ tag }: { tag: NonNullable<Leaf['tag']> }) {
  const { t } = useTranslation()
  const style = {
    super: 'bg-foreground text-background',
    hold: 'bg-muted text-muted-foreground',
    excel: 'bg-warning-soft text-warning',
  }[tag]
  return <span className={cn('ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold', style)}>{t(`admin.tags.${tag}`)}</span>
}

/** 관리자 메뉴. 하위 메뉴가 있는 항목은 눌러서 펼치고 접는다. onNavigate: 모바일 메뉴 창 닫기 */
export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [closed, setClosed] = useState<string[]>([])
  const isSuper = useAdminUser().role === 'SUPER'
  // 승인 대기 수는 예치금 화면과 같은 캐시에서 센다 (승인하면 바로 줄어든다)
  const { data: entries = [] } = useDepositEntries()
  const countOf = (c: Leaf) => (c.key === 'depositApprovals' ? entries.filter((e) => e.state === 'pending').length : c.count)

  return (
    <nav aria-label={t('admin.menu')} className="flex flex-col gap-1">
      {MENU.map((g) => {
        const label = t(`admin.nav.${g.key}`)
        const Icon = g.icon

        if (!g.children) {
          return (
            <NavLink
              key={g.key}
              to={g.to!}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-sidebar-primary font-semibold text-sidebar-primary-foreground' : 'text-foreground/80 hover:bg-muted',
                )
              }
            >
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          )
        }

        const items = g.children.filter((c) => isSuper || !c.superOnly)
        const total = items.reduce((s, c) => s + (countOf(c) ?? 0), 0)
        const open = !closed.includes(g.key)
        const current = items.some((c) => pathname.startsWith(c.to))

        return (
          <div key={g.key}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setClosed((list) => (open ? [...list, g.key] : list.filter((k) => k !== g.key)))}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted',
                current || open ? 'font-semibold text-sidebar-primary' : 'font-medium text-foreground/80',
              )}
            >
              <Icon className="size-[18px]" />
              {label}
              <span className="ml-auto flex items-center gap-2">
                <Count value={total} tone={g.tone} />
                <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
              </span>
            </button>
            {open && (
              <ul className="my-1 ml-[21px] space-y-0.5 border-l pl-3">
                {items.map((c) =>
                  c.tag === 'hold' ? (
                    <li key={c.key} aria-disabled className="flex items-center px-3 py-2 text-[13px] text-subtle-foreground">
                      {t(`admin.nav.${c.key}`)}
                      <Tag tag="hold" />
                    </li>
                  ) : (
                    <li key={c.key}>
                      <NavLink
                        to={c.to}
                        end
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center rounded-lg px-3 py-2 text-[13px] transition-colors',
                            isActive ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'text-foreground/75 hover:bg-muted',
                          )
                        }
                      >
                        {t(`admin.nav.${c.key}`)}
                        {c.tag && <Tag tag={c.tag} />}
                        <Count value={countOf(c)} tone={c.tone} />
                      </NavLink>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
