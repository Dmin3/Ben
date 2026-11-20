import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Notice } from '@/mocks/customer-home'
import { CardLink } from './card-link'

export function NoticeCard({ notices }: { notices: Notice[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('home.notice.title')}</CardTitle>
        <CardAction>
          <CardLink onClick={() => navigate('/notices')}>{t('common.more')}</CardLink>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-divider">
          {notices.map((n) => (
            <li key={n.id} className="py-3 first:pt-0">
              <Link to={`/notices?id=${n.id}`} className="group flex items-center gap-2.5">
                <Badge variant={n.important ? 'danger' : 'info'}>
                  {n.important ? t('home.notice.important') : t('home.notice.normal')}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-[13px] group-hover:underline">{n.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{n.date.slice(5)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
