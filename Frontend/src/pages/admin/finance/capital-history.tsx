import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Bar, BarChart, Cell, LabelList, XAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { cny } from '@/lib/format'
import { cn } from '@/lib/utils'
import { capitalHistory } from '@/mocks/admin-finance'
import { td, th } from '../styles'
import { DarkBadge, PageHead, Panel, SuperOnly } from '../ui'

const LIMIT = 5000

/** 자본금정산 기록 (최고관리자 전용): 달마다 확정한 차이 흐름 */
export default function CapitalHistory() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = 'adminPages.capital'
  const rows = capitalHistory.map((h) => ({ ...h, diff: h.capital - h.cash, label: `${Number(h.month.split('-')[1])}월` }))
  const chart = [...rows].reverse()
  const config = { diff: { label: t(`${p}.diff`), color: 'var(--success)' } } satisfies ChartConfig
  const next = Number(capitalHistory[0].month.split('-')[1]) + 1

  return (
    <SuperOnly>
      <PageHead
        back={{ to: '/admin/finance/capital', label: t(`${p}.title`) }}
        title={t(`${p}.history.title`)}
        badge={<DarkBadge>{t('adminPages.superBadge')}</DarkBadge>}
        desc={t(`${p}.history.desc`)}
        actions={
          <>
            <Button variant="outline" className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300" onClick={() => toast(t('common.comingSoon'))}>
              {t(`${p}.history.aiSummary`)}
            </Button>
            <Button className="font-bold" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.history.start`, { month: next })}</Button>
          </>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Panel title={t(`${p}.history.chart`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.history.chartHint`)}</span>}>
          <ChartContainer config={config} className="aspect-auto h-44 w-full">
            <BarChart data={chart.map((r) => ({ ...r, abs: Math.abs(r.diff) }))} margin={{ top: 22, left: 0, right: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <Bar dataKey="abs" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {chart.map((r) => (
                  <Cell key={r.month} fill={Math.abs(r.diff) > LIMIT ? 'var(--warning)' : 'var(--success)'} />
                ))}
                <LabelList dataKey="diff" position="top" fontSize={11} fontWeight={700} formatter={(v) => `${Number(v) > 0 ? '+' : ''}${Number(v).toLocaleString('ko-KR')}`} />
              </Bar>
            </BarChart>
          </ChartContainer>
          <p className="mt-2 text-xs text-muted-foreground">{t(`${p}.history.chartNote`)}</p>
        </Panel>

        <Panel title={t(`${p}.history.records`)}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="bg-muted/40">
                  {(['month', 'capital', 'cash', 'diff', 'state', 'writer', 'confirmer'] as const).map((c) => (
                    <th key={c} className={cn(th, ['capital', 'cash', 'diff'].includes(c) && 'text-right')}>{t(`${p}.history.cols.${c}`)}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const [y, m] = r.month.split('-')
                  return (
                    <tr key={r.month} onClick={() => navigate('/admin/finance/capital')} className="cursor-pointer border-b border-divider hover:bg-muted/40">
                      <td className={cn(td, 'font-bold')}>{t(`${p}.month`, { year: y, month: Number(m) })}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>¥{cny(r.capital)}</td>
                      <td className={cn(td, 'text-right tabular-nums')}>¥{cny(r.cash)}</td>
                      <td className={cn(td, 'text-right font-bold tabular-nums', Math.abs(r.diff) > LIMIT ? 'text-warning' : 'text-success')}>
                        {r.diff < 0 ? '-' : ''}¥{cny(Math.abs(r.diff))}
                      </td>
                      <td className={td}>
                        <Badge variant={r.state === 'draft' ? 'warning' : 'success'}>{t(`${p}.${r.state === 'draft' ? 'drafting' : 'confirmed'}`)}</Badge>
                      </td>
                      <td className={td}>{r.writer}</td>
                      <td className={td}>{r.confirmer ?? '-'}</td>
                      <td className={cn(td, 'text-muted-foreground')}><ChevronRight className="size-4" /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </SuperOnly>
  )
}
