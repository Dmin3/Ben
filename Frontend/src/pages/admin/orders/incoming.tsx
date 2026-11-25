import { Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { FilterChips } from '@/components/filter-chips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { factories } from '@/mocks/factories'
import { adminOrders, findCustomer, incomingDoneCount, incomingOrders, managers, type IncomingOrder } from '@/mocks/admin'
import { panel } from '../styles'
import { PageHead, Pick } from '../ui'

type Tab = 'waiting' | 'web' | 'file' | 'info_requested' | 'done'

const matches = (o: IncomingOrder, tab: Tab) =>
  tab === 'waiting' ? o.state !== 'info_requested' : tab === 'web' || tab === 'file' ? o.kind === tab : tab === 'info_requested' ? o.state === tab : false

const STATE_DOT = { unchecked: 'bg-destructive text-destructive', checking: 'bg-warning text-warning', info_requested: 'bg-violet-500 text-violet-600' } as const

function KindBadge({ kind }: { kind: IncomingOrder['kind'] }) {
  const { t } = useTranslation()
  return <Badge variant={kind === 'web' ? 'info' : 'success'}>{t(`adminPages.incoming.kinds.${kind}`)}</Badge>
}

function Section({ title, action, children, className }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3 border-t p-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function QtyTable({ rows, editable }: { rows: { color: string; size: string; qty: number }[]; editable?: boolean }) {
  const { t } = useTranslation()
  const [list, setList] = useState(rows)
  const total = list.reduce((s, r) => s + (Number(r.qty) || 0), 0)
  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-normal">{t('adminPages.incoming.cols.color')}</th>
            <th className="px-3 py-2 text-left font-normal">{t('adminPages.incoming.cols.size')}</th>
            <th className="px-3 py-2 text-right font-normal">{t('adminPages.incoming.cols.qty')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r, i) => (
            <tr key={i} className="border-b border-divider">
              {editable ? (
                <>
                  <td className="py-1.5 pr-1"><Input defaultValue={r.color} aria-label={t('adminPages.incoming.cols.color')} className="h-8" /></td>
                  <td className="py-1.5 pr-1"><Input defaultValue={r.size} aria-label={t('adminPages.incoming.cols.size')} className="h-8" /></td>
                  <td className="py-1.5">
                    <Input
                      type="number"
                      defaultValue={r.qty}
                      aria-label={t('adminPages.incoming.cols.qty')}
                      className="h-8 text-right"
                      onChange={(e) => setList((l) => l.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2.5">{r.color}</td>
                  <td className="px-3 py-2.5">{r.size}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.qty.toLocaleString('ko-KR')}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        {editable && (
          <tfoot>
            <tr>
              <td colSpan={2} className="px-3 pt-2 font-bold">{t('adminPages.incoming.sum')}</td>
              <td className="px-3 pt-2 text-right font-bold text-primary tabular-nums">{total.toLocaleString('ko-KR')}</td>
            </tr>
          </tfoot>
        )}
      </table>
      {editable && (
        <button
          type="button"
          onClick={() => setList((l) => [...l, { color: '', size: '', qty: 0 }])}
          className="w-full rounded-lg border border-dashed py-2 text-[13px] font-semibold text-primary hover:bg-muted/50"
        >
          {t('adminPages.incoming.addRow')}
        </button>
      )}
    </div>
  )
}

/** 메인·서브 담당, 공장, 안내 예정일 + 버튼 */
function ConfirmBox({ title, done, onAction, draft }: { title: string; done: string; draft?: boolean; onAction: (a: 'done' | 'info' | 'reject' | 'draft') => void }) {
  const { t } = useTranslation()
  const p = 'adminPages.incoming'
  const [main, setMain] = useState<string | null>(managers[0].name)
  const [sub, setSub] = useState<string | null>(null)
  const [factory, setFactory] = useState<string | null>('ben')
  const people = managers.map((m) => ({ value: m.name, label: `${m.name} ${t('adminPages.roles.MANAGER')}` }))
  const factoryOptions = [{ value: 'ben', label: t(`${p}.ben`) }, ...factories.map((f) => ({ value: f.id, label: f.name }))]
  return (
    <Section title={title} className="bg-muted/30">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5 text-xs text-muted-foreground">
          {t(`${p}.main`)}
          <Pick label={t(`${p}.main`)} value={main} onChange={setMain} options={people} />
        </label>
        <label className="space-y-1.5 text-xs text-muted-foreground">
          {t(`${p}.sub`)}
          <Pick label={t(`${p}.sub`)} value={sub} onChange={setSub} options={people} placeholder={t(`${p}.select`)} />
        </label>
        <label className="space-y-1.5 text-xs text-muted-foreground">
          {t(`${p}.assignFactory`)}
          <Pick label={t(`${p}.assignFactory`)} value={factory} onChange={setFactory} options={factoryOptions} />
        </label>
        <label className="space-y-1.5 text-xs text-muted-foreground">
          {t(`${p}.quoteDate`)}
          <Input type="date" className="h-10" defaultValue="2026-10-13" />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" className="h-11 border-warning/50 bg-warning-subtle text-warning hover:bg-warning-soft" onClick={() => onAction('info')}>
          {t(`${p}.requestInfo`)}
        </Button>
        <Button variant="outline" className="h-11" onClick={() => onAction(draft ? 'draft' : 'reject')}>
          {draft ? t('adminPages.saveDraft') : t(`${p}.reject`)}
        </Button>
        <Button className="ml-auto h-11 px-5 font-bold" onClick={() => onAction('done')}>
          {done}
        </Button>
      </div>
    </Section>
  )
}

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1.5 text-xs text-muted-foreground">
      <span>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  )
}

/** 고객 양식 파일: 파일을 보며 품목마다 웹 양식으로 옮겨 적는다 */
function FileTranscribe({ order }: { order: IncomingOrder }) {
  const { t } = useTranslation()
  const p = 'adminPages.incoming'
  const [items, setItems] = useState(order.file!.items)
  const [current, setCurrent] = useState(0)
  const [process, setProcess] = useState<'sample' | 'reorder'>('sample')
  return (
    <Section title={t(`${p}.transcribe`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.transcribeHint`)}</span>}>
      <div className="flex flex-wrap gap-1.5">
        {items.map((name, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={cn('rounded-lg border px-3 py-1.5 text-[13px] font-semibold', current === i ? 'border-primary bg-primary-soft text-primary' : 'hover:bg-muted')}
          >
            {t(`${p}.item`, { n: i + 1 })}
            {i === 0 && ` · ${name}`}
            <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">{t(`${p}.itemState.${current === i ? 'editing' : 'empty'}`)}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setItems((l) => [...l, `${t(`${p}.item`, { n: l.length + 1 })}`])}
          className="rounded-lg border border-dashed px-3 py-1.5 text-[13px] font-semibold text-primary hover:bg-muted"
        >
          {t(`${p}.addItem`)}
        </button>
      </div>
      {/* 품목을 바꾸면 입력칸을 새로 그린다 (ponytail: 품목별 입력값 보관은 API 연동 때) */}
      <div key={current} className="space-y-4 pt-2">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <Field label={t(`${p}.fields.productName`)} required><Input className="h-10" defaultValue={current === 0 ? '울 혼방 니트 가디건' : ''} /></Field>
          <Field label={t(`${p}.fields.category`)} required><Input className="h-10" defaultValue={current === 0 ? '의류 · 니트' : ''} /></Field>
          <Field label={t(`${p}.fields.dueDate`)} required><Input type="date" className="h-10" defaultValue={current === 0 ? '2026-12-10' : ''} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label={t(`${p}.fields.process`)} required>
            <div className="flex gap-2 pt-1">
              {(['sample', 'reorder'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={process === v}
                  onClick={() => setProcess(v)}
                  className={cn('rounded-full border px-3.5 py-1.5 text-[13px] font-semibold', process === v ? 'border-primary bg-primary-soft text-primary' : 'text-foreground')}
                >
                  {t(`${p}.processTypes.${v}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t(`${p}.fields.inspection`)}><Input className="h-10" defaultValue={current === 0 ? '보풀, 사이즈 오차 ±1cm' : ''} /></Field>
          <Field label={t(`${p}.fields.factory`)}><Input className="h-10" defaultValue={t(`${p}.ben`)} /></Field>
          <Field label={t(`${p}.fields.shipping`)} required><Input className="h-10" defaultValue="해운 · 본사 창고" /></Field>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label={t(`${p}.qty`)} required>
            <QtyTable editable rows={current === 0 ? [{ color: '아이보리', size: 'FREE', qty: 600 }, { color: '그레이', size: 'FREE', qty: 400 }] : [{ color: '', size: '', qty: 0 }]} />
          </Field>
          <Field label={t(`${p}.fields.memo`)}>
            <Textarea rows={6} defaultValue={current === 0 ? '- 원단: 울 30% / 아크릴 70%\n- 단추: 자개 단추 5개\n- 포장: 개별 OPP, 행택 부착\n(파일 시트1 2~6행 내용)' : ''} />
          </Field>
        </div>
      </div>
    </Section>
  )
}

function Detail({ order, onAction }: { order: IncomingOrder; onAction: (a: 'done' | 'info' | 'reject' | 'draft') => void }) {
  const { t } = useTranslation()
  const p = 'adminPages.incoming'
  const c = findCustomer(order.customerId)
  const prev = adminOrders.filter((o) => o.customerId === order.customerId).length
  const comingSoon = () => toast(t('common.comingSoon'))

  return (
    <article className={cn(panel, 'overflow-hidden')}>
      <header className="flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <KindBadge kind={order.kind} />
            {t(`${p}.received`, { at: order.receivedAt })}
            {order.kind === 'web' && ` · ${order.id}`}
          </div>
          <h2 className="text-xl font-extrabold">{order.title}</h2>
          {c && <p className="text-[13px] text-muted-foreground">{t(`${p}.customerLine`, { customer: c.name, owner: c.owner, balance: c.balance.toLocaleString('ko-KR') })}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to={`/admin/customers/${order.customerId}`} />}>{t(`${p}.customerInfo`)}</Button>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to={`/admin/orders?customer=${order.customerId}`} />}>{t(`${p}.prevOrders`, { count: prev })}</Button>
        </div>
      </header>

      {order.web && (
        <>
          <div className="grid border-t lg:grid-cols-2">
            <section className="space-y-3 p-5 lg:border-r">
              <h3 className="text-sm font-bold">{t(`${p}.basic`)}</h3>
              <dl className="space-y-2.5 text-sm">
                {(['category', 'dueDate', 'process', 'inspection', 'factory', 'shipping'] as const).map((f) => (
                  <div key={f} className="flex gap-4">
                    <dt className="w-24 shrink-0 text-muted-foreground">{t(`${p}.fields.${f}`)}</dt>
                    <dd>{f === 'process' ? t(`${p}.processTypes.${order.web!.process}`) : order.web![f] || '-'}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="space-y-3 border-t p-5 lg:border-t-0">
              <h3 className="text-sm font-bold">
                {t(`${p}.qty`)}{' '}
                <span className="font-normal text-muted-foreground">
                  {t(`${p}.qtyTotal`, { count: order.web.quantities.reduce((s, q) => s + q.qty, 0) })}
                </span>
              </h3>
              <QtyTable rows={order.web.quantities} />
            </section>
          </div>
          <Section title={t(`${p}.memoFiles`)}>
            <p className="rounded-xl bg-muted/60 p-4 text-sm whitespace-pre-line">{order.web.memo || '-'}</p>
            <div className="flex flex-wrap gap-2">
              {order.web.files.map((f) => (
                <button key={f} type="button" onClick={comingSoon} className="rounded-md bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary hover:underline">
                  {f}
                </button>
              ))}
            </div>
          </Section>
          <ConfirmBox title={t(`${p}.confirm`)} done={t(`${p}.complete`)} onAction={onAction} />
        </>
      )}

      {order.file && (
        <>
          <Section title={t(`${p}.sentFiles`)}>
            <ul className="space-y-2">
              {order.file.files.map((f) => (
                <li key={f.name} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                  <span className={cn('flex size-10 items-center justify-center rounded-lg text-[11px] font-bold', f.type === 'xlsx' ? 'bg-success-soft text-success' : 'bg-danger-subtle text-destructive')}>
                    {f.type.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.size}</div>
                  </div>
                  <Button size="sm" onClick={comingSoon}>
                    <Download /> {t('adminPages.download')}
                  </Button>
                </li>
              ))}
            </ul>
            <p className="rounded-xl bg-muted/60 px-4 py-3 text-[13px]">
              <b className="mr-3">{t(`${p}.customerMemo`)}</b>
              {order.file.memo}
            </p>
          </Section>
          <FileTranscribe order={order} />
          <ConfirmBox title={t(`${p}.confirmFile`)} done={t(`${p}.completeFile`, { count: order.file.items.length })} draft onAction={onAction} />
        </>
      )}
    </article>
  )
}

/** 신규 오더 확인: 왼쪽 접수 목록, 오른쪽 선택한 오더 확인·배정 */
export default function IncomingOrders() {
  const { t } = useTranslation()
  const p = 'adminPages.incoming'
  // TODO(API): 신규 오더 목록·확인 처리 API. 지금은 화면 안에서만 바뀐다
  const [list, setList] = useState(incomingOrders)
  const [tab, setTab] = useState<Tab>('waiting')
  const rows = list.filter((o) => matches(o, tab))
  const [selectedId, setSelectedId] = useState(rows[0]?.id)
  const selected = rows.find((o) => o.id === selectedId) ?? rows[0]

  const tabs = (['waiting', 'web', 'file', 'info_requested', 'done'] as const).map((v) => ({
    value: v,
    label: t(`${p}.tabs.${v}`),
    count: v === 'done' ? incomingDoneCount : list.filter((o) => matches(o, v)).length,
  }))

  const act = (o: IncomingOrder) => (a: 'done' | 'info' | 'reject' | 'draft') => {
    if (a === 'draft') return toast.success(t('adminPages.draftSaved'))
    if (a === 'info') {
      setList((l) => l.map((x) => (x.id === o.id ? { ...x, state: 'info_requested' } : x)))
      return toast.success(t(`${p}.infoToast`))
    }
    setList((l) => l.filter((x) => x.id !== o.id))
    toast.success(t(a === 'done' ? `${p}.doneToast` : `${p}.rejectToast`))
  }

  return (
    <div>
      <PageHead crumb={t(`${p}.crumb`)} title={t(`${p}.title`)} desc={t(`${p}.desc`)} />
      <FilterChips options={tabs} value={tab} onChange={setTab} className="mb-4" />

      {tab === 'done' ? (
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>
          {t(`${p}.doneHint`, { count: incomingDoneCount })}{' '}
          <Link to="/admin/orders" className="font-semibold text-primary hover:underline">→</Link>
        </p>
      ) : rows.length === 0 ? (
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t(`${p}.empty`)}</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <ul className="space-y-2.5">
            {rows.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(o.id)}
                  className={cn(
                    panel,
                    'w-full space-y-2 p-4 text-left transition-shadow hover:shadow-md',
                    selected?.id === o.id && (o.kind === 'file' ? 'bg-success-soft/30 ring-2 ring-success' : 'ring-2 ring-primary'),
                    o.state === 'info_requested' && 'opacity-80',
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <KindBadge kind={o.kind} />
                    {o.receivedAt}
                  </div>
                  <div className="truncate font-bold">{o.title}</div>
                  <div className="truncate text-[13px] text-muted-foreground">{o.summary}</div>
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-muted-foreground">{o.hint}</span>
                    <span className={cn('flex items-center gap-1.5 font-semibold', STATE_DOT[o.state].split(' ')[1])}>
                      <span className={cn('size-1.5 rounded-full', STATE_DOT[o.state].split(' ')[0])} />
                      {t(`${p}.states.${o.state}`)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {selected ? <Detail key={selected.id} order={selected} onAction={act(selected)} /> : <p>{t(`${p}.pick`)}</p>}
        </div>
      )}
    </div>
  )
}
