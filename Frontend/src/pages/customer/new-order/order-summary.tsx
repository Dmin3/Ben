import { useFormContext, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { NewOrderForm } from './schema'

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-divider py-2.5 text-[13px] last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={highlight ? 'truncate font-bold text-primary' : 'truncate font-semibold'}>{value}</span>
    </div>
  )
}

/** 입력값을 실시간으로 보여주는 오더 요약 */
export function OrderSummary() {
  const { t } = useTranslation()
  const { control } = useFormContext<NewOrderForm>()
  const [productName, quantities, dueDate, process, shipping] = useWatch({
    control,
    name: ['productName', 'quantities', 'dueDate', 'process', 'shipping'],
  })
  const total = quantities.reduce((sum, r) => sum + (Number.isFinite(r.qty) ? r.qty : 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('newOrder.summary.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Row label={t('newOrder.summary.productName')} value={productName.trim() || '-'} />
        <Row
          label={t('newOrder.summary.totalQty')}
          value={total ? t('units.pcs', { qty: total.toLocaleString('ko-KR') }) : '-'}
          highlight={total > 0}
        />
        <Row label={t('newOrder.summary.dueDate')} value={dueDate ? dueDate.replaceAll('-', '.') : '-'} />
        <Row label={t('newOrder.summary.process')} value={process ? t(`newOrder.processTypes.${process}`) : '-'} />
        <Row label={t('newOrder.summary.shipping')} value={shipping ? t(`newOrder.shippingMethods.${shipping}`) : '-'} />
      </CardContent>
    </Card>
  )
}

export function NextSteps() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('newOrder.nextSteps.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-inside list-decimal space-y-1.5 text-[13px] text-foreground/80">
          <li>{t('newOrder.nextSteps.step1')}</li>
          <li>{t('newOrder.nextSteps.step2')}</li>
          <li>{t('newOrder.nextSteps.step3')}</li>
        </ol>
      </CardContent>
    </Card>
  )
}
