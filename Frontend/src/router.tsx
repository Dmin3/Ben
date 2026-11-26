import { Navigate, createBrowserRouter } from 'react-router'
import AuthCallback from '@/pages/auth/callback'
import Login from '@/pages/auth/login'
import FindAccount from '@/pages/auth/find-account'
import Onboarding from '@/pages/auth/onboarding'
import Signup from '@/pages/auth/signup'
import MainSignup from '@/pages/auth/signup/main'
import SubSignup from '@/pages/auth/signup/sub'
import AdminCustomers from '@/pages/admin/customers'
import AdminCustomerDetail from '@/pages/admin/customers/detail'
import AdminDeposit from '@/pages/admin/deposit'
import DepositApprovals from '@/pages/admin/deposit/approvals'
import AdminFactories from '@/pages/admin/factories'
import AdminFactoryDetail from '@/pages/admin/factories/detail'
import NewFactory from '@/pages/admin/factories/new'
import CapitalSettlement from '@/pages/admin/finance/capital'
import CapitalHistory from '@/pages/admin/finance/capital-history'
import MonthlySales from '@/pages/admin/finance/sales'
import SalesInput from '@/pages/admin/finance/sales-input'
import AdminHome from '@/pages/admin/home'
import AdminLayout from '@/pages/admin/layout'
import AdminOrders from '@/pages/admin/orders'
import AdminOrderDetail from '@/pages/admin/orders/detail'
import IncomingOrders from '@/pages/admin/orders/incoming'
import AdminSettings from '@/pages/admin/settings'
import SourcingItems from '@/pages/admin/sourcing/items'
import ComingSoon from '@/pages/coming-soon'
import Deposit from '@/pages/customer/deposit'
import Factories from '@/pages/customer/factories'
import CustomerHome from '@/pages/customer/home'
import CustomerLayout from '@/pages/customer/layout'
import Members from '@/pages/customer/members'
import Sourcing from '@/pages/customer/sourcing'
import SourcingCart from '@/pages/customer/sourcing/cart'
import MyInfo from '@/pages/customer/my-info'
import NewOrder from '@/pages/customer/new-order'
import Notices from '@/pages/customer/notices'
import OrderDetail from '@/pages/customer/orders'
import ProductDetail from '@/pages/customer/products/detail'
import Products from '@/pages/customer/products'
import Tasks from '@/pages/customer/tasks'

export const router = createBrowserRouter([
  // 로그인은 사이드바 없는 단독 화면
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  // 가입: 회사 대표(메인)는 누구나, 직원(서브)은 회사 코드로 합류 요청 → 메인이 승인
  { path: '/signup', element: <Signup /> },
  { path: '/signup/main', element: <MainSignup /> },
  { path: '/signup/sub', element: <SubSignup /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/find-account', element: <FindAccount /> },
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerHome /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'factories', element: <Factories /> },
      // 차트(recharts)가 무거워서 공장 상세는 열 때 따로 불러온다
      {
        path: 'factories/:id',
        lazy: () => import('@/pages/customer/factories/detail').then((m) => ({ Component: m.default })),
        HydrateFallback: () => null, // 첫 진입 시 불러오는 동안 본문은 비워 둔다
      },
      { path: 'deposit', element: <Deposit /> },
      { path: 'me', element: <MyInfo /> },
      { path: 'members', element: <Members /> },
      { path: 'sourcing', element: <Sourcing /> },
      { path: 'sourcing/cart', element: <SourcingCart /> },
      { path: 'notices', element: <Notices /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      // 입력 화면은 모바일 하단 탭을 숨기고 자체 버튼 바를 쓴다
      { path: 'orders/new', element: <NewOrder />, handle: { hideTabBar: true } },
      { path: '*', element: <ComingSoon notFound /> },
    ],
  },
  // 관리자 어드민 (기획 시안 12~29번 슬라이드)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminHome /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'orders/incoming', element: <IncomingOrders /> },
      { path: 'orders/:id', element: <AdminOrderDetail /> },
      { path: 'sourcing/items', element: <SourcingItems /> },
      // 사입 주문·입고검수는 시안을 받으면 만든다
      { path: 'sourcing/orders', element: <ComingSoon backTo="/admin" /> },
      { path: 'sourcing/inbound', element: <ComingSoon backTo="/admin" /> },
      { path: 'deposit', element: <AdminDeposit /> },
      { path: 'deposit/approvals', element: <DepositApprovals /> },
      { path: 'factories', element: <AdminFactories /> },
      { path: 'factories/new', element: <NewFactory /> },
      { path: 'factories/:id', element: <AdminFactoryDetail /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'customers/:id', element: <AdminCustomerDetail /> },
      { path: 'finance/capital', element: <CapitalSettlement /> },
      { path: 'finance/capital/history', element: <CapitalHistory /> },
      { path: 'finance/sales', element: <MonthlySales /> },
      { path: 'finance/sales/input', element: <SalesInput /> },
      // ponytail: 출고정산은 지금 쓰는 엑셀을 받아 옮길 예정이라 준비 중
      { path: 'finance/shipping', element: <ComingSoon backTo="/admin" /> },
      { path: 'settings', element: <Navigate to="/admin/settings/notices" replace /> },
      { path: 'settings/notices', element: <AdminSettings section="notices" /> },
      { path: 'settings/roles', element: <AdminSettings section="roles" /> },
      { path: 'settings/activity', element: <AdminSettings section="activity" /> },
      { path: '*', element: <ComingSoon notFound backTo="/admin" /> },
    ],
  },
])
