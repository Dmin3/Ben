import { useMe } from '@/lib/me'
import type { AdminRole } from '@/mocks/admin'

/**
 * 로그인한 관리자. BE 권한은 수퍼관리자(SUPER_ADMIN)·관리자계정(ADMIN) 두 가지.
 * ponytail: 초안 화면의 권한 표시는 시안 4역할(SUPER·MANAGER·FINANCE·VIEWER) 기준이라 관리자계정은 MANAGER로 본다.
 * BE에 세부 역할이 생기면 이 변환을 바꾼다
 */
export function useAdminUser() {
  const { data } = useMe()
  const role: AdminRole = data?.accountRole === 'SUPER_ADMIN' ? 'SUPER' : 'MANAGER'
  return { name: data?.name ?? '', role, accountRole: data?.accountRole }
}
