import { useTranslation } from 'react-i18next'
import { AccountCard } from './account-card'
import { AddressCard } from './address-card'
import { BenManagerCard } from './ben-manager-card'
import { CompanyCard } from './company-card'
import { ContactCard } from './contact-card'
import { ProfileCard } from './profile-card'

export default function MyInfo() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">{t('myInfo.title')}</h1>

      <ProfileCard />

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
