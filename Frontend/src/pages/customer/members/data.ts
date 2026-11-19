import { useQuery, useQueryClient } from '@tanstack/react-query'
import { members, membershipRequests, type Member, type MembershipRequest } from '@/mocks/members'

const REQUESTS_KEY = ['members', 'requests']
const MEMBERS_KEY = ['members', 'list']
// mock이라 다시 불러오면 처리한 요청이 되살아난다. 캐시를 계속 유지
const keep = { staleTime: Infinity, gcTime: Infinity }

// TODO(API): GET /api/account/membership-requests
export const useMembershipRequests = () =>
  useQuery({ queryKey: REQUESTS_KEY, queryFn: async () => membershipRequests, ...keep })

// TODO(API): GET /api/accounts/sub-users (서브만 내려오므로 대표 본인은 /api/auth/me로 앞에 붙인다)
export const useMembers = () => useQuery({ queryKey: MEMBERS_KEY, queryFn: async () => members, ...keep })

/** 수락·거절. 사이드바 숫자와 직원 목록이 같은 캐시를 보므로 함께 바뀐다 */
export function useDecideRequest() {
  const qc = useQueryClient()
  // TODO(API): POST /api/account/membership-requests/{id}/approve|reject 후 두 키를 invalidate
  return (r: MembershipRequest, approve: boolean) => {
    qc.setQueryData<MembershipRequest[]>(REQUESTS_KEY, (list = []) => list.filter((x) => x.id !== r.id))
    if (!approve) return
    const joined: Member = {
      id: r.id,
      name: r.name,
      email: r.email,
      role: 'MEMBER',
      authMethod: 'LOCAL_ONLY',
      ssoProvider: null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    qc.setQueryData<Member[]>(MEMBERS_KEY, (list = []) => [...list, joined])
  }
}
