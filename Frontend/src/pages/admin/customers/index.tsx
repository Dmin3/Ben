import { ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { FilterChips } from '@/components/filter-chips'
import { Input } from '@/components/ui/input'
import { cny } from '@/lib/format'
import { cn } from '@/lib/utils'
import { customers } from '@/mocks/admin'
import { panel, td, th } from '../styles'
import { PageHead } from '../ui'

// ponytail: 고객관리는 시안이 없어 관리자 사이드바 설명(고객사 정보·담당자·예치금 잔액·수수료율·탈퇴 회원)으로 만든 초안
export default function AdminCustomers() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = 'adminPages.customers'
  const [tab, setTab] = useState<'active' | 'left'>('active')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const rows = customers.filter((c) => (tab === 'left') === !!c.left && (!q || [c.name, c.loginId, c.owner].some((v) => v.toLowerCase().includes(q))))
  const tabs = (['active', 'left'] as const).map((v) => ({ value: v, label: t(`${p}.tabs.${v}`), count: customers.filter((c) => (v === 'left') === !!c.left).length }))

  return (
    <div>
      <PageHead title={t(`${p}.title`)} desc={t(`${p}.desc`)} />
      <FilterChips options={tabs} value={tab} onChange={setTab} className="mb-4" />
      <section className={cn(panel, 'overflow-hidden')}>
        <div className="p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(`${p}.searchPlaceholder`)} aria-label={t('adminPages.search')} className="h-10 pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-y bg-muted/40">
                {(['customer', 'loginId', 'manager', 'balance', 'fee', 'active', 'amount', 'joined'] as const).map((c) => (
                  <th key={c} className={cn(th, ['balance', 'fee', 'active', 'amount'].includes(c) && 'text-right')}>{t(`${p}.cols.${c}`)}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-muted-foreground">{t(`${p}.empty`)}</td>
                </tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/admin/customers/${c.id}`)} className="cursor-pointer border-b border-divider hover:bg-muted/40">
                  <td className={td}>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.owner}</div>
                  </td>
                  <td className={cn(td, 'text-muted-foreground')}>{c.loginId}</td>
                  <td className={td}>{c.manager}</td>
                  <td className={cn(td, 'text-right font-bold tabular-nums', c.balance < 0 && 'text-destructive')}>{cny(c.balance)}</td>
                  <td className={cn(td, 'text-right tabular-nums')}>{c.feeRate}%</td>
                  <td className={cn(td, 'text-right tabular-nums')}>{t('adminPages.count', { count: c.activeOrders })}</td>
                  <td className={cn(td, 'text-right tabular-nums')}>{c.totalAmount.toLocaleString('ko-KR')} {t('adminPages.yuanUnit')}</td>
                  <td className={cn(td, 'tabular-nums')}>{c.joinedAt}</td>
                  <td className={cn(td, 'text-muted-foreground')}><ChevronRight className="size-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
