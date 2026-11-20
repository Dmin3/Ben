import { Download, FileText, ImageIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { num, yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { addresses } from '@/mocks/my-info'
import type { OrderDetail } from '@/mocks/orders'

const box = 'rounded-2xl bg-card ring-1 ring-border'

function Empty({ children }: { children: ReactNode }) {
  return <p className={cn(box, 'py-16 text-center text-sm text-muted-foreground')}>{children}</p>
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-divider py-3 text-sm last:border-0">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-keep whitespace-pre-line">{children}</dd>
    </div>
  )
}

/** 진행 기록 (최근 것이 위) */
export function ProgressTab({ order }: { order: OrderDetail }) {
  return (
    <ol className={cn(box, 'space-y-0 p-5')}>
      {order.events.map((e, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          {i < order.events.length - 1 && <span aria-hidden className="absolute top-3 left-[5px] h-full w-px bg-border" />}
          <span className={cn('relative mt-1.5 size-[11px] shrink-0 rounded-full', i === 0 ? 'bg-primary' : 'bg-border')} />
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground tabular-nums">{e.date}</div>
            <div className="text-sm font-semibold">{e.title}</div>
            {e.note && <div className="mt-0.5 text-[13px] text-muted-foreground">{e.note}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** 처음 요청한 내용 (새 오더 화면에서 적은 값) */
export function RequestTab({ order, onEdit }: { order: OrderDetail; onEdit?: () => void }) {
  const { t } = useTranslation()
  const r = order.request
  const dest = addresses.find((a) => a.id === r.destination)
  const total = r.quantities.reduce((s, q) => s + q.qty, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <section className={cn(box, 'px-5 py-2')}>
        <dl>
          <Row label={t('newOrder.fields.process')}>{t(`newOrder.processTypes.${r.process}`)}</Row>
          <Row label={t('newOrder.fields.dueDate')}>{r.requestedArrival}</Row>
          <Row label={t('newOrder.fields.shipping')}>{t(`newOrder.shippingMethods.${r.shipping}`)}</Row>
          <Row label={t('newOrder.fields.destination')}>{dest ? `${dest.name} · ${dest.address}` : '-'}</Row>
          <Row label={t('newOrder.fields.inspection')}>{r.inspection || '-'}</Row>
          <Row label={t('newOrder.fields.memo')}>{r.memo || '-'}</Row>
        </dl>
      </section>

      <section className={cn(box, 'space-y-4 p-5')}>
        <h3 className="text-sm font-bold">{t('newOrder.sections.quantity.title')}</h3>
        <table className="w-full text-sm">
          <thead className="text-xs text-subtle-foreground">
            <tr className="border-b">
              <th className="pb-2 text-left font-normal">{t('newOrder.fields.color')}</th>
              <th className="pb-2 text-left font-normal">{t('newOrder.fields.size')}</th>
              <th className="pb-2 text-right font-normal">{t('newOrder.fields.qty')}</th>
            </tr>
          </thead>
          <tbody>
            {r.quantities.map((q, i) => (
              <tr key={i} className="border-b border-divider">
                <td className="py-2.5">{q.color}</td>
                <td className="py-2.5">{q.size}</td>
                <td className="py-2.5 text-right tabular-nums">{num(q.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-2.5 font-semibold">
                {t('newOrder.fields.total')}
              </td>
              <td className="pt-2.5 text-right font-bold tabular-nums">{t('units.pcs', { qty: num(total) })}</td>
            </tr>
          </tfoot>
        </table>
        {onEdit && (
          <Button variant="outline" className="w-full" onClick={onEdit}>
            {t('orderDetail.editRequest')}
          </Button>
        )}
      </section>
    </div>
  )
}

function ImageGrid({ label, count }: { label: string; count: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-muted text-[11px] text-subtle-foreground"
        >
          <ImageIcon className="size-5" />
          {label} {i + 1}
        </div>
      ))}
    </div>
  )
}

/** 샘플 · QC 이미지. QC 확인이 필요하면 확인/재검품 요청을 받는다 */
export function ImagesTab({ order }: { order: OrderDetail }) {
  const { t } = useTranslation()
  // TODO(API): QC 확인/재검품 요청 API. 지금은 화면 안에서만 바뀐다
  const [qcPending, setQcPending] = useState(!!order.images.qcPending)
  const { sample, qc } = order.images
  if (sample + qc === 0) return <Empty>{t('orderDetail.noImages')}</Empty>

  const decide = (ok: boolean) => {
    setQcPending(false)
    toast.success(t(ok ? 'orderDetail.qcApproved' : 'orderDetail.qcRecheck'))
  }

  return (
    <div className="space-y-4">
      {qcPending && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-warning-subtle p-4">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{t('orderDetail.qcPendingTitle')}</div>
            <div className="text-[13px] text-muted-foreground">{t('orderDetail.qcPendingBody')}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => decide(false)}>
              {t('orderDetail.qcRecheckButton')}
            </Button>
            <Button onClick={() => decide(true)}>{t('orderDetail.qcApproveButton')}</Button>
          </div>
        </div>
      )}
      {[
        { key: 'sample', count: sample, label: t('orderDetail.sampleImages') },
        { key: 'qc', count: qc, label: t('orderDetail.qcImages') },
      ].map((s) => (
        <section key={s.key} className={cn(box, 'space-y-3 p-5')}>
          <h3 className="text-sm font-bold">
            {s.label} <span className="font-normal text-muted-foreground tabular-nums">{s.count}</span>
          </h3>
          {s.count === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">{t('orderDetail.noImagesYet')}</p>
          ) : (
            <ImageGrid label={s.label} count={s.count} />
          )}
        </section>
      ))}
    </div>
  )
}

export function DocsTab({ order }: { order: OrderDetail }) {
  const { t } = useTranslation()
  if (order.documents.length === 0) return <Empty>{t('orderDetail.noDocs')}</Empty>
  return (
    <ul className={cn(box, 'divide-y divide-divider')}>
      {order.documents.map((d) => (
        <li key={d.id} className="flex items-center gap-3 px-5 py-3.5">
          <FileText className="size-5 shrink-0 text-subtle-foreground" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-primary">{t(`orderDetail.docKinds.${d.kind}`)}</div>
            <div className="truncate text-sm font-semibold">{d.name}</div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {d.size} · {d.date}
            </div>
          </div>
          {/* TODO(API): 서류 다운로드 URL */}
          <Button variant="outline" size="sm" onClick={() => toast(t('common.comingSoon'))}>
            <Download /> {t('factories.download')}
          </Button>
        </li>
      ))}
    </ul>
  )
}

// ponytail: 계약금 30% / 잔금 70%, 잔금은 출고 단계에서 차감된다고 가정. 실제 비율·시점은 견적 API 값으로 바꾼다
const DEPOSIT_RATE = 0.3
const OUTBOUND_STEP = 4

export function PaymentTab({ order }: { order: OrderDetail }) {
  const { t } = useTranslation()
  if (order.unitPrice === undefined || order.step === null) return <Empty>{t('orderDetail.noPayment')}</Empty>

  const total = order.unitPrice * order.quantity
  const deposit = Math.round(total * DEPOSIT_RATE)
  const balanceDone = order.step >= OUTBOUND_STEP
  const state = (done: boolean) => (
    <span className={cn('ml-2 text-xs font-semibold', done ? 'text-success' : 'text-warning')}>
      {t(done ? 'orderDetail.deducted' : 'orderDetail.scheduled')}
    </span>
  )

  return (
    <section className={cn(box, 'space-y-3 px-5 py-2')}>
      <dl>
        <Row label={t('products.unitPrice')}>
          <span className="tabular-nums">{yuan(order.unitPrice)}</span>
        </Row>
        <Row label={t('newOrder.fields.qty')}>
          <span className="tabular-nums">{t('units.pcs', { qty: num(order.quantity) })}</span>
        </Row>
        <Row label={t('orderDetail.total')}>
          <b className="tabular-nums">{yuan(total)}</b>
        </Row>
        <Row label={t('orderDetail.depositPart')}>
          <span className="tabular-nums">{yuan(deposit)}</span>
          {state(true)}
        </Row>
        <Row label={t('orderDetail.balancePart')}>
          <span className="tabular-nums">{yuan(total - deposit)}</span>
          {state(balanceDone)}
        </Row>
      </dl>
      <Link to="/deposit" className={cn(buttonVariants({ variant: 'outline' }), 'mb-3 w-full')}>
        {t('orderDetail.toDeposit')}
      </Link>
    </section>
  )
}
