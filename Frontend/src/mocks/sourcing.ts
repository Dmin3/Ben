// 사입(시장 대리 구매) 화면용 임시 데이터 (클라이언트 시안 기준). API 연동 시 교체한다.
// 관리자가 "사입 품목 등록"에서 올린 품목이 고객 "사입" 화면에 그대로 보이고, 고객은 장바구니에 담아 주문한다.

export const MARKETS = ['wanjia', 'baima', 'sishanhang', 'shahe'] as const
export type Market = (typeof MARKETS)[number]

export type SourcingColor = { name: string; hex: string }

export type SourcingItem = {
  id: string
  /** 품번 (예: 22001#) */
  code: string
  market: Market
  /** 가게번호 (예: 3F221) */
  shop: string
  sizes: string[]
  colors: SourcingColor[]
  /** 단가 (위안, 수수료 포함) */
  price: number
  moq?: string
  lead?: string
  /** 손님에게 보이는 메모 */
  memo?: string
  /** 사진 장수 (자리 표시). 1번이 대표 */
  photos: number
}

const C = {
  black: { name: '블랙', hex: '#1f2430' },
  pink: { name: '핑크', hex: '#f0a6b8' },
  white: { name: '화이트', hex: '#ffffff' },
  red: { name: '레드', hex: '#d93a3a' },
  blue: { name: '블루', hex: '#2f6fe0' },
  ivory: { name: '아이보리', hex: '#f1e9d6' },
  gray: { name: '그레이', hex: '#9aa1ad' },
  lightDenim: { name: '연청', hex: '#a7bfdf' },
  darkDenim: { name: '진청', hex: '#33496e' },
  melange: { name: '멜란지', hex: '#c9cbd1' },
  navy: { name: '네이비', hex: '#243659' },
}

export const sourcingItems: SourcingItem[] = [
  { id: 's1', code: '22001#', market: 'wanjia', shop: '3F221', sizes: ['F'], colors: [C.black, C.pink, C.white, C.red, C.blue], price: 35, photos: 3 },
  { id: 's2', code: '22014#', market: 'wanjia', shop: '2F108', sizes: ['S', 'M', 'L'], colors: [C.ivory, C.black], price: 48, photos: 3 },
  { id: 's3', code: '11054#', market: 'baima', shop: '3F-A15', sizes: ['S', 'M', 'L'], colors: [C.ivory, C.black, C.gray], price: 58, moq: '10장', photos: 3 },
  { id: 's4', code: '2318#', market: 'sishanhang', shop: '5F-512', sizes: ['F'], colors: [C.lightDenim, C.darkDenim], price: 72, lead: '3~5일', photos: 3 },
  { id: 's5', code: '3021#', market: 'shahe', shop: '3F-3105', sizes: ['S', 'M', 'L'], colors: [C.melange, C.navy], price: 52, memo: '면 100%, 도톰한 편', photos: 3 },
  { id: 's6', code: '20117#', market: 'baima', shop: '2F-B08', sizes: ['F'], colors: [C.black, C.ivory], price: 29, photos: 2 },
]

/** 장바구니 한 줄 (컬러·사이즈·수량) */
export type CartLine = { id: string; color: string; size: string; qty: number; checked: boolean }
/** 장바구니 품목: 줄 묶음 + 요청 사항 */
export type CartEntry = { itemId: string; checked: boolean; note: string; lines: CartLine[] }

export const initialCart: CartEntry[] = [
  {
    itemId: 's1',
    checked: true,
    note: '택 제거해주세요',
    lines: [
      { id: 'l1', color: '블랙', size: 'F', qty: 20, checked: true },
      { id: 'l2', color: '핑크', size: 'F', qty: 10, checked: true },
      { id: 'l3', color: '화이트', size: 'F', qty: 10, checked: true },
    ],
  },
  {
    itemId: 's2',
    checked: true,
    note: '',
    lines: [
      { id: 'l4', color: '아이보리', size: 'M', qty: 30, checked: true },
      { id: 'l5', color: '아이보리', size: 'L', qty: 20, checked: true },
      { id: 'l6', color: '블랙', size: 'M', qty: 20, checked: true },
    ],
  },
  {
    itemId: 's4',
    checked: false,
    note: '',
    lines: [{ id: 'l7', color: '연청', size: 'F', qty: 15, checked: false }],
  },
]
