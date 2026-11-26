// 관리자 어드민 화면용 임시 데이터 (기획 시안 기준). API 연동 시 교체한다.

/** 관리자 진행 단계 9개. 견적·발주는 내부 전용이라 고객 화면(7단계)에는 안 보인다 */
export const ADMIN_STEPS = ['quote', 'sample', 'po', 'mass', 'inbound', 'inspection', 'outbound', 'customs', 'delivery'] as const
export type AdminStep = (typeof ADMIN_STEPS)[number]
export const INTERNAL_STEPS: AdminStep[] = ['quote', 'po']

/** SUPER 최고관리자 / MANAGER 매니저 / FINANCE 재무 담당 / VIEWER 보기 전용 */
export type AdminRole = 'SUPER' | 'MANAGER' | 'FINANCE' | 'VIEWER'

export type Staff = {
  id: string
  name: string
  email: string
  role: AdminRole
  customers: string
  lastSeen: string
  active: boolean
}

export const staff: Staff[] = [
  { id: 's1', name: '김대표', email: 'ceo@benlogistics.kr', role: 'SUPER', customers: '전체', lastSeen: '오늘 15:40', active: true },
  { id: 's2', name: '정효은', email: 'hyoeun@benlogistics.kr', role: 'MANAGER', customers: '태람컴퍼니 외 11곳', lastSeen: '오늘 15:12', active: true },
  { id: 's3', name: '박서준', email: 'seojun@benlogistics.kr', role: 'MANAGER', customers: '라이프앤콜렉트 외 8곳', lastSeen: '오늘 11:03', active: true },
  { id: 's4', name: '이하늘', email: 'haneul@benlogistics.kr', role: 'MANAGER', customers: '유유코퍼레이션 외 9곳', lastSeen: '10.10', active: true },
  { id: 's5', name: '최재무', email: 'finance@benlogistics.kr', role: 'FINANCE', customers: '-', lastSeen: '10.09', active: true },
  { id: 's6', name: '한인턴', email: 'intern@benlogistics.kr', role: 'VIEWER', customers: '-', lastSeen: '09.30', active: false },
]
export const managers = staff.filter((s) => s.role === 'MANAGER')

// 로그인한 관리자는 pages/admin/me.ts (useAdminUser)

/** 사이드바·홈 숫자 (예치금 승인 대기 수는 예치금 내역에서 센다) */
export const adminCounts = { newOrders: 3 }

export type Customer = {
  id: string
  name: string
  owner: string
  loginId: string
  manager: string
  balance: number
  feeRate: number
  activeOrders: number
  totalAmount: number
  joinedAt: string
  /** 탈퇴 회원 */
  left?: boolean
}

export const customers: Customer[] = [
  { id: 'c1', name: '태람컴퍼니', owner: '이태람 대표', loginId: 'taeram01', manager: '정효은', balance: 30000, feeRate: 4.5, activeOrders: 5, totalAmount: 1_200_000, joinedAt: '2026.03.04' },
  { id: 'c2', name: '유유코퍼레이션', owner: '박유유 팀장', loginId: 'yuyu_corp', manager: '이하늘', balance: 52000, feeRate: 5, activeOrders: 2, totalAmount: 1_800_000, joinedAt: '2025.11.20' },
  { id: 'c3', name: '라이프앤콜렉트', owner: '최라이 실장', loginId: 'lifencollect', manager: '박서준', balance: 18500, feeRate: 5, activeOrders: 2, totalAmount: 1_400_000, joinedAt: '2025.09.02' },
  { id: 'c4', name: '승준컴퍼니', owner: '김승준 대표', loginId: 'seungjun', manager: '정효은', balance: -86067.7, feeRate: 5, activeOrders: 1, totalAmount: 900_000, joinedAt: '2026.01.15' },
  { id: 'c5', name: '필인더블랭크', owner: '오필인 대표', loginId: 'feelblank', manager: '박서준', balance: 26359.8, feeRate: 5, activeOrders: 1, totalAmount: 600_000, joinedAt: '2026.05.08' },
  { id: 'c6', name: '모먼트스튜디오', owner: '윤모먼 대표', loginId: 'moment_st', manager: '이하늘', balance: 12000, feeRate: 5, activeOrders: 0, totalAmount: 210_000, joinedAt: '2026.02.11', left: true },
]
export const findCustomer = (id: string | undefined) => customers.find((c) => c.id === id)

