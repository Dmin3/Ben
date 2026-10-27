import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Field } from '@/components/form/field'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Address } from '@/mocks/my-info'
import { DialogForm } from './info-parts'
import { addressSchema, type AddressForm } from './schema'

type Props = {
  addresses: Address[]
  onChange: (next: Address[]) => void
}

/** 배송지 관리 모달 내용. 목록 ↔ 입력 화면을 같은 모달 안에서 전환한다 */
export function AddressManageDialog({ addresses, onChange }: Props) {
  const { t } = useTranslation()
  // null: 목록 화면 / 'new': 추가 / Address: 수정
  const [editing, setEditing] = useState<Address | 'new' | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  // 모달을 연 시점에 기본 배송지를 맨 위로 정렬. 열려 있는 동안 기본을 바꿔도 줄이 움직이지 않게 순서를 고정한다
  const [order] = useState(() =>
    [...addresses].sort((a, b) => Number(!!b.isDefault) - Number(!!a.isDefault)).map((a) => a.id),
  )

  if (editing) {
    return (
      <AddressEditForm
        value={editing === 'new' ? undefined : editing}
        onCancel={() => setEditing(null)}
        onSave={(v) => {
          if (editing === 'new') {
            // TODO(API): 배송지 추가 API. id는 서버가 발급
            onChange([...addresses, { ...v, id: crypto.randomUUID(), region: '', isDefault: addresses.length === 0 }])
            toast.success(t('myInfo.address.added'))
          } else {
            onChange(addresses.map((a) => (a.id === editing.id ? { ...a, ...v } : a)))
            toast.success(t('myInfo.address.updated'))
          }
          setEditing(null)
        }}
      />
    )
  }

  const defaultId = addresses.find((a) => a.isDefault)?.id
  const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length) // 새로 추가한 배송지는 맨 아래
  const list = [...addresses].sort((a, b) => rank(a.id) - rank(b.id))

  return (
    <div className="flex flex-1 flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{t('myInfo.address.title')}</DialogTitle>
        <DialogDescription>{t('myInfo.address.manageDescription')}</DialogDescription>
      </DialogHeader>

      <RadioGroup
        value={defaultId}
        onValueChange={(id) => onChange(addresses.map((a) => ({ ...a, isDefault: a.id === id })))}
        aria-label={t('myInfo.address.defaultGroup')}
        className="gap-2.5"
      >
        {list.map((a) => (
          <div key={a.id} className="flex items-start gap-3 rounded-xl border px-4 py-3 has-data-checked:border-primary has-data-checked:bg-accent">
            <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
              <RadioGroupItem value={a.id} className="mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">{a.name}</span>
                  {a.isDefault && <Badge variant="info">{t('myInfo.address.default')}</Badge>}
                </div>
                <div className="mt-1 text-[13px] text-muted-foreground">{a.address}</div>
                <div className="text-[13px] text-muted-foreground">
                  {t('myInfo.address.recipient', { name: a.recipient })} · <span className="tabular-nums">{a.phone}</span>
                </div>
              </div>
            </label>
            {confirmDeleteId === a.id ? (
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-xs font-semibold text-destructive">{t('myInfo.address.confirmDelete')}</span>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // TODO(API): 배송지 삭제 API
                      onChange(addresses.filter((x) => x.id !== a.id))
                      setConfirmDeleteId(null)
                      toast.success(t('myInfo.address.deleted'))
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(a)}>
                  {t('common.edit')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={a.isDefault}
                  title={a.isDefault ? t('myInfo.address.cannotDeleteDefault') : undefined}
                  onClick={() => setConfirmDeleteId(a.id)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            )}
          </div>
        ))}
      </RadioGroup>

      <button
        type="button"
        onClick={() => setEditing('new')}
        className="w-full rounded-xl border border-dashed py-3 text-sm font-semibold text-primary hover:bg-accent"
      >
        {t('myInfo.address.add')}
      </button>

      <DialogFooter>
        <DialogClose render={<Button type="button" className="h-10 px-5 font-semibold" />}>{t('common.done')}</DialogClose>
      </DialogFooter>
    </div>
  )
}

function AddressEditForm({
  value,
  onSave,
  onCancel,
}: {
  value?: Address
  onSave: (v: AddressForm) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: value ?? { name: '', address: '', recipient: '', phone: '' },
  })

  return (
    <DialogForm title={value ? t('myInfo.address.editTitle') : t('myInfo.address.addTitle')} onSubmit={handleSubmit(onSave)} onCancel={onCancel}>
      <Field label={t('myInfo.address.name')} htmlFor="a-name" required error={errors.name?.message}>
        <Input id="a-name" placeholder={t('myInfo.address.namePlaceholder')} {...register('name')} aria-invalid={!!errors.name} />
      </Field>
      {/* ponytail: 주소 검색(우편번호 서비스) 없이 직접 입력. 실제 배송 정확도를 위해 주소 검색 연동 필요 */}
      <Field label={t('myInfo.address.address')} htmlFor="a-address" required error={errors.address?.message}>
        <Input id="a-address" placeholder={t('myInfo.address.addressPlaceholder')} {...register('address')} aria-invalid={!!errors.address} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('myInfo.address.recipientLabel')} htmlFor="a-recipient" required error={errors.recipient?.message}>
          <Input id="a-recipient" {...register('recipient')} aria-invalid={!!errors.recipient} />
        </Field>
        <Field label={t('myInfo.address.phone')} htmlFor="a-phone" required error={errors.phone?.message}>
          <Input id="a-phone" type="tel" inputMode="tel" placeholder="010-0000-0000" {...register('phone')} aria-invalid={!!errors.phone} />
        </Field>
      </div>
    </DialogForm>
  )
}
