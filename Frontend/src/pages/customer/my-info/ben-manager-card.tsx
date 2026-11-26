import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MyInfo } from './data'

export function BenManagerCard({ manager }: { manager: MyInfo['benManager'] }) {
  const { t } = useTranslation()
  // 담당자가 아직 배정되지 않은 고객사는 카드를 숨긴다
  if (!manager) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.manager.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink font-bold text-white">
            {manager.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold">
              {manager.name} {manager.title}
            </div>
            <div className="text-[13px] text-muted-foreground">{manager.description ?? manager.phone ?? manager.email}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