export type AdminOrderStatus = 'needs_check' | 'delayed' | 'normal' | 'quote'
export type AdminOrder = {
  id: string
  customerId: string
  product: string
  /** 견적 중이면 null */
  factoryId: string | null
  quantity: number | null
  dueDate: string | null
  /** ADMIN_STEPS 인덱스 */
  step: number
  delayed: boolean
  status: AdminOrderStatus
  main: string
  sub: string | null
  amount: number | null
}

export const adminOrders: AdminOrder[] = [
  { id: 'BEN-2026-0002', customerId: 'c1', product: '핸드메이드 코트', factoryId: 'f2', quantity: 3000, dueDate: '2026.10.22', step: 5, delayed: false, status: 'needs_check', main: '정효은', sub: '박서준', amount: 609200 },
  { id: 'BEN-2026-0003', customerId: 'c1', product: '워싱 데님', factoryId: 'f3', quantity: 800, dueDate: '2026.11.02', step: 3, delayed: true, status: 'delayed', main: '정효은', sub: '박서준', amount: 96000 },
  { id: 'BEN-2026-0001', customerId: 'c1', product: '홈웨어', factoryId: 'f4', quantity: 1000, dueDate: '2026.09.25', step: 8, delayed: false, status: 'normal', main: '정효은', sub: null, amount: 58000 },
  { id: 'BEN-2026-0004', customerId: 'c1', product: '에코백', factoryId: null, quantity: null, dueDate: null, step: 0, delayed: false, status: 'quote', main: '정효은', sub: null, amount: null },
  { id: 'BEN-2026-0005', customerId: 'c1', product: '토끼 키링', factoryId: null, quantity: null, dueDate: null, step: 0, delayed: false, status: 'quote', main: '정효은', sub: null, amount: null },
  { id: 'BEN-2026-0011', customerId: 'c2', product: '울 코트', factoryId: 'f2', quantity: 1200, dueDate: '2026.12.10', step: 1, delayed: false, status: 'normal', main: '이하늘', sub: '정효은', amount: 210000 },
  { id: 'BEN-2026-0012', customerId: 'c2', product: '나일론 백팩', factoryId: 'f1', quantity: 2000, dueDate: '2026.10.15', step: 4, delayed: false, status: 'normal', main: '이하늘', sub: null, amount: 160000 },
  { id: 'BEN-2026-0014', customerId: 'c3', product: '린넨 셔츠', factoryId: 'f2', quantity: 2000, dueDate: '2026.11.18', step: 3, delayed: false, status: 'normal', main: '박서준', sub: null, amount: 184000 },
  { id: 'BEN-2026-0008', customerId: 'c3', product: '데님 재킷', factoryId: 'f3', quantity: 600, dueDate: '2026.10.10', step: 6, delayed: false, status: 'normal', main: '박서준', sub: null, amount: 66000 },
  { id: 'BEN-2026-0015', customerId: 'c4', product: '코튼 파자마', factoryId: 'f4', quantity: 500, dueDate: '2026.11.25', step: 2, delayed: false, status: 'normal', main: '정효은', sub: null, amount: 22500 },
]
export const findAdminOrder = (id: string | undefined) => adminOrders.find((o) => o.id === id)

/** 고객이 웹 양식(web) 또는 자체 양식 파일(file)로 보낸 신규 오더 */
export type IncomingOrder = {
  id: string
  kind: 'web' | 'file'
  customerId: string
  title: string
  summary: string
  receivedAt: string
  /** 목록 카드 아래 한 줄 안내 */
  hint: string
  state: 'unchecked' | 'checking' | 'info_requested'
  web?: {
    category: string
    dueDate: string
    process: 'sample' | 'reorder'
    inspection: string
    factory: string
    shipping: string
    quantities: { color: string; size: string; qty: number }[]
    memo: string
    files: string[]
  }
  file?: {
    files: { name: string; size: string; type: 'xlsx' | 'pdf' }[]
    memo: string
    items: string[]
  }
}

