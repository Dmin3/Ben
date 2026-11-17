import { Info, LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterChips } from '@/components/filter-chips'
import { SearchInput } from '@/components/form/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { factories } from '@/mocks/factories'
import { PRODUCT_CATEGORIES, products, type Product, type ProductCategory } from '@/mocks/products'
import { ProductCard, ProductTable } from './product-card'

const SORTS = ['recent', 'runs', 'priceLow'] as const
type Sort = (typeof SORTS)[number]

const COMPARE: Record<Sort, (a: Product, b: Product) => number> = {
  recent: (a, b) => b.lastMadeAt.localeCompare(a.lastMadeAt),
  runs: (a, b) => b.runs - a.runs,
  priceLow: (a, b) => a.unitPrice - b.unitPrice,
}

const triggerClass = 'h-10 bg-card px-3 data-[size=default]:h-10'

export default function Products() {
  const { t } = useTranslation()
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [factory, setFactory] = useState('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const q = query.trim().toLowerCase()
  // 칩 개수는 공장, 검색 조건을 반영한다
  const matched = products
    .filter((p) => factory === 'all' || p.factoryId === factory)
    .filter((p) => !q || p.name.toLowerCase().includes(q))
  const rows = matched.filter((p) => category === 'all' || p.category === category).sort(COMPARE[sort])

  const categoryOptions = [
    { value: 'all' as const, label: t('products.categories.all'), count: matched.length },
    ...PRODUCT_CATEGORIES.map((c) => ({
      value: c,
      label: t(`products.categories.${c}`),
      count: matched.filter((p) => p.category === c).length,
    })),
  ]
  const factoryItems = [
    { value: 'all', label: t('products.allFactories') },
    ...factories.map((f) => ({ value: f.id, label: f.name })),
  ]
  const sortItems = SORTS.map((s) => ({ value: s, label: t(`products.sort.${s}`) }))

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('nav.products')}</h1>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {t('products.heading')}{' '}
            <span className="text-[13px] font-normal text-muted-foreground">{t('products.count', { count: products.length })}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('products.description')}</p>
        </div>
        {/* 카드 / 목록 보기 */}
        <div className="flex shrink-0 rounded-xl bg-card p-1 ring-1 ring-border">
          {(
            [
              ['grid', LayoutGrid, t('products.viewGrid')],
              ['list', List, t('products.viewList')],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-pressed={view === key}
              onClick={() => setView(key)}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg transition-colors',
                view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Select items={factoryItems} value={factory} onValueChange={(v) => setFactory(v ?? 'all')}>
            <SelectTrigger className={triggerClass} aria-label={t('products.allFactories')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {factoryItems.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select items={sortItems} value={sort} onValueChange={(v) => setSort((v as Sort) ?? 'recent')}>
            <SelectTrigger className={triggerClass} aria-label={t('products.sort.recent')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortItems.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className="col-span-2 sm:w-60 [&_input]:h-10"
          />
        </div>
      </div>

      <p className="flex gap-2 rounded-xl bg-accent px-4 py-3 text-xs leading-relaxed text-accent-foreground">
        <Info className="mt-px size-3.5 shrink-0" />
        {t('products.notice')}
      </p>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-border">{t('products.empty')}</p>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <ProductTable products={rows} />
      )}
    </div>
  )
}
