import { Search } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** 돋보기 아이콘이 붙은 검색 입력칸. placeholder가 접근성 이름도 겸한다 */
export function SearchInput({ className, placeholder, ...props }: ComponentProps<'input'>) {
  return (
    <div className={cn('relative', className)}>
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle-foreground" />
      <Input type="search" placeholder={placeholder} aria-label={placeholder} className="pl-9" {...props} />
    </div>
  )
}
