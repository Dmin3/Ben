import { useTranslation } from 'react-i18next'
import type { ParseKeys } from 'i18next'
import { Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Section } from './form-parts'
import type { NewOrderForm } from './schema'

const COLS = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_32px] items-start gap-2 sm:gap-4'

export function QuantitySection() {
  const { t } = useTranslation()
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewOrderForm>()
  const { fields, append, remove } = useFieldArray({ control, name: 'quantities' })
  const rows = useWatch({ control, name: 'quantities' })
  const total = rows.reduce((sum, r) => sum + (Number.isFinite(r.qty) ? r.qty : 0), 0)

  return (
    <Section step={3} title={t('newOrder.sections.quantity.title')} description={t('newOrder.sections.quantity.description')}>
      <div className="overflow-hidden rounded-xl border">
        <div className={cn(COLS, 'border-b bg-muted/60 px-3 py-2.5 text-xs font-semibold text-muted-foreground')}>
          <span>{t('newOrder.fields.color')}</span>
          <span className="text-center">{t('newOrder.fields.size')}</span>
          <span className="text-center">{t('newOrder.fields.qty')}</span>
          <span />
        </div>

        {fields.map((f, i) => {
          const e = errors.quantities?.[i]
          return (
            <div key={f.id} className={cn(COLS, 'border-b border-divider px-3 py-2')}>
              <div>
                <Input placeholder={t('newOrder.fields.colorPlaceholder')} {...register(`quantities.${i}.color`)} aria-invalid={!!e?.color} />
                {e?.color && <p className="mt-1 text-xs text-destructive">{t(e.color.message as ParseKeys)}</p>}
              </div>
              <div>
                <Input placeholder={t('newOrder.fields.sizePlaceholder')} className="text-center" {...register(`quantities.${i}.size`)} aria-invalid={!!e?.size} />
                {e?.size && <p className="mt-1 text-xs text-destructive">{t(e.size.message as ParseKeys)}</p>}
              </div>
              <div>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="0"
                  className="text-right tabular-nums"
                  {...register(`quantities.${i}.qty`, { valueAsNumber: true })}
                  aria-invalid={!!e?.qty}
                />
                {e?.qty && <p className="mt-1 text-xs text-destructive">{t(e.qty.message as ParseKeys)}</p>}
              </div>
              <button
                type="button"
                aria-label={t('newOrder.fields.deleteRow', { n: i + 1 })}
                disabled={fields.length === 1}
                onClick={() => remove(i)}
                className="mt-2.5 flex justify-center text-subtle-foreground hover:text-destructive disabled:invisible"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )
        })}

        <div className={cn(COLS, 'bg-muted/60 px-3 py-3 text-sm font-bold')}>
          <span>{t('newOrder.fields.total')}</span>
          <span />
          <span className="pr-3 text-right text-primary tabular-nums">{total.toLocaleString('ko-KR')}</span>
          <span />
        </div>
      </div>

      {errors.quantities?.root?.message && <p className="text-xs text-destructive">{t(errors.quantities.root.message as ParseKeys)}</p>}

      <Button type="button" variant="outline" onClick={() => append({ color: '', size: '', qty: NaN })}>
        {t('newOrder.fields.addRow')}
      </Button>
    </Section>
  )
}
