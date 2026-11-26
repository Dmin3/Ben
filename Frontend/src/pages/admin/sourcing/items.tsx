import { Ellipsis, Plus, Search, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Swatch } from '@/components/swatch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { MARKETS, type Market, type SourcingColor, type SourcingItem } from '@/mocks/sourcing'
import { useSaveSourcingItem, useSourcingItems } from '../../customer/sourcing/data'
import { panel } from '../styles'
import { PageHead, Pick } from '../ui'

const p = 'adminPages.sourcing'
const SIZE_PRESETS = ['F', 'S', 'M', 'L', 'XL']
const PAGE_SIZE = 5

type Form = Omit<SourcingItem, 'id' | 'price'> & { id?: string; price: string }
const EMPTY: Form = { code: '', market: 'wanjia', shop: '', sizes: [], colors: [], price: '', moq: '', lead: '', memo: '', photos: 0 }

function Row({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-t py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
      <div>
        <div className="text-sm font-bold">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Chip({ active, onClick, children, onRemove, removeLabel }: { active?: boolean; onClick?: () => void; children: ReactNode; onRemove?: () => void; removeLabel?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold',
        active ? 'border-primary bg-primary-soft text-primary' : 'bg-card text-foreground/80',
      )}
    >
      {onClick ? (
        <button type="button" onClick={onClick} aria-pressed={active}>
          {children}
        </button>
      ) : (
        children
      )}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={removeLabel} className="hover:text-destructive">
          <X className="size-3.5" />
        </button>
      )}
    </span>
  )
}

