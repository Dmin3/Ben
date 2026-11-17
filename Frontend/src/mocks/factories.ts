// 공장/공급사 화면용 임시 데이터. API 연동 시 교체한다.
import type { OrderStatus } from '@/components/order/order-status-badge'

export type FactoryGrade = 'excellent' | 'good'

export type FactoryOrder = {
  id: string
  product: string
  quantity: number
  amount: number
  date: string
  status: OrderStatus
}

export type FactoryIssue = {
  id: string
  date: string
  type: 'delay' | 'defect' | 'etc'
  title: string
  orderId?: string
  resolved: boolean
}

export type FactoryFile = {
  id: string
  name: string
  size: string
  date: string
}

export type Factory = {
  id: string
  name: string
  grade: FactoryGrade
  /** 주 품목 */
  category: string
  region: string
  legalName: string
  address: string
  manager: string
  tags: string[]
  onTimeRate: number
  defectRate: number
  deals: number
  totalAmount: number
  avgLeadDays: number
  yearly: { year: number; deals: number; amount: number }[]
  categoryShare: { name: string; deals: number }[]
  history: FactoryOrder[]
  issues: FactoryIssue[]
  files: FactoryFile[]
}

export const factories: Factory[] = [
  {
    id: 'f1',
    name: '세진가방',
    grade: 'excellent',
    category: '가방',
    region: '중국 선전',
    legalName: '[중국 법인명]',
    address: '중국 광동성 선전',
    manager: '[담당자명]',
    tags: ['BAG', 'Tote', 'Pouch', 'Keyring'],
    onTimeRate: 96,
    defectRate: 1.3,
    deals: 42,
    totalAmount: 1420000,
    avgLeadDays: 31,
    yearly: [
      { year: 2023, deals: 8, amount: 260000 },
      { year: 2024, deals: 11, amount: 380000 },
      { year: 2025, deals: 13, amount: 450000 },
      { year: 2026, deals: 10, amount: 330000 },
    ],
    categoryShare: [
      { name: 'Tote', deals: 18 },
      { name: 'Pouch', deals: 12 },
      { name: 'Keyring', deals: 8 },
      { name: '기타', deals: 4 },
    ],
    history: [
      { id: 'BEN-2026-0005', product: '토끼 키링', quantity: 1000, amount: 6000, date: '2026.08.10', status: 'quote_pending' },
      { id: 'BEN-2026-0004', product: '캔버스 에코백', quantity: 1000, amount: 12000, date: '2026.08.01', status: 'quote_pending' },
      { id: 'BEN-2025-0041', product: '나일론 파우치', quantity: 500, amount: 7500, date: '2025.11.03', status: 'completed' },
    ],
    issues: [{ id: 'i1', date: '2025.11.20', type: 'etc', title: '포장 박스 규격 변경 요청', resolved: true }],
    files: [
      { id: 'd1', name: '사업자등록증.pdf', size: '1.2MB', date: '2025.03.02' },
      { id: 'd2', name: '공장 실사 보고서.pdf', size: '4.8MB', date: '2025.03.10' },
    ],
  },
  {
    id: 'f2',
    name: 'FOC의류',
    grade: 'excellent',
    category: '의류',
    region: '중국 광저우',
    legalName: '[중국 법인명]',
    address: '중국 광동성 광저우',
    manager: '[담당자명]',
    tags: ['COAT', 'Jacket', 'Knit'],
    onTimeRate: 89,
    defectRate: 2.1,
    deals: 28,
    totalAmount: 2150000,
    avgLeadDays: 38,
    yearly: [
      { year: 2024, deals: 8, amount: 540000 },
      { year: 2025, deals: 12, amount: 980000 },
      { year: 2026, deals: 8, amount: 630000 },
    ],
    categoryShare: [
      { name: 'Coat', deals: 14 },
      { name: 'Jacket', deals: 9 },
      { name: 'Knit', deals: 5 },
    ],
    history: [
      { id: 'BEN-2026-0002', product: '핸드메이드 코트', quantity: 3000, amount: 600000, date: '2026.07.15', status: 'needs_check' },
      { id: 'BEN-2025-0032', product: '핸드메이드 코트', quantity: 800, amount: 168000, date: '2025.10.02', status: 'completed' },
    ],
    issues: [
      { id: 'i1', date: '2026.09.18', type: 'defect', title: '단추 봉제 불량 12장', orderId: 'BEN-2026-0002', resolved: false },
      { id: 'i2', date: '2025.11.05', type: 'delay', title: '원단 입고 지연으로 납기 4일 지연', orderId: 'BEN-2025-0032', resolved: true },
    ],
    files: [{ id: 'd1', name: '사업자등록증.pdf', size: '1.1MB', date: '2024.02.14' }],
  },
  {
    id: 'f3',
    name: '신탕청바지',
    grade: 'good',
    category: '패션잡화',
    region: '중국 광저우',
    legalName: '[중국 법인명]',
    address: '중국 광동성 광저우 [상세 주소]',
    manager: '[담당자명]',
    tags: ['DENIM', 'Denim Pants', 'Denim Jacket', 'Skirt', 'Shorts', 'Overall'],
    onTimeRate: 92,
    defectRate: 1.8,
    deals: 36,
    totalAmount: 1080000,
    avgLeadDays: 27,
    yearly: [
      { year: 2023, deals: 6, amount: 170000 },
      { year: 2024, deals: 9, amount: 260000 },
      { year: 2025, deals: 12, amount: 360000 },
      { year: 2026, deals: 9, amount: 290000 },
    ],
    categoryShare: [
      { name: 'Denim Pants', deals: 16 },
      { name: 'Denim Jacket', deals: 8 },
      { name: 'Skirt', deals: 6 },
      { name: 'Shorts', deals: 4 },
      { name: '기타', deals: 2 },
    ],
    history: [
      { id: 'BEN-2026-0003', product: '워싱 데님 팬츠', quantity: 800, amount: 72000, date: '2026.09.02', status: 'delayed' },
      { id: 'BEN-2025-0038', product: '데님 재킷', quantity: 300, amount: 33000, date: '2025.10.11', status: 'completed' },
      { id: 'BEN-2025-0024', product: '워싱 데님 팬츠', quantity: 600, amount: 54000, date: '2025.06.20', status: 'completed' },
    ],
    issues: [
      { id: 'i1', date: '2026.10.08', type: 'delay', title: '워싱 공정 지연으로 납기 6일 지연', orderId: 'BEN-2026-0003', resolved: false },
      { id: 'i2', date: '2025.10.30', type: 'defect', title: '허리 사이즈 편차 ±2cm 18장', orderId: 'BEN-2025-0038', resolved: true },
    ],
    files: [
      { id: 'd1', name: '사업자등록증.pdf', size: '1.0MB', date: '2023.04.11' },
      { id: 'd2', name: '공장 실사 보고서.pdf', size: '5.2MB', date: '2023.04.20' },
      { id: 'd3', name: '워싱 컬러 차트.xlsx', size: '320KB', date: '2025.06.01' },
    ],
  },
  {
    id: 'f4',
    name: '판위의류',
    grade: 'good',
    category: '의류',
    region: '중국 광저우',
    legalName: '[중국 법인명]',
    address: '중국 광동성 광저우 판위구',
    manager: '[담당자명]',
    tags: ['HOME WEAR', 'Pajama'],
    onTimeRate: 87,
    defectRate: 2.4,
    deals: 12,
    totalAmount: 640000,
    avgLeadDays: 33,
    yearly: [
      { year: 2025, deals: 5, amount: 210000 },
      { year: 2026, deals: 7, amount: 430000 },
    ],
    categoryShare: [
      { name: 'Home wear', deals: 8 },
      { name: 'Pajama', deals: 4 },
    ],
    history: [
      { id: 'BEN-2026-0001', product: '홈웨어 세트', quantity: 1000, amount: 58000, date: '2026.08.05', status: 'normal' },
      { id: 'BEN-2025-0029', product: '코튼 파자마', quantity: 500, amount: 22500, date: '2025.09.01', status: 'completed' },
    ],
    issues: [],
    files: [{ id: 'd1', name: '사업자등록증.pdf', size: '0.9MB', date: '2025.01.08' }],
  },
]

export const findFactory = (id: string | undefined) => factories.find((f) => f.id === id)
