// 제작 제품 화면용 임시 데이터. API 연동 시 교체한다.

export const PRODUCT_CATEGORIES = ['apparel', 'denim', 'bag', 'goods'] as const
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export type Product = {
  id: string
  name: string
  category: ProductCategory
  factoryId: string
  /** 최근 제작 연월 (YYYY.MM) */
  lastMadeAt: string
  lastOrderId?: string
  imageUrl?: string
  /** 단가 (CNY) */
  unitPrice: number
  moq: number
  moqUnit: 'pcs' | 'ea'
  avgLeadDays: number
  quality: 'A' | 'B'
  /** 진행 횟수 */
  runs: number
}

export const products: Product[] = [
  { id: 'p1', name: '홈웨어 세트', category: 'apparel', factoryId: 'f4', lastMadeAt: '2026.09', lastOrderId: 'BEN-2026-0001', unitPrice: 58, moq: 500, moqUnit: 'pcs', avgLeadDays: 35, quality: 'A', runs: 1 },
  { id: 'p2', name: '핸드메이드 코트', category: 'apparel', factoryId: 'f2', lastMadeAt: '2026.09', lastOrderId: 'BEN-2026-0002', unitPrice: 200, moq: 300, moqUnit: 'pcs', avgLeadDays: 45, quality: 'A', runs: 2 },
  { id: 'p3', name: '워싱 데님 팬츠', category: 'denim', factoryId: 'f3', lastMadeAt: '2026.09', lastOrderId: 'BEN-2026-0003', unitPrice: 90, moq: 300, moqUnit: 'pcs', avgLeadDays: 30, quality: 'B', runs: 3 },
  { id: 'p4', name: '캔버스 에코백', category: 'bag', factoryId: 'f1', lastMadeAt: '2026.08', lastOrderId: 'BEN-2026-0004', unitPrice: 12, moq: 1000, moqUnit: 'ea', avgLeadDays: 20, quality: 'A', runs: 1 },
  { id: 'p5', name: '토끼 키링', category: 'goods', factoryId: 'f1', lastMadeAt: '2026.08', lastOrderId: 'BEN-2026-0005', unitPrice: 6, moq: 1000, moqUnit: 'ea', avgLeadDays: 15, quality: 'B', runs: 1 },
  { id: 'p6', name: '나일론 파우치', category: 'bag', factoryId: 'f1', lastMadeAt: '2025.11', unitPrice: 15, moq: 500, moqUnit: 'ea', avgLeadDays: 18, quality: 'A', runs: 2 },
  { id: 'p7', name: '데님 재킷', category: 'denim', factoryId: 'f3', lastMadeAt: '2025.10', unitPrice: 110, moq: 300, moqUnit: 'pcs', avgLeadDays: 35, quality: 'A', runs: 1 },
  { id: 'p8', name: '코튼 파자마', category: 'apparel', factoryId: 'f4', lastMadeAt: '2025.09', unitPrice: 45, moq: 500, moqUnit: 'pcs', avgLeadDays: 30, quality: 'B', runs: 2 },
]
