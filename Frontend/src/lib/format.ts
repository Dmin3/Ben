/** 1,234 처럼 천 단위 콤마 */
export const num = (n: number) => n.toLocaleString('ko-KR')

/** ¥1,234 */
export const yuan = (n: number) => `¥${num(n)}`
