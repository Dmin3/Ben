import { useQuery, useQueryClient } from '@tanstack/react-query'
import { initialCart, sourcingItems, type CartEntry, type SourcingItem } from '@/mocks/sourcing'

const ITEMS_KEY = ['sourcing', 'items']
const CART_KEY = ['sourcing', 'cart']
// mock이라 다시 불러오면 바꾼 내용이 되살아난다. 캐시를 계속 유지
const keep = { staleTime: Infinity, gcTime: Infinity }

// TODO(API): 사입 품목 목록 (관리자 등록 = 고객 공개)
export const useSourcingItems = () => useQuery({ queryKey: ITEMS_KEY, queryFn: async () => sourcingItems, ...keep })

// TODO(API): 장바구니 조회·저장
export const useCart = () => useQuery({ queryKey: CART_KEY, queryFn: async () => initialCart, ...keep })

/** 관리자 품목 등록·수정. 고객 사입 화면이 같은 캐시를 본다 */
export function useSaveSourcingItem() {
  const qc = useQueryClient()
  return (item: SourcingItem) =>
    qc.setQueryData<SourcingItem[]>(ITEMS_KEY, (list = []) =>
      list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list],
    )
}

/** 장바구니 전체를 바꾼다 (담기·수정·삭제·주문 후 비우기) */
export function useSetCart() {
  const qc = useQueryClient()
  return (fn: (cart: CartEntry[]) => CartEntry[]) => qc.setQueryData<CartEntry[]>(CART_KEY, (cart = []) => fn(cart))
}

let seq = 0
export const newLineId = () => `n${Date.now()}${seq++}`
