import { Download, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { num, yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Factory } from '@/mocks/factories'
import { products } from '@/mocks/products'
import { ProductCard } from '../../products/product-card'

const box = 'rounded-2xl bg-card ring-1 ring-border'

function Empty() {
  const { t } = useTranslation()
  return <p className={cn(box, 'py-16 text-center text-sm text-muted-foreground')}>{t('factories.tabEmpty')}</p>
}

const HISTORY_COLS = 'grid grid-cols-[130px_minmax(0,1fr)_90px_110px_96px_84px] items-center gap-4'

export function HistoryTab({ factory }: { factory: Factory }) {
  const { t } = useTranslation()
  if (factory.history.length === 0) return <Empty />

  return (
    <div className={cn(box, 'overflow-x-auto')}>
      <div className="min-w-[680px]">
        <div className={cn(HISTORY_COLS, 'border-b px-5 py-3 text-xs text-subtle-foreground')}>
          <span>{t('factories.history.order')}</span>
          <span>{t('factories.history.product')}</span>
          <span className="text-right">{t('factories.history.quantity')}</span>
          <span className="text-right">{t('factories.history.amount')}</span>
          <span>{t('factories.history.date')}</span>
          <span>{t('factories.history.status')}</span>
        </div>
        {factory.history.map((o) => (
          <div key={o.id} className={cn(HISTORY_COLS, 'border-b border-divider px-5 py-3.5 text-sm last:border-0')}>
            <span className="text-muted-foreground tabular-nums">{o.id}</span>
            <span className="truncate font-semibold">{o.product}</span>
            <span className="text-right tabular-nums">{t('units.pcs', { qty: num(o.quantity) })}</span>
            <span className="text-right font-semibold tabular-nums">{yuan(o.amount)}</span>
            <span className="tabular-nums">{o.date}</span>
            <OrderStatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProductsTab({ factory }: { factory: Factory }) {
  const rows = products.filter((p) => p.factoryId === factory.id)
  if (rows.length === 0) return <Empty />
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

export function IssuesTab({ factory }: { factory: Factory }) {
  const { t } = useTranslation()
  if (factory.issues.length === 0) return <Empty />

  return (
    <ul className={cn(box, 'divide-y divide-divider')}>
      {factory.issues.map((i) => (
        <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-4">
          <Badge variant={i.type === 'defect' ? 'danger' : i.type === 'delay' ? 'warning' : 'neutral'}>
            {t(`factories.issueTypes.${i.type}`)}
          </Badge>
          <span className="min-w-0 flex-1 text-sm font-semibold">{i.title}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {i.orderId && `${i.orderId} · `}
            {i.date}
          </span>
          <Badge variant={i.resolved ? 'success' : 'info'}>{t(`factories.issueStatus.${i.resolved ? 'resolved' : 'open'}`)}</Badge>
        </li>
      ))}
    </ul>
  )
}

export function FilesTab({ factory }: { factory: Factory }) {
  const { t } = useTranslation()
  if (factory.files.length === 0) return <Empty />

  return (
    <ul className={cn(box, 'divide-y divide-divider')}>
      {factory.files.map((f) => (
        <li key={f.id} className="flex items-center gap-3 px-5 py-3.5">
          <FileText className="size-5 shrink-0 text-subtle-foreground" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{f.name}</div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {f.size} · {f.date}
            </div>
          </div>
          {/* TODO(API): 파일 다운로드 URL */}
          <Button variant="outline" size="sm" onClick={() => toast(t('common.comingSoon'))}>
            <Download /> {t('factories.download')}
          </Button>
        </li>
      ))}
    </ul>
  )
}
