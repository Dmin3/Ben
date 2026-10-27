// 고객 홈 화면용 임시 데이터. API 연동 시 교체한다.
import type { OrderStatus } from '@/components/order/order-status-badge'
import { profile } from './my-info'

export const currentUser = { name: profile.name, company: profile.company }

export type TodoItem = {
  id: string
  type: 'qc' | 'deposit' | 'delay'
  title: string
  meta: string
}

export const todos: TodoItem[] = [
  {
    id: 't1',
    type: 'qc',
    title: '핸드메이드 코트 QC 이미지를 확인해 주세요',
    meta: 'BEN-2026-0002 · 검품 단계 · 2시간 전 등록',
  },
  {
    id: 't2',
    type: 'deposit',
    title: '잔금 차감을 위해 ¥40,000 충전이 필요해요',
    meta: 'BEN-2026-0002 · 출고 전까지',
  },
  {
    id: 't3',
    type: 'delay',
    title: '워싱 데님 생산이 6일 지연되고 있어요',
    meta: 'BEN-2026-0003 · 변경 납기 확인 필요',
  },
]

export const deposit = {
  balance: 200000,
  scheduled: 240000, // 차감 예정 (잔금). 출고 전까지 차감
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
  title: string
  date: string
}

export const notices: Notice[] = [
  { id: 'n1', important: true, title: '9월 중국 국경절 일정 안내', date: '09.05' },
  { id: 'n2', important: false, title: '시스템 점검 안내 (9/10 22:00)', date: '09.04' },
  { id: 'n3', important: false, title: '카카오 알림톡 템플릿 업데이트', date: '09.03' },
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
