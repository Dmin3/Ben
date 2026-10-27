import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/form/field'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { companyInfo } from '@/mocks/my-info'
import { DialogForm, EditButton, InfoRow } from './info-parts'
import { companySchema, type CompanyForm } from './schema'

export function CompanyCard() {
  const { t } = useTranslation()
  // TODO(API): 회사 정보 조회/수정 API로 교체
  const [info, setInfo] = useState<CompanyForm>(companyInfo)
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.company.title')}</CardTitle>
        <CardAction>
          <EditButton onClick={() => setOpen(true)} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label={t('myInfo.company.name')}>
            <span className="font-bold">{info.name}</span>
          </InfoRow>
          <InfoRow label={t('myInfo.company.nameEn')}>{info.nameEn}</InfoRow>
          <InfoRow label={t('myInfo.company.businessNo')}>
            <span className="tabular-nums">{info.businessNo}</span>
          </InfoRow>
          <InfoRow label={t('myInfo.company.ceo')}>{info.ceo}</InfoRow>
          <InfoRow label={t('myInfo.company.businessType')}>{info.businessType}</InfoRow>
          <InfoRow label={t('myInfo.company.address')}>{info.address}</InfoRow>
          <InfoRow label={t('myInfo.company.certificate')}>
            <button type="button" className="font-semibold text-primary hover:underline">
              {info.certificate}
            </button>
          </InfoRow>
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <CompanyEditForm
            value={info}
            onSave={(v) => {
              setInfo(v)
              setOpen(false)
              toast.success(t('myInfo.company.saved'))
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CompanyEditForm({ value, onSave }: { value: CompanyForm; onSave: (v: CompanyForm) => void }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CompanyForm>({ resolver: zodResolver(companySchema), defaultValues: value })
  const certificate = useWatch({ control, name: 'certificate' })

  return (
    <DialogForm title={t('myInfo.company.editTitle')} onSubmit={handleSubmit(onSave)}>
      <Field label={t('myInfo.company.name')} htmlFor="c-name" required error={errors.name?.message}>
        <Input id="c-name" {...register('name')} aria-invalid={!!errors.name} />
      </Field>
      <Field label={t('myInfo.company.nameEn')} htmlFor="c-nameEn" required error={errors.nameEn?.message}>
        <Input id="c-nameEn" {...register('nameEn')} aria-invalid={!!errors.nameEn} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('myInfo.company.businessNo')} htmlFor="c-businessNo" required error={errors.businessNo?.message}>
          <Input id="c-businessNo" inputMode="numeric" placeholder="000-00-00000" {...register('businessNo')} aria-invalid={!!errors.businessNo} />
        </Field>
        <Field label={t('myInfo.company.ceo')} htmlFor="c-ceo" required error={errors.ceo?.message}>
          <Input id="c-ceo" {...register('ceo')} aria-invalid={!!errors.ceo} />
        </Field>
      </div>
      <Field label={t('myInfo.company.businessType')} htmlFor="c-type" required error={errors.businessType?.message}>
        <Input id="c-type" {...register('businessType')} aria-invalid={!!errors.businessType} />
      </Field>
      <Field label={t('myInfo.company.address')} htmlFor="c-address" required error={errors.address?.message}>
        <Input id="c-address" {...register('address')} aria-invalid={!!errors.address} />
      </Field>
      <Field label={t('myInfo.company.certificate')}>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted">
          <span className="truncate text-sm">{certificate}</span>
          <span className="shrink-0 text-xs font-semibold text-primary">{t('myInfo.company.changeFile')}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            aria-label={t('myInfo.company.changeFileAria')}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              // TODO(API): 파일 업로드 후 서버 파일 정보로 교체
              if (file) setValue('certificate', file.name, { shouldDirty: true })
            }}
          />
        </label>
      </Field>
    </DialogForm>
  )
}
