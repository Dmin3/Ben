import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { MyAddress } from './data'
import { AddressManageDialog } from './address-manage-dialog'
import { EditButton } from './info-parts'

export function AddressCard({ addresses, canEdit }: { addresses: MyAddress[]; canEdit: boolean }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  // BE가 기본 배송지를 맨 위로 정렬해서 준다
  const sorted = addresses

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myInfo.address.title')}</CardTitle>
        {canEdit && (
          <CardAction>
            <EditButton onClick={() => setOpen(true)}>{t('common.manage')}</EditButton>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-2.5">
        {sorted.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">{t('myInfo.address.empty')}</p>}
        {sorted.map((a) => (
          <div key={a.id} className="rounded-xl border px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">{a.name}</span>
              {a.isDefault && <Badge variant="info">{t('myInfo.address.default')}</Badge>}
            </div>
            <div className="mt-1 text-[13px] text-muted-foreground">{a.address}</div>
            <div className="text-[13px] text-muted-foreground">
              {t('myInfo.address.recipient', { name: a.recipient })} · <span className="tabular-nums">{a.phone}</span>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <AddressManageDialog addresses={addresses} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
