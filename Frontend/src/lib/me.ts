import { useQuery } from '@tanstack/react-query'
import { getJson } from '@/lib/api'

// GET /api/auth/me (BE src/app/api/auth/me/route.ts)
export type AuthMe = {
  name: string
  accountName: string
  memberType: 'MAIN' | 'SUB'
  role: 'OWNER' | 'MEMBER'
  accountRole: 'SUPER_ADMIN' | 'ADMIN' | 'MAIN' | 'SUB'
}

export const ME_KEY = ['auth', 'me']
export const isAdminRole = (role?: AuthMe['accountRole']) => role === 'SUPER_ADMIN' || role === 'ADMIN'

/** 로그인한 사용자. 로그인이 풀렸으면 error.status === 401 */
export const useMe = () =>
  useQuery({
    queryKey: ME_KEY,
    queryFn: async () => {
      const res = await getJson<AuthMe>('/api/auth/me')
      if (!res.ok) throw Object.assign(new Error(res.code), { status: res.status })
      const me = res.data
      return { ...me, company: me.accountName, isOwner: me.memberType === 'MAIN' && me.role === 'OWNER', isAdmin: isAdminRole(me.accountRole) }
    },
    retry: false,
    staleTime: 5 * 60_000,
  })
