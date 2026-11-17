import { cn } from '@/lib/utils'

type Option<T extends string> = { value: T; label: string; count?: number }

/** "전체 8 | 의류 3" 처럼 하나만 고르는 필터 버튼 묶음 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-9 rounded-lg border px-3.5 text-[13px] font-semibold transition-colors',
            value === o.value ? 'border-ink bg-ink text-white' : 'bg-card text-foreground/80 hover:bg-muted',
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn('ml-1.5 text-xs font-medium', value === o.value ? 'text-white/70' : 'text-subtle-foreground')}>
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
