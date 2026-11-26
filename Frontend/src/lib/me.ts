import { useQuery } from '@tanstack/react-query'
import { getJson } from '@/lib/api'

// GET /api/auth/me (BE src/app/api/auth/me/route.ts)
type AuthMe = {
  name: string
  accountName: string
  memberType: 'MAIN' | 'SUB'
  role: 'OWNER' | 'MEMBER'
  accountRole: 'SUPER_ADMIN' | 'ADMIN' | 'MAIN' | 'SUB'
}

/** 로그인한 사용자. 로그인이 풀렸으면 error.status === 401 */
export const useMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await getJson<AuthMe>('/api/auth/me')
      if (!res.ok) throw Object.assign(new Error(res.code), { status: res.status })
      const me = res.data
      return { ...me, company: me.accountName, isOwner: me.memberType === 'MAIN' && me.role === 'OWNER' }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })
