import { useTranslation } from 'react-i18next'
import { Controller, useFormContext } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { factoryOptions } from '@/mocks/new-order'
import { Field } from '@/components/form/field'
import { chipClass, Section } from './form-parts'
import { PROCESS_TYPES, type NewOrderForm } from './schema'

export function ScopeSection() {
  const { t } = useTranslation()
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewOrderForm>()

  return (
    <Section step={4} title={t('newOrder.sections.scope.title')} description={t('newOrder.sections.scope.description')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('newOrder.fields.process')} required error={errors.process?.message}>
          <Controller
            control={control}
            name="process"
            render={({ field }) => (
              <ToggleGroup
                value={field.value ? [field.value] : []}
                onValueChange={(v) => v[0] && field.onChange(v[0])}
                aria-label={t('newOrder.fields.process')}
              >
                {PROCESS_TYPES.map((p) => (
                  <ToggleGroupItem key={p} value={p} className={chipClass}>
                    {t(`newOrder.processTypes.${p}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Field>

        <Field label={t('newOrder.fields.inspection')} htmlFor="inspection">
          <Input id="inspection" placeholder={t('newOrder.fields.inspectionPlaceholder')} {...register('inspection')} />
        </Field>
      </div>

      <Field label={t('newOrder.fields.factory')}>
        <Controller
          control={control}
          name="factory"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} aria-label={t('newOrder.fields.factory')}>
              {factoryOptions.map((f) => (
                <label
                  key={f.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted has-data-checked:border-primary has-data-checked:bg-accent"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-[10px] font-semibold text-muted-foreground">
                    {f.value === 'ben' ? t('newOrder.factoryBen.tag') : t('newOrder.factoryTag')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">{f.value === 'ben' ? t('newOrder.factoryBen.name') : f.name}</span>
                      {f.history !== undefined && <Badge variant="success">{t('newOrder.factoryHistory', { count: f.history })}</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {f.value === 'ben' ? t('newOrder.factoryBen.description') : f.description}
                    </div>
                  </div>
                  <RadioGroupItem value={f.value} />
                </label>
              ))}
            </RadioGroup>
          )}
        />
      </Field>
    </Section>
  )
}
