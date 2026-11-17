// 예치금 화면용 임시 데이터. API 연동 시 교체한다.

export const depositSummary = {
  balance: 30000,
  /** 잔액 기준일 (YYYY.MM.DD) */
  asOf: '2026.10.12',
  totalCharged: 65000,
  totalUsed: 35000,
  next: { label: '핸드메이드 코트 출고 전 잔금', date: '2026.10.20', amount: 12000 },
}

export type DepositAlert = {
  id: string
  type: 'correction' | 'topup' | 'confirmed'
  date: string
  message: string
  unread: boolean
  link?: 'history' | 'invoice'
}

export const depositAlerts: DepositAlert[] = [
  { id: 'a1', type: 'correction', date: '2026.10.12', message: '2026.09.26 계약금 차감 건의 금액이 잘못 차감되어 수정 진행했으니 확인 부탁드립니다.', unread: true, link: 'history' },
  { id: 'a2', type: 'topup', date: '2026.10.10', message: '현재 예치금이 부족해서 추가 송금 부탁드립니다.', unread: true, link: 'invoice' },
  { id: 'a3', type: 'confirmed', date: '2026.09.28', message: '20,000 위안 입금이 확인되어 예치금에 반영했습니다.', unread: false },
  { id: 'a4', type: 'confirmed', date: '2026.08.30', message: '30,000 위안 입금이 확인되어 예치금에 반영했습니다.', unread: false },
  { id: 'a5', type: 'confirmed', date: '2026.08.01', message: '15,000 위안 입금이 확인되어 예치금에 반영했습니다.', unread: false },
]

export type Transaction = {
  id: string
  date: string
  description: string
  type: 'in' | 'out'
  orderId?: string
  /** 입금은 +, 출금은 - */
  amount: number
  /** 이 거래 직후 잔액 */
  balance: number
}

// 최신순. 잔액은 현재 잔액에서 거꾸로 계산한다
const rows: Omit<Transaction, 'balance'>[] = [
  { id: 't9', date: '2026.10.02', description: '데님 청바지 계약금 지불', type: 'out', orderId: 'BEN-2026-0003', amount: -10000 },
  { id: 't8', date: '2026.09.28', description: '예치금 충전 (TT 송금)', type: 'in', amount: 20000 },
  { id: 't7', date: '2026.09.20', description: '핸드메이드 코트 잔금 지불', type: 'out', orderId: 'BEN-2026-0002', amount: -15000 },
  { id: 't6', date: '2026.09.12', description: '핸드메이드 코트 검품비', type: 'out', orderId: 'BEN-2026-0002', amount: -1000 },
  { id: 't5', date: '2026.09.05', description: '홈웨어 세트 통관·배송비', type: 'out', orderId: 'BEN-2026-0001', amount: -4000 },
  { id: 't4', date: '2026.08.30', description: '예치금 충전 (TT 송금)', type: 'in', amount: 30000 },
  { id: 't3', date: '2026.08.22', description: '캔버스 에코백 샘플비', type: 'out', orderId: 'BEN-2026-0004', amount: -2000 },
  { id: 't2', date: '2026.08.10', description: '토끼 키링 계약금 지불', type: 'out', orderId: 'BEN-2026-0005', amount: -3000 },
  { id: 't1', date: '2026.08.01', description: '예치금 충전 (TT 송금)', type: 'in', amount: 15000 },
]

export const transactions: Transaction[] = rows.map((r, i) => ({
  ...r,
  balance: depositSummary.balance - rows.slice(0, i).reduce((sum, x) => sum + x.amount, 0),
}))

// TT 송금 계좌. 실제 값은 BE 설정에서 받아온다
export const ttAccount = {
  bank: '[수취 은행명]',
  swift: '[SWIFT 코드]',
  account: '[계좌번호]',
  holder: '[예금주]',
  address: '[은행 주소]',
}
