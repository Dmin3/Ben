import { useTranslation } from 'react-i18next'
import { Controller, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categories } from '@/mocks/new-order'
import { Field } from '@/components/form/field'
import { Section } from './form-parts'
import type { NewOrderForm } from './schema'

// 오늘 날짜 (YYYY-MM-DD). 날짜 입력의 min 값
const todayISO = () => new Date().toLocaleDateString('sv-SE')

export function BasicInfoSection() {
  const { t } = useTranslation()
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewOrderForm>()

  return (
    <Section step={1} title={t('newOrder.sections.basic.title')} description={t('newOrder.sections.basic.description')}>
      <Field label={t('newOrder.fields.productName')} htmlFor="productName" required error={errors.productName?.message}>
        <Input id="productName" placeholder={t('newOrder.fields.productNamePlaceholder')} {...register('productName')} aria-invalid={!!errors.productName} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('newOrder.fields.category')} required error={errors.category?.message}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select items={categories} value={field.value || null} onValueChange={(v) => field.onChange(v ?? '')}>
                <SelectTrigger ref={field.ref} className="w-full bg-card px-3 data-[size=default]:h-10" aria-invalid={!!errors.category}>
                  <SelectValue placeholder={t('newOrder.fields.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          label={t('newOrder.fields.dueDate')}
          htmlFor="dueDate"
          hint={<span className="font-normal text-muted-foreground">{t('newOrder.fields.dueDateHint')}</span>}
          required
          error={errors.dueDate?.message}
        >
          {/* max가 없으면 Chrome이 연도를 6자리까지 받아서, 숫자를 이어 치면 날짜가 깨진다 */}
          <Input id="dueDate" type="date" min={todayISO()} max="9999-12-31" {...register('dueDate')} aria-invalid={!!errors.dueDate} />
        </Field>
      </div>

      <Field label={t('newOrder.fields.internalCode')} htmlFor="internalCode" className="sm:w-1/2 sm:pr-2">
        <Input id="internalCode" placeholder={t('newOrder.fields.internalCodePlaceholder')} {...register('internalCode')} />
      </Field>
    </Section>
  )
}
