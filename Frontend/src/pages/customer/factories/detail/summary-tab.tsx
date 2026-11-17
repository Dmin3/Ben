import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { num } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Factory } from '@/mocks/factories'

/** 최댓값보다 20% 여유를 두고 step 단위로 올림. 눈금은 4칸 */
const niceMax = (max: number, step: number) => Math.max(step, Math.ceil((max * 1.2) / step) * step)
const ticksOf = (max: number) => [0, 1, 2, 3, 4].map((i) => (max / 4) * i)
const kilo = (n: number) => (n >= 1000 ? `${num(n / 1000)}K` : String(n))

function YearlyChart({ data }: { data: Factory['yearly'] }) {
  const { t } = useTranslation()
  const maxDeals = niceMax(Math.max(...data.map((d) => d.deals)), 4)
  const maxAmount = niceMax(Math.max(...data.map((d) => d.amount)), 150000)
  const config = {
    deals: { label: t('factories.legendDeals'), color: 'var(--primary)' },
    amount: { label: t('factories.legendAmount'), color: 'var(--chart-soft)' },
  } satisfies ChartConfig

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{t('factories.yearlyTitle')}</CardTitle>
        <div className="flex gap-3 text-xs text-muted-foreground">
          {(['deals', 'amount'] as const).map((key) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: config[key].color }} />
              {config[key].label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={data} margin={{ top: 24, left: -8, right: -8 }} barGap={6}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis yAxisId="deals" width={32} tickLine={false} axisLine={false} domain={[0, maxDeals]} ticks={ticksOf(maxDeals)} />
            <YAxis
              yAxisId="amount"
              orientation="right"
              width={44}
              tickLine={false}
              axisLine={false}
              domain={[0, maxAmount]}
              ticks={ticksOf(maxAmount)}
              tickFormatter={kilo}
            />
            {/* 마우스를 따라다니지 않고 호버한 연도 막대 위쪽에 고정 */}
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
              position={{ y: 0 }}
              isAnimationActive={false}
              content={<ChartTooltipContent />}
            />
            <Bar yAxisId="deals" dataKey="deals" fill="var(--color-deals)" radius={[4, 4, 0, 0]} maxBarSize={36}>
              <LabelList position="top" className="fill-primary" fontSize={11} fontWeight={700} />
            </Bar>
            <Bar yAxisId="amount" dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} maxBarSize={36}>
              <LabelList
                position="top"
                className="fill-primary"
                fontSize={11}
                fontWeight={700}
                formatter={(v) => `¥${kilo(Number(v))}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const DONUT_COLORS = ['#2151a3', '#7b9be0', '#5fbc56', '#2e7d32', '#c3cbd9']

function CategoryDonut({ data }: { data: Factory['categoryShare'] }) {
  const { t } = useTranslation()
  const [active, setActive] = useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.deals, 0)
  // 카테고리 이름에 공백이 있어서 색 변수 키는 c0, c1 ... 로 둔다
  // x, y: 조각 가운데(링 두께 중간)의 위치(%). 툴팁을 마우스가 아닌 이 자리에 고정한다
  // recharts 도넛은 3시 방향에서 시작해 반시계로 그린다. 링 중간 반지름 = (62% + 100%) / 2 = 반지름의 81%
  const rows = data.map((d, i) => {
    const before = data.slice(0, i).reduce((s, x) => s + x.deals, 0)
    const angle = ((before + d.deals / 2) / total) * 2 * Math.PI
    return {
      ...d,
      key: `c${i}`,
      fill: `var(--color-c${i})`,
      pct: Math.round((d.deals / total) * 100),
      x: 50 + 40.5 * Math.cos(angle),
      y: 50 - 40.5 * Math.sin(angle),
    }
  })
  const focused = active === null ? null : rows[active]
  const config = Object.fromEntries(
    rows.map((r, i) => [r.key, { label: r.name, color: DONUT_COLORS[i % DONUT_COLORS.length] }]),
  ) satisfies ChartConfig

  return (
    // 툴팁이 카드 밖으로 조금 나갈 수 있어서 overflow를 연다
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>{t('factories.categoryTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
        <div className="relative size-44 shrink-0">
          <ChartContainer config={config} className="aspect-square size-full">
            <PieChart>
              <Pie
                data={rows}
                dataKey="deals"
                nameKey="key"
                innerRadius="62%"
                outerRadius="100%"
                strokeWidth={2}
                isAnimationActive={false}
                onMouseEnter={(_, i) => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox)) return null
                    const { cx = 0, cy = 0 } = viewBox
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} y={cy - 6} className="fill-foreground text-2xl font-extrabold">
                          {total}
                        </tspan>
                        <tspan x={cx} y={cy + 16} className="fill-muted-foreground text-[11px]">
                          {t('factories.legendDeals')}
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          {focused && (
            <div
              role="tooltip"
              // 위쪽 조각은 툴팁을 아래로 내려서 카드 제목을 가리지 않게 한다
              className={cn(
                'pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl',
                focused.y < 50 ? 'translate-y-2.5' : '-translate-y-[calc(100%+10px)]',
              )}
              style={{ left: `${focused.x}%`, top: `${focused.y}%` }}
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span className="size-2.5 rounded-[2px]" style={{ background: config[focused.key].color }} />
                {focused.name}
              </div>
              <div className="mt-1 text-muted-foreground tabular-nums">
                {t('units.cases', { count: focused.deals })} · {focused.pct}%
              </div>
            </div>
          )}
        </div>
        <ul className="w-full space-y-3 text-sm">
          {rows.map((r, i) => (
            <li
              key={r.key}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className="flex items-center gap-2"
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: config[r.key].color }} />
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              <span className="font-bold tabular-nums">{t('units.cases', { count: r.deals })}</span>
              <span className="w-10 text-right text-muted-foreground tabular-nums">{r.pct}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function SummaryTab({ factory }: { factory: Factory }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <YearlyChart data={factory.yearly} />
      <CategoryDonut data={factory.categoryShare} />
    </div>
  )
}
