import type { CSSProperties, PointerEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Logo } from '@/components/layout/sidebar'
import { cn } from '@/lib/utils'

// 로고 심볼 4조각 (logo-symbol.svg와 같은 path). k: 마우스를 따라 움직이는 깊이
const GREEN = 'fill-[#5fbc56]'
const BLUE = 'fill-[#2151a3] dark:fill-[#4a7ddd]'
const PIECES = [
  { fill: GREEN, k: -6, matrix: 'matrix(1.33333 0 0 -1.33333 38.403 54.409)', d: 'm0 0-28.802-12.989v27.818L0 27.818Z' },
  { fill: GREEN, k: -10, matrix: 'matrix(1.33333 0 0 -1.33333 76.805 0)', d: 'm0 0-28.802-12.989 58.734-27.955v-27.817l28.801 12.989v27.817z' },
  { fill: BLUE, k: 7, matrix: 'matrix(1.33333 0 0 -1.33333 76.805 72.225)', d: 'm0 0-28.802-12.989 58.734-27.955v-27.818l28.801 12.99v27.817z' },
  { fill: BLUE, k: 11, matrix: 'matrix(1.33333 0 0 -1.33333 38.403 126.634)', d: 'M0 0v27.817l-28.802-12.988v-27.818l58.733-27.955 28.802 12.989z' },
]

// 심볼 둘레의 서비스 칩. 위치는 원 기준 %
const CHIPS = [
  { key: 'sourcing', x: '5%', y: '14%', dot: 'bg-[#5fbc56]' },
  { key: 'qc', x: '97%', y: '22%', dot: 'bg-[#2151a3]' },
  { key: 'tt', x: '-6%', y: '65%', dot: 'bg-[#5fbc56]' },
  { key: 'customs', x: '106%', y: '68%', dot: 'bg-[#2151a3]' },
  { key: 'buying', x: '48%', y: '99%', dot: 'bg-[#5fbc56]' },
] as const

// 데스크톱 배경에 흩어진 작은 조각. 심볼보다 크게 움직여서 깊이감을 준다
const GHOSTS = [
  { x: '14%', y: '18%', fill: GREEN, opacity: 0.25, k: -24 },
  { x: '38%', y: '10%', fill: GREEN, opacity: 0.3, k: 30 },
  { x: '78%', y: '14%', fill: BLUE, opacity: 0.15, k: -18 },
  { x: '9%', y: '59%', fill: BLUE, opacity: 0.15, k: 26 },
  { x: '86%', y: '59%', fill: BLUE, opacity: 0.15, k: -30 },
]

const GRID: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, color-mix(in oklab, var(--primary) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--primary) 7%, transparent) 1px, transparent 1px)',
  backgroundSize: '64px 64px',
  maskImage: 'radial-gradient(ellipse at 50% 45%, #000 25%, transparent 75%)',
}

/** 부모가 정한 --mx, --my(-0.5 ~ 0.5)만큼 k px 이동 */
const follow = (k: number): CSSProperties => ({
  transform: `translate(calc(var(--mx, 0) * ${k}px), calc(var(--my, 0) * ${k}px))`,
})

function BrandSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 155.12 181.225" aria-hidden className={cn('overflow-visible', className)}>
      {PIECES.map((p) => (
        <g key={p.d} style={follow(p.k)} className="transition-transform duration-300 ease-out">
          <path className={p.fill} transform={p.matrix} d={p.d} />
        </g>
      ))}
    </svg>
  )
}

/** 점선 원 + 심볼 + 서비스 칩 */
function BrandHero() {
  const { t } = useTranslation()
  return (
    <div className="relative mx-auto size-[200px] lg:size-[440px]">
      <span aria-hidden className="absolute inset-0 rounded-full border border-dashed border-primary/25 motion-safe:animate-[spin_90s_linear_infinite]" />
      <span aria-hidden className="absolute inset-[16%] rounded-full border border-primary/10 bg-card/60" />
      <span aria-hidden className="absolute inset-[34%] rounded-full bg-primary/15 blur-2xl" />
      <BrandSymbol className="absolute top-1/2 left-1/2 w-[30%] -translate-1/2" />
      <ul>
        {CHIPS.map((c, i) => (
          <li key={c.key} className="absolute -translate-1/2" style={{ left: c.x, top: c.y }}>
            <span
              className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm motion-safe:animate-float lg:text-[13px]"
              style={{ animationDelay: `${-i * 0.8}s` }}
            >
              <span className={cn('size-1.5 rounded-full', c.dot)} />
              {t(`auth.hero.chips.${c.key}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 로그인 화면 왼쪽(모바일은 위쪽) 브랜드 영역. 데스크톱에선 마우스를 따라 심볼 조각이 움직인다 */
export function BrandPanel({ className }: { className?: string }) {
  const { t } = useTranslation()

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', String((e.clientX - r.left) / r.width - 0.5))
    e.currentTarget.style.setProperty('--my', String((e.clientY - r.top) / r.height - 0.5))
  }
  const onPointerLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--mx', '0')
    e.currentTarget.style.setProperty('--my', '0')
  }

  return (
    <section
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'relative overflow-hidden px-5 pt-12 pb-10 text-center lg:flex lg:min-h-svh lg:flex-col lg:justify-between lg:border-r lg:p-10 lg:text-left xl:p-14',
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={GRID} />
      {GHOSTS.map((g) => (
        <svg
          key={g.x + g.y}
          viewBox="0 0 155.12 181.225"
          aria-hidden
          className="absolute hidden w-10 transition-transform duration-500 ease-out lg:block"
          style={{ left: g.x, top: g.y, opacity: g.opacity, ...follow(g.k) }}
        >
          <path className={g.fill} transform={PIECES[1].matrix} d={PIECES[1].d} />
        </svg>
      ))}

      <div className="relative hidden lg:block">
        <Logo className="h-10" />
      </div>
      <BrandHero />
      <div className="relative mt-10 lg:mt-0">
        <h2 className="text-[26px] font-extrabold tracking-tight lg:text-[40px]">
          <Trans i18nKey="auth.hero.title" components={{ hl: <span className="text-primary" /> }} />
        </h2>
        <p className="mt-2 text-sm text-muted-foreground lg:mt-3 lg:text-[15px]">{t('auth.hero.subtitle')}</p>
      </div>
    </section>
  )
}
