import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TodoItem } from '@/mocks/customer-home'
import { CardLink } from './card-link'

const types = {
  qc: { badge: 'warning', bg: 'bg-warning-subtle' },
  deposit: { badge: 'warning', bg: 'bg-warning-subtle' },
  delay: { badge: 'danger', bg: 'bg-danger-subtle' },
} as const

export function TodoCard({ items }: { items: TodoItem[] }) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('home.todo.title')}</CardTitle>
        <CardAction>
          <CardLink>{t('common.viewAll')}</CardLink>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const style = types[item.type]
          return (
            <div key={item.id} className={cn('flex items-center gap-3 rounded-xl px-3.5 py-2.5', style.bg)}>
              <Badge variant={style.badge}>{t(`home.todo.types.${item.type}`)}</Badge>
              {/* 제목, 설명은 서버 데이터 (번역하지 않음) */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{item.title}</div>
                <div className="truncate text-xs text-muted-foreground">{item.meta}</div>
              </div>
              <Button variant="outline" className="border-primary/60 text-primary hover:text-primary">
                {t(`home.todo.actions.${item.type}`)}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
