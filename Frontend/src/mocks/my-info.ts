// 내 정보 화면용 임시 데이터. API 연동 시 교체한다.

export const profile = {
  name: '이태람',
  company: '태람컴퍼니',
  customerNo: 'C-2026-0012',
  joinedAt: '2026.03.04',
}

export const companyInfo = {
  name: '(주)태람컴퍼니',
  nameEn: 'TAERAM CO., LTD',
  businessNo: '123-45-67890',
  ceo: '이태람',
  businessType: '도소매 · 의류, 잡화',
  address: '서울 성동구 성수이로 00, 3층',
  certificate: '사업자등록증.pdf',
}

export const contactPerson = {
  name: '이태람',
  title: '대표',
  phone: '010-0000-0000',
  email: 'taeram@example.com',
}

export type Address = {
  id: string
  name: string
  /** 목록 표시용 지역 (예: 경기 김포시) */
  region: string
  address: string
  recipient: string
  phone: string
  isDefault?: boolean
}

export const addresses: Address[] = [
  {
    id: 'hq-gimpo',
    name: '본사 물류창고',
    region: '경기 김포시',
    address: '경기 김포시 고촌읍 00로 00, B동',
    recipient: '김창고',
    phone: '010-0000-0000',
    isDefault: true,
  },
  {
    id: 'showroom-seongsu',
    name: '성수 쇼룸',
    region: '서울 성동구',
    address: '서울 성동구 성수이로 00, 1층',
    recipient: '이태람',
    phone: '010-0000-0000',
  },
]

export const benManager = {
  name: '정효은',
  title: '매니저',
  description: '오더·예치금 문의 · 평일 09:00~18:00',
}

export const account = {
  loginId: 'taeram01',
}
