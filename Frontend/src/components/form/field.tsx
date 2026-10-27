import { useTranslation } from 'react-i18next'
import type { ParseKeys } from 'i18next'
import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** 라벨 + 입력 + 에러 메시지. error는 번역 키 (zod 스키마의 메시지) */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: string
  className?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="gap-1 text-[13px] font-semibold">
        {label}
        {hint}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{t(error as ParseKeys)}</p>}
    </div>
  )
}
