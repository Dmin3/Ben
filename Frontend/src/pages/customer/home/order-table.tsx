import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OrderProgress } from '@/components/order/order-progress'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Order, OrderFilter } from '@/mocks/customer-home'

const FILTERS: OrderFilter[] = ['needs_check', 'quote_pending', 'in_production', 'shipping']
const COLS = 'grid grid-cols-[180px_1fr_100px_84px_24px] items-center gap-4'

export function OrderTable({ orders }: { orders: Order[] }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<OrderFilter | 'all'>('all')
  const rows = filter === 'all' ? orders : orders.filter((o) => o.filters.includes(filter))

  const chips = [
    { key: 'all' as const, count: orders.length },
    ...FILTERS.map((f) => ({ key: f, count: orders.filter((o) => o.filters.includes(f)).length })),
  ]

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>{t('home.orders.title')}</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              className={cn(
                'h-8 rounded-full border px-3 text-xs font-semibold transition-colors',
                filter === c.key ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground/80 hover:bg-muted',
              )}
            >
              {t(`order.filters.${c.key}`)} {c.count}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className={cn(COLS, 'border-b px-2 pb-2.5 text-xs text-subtle-foreground')}>
            <span>{t('home.orders.colOrder')}</span>
            <span>{t('home.orders.colProgress')}</span>
            <span>{t('home.orders.colDue')}</span>
            <span>{t('home.orders.colStatus')}</span>
            <span />
          </div>

          {rows.map((o) => (
            <div key={o.id} className={cn(COLS, 'cursor-pointer border-b border-divider px-2 py-3 hover:bg-muted/60')}>
              <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground">{o.id}</div>
                <div className="truncate text-sm font-bold">{o.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.step === null
                    ? t('order.unassignedFactory')
                    : `${o.category} · ${t('units.pcs', { qty: o.quantity.toLocaleString('ko-KR') })}`}
                </div>
              </div>

              {o.step === null ? (
                <span className="text-[13px] text-muted-foreground">{t('order.quoteReviewing', { days: o.replyDays })}</span>
              ) : (
                <OrderProgress current={o.step} delayed={o.delayed} />
              )}

              <span className={cn('text-[13px] tabular-nums', o.delayed && 'font-semibold text-destructive')}>
                {o.dueDate ?? t('common.tbd')}
              </span>
              <OrderStatusBadge status={o.status} />
              <ChevronRight className="size-4 text-subtle-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
