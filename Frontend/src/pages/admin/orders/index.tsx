import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { FilterChips } from '@/components/filter-chips'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { factories, findFactory } from '@/mocks/factories'
import { adminOrders, customers, managers, type AdminOrder } from '@/mocks/admin'
import { panel, td, th } from '../styles'
import { PageHead, Pick, StepBar } from '../ui'

type Tab = 'all' | 'quote' | 'sample' | 'production' | 'logistics' | 'attention'
const TABS: Tab[] = ['all', 'quote', 'sample', 'production', 'logistics', 'attention']

/** 탭별 단계 묶음 (ADMIN_STEPS 인덱스). 발주는 생산에 넣는다 */
const inTab = (o: AdminOrder, tab: Tab) => {
  switch (tab) {
    case 'all':
      return true
    case 'quote':
      return o.step === 0
    case 'sample':
      return o.step === 1
    case 'production':
      return o.step >= 2 && o.step <= 5
    case 'logistics':
      return o.step >= 6
    case 'attention':
      return o.status === 'needs_check' || o.status === 'delayed'
  }
}

const STATUS_BADGE = { needs_check: 'warning', delayed: 'danger', normal: 'success' } as const

function StatusBadge({ status }: { status: AdminOrder['status'] }) {
  const { t } = useTranslation()
  if (status === 'quote') return <span className="text-muted-foreground">-</span>
  return <Badge variant={STATUS_BADGE[status]}>{t(`adminPages.status.${status}`)}</Badge>
}

