import type { ComponentProps } from 'react'

/** 카드 오른쪽 위 "전체보기" 같은 링크 */
export function CardLink(props: ComponentProps<'button'>) {
  return <button type="button" className="text-xs font-semibold text-primary hover:underline" {...props} />
}