/** 왼쪽: 품목 등록·수정 폼 */
function ItemForm({ form, setForm, onReset }: { form: Form; setForm: (f: Form) => void; onReset: () => void }) {
  const { t } = useTranslation()
  const save = useSaveSourcingItem()
  const [sizeInput, setSizeInput] = useState('')
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#1f2430')
  const editing = !!form.id
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm({ ...form, [k]: v })

  const toggleSize = (s: string) => set('sizes', form.sizes.includes(s) ? form.sizes.filter((x) => x !== s) : [...form.sizes, s])
  const addSize = () => {
    const s = sizeInput.trim().toUpperCase()
    if (s && !form.sizes.includes(s)) set('sizes', [...form.sizes, s])
    setSizeInput('')
  }
  const addColor = () => {
    const name = colorName.trim()
    if (!name || form.colors.some((c) => c.name === name)) return
    set('colors', [...form.colors, { name, hex: colorHex }])
    setColorName('')
  }

  // TODO(API): 품목 등록·수정, 사진 업로드
  const submit = (asNew: boolean) => {
    const price = Number(form.price)
    if (!form.code.trim() || !form.shop.trim() || !form.sizes.length || !form.colors.length || !price) {
      return toast.error(t(`${p}.required`))
    }
    const item: SourcingItem = { ...form, id: asNew || !form.id ? `s${Date.now()}` : form.id, price, code: form.code.trim(), shop: form.shop.trim() }
    save(item)
    toast.success(t(asNew ? `${p}.registered` : `${p}.updated`, { code: item.code }))
    onReset()
  }

  return (
    <section className={cn(panel, 'p-5', editing && 'ring-2 ring-primary')}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">{t(`${p}.formTitle`)}</h2>
        {editing && <Badge variant="info">{t(`${p}.editing`, { code: form.code })}</Badge>}
      </div>

      <div className="space-y-2 pb-4">
        <div className="text-sm font-bold">
          {t(`${p}.photos`)} <span className="text-xs font-normal text-muted-foreground">{t(`${p}.photosHint`)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: form.photos }, (_, i) => (
            <div key={i} className="relative flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-xs text-subtle-foreground">
              {i === 0 && <span className="absolute top-2 left-2 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">{t(`${p}.cover`)}</span>}
              {t(`${p}.photoN`, { n: i + 1 })}
              <button
                type="button"
                aria-label={t(`${p}.removePhoto`)}
                onClick={() => set('photos', form.photos - 1)}
                className="absolute top-2 right-2 rounded-full bg-foreground/60 p-0.5 text-background hover:bg-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {form.photos < 3 && (
            // TODO(API): 실제 업로드. 지금은 장수만 늘린다
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-[13px] text-primary hover:bg-muted/50">
              <Plus className="size-4" />
              <span className="font-semibold">{t(`${p}.addPhoto`)}</span>
              <span className="text-[11px] text-muted-foreground">{t(`${p}.dropHint`)}</span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => { if (e.target.files?.length) set('photos', Math.min(3, form.photos + 1)); e.target.value = '' }} />
            </label>
          )}
        </div>
      </div>

      <Row label={t(`${p}.market`)}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Pick label={t(`${p}.market`)} value={form.market} onChange={(v) => set('market', v as Market)} options={MARKETS.map((m) => ({ value: m, label: t(`sourcing.markets.${m}`) }))} />
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] text-muted-foreground">{t(`${p}.shop`)}</span>
            <Input className="h-10 text-right font-bold" value={form.shop} onChange={(e) => set('shop', e.target.value)} placeholder="3F221" aria-label={t(`${p}.shop`)} />
          </div>
        </div>
      </Row>
      <Row label={t(`${p}.code`)}>
        <Input className="h-10 font-bold" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="22001#" />
      </Row>
      <Row label={t(`${p}.sizes`)}>
        <div className="flex flex-wrap items-center gap-1.5">
          {[...new Set([...SIZE_PRESETS, ...form.sizes])].map((s) => (
            <Chip key={s} active={form.sizes.includes(s)} onClick={() => toggleSize(s)}>{s}</Chip>
          ))}
          <form onSubmit={(e) => { e.preventDefault(); addSize() }} className="flex items-center gap-1">
            <Input className="h-9 w-24" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder={t(`${p}.customSize`)} aria-label={t(`${p}.customSize`)} />
          </form>
        </div>
      </Row>
      <Row label={t(`${p}.colors`)}>
        <div className="flex flex-wrap items-center gap-1.5">
          {form.colors.map((c: SourcingColor) => (
            <Chip key={c.name} active removeLabel={t(`${p}.removeColor`, { name: c.name })} onRemove={() => set('colors', form.colors.filter((x) => x.name !== c.name))}>
              <Swatch hex={c.hex} /> {c.name}
            </Chip>
          ))}
          <form onSubmit={(e) => { e.preventDefault(); addColor() }} className="flex items-center gap-1">
            <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} aria-label={t(`${p}.colorPick`)} className="size-9 cursor-pointer rounded-lg border bg-card p-1" />
            <Input className="h-9 w-24" value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder={t(`${p}.colorName`)} aria-label={t(`${p}.colorName`)} />
            <Button type="submit" variant="outline" size="sm" className="h-9">{t(`${p}.add`)}</Button>
          </form>
        </div>
      </Row>
      <Row label={t(`${p}.price`)} sub={t(`${p}.priceSub`)}>
        <div className="flex items-center gap-2">
          <Input className="h-11 w-40 text-lg font-bold" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))} aria-label={t(`${p}.price`)} />
          <span className="text-sm text-muted-foreground">{t('adminPages.yuanUnit')}</span>
        </div>
      </Row>
      <Row label={t(`${p}.moqLead`)} sub={t(`${p}.optional`)}>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input className="h-10" value={form.moq ?? ''} onChange={(e) => set('moq', e.target.value)} placeholder={t(`${p}.moqPlaceholder`)} aria-label="MOQ" />
          <Input className="h-10" value={form.lead ?? ''} onChange={(e) => set('lead', e.target.value)} placeholder={t(`${p}.leadPlaceholder`)} aria-label={t(`${p}.moqLead`)} />
        </div>
      </Row>
      <Row label={t(`${p}.memo`)} sub={t(`${p}.memoSub`)}>
        <Input className="h-10" value={form.memo ?? ''} onChange={(e) => set('memo', e.target.value)} placeholder={t(`${p}.memoPlaceholder`)} />
      </Row>

      <div className="grid grid-cols-3 gap-2 border-t pt-4">
        <Button variant="outline" className="h-12" onClick={onReset}>{t('adminPages.cancel')}</Button>
        <Button variant="outline" className="h-12" disabled={!editing} onClick={() => submit(false)}>{t(`${p}.saveEdit`)}</Button>
        <Button className="h-12 font-bold" onClick={() => submit(true)}>{t(`${p}.register`)}</Button>
      </div>
    </section>
  )
}