export const incomingOrders: IncomingOrder[] = [
  {
    id: 'BEN-2026-0006',
    kind: 'web',
    customerId: 'c1',
    title: '25FW 울 블렌드 롱코트',
    summary: '태람컴퍼니 · 의류 · 280장 · 샘플',
    receivedAt: '오늘 14:12',
    hint: '희망 입고 2026.12.20',
    state: 'unchecked',
    web: {
      category: '의류 · 아우터',
      dueDate: '2026.12.20 (한국 도착)',
      process: 'sample',
      inspection: '봉제 마감, 이염, 사이즈 오차 ±1cm',
      factory: 'BEN에 맡기기',
      shipping: '해운 · 본사 물류창고 (김포)',
      quantities: [
        { color: '블랙', size: 'S', qty: 40 },
        { color: '블랙', size: 'M', qty: 80 },
        { color: '블랙', size: 'L', qty: 40 },
        { color: '차콜', size: 'M', qty: 120 },
      ],
      memo: '- 원단: 울 70% / 폴리 30%, 안감은 레퍼런스_02와 같은 톤\n- 로고: 왼쪽 가슴 자수, 메인라벨 + 행택 부착\n- 포장: 개별 OPP, 바코드 부착',
      files: ['작업지시서_롱코트.pdf', '레퍼런스_01.jpg', '레퍼런스_02.jpg'],
    },
  },
  {
    id: 'IN-1011-02',
    kind: 'file',
    customerId: 'c2',
    title: '유유코퍼레이션_10월발주.xlsx',
    summary: '유유코퍼레이션 · 품목 4개 · 총 3,200장',
    receivedAt: '오늘 11:40',
    hint: '파일 내용 확인 후 입력 필요',
    state: 'unchecked',
    file: {
      files: [
        { name: '유유코퍼레이션_10월발주.xlsx', size: '48 KB · 시트 2개', type: 'xlsx' },
        { name: '작업지시서_4종.pdf', size: '2.1 MB', type: 'pdf' },
      ],
      memo: '4개 품목 같이 진행 부탁드려요. 납기는 파일에 적어두었습니다.',
      items: ['니트 가디건', '품목 2', '품목 3', '품목 4'],
    },
  },
  {
    id: 'IN-1010-01',
    kind: 'web',
    customerId: 'c3',
    title: '나일론 파우치 리오더',
    summary: '라이프앤콜렉트 · 가방 · 1,000개 · 리오더',
    receivedAt: '어제 17:05',
    hint: '메인 정효은 · 공장 세진가방',
    state: 'checking',
    web: {
      category: '가방',
      dueDate: '2026.12.01 (한국 도착)',
      process: 'reorder',
      inspection: '지퍼 작동, 봉제 마감',
      factory: '세진가방',
      shipping: '해운 · 본사 물류창고 (김포)',
      quantities: [{ color: '블랙', size: 'FREE', qty: 1000 }],
      memo: '지난 오더와 동일 사양',
      files: [],
    },
  },
  {
    id: 'IN-1009-03',
    kind: 'web',
    customerId: 'c4',
    title: '코튼 파자마',
    summary: '승준컴퍼니 · 의류 · 500장',
    receivedAt: '10.09',
    hint: '사이즈 수량 누락',
    state: 'info_requested',
    web: {
      category: '의류 · 상의',
      dueDate: '2026.12.15 (한국 도착)',
      process: 'reorder',
      inspection: '',
      factory: 'BEN에 맡기기',
      shipping: '추천 요청',
      quantities: [{ color: '화이트', size: '-', qty: 500 }],
      memo: '',
      files: [],
    },
  },
]
/** 처리 완료 건수 (목록은 주문종합에서 본다) */
export const incomingDoneCount = 28

/** 관리자 전용 공장 정보 (고객 화면에 안 보이는 값) */
export const factoryAdmin: Record<string, { code: string; registeredAt: string; capacity: string; moq: string; sampleDays: string; payment: string; contact: { name: string; wechat: string; phone: string }; manager: string; memo: string }> = {
  f1: { code: 'F-0003', registeredAt: '2024.04.02', capacity: '20,000 pcs', moq: '500 pcs', sampleDays: '5~7일', payment: '계약금 30% · 잔금 출고 전', contact: { name: '李经理 (리 매니저)', wechat: 'sejin_li', phone: '+86 135 0000 0000' }, manager: '이하늘', memo: '' },
  f2: { code: 'F-0012', registeredAt: '2025.08.12', capacity: '30,000 pcs', moq: '300 pcs / 컬러', sampleDays: '7~10일', payment: '계약금 30% · 잔금 출고 전', contact: { name: '陈经理 (천 매니저)', wechat: 'foc_chen88', phone: '+86 138 0000 0000' }, manager: '정효은', memo: '코트 품질은 좋지만 원단 입고가 자주 늦어요. 납기 여유 있게 잡기.' },
  f3: { code: 'F-0015', registeredAt: '2025.06.01', capacity: '15,000 pcs', moq: '300 pcs', sampleDays: '7일', payment: '계약금 30% · 잔금 출고 전', contact: { name: '张经理 (장 매니저)', wechat: 'xt_zhang', phone: '+86 139 0000 0000' }, manager: '박서준', memo: '' },
  f4: { code: 'F-0018', registeredAt: '2025.07.20', capacity: '25,000 pcs', moq: '500 pcs', sampleDays: '5일', payment: '계약금 30% · 잔금 출고 전', contact: { name: '王经理 (왕 매니저)', wechat: 'panyu_wang', phone: '+86 137 0000 0000' }, manager: '정효은', memo: '' },
}

