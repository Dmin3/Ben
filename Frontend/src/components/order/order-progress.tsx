import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { ORDER_STEPS } from './steps'

type Props = {
  /** 현재 단계 인덱스 */
  current: number
  /** 지연 시 빨간색으로 표시 */
  delayed?: boolean
  /** sm: 홈 표처럼 좁은 곳 / lg: 업무 카드처럼 넓은 곳 (완료 단계에 체크 표시) */
  size?: 'sm' | 'lg'
}

export function OrderProgress({ current, delayed = false, size = 'sm' }: Props) {
  const { t } = useTranslation()
  const lg = size === 'lg'
  const line = delayed ? 'bg-destructive' : 'bg-primary'
  const filled = delayed ? 'border-destructive bg-destructive' : 'border-primary bg-primary'
  const ring = delayed ? 'border-destructive' : 'border-primary'
  const activeText = delayed ? 'text-destructive' : 'text-primary'

  return (
    <ol className={cn('flex w-full', lg ? 'min-w-[420px]' : 'min-w-80')}>
      {ORDER_STEPS.map((step, i) => {
        const done = i < current
        const active = i === current

        return (
          <li key={step} className={cn('relative flex flex-1 flex-col items-center', lg ? 'gap-2' : 'gap-1.5')}>
            {/* 다음 단계로 이어지는 선 */}
            {i < ORDER_STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn('absolute left-1/2 h-0.5 w-full', lg ? 'top-[11px]' : 'top-[5px]', done ? line : 'bg-border')}
              />
            )}
            <span
              className={cn(
                'relative flex items-center justify-center rounded-full border-2',
                lg ? 'size-6' : 'size-3',
                done && filled,
                active && cn(ring, 'bg-card'),
                !done && !active && 'border-border bg-card',
              )}
            >
              {lg && done && <Check className="size-3.5 text-white" strokeWidth={3} />}
              {lg && active && <span className={cn('size-2.5 rounded-full', delayed ? 'bg-destructive' : 'bg-primary')} />}
            </span>
            <span
              className={cn(
                lg ? 'text-xs' : 'text-[11px]',
                done && (lg ? 'text-foreground' : 'text-muted-foreground'),
                active && cn('font-bold', activeText),
                !done && !active && 'text-subtle-foreground',
              )}
            >
              {t(`order.steps.${step}`)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
