import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Notice } from '@/mocks/customer-home'
import { CardLink } from './card-link'

export function NoticeCard({ notices }: { notices: Notice[] }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('home.notice.title')}</CardTitle>
        <CardAction>
          <CardLink>{t('common.more')}</CardLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-divider">
          {notices.map((n) => (
            <li key={n.id} className="flex items-center gap-2.5 py-3 first:pt-0">
              <Badge variant={n.important ? 'danger' : 'info'}>
                {n.important ? t('home.notice.important') : t('home.notice.normal')}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-[13px]">{n.title}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{n.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
