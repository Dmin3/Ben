import { createBrowserRouter } from 'react-router'
import AuthCallback from '@/pages/auth/callback'
import Login from '@/pages/auth/login'
import ComingSoon from '@/pages/coming-soon'
import CustomerHome from '@/pages/customer/home'
import CustomerLayout from '@/pages/customer/layout'
import MyInfo from '@/pages/customer/my-info'
import NewOrder from '@/pages/customer/new-order'
import Tasks from '@/pages/customer/tasks'

export const router = createBrowserRouter([
  // 로그인은 사이드바 없는 단독 화면
  { path: '/login', element: <Login /> },
  { path: '/auth/callback', element: <AuthCallback /> },
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerHome /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'me', element: <MyInfo /> },
      // 입력 화면은 모바일 하단 탭을 숨기고 자체 버튼 바를 쓴다
      { path: 'orders/new', element: <NewOrder />, handle: { hideTabBar: true } },
      { path: '*', element: <ComingSoon /> },
    ],
  },
])
