// 새 오더 화면용 임시 데이터. 목록은 BE와 확정되면 API로 교체한다.
import { addresses } from './my-info'

export const categories = [
  { value: 'apparel-outer', label: '의류 · 아우터' },
  { value: 'apparel-top', label: '의류 · 상의' },
  { value: 'apparel-bottom', label: '의류 · 하의' },
  { value: 'bag', label: '가방' },
  { value: 'goods', label: '잡화' },
  { value: 'etc', label: '기타' },
]

// 도착지는 내 정보의 배송지 목록을 그대로 쓴다
export const destinations = addresses.map((a) => ({ value: a.id, label: `${a.name} · ${a.region}` }))

export type FactoryOption = {
  value: string
  name: string
  description: string
  /** 진행 이력 건수. BEN에 맡기기는 없음 */
  history?: number
}

export const factoryOptions: FactoryOption[] = [
  { value: 'ben', name: 'BEN에 맡기기', description: '제품에 맞는 공장을 찾아 견적과 함께 안내해드려요' },
  { value: 'f2', name: 'FOC의류', description: '코트 · 재킷 · 최근 오더 2026.07', history: 6 },
  { value: 'f3', name: '신탕청바지', description: '데님 · 팬츠 · 최근 오더 2026.06', history: 4 },
]
