import { Navigate, useSearchParams } from 'react-router'

/**
 * 간편 로그인 후 BE가 돌려보내는 곳. 쿠키는 BE가 이미 심었으니 결과에 따라 이동만 한다.
 * result=ONBOARDING: 처음 온 사람 → 회사 만들기/합류 화면
 */
export default function AuthCallback() {
  const [params] = useSearchParams()
  if (params.get('success') === '1') {
    return <Navigate to={params.get('result') === 'ONBOARDING' ? '/onboarding' : '/'} replace />
  }
  return <Navigate to={`/login?error=${encodeURIComponent(params.get('error') ?? 'default')}`} replace />
}
