import { Check, Ellipsis, FileText, ImageIcon } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { findFactory } from '@/mocks/factories'
import { ADMIN_STEPS, INTERNAL_STEPS, findAdminOrder, findCustomer, managers, orderExtras } from '@/mocks/admin'
import { panel } from '../styles'
import { Panel, Pick, Switch } from '../ui'

/** 9단계 타임라인. 회색 단계(견적·발주)는 내부 전용 */
function Timeline({ step, delayed }: { step: number; delayed: boolean }) {
  const { t } = useTranslation()
  const p = 'adminPages.orderDetail'
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[640px]">
        {ADMIN_STEPS.map((s, i) => {
          const internal = INTERNAL_STEPS.includes(s)
          const done = i < step
          const current = i === step
          const date = orderExtras.stepDates[i]
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center gap-1.5">
              {i < ADMIN_STEPS.length - 1 && (
                <span aria-hidden className={cn('absolute top-[11px] left-1/2 h-0.5 w-full', done ? 'bg-primary' : 'bg-border')} />
              )}
              <span
                className={cn(
                  'relative flex size-6 items-center justify-center rounded-full border-2',
                  done && (internal ? 'border-subtle-foreground bg-subtle-foreground' : 'border-primary bg-primary'),
                  current && (delayed ? 'border-destructive bg-card' : 'border-primary bg-card'),
                  !done && !current && 'border-border bg-card',
                )}
              >
                {done && <Check className="size-3.5 text-white" strokeWidth={3} />}
                {current && <span className={cn('size-2.5 rounded-full', delayed ? 'bg-destructive' : 'bg-primary')} />}
              </span>
              <span className={cn('text-xs', current ? 'font-bold text-primary' : internal ? 'text-subtle-foreground' : 'text-foreground')}>
                {t(`adminPages.steps.${s}`)}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {current ? t(`${p}.inProgress`) : done ? date : date ? t(`${p}.planned`, { date }) : '-'}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function CheckItem({ done, title, note, action, onAction }: { done: boolean; title: string; note: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-border">
      <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', done ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
        {done ? <Check className="size-3.5" /> : '!'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{note}</div>
      </div>
      {!done && action && (
        <button type="button" onClick={onAction} className="text-[13px] font-semibold text-primary hover:underline">
          {action}
        </button>
      )}
    </div>
  )
}

/** 고객 공개 자료 한 묶음: 제목 + 고객 공개 스위치 + 추가 버튼 */
function PublicSection({ title, note, noteDanger, defaultPublic, action, children }: {
  title: string
  note: string
  noteDanger?: boolean
  defaultPublic: boolean
  action?: ReactNode
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const [shown, setShown] = useState(defaultPublic)
  return (
    <div className="space-y-3 border-b border-divider py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{title}</div>
          <div className={cn('text-xs', noteDanger ? 'text-destructive' : 'text-muted-foreground')}>{note}</div>
        </div>
        {action !== undefined && (
          <>
            <span className="text-xs text-muted-foreground">{t('adminPages.orderDetail.showCustomer')}</span>
            <Switch checked={shown} onChange={setShown} label={`${title} ${t('adminPages.orderDetail.showCustomer')}`} />
            {action}
          </>
        )}
      </div>
      {children}
    </div>
  )
}

function Memos() {
  const { t } = useTranslation()
  const p = 'adminPages.orderDetail'
  // TODO(API): 내부 메모 저장
  const [memos, setMemos] = useState(orderExtras.memos)
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('memo') as HTMLInputElement
    if (!input.value.trim()) return
    setMemos((l) => [{ who: '김대표', at: '방금', text: input.value.trim() }, ...l])
    input.value = ''
  }
  return (
    <Panel title={<>{t(`${p}.memo`)} <Badge variant="neutral">{t('adminPages.internal')}</Badge></>}>
      <ul className="space-y-2.5">
        {memos.map((m, i) => (
          <li key={i} className="rounded-xl bg-muted/60 p-3.5">
            <div className="flex justify-between text-xs">
              <b>{m.who}</b>
              <span className="text-muted-foreground">{m.at}</span>
            </div>
            <p className="mt-1.5 text-sm">{m.text}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <Input name="memo" placeholder={t(`${p}.memoPlaceholder`)} aria-label={t(`${p}.memo`)} className="h-10" />
        <Button type="submit" className="h-10 bg-foreground text-background hover:bg-foreground/90">{t('adminPages.register')}</Button>
      </form>
    </Panel>
  )
}

/** 관리자 주문 상세: 단계, 출고 전 체크리스트, 고객 공개 자료, 이슈, 금액, 담당자, 메모, 활동 기록 */
export default function AdminOrderDetail() {
  const { t } = useTranslation()
  const p = 'adminPages.orderDetail'
  const { id } = useParams()
  const order = findAdminOrder(id)
  const [issueOpen, setIssueOpen] = useState(true)
  const [main, setMain] = useState<string | null>(order?.main ?? null)
  const [sub, setSub] = useState<string | null>(order?.sub ?? null)
  const soon = () => toast(t('common.comingSoon'))

  if (!order) {
    return (
      <div className="space-y-4">
        <Link to="/admin/orders" className="text-[13px] text-muted-foreground hover:text-foreground">← {t(`${p}.back`)}</Link>
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t(`${p}.notFound`)}</p>
      </div>
    )
  }

  const customer = findCustomer(order.customerId)
  const factory = order.factoryId ? findFactory(order.factoryId) : undefined
  const done = orderExtras.checklistDone
  const remaining = Object.values(done).filter((v) => !v).length
  const atInspection = ADMIN_STEPS[order.step] === 'inspection'
  const next = ADMIN_STEPS[order.step + 1]
  const people = managers.map((m) => ({ value: m.name, label: `${m.name} ${t('adminPages.roles.MANAGER')}` }))
  const totalFee = orderExtras.fees.reduce((s, f) => s + f.amount, 0)

  return (
    <div className="space-y-4">
      <Link to="/admin/orders" className="text-[13px] text-muted-foreground hover:text-foreground">← {t(`${p}.back`)}</Link>

      <section className={cn(panel, 'space-y-5 p-6')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tabular-nums">{order.id}</h1>
              {order.status !== 'quote' && <Badge variant={order.status === 'normal' ? 'success' : order.status === 'delayed' ? 'danger' : 'warning'}>{t(`adminPages.status.${order.status}`)}</Badge>}
              <Badge variant="info">{t('adminPages.stepNow', { step: t(`adminPages.steps.${ADMIN_STEPS[order.step]}`) })}</Badge>
            </div>
            <div className="font-semibold">
              {order.product} {order.quantity && t('units.pcs', { qty: order.quantity.toLocaleString('ko-KR') })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span>
                {t(`${p}.meta.customer`)}{' '}
                <Link to={`/admin/customers/${order.customerId}`} className="font-semibold text-primary hover:underline">{customer?.name}</Link>
              </span>
              {factory && (
                <span>
                  {t(`${p}.meta.factory`)}{' '}
                  <Link to={`/admin/factories/${factory.id}`} className="font-semibold text-primary hover:underline">{factory.name}</Link>
                </span>
              )}
              {order.dueDate && <span>{t(`${p}.meta.due`, { date: order.dueDate })}</span>}
              <span>{t(`${p}.meta.managers`, { main: main ?? '-', sub: sub ?? '-' })}</span>
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" nativeButton={false} render={<Link to={`/orders/${order.id}`} target="_blank" />}>{t(`${p}.customerView`)}</Button>
              <Button variant="outline" onClick={() => toast.success(t(`${p}.notifyToast`))}>{t(`${p}.notify`)}</Button>
              {next && (
                <Button disabled={atInspection && remaining > 0} onClick={() => toast.success(t(`${p}.nextStepDone`, { step: t(`adminPages.steps.${next}`) }))}>
                  {t(`${p}.nextStep`, { step: t(`adminPages.steps.${next}`) })}
                </Button>
              )}
            </div>
            {atInspection && remaining > 0 && <p className="text-xs text-warning">{t(`${p}.nextStepHint`, { count: remaining })}</p>}
          </div>
        </div>
        <Timeline step={order.step} delayed={order.delayed} />
        <p className="text-xs text-muted-foreground">{t(`${p}.internalHint`)}</p>
      </section>

      {atInspection && (
        <section className="space-y-3 rounded-2xl bg-warning-subtle/60 p-5 ring-1 ring-warning/40">
          <h2 className="font-bold">
            {t(`${p}.checklist`)} <span className="text-warning">{4 - remaining} / 4</span>
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <CheckItem done={done.report} title={t(`${p}.check.report`)} note={t(`${p}.check.reportNote`)} />
            <CheckItem done={done.qc} title={t(`${p}.check.qc`)} note={t(`${p}.check.qcNote`)} action={t(`${p}.checkAction.qc`)} onAction={soon} />
            <CheckItem done={done.issue} title={t(`${p}.check.issue`)} note={t(`${p}.check.issueNote`)} action={t(`${p}.checkAction.issue`)} onAction={() => document.getElementById('issues')?.scrollIntoView({ behavior: 'smooth' })} />
            <CheckItem done={done.balance} title={t(`${p}.check.balance`)} note={t(`${p}.check.balanceNote`, { amount: orderExtras.shortage.toLocaleString('ko-KR') })} action={t(`${p}.checkAction.balance`)} onAction={() => toast.success(t(`${p}.notifyToast`))} />
          </div>
        </section>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel
            title={<>{t(`${p}.public`)} <Badge variant="info">{t(`${p}.publicBadge`)}</Badge></>}
            action={<span className="text-xs text-muted-foreground">{t(`${p}.publicHint`)}</span>}
          >
            <PublicSection
              title={t(`${p}.sections.samples`)}
              note={t(`${p}.sectionNotes.samples`, { count: orderExtras.samples.length })}
              defaultPublic
              action={<Button variant="outline" size="sm" onClick={soon}>{t(`${p}.add`)}</Button>}
            >
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {orderExtras.samples.map((name) => (
                  <div key={name} className="space-y-1">
                    <div className="relative flex aspect-square items-center justify-center rounded-lg bg-muted text-subtle-foreground">
                      <ImageIcon className="size-5" />
                      <button type="button" onClick={soon} aria-label={`${name} ${t(`${p}.fileMenu`)}`} className="absolute top-1 right-1 rounded bg-card/80 p-0.5 hover:bg-card">
                        <Ellipsis className="size-3.5" />
                      </button>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{name}</div>
                  </div>
                ))}
              </div>
            </PublicSection>
            <PublicSection
              title={t(`${p}.sections.qc`)}
              note={t(`${p}.sectionNotes.qc`)}
              noteDanger
              defaultPublic={false}
              action={<Button size="sm" onClick={soon}>{t(`${p}.upload`)}</Button>}
            />
            <PublicSection
              title={t(`${p}.sections.invoice`)}
              note={t(`${p}.sectionNotes.invoice`)}
              defaultPublic={false}
              action={<Button variant="outline" size="sm" onClick={soon}>{t(`${p}.add`)}</Button>}
            >
              <ul className="divide-y divide-divider rounded-xl border">
                {orderExtras.invoices.map((f) => (
                  <li key={f.name} className={cn('flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm', !f.current && 'text-muted-foreground')}>
                    <FileText className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <Badge variant="neutral">{f.tag}</Badge>
                    <button type="button" onClick={soon} className="text-xs hover:underline">{t(`${p}.fileActions.view`)}</button>
                    {f.current && (
                      <>
                        <button type="button" onClick={soon} className="text-xs hover:underline">{t(`${p}.fileActions.replace`)}</button>
                        <button type="button" onClick={soon} className="text-xs text-destructive hover:underline">{t(`${p}.fileActions.delete`)}</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </PublicSection>
            <PublicSection title={t(`${p}.sections.closing`)} note={t(`${p}.sectionNotes.closing`)} defaultPublic={false}>
              <p className="text-right text-xs text-muted-foreground">{t(`${p}.afterDelivery`)}</p>
            </PublicSection>
          </Panel>

          <Panel
            title={<span id="issues">{t(`${p}.issues`)} {issueOpen && <Badge variant="danger">{t(`${p}.unresolved`, { count: 1 })}</Badge>}</span>}
            action={<Button variant="outline" size="sm" onClick={soon}>{t(`${p}.addIssue`)}</Button>}
          >
            <div className={cn('overflow-hidden rounded-xl ring-1', issueOpen ? 'ring-destructive/30' : 'opacity-60 ring-border')}>
              <div className="space-y-2 bg-danger-subtle/50 p-4">
                <div className="flex justify-between text-sm">
                  <b className="text-destructive">{orderExtras.issue.title}</b>
                  <span className="text-xs text-muted-foreground">{orderExtras.issue.at}</span>
                </div>
                <div className="text-xs text-muted-foreground">{t(`${p}.internalText`)}</div>
                <p className="text-sm">{orderExtras.issue.internal}</p>
              </div>
              <div className="space-y-1.5 border-t border-dashed bg-primary-soft/40 p-4">
                <div className="text-xs text-primary">{t(`${p}.customerText`)}</div>
                <p className="text-sm">{orderExtras.issue.customer}</p>
              </div>
              {issueOpen && (
                <div className="flex justify-end gap-2 border-t p-3">
                  <Button variant="outline" size="sm" onClick={soon}>{t('adminPages.edit')}</Button>
                  <Button
                    size="sm"
                    className="bg-success text-white hover:bg-success/90"
                    onClick={() => {
                      setIssueOpen(false)
                      toast.success(t(`${p}.resolvedToast`))
                    }}
                  >
                    {t(`${p}.resolve`)}
                  </Button>
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title={t(`${p}.amount`)}
            action={<Link to="/admin/deposit" className="text-[13px] font-semibold text-primary hover:underline">{t(`${p}.depositLink`)} ›</Link>}
          >
            <ul className="divide-y divide-divider">
              {orderExtras.fees.map((f) => (
                <li key={f.key} className="flex flex-wrap items-center gap-3 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{t(`${p}.fees.${f.key}`)}</div>
                    <div className="text-xs text-muted-foreground">{f.note}</div>
                  </div>
                  <Input defaultValue={f.amount.toLocaleString('ko-KR')} aria-label={t(`${p}.fees.${f.key}`)} className="h-10 w-36 text-right font-bold tabular-nums" />
                  <span className="text-sm">{t('adminPages.yuanUnit')}</span>
                  <Badge variant={f.done ? 'success' : 'warning'}>{t(`${p}.${f.done ? 'deducted' : 'scheduled'}`)}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t-2 border-foreground pt-4">
              <b>{t(`${p}.total`)}</b>
              <span className="text-2xl font-extrabold tabular-nums">
                {totalFee.toLocaleString('ko-KR')} {t('adminPages.yuanUnit')}
              </span>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t(`${p}.managers`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.managerHint`)}</span>}>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1.5 text-xs text-muted-foreground">
                {t('adminPages.incoming.main')}
                <Pick label={t('adminPages.incoming.main')} value={main} onChange={setMain} options={people} />
              </label>
              <label className="space-y-1.5 text-xs text-muted-foreground">
                {t('adminPages.incoming.sub')}
                <Pick label={t('adminPages.incoming.sub')} value={sub} onChange={setSub} options={people} placeholder={t('adminPages.incoming.select')} />
              </label>
            </div>
          </Panel>
          <Memos />
          <Panel title={t(`${p}.activity`)}>
            <ol className="space-y-4">
              {orderExtras.activity.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', a.danger ? 'bg-destructive' : 'bg-primary')} />
                  <div>
                    <div className="text-sm font-semibold">{a.text}</div>
                    <div className="text-xs text-muted-foreground">{a.meta}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  )
}
