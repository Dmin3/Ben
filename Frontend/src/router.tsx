import { createBrowserRouter } from 'react-router'
import AuthCallback from '@/pages/auth/callback'
import Login from '@/pages/auth/login'
import Onboarding from '@/pages/auth/onboarding'
import Signup from '@/pages/auth/signup'
import MainSignup from '@/pages/auth/signup/main'
import SubSignup from '@/pages/auth/signup/sub'
import ComingSoon from '@/pages/coming-soon'
import Deposit from '@/pages/customer/deposit'
import Factories from '@/pages/customer/factories'
import CustomerHome from '@/pages/customer/home'
import CustomerLayout from '@/pages/customer/layout'
import MyInfo from '@/pages/customer/my-info'
import NewOrder from '@/pages/customer/new-order'
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
  // ponytail: 계정 찾기는 BE API(휴대폰 인증으로 이메일 찾기·비밀번호 재설정)가 생기면 만든다
  { path: '/find-account', element: <ComingSoon /> },
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerHome /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'products', element: <Products /> },
      { path: 'factories', element: <Factories /> },
      // 차트(recharts)가 무거워서 공장 상세는 열 때 따로 불러온다
      {
        path: 'factories/:id',
        lazy: () => import('@/pages/customer/factories/detail').then((m) => ({ Component: m.default })),
        HydrateFallback: () => null, // 첫 진입 시 불러오는 동안 본문은 비워 둔다
      },
      { path: 'deposit', element: <Deposit /> },
      { path: 'me', element: <MyInfo /> },
      // 입력 화면은 모바일 하단 탭을 숨기고 자체 버튼 바를 쓴다
      { path: 'orders/new', element: <NewOrder />, handle: { hideTabBar: true } },
      { path: '*', element: <ComingSoon /> },
    ],
  },
])
