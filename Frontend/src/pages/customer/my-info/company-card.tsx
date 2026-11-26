import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/form/field'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { patchJson } from '@/lib/api'
import { useSaveMyInfo, type MyInfo } from './data'
import { DialogForm, EditButton, InfoRow } from './info-parts'
import { companySchema, type CompanyForm } from './schema'

type Company = MyInfo['company']

export function CompanyCard({ company, canEdit }: { company: Company; canEdit: boolean }) {
  const { t } = useTranslation()
  const save = useSaveMyInfo()
  const [open, setOpen] = useState(false)

  const onSave = async (v: CompanyForm) => {
    const ok = await save(
      patchJson('/api/my-info/company', {
        name: v.name,
        nameEn: v.nameEn || null,
        ceoName: v.ceo || null,
        businessType: v.businessType || null,
        address: v.address || null,
      }),
    )
    if (!ok) return
    setOpen(false)
    toast.success(t('myInfo.company.saved'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.company.title')}</CardTitle>
        {canEdit && (
          <CardAction>
            <EditButton onClick={() => setOpen(true)} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label={t('myInfo.company.name')}>
            <span className="font-bold">{company.name}</span>
          </InfoRow>
          <InfoRow label={t('myInfo.company.nameEn')}>{company.nameEn ?? '-'}</InfoRow>
          <InfoRow label={t('myInfo.company.businessNo')}>
            <span className="tabular-nums">{company.businessNo ?? '-'}</span>
          </InfoRow>
          <InfoRow label={t('myInfo.company.ceo')}>{company.ceoName ?? '-'}</InfoRow>
          <InfoRow label={t('myInfo.company.businessType')}>{company.businessType ?? '-'}</InfoRow>
          <InfoRow label={t('myInfo.company.address')}>{company.address ?? '-'}</InfoRow>
          {/* ponytail: 사업자등록증 업로드 API가 아직 없어 표시만. 업로드 API가 생기면 수정 창에 파일 선택을 다시 넣는다 */}
          <InfoRow label={t('myInfo.company.certificate')}>{company.certificate ?? '-'}</InfoRow>
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <CompanyEditForm value={company} onSave={onSave} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CompanyEditForm({ value, onSave }: { value: Company; onSave: (v: CompanyForm) => Promise<void> }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: value.name,
      nameEn: value.nameEn ?? '',
      ceo: value.ceoName ?? '',
      businessType: value.businessType ?? '',
      address: value.address ?? '',
    },
  })

  return (
    <DialogForm title={t('myInfo.company.editTitle')} onSubmit={handleSubmit(onSave)}>
      <Field label={t('myInfo.company.name')} htmlFor="c-name" required error={errors.name?.message}>
        <Input id="c-name" {...register('name')} aria-invalid={!!errors.name} />
      </Field>
      <Field label={t('myInfo.company.nameEn')} htmlFor="c-nameEn" error={errors.nameEn?.message}>
        <Input id="c-nameEn" {...register('nameEn')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('myInfo.company.businessNo')} htmlFor="c-businessNo">
          <Input id="c-businessNo" value={value.businessNo ?? '-'} disabled readOnly aria-describedby="c-businessNo-note" />
          <p id="c-businessNo-note" className="mt-1.5 text-xs text-muted-foreground">
            {t('myInfo.company.businessNoLocked')}
          </p>
        </Field>
        <Field label={t('myInfo.company.ceo')} htmlFor="c-ceo" error={errors.ceo?.message}>
          <Input id="c-ceo" {...register('ceo')} />
        </Field>
      </div>
      <Field label={t('myInfo.company.businessType')} htmlFor="c-type" error={errors.businessType?.message}>
        <Input id="c-type" {...register('businessType')} />
      </Field>
      <Field label={t('myInfo.company.address')} htmlFor="c-address" error={errors.address?.message}>
        <Input id="c-address" {...register('address')} />
      </Field>
    </DialogForm>
  )
}
