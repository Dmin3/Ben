import { useTranslation } from 'react-i18next'
import type { FormEventHandler, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/** 라벨 + 값 한 줄 */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-divider py-3 text-sm last:border-0">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-keep">{children}</dd>
    </div>
  )
}

/** 카드 오른쪽 위 수정/관리 버튼 */
export function EditButton({ children, onClick }: { children?: ReactNode; onClick?: () => void }) {
  const { t } = useTranslation()
  return (
    <Button variant="outline" size="sm" className="font-semibold" onClick={onClick}>
      {children ?? t('common.edit')}
    </Button>
  )
}

/** 모달 안의 입력 폼 틀: 제목 + 입력칸 + 취소/저장 버튼 */
export function DialogForm({
  title,
  description,
  onSubmit,
  submitLabel,
  onCancel,
  children,
}: {
  title: string
  description?: string
  onSubmit: FormEventHandler<HTMLFormElement>
  submitLabel?: string
  /** 지정하면 취소가 모달을 닫지 않고 이 동작을 한다 (예: 목록으로 돌아가기) */
  onCancel?: () => void
  children: ReactNode
}) {
  const { t } = useTranslation()
  const cancelClass = 'h-10 px-4'
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <div className="space-y-4">{children}</div>
      <DialogFooter>
        {onCancel ? (
          <Button type="button" variant="outline" className={cancelClass} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        ) : (
          <DialogClose render={<Button type="button" variant="outline" className={cancelClass} />}>{t('common.cancel')}</DialogClose>
        )}
        <Button type="submit" className="h-10 px-5 font-semibold">
          {submitLabel ?? t('common.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}
