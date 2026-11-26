import { ChevronRight, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { AccountCard } from './account-card'
import { AddressCard } from './address-card'
import { BenManagerCard } from './ben-manager-card'
import { CompanyCard } from './company-card'
import { ContactCard } from './contact-card'
import { useMyInfo } from './data'
import { useMembershipRequests } from '../members/data'
import { ProfileCard } from './profile-card'

export default function MyInfo() {
  const { t } = useTranslation()
  const { data: info, error, refetch } = useMyInfo()
  const { data: requests = [] } = useMembershipRequests()

  if (error) {
    // 로그인이 풀렸으면 로그인 화면으로
    if ((error as { status?: number }).status === 401) return <Navigate to="/login" replace />
    return (
      <div className="space-y-3 py-16 text-center text-sm text-muted-foreground">
        <p>{t('myInfo.loadFailed')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('myInfo.retry')}
        </Button>
      </div>
    )
  }
  if (!info) return <h1 className="text-[22px] font-bold">{t('myInfo.title')}</h1>

  const { capabilities: can } = info
  const isOwner = info.profile.memberType === 'MAIN' && info.profile.role === 'OWNER'

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">{t('myInfo.title')}</h1>

      <ProfileCard profile={info.profile} />

      {!can.canEditCompany && <p className="rounded-lg bg-muted px-4 py-2.5 text-[13px] text-muted-foreground">{t('myInfo.ownerOnly')}</p>}

      {/* 모바일은 하단 탭에 자리가 없어 직원 관리를 여기서 들어간다 (데스크톱은 사이드바) */}
      {isOwner && (
        <Link
          to="/members"
          className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm font-semibold hover:bg-muted lg:hidden"
        >
          <Users className="size-5 text-primary" />
          {t('nav.members')}
          {requests.length > 0 && (
            <span className="text-[13px] font-normal text-muted-foreground">
              {t('members.pendingCount', { count: requests.length })}
            </span>
          )}
          <ChevronRight className="ml-auto size-4 text-muted-foreground" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <CompanyCard company={info.company} canEdit={can.canEditCompany} />
          <ContactCard contact={info.contact} canEdit={can.canEditContact} />
        </div>
        <div className="space-y-4">
          <AddressCard addresses={info.addresses} canEdit={can.canManageAddresses} />
          <BenManagerCard manager={info.benManager} />
          <AccountCard account={info.account} />
        </div>
      </div>
    </div>
  )
}
