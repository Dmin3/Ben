import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DepositAlert } from '@/mocks/deposit'

const VISIBLE = 3
const TYPE_BADGE = { correction: 'neutral', topup: 'warning', confirmed: 'success' } as const

/** BEN이 보낸 예치금 안내. 읽지 않은 알림은 강조 */
export function AlertsCard({
  alerts,
  onLink,
}: {
  alerts: DepositAlert[]
  onLink: (link: NonNullable<DepositAlert['link']>) => void
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const rows = expanded ? alerts : alerts.slice(0, VISIBLE)

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{t('deposit.alertsTitle')}</CardTitle>
        <span className="text-xs text-muted-foreground">{t('deposit.alertsDescription')}</span>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <ul className="space-y-2.5">
          {rows.map((a) => (
            <li
              key={a.id}
              className={cn('space-y-2 rounded-xl border p-4', a.unread && 'border-primary/25 bg-accent/50')}
            >
              <div className="flex items-center gap-2">
                <Badge variant={TYPE_BADGE[a.type]}>{t(`deposit.alertTypes.${a.type}`)}</Badge>
                <span className="text-xs text-muted-foreground tabular-nums">{a.date}</span>
                {a.unread && (
                  <span className="ml-auto size-1.5 rounded-full bg-destructive">
                    <span className="sr-only">{t('deposit.unread')}</span>
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{a.message}</p>
              {a.link && (
                <button
                  type="button"
                  onClick={() => onLink(a.link!)}
                  className="flex items-center text-xs font-semibold text-primary hover:underline"
                >
                  {t(`deposit.alertLinks.${a.link}`)}
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        {alerts.length > VISIBLE && (
          <Button variant="outline" className="h-10 w-full text-muted-foreground" onClick={() => setExpanded((v) => !v)}>
            {expanded ? t('deposit.fewerAlerts') : t('deposit.allAlerts')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
