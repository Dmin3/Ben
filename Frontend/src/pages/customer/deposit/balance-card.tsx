import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { num } from '@/lib/format'
import type { depositSummary } from '@/mocks/deposit'

/** 파란 잔액 카드: 잔액, 누적 충전/사용, 다음 차감 예정, 인보이스·TT 안내 버튼 */
export function BalanceCard({
  summary: s,
  onInvoice,
  onTtGuide,
}: {
  summary: typeof depositSummary
  onInvoice: () => void
  onTtGuide: () => void
}) {
  const { t } = useTranslation()
  const cny = (n: number) => t('units.cny', { amount: num(n) })

  return (
    <section className="flex flex-col rounded-2xl bg-primary p-6 text-primary-foreground lg:p-7">
      <h2 className="text-sm opacity-85">{t('deposit.balance')}</h2>
      <div className="mt-2 text-[34px] leading-tight font-extrabold tabular-nums lg:text-[44px]">{cny(s.balance)}</div>
      <div className="mt-1.5 text-xs opacity-75">{t('deposit.asOf', { date: s.asOf })}</div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
        <span>
          {t('deposit.totalCharged')} <b className="tabular-nums">+{cny(s.totalCharged)}</b>
        </span>
        <span aria-hidden className="h-3 w-px bg-white/40" />
        <span>
          {t('deposit.totalUsed')} <b className="tabular-nums">-{cny(s.totalUsed)}</b>
        </span>
      </div>

      <div className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-white/20 pt-5 text-[13px]">
        <span className="opacity-90">{t('deposit.next', { label: s.next.label })}</span>
        <b className="tabular-nums">{t('deposit.nextValue', { date: s.next.date, amount: cny(s.next.amount) })}</b>
      </div>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:mt-auto lg:pt-6">
        <Button className="h-12 bg-white font-bold text-primary hover:bg-white/90" onClick={onInvoice}>
          <Download /> {t('deposit.downloadInvoice')}
        </Button>
        <Button
          variant="outline"
          className="h-12 border-white/60 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white"
          onClick={onTtGuide}
        >
          {t('deposit.ttGuide')}
        </Button>
      </div>
    </section>
  )
}