/** 사입 품목 등록: 왼쪽 등록 폼, 오른쪽 등록된 품목(고객 사입 화면에 그대로 공개) */
export default function SourcingItems() {
  const { t } = useTranslation()
  const { data: items = [] } = useSourcingItems()
  const [form, setForm] = useState<Form>(EMPTY)
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState<Market | 'all'>('all')
  const [page, setPage] = useState(1)

  const q = query.trim().toLowerCase()
  const rows = items.filter((i) => (market === 'all' || i.market === market) && (!q || [i.code, i.shop, t(`sourcing.markets.${i.market}`)].some((v) => v.toLowerCase().includes(q))))
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const edit = (i: SourcingItem) => setForm({ ...i, price: String(i.price), moq: i.moq ?? '', lead: i.lead ?? '', memo: i.memo ?? '' })

  return (
    <div>
      <PageHead
        title={t(`${p}.title`)}
        desc={t(`${p}.desc`)}
        actions={<Button variant="outline" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.excel`)}</Button>}
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ItemForm key={form.id ?? 'new'} form={form} setForm={setForm} onReset={() => setForm(EMPTY)} />

        <section className={cn(panel, 'p-5')}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">
              {t(`${p}.listTitle`)} <span className="text-sm font-normal text-muted-foreground">{t(`${p}.listCount`, { count: items.length })}</span>
            </h2>
            <Badge variant="success">{t(`${p}.public`)}</Badge>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <div className="relative min-w-40 flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder={t(`${p}.searchPlaceholder`)} aria-label={t('adminPages.search')} className="h-10 pl-9" />
            </div>
            {(['all', ...MARKETS] as const).map((m) => (
              <Chip key={m} active={market === m} onClick={() => { setMarket(m); setPage(1) }}>
                {m === 'all' ? t('sourcing.all') : t(`sourcing.markets.${m}`)}
              </Chip>
            ))}
          </div>
          <ul className="divide-y divide-divider">
            {shown.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">{t(`${p}.empty`)}</li>}
            {shown.map((i) => {
              const current = form.id === i.id
              return (
                <li key={i.id} className={cn('flex items-center gap-3 py-3', current && '-mx-5 bg-primary-soft/40 px-5 shadow-[inset_3px_0_0_var(--primary)]')}>
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] text-subtle-foreground">
                    {t(`${p}.cover`)}
                    <span className="absolute right-0.5 bottom-0.5 rounded bg-foreground/70 px-1 text-[9px] text-background">{t(`${p}.photoCount`, { count: i.photos })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">
                      <b className="mr-1.5">{i.code}</b>
                      <span className="text-xs text-muted-foreground">{t(`sourcing.markets.${i.market}`)} · {i.shop}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {i.colors.map((c) => c.name).join(' · ')} / {i.sizes.join(' ')}
                    </div>
                  </div>
                  <b className="tabular-nums">{yuan(i.price)}</b>
                  <Button size="sm" variant="outline" className={cn(current && 'border-primary text-primary')} onClick={() => edit(i)}>
                    {current ? t(`${p}.editingShort`) : t('adminPages.edit')}
                  </Button>
                  <button type="button" aria-label={t(`${p}.more`)} onClick={() => toast(t('common.comingSoon'))} className="rounded-lg border p-1.5 text-muted-foreground hover:bg-muted">
                    <Ellipsis className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
          {pages > 1 && (
            <div className="mt-3 flex justify-center gap-1 text-sm">
              {Array.from({ length: pages }, (_, n) => (
                <button key={n} type="button" onClick={() => setPage(n + 1)} className={cn('size-8 rounded-md', page === n + 1 ? 'bg-primary-soft font-bold text-primary' : 'text-muted-foreground hover:bg-muted')}>
                  {n + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
