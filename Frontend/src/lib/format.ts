/** 1,234 처럼 천 단위 콤마 */
export const num = (n: number) => n.toLocaleString('ko-KR')

/** ¥1,234 */
export const yuan = (n: number) => `¥${num(n)}`

/** 1,234.50 처럼 소수 둘째 자리까지 (예치금·정산 금액) */
export const cny = (n: number) => n.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** ₩1,234 */
export const won = (n: number) => `₩${num(Math.round(n))}`

/** +1,234.50 / -1,234.50 (0은 부호 없음) */
export const signed = (n: number) => `${n > 0 ? '+' : ''}${cny(n)}`
