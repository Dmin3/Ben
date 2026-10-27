import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Factory } from '@/mocks/customer-home'
import { CardLink } from './card-link'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="w-20 text-right">
      <div className="text-[15px] font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  )
}

export function FactoryCard({ factories }: { factories: Factory[] }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('home.factory.title')}</CardTitle>
        <CardAction>
          <CardLink>{t('common.viewAll')}</CardLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-divider">
          {factories.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold">{f.name}</span>
                  <Badge variant="info">{t(`home.factory.grades.${f.grade}`)}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
              <Stat value={`${f.onTimeRate}%`} label={t('home.factory.onTime')} />
              <Stat value={t('units.cases', { count: f.activeOrders })} label={t('home.factory.activeOrders')} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
