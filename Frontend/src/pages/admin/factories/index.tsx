import { ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { FilterChips } from '@/components/filter-chips'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { factories, type Factory } from '@/mocks/factories'
import { adminOrders, factoryActive as activeOf } from '@/mocks/admin'
import { panel, td, th } from '../styles'
import { PageHead, Stat } from '../ui'

type Cat = 'all' | 'apparel' | 'bag' | 'home' | 'material'
// ponytail: 공장 카테고리를 문자열로 분류. 공장 API에 카테고리 코드가 생기면 그 값을 쓴다
const catOf = (f: Factory): Cat => (f.category.includes('가방') || f.category.includes('잡화') ? 'bag' : f.category.includes('홈') ? 'home' : f.category.includes('원단') ? 'material' : 'apparel')

/** 공급망관리: 거래 공장 목록과 지표 */
export default function AdminFactories() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = 'adminPages.factories'
  const [cat, setCat] = useState<Cat>('all')
  const [query, setQuery] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)

  const q = query.trim().toLowerCase()
  const rows = factories
    .filter((f) => (cat === 'all' || catOf(f) === cat) && (!q || [f.name, f.category, f.region, ...f.tags].some((v) => v.toLowerCase().includes(q))))
    .filter((f) => !activeOnly || activeOf(f.id).orders.length > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
  const openIssues = factories.flatMap((f) => f.issues.filter((i) => !i.resolved).map(() => f.id))
  const activeFactories = factories.filter((f) => activeOf(f.id).orders.length > 0)

  const cats = (['all', 'apparel', 'bag', 'home', 'material'] as const).map((v) => ({
    value: v,
    label: t(`${p}.categories.${v}`),
    count: factories.filter((f) => v === 'all' || catOf(f) === v).length,
  }))

  return (
    <div>
      <PageHead
        title={t(`${p}.title`)}
        desc={t(`${p}.desc`)}
        actions={<Button className="h-10 px-4 font-bold" nativeButton={false} render={<Link to="/admin/factories/new" />}>{t(`${p}.register`)}</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t(`${p}.kpi.total`)} value={factories.length} unit={t('adminPages.placeUnit')} />
        <Stat label={t(`${p}.kpi.amount`)} value={factories.reduce((s, f) => s + f.totalAmount, 0).toLocaleString('ko-KR')} unit={t('adminPages.yuanUnit')} note={t(`${p}.kpi.amountNote`)} />
        <Stat
          label={t(`${p}.kpi.active`)}
          value={activeFactories.length}
          unit={t('adminPages.placeUnit')}
          note={t(`${p}.kpi.activeNote`, { count: adminOrders.filter((o) => o.factoryId && o.step < 8).length })}
        />
        <Stat
          label={t(`${p}.kpi.issues`)}
          value={openIssues.length}
          unit={t('adminPages.caseUnit')}
          tone="danger"
          note={t(`${p}.kpi.issuesNote`, { count: new Set(openIssues).size })}
          noteTone="danger"
        />
      </div>

      <FilterChips options={cats} value={cat} onChange={setCat} className="mb-4" />

      <section className={cn(panel, 'overflow-hidden')}>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(`${p}.searchPlaceholder`)} aria-label={t('adminPages.search')} className="h-10 pl-9" />
          </div>
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="accent-primary" />
            {t(`${p}.activeOnly`)}
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px]">
            <thead>
              <tr className="border-y bg-muted/40">
                {(['no', 'factory', 'items', 'customers', 'active', 'amount', 'issues', 'onTime', 'last'] as const).map((c) => (
                  <th key={c} className={cn(th, ['active', 'amount', 'issues'].includes(c) && 'text-right')}>{t(`${p}.cols.${c}`)}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-sm text-muted-foreground">{t(`${p}.empty`)}</td>
                </tr>
              )}
              {rows.map((f, i) => {
                const { orders, names } = activeOf(f.id)
                const issues = f.issues.filter((x) => !x.resolved).length
                return (
                  <tr key={f.id} onClick={() => navigate(`/admin/factories/${f.id}`)} className="cursor-pointer border-b border-divider hover:bg-muted/40">
                    <td className={cn(td, 'text-muted-foreground')}>{i + 1}</td>
                    <td className={td}>
                      <Link to={`/admin/factories/${f.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">{f.name[0]}</span>
                        <span>
                          <span className="block font-semibold">{f.name}</span>
                          <span className="block text-xs text-muted-foreground">{f.region.replace('중국 ', '')} · {f.category}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={td}>{f.tags.slice(0, 2).join(', ')}</td>
                    <td className={td}>
                      <div className="flex gap-1">
                        {names.length === 0 && <span className="text-xs text-muted-foreground">{t('adminPages.none')}</span>}
                        {names.slice(0, 2).map((n) => (
                          <span key={n} className="rounded bg-muted px-1.5 py-0.5 text-xs">{n}</span>
                        ))}
                        {names.length > 2 && <span className="rounded bg-muted px-1.5 py-0.5 text-xs">+{names.length - 2}</span>}
                      </div>
                    </td>
                    <td className={cn(td, 'text-right tabular-nums')}>{t('adminPages.count', { count: orders.length })}</td>
                    <td className={cn(td, 'text-right font-bold tabular-nums')}>{f.totalAmount.toLocaleString('ko-KR')} {t('adminPages.yuanUnit')}</td>
                    <td className={cn(td, 'text-right tabular-nums', issues ? 'font-bold text-destructive' : 'text-subtle-foreground')}>{t('adminPages.count', { count: issues })}</td>
                    <td className={td}>
                      <span className="flex items-center gap-2 tabular-nums">
                        {f.onTimeRate}%
                        <span className="h-1 w-12 rounded-full bg-muted">
                          <span className={cn('block h-full rounded-full', f.onTimeRate >= 90 ? 'bg-success' : 'bg-warning')} style={{ width: `${f.onTimeRate}%` }} />
                        </span>
                      </span>
                    </td>
                    <td className={cn(td, 'tabular-nums')}>{f.history[0]?.date ?? '-'}</td>
                    <td className={cn(td, 'text-muted-foreground')}><ChevronRight className="size-4" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">{t(`${p}.footer`, { count: rows.length })}</div>
      </section>
    </div>
  )
}
