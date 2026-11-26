import { cn } from '@/lib/utils'

/** 컬러 동그라미 (사입 품목 컬러 표시) */
export function Swatch({ hex, className }: { hex: string; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-3 shrink-0 rounded-full ring-1 ring-border', className)} style={{ background: hex }} />
}
