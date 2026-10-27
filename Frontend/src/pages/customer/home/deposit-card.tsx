import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { deposit as Deposit } from '@/mocks/customer-home'
import { CardLink } from './card-link'

const yuan = (n: number) => `¥${n.toLocaleString('ko-KR')}`

export function DepositCard({ deposit }: { deposit: typeof Deposit }) {
  const { t } = useTranslation()
  const shortage = Math.max(deposit.scheduled - deposit.balance, 0)
  const ratio = Math.min(deposit.balance / deposit.scheduled, 1) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('home.deposit.title')}</CardTitle>
        <CardAction>
          <CardLink>{t('common.history')}</CardLink>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="text-[28px] font-extrabold tabular-nums">{yuan(deposit.balance)}</div>

        <div className="mt-4 flex justify-between text-xs">
          <span className="text-muted-foreground">{t('home.deposit.scheduled')}</span>
          <span className="font-semibold tabular-nums">{yuan(deposit.scheduled)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-danger-soft">
          <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          {shortage > 0 ? (
            <span className="font-semibold text-destructive tabular-nums">
              {t('home.deposit.shortage', { amount: yuan(shortage) })}
            </span>
          ) : (
            <span className="font-semibold text-success">{t('home.deposit.enough')}</span>
          )}
          <span className="text-muted-foreground">{t('home.deposit.due')}</span>
        </div>

        <Button className="mt-auto h-10 w-full bg-ink font-semibold text-white hover:bg-ink/90 max-lg:mt-6">
          {t('home.deposit.charge')}
        </Button>
      </CardContent>
    </Card>
  )
}
