import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { num, won } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SALES_PARTS, profitKrw, salesMonths } from '@/mocks/admin-finance'
import { panel, td, th } from '../styles'
import { PageHead, Panel, Stat } from '../ui'

const p = 'adminPages.sales'
/** 억·만 단위 짧은 원화 (1.22억, 4,215만) */
const short = (n: number) => (n >= 1e8 ? `${(n / 1e8).toFixed(2)}억` : `${num(Math.round(n / 1e4))}만`)
const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0)

/** 월 매출 현황: 파트별 순수익 입력값을 월·연도로 합산 (합계는 그 달 환율로 원화 환산) */
export default function MonthlySales() {
  const { t } = useTranslation()
  const [year, setYear] = useState<'2026' | '2025' | 'compare'>('2026')
  // TODO(API): 연도별 매출 조회. mock은 2026년만 있다
  const months = salesMonths
  const last = months[months.length - 1]
  const prev = months[months.length - 2]
  const totalSales = months.reduce((s, m) => s + m.sales, 0)
  const totalProfit = months.reduce((s, m) => s + profitKrw(m), 0)
  const partTotals = SALES_PARTS.map((part) => ({
    key: part.key,
    krw: months.reduce((s, m) => s + (part.currency === 'CNY' ? m.profit[part.key] * m.rate : m.profit[part.key]), 0),
  })).sort((a, b) => b.krw - a.krw)
  const maxPart = partTotals[0].krw

  const config = {
    sales: { label: t(`${p}.legendSales`), color: 'var(--chart-soft)' },
    profit: { label: t(`${p}.legendProfit`), color: 'var(--primary)' },
  } satisfies ChartConfig
  const chart = Array.from({ length: 12 }, (_, i) => {
    const m = months.find((x) => x.month === i + 1)
    return { month: `${i + 1}월`, sales: m ? m.sales : null, profit: m ? profitKrw(m) * 8 : null }
  })

  return (
    <div className="space-y-4">
      <PageHead
        title={t(`${p}.title`)}
        desc={t(`${p}.desc`)}
        actions={
          <>
            <div role="radiogroup" className="flex overflow-hidden rounded-lg border">
              {(['2026', '2025', 'compare'] as const).map((y) => (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={year === y}
                  onClick={() => (y === '2026' ? setYear(y) : toast(t('common.comingSoon')))}
                  className={cn('px-4 py-2 text-sm font-semibold', year === y ? 'bg-foreground text-background' : 'bg-card hover:bg-muted')}
                >
                  {y === 'compare' ? t(`${p}.compare`) : `${y}년`}
                </button>
              ))}
            </div>
            <Button variant="outline" className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300" onClick={() => toast(t('common.comingSoon'))}>
              {t(`${p}.aiSummary`)}
            </Button>
            <Button className="font-bold" nativeButton={false} render={<Link to="/admin/finance/sales/input" />}>
              {t(`${p}.input`, { month: last.month + 1 })}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t(`${p}.kpi.sales`, { year: 2026 })} value={won(totalSales)} note={t(`${p}.kpi.salesNote`, { month: last.month })} />
        <Stat label={t(`${p}.kpi.profit`, { year: 2026 })} value={won(totalProfit)} tone="primary" note={t(`${p}.kpi.profitNote`, { rate: ((totalProfit / totalSales) * 100).toFixed(1) })} />
        <Stat label={t(`${p}.kpi.monthSales`, { month: last.month })} value={won(last.sales)} note={t(`${p}.kpi.vsPrev`, { diff: pct(last.sales, prev.sales).toFixed(1) })} noteTone="success" />
        <Stat label={t(`${p}.kpi.monthProfit`, { month: last.month })} value={won(profitKrw(last))} note={t(`${p}.kpi.vsPrev`, { diff: pct(profitKrw(last), profitKrw(prev)).toFixed(1) })} noteTone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title={t(`${p}.chart`)}
          action={
            <div className="flex gap-3 text-xs text-muted-foreground">
              {(['sales', 'profit'] as const).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ background: config[k].color }} />
                  {config[k].label}
                </span>
              ))}
            </div>
          }
        >
          <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart data={chart} barGap={4}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="profit" fill="var(--color-profit)" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ChartContainer>
        </Panel>
        <Panel title={t(`${p}.share`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.shareNote`, { year: 2026 })}</span>}>
          <ul className="space-y-3.5">
            {partTotals.map((part) => (
              <li key={part.key} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0">{t(`${p}.parts.${part.key}`)}</span>
                <span className="h-2 flex-1 rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(part.krw / maxPart) * 100}%` }} />
                </span>
                <span className="w-16 text-right">
                  <b className="block tabular-nums">{short(part.krw)}</b>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{((part.krw / totalProfit) * 100).toFixed(1)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <section className={cn(panel, 'p-5')}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold">{t(`${p}.table`)}</h2>
          <span className="text-xs text-muted-foreground">{t(`${p}.tableNote`)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-muted/40">
                <th className={th}>{t(`${p}.cols.month`)}</th>
                {SALES_PARTS.map((part) => (
                  <th key={part.key} className={cn(th, 'text-right')}>
                    {t(`${p}.parts.${part.key}`)} {part.currency === 'KRW' ? '₩' : '¥'}
                  </th>
                ))}
                <th className={cn(th, 'bg-primary-soft text-right font-semibold text-primary')}>{t(`${p}.cols.sales`)}</th>
                <th className={cn(th, 'bg-primary-soft text-right font-semibold text-primary')}>{t(`${p}.cols.profit`)}</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={m.month} className="border-b border-divider">
                  <td className={td}>
                    <b>{t(`${p}.monthLabel`, { month: m.month })}</b>
                    <div className="text-[11px] text-muted-foreground">{t(`${p}.rateLine`, { rate: m.rate })}</div>
                  </td>
                  {SALES_PARTS.map((part) => (
                    <td key={part.key} className={cn(td, 'text-right tabular-nums', !m.profit[part.key] && 'text-subtle-foreground')}>
                      {num(m.profit[part.key])}
                      {'cbm' in part && m.cbm && <div className="text-[11px] text-muted-foreground">{m.cbm}CBM</div>}
                    </td>
                  ))}
                  <td className={cn(td, 'bg-primary-soft/40 text-right font-bold tabular-nums')}>{won(m.sales)}</td>
                  <td className={cn(td, 'bg-primary-soft/40 text-right font-bold tabular-nums')}>{won(profitKrw(m))}</td>
                </tr>
              ))}
              <tr className="bg-foreground font-bold text-background">
                <td className={td}>{t(`${p}.yearTotal`, { year: 2026 })}</td>
                {SALES_PARTS.map((part) => (
                  <td key={part.key} className={cn(td, 'text-right tabular-nums')}>{num(Math.round(months.reduce((s, m) => s + m.profit[part.key], 0)))}</td>
                ))}
                <td className={cn(td, 'text-right tabular-nums')}>{won(totalSales)}</td>
                <td className={cn(td, 'text-right tabular-nums')}>{won(totalProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
