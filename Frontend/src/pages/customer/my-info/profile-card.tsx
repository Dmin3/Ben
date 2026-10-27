import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { profile } from '@/mocks/my-info'

export function ProfileCard() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {profile.name[0]}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold">{t('common.customerName', { name: profile.name })}</div>
          <div className="text-[13px] text-muted-foreground">
            {t('myInfo.profileMeta', { company: profile.company, no: profile.customerNo, date: profile.joinedAt })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