export type AdminNotice = {
  id: string
  pinned: boolean
  title: string
  target: string
  period: string
  state: 'ended' | 'live' | 'scheduled'
  views: number | null
}

export const adminNotices: AdminNotice[] = [
  { id: 'an1', pinned: true, title: '추석 연휴 중국 공장 휴무 안내 (10.01~10.08)', target: '전체 고객', period: '09.25 ~ 10.10', state: 'ended', views: 412 },
  { id: 'an2', pinned: true, title: '2026 하반기 TT 송금 계좌 변경 안내', target: '전체 고객', period: '10.11 ~ 11.30', state: 'live', views: 186 },
  { id: 'an3', pinned: false, title: '11월 광군제 기간 물류 지연 가능성 안내', target: '전체 고객', period: '11.01 ~ 11.15', state: 'scheduled', views: null },
  { id: 'an4', pinned: false, title: '태람컴퍼니 전용: 겨울 코트 원단 단가 인상 안내', target: '태람컴퍼니', period: '10.08 ~ 10.31', state: 'live', views: 9 },
  { id: 'an5', pinned: false, title: '시스템 점검 안내 (10.20 02:00~04:00)', target: '전체 고객', period: '10.15 ~ 10.20', state: 'scheduled', views: null },
]

export type ActivityMenu = 'customers' | 'deposit' | 'orders' | 'supply' | 'settings' | 'finance'
export const activities: { at: string; who: string; menu: ActivityMenu; text: string }[] = [
  { at: '오늘 15:40', who: '김대표', menu: 'customers', text: '태람컴퍼니 수수료율 5% → 4.5% 변경' },
  { at: '오늘 15:12', who: '정효은', menu: 'deposit', text: '태람컴퍼니 +20,000 위안 입금 반영' },
  { at: '오늘 14:58', who: '정효은', menu: 'orders', text: 'BEN-2026-0002 단계 양산 → 검품 변경' },
  { at: '오늘 11:03', who: '박서준', menu: 'supply', text: '화메이 니트 공장 등록' },
  { at: '오늘 10:21', who: '최재무', menu: 'deposit', text: '승준컴퍼니 2026.09.26 계약금 차감 정정 (-12,000 → -10,000)' },
  { at: '10.10 18:02', who: '이하늘', menu: 'orders', text: 'BEN-2026-0011 고객 공개 자료 교체 (인보이스 v2)' },
  { at: '10.10 09:15', who: '김대표', menu: 'settings', text: '한인턴 계정 사용 중지' },
]

/** 관리자 홈 지표 (시안 값) */
export const homeStats = {
  lastIncoming: { at: '14:12', customer: '이태람 고객' },
  active: { value: 42, diff: '+6' },
  delayed: { value: 3, diff: '-2' },
  shipToday: { value: 8, diff: '+1' },
  shortage: 5,
  /** ADMIN_STEPS 순서의 단계별 오더 수 */
  stepCounts: [3, 9, 2, 12, 6, 5, 4, 3, 3],
  /** 월별 거래액 (억 원) */
  monthly: [
    [6.2, 3.2], [5.1, 3.6], [4.6, 4.7], [6.2, 5.8], [5.6, 6.8], [7.1, 7.2],
    [7.6, 8.2], [8.1, 9.6], [9.1, 11.1], [10.2, null], [11.1, null], [12.6, null],
  ] as [number, number | null][],
  topCustomers: [
    { name: '유유코퍼레이션', orders: 12, amount: 1.8 },
    { name: '라이프앤콜렉트', orders: 9, amount: 1.4 },
    { name: '태람컴퍼니', orders: 8, amount: 1.2 },
    { name: '승준컴퍼니', orders: 6, amount: 0.9 },
    { name: '필인더블랭크', orders: 4, amount: 0.6 },
  ],
  issues: [
    { type: 'new' as const, title: '25FW 울 블렌드 롱코트 280장', meta: 'BEN-2026-0006 | 태람컴퍼니', at: '방금', to: '/admin/orders/incoming' },
    { type: 'delay' as const, title: '신탕청바지 생산 6일 지연', meta: 'BEN-2026-0003 | 태람컴퍼니', at: '3시간 전', to: '/admin/orders/BEN-2026-0003' },
    { type: 'deposit' as const, title: '예치금 부족 ¥40,000', meta: 'BEN-2026-0002 잔금 예정 | 태람컴퍼니', at: '5시간 전', to: '/admin/orders/BEN-2026-0002' },
    { type: 'missing' as const, title: 'QC 리포트 미등록', meta: 'BEN-2026-0002 | FOC의류', at: '1일 전', to: '/admin/orders/BEN-2026-0002' },
  ],
}

