// 직원 관리 화면용 임시 데이터. 응답 모양은 BE와 맞춤
// (GET /api/account/membership-requests, GET /api/accounts/sub-users). API 연동 시 교체한다.

export type MembershipRequest = {
  id: string
  name: string
  email: string | null
  requestedAt: string
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type Member = {
  id: string
  name: string
  email: string | null
  role: MemberRole
  authMethod: 'LOCAL_ONLY' | 'SSO_ONLY' | 'BOTH'
  ssoProvider: 'GOOGLE' | 'KAKAO' | 'NAVER' | null
  status: 'ACTIVE' | 'INVITED' | 'DISABLED'
  createdAt: string
}

export const memberLimit = 20

export const membershipRequests: MembershipRequest[] = [
  { id: 'req-1', name: '김하늘', email: 'haneul@example.com', requestedAt: '2026-11-19T09:12:00+09:00' },
  { id: 'req-2', name: '박지민', email: 'jimin.park@example.com', requestedAt: '2026-11-18T16:40:00+09:00' },
]

export const members: Member[] = [
  { id: 'm-1', name: '이태람', email: 'taeram@example.com', role: 'OWNER', authMethod: 'SSO_ONLY', ssoProvider: 'KAKAO', status: 'ACTIVE', createdAt: '2026-03-04T10:00:00+09:00' },
  { id: 'm-2', name: '정소윤', email: 'soyun@example.com', role: 'ADMIN', authMethod: 'LOCAL_ONLY', ssoProvider: null, status: 'ACTIVE', createdAt: '2026-04-11T10:00:00+09:00' },
  { id: 'm-3', name: '최도현', email: 'dohyun@example.com', role: 'MEMBER', authMethod: 'SSO_ONLY', ssoProvider: 'NAVER', status: 'ACTIVE', createdAt: '2026-07-22T10:00:00+09:00' },
  { id: 'm-4', name: '한서준', email: 'seojun@example.com', role: 'MEMBER', authMethod: 'SSO_ONLY', ssoProvider: 'GOOGLE', status: 'DISABLED', createdAt: '2026-05-02T10:00:00+09:00' },
]
