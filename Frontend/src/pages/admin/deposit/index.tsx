import { Download, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { FilterChips } from '@/components/filter-chips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { downloadCsv } from '@/lib/csv'
import { cny, signed } from '@/lib/format'
import { cn } from '@/lib/utils'
import { customers, findCustomer } from '@/mocks/admin'
import { depositSummary, type DepositEntry } from '@/mocks/admin-finance'
import { panel, td, th } from '../styles'
import { PageHead, Panel, Pick, Stat } from '../ui'
import { useDepositActions, useDepositEntries } from './data'
import { useAdminUser } from '../me'

type Tab = 'all' | 'in' | 'use' | 'pending' | 'rejected'
const inTab = (e: DepositEntry, tab: Tab) => tab === 'all' || (tab === 'in' || tab === 'use' ? e.type === tab : e.state === tab)
const STATE_BADGE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const

/** 예치금 등록: 직원이 저장하면 최고관리자 승인 대기로 들어간다 */
function EntryForm() {
  const { t } = useTranslation()
  const p = 'adminPages.deposit.form'
  const { add } = useDepositActions()
  const admin = useAdminUser()
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sign, setSign] = useState<1 | -1>(-1)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('2026-10-12')
  const customer = findCustomer(customerId ?? undefined)
  const value = sign * Number(amount.replaceAll(',', '') || 0)

  const reset = () => {
    setCustomerId(null)
    setText('')
    setAmount('')
  }
  const submit = () => {
    if (!customer || !text.trim() || !value) return toast.error(t(`${p}.required`))
    add({ customerId: customer.id, type: value > 0 ? 'in' : 'use', text: text.trim(), amount: value, balanceAfter: customer.balance + value, date: date.replaceAll('-', '.'), by: admin.name })
    toast.success(t(`${p}.submitted`))
    reset()
  }

  return (
    <Panel title={t(`${p}.title`)}>
      <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.desc`)}</p>
      <div className="grid items-end gap-3 lg:grid-cols-[1.3fr_2fr_1.3fr_1fr_auto]">
        <label className="space-y-1.5 text-[13px] font-semibold">
          {t(`${p}.customer`)}
          <Pick
            label={t(`${p}.customer`)}
            value={customerId}
            onChange={setCustomerId}
            placeholder={t('adminPages.deposit.allCustomers')}
            options={customers.filter((c) => !c.left).map((c) => ({ value: c.id, label: `${c.name} (${c.loginId})` }))}
          />
        </label>
        <label className="space-y-1.5 text-[13px] font-semibold">
          {t(`${p}.text`)}
          <Input className="h-10" value={text} onChange={(e) => setText(e.target.value)} placeholder="10월 12일 1688 조르기 결제" />
        </label>
        <div className="space-y-1.5 text-[13px] font-semibold">
          {t(`${p}.amount`)}
          <div className="flex">
            {([1, -1] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={sign === s}
                aria-label={t(`${p}.${s > 0 ? 'plus' : 'minus'}`)}
                onClick={() => setSign(s)}
                className={cn('h-10 w-9 border text-base font-bold first:rounded-l-lg', sign === s ? (s > 0 ? 'bg-primary-soft text-primary' : 'bg-danger-subtle text-destructive') : 'text-muted-foreground')}
              >
                {s > 0 ? '+' : '−'}
              </button>
            ))}
            <Input className="h-10 rounded-l-none text-right tabular-nums" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" aria-label={t(`${p}.amount`)} />
          </div>
        </div>
        <label className="space-y-1.5 text-[13px] font-semibold">
          {t(`${p}.date`)}
          <Input type="date" className="h-10" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10" onClick={reset}>{t('adminPages.cancel')}</Button>
          <Button className="h-10 px-5 font-bold" onClick={submit}>{t(`${p}.submit`)}</Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 rounded-lg bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
        <span>{t(`${p}.flow`)}</span>
        {customer && value !== 0 && (
          <span>{t(`${p}.preview`, { customer: customer.name, now: cny(customer.balance), after: cny(customer.balance + value) })}</span>
        )}
      </div>
    </Panel>
  )
}

/** 예치금 사용내역: 전체 고객사의 입금·사용 내역과 승인 상태 */
export default function AdminDeposit() {
  const { t } = useTranslation()
  const p = 'adminPages.deposit'
  const { data: entries = [] } = useDepositEntries()
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [customerId, setCustomerId] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const rows = entries.filter((e) => {
    const c = findCustomer(e.customerId)
    return inTab(e, tab) && (!customerId || customerId === 'all' || e.customerId === customerId) && (!q || [c?.name, c?.loginId, e.text].some((v) => v?.toLowerCase().includes(q)))
  })
  const pending = entries.filter((e) => e.state === 'pending')
  const sum = (list: DepositEntry[]) => list.reduce((s, e) => s + e.amount, 0)
  const tabs = (['all', 'in', 'use', 'pending', 'rejected'] as const).map((v) => ({ value: v, label: t(`${p}.tabs.${v}`), count: entries.filter((e) => inTab(e, v)).length }))

  const exportCsv = () => {
    const head = (['no', 'customer', 'text', 'amount', 'balance', 'date', 'by', 'state'] as const).map((c) => t(`${p}.cols.${c}`))
    downloadCsv('deposit-entries.csv', [head, ...rows.map((e) => [e.no, findCustomer(e.customerId)?.name ?? '', e.text, e.amount, e.balanceAfter, e.date, e.by, t(`${p}.states.${e.state}`)])])
  }

  return (
    <div className="space-y-4">
      <PageHead
        title={t(`${p}.title`)}
        desc={t(`${p}.desc`)}
        actions={<Button variant="outline" onClick={exportCsv}><Download /> {t(`${p}.excel`)}</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t(`${p}.kpi.total`)} value={cny(depositSummary.total)} unit={t('adminPages.yuanUnit')} tone={depositSummary.total < 0 ? 'danger' : 'default'} note={t(`${p}.kpi.totalNote`)} />
        <Stat label={t(`${p}.kpi.monthIn`)} value={signed(depositSummary.monthIn)} unit={t('adminPages.yuanUnit')} tone="primary" note={t(`${p}.kpi.monthNote`, { count: depositSummary.monthInCount })} />
        <Stat label={t(`${p}.kpi.monthUse`)} value={signed(depositSummary.monthUse)} unit={t('adminPages.yuanUnit')} note={t(`${p}.kpi.monthNote`, { count: depositSummary.monthUseCount })} />
        <Link to="/admin/deposit/approvals" className="block">
          <Stat
            label={t(`${p}.kpi.pending`)}
            value={pending.length}
            unit={t('adminPages.caseUnit')}
            tone="warning"
            highlight="warning"
            noteTone="warning"
            note={t(`${p}.kpi.pendingNote`, { in: signed(sum(pending.filter((e) => e.type === 'in'))), use: signed(sum(pending.filter((e) => e.type === 'use'))) })}
          />
        </Link>
      </div>

      <EntryForm />

      <FilterChips options={tabs} value={tab} onChange={setTab} />

      <section className={cn(panel, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(`${p}.searchPlaceholder`)} aria-label={t('adminPages.search')} className="h-10 pl-9" />
          </div>
          <Pick
            className="w-44"
            label={t(`${p}.allCustomers`)}
            value={customerId}
            onChange={setCustomerId}
            placeholder={t(`${p}.allCustomers`)}
            options={[{ value: 'all', label: t(`${p}.allCustomers`) }, ...customers.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-y bg-muted/40">
                {(['no', 'customer', 'text', 'amount', 'balance', 'date', 'by', 'state'] as const).map((c) => (
                  <th key={c} className={cn(th, (c === 'amount' || c === 'balance') && 'text-right')}>{t(`${p}.cols.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const c = findCustomer(e.customerId)
                const pend = e.state === 'pending'
                return (
                  <tr key={e.no} className={cn('border-b border-divider', pend && 'bg-warning-subtle/40', e.state === 'rejected' && 'opacity-60')}>
                    <td className={cn(td, 'text-muted-foreground tabular-nums')}>{e.no.toLocaleString('ko-KR')}</td>
                    <td className={td}>
                      <div className="font-semibold">{c?.name}</div>
                      <div className="text-xs text-muted-foreground">{c?.loginId}</div>
                    </td>
                    <td className={td}>
                      <Badge variant={e.type === 'in' ? 'info' : 'danger'} className="mr-2">{t(`${p}.types.${e.type}`)}</Badge>
                      {e.text}
                    </td>
                    <td className={cn(td, 'text-right font-bold tabular-nums', e.amount > 0 ? 'text-primary' : 'text-destructive')}>
                      {signed(e.amount)} {t('adminPages.yuanUnit')}
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>
                      {pend ? (
                        <span className="text-xs text-muted-foreground">
                          {t(`${p}.afterApproval`, { amount: cny(e.balanceAfter) })}
                          <br />
                          {t(`${p}.notApplied`)}
                        </span>
                      ) : (
                        <b className={cn(e.balanceAfter < 0 && 'text-destructive')}>{cny(e.balanceAfter)} {t('adminPages.yuanUnit')}</b>
                      )}
                    </td>
                    <td className={cn(td, 'tabular-nums')}>{e.date}</td>
                    <td className={td}>{e.by}</td>
                    <td className={td}>
                      <Badge variant={STATE_BADGE[e.state]}>{t(`${p}.states.${e.state}`)}</Badge>
                      {e.approvedBy && <div className="mt-0.5 text-[11px] text-muted-foreground">{e.approvedBy}</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">{t(`${p}.footer`)}</div>
      </section>
    </div>
  )
}
