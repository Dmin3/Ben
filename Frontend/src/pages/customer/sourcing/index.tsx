import { ImageIcon, Search, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { FilterChips } from '@/components/filter-chips'
import { Stepper } from '@/components/stepper'
import { Swatch } from '@/components/swatch'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { MARKETS, type Market, type SourcingItem } from '@/mocks/sourcing'
import { newLineId, useCart, useSetCart, useSourcingItems } from './data'

function Pills<T extends string>({ label, options, value, onChange, render }: {
  label: string
  options: T[]
  value: T
  onChange: (v: T) => void
  render?: (v: T) => React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="text-[13px] font-semibold">{label}</div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={cn('flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold', value === o ? 'border-primary bg-primary-soft text-primary' : 'hover:bg-muted')}
          >
            {render ? render(o) : o}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 컬러·사이즈·수량을 골라 장바구니에 담는다. 같은 컬러·사이즈가 있으면 수량을 더한다 */
function AddDialog({ item, onClose }: { item: SourcingItem; onClose: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCart = useSetCart()
  const [color, setColor] = useState(item.colors[0].name)
  const [size, setSize] = useState(item.sizes[0])
  const [qty, setQty] = useState(10)

  const add = () => {
    setCart((cart) => {
      const entry = cart.find((e) => e.itemId === item.id)
      if (!entry) return [...cart, { itemId: item.id, checked: true, note: '', lines: [{ id: newLineId(), color, size, qty, checked: true }] }]
      return cart.map((e) => {
        if (e !== entry) return e
        const same = e.lines.find((l) => l.color === color && l.size === size)
        const lines = same
          ? e.lines.map((l) => (l === same ? { ...l, qty: l.qty + qty, checked: true } : l))
          : [...e.lines, { id: newLineId(), color, size, qty, checked: true }]
        return { ...e, checked: true, lines }
      })
    })
    toast.success(t('sourcing.added', { code: item.code }), { action: { label: t('sourcing.viewCart'), onClick: () => navigate('/sourcing/cart') } })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.code}</DialogTitle>
          <DialogDescription>
            {t(`sourcing.markets.${item.market}`)} · {item.shop} · {yuan(item.price)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Pills label={t('sourcing.color')} options={item.colors.map((c) => c.name)} value={color} onChange={setColor} render={(name) => <><Swatch hex={item.colors.find((c) => c.name === name)!.hex} />{name}</>} />
          <Pills label={t('sourcing.size')} options={item.sizes} value={size} onChange={setSize} />
          <div className="space-y-2">
            <div className="text-[13px] font-semibold">{t('sourcing.qty')}</div>
            <Stepper value={qty} onChange={setQty} label={t('sourcing.qty')} />
          </div>
          {item.memo && <p className="rounded-lg bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">{item.memo}</p>}
        </div>
        <DialogFooter>
          <div className="mr-auto self-center text-sm">
            {t('sourcing.amount')} <b className="tabular-nums">{yuan(item.price * qty)}</b>
          </div>
          <Button className="h-10 px-5 font-semibold" onClick={add}>
            <ShoppingCart /> {t('sourcing.addToCart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** 사입: BEN이 시장에서 대신 사 오는 품목. 골라서 장바구니에 담는다 */
export default function Sourcing() {
  const { t } = useTranslation()
  const { data: items = [] } = useSourcingItems()
  const { data: cart = [] } = useCart()
  const [market, setMarket] = useState<Market | 'all'>('all')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState<SourcingItem | null>(null)

  const q = query.trim().toLowerCase()
  const rows = items.filter((i) => (market === 'all' || i.market === market) && (!q || [i.code, i.shop].some((v) => v.toLowerCase().includes(q))))
  const chips = (['all', ...MARKETS] as const).map((m) => ({
    value: m,
    label: m === 'all' ? t('sourcing.all') : t(`sourcing.markets.${m}`),
    count: items.filter((i) => m === 'all' || i.market === m).length,
  }))

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold">{t('nav.sourcing')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('sourcing.desc')}</p>
        </div>
        <Button variant="outline" className="h-10" nativeButton={false} render={<Link to="/sourcing/cart" />}>
          <ShoppingCart /> {t('sourcing.cart')} <b className="text-primary tabular-nums">{cart.length}</b>
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('sourcing.searchPlaceholder')} aria-label={t('sourcing.searchPlaceholder')} className="h-9 pl-9" />
        </div>
        <FilterChips options={chips} value={market} onChange={setMarket} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-border">{t('sourcing.empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((i) => (
            <article key={i.id} className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 bg-muted text-xs text-subtle-foreground">
                <ImageIcon className="size-5" />
                {t('products.photo')}
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-[15px] font-bold">{i.code}</h2>
                    <b className="tabular-nums">{yuan(i.price)}</b>
                  </div>
                  <div className="text-xs text-muted-foreground">{t(`sourcing.markets.${i.market}`)} · {i.shop}</div>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  {i.colors.map((c) => (
                    <span key={c.name} className="flex items-center gap-1"><Swatch hex={c.hex} />{c.name}</span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('sourcing.size')} {i.sizes.join(' · ')}
                  {i.moq && ` · MOQ ${i.moq}`}
                  {i.lead && ` · ${t('sourcing.lead', { lead: i.lead })}`}
                </div>
                {i.memo && <p className="text-xs text-foreground/80">{i.memo}</p>}
                <Button className="mt-auto h-10 w-full font-semibold" onClick={() => setAdding(i)}>
                  <ShoppingCart /> {t('sourcing.addToCart')}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {adding && <AddDialog item={adding} onClose={() => setAdding(null)} />}
    </div>
  )
}
