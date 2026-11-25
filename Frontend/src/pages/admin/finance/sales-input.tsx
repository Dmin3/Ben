import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { won } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SALES_PARTS, lastMonthSalesByPart, salesMonths, type SalesPart } from '@/mocks/admin-finance'
import { panel } from '../styles'
import { PageHead } from '../ui'

const p = 'adminPages.sales'
const toNum = (v: string) => Number(v.replace(/[^\d.-]/g, '')) || 0
type Row = { sales: number; profit: number; cbm: number }

/** 월 매출 입력: 파트별 매출·순수익만 넣으면 원화 환산과 합계는 자동 계산 */
export default function SalesInput() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // ponytail: 시안처럼 마지막 달(9월) 값을 채워 보여준다. 새 달 입력은 API 연동 때 빈 값으로 시작
  const base = salesMonths[salesMonths.length - 1]
  const [rate, setRate] = useState(base.rate)
  const [rows, setRows] = useState<Record<SalesPart, Row>>(
    () => Object.fromEntries(SALES_PARTS.map((part) => [part.key, { sales: lastMonthSalesByPart[part.key], profit: base.profit[part.key], cbm: 'cbm' in part ? (base.cbm ?? 0) : 0 }])) as Record<SalesPart, Row>,
  )
  const krw = (key: SalesPart, v: number) => (SALES_PARTS.find((x) => x.key === key)!.currency === 'CNY' ? v * rate : v)
  const total = (field: 'sales' | 'profit') => SALES_PARTS.reduce((s, part) => s + krw(part.key, rows[part.key][field]), 0)
  const set = (key: SalesPart, field: keyof Row) => (v: string) => setRows((r) => ({ ...r, [key]: { ...r[key], [field]: toNum(v) } }))

  // TODO(API): 월 매출 저장
  const save = () => {
    toast.success(t('adminPages.saved'))
    navigate('/admin/finance/sales')
  }

  const cell = 'h-10 text-right tabular-nums'
  return (
    <div>
      <PageHead
        back={{ to: '/admin/finance/sales', label: t(`${p}.form.back`) }}
        title={t(`${p}.form.title`, { year: 2026, month: base.month })}
        desc={t(`${p}.form.desc`)}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success(t('adminPages.draftSaved'))}>{t('adminPages.saveDraft')}</Button>
            <Button className="px-5 font-bold" onClick={save}>{t('adminPages.save')}</Button>
          </>
        }
      />
      <section className={cn(panel, 'space-y-4 p-5')}>
        <div className="flex max-w-lg items-center justify-between rounded-xl bg-warning-subtle/60 px-4 py-3 ring-1 ring-warning/30">
          <span className="text-sm">
            {t(`${p}.form.rate`, { month: base.month })} <span className="text-xs text-muted-foreground">{t(`${p}.form.rateHint`)}</span>
          </span>
          <Input value={rate} onChange={(e) => setRate(toNum(e.target.value))} aria-label={t(`${p}.form.rate`, { month: base.month })} className="h-10 w-28 text-right font-bold tabular-nums" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {(['part', 'currency', 'cbm', 'sales', 'profit', 'salesKrw', 'profitKrw'] as const).map((c) => (
                  <th key={c} className={cn('px-3 py-3 font-normal', ['part', 'currency', 'cbm'].includes(c) ? 'text-left' : 'text-right')}>{t(`${p}.form.cols.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALES_PARTS.map((part) => {
                const r = rows[part.key]
                const sign = part.currency === 'KRW' ? '₩' : '¥'
                return (
                  <tr key={part.key} className="border-b border-divider">
                    <td className="px-3 py-2.5 font-bold">{t(`${p}.parts.${part.key}`)}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn('rounded px-1.5 py-0.5 text-xs font-semibold', part.currency === 'KRW' ? 'bg-muted' : 'bg-warning-soft text-warning')}>
                        {t(`${p}.form.currencies.${part.currency}`)}
                      </span>
                    </td>
                    <td className="w-24 px-3 py-2.5">
                      {'cbm' in part ? <Input className={cell} value={r.cbm} onChange={(e) => set(part.key, 'cbm')(e.target.value)} aria-label="CBM" /> : '-'}
                    </td>
                    <td className="px-2 py-2.5">
                      <Input className={cell} value={`${sign}${r.sales.toLocaleString('ko-KR')}`} onChange={(e) => set(part.key, 'sales')(e.target.value)} aria-label={`${t(`${p}.parts.${part.key}`)} ${t(`${p}.form.cols.sales`)}`} />
                    </td>
                    <td className="px-2 py-2.5">
                      <Input className={cell} value={`${sign}${r.profit.toLocaleString('ko-KR')}`} onChange={(e) => set(part.key, 'profit')(e.target.value)} aria-label={`${t(`${p}.parts.${part.key}`)} ${t(`${p}.form.cols.profit`)}`} />
                    </td>
                    <td className="px-2 py-2.5"><Input readOnly className={cn(cell, 'bg-muted')} value={won(krw(part.key, r.sales))} /></td>
                    <td className="px-2 py-2.5"><Input readOnly className={cn(cell, 'bg-muted')} value={won(krw(part.key, r.profit))} /></td>
                  </tr>
                )
              })}
              <tr className="bg-foreground font-bold text-background">
                <td colSpan={5} className="px-3 py-3.5">{t(`${p}.form.total`, { month: base.month })}</td>
                <td className="px-3 py-3.5 text-right tabular-nums">{won(total('sales'))}</td>
                <td className="px-3 py-3.5 text-right tabular-nums">{won(total('profit'))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{t(`${p}.form.note`, { month: base.month, year: 2026 })}</p>
      </section>
    </div>
  )
}
