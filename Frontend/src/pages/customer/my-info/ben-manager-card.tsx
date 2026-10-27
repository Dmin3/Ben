import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { benManager } from '@/mocks/my-info'

export function BenManagerCard() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.manager.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink font-bold text-white">
            {benManager.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold">
              {benManager.name} {benManager.title}
            </div>
            <div className="text-[13px] text-muted-foreground">{benManager.description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
