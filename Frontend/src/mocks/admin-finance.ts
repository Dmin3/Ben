// 관리자 예치금·재무 화면용 임시 데이터 (기획 시안 기준). API 연동 시 교체한다.

/** 예치금 내역. 직원이 등록하면 pending, 최고관리자가 승인하면 approved */
export type DepositEntry = {
  no: number
  customerId: string
  type: 'in' | 'use'
  text: string
  amount: number
  /** 승인 후 잔액 (pending이면 반영 전 예상값) */
  balanceAfter: number
  date: string
  by: string
  state: 'pending' | 'approved' | 'rejected'
  /** 승인자 · 시각 */
  approvedBy?: string
  orderRef?: string
  enteredAt: string
}

export const depositEntries: DepositEntry[] = [
  { no: 29820, customerId: 'c4', type: 'in', text: '10월 11일 TT송금 예치금 입금', amount: 50000, balanceAfter: -86067.7, date: '2026.10.11', by: '최재무', state: 'pending', enteredAt: '10.11 16:10' },
  { no: 29818, customerId: 'c1', type: 'use', text: '10월 11일 1688 조르기 결제', amount: -20000, balanceAfter: 10000, date: '2026.10.11', by: '정효은', state: 'pending', orderRef: 'BEN-2026-0002 핸드메이드 코트 · FOC의류', enteredAt: '10.11 19:42' },
  { no: 29816, customerId: 'c2', type: 'use', text: '10월 10일 조르기 결제', amount: -646.2, balanceAfter: 52000, date: '2026.10.10', by: '이하늘', state: 'pending', orderRef: 'BEN-2026-0011 울 코트 · FOC의류', enteredAt: '10.10 18:05' },
  { no: 29814, customerId: 'c2', type: 'use', text: '10월 10일 1688 조르기 결제', amount: -561, balanceAfter: 52646.2, date: '2026.10.10', by: '이하늘', state: 'pending', orderRef: 'BEN-2026-0011 울 코트 · FOC의류', enteredAt: '10.10 17:58' },
  { no: 29812, customerId: 'c3', type: 'use', text: '10월 10일 1688 조르기 결제', amount: -691.4, balanceAfter: 18500, date: '2026.10.10', by: '박서준', state: 'approved', approvedBy: '김대표 · 10.10 21:05', enteredAt: '10.10 15:00' },
  { no: 29810, customerId: 'c3', type: 'use', text: '10월 10일 1688 조르기 결제', amount: -2069, balanceAfter: 19191.4, date: '2026.10.10', by: '박서준', state: 'approved', approvedBy: '김대표 · 10.10 21:05', enteredAt: '10.10 14:40' },
  { no: 29808, customerId: 'c4', type: 'in', text: '10월 9일 TT송금 예치금 입금', amount: 58865, balanceAfter: -136067.7, date: '2026.10.09', by: '최재무', state: 'approved', approvedBy: '김대표 · 10.09 18:40', enteredAt: '10.09 11:00' },
  { no: 29806, customerId: 'c1', type: 'in', text: '10월 9일 TT송금 예치금 입금', amount: 20000, balanceAfter: 30000, date: '2026.10.09', by: '최재무', state: 'approved', approvedBy: '김대표 · 10.09 18:40', enteredAt: '10.09 10:50' },
  { no: 29804, customerId: 'c5', type: 'in', text: '10월 9일 TT송금 예치금 입금', amount: 26359.8, balanceAfter: 26359.8, date: '2026.10.09', by: '최재무', state: 'approved', approvedBy: '김대표 · 10.09 18:40', enteredAt: '10.09 10:40' },
  { no: 29802, customerId: 'c6', type: 'use', text: '10월 9일 QR코드 결제', amount: -2105, balanceAfter: 12000, date: '2026.10.09', by: '박서준', state: 'approved', approvedBy: '김대표 · 10.09 18:40', enteredAt: '10.09 09:20' },
  { no: 29800, customerId: 'c2', type: 'use', text: '10월 8일 샘플비 결제', amount: -1200, balanceAfter: 53207.2, date: '2026.10.08', by: '이하늘', state: 'rejected', enteredAt: '10.08 13:10' },
]

export const depositSummary = { total: -190323.18, monthIn: 105224.8, monthInCount: 12, monthUse: -86412.6, monthUseCount: 64 }

/** 자본금정산: 자본금 항목(위안) - 보유 인민폐(위안) = 차이 (0에 가까울수록 정상) */
export const capitalCurrent = {
  month: '2026-10',
  capital: [
    { key: 'purchaseMargin', value: 133318, diff: 8240 },
    { key: 'importMargin', value: 120310, diff: 5120 },
    { key: 'oemMargin', value: 80142, diff: 12880 },
    { key: 'ttMargin', value: 336703, diff: 21400 },
    { key: 'customerTT', value: -435614, diff: -30610 },
  ],
  rate: 200,
  krwHoldings: [
    { key: 'taeramKrw', krw: 30_000_000, diff: 10000 },
    { key: 'seungjunKrw', krw: -57_386_000, diff: -4200 },
  ],
  banks: [
    { key: 'taeramBank', value: 177110, diff: 6480 },
    { key: 'seungjunBank', value: 178009, diff: 9950 },
  ],
  writer: '태람 · 2026.10.11 16:40',
}

