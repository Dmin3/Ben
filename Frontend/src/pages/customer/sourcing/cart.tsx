import { ChevronLeft, ImageIcon, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Stepper } from '@/components/stepper'
import { Swatch } from '@/components/swatch'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { num, yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { depositSummary } from '@/mocks/deposit'
import type { CartEntry, CartLine, SourcingItem } from '@/mocks/sourcing'
import { newLineId, useCart, useSetCart, useSourcingItems } from './data'

const box = 'rounded-2xl bg-card ring-1 ring-border'

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} className="size-5 shrink-0 accent-primary" />
}

function Choose({ value, options, onChange, label, swatch }: { value: string; options: string[]; onChange: (v: string) => void; label: string; swatch?: (v: string) => string }) {
  const items = options.map((o) => ({ value: o, label: o }))
  return (
    <Select items={items} value={value} onValueChange={(v) => v && onChange(v as string)}>
      <SelectTrigger aria-label={label} className="h-10 w-full bg-card">
        <span className="flex items-center gap-2">
          {swatch && <Swatch hex={swatch(value)} />}
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** 품목 하나: 머리줄(체크·사진·품번·금액) + 컬러·사이즈·수량 줄 + 요청 사항 */
function EntryCard({ entry, item, update, remove }: {
  entry: CartEntry
  item: SourcingItem
  update: (e: CartEntry) => void
  remove: () => void
}) {
  const { t } = useTranslation()
  // 품목 머리줄은 이 품목에 담은 전체 수량 (주문할 줄 선택은 오른쪽 요약에 반영)
  const qty = entry.lines.reduce((s, l) => s + l.qty, 0)
  const hexOf = (name: string) => item.colors.find((c) => c.name === name)?.hex ?? '#ccc'
  const setLine = (id: string, patch: Partial<CartLine>) => update({ ...entry, lines: entry.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) })
  const removeLine = (id: string) => {
    const lines = entry.lines.filter((l) => l.id !== id)
    if (lines.length) update({ ...entry, lines })
    else remove()
  }

  return (
    <article className={cn(box, 'overflow-hidden', !entry.checked && 'opacity-75')}>
      <header className="flex items-center gap-4 p-4">
        <Check
          checked={entry.checked}
          onChange={(v) => update({ ...entry, checked: v, lines: entry.lines.map((l) => ({ ...l, checked: v })) })}
          label={t('sourcing.cartPage.selectItem', { code: item.code })}
        />
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-subtle-foreground">
          <ImageIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-bold">{item.code}</div>
          <div className="text-xs text-muted-foreground">{t(`sourcing.markets.${item.market}`)} · {item.shop} · {item.sizes.join(' ')}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground tabular-nums">{t('sourcing.cartPage.qtyUnit', { qty: num(qty), price: yuan(item.price) })}</div>
          <div className="text-xl font-extrabold tabular-nums">{yuan(qty * item.price)}</div>
        </div>
        <button type="button" onClick={remove} className="text-[13px] text-muted-foreground hover:text-destructive">{t('common.delete')}</button>
      </header>

      <div className="border-t">
        <div className="hidden grid-cols-[28px_1fr_1fr_128px_88px_24px] gap-3 bg-muted/40 px-4 py-2 text-xs text-subtle-foreground sm:grid">
          <span />
          <span>{t('sourcing.color')}</span>
          <span>{t('sourcing.size')}</span>
          <span>{t('sourcing.qty')}</span>
          <span className="text-right">{t('sourcing.amount')}</span>
          <span />
        </div>
        {entry.lines.map((l) => (
          <div key={l.id} className="grid grid-cols-[28px_1fr_1fr] items-center gap-3 border-t border-divider px-4 py-2.5 sm:grid-cols-[28px_1fr_1fr_128px_88px_24px]">
            <Check checked={l.checked} onChange={(v) => setLine(l.id, { checked: v })} label={`${l.color} ${l.size}`} />
            <Choose label={t('sourcing.color')} value={l.color} options={item.colors.map((c) => c.name)} onChange={(v) => setLine(l.id, { color: v })} swatch={hexOf} />
            <Choose label={t('sourcing.size')} value={l.size} options={item.sizes} onChange={(v) => setLine(l.id, { size: v })} />
            <div className="col-start-2 sm:col-start-auto">
              <Stepper value={l.qty} onChange={(v) => setLine(l.id, { qty: v })} label={t('sourcing.qty')} />
            </div>
            <span className="text-right text-sm font-bold tabular-nums">{yuan(l.qty * item.price)}</span>
            <button type="button" aria-label={t('sourcing.cartPage.removeLine')} onClick={() => removeLine(l.id)} className="justify-self-end text-muted-foreground hover:text-destructive">
              <X className="size-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-divider px-4 py-3">
          <button
            type="button"
            onClick={() => update({ ...entry, lines: [...entry.lines, { id: newLineId(), color: item.colors[0].name, size: item.sizes[0], qty: 1, checked: true }] })}
            className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
          >
            <Plus className="size-3.5" /> {t('sourcing.cartPage.addLine')}
          </button>
          <span className="text-[13px] text-muted-foreground">{item.moq ? `MOQ ${item.moq}` : t('sourcing.cartPage.noMoq')}</span>
        </div>
        <label className="flex items-center gap-3 border-t border-divider px-4 py-3 text-[13px]">
          <span className="shrink-0 text-muted-foreground">{t('sourcing.cartPage.note')}</span>
          {/* 한글 조합이 끊기지 않게 입력 중에는 캐시를 건드리지 않고, 칸을 벗어날 때 저장 */}
          <Input defaultValue={entry.note} onBlur={(e) => update({ ...entry, note: e.target.value })} placeholder={t('sourcing.cartPage.notePlaceholder')} className="h-10" />
        </label>
      </div>
    </article>
  )
}

/** 장바구니: 체크한 품목·줄만 주문한다. 주문하면 예치금에서 차감 */
export default function SourcingCart() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: items = [] } = useSourcingItems()
  const { data: cart = [] } = useCart()
  const setCart = useSetCart()
  const [shipping, setShipping] = useState<'sea' | 'air'>('sea')

  const itemOf = (id: string) => items.find((i) => i.id === id)
  const chosen = cart.filter((e) => e.checked && itemOf(e.itemId)).map((e) => ({ e, lines: e.lines.filter((l) => l.checked), item: itemOf(e.itemId)! }))
  const lineCount = chosen.reduce((s, c) => s + c.lines.length, 0)
  const qty = chosen.reduce((s, c) => s + c.lines.reduce((a, l) => a + l.qty, 0), 0)
  const total = chosen.reduce((s, c) => s + c.lines.reduce((a, l) => a + l.qty * c.item.price, 0), 0)
  // TODO(API): 실제 예치금 잔액
  const balance = depositSummary.balance
  const short = total > balance
  const allChecked = cart.length > 0 && cart.every((e) => e.checked)

  const update = (next: CartEntry) => setCart((list) => list.map((e) => (e.itemId === next.itemId ? next : e)))
  const remove = (itemId: string) => setCart((list) => list.filter((e) => e.itemId !== itemId))
  const order = () => {
    // TODO(API): 사입 주문 생성 + 예치금 차감 (바로 차감인지 승인 후 차감인지 BE와 결정)
    setCart((list) =>
      list
        .map((e) => (e.checked ? { ...e, lines: e.lines.filter((l) => !l.checked) } : e))
        .filter((e) => e.lines.length > 0)
        .map((e) => ({ ...e, checked: e.lines.every((l) => l.checked) && e.checked })),
    )
    toast.success(t('sourcing.cartPage.ordered', { count: chosen.length }))
    navigate('/tasks')
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold">{t('sourcing.cart')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('sourcing.cartPage.desc')}</p>
        </div>
        <Link to="/sourcing" className={cn(buttonVariants({ variant: 'outline' }), 'h-10')}>
          <ChevronLeft /> {t('sourcing.cartPage.addMore')}
        </Link>
      </header>

      {cart.length === 0 ? (
        <div className={cn(box, 'space-y-3 py-16 text-center')}>
          <p className="text-sm text-muted-foreground">{t('sourcing.cartPage.empty')}</p>
          <Link to="/sourcing" className={buttonVariants()}>{t('sourcing.cartPage.goShop')}</Link>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            <div className={cn(box, 'flex items-center gap-3 px-4 py-3')}>
              <Check
                checked={allChecked}
                onChange={(v) => setCart((list) => list.map((e) => ({ ...e, checked: v, lines: e.lines.map((l) => ({ ...l, checked: v })) })))}
                label={t('sourcing.cartPage.selectAll')}
              />
              <span className="text-sm">
                <b>{t('sourcing.cartPage.selected', { count: chosen.length })}</b>
                <span className="text-muted-foreground"> / {t('sourcing.cartPage.total', { count: cart.length })}</span>
              </span>
              <button type="button" onClick={() => setCart((list) => list.filter((e) => !e.checked))} className="ml-auto text-[13px] text-muted-foreground hover:text-destructive">
                {t('sourcing.cartPage.deleteSelected')}
              </button>
            </div>
            {cart.map((e) => {
              const item = itemOf(e.itemId)
              return item ? <EntryCard key={e.itemId} entry={e} item={item} update={update} remove={() => remove(e.itemId)} /> : null
            })}
          </div>

          <aside className={cn(box, 'divide-y lg:sticky lg:top-6')}>
            <div className="p-5 text-base font-bold">{t('sourcing.cartPage.summary')}</div>
            <dl className="space-y-3 p-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('sourcing.cartPage.items')}</dt><dd className="font-bold">{t('sourcing.cartPage.itemsValue', { count: chosen.length, lines: lineCount })}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('sourcing.qty')}</dt><dd className="font-bold tabular-nums">{t('units.pcs', { qty: num(qty) })}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">{t('sourcing.cartPage.goods')}</dt><dd className="font-bold tabular-nums">{yuan(total)}</dd></div>
              <div className="space-y-2 pt-1">
                <dt className="text-muted-foreground">{t('sourcing.cartPage.shipping')}</dt>
                <dd role="radiogroup" className="grid grid-cols-2 overflow-hidden rounded-lg border">
                  {(['sea', 'air'] as const).map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={shipping === s} onClick={() => setShipping(s)} className={cn('py-2.5 text-[13px] font-semibold', shipping === s ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:bg-muted')}>
                      {t(`sourcing.cartPage.ship.${s}`)}
                    </button>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="space-y-3 p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-bold">{t('sourcing.cartPage.pay')}</span>
                <span className="text-[28px] font-extrabold text-primary tabular-nums">{yuan(total)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">{t('sourcing.cartPage.deposit', { amount: yuan(balance) })}</span>
                <b className={cn('tabular-nums', short ? 'text-destructive' : 'text-success')}>{yuan(balance - total)}</b>
              </div>
              {short && (
                <p className="rounded-lg bg-danger-subtle px-3 py-2 text-[13px] text-destructive">
                  {t('sourcing.cartPage.short', { amount: yuan(total - balance) })}{' '}
                  <Link to="/deposit" className="font-semibold underline">{t('home.deposit.charge')}</Link>
                </p>
              )}
              <Button className="h-14 w-full text-base font-bold" disabled={!chosen.length || short} onClick={order}>
                {t('sourcing.cartPage.order', { count: chosen.length })}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{t('sourcing.cartPage.orderHint')}</p>
            </div>
            <div className="space-y-2.5 p-5">
              <div className="text-sm font-bold">{t('sourcing.cartPage.after')}</div>
              <ol className="space-y-2 text-[13px]">
                {(['1', '2', '3'] as const).map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">{n}</span>
                    {t(`sourcing.cartPage.afterSteps.s${n}`)}
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
