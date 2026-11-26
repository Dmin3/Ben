import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { memberLimit, type Member, type MembershipRequest } from '@/mocks/members'
import { useDecideRequest, useMembers, useMembershipRequests } from './data'
import { InviteCodeCard } from './invite-code-card'

const day = (iso: string) => iso.slice(0, 10).replaceAll('-', '.')

function Initial({ name, muted }: { name: string; muted?: boolean }) {
  return (
    <span
      className={
        muted
          ? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground'
          : 'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary'
      }
    >
      {name[0]}
    </span>
  )
}

function RequestsCard() {
  const { t } = useTranslation()
  const { data: requests = [] } = useMembershipRequests()
  const decideRequest = useDecideRequest()
  // 거절은 되돌릴 수 없어 한 번 더 묻는다
  const [rejecting, setRejecting] = useState<MembershipRequest | null>(null)

  const decide = (r: MembershipRequest, approve: boolean) => {
    decideRequest(r, approve)
    toast.success(t(approve ? 'members.approved' : 'members.rejected', { name: r.name }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('members.requests')}
          {requests.length > 0 && <Badge variant="warning">{requests.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {requests.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('members.noRequests')}</p>
        )}
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3">
            <Initial name={r.name} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{r.name}</div>
              <div className="truncate text-[13px] text-muted-foreground">
                {r.email ?? '-'} · {t('members.requestedAt', { date: day(r.requestedAt) })}
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setRejecting(r)}>
                {t('members.reject')}
              </Button>
              <Button className="flex-1 sm:flex-none" onClick={() => decide(r, true)}>
                {t('members.approve')}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('members.rejectTitle', { name: rejecting?.name })}</DialogTitle>
            <DialogDescription>{t('members.rejectBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-10 px-4" />}>{t('common.cancel')}</DialogClose>
            <Button
              variant="destructive"
              className="h-10 px-5 font-semibold"
              onClick={() => {
                if (rejecting) decide(rejecting, false)
                setRejecting(null)
              }}
            >
              {t('members.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

const ROLE_BADGE = { OWNER: 'default', ADMIN: 'info', MEMBER: 'neutral' } as const

function loginMethod(m: Member, t: TFunction) {
  if (m.authMethod === 'LOCAL_ONLY' || !m.ssoProvider) return t('members.loginLocal')
  return t(`members.provider.${m.ssoProvider}`)
}

function MembersCard() {
  const { t } = useTranslation()
  const { data: members = [] } = useMembers()
  const active = members.filter((m) => m.status !== 'DISABLED').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('members.list')}</CardTitle>
        <CardAction>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {t('members.count', { count: active, limit: memberLimit })}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-divider">
          {members.map((m) => {
            const disabled = m.status === 'DISABLED'
            return (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <Initial name={m.name} muted={disabled} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={disabled ? 'text-sm font-bold text-muted-foreground' : 'text-sm font-bold'}>
                      {m.name}
                    </span>
                    <Badge variant={ROLE_BADGE[m.role]}>{t(`members.role.${m.role}`)}</Badge>
                    {disabled && <Badge variant="danger">{t('members.disabled')}</Badge>}
                  </div>
                  <div className="truncate text-[13px] text-muted-foreground">
                    {m.email ?? '-'} · {loginMethod(m, t)}
                  </div>
                </div>
                <span className="hidden shrink-0 text-[13px] text-muted-foreground tabular-nums sm:block">
                  {t('members.joinedAt', { date: day(m.createdAt) })}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/** 회사 대표 전용: 직원 합류 요청 수락·거절과 직원 목록 */
export default function Members() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-bold">{t('members.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('members.desc')}</p>
      </div>
      <InviteCodeCard />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <RequestsCard />
        <MembersCard />
      </div>
    </div>
  )
}