export const capitalHistory = [
  { month: '2026-10', capital: 234859, cash: 218189, state: 'draft' as const, writer: '태람 · 10.11', confirmer: null },
  { month: '2026-09', capital: 226240, cash: 222180, state: 'confirmed' as const, writer: '태람 · 09.30', confirmer: '승준 · 10.01' },
  { month: '2026-08', capital: 208410, cash: 209530, state: 'confirmed' as const, writer: '승준 · 08.31', confirmer: '태람 · 09.01' },
  { month: '2026-07', capital: 197880, cash: 189430, state: 'confirmed' as const, writer: '태람 · 07.31', confirmer: '승준 · 08.02' },
  { month: '2026-06', capital: 183020, cash: 182260, state: 'confirmed' as const, writer: '태람 · 06.30', confirmer: '승준 · 07.01' },
  { month: '2026-05', capital: 176500, cash: 177940, state: 'confirmed' as const, writer: '승준 · 05.31', confirmer: '태람 · 06.01' },
]

/** 매출 파트. 통화는 파트마다 다르고 합계는 그 달 환율로 원화 환산 */
export const SALES_PARTS = [
  { key: 'payment', currency: 'KRW' },
  { key: 'purchase', currency: 'CNY' },
  { key: 'tt', currency: 'CNY' },
  { key: 'customs', currency: 'KRW', cbm: true },
  { key: 'ecommerce', currency: 'KRW' },
  { key: 'import', currency: 'CNY' },
  { key: 'oem', currency: 'CNY' },
] as const
export type SalesPart = (typeof SALES_PARTS)[number]['key']

type MonthSales = { month: number; rate: number; profit: Record<SalesPart, number>; sales: number; cbm?: number }

// 파트별 순수익 (각 파트 통화). sales는 원화 환산 매출 합계
export const salesMonths: MonthSales[] = [
  { month: 1, rate: 210, cbm: 112, sales: 918_693_192, profit: { payment: 13_362_914, purchase: 0, tt: 18271, customs: 1_462_900, ecommerce: 1_108_800, import: 27931.4, oem: 6587 } },
  { month: 2, rate: 207, cbm: 107, sales: 718_321_798, profit: { payment: 7_965_040, purchase: 28717, tt: 13674, customs: 1_062_300, ecommerce: 124_000, import: 3559.46, oem: 1160 } },
  { month: 3, rate: 220, cbm: 121, sales: 1_046_485_197, profit: { payment: 22_255_087, purchase: 0, tt: 29017, customs: 1_007_600, ecommerce: 948_000, import: 12704, oem: 1674 } },
  { month: 4, rate: 217, cbm: 125, sales: 1_196_294_987, profit: { payment: 18_520_828, purchase: 0, tt: 21676, customs: 1_559_600, ecommerce: 878_850, import: 58273.3, oem: 13563.48 } },
  { month: 5, rate: 220, cbm: 172, sales: 1_092_474_649, profit: { payment: 10_798_334, purchase: 18893, tt: 22349, customs: 1_550_700, ecommerce: 546_350, import: 19128, oem: 31493.22 } },
  { month: 6, rate: 220, cbm: 139, sales: 876_898_368, profit: { payment: 12_904_848, purchase: 10374, tt: 21068, customs: 1_571_300, ecommerce: 612_000, import: 3911, oem: 6784 } },
  { month: 7, rate: 220, cbm: 117, sales: 819_076_020, profit: { payment: 9_761_132, purchase: 0, tt: 22581, customs: 1_379_200, ecommerce: 347_520, import: 4104, oem: 27471 } },
  { month: 8, rate: 220, cbm: 149, sales: 788_777_655, profit: { payment: 9_869_155, purchase: 0, tt: 22066, customs: 1_469_800, ecommerce: 357_000, import: 1379, oem: 20293 } },
  { month: 9, rate: 200, cbm: 141, sales: 969_313_000, profit: { payment: 16_546_855, purchase: 0, tt: 25125, customs: 1_537_500, ecommerce: 372_000, import: 16626, oem: 7306 } },
]

/** 파트 순수익을 원화로 */
export const profitKrw = (m: MonthSales) =>
  SALES_PARTS.reduce((sum, p) => sum + (p.currency === 'CNY' ? m.profit[p.key] * m.rate : m.profit[p.key]), 0)

/** 매출 입력 화면 예시: 9월 파트별 매출 (각 파트 통화) */
export const lastMonthSalesByPart: Record<SalesPart, number> = {
  payment: 413_671_000,
  purchase: 0,
  tt: 2_512_500,
  customs: 7_050_000,
  ecommerce: 3_100_000,
  import: 166_260,
  oem: 48_700,
}
