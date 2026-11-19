import { ChevronRight, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { currentUser } from '@/mocks/customer-home'
import { AccountCard } from './account-card'
import { AddressCard } from './address-card'
import { BenManagerCard } from './ben-manager-card'
import { CompanyCard } from './company-card'
import { ContactCard } from './contact-card'
import { useMembershipRequests } from '../members/data'
import { ProfileCard } from './profile-card'

export default function MyInfo() {
  const { t } = useTranslation()
  const { data: requests = [] } = useMembershipRequests()
  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">{t('myInfo.title')}</h1>

      <ProfileCard />

      {/* 모바일은 하단 탭에 자리가 없어 직원 관리를 여기서 들어간다 (데스크톱은 사이드바) */}
      {currentUser.role === 'OWNER' && (
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
          <CompanyCard />
          <ContactCard />
        </div>
        <div className="space-y-4">
          <AddressCard />
          <BenManagerCard />
          <AccountCard />
        </div>
      </div>
    </div>
  )
}
