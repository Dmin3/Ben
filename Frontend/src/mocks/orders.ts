// 오더 상세 화면용 임시 데이터. 홈·업무·공장 거래이력의 오더 번호가 모두 여기로 연결된다.
// API 연동 시 GET /api/orders/{id} 응답으로 교체한다.
import type { OrderStatus } from '@/components/order/order-status-badge'
import { ORDER_STEPS } from '@/components/order/steps'
import type { NewOrderForm } from '@/pages/customer/new-order/schema'
import { factories } from './factories'
import { products } from './products'

export type OrderDocument = {
  id: string
  kind: 'quote' | 'schedule' | 'customsInvoice' | 'closingDocs'
  name: string
  date: string
  size: string
}

/** 진행 기록. 제목·설명은 서버 문구 (번역하지 않음) */
export type OrderEvent = { date: string; title: string; note?: string }

export type OrderDetail = {
  id: string
  productName: string
  productId?: string
  /** null이면 공장 배정 전 */
  factoryId: string | null
  quantity: number
  status: OrderStatus
  /** 진행 단계 인덱스. null이면 견적·일정 확인 중, ORDER_STEPS.length면 모두 완료 */
  step: number | null
  delayed: boolean
  dueDate: string | null
  receivedAt: string
  manager: string
  /** 견적 회신 예정 영업일 수 (확인 중일 때) */
  replyDays?: number
  /** 단가 (CNY). 견적 전이면 없음 */
  unitPrice?: number
  request: {
    process: NewOrderForm['process']
    shipping: NewOrderForm['shipping']
    /** 내 정보 배송지 id */
    destination: string
    requestedArrival: string
    quantities: { color: string; size: string; qty: number }[]
    memo: string
    inspection: string
  }
  events: OrderEvent[]
  /** 이미지 장수 (자리 표시용). qcPending이면 고객 확인이 필요하다 */
  images: { sample: number; qc: number; qcPending?: boolean }
  documents: OrderDocument[]
}

const DONE = ORDER_STEPS.length