function OrderRow({ o, showCustomer }: { o: AdminOrder; showCustomer?: boolean }) {
  const { t } = useTranslation()
  const p = 'adminPages.orders'
  const factory = o.factoryId ? findFactory(o.factoryId) : undefined
  const customer = customers.find((c) => c.id === o.customerId)
  return (
    <tr className="border-b border-divider hover:bg-muted/40">
      <td className={td}>
        <Link to={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">{o.id}</Link>
      </td>
      {showCustomer && <td className={td}>{customer?.name}</td>}
      <td className={td}>{o.product}</td>
      <td className={cn(td, !factory && 'text-subtle-foreground')}>{factory?.name ?? t(`${p}.quoting`)}</td>
      <td className={cn(td, 'text-right tabular-nums')}>{o.quantity?.toLocaleString('ko-KR') ?? t('adminPages.tbd')}</td>
      <td className={cn(td, 'tabular-nums', o.delayed && 'font-semibold text-destructive')}>{o.dueDate ?? t('adminPages.tbd')}</td>
      <td className={td}><StepBar step={o.step} delayed={o.delayed} /></td>
      <td className={td}>
        <div>{o.main}</div>
        <div className="text-xs text-subtle-foreground">{o.sub ? t(`${p}.sub`, { name: o.sub }) : t(`${p}.subNone`)}</div>
      </td>
      <td className={td}><StatusBadge status={o.status} /></td>
    </tr>
  )
}

/** 고객 주문종합: 고객사별(묶음) 또는 오더별(한 줄씩)로 진행 상황을 본다 */
export default function OrderSummary() {
  const { t } = useTranslation()
  const p = 'adminPages.orders'
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>((TABS.includes(params.get('tab') as Tab) ? params.get('tab') : 'all') as Tab)
  const [query, setQuery] = useState('')
  const [factory, setFactory] = useState<string | null>(null)
  const [manager, setManager] = useState<string | null>(null)
  const [view, setView] = useState<'customer' | 'order'>('customer')
  const [collapsed, setCollapsed] = useState<string[]>([])
  const step = params.get('step')
  const customerFilter = params.get('customer')

  // TODO(API): 주문 목록 API (검색·필터는 서버에서)
  const q = query.trim().toLowerCase()
  const rows = adminOrders.filter((o) => {
    const c = customers.find((x) => x.id === o.customerId)
    return (
      inTab(o, tab) &&
      (step === null || o.step === Number(step)) &&
      (!customerFilter || o.customerId === customerFilter) &&
      (!factory || factory === 'all' || o.factoryId === factory) &&
      (!manager || manager === 'all' || o.main === manager || o.sub === manager) &&
      (!q || [o.id, o.product, c?.name].some((v) => v?.toLowerCase().includes(q)))
    )
  })
  const groups = customers.map((c) => ({ c, orders: rows.filter((o) => o.customerId === c.id) })).filter((g) => g.orders.length)

  const tabs = TABS.map((v) => ({ value: v, label: t(`${p}.tabs.${v}`), count: adminOrders.filter((o) => inTab(o, v)).length }))
  const head = (
    <tr className="border-b bg-muted/40">
      <th className={th}>{t(`${p}.cols.order`)}</th>
      {view === 'order' && <th className={th}>{t(`${p}.cols.customer`)}</th>}
      <th className={th}>{t(`${p}.cols.product`)}</th>
      <th className={th}>{t(`${p}.cols.factory`)}</th>
      <th className={cn(th, 'text-right')}>{t(`${p}.cols.qty`)}</th>
      <th className={th}>{t(`${p}.cols.due`)}</th>
      <th className={th}>{t(`${p}.cols.step`)}</th>
      <th className={th}>{t(`${p}.cols.manager`)}</th>
      <th className={th}>{t(`${p}.cols.status`)}</th>
    </tr>
  )

  return (
    <div>
      <PageHead crumb={t(`${p}.crumb`)} title={t(`${p}.title`)} desc={t(`${p}.desc`)} />
      <FilterChips options={tabs} value={tab} onChange={setTab} className="mb-4" />

      <section className={cn(panel, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(`${p}.searchPlaceholder`)} aria-label={t('adminPages.search')} className="h-10 pl-9" />
          </div>
          <Pick
            className="w-36"
            label={t(`${p}.allFactories`)}
            value={factory}
            onChange={setFactory}
            placeholder={t(`${p}.allFactories`)}
            options={[{ value: 'all', label: t(`${p}.allFactories`) }, ...factories.map((f) => ({ value: f.id, label: f.name }))]}
          />
          <Pick
            className="w-36"
            label={t(`${p}.allManagers`)}
            value={manager}
            onChange={setManager}
            placeholder={t(`${p}.allManagers`)}
            options={[{ value: 'all', label: t(`${p}.allManagers`) }, ...managers.map((m) => ({ value: m.name, label: m.name }))]}
          />
          <div role="radiogroup" className="ml-auto flex rounded-lg border p-0.5">
            {(['customer', 'order'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={cn('rounded-md px-3 py-1.5 text-[13px] font-semibold', view === v ? 'bg-primary-soft text-primary' : 'text-muted-foreground')}
              >
                {t(`${p}.${v === 'customer' ? 'byCustomer' : 'byOrder'}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>{head}</thead>
            {rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-muted-foreground">{t(`${p}.empty`)}</td>
                </tr>
              </tbody>
            ) : view === 'order' ? (
              <tbody>{rows.map((o) => <OrderRow key={o.id} o={o} showCustomer />)}</tbody>
            ) : (
              groups.map(({ c, orders }) => {
                const open = !collapsed.includes(c.id)
                const delayed = orders.filter((o) => o.status === 'delayed').length
                const check = orders.filter((o) => o.status === 'needs_check').length
                return (
                  <tbody key={c.id}>
                    <tr className="border-b bg-muted/60">
                      <td colSpan={9} className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <Link to={`/admin/customers/${c.id}`} className="font-bold hover:underline">{c.name}</Link>
                          <span className="text-xs text-muted-foreground">{c.owner}</span>
                          <span className="text-xs">{t(`${p}.activeCount`, { count: orders.length })}</span>
                          {delayed > 0 && <Badge variant="danger">{t(`${p}.delayedCount`, { count: delayed })}</Badge>}
                          {check > 0 && <Badge variant="warning">{t(`${p}.checkCount`, { count: check })}</Badge>}
                          <span className="ml-auto text-xs text-muted-foreground">
                            {t(`${p}.balance`)}{' '}
                            <b className={cn('text-sm tabular-nums', c.balance < 0 ? 'text-destructive' : 'text-foreground')}>
                              {c.balance.toLocaleString('ko-KR')} {t('adminPages.yuanUnit')}
                            </b>
                          </span>
                          <button
                            type="button"
                            aria-expanded={open}
                            onClick={() => setCollapsed((l) => (open ? [...l, c.id] : l.filter((x) => x !== c.id)))}
                            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {t(`${p}.${open ? 'collapse' : 'expand'}`)}
                            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && orders.map((o) => <OrderRow key={o.id} o={o} />)}
                  </tbody>
                )
              })
            )}
          </table>
        </div>
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          {t(`${p}.footer`, { customers: groups.length, orders: rows.length })}
        </div>
      </section>
    </div>
  )
}
