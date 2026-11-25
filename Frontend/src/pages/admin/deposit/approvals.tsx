import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cny, signed } from '@/lib/format'
import { cn } from '@/lib/utils'
import { findCustomer } from '@/mocks/admin'
import { panel } from '../styles'
import { PageHead, Panel, SuperOnly } from '../ui'
import { useDepositActions, useDepositEntries } from './data'

/** 승인 대기 (최고관리자 전용): 직원이 등록한 예치금 내역을 승인·반려한다 */
export default function DepositApprovals() {
  const { t } = useTranslation()
  const p = 'adminPages.deposit.approvals'
  const { data: entries = [] } = useDepositEntries()
  const { approve, reject } = useDepositActions()
  const pending = entries.filter((e) => e.state === 'pending')
  const [checked, setChecked] = useState<number[]>([])
  const [currentNo, setCurrentNo] = useState<number | undefined>(pending[0]?.no)
  const [reason, setReason] = useState('')
  const current = pending.find((e) => e.no === currentNo) ?? pending[0]
  const customer = current && findCustomer(current.customerId)
  const live = checked.filter((no) => pending.some((e) => e.no === no))

  const doApprove = (nos: number[]) => {
    if (!nos.length) return
    approve(nos)
    setChecked((l) => l.filter((no) => !nos.includes(no)))
    toast.success(t(`${p}.approvedToast`, { count: nos.length }))
  }
  const doReject = () => {
    if (!current) return
    if (!reason.trim()) return toast.error(t(`${p}.reasonRequired`))
    reject(current.no)
    setReason('')
    toast.success(t(`${p}.rejectedToast`))
  }

  return (
    <SuperOnly>
      <PageHead
        title={<>{t(`${p}.title`)} <span className="text-warning">{pending.length}</span></>}
        desc={t(`${p}.desc`)}
        actions={
          <>
            <Button variant="outline" disabled={!live.length} onClick={() => doApprove(live)}>{t(`${p}.approveSelected`, { count: live.length })}</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90" disabled={!pending.length} onClick={() => doApprove(pending.map((e) => e.no))}>
              {t(`${p}.approveAll`)}
            </Button>
          </>
        }
      />
      {pending.length === 0 ? (
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t(`${p}.empty`)}</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className={cn(panel, 'overflow-hidden')}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-bold">{t(`${p}.list`)}</h2>
              <span className="text-xs text-muted-foreground">
                {t(`${p}.listSummary`, { in: pending.filter((e) => e.type === 'in').length, use: pending.filter((e) => e.type === 'use').length })}
              </span>
            </div>
            <ul className="divide-y divide-divider">
              {pending.map((e) => {
                const c = findCustomer(e.customerId)
                const isCurrent = current?.no === e.no
                return (
                  <li key={e.no} className={cn('flex items-center gap-4 px-5 py-4', isCurrent && 'bg-primary-soft/40 shadow-[inset_3px_0_0_var(--primary)]')}>
                    <input
                      type="checkbox"
                      aria-label={`${c?.name} ${e.text}`}
                      checked={checked.includes(e.no)}
                      onChange={(ev) => setChecked((l) => (ev.target.checked ? [...l, e.no] : l.filter((x) => x !== e.no)))}
                      className="size-4 accent-primary"
                    />
                    <button type="button" onClick={() => setCurrentNo(e.no)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={e.type === 'in' ? 'info' : 'danger'}>{t(`adminPages.deposit.types.${e.type}`)}</Badge>
                          <b>{c?.name}</b>
                        </div>
                        <div className="truncate text-[13px] text-muted-foreground">{[e.text, e.orderRef].filter(Boolean).join(' · ')}</div>
                        <div className="text-xs text-subtle-foreground">{t(`${p}.enteredBy`, { name: e.by, at: e.enteredAt })}</div>
                      </div>
                      <div className={cn('text-right text-lg font-bold tabular-nums', e.amount > 0 ? 'text-primary' : 'text-destructive')}>
                        {signed(e.amount)}
                        <div className="text-xs font-normal text-muted-foreground">{t('adminPages.yuanUnit')}</div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {current && customer && (
            <Panel title={<>{t(`${p}.detail`)} <Badge variant="warning">{t('adminPages.deposit.states.pending')}</Badge></>}>
              <dl className="divide-y divide-divider text-sm">
                {[
                  [t(`${p}.rows.customer`), `${customer.name} (${customer.loginId})`],
                  [t(`${p}.rows.text`), current.text],
                  [t(`${p}.rows.amount`), `${signed(current.amount)} ${t('adminPages.yuanUnit')}`],
                  [t(`${p}.rows.order`), current.orderRef ?? '-'],
                  [t(`${p}.rows.entered`), `${current.by} · ${current.enteredAt}`],
                ].map(([l, v], i) => (
                  <div key={l} className="flex gap-4 py-2.5">
                    <dt className="w-20 shrink-0 text-muted-foreground">{l}</dt>
                    <dd className={cn(i === 2 && (current.amount > 0 ? 'font-bold text-primary' : 'font-bold text-destructive'))}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-around rounded-xl bg-muted/60 py-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">{t(`${p}.now`)}</div>
                  <div className="text-xl font-bold tabular-nums">{cny(customer.balance)}</div>
                </div>
                <span className="text-muted-foreground">→</span>
                <div>
                  <div className="text-xs text-muted-foreground">{t(`${p}.after`)}</div>
                  <div className="text-xl font-bold tabular-nums">{cny(customer.balance + current.amount)}</div>
                </div>
              </div>
              <label className="mt-4 block space-y-1.5 text-[13px] font-semibold">
                <span>
                  {t(`${p}.reason`)} <span className="font-normal text-muted-foreground">{t(`${p}.reasonHint`)}</span>
                </span>
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t(`${p}.reasonPlaceholder`)} />
              </label>
              <div className="mt-4 grid grid-cols-[1fr_1.5fr] gap-2">
                <Button variant="outline" className="h-12 border-destructive/40 text-destructive hover:text-destructive" onClick={doReject}>{t(`${p}.reject`)}</Button>
                <Button className="h-12 bg-foreground font-bold text-background hover:bg-foreground/90" onClick={() => doApprove([current.no])}>{t(`${p}.approve`)}</Button>
              </div>
            </Panel>
          )}
        </div>
      )}
    </SuperOnly>
  )
}
