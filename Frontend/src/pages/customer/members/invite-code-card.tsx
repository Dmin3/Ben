import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getJson, postJson } from '@/lib/api'

type Invite = { invitationCode: string }
const KEY = ['account', 'invitation-code']

/** 대표(MAIN OWNER) 전용. 직원은 가입할 때 이 코드를 입력해 합류 요청을 보낸다 */
export function InviteCodeCard() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const { data, isError } = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await getJson<Invite>('/api/account/invitation-code')
      if (!res.ok) throw new Error(res.code)
      return res.data.invitationCode
    },
  })

  const reissue = async () => {
    setBusy(true)
    const res = await postJson<Invite>('/api/account/invitation-code', {})
    setBusy(false)
    setConfirm(false)
    if (!res.ok) return toast.error(t('members.invite.failed'))
    queryClient.setQueryData(KEY, res.data.invitationCode)
    toast.success(t('members.invite.reissued'))
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold">{t('members.invite.title')}</div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{t('members.invite.desc')}</p>
        </div>
        {isError ? (
          <span className="text-sm text-destructive">{t('members.invite.failed')}</span>
        ) : (
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-muted px-3 py-2 font-mono text-[15px] font-bold tracking-[0.15em]">{data ?? '············'}</code>
            <Button
              variant="outline"
              className="h-9"
              disabled={!data}
              onClick={() => navigator.clipboard.writeText(data!).then(() => toast.success(t('members.invite.copied')))}
            >
              <Copy /> {t('members.invite.copy')}
            </Button>
            <Button variant="ghost" className="h-9" disabled={!data} onClick={() => setConfirm(true)}>
              <RefreshCw /> {t('members.invite.reissue')}
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('members.invite.reissue')}</DialogTitle>
            <DialogDescription>{t('members.invite.reissueConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t('common.cancel')}</DialogClose>
            <Button disabled={busy} onClick={reissue}>
              {t('members.invite.reissue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
