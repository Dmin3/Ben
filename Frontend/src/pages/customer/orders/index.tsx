import { ArrowLeft, Clock, PencilLine, RefreshCw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { OrderProgress } from '@/components/order/order-progress'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { ORDER_STEPS } from '@/components/order/steps'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { num } from '@/lib/format'
import { cn } from '@/lib/utils'
import { findFactory } from '@/mocks/factories'
import { findOrder, type OrderDetail } from '@/mocks/orders'
import { products } from '@/mocks/products'
import { DialogForm } from '../my-info/info-parts'
import { useReorder } from '../products/reorder'
import { DocsTab, ImagesTab, PaymentTab, ProgressTab, RequestTab } from './tabs'

const ORDER_TABS = ['progress', 'request', 'images', 'docs', 'payment'] as const
type Tab = (typeof ORDER_TABS)[number]

const box = 'rounded-2xl bg-card ring-1 ring-border'

/** 들어온 화면(업무·제품·공장 등)으로 돌아간다. 주소로 바로 들어왔으면 업무 목록 */
function BackLink() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // react-router가 history.state.idx에 앱 안에서 이동한 횟수를 남긴다
  const back = () => ((window.history.state as { idx?: number } | null)?.idx ? navigate(-1) : navigate('/tasks'))
  return (
    <button type="button" onClick={back} className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />
      {t('orderDetail.back')}
    </button>
  )
}

/** 견적 전 요청 수정: 폼을 다시 채우지 않고 담당자에게 변경 내용을 보낸다 */
function EditRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!String(new FormData(e.currentTarget).get('change') ?? '').trim()) return
    // TODO(API): 요청 수정 API
    onOpenChange(false)
    toast.success(t('orderDetail.editSent'))
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogForm title={t('orderDetail.editRequest')} description={t('orderDetail.editDescription')} onSubmit={submit} submitLabel={t('orderDetail.editSubmit')}>
          <Textarea name="change" rows={6} required placeholder={t('orderDetail.editPlaceholder')} aria-label={t('orderDetail.editRequest')} />
        </DialogForm>
      </DialogContent>
    </Dialog>
  )
}

function StageCard({ order }: { order: OrderDetail }) {
  const { t } = useTranslation()
  if (order.step === null) {
    return (
      <section className={cn(box, 'space-y-3 p-5')}>
        <div className="flex items-center gap-3.5 rounded-xl bg-accent px-4 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
            <Clock className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-bold">{t('tasks.reviewing.title')}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{t('tasks.reviewing.description')}</div>
          </div>
        </div>
        {order.replyDays && (
          <div className="text-[13px]">
            <span className="text-muted-foreground">{t('tasks.reviewing.eta')}</span>{' '}
            <b className="font-semibold">{t('tasks.reviewing.etaValue', { days: order.replyDays })}</b>
          </div>
        )}
      </section>
    )
  }

  const done = order.step >= ORDER_STEPS.length
  const title = done ? t('tasks.stage.completed') : t(`tasks.stage.${ORDER_STEPS[order.step]}`)
  const latestNote = order.delayed ? order.events[0]?.note : undefined

  return (
    <section className={cn(box, 'space-y-4 p-5')}>
      <div className={cn('text-[15px] font-bold', order.delayed ? 'text-destructive' : 'text-primary')}>{title}</div>
      <div className="overflow-x-auto pb-1">
        <OrderProgress current={order.step} delayed={order.delayed} size="lg" />
      </div>
      {latestNote && <p className="rounded-lg bg-danger-subtle px-3 py-2.5 text-[13px]">{latestNote}</p>}
    </section>
  )
}

export default function OrderDetailPage() {
  const { t } = useTranslation()
  const order = findOrder(useParams().id)
  const [params, setParams] = useSearchParams()
  const reorder = useReorder()
  const [editOpen, setEditOpen] = useState(params.get('edit') === '1')

  const raw = params.get('tab')
  const tab: Tab = ORDER_TABS.includes(raw as Tab) ? (raw as Tab) : 'progress'
  const setTab = (next: Tab) => setParams({ tab: next }, { replace: true })

  if (!order) {
    return (
      <div className="space-y-5">
        <BackLink />
        <p className={cn(box, 'py-16 text-center text-sm text-muted-foreground')}>{t('orderDetail.notFound')}</p>
      </div>
    )
  }

  const factory = order.factoryId ? findFactory(order.factoryId) : undefined
  const product = products.find((p) => p.id === order.productId)
  const editable = order.step === null

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('orderDetail.title')}</h1>
      <BackLink />

      <section className={cn(box, 'flex flex-col gap-4 p-5 sm:flex-row lg:p-6')}>
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-muted text-[10px] text-subtle-foreground">
          {t('tasks.productImage')}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground tabular-nums">{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h2 className="text-xl font-extrabold">
            {product ? (
              <Link to={`/products/${product.id}`} className="hover:underline">
                {order.productName}
              </Link>
            ) : (
              order.productName
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
            {factory ? (
              <Link to={`/factories/${factory.id}`} className="font-semibold text-primary hover:underline">
                {factory.name}
              </Link>
            ) : (
              <span>{t('order.unassignedFactory')}</span>
            )}
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="tabular-nums">{t('units.pcs', { qty: num(order.quantity) })}</span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="tabular-nums">
              {order.dueDate
                ? t('tasks.due', { date: order.dueDate })
                : t('tasks.requestedArrival', { date: order.request.requestedArrival })}
            </span>
          </div>
          <div className="text-[13px] text-muted-foreground">
            {t('tasks.received', { date: order.receivedAt })} · {t('orderDetail.manager', { name: order.manager })}
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col">
          {editable && (
            <Button variant="outline" className="h-9 flex-1" onClick={() => setEditOpen(true)}>
              <PencilLine /> {t('orderDetail.editRequest')}
            </Button>
          )}
          {product && !editable && (
            <Button className="h-9 flex-1" onClick={() => reorder(product)}>
              <RefreshCw /> {t('products.reorder')}
            </Button>
          )}
        </div>
      </section>

      <StageCard order={order} />

      <div role="tablist" className="flex overflow-x-auto overflow-y-hidden border-b">
        {ORDER_TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-5 py-3 text-sm whitespace-nowrap transition-colors',
              tab === key ? 'border-primary font-bold text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`orderDetail.tabs.${key}`)}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'progress' && <ProgressTab order={order} />}
        {tab === 'request' && <RequestTab order={order} onEdit={editable ? () => setEditOpen(true) : undefined} />}
        {tab === 'images' && <ImagesTab order={order} />}
        {tab === 'docs' && <DocsTab order={order} />}
        {tab === 'payment' && <PaymentTab order={order} />}
      </div>

      <EditRequestDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
