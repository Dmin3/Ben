import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cny, signed } from '@/lib/format'
import { cn } from '@/lib/utils'
import { capitalCurrent, capitalHistory } from '@/mocks/admin-finance'
import { panel } from '../styles'
import { DarkBadge, PageHead, Panel, SuperOnly } from '../ui'

const p = 'adminPages.capital'
const toNum = (v: string) => Number(v.replaceAll(',', '').replace('¥', '')) || 0

function Line({ label, sub, diff, children }: { label: string; sub?: string; diff: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-divider py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm">{label}</div>
        {sub && <div className="text-xs text-muted-foreground tabular-nums">{sub}</div>}
      </div>
      {children}
      <span className={cn('w-16 text-right text-xs tabular-nums', diff >= 0 ? 'text-success' : 'text-destructive')}>
        {diff >= 0 ? '+' : '-'}¥{Math.abs(diff).toLocaleString('ko-KR')}
      </span>
    </div>
  )
}

function Money({ value, onChange, readOnly }: { value: number; onChange?: (v: number) => void; readOnly?: boolean }) {
  return (
    <Input
      value={`¥${cny(value)}`}
      readOnly={readOnly || !onChange}
      onChange={(e) => onChange?.(toNum(e.target.value))}
      className={cn('h-10 w-40 text-right font-bold tabular-nums', value < 0 && 'text-destructive', (readOnly || !onChange) && 'bg-muted')}
    />
  )
}

function Total({ label, value }: { label: string; value: number }) {
  return (
    <div className="mt-4 flex items-center justify-between rounded-xl bg-foreground px-5 py-4 text-background">
      <b>{label}</b>
      <span className="text-2xl font-extrabold tabular-nums">¥{cny(value)}</span>
    </div>
  )
}

