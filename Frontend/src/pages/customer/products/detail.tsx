import { ArrowLeft, ImageIcon, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { Button } from '@/components/ui/button'
import { num, yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ordersOfProduct } from '@/mocks/orders'
import { products } from '@/mocks/products'
import { CategoryFactory, QualityBadge } from './product-card'
import { useReorder } from './reorder'

const box = 'rounded-2xl bg-card ring-1 ring-border'
const COLS = 'grid grid-cols-[130px_96px_90px_110px_96px_84px] items-center gap-4'

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link to="/products" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />
      {t('productDetail.backToList')}
    </Link>
  )
}

/** 제작 제품 상세: 기본 사양 + 제작 이력(오더 상세로 이동) + 리오더 */
export default function ProductDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const reorder = useReorder()
  const { id } = useParams()
  const p = products.find((x) => x.id === id)

  if (!p) {
    return (
      <div className="space-y-5">
        <BackLink />
        <p className={cn(box, 'py-16 text-center text-sm text-muted-foreground')}>{t('productDetail.notFound')}</p>
      </div>
    )
  }

  const history = ordersOfProduct(p.name)
  const specs = [
    { label: t('products.unitPrice'), value: yuan(p.unitPrice) },
    { label: t('products.moq'), value: t(p.moqUnit === 'pcs' ? 'units.pcs' : 'units.ea', { qty: num(p.moq) }) },
    { label: t('products.avgLead'), value: t('units.days', { count: p.avgLeadDays }) },
    { label: t('products.runs'), value: t('units.times', { count: p.runs }) },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('nav.products')}</h1>
      <BackLink />

      <section className={cn(box, 'flex flex-col gap-5 p-5 sm:flex-row lg:p-6')}>
        <div className="flex aspect-[4/3] shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-muted text-xs text-subtle-foreground sm:w-56">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt="" className="size-full rounded-xl object-cover" />
          ) : (
            <>
              <ImageIcon className="size-5" />
              {t('products.photo')}
            </>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold">{p.name}</h2>
              <QualityBadge quality={p.quality} />
            </div>
            <Button className="h-9" onClick={() => reorder(p)}>
              <RefreshCw /> {t('products.reorder')}
            </Button>
          </div>
          <CategoryFactory product={p} />
          <div className="text-[13px] text-muted-foreground">{t('products.lastMade', { date: p.lastMadeAt })}</div>
          <dl className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
            {specs.map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 px-3 py-2.5">
                <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                <dd className="text-[15px] font-bold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">{t('products.notice')}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">{t('productDetail.history')}</h2>
        {history.length === 0 ? (
          <p className={cn(box, 'py-12 text-center text-sm text-muted-foreground')}>{t('productDetail.noHistory')}</p>
        ) : (
          <div className={cn(box, 'overflow-x-auto')}>
            <div className="min-w-[640px]">
              <div className={cn(COLS, 'border-b px-5 py-3 text-xs text-subtle-foreground')}>
                <span>{t('factories.history.order')}</span>
                <span className="text-right">{t('factories.history.quantity')}</span>
                <span className="text-right">{t('products.unitPrice')}</span>
                <span className="text-right">{t('factories.history.amount')}</span>
                <span>{t('factories.history.date')}</span>
                <span>{t('factories.history.status')}</span>
              </div>
              {history.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className={cn(COLS, 'w-full border-b border-divider px-5 py-3.5 text-left text-sm last:border-0 hover:bg-muted/60')}
                >
                  <span className="font-semibold text-primary tabular-nums">{o.id}</span>
                  <span className="text-right tabular-nums">{t('units.pcs', { qty: num(o.quantity) })}</span>
                  <span className="text-right tabular-nums">{yuan(Math.round(o.amount / o.quantity))}</span>
                  <span className="text-right font-semibold tabular-nums">{yuan(o.amount)}</span>
                  <span className="tabular-nums">{o.date}</span>
                  <OrderStatusBadge status={o.status} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
