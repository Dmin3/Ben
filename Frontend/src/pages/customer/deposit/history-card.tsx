import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterChips } from '@/components/filter-chips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { downloadCsv } from '@/lib/csv'
import { num } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/mocks/deposit'

const PAGE_SIZE = 10
const PERIODS = ['3m', '6m', '1y', 'all'] as const
type Period = (typeof PERIODS)[number]
const PERIOD_MONTHS: Record<Period, number | null> = { '3m': 3, '6m': 6, '1y': 12, all: null }

const COLS = 'sm:grid sm:grid-cols-[48px_100px_minmax(0,1fr)_130px_130px] sm:items-center sm:gap-4'

const parseDate = (d: string) => new Date(d.replaceAll('.', '-'))

/** 입출금 내역: 입금/출금 필터, 기간, 엑셀(CSV) 다운로드, 페이지 나눔 */
export function HistoryCard({ transactions, asOf }: { transactions: Transaction[]; asOf: string }) {
  const { t } = useTranslation()
  const [type, setType] = useState<'all' | Transaction['type']>('all')
  const [period, setPeriod] = useState<Period>('3m')
  const [page, setPage] = useState(1)

  // ponytail: 목업은 잔액 기준일(asOf)부터 거꾸로 기간을 센다. API 연동 시 기간·페이지는 서버가 거른다
  const months = PERIOD_MONTHS[period]
  const from = parseDate(asOf)
  if (months) from.setMonth(from.getMonth() - months)
  const rows = transactions
    .filter((x) => type === 'all' || x.type === type)
    .filter((x) => !months || parseDate(x.date) >= from)

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const cny = (n: number) => t('units.cny', { amount: num(n) })
  const signed = (n: number) => (n > 0 ? `+${cny(n)}` : `-${cny(-n)}`)

  const periodItems = PERIODS.map((p) => ({ value: p, label: t(`deposit.periods.${p}`) }))
  const typeOptions = (['all', 'in', 'out'] as const).map((v) => ({ value: v, label: t(`deposit.filters.${v}`) }))

  // 엑셀에서 바로 열리도록 BOM 붙인 CSV로 내려받는다
  const exportCsv = () => {
    const head = (['no', 'date', 'description', 'amount', 'balance'] as const).map((c) => t(`deposit.cols.${c}`))
    const body = rows.map((x, i) => [i + 1, x.date, x.orderId ? `${x.description} (${x.orderId})` : x.description, x.amount, x.balance])
    downloadCsv(`deposit-history-${asOf.replaceAll('.', '')}.csv`, [head, ...body])
  }

  return (
    <Card id="deposit-history" className="scroll-mt-20">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-base">
          {t('deposit.historyTitle')}{' '}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{t('deposit.total', { count: rows.length })}</span>
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <FilterChips
            options={typeOptions}
            value={type}
            onChange={(v) => {
              setType(v)
              setPage(1)
            }}
          />
          <Select
            items={periodItems}
            value={period}
            onValueChange={(v) => {
              setPeriod((v as Period) ?? '3m')
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 bg-card px-3 data-[size=default]:h-9" aria-label={t('deposit.cols.date')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodItems.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9" onClick={exportCsv} disabled={rows.length === 0}>
            <Download /> {t('deposit.excel')}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className={cn(COLS, 'hidden border-y bg-muted/40 px-4 py-3 text-xs text-muted-foreground sm:grid')}>
          <span className="text-center">{t('deposit.cols.no')}</span>
          <span>{t('deposit.cols.date')}</span>
          <span>{t('deposit.cols.description')}</span>
          <span className="text-right">{t('deposit.cols.amount')}</span>
          <span className="text-right">{t('deposit.cols.balance')}</span>
        </div>

        {pageRows.length === 0 ? (
          <p className="py-14 text-center text-sm text-muted-foreground">{t('deposit.empty')}</p>
        ) : (
          <ul className="divide-y divide-divider border-b border-divider max-sm:border-t">
            {pageRows.map((x, i) => (
              <li key={x.id} className={cn(COLS, 'flex flex-wrap items-center gap-x-3 gap-y-1 px-1 py-3.5 text-sm sm:px-4')}>
                <span className="hidden text-center text-muted-foreground tabular-nums sm:block">
                  {(current - 1) * PAGE_SIZE + i + 1}
                </span>
                <span className="w-full text-xs text-muted-foreground tabular-nums sm:w-auto sm:text-sm sm:text-foreground">{x.date}</span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{x.description}</span>
                  <Badge variant={x.type === 'in' ? 'info' : 'neutral'}>{t(`deposit.filters.${x.type}`)}</Badge>
                  {x.orderId && <span className="text-xs text-subtle-foreground tabular-nums">{x.orderId}</span>}
                </span>
                <span
                  className={cn(
                    'font-bold tabular-nums sm:text-right',
                    x.amount > 0 ? 'text-primary' : 'text-destructive',
                  )}
                >
                  {signed(x.amount)}
                </span>
                <span className="w-full text-right text-xs text-muted-foreground tabular-nums sm:w-auto sm:text-sm sm:font-bold sm:text-foreground">
                  {cny(x.balance)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-1">
            <PageButton label={t('deposit.prevPage')} disabled={current === 1} onClick={() => setPage(current - 1)}>
              <ChevronLeft className="size-4" />
            </PageButton>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <PageButton key={p} label={t('deposit.page', { page: p })} active={p === current} onClick={() => setPage(p)}>
                {p}
              </PageButton>
            ))}
            <PageButton label={t('deposit.nextPage')} disabled={current === pages} onClick={() => setPage(current + 1)}>
              <ChevronRight className="size-4" />
            </PageButton>
          </nav>
        )}
      </CardContent>
    </Card>
  )
}

function PageButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors disabled:opacity-40',
        active ? 'bg-primary font-bold text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