/** 자본금정산 (최고관리자 전용): 자본금 토탈 − 보유 인민폐 토탈 = 차이 (0에 가까울수록 정상) */
export default function CapitalSettlement() {
  const { t } = useTranslation()
  const c = capitalCurrent
  const [month, setMonth] = useState(c.month)
  const readOnly = month !== c.month
  // TODO(API): 자본금정산 조회·저장·확정. 지금은 화면 안에서만 바뀐다
  const [capital, setCapital] = useState(c.capital.map((x) => x.value))
  const [rate, setRate] = useState(c.rate)
  const [banks, setBanks] = useState(c.banks.map((x) => x.value))

  const capitalTotal = capital.reduce((s, v) => s + v, 0)
  const krwYuan = c.krwHoldings.map((h) => h.krw / (rate || 1))
  const cashTotal = krwYuan.reduce((s, v) => s + v, 0) + banks.reduce((s, v) => s + v, 0)
  const diff = capitalTotal - cashTotal
  // 게이지: ±20,000 위안 범위에서 차이 위치
  const pos = Math.min(Math.max(50 + (diff / 20000) * 50, 2), 98)
  const [, m] = c.month.split('-')

  return (
    <SuperOnly>
      <PageHead
        title={t(`${p}.title`)}
        badge={<DarkBadge>{t('adminPages.superBadge')}</DarkBadge>}
        desc={t(`${p}.desc`)}
        actions={
          <>
            <Button variant="outline" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.newMonth`)}</Button>
            <Button variant="outline" className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950 dark:text-violet-300" onClick={() => toast(t('common.comingSoon'))}>
              {t(`${p}.aiDiff`)}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {capitalHistory.slice(0, 5).map((h) => {
          const [y, mm] = h.month.split('-')
          const active = month === h.month
          return (
            <button
              key={h.month}
              type="button"
              aria-pressed={active}
              onClick={() => setMonth(h.month)}
              className={cn('flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold', active ? 'border-foreground bg-foreground text-background' : 'bg-card hover:bg-muted')}
            >
              {h.month === c.month ? t(`${p}.month`, { year: y, month: Number(mm) }) : t(`${p}.shortMonth`, { month: Number(mm) })}
              <span className={cn('rounded px-1.5 text-[11px]', h.state === 'draft' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success')}>
                {t(`${p}.${h.state === 'draft' ? 'drafting' : 'confirmed'}`)}
              </span>
            </button>
          )
        })}
        <Link to="/admin/finance/capital/history" className="flex items-center rounded-lg border bg-card px-3.5 py-2 text-sm font-semibold text-primary hover:bg-muted">
          {t(`${p}.allHistory`)}
        </Link>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel title={t(`${p}.capital`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.vsPrev`)}</span>}>
          {c.capital.map((x, i) => (
            <Line key={x.key} label={t(`${p}.items.${x.key as 'purchaseMargin'}`)} diff={x.diff}>
              <Money value={capital[i]} readOnly={readOnly} onChange={(v) => setCapital((l) => l.map((y, j) => (j === i ? v : y)))} />
            </Line>
          ))}
          <Total label={t(`${p}.capitalTotal`)} value={capitalTotal} />
        </Panel>

        <Panel title={t(`${p}.cash`)} action={<span className="text-xs text-muted-foreground">{t(`${p}.vsPrev`)}</span>}>
          <div className="mb-3 flex items-center justify-between rounded-xl bg-warning-subtle/60 px-4 py-3 ring-1 ring-warning/30">
            <span className="text-sm">
              {t(`${p}.rate`)} <span className="text-xs text-muted-foreground">{t(`${p}.rateHint`)}</span>
            </span>
            <Input value={rate} readOnly={readOnly} onChange={(e) => setRate(toNum(e.target.value))} aria-label={t(`${p}.rate`)} className="h-10 w-28 text-right font-bold tabular-nums" />
          </div>
          <div className="flex justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t(`${p}.krw`)}</span>
            <span>{t(`${p}.krwHint`)}</span>
          </div>
          {c.krwHoldings.map((h, i) => (
            <Line key={h.key} label={t(`${p}.holdings.${h.key as 'taeramKrw'}`)} sub={`₩${h.krw.toLocaleString('ko-KR')}`} diff={h.diff}>
              <Money value={krwYuan[i]} />
            </Line>
          ))}
          <div className="mt-3 flex justify-between rounded-lg bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>{t(`${p}.banks`)}</span>
            <span>{t(`${p}.banksHint`)}</span>
          </div>
          {c.banks.map((b, i) => (
            <Line key={b.key} label={t(`${p}.bankItems.${b.key as 'taeramBank'}`)} diff={b.diff}>
              <Money value={banks[i]} readOnly={readOnly} onChange={(v) => setBanks((l) => l.map((y, j) => (j === i ? v : y)))} />
            </Line>
          ))}
          <Total label={t(`${p}.cashTotal`)} value={cashTotal} />
        </Panel>
      </div>

      <section className={cn(panel, 'mt-4 flex flex-wrap items-center gap-6 p-6')}>
        <div>
          <div className="text-sm text-muted-foreground">{t(`${p}.capitalTotal`)}</div>
          <div className="text-2xl font-extrabold tabular-nums">¥{cny(capitalTotal)}</div>
        </div>
        <span className="text-xl text-muted-foreground">−</span>
        <div>
          <div className="text-sm text-muted-foreground">{t(`${p}.cashTotal`)}</div>
          <div className="text-2xl font-extrabold tabular-nums">¥{cny(cashTotal)}</div>
        </div>
        <span className="text-xl text-muted-foreground">=</span>
        <div className="min-w-48 flex-1">
          <div className="relative h-2 rounded-full bg-gradient-to-r from-danger-subtle via-success-soft to-danger-subtle">
            <span className="absolute -top-1 h-4 w-1 rounded bg-foreground" style={{ left: `${pos}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>−</span>
            {t(`${p}.diffHint`)}
            <span>+</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">{t(`${p}.diff`)}</div>
          <div className={cn('text-3xl font-extrabold tabular-nums', Math.abs(diff) > 5000 ? 'text-warning' : 'text-success')}>¥{signed(diff).replace('+', '')}</div>
        </div>
      </section>

      {!readOnly && (
        <section className={cn(panel, 'mt-4 flex flex-wrap items-center gap-3 p-5')}>
          <p className="min-w-0 flex-1 text-[13px] text-muted-foreground">{t(`${p}.footer`, { writer: c.writer })}</p>
          <Button variant="outline" className="h-11" onClick={() => toast.success(t('adminPages.draftSaved'))}>{t('adminPages.saveDraft')}</Button>
          <Button className="h-11 bg-foreground px-5 font-bold text-background hover:bg-foreground/90" onClick={() => toast.success(t(`${p}.confirmedToast`))}>
            {t(`${p}.confirmMonth`, { month: Number(m) })}
          </Button>
        </section>
      )}
    </SuperOnly>
  )
}
