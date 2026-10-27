import { ClipboardList, Factory, House, Package, UserRound, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet, useMatches } from 'react-router'
import { BottomTabBar, MobileHeader, Sidebar, type NavItem } from '@/components/layout/sidebar'
import { currentUser } from '@/mocks/customer-home'

export default function CustomerLayout() {
  const { t } = useTranslation()
  const hideTabBar = useMatches().some((m) => (m.handle as { hideTabBar?: boolean } | undefined)?.hideTabBar)

  const menu: NavItem[] = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/tasks', label: t('nav.tasks'), icon: ClipboardList },
    { to: '/products', label: t('nav.products'), icon: Package },
    { to: '/factories', label: t('nav.factories'), icon: Factory },
    { to: '/deposit', label: t('nav.deposit'), icon: Wallet },
    { to: '/me', label: t('nav.myInfo'), icon: UserRound },
  ]
  // 모바일 하단 탭은 5칸까지. 내 정보는 상단 프로필 버튼으로 들어간다
  const tabItems = menu.filter((m) => m.to !== '/me')

  return (
    <div className="flex min-h-svh">
      <Sidebar items={menu} user={currentUser} />
      <div className="min-w-0 flex-1">
        <MobileHeader user={currentUser} profileTo="/me" />
        {/* 모바일은 하단 탭 바에 가리지 않도록 아래 여백 확보 */}
        <main className="mx-auto max-w-7xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
      {!hideTabBar && <BottomTabBar items={tabItems} />}
    </div>
  )
}
