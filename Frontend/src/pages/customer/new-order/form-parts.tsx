import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

/** 번호가 붙은 섹션 카드 */
export function Section({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex gap-2.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-primary">
            {step}
          </span>
          <div>
            <h2 className="text-[15px] font-bold">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

/** 샘플/리오더, 해운/항공 같은 칩 버튼 공통 스타일 */
export const chipClass =
  'h-9 rounded-full border border-input bg-card px-4 text-[13px] font-medium hover:bg-muted aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-primary data-pressed:border-primary data-pressed:bg-accent data-pressed:font-semibold data-pressed:text-primary'
