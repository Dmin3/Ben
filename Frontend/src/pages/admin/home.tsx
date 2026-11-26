import { Clock, CreditCard, Mail, Package, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { ADMIN_STEPS, INTERNAL_STEPS, adminCounts, adminNotices, homeStats } from '@/mocks/admin'
import { panel } from './styles'
import { Panel } from './ui'
import { useAdminUser } from './me'

function Kpi({ to, icon, iconClass, label, value, note, noteClass, className }: {
  to: string
  icon: ReactNode
  iconClass: string
  label: string
  value: ReactNode
  note: string
  noteClass?: string
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <Link to={to} className={cn(panel, 'block p-5 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-center gap-2.5 text-sm font-semibold">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconClass)}>{icon}</span>
        {label}
      </div>
      <div className="mt-4 text-[28px] font-extrabold tabular-nums">
        {value}
        <span className="ml-1 text-sm font-semibold">{t('adminPages.caseUnit')}</span>
      </div>
      <div className={cn('mt-1 text-xs', noteClass ?? 'text-muted-foreground')}>{note}</div>
    </Link>
  )
}

/** 단계별 오더 수. 견적·샘플은 파랑, 생산·물류는 초록 */
function StepProgress() {
  const { t } = useTranslation()
  return (
    <Panel
      className="lg:col-span-2"
      title={t('adminPages.home.progress')}
      action={
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />{t('adminPages.home.legendQuote')}</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />{t('adminPages.home.legendProd')}</span>
        </div>
      }
    >
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[560px] pt-2">
          {ADMIN_STEPS.map((s, i) => {
            const early = i < 2
            return (
              <li key={s} className="relative flex flex-1 flex-col items-center gap-2">
                {i < ADMIN_STEPS.length - 1 && (
                  <span aria-hidden className={cn('absolute top-[7px] left-1/2 h-0.5 w-full', early ? 'bg-primary' : 'bg-success')} />
                )}
                <span className={cn('relative size-4 rounded-full border-2 bg-card', early ? 'border-primary' : 'border-success')} />
                <span className={cn('text-xs', INTERNAL_STEPS.includes(s) ? 'text-subtle-foreground' : 'text-muted-foreground')}>
                  {t(`adminPages.steps.${s}`)}
                </span>
                <Link
                  to={`/admin/orders?step=${i}`}
                  className={cn('text-2xl font-extrabold tabular-nums hover:underline', i === 0 && 'text-primary')}
                >
                  {homeStats.stepCounts[i]}
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </Panel>
  )
}

function NoticeCard() {
  const { t } = useTranslation()
  return (
    <Panel
      title={t('adminPages.home.notices')}
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/admin/settings/notices?compose=1" />}>
            {t('adminPages.home.write')}
          </Button>
          <Link to="/admin/settings/notices" className="text-[13px] font-semibold text-primary hover:underline">
            {t('adminPages.more')} ›
          </Link>
        </div>
      }
    >
      <ul className="divide-y divide-divider">
        {adminNotices.slice(0, 3).map((n) => (
          <li key={n.id} className="flex items-center gap-2.5 py-3 first:pt-0">
            <Badge variant={n.pinned ? 'danger' : 'info'}>{n.pinned ? t('home.notice.important') : t('home.notice.normal')}</Badge>
            <span className="min-w-0 flex-1 truncate text-sm">{n.title}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{n.period.split(' ~ ')[0]}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function MonthlyChart() {
  const { t } = useTranslation()
  const config = {
    prev: { label: '2025', color: 'var(--chart-soft)' },
    curr: { label: '2026', color: 'var(--primary)' },
  } satisfies ChartConfig
  const data = homeStats.monthly.map(([prev, curr], i) => ({ month: `${i + 1}월`, prev, curr }))
  return (
    <Panel
      title={t('adminPages.home.monthly')}
      action={
        <div className="flex gap-3 text-xs text-muted-foreground">
          {(['prev', 'curr'] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: config[k].color }} />
              {config[k].label}
            </span>
          ))}
        </div>
      }
    >
      <ChartContainer config={config} className="aspect-auto h-60 w-full">
        <BarChart data={data} margin={{ left: -16, right: 0 }} barGap={2}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}억`} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="prev" fill="var(--color-prev)" radius={[3, 3, 0, 0]} maxBarSize={12} />
          <Bar dataKey="curr" fill="var(--color-curr)" radius={[3, 3, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ChartContainer>
    </Panel>
  )
}

function TopCustomers() {
  const { t } = useTranslation()
  const max = Math.max(...homeStats.topCustomers.map((c) => c.amount))
  return (
    <Panel title={<>{t('adminPages.home.topCustomers')} <span className="text-xs font-normal text-muted-foreground">{t('adminPages.home.last30')}</span></>}>
      <ul className="space-y-4">
        {homeStats.topCustomers.map((c) => (
          <li key={c.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{c.name}</span>
              <span className="tabular-nums">
                <span className="mr-2 text-muted-foreground">{t('adminPages.count', { count: c.orders })}</span>
                <b>{c.amount}억</b>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(c.amount / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

const ISSUE_BADGE = { new: 'info', delay: 'danger', deposit: 'warning', missing: 'neutral' } as const

function RecentIssues() {
  const { t } = useTranslation()
  return (
    <Panel title={t('adminPages.home.issues')}>
      <ul className="divide-y divide-divider">
        {homeStats.issues.map((i) => (
          <li key={i.title}>
            <Link to={i.to} className="flex gap-3 py-3 first:pt-0 hover:bg-muted/40">
              <Badge variant={ISSUE_BADGE[i.type]} className="mt-0.5">
                {t(`adminPages.home.issueTypes.${i.type}`)}
              </Badge>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{i.title}</div>
                <div className="truncate text-xs text-muted-foreground">{i.meta}</div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{i.at}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** 관리자 홈: 신규 오더 바로가기, 지표, 단계별 현황, 공지, 거래액, 이슈 */
export default function AdminHome() {
  const { t } = useTranslation()
  const admin = useAdminUser()
  const k = 'adminPages.home.kpi'
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold">{t('adminPages.home.greeting', { name: admin.name })}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('adminPages.home.sub')}</p>
        </div>
        <Link
          to="/admin/orders/incoming"
          className="flex items-center gap-3 rounded-xl bg-primary px-5 py-3 text-primary-foreground shadow-md transition-opacity hover:opacity-90"
        >
          <Mail className="size-5" />
          <span>
            <span className="block text-[15px] font-bold">{t('adminPages.home.cta')}</span>
            <span className="block text-xs opacity-80">
              {t('adminPages.home.ctaSub', { at: homeStats.lastIncoming.at, customer: homeStats.lastIncoming.customer })}
            </span>
          </span>
          <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-sm font-bold text-destructive">
            {t('adminPages.count', { count: adminCounts.newOrders })}
          </span>
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi to="/admin/orders/incoming" className="ring-primary" icon={<Mail className="size-5" />} iconClass="bg-primary-soft text-primary" label={t(`${k}.newOrders`)} value={<span className="text-primary">{adminCounts.newOrders}</span>} note={t(`${k}.newOrdersNote`)} noteClass="text-primary" />
        <Kpi to="/admin/orders" icon={<Package className="size-5" />} iconClass="bg-primary-soft text-primary" label={t(`${k}.active`)} value={homeStats.active.value} note={t(`${k}.vsYesterday`, { diff: homeStats.active.diff })} noteClass="text-success" />
        <Kpi to="/admin/orders?tab=attention" icon={<Clock className="size-5" />} iconClass="bg-danger-subtle text-destructive" label={t(`${k}.delayed`)} value={<span className="text-destructive">{homeStats.delayed.value}</span>} note={t(`${k}.vsYesterday`, { diff: homeStats.delayed.diff })} noteClass="text-success" />
        <Kpi to="/admin/orders?tab=logistics" icon={<Truck className="size-5" />} iconClass="bg-success-soft text-success" label={t(`${k}.shipToday`)} value={homeStats.shipToday.value} note={t(`${k}.vsYesterday`, { diff: homeStats.shipToday.diff })} />
        <Kpi to="/admin/customers" icon={<CreditCard className="size-5" />} iconClass="bg-warning-soft text-warning" label={t(`${k}.shortage`)} value={<span className="text-warning">{homeStats.shortage}</span>} note={t(`${k}.shortageNote`)} noteClass="text-warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StepProgress />
        <NoticeCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlyChart />
        <TopCustomers />
        <RecentIssues />
      </div>
    </div>
  )
}
