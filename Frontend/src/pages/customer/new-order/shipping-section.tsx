import { useTranslation } from 'react-i18next'
import { Controller, useFormContext } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { destinations } from '@/mocks/new-order'
import { Field } from '@/components/form/field'
import { chipClass, Section } from './form-parts'
import { SHIPPING_METHODS, type NewOrderForm } from './schema'

export function ShippingSection() {
  const { t } = useTranslation()
  const {
    control,
    formState: { errors },
  } = useFormContext<NewOrderForm>()

  return (
    <Section step={5} title={t('newOrder.sections.shipping.title')} description={t('newOrder.sections.shipping.description')}>
      <div className="grid gap-4 xl:grid-cols-2">
        <Field label={t('newOrder.fields.shipping')} required error={errors.shipping?.message}>
          <Controller
            control={control}
            name="shipping"
            render={({ field }) => (
              <ToggleGroup
                value={field.value ? [field.value] : []}
                onValueChange={(v) => v[0] && field.onChange(v[0])}
                aria-label={t('newOrder.fields.shipping')}
                className="flex-wrap"
              >
                {SHIPPING_METHODS.map((m) => (
                  <ToggleGroupItem key={m} value={m} className={chipClass}>
                    {t(`newOrder.shippingMethods.${m}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          />
        </Field>

        <Field label={t('newOrder.fields.destination')} required error={errors.destination?.message}>
          <Controller
            control={control}
            name="destination"
            render={({ field }) => (
              <Select items={destinations} value={field.value || null} onValueChange={(v) => field.onChange(v ?? '')}>
                <SelectTrigger ref={field.ref} className="w-full bg-card px-3 data-[size=default]:h-10" aria-invalid={!!errors.destination}>
                  <SelectValue placeholder={t('newOrder.fields.destinationPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </Section>
  )
}
