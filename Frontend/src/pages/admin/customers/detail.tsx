import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cny, signed } from '@/lib/format'
import { cn } from '@/lib/utils'
import { adminOrders, findCustomer } from '@/mocks/admin'
import { useDepositEntries } from '../deposit/data'
import { panel, td, th } from '../styles'
import { PageHead, Panel, Stat, StepBar } from '../ui'
import { useAdminUser } from '../me'

/** 고객사 상세 (시안 없음): 정보·수수료율, 진행 중 오더, 최근 예치금 내역 */
export default function AdminCustomerDetail() {
  const { t } = useTranslation()
  const p = 'adminPages.customers'
  const c = findCustomer(useParams().id)
  const { data: entries = [] } = useDepositEntries()
  const [fee, setFee] = useState(String(c?.feeRate ?? ''))
  const admin = useAdminUser()
  // 수수료율은 수퍼관리자만 (BE에 재무 역할이 없다)
  const canEditFee = admin.role === 'SUPER'

  if (!c) {
    return (
      <div className="space-y-4">
        <Link to="/admin/customers" className="text-[13px] text-muted-foreground hover:text-foreground">← {t(`${p}.back`)}</Link>
        <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t(`${p}.notFound`)}</p>
      </div>
    )
  }

  const orders = adminOrders.filter((o) => o.customerId === c.id)
  const deposits = entries.filter((e) => e.customerId === c.id).slice(0, 5)

  return (
    <div className="space-y-4">
      <PageHead back={{ to: '/admin/customers', label: t(`${p}.back`) }} title={c.name} badge={c.left && <Badge variant="neutral">{t(`${p}.tabs.left`)}</Badge>} desc={`${c.owner} · ${c.loginId}`} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t(`${p}.cols.balance`)} value={cny(c.balance)} unit={t('adminPages.yuanUnit')} tone={c.balance < 0 ? 'danger' : 'default'} />
        <Stat label={t(`${p}.cols.active`)} value={orders.length} unit={t('adminPages.caseUnit')} />
        <Stat label={t(`${p}.cols.amount`)} value={c.totalAmount.toLocaleString('ko-KR')} unit={t('adminPages.yuanUnit')} />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Panel title={t(`${p}.info`)}>
          <dl className="divide-y divide-divider text-sm">
            {[
              [t(`${p}.rows.owner`), c.owner],
              [t(`${p}.rows.loginId`), c.loginId],
              [t(`${p}.rows.joined`), c.joinedAt],
              [t(`${p}.rows.manager`), c.manager],
            ].map(([l, v]) => (
              <div key={l} className="flex gap-4 py-2.5">
                <dt className="w-24 shrink-0 text-muted-foreground">{l}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="flex items-center gap-2 py-2.5">
              <dt className="w-24 shrink-0 text-muted-foreground">{t(`${p}.rows.fee`)}</dt>
              <dd className="flex items-center gap-2">
                <Input value={fee} onChange={(e) => setFee(e.target.value)} readOnly={!canEditFee} aria-label={t(`${p}.rows.fee`)} className="h-9 w-20 text-right" />
                %
                {canEditFee && (
                  // TODO(API): 수수료율 변경 (활동 기록에 남는다)
                  <Button size="sm" variant="outline" onClick={() => toast.success(t('adminPages.saved'))}>{t('adminPages.save')}</Button>
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">{t(`${p}.feeHint`)}</p>
        </Panel>
        <div className="space-y-4">
          <Panel title={t(`${p}.orders`)}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-muted/40">
                    {(['order', 'product', 'due', 'step'] as const).map((col) => (
                      <th key={col} className={th}>{t(`adminPages.orders.cols.${col}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-divider">
                      <td className={td}><Link to={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">{o.id}</Link></td>
                      <td className={td}>{o.product}</td>
                      <td className={cn(td, 'tabular-nums')}>{o.dueDate ?? t('adminPages.tbd')}</td>
                      <td className={td}><StepBar step={o.step} delayed={o.delayed} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title={t(`${p}.deposits`)} action={<Link to="/admin/deposit" className="text-[13px] font-semibold text-primary hover:underline">{t('adminPages.more')} ›</Link>}>
            <ul className="divide-y divide-divider">
              {deposits.map((e) => (
                <li key={e.no} className="flex items-center gap-3 py-2.5 text-sm">
                  <Badge variant={e.type === 'in' ? 'info' : 'danger'}>{t(`adminPages.deposit.types.${e.type}`)}</Badge>
                  <span className="min-w-0 flex-1 truncate">{e.text}</span>
                  <b className={cn('tabular-nums', e.amount > 0 ? 'text-primary' : 'text-destructive')}>{signed(e.amount)}</b>
                  <span className="text-xs text-muted-foreground tabular-nums">{e.date}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}
