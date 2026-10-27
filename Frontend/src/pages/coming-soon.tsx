import { useTranslation } from 'react-i18next'

/** 아직 만들지 않은 메뉴 */
export default function ComingSoon() {
  const { t } = useTranslation()
  return <p className="py-20 text-center text-muted-foreground">{t('common.comingSoon')}</p>
}