const explicit: OrderDetail[] = [
  {
    id: 'BEN-2026-0001',
    productName: '홈웨어 세트',
    productId: 'p1',
    factoryId: 'f4',
    quantity: 1000,
    status: 'normal',
    step: 6,
    delayed: false,
    dueDate: '2026.09.25',
    receivedAt: '2026.07.20',
    manager: '정효은',
    unitPrice: 58,
    request: {
      process: 'reorder',
      shipping: 'sea',
      destination: 'hq-gimpo',
      requestedArrival: '2026.09.25',
      quantities: [
        { color: '오트밀', size: 'M', qty: 500 },
        { color: '오트밀', size: 'L', qty: 500 },
      ],
      memo: '- 원단: 면 100% 2합\n- 라벨: 메인라벨 + 케어라벨\n- 포장: 세트 단위 OPP',
      inspection: '봉제 마감, 사이즈 오차 ±1cm',
    },
    events: [
      { date: '2026.09.21', title: '국내 배송 시작', note: 'CJ대한통운 · 본사 물류창고' },
      { date: '2026.09.18', title: '통관 완료' },
      { date: '2026.09.10', title: '출고 (해운)', note: '닝보항 출항' },
      { date: '2026.09.02', title: '검품 완료', note: '불량 3장 교체 후 출고' },
      { date: '2026.08.05', title: '양산 시작' },
      { date: '2026.07.22', title: '견적 승인 · 계약금 차감' },
      { date: '2026.07.20', title: '오더 요청 접수' },
    ],
    images: { sample: 4, qc: 6 },
    documents: [
      { id: 'd1', kind: 'quote', name: '견적서_BEN-2026-0001.pdf', date: '2026.07.21', size: '182KB' },
      { id: 'd2', kind: 'customsInvoice', name: '통관인보이스_BEN-2026-0001.pdf', date: '2026.09.12', size: '96KB' },
      { id: 'd3', kind: 'closingDocs', name: '마감서류_BEN-2026-0001.zip', date: '2026.09.21', size: '2.4MB' },
    ],
  },
  {
    id: 'BEN-2026-0002',
    productName: '핸드메이드 코트',
    productId: 'p2',
    factoryId: 'f2',
    quantity: 3000,
    status: 'needs_check',
    step: 3,
    delayed: false,
    dueDate: '2026.10.22',
    receivedAt: '2026.07.10',
    manager: '정효은',
    unitPrice: 200,
    request: {
      process: 'reorder',
      shipping: 'sea',
      destination: 'hq-gimpo',
      requestedArrival: '2026.10.22',
      quantities: [
        { color: '블랙', size: 'M', qty: 1000 },
        { color: '블랙', size: 'L', qty: 1000 },
        { color: '카멜', size: 'M', qty: 1000 },
      ],
      memo: '- 원단: 울 70% / 폴리 30%\n- 단추: 혼 버튼 4개\n- 로고: 왼쪽 안감 자수',
      inspection: '단추 봉제, 이염, 사이즈 오차 ±1cm',
    },
    events: [
      { date: '2026.10.12', title: 'QC 이미지 등록', note: '단추 봉제 불량 12장 확인 · 고객 확인 필요' },
      { date: '2026.10.08', title: '입고 완료 · 검품 시작' },
      { date: '2026.08.01', title: '양산 시작' },
      { date: '2026.07.25', title: '샘플 승인' },
      { date: '2026.07.15', title: '견적 승인 · 계약금 차감' },
      { date: '2026.07.10', title: '오더 요청 접수' },
    ],
    images: { sample: 3, qc: 8, qcPending: true },
    documents: [
      { id: 'd1', kind: 'quote', name: '견적서_BEN-2026-0002.pdf', date: '2026.07.12', size: '201KB' },
      { id: 'd2', kind: 'schedule', name: '생산일정표_BEN-2026-0002.pdf', date: '2026.07.16', size: '88KB' },
    ],
  },
  {
    id: 'BEN-2026-0003',
    productName: '워싱 데님 팬츠',
    productId: 'p3',
    factoryId: 'f3',
    quantity: 800,
    status: 'delayed',
    step: 1,
    delayed: true,
    dueDate: '2026.11.02',
    receivedAt: '2026.08.25',
    manager: '정효은',
    unitPrice: 90,
    request: {
      process: 'reorder',
      shipping: 'air',
      destination: 'showroom-seongsu',
      requestedArrival: '2026.10.27',
      quantities: [
        { color: '라이트 블루', size: '28', qty: 400 },
        { color: '라이트 블루', size: '30', qty: 400 },
      ],
      memo: '- 워싱: 스톤 워싱 라이트\n- 허리 밴드 안쪽 브랜드 라벨',
      inspection: '허리 사이즈 편차 ±1cm',
    },
    events: [
      { date: '2026.10.08', title: '납기 지연 안내', note: '워싱 공정 지연으로 납기 6일 지연 (10.27 → 11.02)' },
      { date: '2026.09.10', title: '양산 시작' },
      { date: '2026.09.02', title: '견적 승인 · 계약금 차감' },
      { date: '2026.08.25', title: '오더 요청 접수' },
    ],
    images: { sample: 2, qc: 0 },
    documents: [{ id: 'd1', kind: 'quote', name: '견적서_BEN-2026-0003.pdf', date: '2026.08.28', size: '176KB' }],
  },
  {
    id: 'BEN-2026-0006',
    productName: '25FW 울 블렌드 롱코트',
    factoryId: null,
    quantity: 280,
    status: 'reviewing',
    step: null,
    delayed: false,
    dueDate: null,
    receivedAt: '2026.10.11',
    manager: '김민준',
    replyDays: 2,
    request: {
      process: 'sample',
      shipping: 'recommend',
      destination: 'hq-gimpo',
      requestedArrival: '2026.12.20',
      quantities: [
        { color: '차콜', size: 'FREE', qty: 140 },
        { color: '베이지', size: 'FREE', qty: 140 },
      ],
      memo: '- 원단: 울 70% / 폴리 30%\n- 로고: 왼쪽 가슴 자수, 메인라벨 + 행택 부착\n- 포장: 개별 OPP, 바코드 부착',
      inspection: '봉제 마감, 이염',
    },
    events: [{ date: '2026.10.11', title: '오더 요청 접수', note: '담당자 배정: 김민준 매니저' }],
    images: { sample: 0, qc: 0 },
    documents: [],
  },
  {
    id: 'BEN-2025-0031',
    productName: '캔버스 에코백',
    productId: 'p4',
    factoryId: 'f1',
    quantity: 500,
    status: 'completed',
    step: DONE,
    delayed: false,
    dueDate: '2026.08.30',
    receivedAt: '2026.06.20',
    manager: '정효은',
    unitPrice: 12,
    request: {
      process: 'reorder',
      shipping: 'sea',
      destination: 'hq-gimpo',
      requestedArrival: '2026.08.30',
      quantities: [{ color: '내추럴', size: 'FREE', qty: 500 }],
      memo: '- 실크 인쇄 1도',
      inspection: '',
    },
    events: [
      { date: '2026.08.30', title: '배송 완료' },
      { date: '2026.06.20', title: '오더 요청 접수' },
    ],
    images: { sample: 2, qc: 4 },
    documents: [{ id: 'd1', kind: 'closingDocs', name: '마감서류_BEN-2025-0031.zip', date: '2026.08.30', size: '1.8MB' }],
  },
]

