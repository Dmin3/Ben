import { ChevronRight, FileText } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FactoryGradeBadge } from '@/components/factory/grade-badge'
import { SearchInput } from '@/components/form/search-input'
import { yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { factories, type Factory } from '@/mocks/factories'

const COLS = 'lg:grid lg:grid-cols-[minmax(0,1fr)_100px_80px_80px_130px_80px_20px] lg:items-center lg:gap-4'

function FactoryName({ f }: { f: Factory }) {
  return (
    <div className="flex min-w-0 items-center gap-3.5">
      <div aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-subtle-foreground">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-bold">{f.name}</span>
          <FactoryGradeBadge grade={f.grade} />
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          {f.category} | {f.region}
        </div>
      </div>
    </div>
  )
}

export default function Factories() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = factories.filter(
    (f) => !q || [f.name, f.category, ...f.tags].some((s) => s.toLowerCase().includes(q)),
  )

  // 숫자 칸: 데스크톱은 표의 한 칸, 모바일은 라벨이 붙은 작은 칸
  const stats = (f: Factory) => [
    { label: t('factories.cols.onTime'), value: `${f.onTimeRate}%` },
    { label: t('factories.cols.defect'), value: `${f.defectRate}%` },
    { label: t('factories.cols.deals'), value: String(f.deals) },
    { label: t('factories.cols.amount'), value: yuan(f.totalAmount) },
    { label: t('factories.cols.lead'), value: t('units.days', { count: f.avgLeadDays }) },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('nav.factories')}</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">
          {t('factories.heading')}{' '}
          <span className="text-[13px] font-normal text-muted-foreground">{t('factories.count', { count: factories.length })}</span>
        </h2>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('factories.searchPlaceholder')}
          className="sm:w-80"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <div className={cn(COLS, 'hidden border-b px-6 py-3.5 text-xs text-muted-foreground lg:grid')}>
          <span>{t('factories.cols.factory')}</span>
          {stats(factories[0]).map((s) => (
            <span key={s.label} className="text-right">
              {s.label}
            </span>
          ))}
          <span />
        </div>

        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t('factories.empty')}</p>
        ) : (
          <ul className="divide-y divide-divider">
            {rows.map((f) => (
              <li key={f.id}>
                <Link to={`/factories/${f.id}`} className={cn(COLS, 'block px-5 py-4 transition-colors hover:bg-muted/60 lg:px-6')}>
                  <div className="flex items-center justify-between gap-3">
                    <FactoryName f={f} />
                    <ChevronRight className="size-4 shrink-0 text-subtle-foreground lg:hidden" />
                  </div>
                  {/* 모바일: 2~3열 작은 칸 / 데스크톱: 표 칸 */}
                  <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 rounded-xl bg-muted/50 p-3 lg:contents">
                    {stats(f).map((s) => (
                      <div key={s.label} className="lg:text-right">
                        <dt className="text-[11px] text-muted-foreground lg:sr-only">{s.label}</dt>
                        <dd className="text-sm font-bold tabular-nums lg:text-[15px]">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ChevronRight className="hidden size-4 text-subtle-foreground lg:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
