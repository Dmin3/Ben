// 고객 홈 화면용 임시 데이터. API 연동 시 교체한다.
import type { OrderStatus } from '@/components/order/order-status-badge'
import { depositSummary } from './deposit'
import { profile } from './my-info'

// ponytail: role은 /api/auth/me 연동 전까지 고정값. 대표(OWNER)만 직원 관리 메뉴가 보인다
export const currentUser = { name: profile.name, company: profile.company, role: 'OWNER' as 'OWNER' | 'ADMIN' | 'MEMBER' }

export type TodoItem = {
  id: string
  type: 'qc' | 'deposit' | 'delay'
  orderId: string
  title: string
  meta: string
}

export const todos: TodoItem[] = [
  {
    id: 't1',
    type: 'qc',
    orderId: 'BEN-2026-0002',
    title: '핸드메이드 코트 QC 이미지를 확인해 주세요',
    meta: 'BEN-2026-0002 · 검품 단계 · 2시간 전 등록',
  },
  {
    id: 't2',
    type: 'deposit',
    orderId: 'BEN-2026-0002',
    title: '잔금 차감을 위해 ¥40,000 충전이 필요해요',
    meta: 'BEN-2026-0002 · 출고 전까지',
  },
  {
    id: 't3',
    type: 'delay',
    orderId: 'BEN-2026-0003',
    title: '워싱 데님 생산이 6일 지연되고 있어요',
    meta: 'BEN-2026-0003 · 변경 납기 확인 필요',
  },
]

export const deposit = {
  balance: depositSummary.balance,
  scheduled: 42000, // 차감 예정 (잔금). 출고 전까지 차감
}

export type OrderFilter = 'needs_check' | 'quote_pending' | 'in_production' | 'shipping'

export type Order = {
  id: string
  name: string
  category: string
  quantity: number
  /** 진행 단계 인덱스. null이면 견적 단계 */
  step: number | null
  delayed: boolean
  dueDate: string | null
  status: OrderStatus
  /** 견적 단계: 회신 예정 영업일 수 */
  replyDays?: number
  /** 필터 칩 분류 */
  filters: OrderFilter[]
}

export const orders: Order[] = [
  {
    id: 'BEN-2026-0002',
    name: '핸드메이드 코트',
    category: 'FOC의류',
    quantity: 3000,
    step: 3,
    delayed: false,
    dueDate: '2026.10.22',
    status: 'needs_check',
    filters: ['needs_check', 'in_production'],
  },
  {
    id: 'BEN-2026-0003',
    name: '워싱 데님',
    category: '신탕청바지',
    quantity: 800,
    step: 1,
    delayed: true,
    dueDate: '2026.11.02',
    status: 'delayed',
    filters: ['needs_check', 'in_production'],
  },
  {
    id: 'BEN-2026-0001',
    name: '홈웨어',
    category: '판위의류',
    quantity: 1000,
    step: 6,
    delayed: false,
    dueDate: '2026.09.25',
    status: 'normal',
    filters: ['shipping'],
  },
  {
    id: 'BEN-2026-0004',
    name: '에코백',
    category: '',
    quantity: 0,
    step: null,
    delayed: false,
    dueDate: null,
    status: 'quote_pending',
    replyDays: 2,
    filters: ['quote_pending'],
  },
  {
    id: 'BEN-2026-0005',
    name: '토끼 키링',
    category: '',
    quantity: 0,
    step: null,
    delayed: false,
    dueDate: null,
    status: 'quote_pending',
    replyDays: 2,
    filters: ['quote_pending'],
  },
]

export type Notice = {
  id: string
  important: boolean
  /** 제목·본문은 서버 문구 (번역하지 않음) */
  title: string
  /** YYYY.MM.DD */
  date: string
  body: string
}

export const notices: Notice[] = [
  {
    id: 'n1',
    important: true,
    title: '9월 중국 국경절 일정 안내',
    date: '2026.09.05',
    body: '10월 1일 ~ 10월 7일 중국 국경절 연휴로 현지 공장과 물류가 쉽니다.\n\n- 연휴 전후로 생산·출고 일정이 3~5일 밀릴 수 있어요.\n- 연휴 기간 오더 요청은 10월 8일부터 순서대로 확인합니다.\n- 급한 오더는 담당 매니저에게 미리 알려주세요.',
  },
  {
    id: 'n2',
    important: false,
    title: '시스템 점검 안내 (9/10 22:00)',
    date: '2026.09.04',
    body: '9월 10일 22:00 ~ 24:00 시스템 점검으로 서비스 이용이 잠시 중단됩니다.\n점검 중에는 로그인과 오더 요청을 할 수 없어요.',
  },
  {
    id: 'n3',
    important: false,
    title: '카카오 알림톡 템플릿 업데이트',
    date: '2026.09.03',
    body: '오더 진행 단계 알림톡 문구가 바뀌었어요. 단계가 바뀌면 오더 번호와 함께 바로 확인할 수 있는 링크가 함께 전송됩니다.',
  },
  {
    id: 'n4',
    important: false,
    title: '해운 운임 인상 안내',
    date: '2026.08.20',
    body: '9월 선적분부터 닝보·상하이 출발 해운 운임이 약 8% 인상됩니다. 진행 중인 오더는 견적 당시 운임이 적용돼요.',
  },
]

export type Factory = {
  id: string
  name: string
  grade: 'excellent' | 'good'
  description: string
  onTimeRate: number
  activeOrders: number
}

export const factories: Factory[] = [
  { id: 'f1', name: '세진가방', grade: 'excellent', description: '가방 · 중국 선전', onTimeRate: 96, activeOrders: 0 },
  { id: 'f2', name: 'FOC의류', grade: 'excellent', description: '의류 · 중국 광저우', onTimeRate: 89, activeOrders: 1 },
  { id: 'f3', name: '신탕청바지', grade: 'good', description: '데님 · 중국 광저우', onTimeRate: 92, activeOrders: 1 },
]
