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
import { contactSchema, type ContactForm } from './schema'

export function ContactCard({ contact, canEdit }: { contact: MyInfo['contact']; canEdit: boolean }) {
  const { t } = useTranslation()
  const save = useSaveMyInfo()
  const [open, setOpen] = useState(false)

  const onSave = async (v: ContactForm) => {
    if (!(await save(patchJson('/api/my-info/contact', v)))) return
    setOpen(false)
    toast.success(t('myInfo.contact.saved'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.contact.title')}</CardTitle>
        {canEdit && (
          <CardAction>
            <EditButton onClick={() => setOpen(true)} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label={t('myInfo.contact.nameAndTitle')}>{contact ? `${contact.name} · ${contact.title}` : '-'}</InfoRow>
          <InfoRow label={t('myInfo.contact.phone')}>
            <span className="tabular-nums">{contact?.phone ?? '-'}</span>
          </InfoRow>
          <InfoRow label={t('myInfo.contact.email')}>{contact?.email ?? '-'}</InfoRow>
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <ContactEditForm value={contact ?? { name: '', title: '', phone: '', email: '' }} onSave={onSave} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ContactEditForm({ value, onSave }: { value: ContactForm; onSave: (v: ContactForm) => Promise<void> }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema), defaultValues: value })

  return (
    <DialogForm title={t('myInfo.contact.editTitle')} description={t('myInfo.contact.editDescription')} onSubmit={handleSubmit(onSave)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('myInfo.contact.name')} htmlFor="p-name" required error={errors.name?.message}>
          <Input id="p-name" {...register('name')} aria-invalid={!!errors.name} />
        </Field>
        <Field label={t('myInfo.contact.jobTitle')} htmlFor="p-title" required error={errors.title?.message}>
          <Input id="p-title" {...register('title')} aria-invalid={!!errors.title} />
        </Field>
      </div>
      <Field label={t('myInfo.contact.phone')} htmlFor="p-phone" required error={errors.phone?.message}>
        <Input id="p-phone" type="tel" inputMode="tel" placeholder="010-0000-0000" {...register('phone')} aria-invalid={!!errors.phone} />
      </Field>
      <Field label={t('myInfo.contact.email')} htmlFor="p-email" required error={errors.email?.message}>
        <Input id="p-email" type="email" {...register('email')} aria-invalid={!!errors.email} />
      </Field>
    </DialogForm>
  )
}
