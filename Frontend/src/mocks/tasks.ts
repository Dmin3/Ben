// 업무 화면용 임시 데이터. API 연동 시 교체한다.
import type { OrderStatus } from '@/components/order/order-status-badge'

type TaskBase = {
  id: string
  /** 제품 사진. 없으면 자리 표시 */
  imageUrl?: string
  productName: string
  quantity: number
  status: OrderStatus
}

/** 견적·일정 확인 중 (공장 배정 전) */
export type ReviewingTask = TaskBase & {
  stage: 'reviewing'
  requestedArrival: string
  receivedAt: string
  manager: string
  replyDays: number
}

/** 생산·배송 진행 중 */
export type ActiveTask = TaskBase & {
  stage: 'active'
  factory: string
  dueDate: string
  /** 현재 진행 단계 인덱스 (0: 샘플 ~ 6: 배송) */
  step: number
  /** 진행률 % (서버 계산값) */
  progress: number
  delayed: boolean
}

/** 완료 */
export type CompletedTask = TaskBase & {
  stage: 'completed'
  factory: string
  dueDate: string
}

export type Task = ReviewingTask | ActiveTask | CompletedTask

export const tasks: Task[] = [
  {
    stage: 'reviewing',
    id: 'BEN-2026-0006',
    productName: '25FW 울 블렌드 롱코트',
    quantity: 280,
    status: 'reviewing',
    requestedArrival: '2026.12.20',
    receivedAt: '2026.10.11',
    manager: '김민준 매니저',
    replyDays: 2,
  },
  {
    stage: 'active',
    id: 'BEN-2026-0001',
    factory: '판위의류',
    productName: 'HOME WEAR',
    quantity: 1000,
    status: 'normal',
    dueDate: '2026.09.25',
    step: 6,
    progress: 98,
    delayed: false,
  },
  {
    stage: 'active',
    id: 'BEN-2026-0002',
    factory: 'FOC의류',
    productName: 'HANDMADE COAT',
    quantity: 3000,
    status: 'normal',
    dueDate: '2026.10.22',
    step: 3,
    progress: 50,
    delayed: false,
  },
  {
    stage: 'active',
    id: 'BEN-2026-0003',
    factory: '신탕청바지',
    productName: 'DENIM',
    quantity: 800,
    status: 'delayed',
    dueDate: '2026.11.02',
    step: 1,
    progress: 20,
    delayed: true,
  },
  // 완료 탭 확인용
  {
    stage: 'completed',
    id: 'BEN-2025-0031',
    factory: '세진가방',
    productName: 'ECO BAG',
    quantity: 500,
    status: 'completed',
    dueDate: '2026.08.30',
  },
]
