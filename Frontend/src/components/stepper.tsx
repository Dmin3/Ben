import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** − 수량 + */
export function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-10 w-32 items-center overflow-hidden rounded-lg border">
      <button type="button" aria-label={t('sourcing.decrease')} onClick={() => onChange(Math.max(1, value - 1))} className="flex h-full w-9 items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted">
        <Minus className="size-3.5" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))}
        className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-bold tabular-nums outline-none"
      />
      <button type="button" aria-label={t('sourcing.increase')} onClick={() => onChange(value + 1)} className="flex h-full w-9 items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted">
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
