import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const PROVIDERS = ['kakao', 'naver', 'google'] as const
export type Provider = (typeof PROVIDERS)[number]

// 각 사 로그인 버튼 가이드의 배경색과 심볼
const STYLES: Record<Provider, { className: string; icon: ReactNode }> = {
  kakao: {
    className: 'bg-[#FEE500] text-black/85 hover:bg-[#FEE500]/90',
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.86 5.32 4.66 6.74l-.95 3.48c-.08.3.26.54.52.37l4.1-2.72c.55.07 1.11.11 1.67.11 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
      </svg>
    ),
  },
  naver: {
    className: 'bg-[#03C75A] text-white hover:bg-[#03C75A]/90',
    icon: (
      <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
        <path d="M16.27 3v9.37L7.73 3H3v18h4.73v-9.37L16.27 21H21V3z" />
      </svg>
    ),
  },
  google: {
    className: 'border bg-card text-foreground hover:bg-muted',
    icon: (
      <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    ),
  },
}

/** 카카오 · 네이버 · Google 간편 로그인 버튼 */
export function SocialButtons({ onSelect }: { onSelect: (provider: Provider) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      {PROVIDERS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelect(p)}
          className={cn(
            'relative flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors',
            STYLES[p].className,
          )}
        >
          <span className="absolute left-4 flex size-5 items-center justify-center">{STYLES[p].icon}</span>
          {t(`auth.social.${p}`)}
        </button>
      ))}
    </div>
  )
}