// ponytail: 주문 상세의 부가 정보는 시안의 BEN-2026-0002 값을 모든 오더에 같이 쓴다. API 연동 시 오더별 값으로 교체
export const orderExtras = {
  /** ADMIN_STEPS 순서의 단계 날짜 (진행 전이면 null) */
  stepDates: ['07.02', '07.08', '07.25', '08.05', '09.18', null, '10.15', null, null] as (string | null)[],
  checklistDone: { report: true, qc: false, issue: false, balance: false },
  shortage: 40000,
  samples: ['front_01.jpg', 'back_01.jpg', 'side_01.jpg', 'label_01.jpg', 'color_01.jpg', 'pack_01.jpg'],
  invoices: [
    { name: 'CI_BEN-2026-0002_v2.pdf', tag: 'v2 · 10.10 정효은', current: true },
    { name: 'CI_BEN-2026-0002_v1.pdf', tag: '이전 버전 · 10.09', current: false },
  ],
  issue: {
    title: 'QC 이미지 확인 요청',
    at: '오늘 10:12 · 정효은',
    internal: 'FOC 검품 완료. 단추 불량 12pcs 교체 후 QC 이미지 업로드 예정.',
    customer: '검품이 완료되었습니다. QC 이미지를 확인하시고 이상이 없으면 승인해 주세요.',
  },
  fees: [
    { key: 'sample' as const, amount: 2000, note: '샘플 2벌 · 07.08 예치금 차감', done: true },
    { key: 'down' as const, amount: 180000, note: '발주 3,000장 × 200 위안의 30% · 07.25 예치금 차감', done: true },
    { key: 'balance' as const, amount: 427200, note: '오버 36장 포함 · 출고 전 예치금 차감', done: false },
  ],
  memos: [
    { who: '정효은', at: '오늘 09:40', text: 'FOC 측 QC 사진 오후 중 전달 예정. 받으면 바로 업로드.' },
    { who: '정효은', at: '어제 17:12', text: '단추 불량 12pcs 발견, 공장에서 교체 진행 중.' },
  ],
  activity: [
    { text: '잔금 수정 424,000 → 427,200 위안 (오버 36장)', meta: '정효은 · 10.10 15:20' },
    { text: '통관 인보이스 교체 (v1 → v2)', meta: '정효은 · 10.10 15:02' },
    { text: '샘플 이미지 1장 삭제 (중복)', meta: '정효은 · 10.09 11:20', danger: true },
    { text: '검품 단계로 변경', meta: '정효은 · 09.26 14:20' },
    { text: '이슈 등록: QC 이미지 확인 요청', meta: '정효은 · 09.26 10:12' },
    { text: '입고 완료', meta: '정효은 · 09.18 16:05' },
    { text: '계약금 180,000 위안 예치금 차감', meta: '시스템 · 07.25 09:00' },
    { text: '샘플 이미지 6장 업로드', meta: '정효은 · 07.20 11:30' },
  ],
}

/** 공장별 진행 중 오더와 고객사 이름 (배송 단계 전까지) */
export const factoryActive = (factoryId: string) => {
  const orders = adminOrders.filter((o) => o.factoryId === factoryId && o.step < ADMIN_STEPS.length - 1)
  const names = [...new Set(orders.map((o) => customers.find((c) => c.id === o.customerId)?.name ?? ''))]
  return { orders, names }
}
