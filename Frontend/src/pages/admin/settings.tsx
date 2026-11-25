import { Pin } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { activities, adminNotices, customers, staff, type ActivityMenu, type AdminRole } from '@/mocks/admin'
import { panel, td, th } from './styles'
import { DarkBadge, Initial, PageHead, Panel, Pick, Switch } from './ui'

type Section = 'notices' | 'roles' | 'activity'
const p = 'adminPages.settings'

const NOTICE_BADGE = { ended: 'neutral', live: 'success', scheduled: 'info' } as const

function Notices() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  // TODO(API): 공지 목록·작성 API
  const [list, setList] = useState(adminNotices)
  const composing = params.get('compose') === '1'
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<'all' | 'some'>('all')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [from, setFrom] = useState('2026-11-01')
  const [to, setTo] = useState('2026-11-15')
  const [pin, setPin] = useState(false)
  const [popup, setPopup] = useState(true)

  const publish = () => {
    if (!title.trim() || !body.trim()) return toast.error(t(`${p}.notices.required`))
    const targetName = target === 'all' ? t(`${p}.notices.targets.all`) : (customers.find((c) => c.id === customerId)?.name ?? '-')
    setList((l) => [{ id: `an${l.length + 1}`, pinned: pin, title: title.trim(), target: targetName, period: `${from.slice(5).replace('-', '.')} ~ ${to.slice(5).replace('-', '.')}`, state: 'scheduled', views: null }, ...l])
    setTitle('')
    setBody('')
    setParams({}, { replace: true })
    toast.success(t(`${p}.notices.published`))
  }

  return (
    <div className="space-y-4">
      <Panel
        title={t(`${p}.notices.title`)}
        action={<Button className="font-bold" onClick={() => setParams({ compose: '1' }, { replace: true })}>{t(`${p}.notices.write`)}</Button>}
      >
        <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.notices.desc`)}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-muted/40">
                {(['pinned', 'title', 'target', 'period', 'state', 'views'] as const).map((c) => (
                  <th key={c} className={cn(th, c === 'views' && 'text-right')}>{t(`${p}.notices.cols.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.id} className="border-b border-divider">
                  <td className={td}>{n.pinned && <Pin className="size-4 text-destructive" />}</td>
                  <td className={cn(td, 'font-semibold whitespace-normal')}>{n.title}</td>
                  <td className={td}>{n.target}</td>
                  <td className={cn(td, 'tabular-nums')}>{n.period}</td>
                  <td className={td}><Badge variant={NOTICE_BADGE[n.state]}>{t(`${p}.notices.states.${n.state}`)}</Badge></td>
                  <td className={cn(td, 'text-right tabular-nums')}>{n.views ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {composing && (
        <Panel
          title={t(`${p}.notices.compose`)}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.notices.preview`)}</Button>
              <Button variant="outline" onClick={() => toast.success(t('adminPages.draftSaved'))}>{t('adminPages.saveDraft')}</Button>
              <Button className="font-bold" onClick={publish}>{t(`${p}.notices.publish`)}</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <label className="block space-y-1.5 text-[13px] font-semibold">
              {t(`${p}.notices.fields.title`)}
              <Input className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 text-[13px] font-semibold">
                {t(`${p}.notices.fields.target`)}
                <div className="flex flex-wrap gap-2">
                  {(['all', 'some'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={target === v}
                      onClick={() => setTarget(v)}
                      className={cn('rounded-lg border px-3 py-2 text-[13px]', target === v ? 'border-primary bg-primary-soft font-semibold text-primary' : 'font-normal hover:bg-muted')}
                    >
                      {t(`${p}.notices.targets.${v}`)}
                    </button>
                  ))}
                  {target === 'some' && (
                    <Pick className="w-48" label={t(`${p}.notices.targets.some`)} value={customerId} onChange={setCustomerId} options={customers.map((c) => ({ value: c.id, label: c.name }))} />
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-[13px] font-semibold">
                {t(`${p}.notices.fields.period`)}
                <div className="flex items-center gap-2">
                  <Input type="date" className="h-10" value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t(`${p}.notices.fields.period`)} />
                  ~
                  <Input type="date" className="h-10" value={to} onChange={(e) => setTo(e.target.value)} aria-label={t(`${p}.notices.fields.period`)} />
                </div>
              </div>
            </div>
            {/* ponytail: 서식 편집기(굵게·목록·링크·이미지)는 라이브러리가 필요해 일반 입력칸으로 둔다. 필요해지면 편집기 추가 */}
            <label className="block space-y-1.5 text-[13px] font-semibold">
              {t(`${p}.notices.fields.body`)}
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t(`${p}.notices.bodyPlaceholder`)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-[13px] font-semibold">
                {t(`${p}.notices.fields.files`)}
                <span className="flex h-11 cursor-pointer items-center rounded-lg border px-3 text-[13px] font-normal text-muted-foreground hover:bg-muted/50">
                  {t(`${p}.notices.filesHint`)}
                  <input type="file" className="sr-only" onChange={() => toast(t('common.comingSoon'))} />
                </span>
              </label>
              <div className="space-y-2.5 text-[13px]">
                <div className="font-semibold">{t(`${p}.notices.fields.display`)}</div>
                <div className="flex items-center justify-between">
                  {t(`${p}.notices.pin`)}
                  <Switch checked={pin} onChange={setPin} label={t(`${p}.notices.pin`)} />
                </div>
                <div className="flex items-center justify-between">
                  {t(`${p}.notices.popup`)}
                  <Switch checked={popup} onChange={setPopup} label={t(`${p}.notices.popup`)} />
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

type Level = 'edit' | 'view' | 'none'
const MENUS = ['home', 'orders', 'deposit', 'supply', 'customers', 'finance', 'settings'] as const
// 시안 "역할별 권한" 표 (AI 자금점검 칸은 AI센터를 빼면서 제외)
const MATRIX: Record<AdminRole, Level[]> = {
  SUPER: ['edit', 'edit', 'edit', 'edit', 'edit', 'edit', 'edit'],
  MANAGER: ['edit', 'edit', 'edit', 'edit', 'edit', 'none', 'none'],
  FINANCE: ['view', 'view', 'edit', 'view', 'edit', 'edit', 'none'],
  VIEWER: ['view', 'view', 'view', 'view', 'view', 'none', 'none'],
}
const LEVEL_BADGE = { edit: 'success', view: 'info', none: 'neutral' } as const
const ROLE_BADGE = { SUPER: 'default', MANAGER: 'info', FINANCE: 'secondary', VIEWER: 'neutral' } as const

function RoleBadge({ role }: { role: AdminRole }) {
  const { t } = useTranslation()
  if (role === 'SUPER') return <DarkBadge>{t(`adminPages.roles.${role}`)}</DarkBadge>
  return <Badge variant={ROLE_BADGE[role]}>{t(`adminPages.roles.${role}`)}</Badge>
}

function Roles() {
  const { t } = useTranslation()
  // TODO(API): 관리자 계정·권한 API
  const [accounts, setAccounts] = useState(staff)
  const toggle = (id: string, active: boolean) => {
    setAccounts((l) => l.map((a) => (a.id === id ? { ...a, active } : a)))
    const name = accounts.find((a) => a.id === id)?.name
    toast.success(t(`${p}.roles.toggled`, { name, state: t(`${p}.roles.${active ? 'on' : 'off'}`) }))
  }
  return (
    <div className="space-y-4">
      <Panel title={t(`${p}.roles.title`)} action={<Button className="font-bold" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.roles.invite`)}</Button>}>
        <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.roles.desc`)}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-muted/40">
                {(['name', 'role', 'customers', 'lastSeen', 'active'] as const).map((c) => (
                  <th key={c} className={th}>{t(`${p}.roles.cols.${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className={cn('border-b border-divider', !a.active && 'opacity-60')}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Initial name={a.name} />
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={td}><RoleBadge role={a.role} /></td>
                  <td className={td}>{a.customers}</td>
                  <td className={cn(td, 'tabular-nums')}>{a.lastSeen}</td>
                  <td className={td}>
                    <Switch checked={a.active} onChange={(v) => toggle(a.id, v)} label={`${a.name} ${t(`${p}.roles.cols.active`)}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={t(`${p}.roles.matrix`)} action={<Button variant="outline" onClick={() => toast(t('common.comingSoon'))}>{t(`${p}.roles.matrixEdit`)}</Button>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-muted/40">
                <th className={th}>{t(`${p}.roles.cols.role`)}</th>
                {MENUS.map((m) => (
                  <th key={m} className={cn(th, 'text-center')}>{t(`${p}.roles.menus.${m}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(MATRIX) as AdminRole[]).map((role) => (
                <tr key={role} className="border-b border-divider">
                  <td className={td}><RoleBadge role={role} /></td>
                  {MATRIX[role].map((level, i) => (
                    <td key={MENUS[i]} className={cn(td, 'text-center')}>
                      <Badge variant={LEVEL_BADGE[level]}>{t(`${p}.roles.levels.${level}`)}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t(`${p}.roles.matrixNote`)}</p>
      </Panel>
    </div>
  )
}

function Activity() {
  const { t } = useTranslation()
  const [who, setWho] = useState<string | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  // TODO(API): 활동 기록 조회 (기간 필터 포함)
  const rows = activities.filter((a) => (!who || who === 'all' || a.who === who) && (!menu || menu === 'all' || a.menu === menu))
  const menus: ActivityMenu[] = ['orders', 'deposit', 'supply', 'customers', 'finance', 'settings']
  return (
    <Panel
      title={t(`${p}.activity.title`)}
      action={
        <div className="flex flex-wrap gap-2">
          <Pick className="w-32" label={t(`${p}.activity.allStaff`)} value={who} onChange={setWho} placeholder={t(`${p}.activity.allStaff`)} options={[{ value: 'all', label: t(`${p}.activity.allStaff`) }, ...staff.map((s) => ({ value: s.name, label: s.name }))]} />
          <Pick className="w-32" label={t(`${p}.activity.allMenus`)} value={menu} onChange={setMenu} placeholder={t(`${p}.activity.allMenus`)} options={[{ value: 'all', label: t(`${p}.activity.allMenus`) }, ...menus.map((m) => ({ value: m, label: t(`${p}.activity.menus.${m}`) }))]} />
          <span className="flex h-10 items-center rounded-lg border px-3 text-sm">{t(`${p}.activity.period`)}</span>
        </div>
      }
    >
      <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.activity.desc`)}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-muted/40">
              {(['at', 'who', 'menu', 'text'] as const).map((c) => (
                <th key={c} className={th}>{t(`${p}.activity.cols.${c}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i} className="border-b border-divider">
                <td className={cn(td, 'text-muted-foreground tabular-nums')}>{a.at}</td>
                <td className={cn(td, 'font-bold')}>{a.who}</td>
                <td className={td}><Badge variant="neutral">{t(`${p}.activity.menus.${a.menu}`)}</Badge></td>
                <td className={cn(td, 'whitespace-normal')}>{a.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

/** 설정: 왼쪽 하위 메뉴 + 공지사항·관리자 권한·활동 기록 */
export default function AdminSettings({ section }: { section: Section }) {
  const { t } = useTranslation()
  const links: { key: Section | 'site'; to?: string }[] = [
    { key: 'notices', to: '/admin/settings/notices' },
    { key: 'roles', to: '/admin/settings/roles' },
    { key: 'activity', to: '/admin/settings/activity' },
    { key: 'site' },
  ]
  return (
    <div>
      <PageHead title={t(`${p}.title`)} desc={t(`${p}.desc`)} />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className={cn(panel, 'flex gap-1 overflow-x-auto p-2 lg:flex-col')}>
          {links.map((l) =>
            l.to ? (
              <NavLink
                key={l.key}
                to={l.to}
                className={({ isActive }) => cn('shrink-0 rounded-lg px-3 py-2.5 text-sm', isActive ? 'bg-primary-soft font-semibold text-primary' : 'hover:bg-muted')}
              >
                {t(`${p}.menu.${l.key}`)}
              </NavLink>
            ) : (
              <span key={l.key} aria-disabled className="flex shrink-0 items-center justify-between gap-2 border-divider px-3 py-2.5 text-sm text-subtle-foreground lg:mt-1 lg:border-t">
                {t(`${p}.menu.${l.key}`)}
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{t('admin.tags.hold')}</span>
              </span>
            ),
          )}
        </nav>
        {section === 'notices' && <Notices />}
        {section === 'roles' && <Roles />}
        {section === 'activity' && <Activity />}
      </div>
    </div>
  )
}
