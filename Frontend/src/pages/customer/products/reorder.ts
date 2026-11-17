import { useNavigate } from 'react-router'
import type { Product } from '@/mocks/products'

/** 리오더 버튼이 새 오더 화면에 넘기는 값 (router state) */
export type ReorderState = { productName: string; factoryId: string }

/** 제품으로 새 오더 화면을 연다. 제품명, 공장, 진행 방식(리오더)이 채워진다 */
export function useReorder() {
  const navigate = useNavigate()
  return (p: Product) =>
    navigate('/orders/new', { state: { reorder: { productName: p.name, factoryId: p.factoryId } satisfies ReorderState } })
}
