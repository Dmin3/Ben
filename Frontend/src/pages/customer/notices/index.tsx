import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { notices } from '@/mocks/customer-home'

/** 공지 목록. 누르면 그 자리에서 본문이 펼쳐진다 (?id=로 열린 상태 공유) */
export default function Notices() {
  const { t } = useTranslation()
  // TODO(API): 공지 목록 API
  const [params, setParams] = useSearchParams()
  const openId = params.get('id')

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">{t('home.notice.title')}</h1>
      <ul className="divide-y divide-divider rounded-2xl bg-card ring-1 ring-border">
        {notices.map((n) => {
          const open = openId === n.id
          return (
            <li key={n.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setParams(open ? {} : { id: n.id }, { replace: true })}
                className="flex w-full items-center gap-2.5 px-5 py-4 text-left hover:bg-muted/50"
              >
                <Badge variant={n.important ? 'danger' : 'info'}>
                  {n.important ? t('home.notice.important') : t('home.notice.normal')}
                </Badge>
                <span className="min-w-0 flex-1 text-sm font-semibold">{n.title}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{n.date}</span>
                <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
              </button>
              {open && <p className="px-5 pb-5 text-sm leading-relaxed whitespace-pre-line text-foreground/90">{n.body}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
