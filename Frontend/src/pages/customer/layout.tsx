import { ClipboardList, Factory, House, Package, ShoppingBag, ShoppingCart, UserRound, Users, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, NavLink, Outlet, useMatches } from 'react-router'
import { BottomTabBar, MobileHeader, Sidebar, type NavItem } from '@/components/layout/sidebar'
import { useMe } from '@/lib/me'
import { useMembershipRequests } from './members/data'
import { useCart } from './sourcing/data'

export default function CustomerLayout() {
  const { t } = useTranslation()
  const { data: requests = [] } = useMembershipRequests()
  const { data: cart = [] } = useCart()
  const { data: me, error } = useMe()
  const user = me ?? { name: '', company: '' }
  const hideTabBar = useMatches().some((m) => (m.handle as { hideTabBar?: boolean } | undefined)?.hideTabBar)

  const menu: NavItem[] = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/tasks', label: t('nav.tasks'), icon: ClipboardList },
    { to: '/sourcing', label: t('nav.sourcing'), icon: ShoppingBag, badge: cart.length },
    { to: '/products', label: t('nav.products'), icon: Package },
    { to: '/factories', label: t('nav.factories'), icon: Factory },
    { to: '/deposit', label: t('nav.deposit'), icon: Wallet },
    ...(me?.isOwner
      ? [{ to: '/members', label: t('nav.members'), icon: Users, badge: requests.length }]
      : []),
    { to: '/me', label: t('nav.myInfo'), icon: UserRound },
  ]
  // 모바일 하단 탭은 5칸까지. 내 정보는 상단 프로필 버튼, 직원 관리는 내 정보 안 링크로 들어간다
  // ponytail: 사입이 들어가면서 공장/공급사는 하단 탭에서 빠짐 (홈 거래 공장 카드·제품 화면 링크로 이동). 탭 구성은 클라이언트 확인 필요
  const tabItems = menu.filter((m) => m.to !== '/me' && m.to !== '/members' && m.to !== '/factories')
  const cartLink = (
    <NavLink to="/sourcing/cart" aria-label={t('sourcing.cart')} className="relative rounded-full p-2 text-muted-foreground hover:bg-muted">
      <ShoppingCart className="size-5" />
      {cart.length > 0 && (
        <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground tabular-nums">
          {cart.length}
        </span>
      )}
    </NavLink>
  )

  // 로그인이 풀렸으면 로그인 화면으로 (BE API가 모두 로그인을 요구한다)
  if ((error as { status?: number } | null)?.status === 401) return <Navigate to="/login" replace />
  // 수퍼관리자·관리자계정은 관리자 화면으로
  if (me?.isAdmin) return <Navigate to="/admin" replace />

  return (
    <div className="flex min-h-svh">
      <Sidebar items={menu} user={user} />
      <div className="min-w-0 flex-1">
        <MobileHeader user={user} profileTo="/me" extra={cartLink} />
        {/* 모바일은 하단 탭 바에 가리지 않도록 아래 여백 확보 */}
        <main className="mx-auto max-w-7xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
      {!hideTabBar && <BottomTabBar items={tabItems} />}
    </div>
  )
}
