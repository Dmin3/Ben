import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export type OrderStatus = 'needs_check' | 'delayed' | 'normal' | 'quote_pending' | 'reviewing' | 'completed'

const variants = {
  needs_check: 'warning',
  delayed: 'danger',
  normal: 'success',
  quote_pending: 'neutral',
  reviewing: 'warning',
  completed: 'neutral',
} as const

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return <Badge variant={variants[status]}>{t(`order.status.${status}`)}</Badge>
}
