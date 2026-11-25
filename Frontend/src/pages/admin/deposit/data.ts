import { useQuery, useQueryClient } from '@tanstack/react-query'
import { depositEntries, type DepositEntry } from '@/mocks/admin-finance'

const KEY = ['admin', 'deposit-entries']
// mock이라 다시 불러오면 처리한 내역이 되살아난다. 캐시를 계속 유지
const keep = { staleTime: Infinity, gcTime: Infinity }

// TODO(API): 예치금 내역 목록 (관리자)
export const useDepositEntries = () => useQuery({ queryKey: KEY, queryFn: async () => depositEntries, ...keep })

/** 등록·승인·반려. 사용내역과 승인 대기 화면이 같은 캐시를 본다 */
export function useDepositActions() {
  const qc = useQueryClient()
  const update = (fn: (list: DepositEntry[]) => DepositEntry[]) => qc.setQueryData<DepositEntry[]>(KEY, (list = []) => fn(list))
  return {
    // TODO(API): 직원 등록 → 승인 요청
    add: (entry: Omit<DepositEntry, 'no' | 'state' | 'enteredAt'>) =>
      update((list) => [{ ...entry, no: Math.max(0, ...list.map((e) => e.no)) + 2, state: 'pending', enteredAt: '방금' }, ...list]),
    // TODO(API): 최고관리자 승인·반려
    approve: (nos: number[]) =>
      update((list) => list.map((e) => (nos.includes(e.no) ? { ...e, state: 'approved', approvedBy: '김대표 · 방금' } : e))),
    reject: (no: number) => update((list) => list.map((e) => (e.no === no ? { ...e, state: 'rejected' } : e))),
  }
}