/** 견적 대기 오더 (공장 배정 전) */
function quotePending(id: string, productName: string, productId: string, receivedAt: string): OrderDetail {
  return {
    id,
    productName,
    productId,
    factoryId: null,
    quantity: 1000,
    status: 'quote_pending',
    step: null,
    delayed: false,
    dueDate: null,
    receivedAt,
    manager: '정효은',
    replyDays: 2,
    request: {
      process: 'reorder',
      shipping: 'recommend',
      destination: 'hq-gimpo',
      requestedArrival: '2026.12.10',
      quantities: [{ color: '기본', size: 'FREE', qty: 1000 }],
      memo: '',
      inspection: '',
    },
    events: [{ date: receivedAt, title: '오더 요청 접수' }],
    images: { sample: 0, qc: 0 },
    documents: [],
  }
}
explicit.push(
  quotePending('BEN-2026-0004', '캔버스 에코백', 'p4', '2026.10.10'),
  quotePending('BEN-2026-0005', '토끼 키링', 'p5', '2026.10.10'),
)

/** 공장 거래이력에만 있는 지난 오더는 이력 한 줄로 최소 상세를 만든다 */
function fromFactoryHistory(id: string): OrderDetail | undefined {
  for (const f of factories) {
    const o = f.history.find((h) => h.id === id)
    if (!o) continue
    const done = o.status === 'completed'
    return {
      id,
      productName: o.product,
      productId: products.find((p) => p.name === o.product)?.id,
      factoryId: f.id,
      quantity: o.quantity,
      status: o.status,
      step: done ? DONE : null,
      delayed: false,
      dueDate: o.date,
      receivedAt: o.date,
      manager: '정효은',
      unitPrice: Math.round(o.amount / o.quantity),
      request: {
        process: 'reorder',
        shipping: 'sea',
        destination: 'hq-gimpo',
        requestedArrival: o.date,
        quantities: [{ color: '기본', size: 'FREE', qty: o.quantity }],
        memo: '',
        inspection: '',
      },
      events: [{ date: o.date, title: done ? '배송 완료' : '오더 요청 접수' }],
      images: { sample: 0, qc: 0 },
      documents: [],
    }
  }
}

export const findOrder = (id: string | undefined) =>
  id ? (explicit.find((o) => o.id === id) ?? fromFactoryHistory(id)) : undefined

/** 제품 상세의 제작 이력: 공장 거래이력에서 같은 제품명을 모은다 */
export const ordersOfProduct = (productName: string) =>
  factories.flatMap((f) => f.history.filter((h) => h.product === productName).map((h) => ({ ...h, factoryId: f.id })))
