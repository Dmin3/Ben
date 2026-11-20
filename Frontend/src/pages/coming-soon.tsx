import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'

/** 아직 만들지 않은 메뉴, 또는 없는 주소(notFound). 돌아갈 곳 버튼을 같이 둔다 */
export default function ComingSoon({ notFound, backTo = '/' }: { notFound?: boolean; backTo?: '/' | '/login' }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4 py-20 text-center">
      <p className="text-muted-foreground">{t(notFound ? 'common.notFound' : 'common.comingSoon')}</p>
      <Link to={backTo} replace className={buttonVariants({ variant: 'outline' })}>
        {t(backTo === '/login' ? 'signup.toLogin' : 'common.toHome')}
      </Link>
    </div>
  )
}
