import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ADMIN_STEPS } from '@/mocks/admin'
import { panel } from './styles'
import { useAdminUser } from './me'

/** 관리자 화면 공통 부품. 시안의 카드·제목·지표·단계 막대를 한 모양으로 맞춘다 */

export function PageHead({
  crumb,
  back,
  title,
  badge,
  desc,
  actions,
}: {
  crumb?: string
  back?: { to: string; label: string }
  title: ReactNode
  badge?: ReactNode
  desc?: string
  actions?: ReactNode
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        {crumb && <div className="text-[13px] text-muted-foreground">{crumb}</div>}
        {back && (
          <Link to={back.to} className="flex w-fit items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            {back.label}
          </Link>
        )}
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">
          {title}
          {badge}
        </h1>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Panel({ title, action, className, children }: { title?: ReactNode; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn(panel, 'min-w-0 p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

const TONES = {
  default: '',
  primary: 'text-primary',
  danger: 'text-destructive',
  warning: 'text-warning',
  success: 'text-success',
} as const
export type Tone = keyof typeof TONES

export function Stat({
  label,
  value,
  unit,
  note,
  tone = 'default',
  noteTone,
  highlight,
}: {
  label: ReactNode
  value: ReactNode
  unit?: string
  note?: ReactNode
  tone?: Tone
  noteTone?: Tone
  highlight?: 'primary' | 'warning' | 'danger'
}) {
  return (
    <div
      className={cn(
        panel,
        'p-5',
        highlight === 'primary' && 'ring-primary',
        highlight === 'warning' && 'bg-warning-subtle/40 ring-warning/50',
        highlight === 'danger' && 'bg-danger-subtle/40 ring-destructive/40',
      )}
    >
      <div className="text-[13px] text-muted-foreground">{label}</div>
      <div className={cn('mt-2 text-[26px] font-extrabold tabular-nums', TONES[tone])}>
        {value}
        {unit && <span className="ml-1 text-sm font-semibold">{unit}</span>}
      </div>
      {note && <div className={cn('mt-1.5 text-xs text-muted-foreground', noteTone && TONES[noteTone])}>{note}</div>}
    </div>
  )
}

/** 표 위 작은 단계 막대: 지난 단계 진하게, 현재 단계 밝게, 지연이면 현재 단계 빨강 */
export function StepBar({ step, delayed }: { step: number; delayed?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="min-w-32 space-y-1">
      <div className="flex gap-0.5">
        {ADMIN_STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < step ? 'bg-primary' : i === step ? (delayed ? 'bg-destructive' : 'bg-primary/50') : 'bg-border',
            )}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">{t('adminPages.stepNow', { step: t(`adminPages.steps.${ADMIN_STEPS[step]}`) })}</div>
    </div>
  )
}

/** 이니셜 원 */
export function Initial({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background', className)}>
      {name[0]}
    </span>
  )
}

/** 켜고 끄는 스위치 (고객 공개, 사용 여부 등) */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors', checked ? 'bg-primary' : 'bg-border')}
    >
      <span className={cn('absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </button>
  )
}

/** 고르기 상자 (값 목록이 단순한 곳) */
export function Pick({
  value,
  onChange,
  options,
  placeholder,
  label,
  className,
}: {
  value: string | null
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  label: string
  className?: string
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => onChange((v as string) ?? '')}>
      <SelectTrigger aria-label={label} className={cn('h-10 w-full bg-card', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** 최고관리자 전용 화면에 다른 역할이 들어오면 막는다 */
export function SuperOnly({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  if (useAdminUser().role === 'SUPER') return children
  return <p className={cn(panel, 'py-16 text-center text-sm text-muted-foreground')}>{t('adminPages.superOnly')}</p>
}

/** 제목 옆 "최고관리자 전용" 같은 짙은 배지 */
export function DarkBadge({ children }: { children: ReactNode }) {
  return <span className="rounded bg-foreground px-1.5 py-0.5 text-[11px] font-bold text-background">{children}</span>
}
