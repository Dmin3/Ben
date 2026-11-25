import { FileText, Pencil } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { findFactory } from '@/mocks/factories'
import { customers, factoryActive, factoryAdmin, managers } from '@/mocks/admin'
import { panel, td, th } from '../styles'
import { Panel, Pick, Stat, StepBar } from '../ui'

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-divider text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-4 py-2.5">
          <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
          <dd className="min-w-0 break-keep">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** 공장 상세 (관리자): 진행 중 오더, 이슈, 공장 정보·연락처(내부), 담당자, 파일, 메모 */
export default function AdminFactoryDetail() {
  const { t } = useTranslation()
  const p = 'adminPages.factories'
  const { id } = useParams()
  const f = findFactory(id)
  const extra = id ? factoryAdmin[id] : undefined
  const [manager, setManager] = useState<string | null>(extra?.manager ?? null)
  const [memos, setMemos] = useState(extra?.memo ? [{ who: '정효은', at: '10.10', text: extra.memo }] : [])
  const soon = () => toast(t('common.comingSoon'))

  if (!f || !extra) {
    return (
      <div className="space-y-4">
        <Link to="/admin/factories" className="text-[13px] text-muted-foreground hover:text-foreground">← {t(`${p}.back`)}</Link>
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t('factories.notFound')}</p>
      </div>
    )
  }

  const { orders, names } = factoryActive(f.id)
  const open = f.issues.filter((i) => !i.resolved)
  const byCustomer = names.map((name) => {
    const list = orders.filter((o) => customers.find((c) => c.id === o.customerId)?.name === name)
    return { name, count: list.length, amount: list.reduce((s, o) => s + (o.amount ?? 0), 0) }
  })
  const addMemo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('memo') as HTMLInputElement
    if (!input.value.trim()) return
    setMemos((l) => [{ who: '김대표', at: '방금', text: input.value.trim() }, ...l])
    input.value = ''
  }

  return (
    <div className="space-y-4">
      <Link to="/admin/factories" className="text-[13px] text-muted-foreground hover:text-foreground">← {t(`${p}.back`)}</Link>

      <section className={cn(panel, 'flex flex-wrap items-center gap-4 p-6')}>
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-2xl font-bold text-primary">{f.name[0]}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold">{f.name}</h1>
            <Badge variant="success">{t(`${p}.trading`)}</Badge>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {[f.legalName, f.region.replace('중국 ', ''), f.tags.slice(0, 2).join(', '), extra.code, extra.registeredAt].join(' · ')}
          </p>
        </div>
        <Button variant="outline" onClick={soon}><Pencil /> {t(`${p}.editInfo`)}</Button>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t(`${p}.detailKpi.active`)} value={orders.length} unit={t('adminPages.caseUnit')} note={t(`${p}.detailKpi.customers`, { count: names.length })} />
        <Stat label={t(`${p}.detailKpi.amount`)} value={f.totalAmount.toLocaleString('ko-KR')} unit={t('adminPages.yuanUnit')} note={t(`${p}.detailKpi.amountNote`, { count: f.deals })} />
        <Stat
          label={t(`${p}.detailKpi.issues`)}
          value={open.length}
          unit={t('adminPages.caseUnit')}
          tone={open.length ? 'danger' : 'default'}
          highlight={open.length ? 'danger' : undefined}
        />
        <Stat label={t(`${p}.detailKpi.onTime`)} value={f.onTimeRate} unit="%" note={t(`${p}.detailKpi.lead`, { days: f.avgLeadDays })} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Panel title={t(`${p}.activeOrders`)} action={<Badge variant="info">{t('adminPages.count', { count: orders.length })}</Badge>}>
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('adminPages.none')}</p>
            ) : (
              <>
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {byCustomer.map((c) => (
                    <div key={c.name} className="rounded-xl border p-3.5">
                      <div className="text-sm font-bold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{t('adminPages.count', { count: c.count })}</div>
                      <div className="mt-1.5 text-sm font-bold tabular-nums">{c.amount.toLocaleString('ko-KR')} {t('adminPages.yuanUnit')}</div>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="bg-muted/40">
                        {(['customer', 'order', 'product', 'qty', 'step', 'due', 'amount', 'status'] as const).map((c) => (
                          <th key={c} className={th}>{t(`${p}.orderCols.${c}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-divider">
                          <td className={cn(td, 'font-semibold')}>{customers.find((c) => c.id === o.customerId)?.name}</td>
                          <td className={td}><Link to={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">{o.id}</Link></td>
                          <td className={td}>{o.product}</td>
                          <td className={cn(td, 'tabular-nums')}>{o.quantity?.toLocaleString('ko-KR') ?? '-'}</td>
                          <td className={td}><StepBar step={o.step} delayed={o.delayed} /></td>
                          <td className={cn(td, 'tabular-nums')}>{o.dueDate ?? '-'}</td>
                          <td className={cn(td, 'tabular-nums')}>{o.amount?.toLocaleString('ko-KR') ?? '-'}</td>
                          <td className={td}>
                            {o.status !== 'quote' && (
                              <Badge variant={o.status === 'normal' ? 'success' : o.status === 'delayed' ? 'danger' : 'warning'}>{t(`adminPages.status.${o.status}`)}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Panel>

          <Panel title={t(`${p}.issueHistory`)} action={<button type="button" onClick={soon} className="text-[13px] font-semibold text-primary hover:underline">{t('adminPages.orderDetail.addIssue')}</button>}>
            {f.issues.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('adminPages.none')}</p>
            ) : (
              <ul className="divide-y divide-divider">
                {f.issues.map((i) => (
                  <li key={i.id} className="flex gap-3 py-3.5">
                    <Badge variant={i.resolved ? 'neutral' : 'danger'} className="mt-0.5">{t(`${p}.issueStates.${i.resolved ? 'resolved' : 'open'}`)}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{i.title}</div>
                      {i.orderId && (
                        <Link to={`/admin/orders/${i.orderId}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">{i.orderId}</Link>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{i.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t(`${p}.info`)} action={<button type="button" onClick={soon} className="text-[13px] font-semibold text-primary hover:underline">{t('adminPages.edit')}</button>}>
            <Rows
              rows={[
                [t(`${p}.infoRows.address`), f.address],
                [t(`${p}.infoRows.items`), f.tags.join(', ')],
                [t(`${p}.infoRows.capacity`), extra.capacity],
                [t(`${p}.infoRows.moq`), extra.moq],
                [t(`${p}.infoRows.sample`), extra.sampleDays],
                [t(`${p}.infoRows.payment`), extra.payment],
              ]}
            />
          </Panel>
          <Panel
            title={<>{t(`${p}.contact`)} <Badge variant="neutral">{t('adminPages.internal')}</Badge></>}
            action={<button type="button" onClick={soon} className="text-[13px] font-semibold text-primary hover:underline">{t('adminPages.edit')}</button>}
          >
            <Rows
              rows={[
                [t(`${p}.contactRows.name`), extra.contact.name],
                [t(`${p}.contactRows.wechat`), extra.contact.wechat],
                [t(`${p}.contactRows.phone`), extra.contact.phone],
              ]}
            />
            <p className="mt-2 text-xs text-muted-foreground">{t(`${p}.contactHint`)}</p>
          </Panel>
          <Panel title={t(`${p}.benManager`)}>
            <Pick label={t(`${p}.benManager`)} value={manager} onChange={setManager} options={managers.map((m) => ({ value: m.name, label: `${m.name} ${t('adminPages.roles.MANAGER')}` }))} />
          </Panel>
          <Panel title={t(`${p}.files`)} action={<button type="button" onClick={soon} className="text-[13px] font-semibold text-primary hover:underline">{t(`${p}.upload`)}</button>}>
            <ul className="divide-y divide-divider">
              {f.files.map((file) => (
                <li key={file.id}>
                  <button type="button" onClick={soon} className="flex w-full items-center gap-3 py-2.5 text-left text-sm hover:text-primary">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{file.date}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={t(`${p}.memo`)}>
            <ul className="space-y-2">
              {memos.map((m, i) => (
                <li key={i} className="rounded-xl bg-muted/60 p-3">
                  <div className="flex justify-between text-xs"><b>{m.who}</b><span className="text-muted-foreground">{m.at}</span></div>
                  <p className="mt-1 text-sm">{m.text}</p>
                </li>
              ))}
            </ul>
            <form onSubmit={addMemo} className="mt-3 flex gap-2">
              <Input name="memo" placeholder={t(`${p}.memoPlaceholder`)} aria-label={t(`${p}.memo`)} className="h-10" />
              <Button type="submit" className="h-10 bg-foreground text-background hover:bg-foreground/90">{t('adminPages.register')}</Button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  )
}
