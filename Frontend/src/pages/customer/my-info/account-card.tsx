import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/form/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router'
import { patchJson } from '@/lib/api'
import { useSaveMyInfo, type MyInfo } from './data'
import { DialogForm, EditButton, InfoRow } from './info-parts'
import { passwordSchema, type PasswordForm } from './schema'

export function AccountCard({ account }: { account: MyInfo['account'] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const save = useSaveMyInfo()
  const [open, setOpen] = useState(false)

  const onSave = async (v: PasswordForm) => {
    if (!(await save(patchJson('/api/my-info/password', { currentPassword: v.current, newPassword: v.next })))) return
    // BE가 세션을 끊으므로 새 비밀번호로 다시 로그인
    setOpen(false)
    toast.success(t('myInfo.account.relogin'))
    navigate('/login', { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.account.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          {account.loginId && <InfoRow label={t('myInfo.account.loginId')}>{account.loginId}</InfoRow>}
          {account.linkedProviders.length > 0 && (
            <InfoRow label={t('myInfo.account.social')}>
              {account.linkedProviders.map((p) => p.provider[0] + p.provider.slice(1).toLowerCase()).join(', ')}
            </InfoRow>
          )}
          {account.canChangePassword && (
            <div className="flex items-center gap-4 py-3 text-sm">
              <dt className="w-28 shrink-0 text-muted-foreground">{t('myInfo.account.password')}</dt>
              <dd className="ml-auto">
                <EditButton onClick={() => setOpen(true)}>{t('myInfo.account.changePassword')}</EditButton>
              </dd>
            </div>
          )}
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <PasswordChangeForm onSave={onSave} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PasswordChangeForm({ onSave }: { onSave: (v: PasswordForm) => Promise<void> }) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { current: '', next: '', confirm: '' } })

  return (
    <DialogForm
      title={t('myInfo.account.changePassword')}
      description={t('myInfo.account.passwordDescription')}
      submitLabel={t('myInfo.account.submit')}
      onSubmit={handleSubmit(onSave)}>
      <Field label={t('myInfo.account.current')} htmlFor="pw-current" required error={errors.current?.message}>
        <Input id="pw-current" type="password" autoComplete="current-password" {...register('current')} aria-invalid={!!errors.current} />
      </Field>
      <Field label={t('myInfo.account.next')} htmlFor="pw-next" required error={errors.next?.message}>
        <Input id="pw-next" type="password" autoComplete="new-password" {...register('next')} aria-invalid={!!errors.next} />
      </Field>
      <Field label={t('myInfo.account.confirm')} htmlFor="pw-confirm" required error={errors.confirm?.message}>
        <Input id="pw-confirm" type="password" autoComplete="new-password" {...register('confirm')} aria-invalid={!!errors.confirm} />
      </Field>
    </DialogForm>
  )
}
