import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/form/field'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { account } from '@/mocks/my-info'
import { DialogForm, EditButton, InfoRow } from './info-parts'
import { passwordSchema, type PasswordForm } from './schema'

// ponytail: 소셜 로그인만 쓰는 계정은 비밀번호가 없다. BE 응답에 따라 이 영역을 "연결된 계정" 표시로 바꿔야 함
export function AccountCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.account.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label={t('myInfo.account.loginId')}>{account.loginId}</InfoRow>
          <div className="flex items-center gap-4 py-3 text-sm">
            <dt className="w-28 shrink-0 text-muted-foreground">{t('myInfo.account.password')}</dt>
            <dd className="ml-auto">
              <EditButton onClick={() => setOpen(true)}>{t('myInfo.account.changePassword')}</EditButton>
            </dd>
          </div>
        </dl>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <PasswordChangeForm
            onSave={() => {
              // TODO(API): 비밀번호 변경 API 호출. 현재 비밀번호 불일치 에러 처리 필요
              setOpen(false)
              toast.success(t('myInfo.account.changed'))
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PasswordChangeForm({ onSave }: { onSave: (v: PasswordForm) => void }) {
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
