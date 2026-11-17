import type { TFunction } from 'i18next'
import { ImageIcon, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { num, yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { findFactory } from '@/mocks/factories'
import type { Product } from '@/mocks/products'
import { useReorder } from './reorder'

function QualityBadge({ quality }: { quality: Product['quality'] }) {
  const { t } = useTranslation()
  return <Badge variant={quality === 'A' ? 'info' : 'success'}>{t(`products.grades.${quality}`)}</Badge>
}

/** 카테고리 | 공장(링크) */
function CategoryFactory({ product }: { product: Product }) {
  const { t } = useTranslation()
  const factory = findFactory(product.factoryId)
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="text-muted-foreground">{t(`products.categories.${product.category}`)}</span>
      <span aria-hidden className="h-3 w-px bg-border" />
      {factory ? (
        <Link to={`/factories/${factory.id}`} className="font-semibold text-primary hover:underline">
          {factory.name}
        </Link>
      ) : (
        <span>-</span>
      )}
    </div>
  )
}

function specsOf(p: Product, t: TFunction) {
  return {
    unitPrice: yuan(p.unitPrice),
    moq: t(p.moqUnit === 'pcs' ? 'units.pcs' : 'units.ea', { qty: num(p.moq) }),
    avgLead: t('units.days', { count: p.avgLeadDays }),
    runs: t('units.times', { count: p.runs }),
  }
}

function Spec({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-1 px-3 py-2.5', className)}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-[15px] font-bold tabular-nums">{children}</dd>
    </div>
  )
}

/** 카드 보기: 사진 + 기본 정보 + 단가/MOQ/납기/퀄리티 + 리오더 버튼 */
export function ProductCard({ product: p }: { product: Product }) {
  const { t } = useTranslation()
  const reorder = useReorder()
  const specs = specsOf(p, t)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <div className="flex aspect-[16/10] flex-col items-center justify-center gap-1 bg-muted text-xs text-subtle-foreground">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <>
            <ImageIcon className="size-5" />
            {t('products.photo')}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold">{p.name}</h3>
          <CategoryFactory product={p} />
          <div className="text-xs text-muted-foreground">
            {t('products.lastMade', { date: p.lastMadeAt })}
            {p.lastOrderId && ` | ${p.lastOrderId}`}
          </div>
        </div>

        <dl className="grid grid-cols-2 overflow-hidden rounded-xl border">
          <Spec label={t('products.unitPrice')} className="border-r border-b">
            {specs.unitPrice}
          </Spec>
          <Spec label={t('products.moq')} className="border-b">
            {specs.moq}
          </Spec>
          <Spec label={t('products.avgLead')} className="border-r border-b">
            {specs.avgLead}
          </Spec>
          <Spec label={t('products.quality')} className="border-b">
            <QualityBadge quality={p.quality} />
          </Spec>
          <div className="col-span-2 flex items-center justify-between bg-muted/50 px-3 py-2.5">
            <dt className="text-[11px] text-muted-foreground">{t('products.runs')}</dt>
            <dd className="text-[15px] font-bold tabular-nums">{specs.runs}</dd>
          </div>
        </dl>

        <Button className="mt-auto h-11 w-full font-semibold" onClick={() => reorder(p)}>
          <RefreshCw /> {t('products.reorder')}
        </Button>
      </div>
    </article>
  )
}

const COLS = 'grid grid-cols-[minmax(0,1fr)_88px_96px_88px_88px_72px_120px] items-center gap-4'

/** 목록 보기: 한 줄에 한 제품 */
export function ProductTable({ products }: { products: Product[] }) {
  const { t } = useTranslation()
  const reorder = useReorder()

  return (
    <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-border">
      <div className="min-w-[800px]">
        <div className={cn(COLS, 'border-b px-5 py-3 text-xs text-subtle-foreground')}>
          <span>{t('products.colProduct')}</span>
          <span className="text-right">{t('products.unitPrice')}</span>
          <span className="text-right">{t('products.moq')}</span>
          <span className="text-right">{t('products.avgLead')}</span>
          <span>{t('products.quality')}</span>
          <span className="text-right">{t('products.runs')}</span>
          <span />
        </div>
        {products.map((p) => {
          const specs = specsOf(p, t)
          return (
            <div key={p.id} className={cn(COLS, 'border-b border-divider px-5 py-3.5 last:border-0')}>
              <div className="min-w-0 space-y-0.5">
                <div className="truncate text-sm font-bold">{p.name}</div>
                <CategoryFactory product={p} />
              </div>
              <span className="text-right text-sm font-semibold tabular-nums">{specs.unitPrice}</span>
              <span className="text-right text-sm tabular-nums">{specs.moq}</span>
              <span className="text-right text-sm tabular-nums">{specs.avgLead}</span>
              <QualityBadge quality={p.quality} />
              <span className="text-right text-sm tabular-nums">{specs.runs}</span>
              <Button size="sm" className="h-9 font-semibold" onClick={() => reorder(p)}>
                <RefreshCw /> {t('products.reorder')}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
