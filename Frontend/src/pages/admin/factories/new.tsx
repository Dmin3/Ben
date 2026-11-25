import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { managers } from '@/mocks/admin'
import { PageHead, Panel, Pick } from '../ui'

const CATEGORIES = ['의류', '니트', '가방·잡화', '홈웨어', '원단·부자재']
const FILE_KINDS = ['license', 'photos', 'prices'] as const

type Form = Record<'nameKo' | 'nameCn' | 'region' | 'address' | 'category' | 'items' | 'capacity' | 'moq' | 'lead' | 'sample' | 'payment' | 'contactName' | 'contactTitle' | 'wechat' | 'phone' | 'email' | 'memo', string>
const EMPTY: Form = { nameKo: '', nameCn: '', region: '', address: '', category: '', items: '', capacity: '', moq: '', lead: '', sample: '', payment: '계약금 30% 선입금, 잔금은 출고 전 지급', contactName: '', contactTitle: '', wechat: '', phone: '', email: '', memo: '' }

function F({ label, required, children, className }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-[13px] font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  )
}

/** 공장 등록: 기본 정보(고객에게도 보임) · 거래 조건 · 연락처(내부) · 파일 */
export default function NewFactory() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const p = 'adminPages.factories.form'
  const [form, setForm] = useState<Form>(EMPTY)
  const [files, setFiles] = useState<Partial<Record<(typeof FILE_KINDS)[number], string>>>({})
  const [manager, setManager] = useState<string | null>(managers[1]?.name ?? null)
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const input = (k: keyof Form, placeholder?: string) => <Input className="h-11" value={form[k]} onChange={set(k)} placeholder={placeholder} />

  const checks = {
    basic: !!(form.nameKo && form.nameCn && form.region && form.category),
    terms: !!(form.capacity || form.moq || form.lead),
    contact: !!form.contactName,
    files: Object.keys(files).length === FILE_KINDS.length,
  }

  // TODO(API): 공장 등록 API
  const submit = () => {
    if (!checks.basic || !checks.contact) return toast.error(t(`${p}.required`))
    toast.success(t(`${p}.submitted`))
    navigate('/admin/factories')
  }

  return (
    <div>
      <PageHead back={{ to: '/admin/factories', label: t('adminPages.factories.back') }} title={t(`${p}.title`)} desc={t(`${p}.desc`)} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel title={t(`${p}.basic`)}>
            <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.basicDesc`)}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label={t(`${p}.nameKo`)} required>{input('nameKo', '화메이 니트')}</F>
              <F label={t(`${p}.nameCn`)} required>{input('nameCn', '杭州华美针织有限公司')}</F>
              <F label={t(`${p}.region`)} required>{input('region', '저장성 · 항저우')}</F>
              <F label={t(`${p}.address`)}>{input('address')}</F>
              <F label={t(`${p}.category`)} required className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={form.category === c}
                      onClick={() => setForm((f) => ({ ...f, category: c }))}
                      className={cn('rounded-lg border px-3 py-2 text-[13px]', form.category === c ? 'border-primary bg-primary-soft font-semibold text-primary' : 'hover:bg-muted')}
                    >
                      {c}
                    </button>
                  ))}
                  <Input
                    className="h-9 w-32"
                    placeholder={t(`${p}.customCategory`)}
                    aria-label={t(`${p}.customCategory`)}
                    value={CATEGORIES.includes(form.category) ? '' : form.category}
                    onChange={set('category')}
                  />
                </div>
              </F>
              <F label={t(`${p}.items`)} className="sm:col-span-2">{input('items', '니트, 가디건, 니트 원피스')}</F>
            </div>
          </Panel>

          <Panel title={t(`${p}.terms`)}>
            <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.termsDesc`)}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label={t(`${p}.capacity`)}>{input('capacity', '20,000 pcs')}</F>
              <F label={t(`${p}.moq`)}>{input('moq', '200 pcs / 컬러')}</F>
              <F label={t(`${p}.lead`)} className="sm:col-span-2">{input('lead', '35일')}</F>
              <F label={t(`${p}.sample`)} className="sm:col-span-2"><Textarea rows={2} value={form.sample} onChange={set('sample')} /></F>
              <F label={t(`${p}.payment`)} className="sm:col-span-2"><Textarea rows={2} value={form.payment} onChange={set('payment')} /></F>
            </div>
          </Panel>

          <Panel title={<>{t(`${p}.contact`)} <Badge variant="neutral">{t('adminPages.internal')}</Badge></>}>
            <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.contactDesc`)}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label={t(`${p}.contactName`)} required>{input('contactName')}</F>
              <F label={t(`${p}.contactTitle`)}>{input('contactTitle')}</F>
              <F label={t(`${p}.wechat`)}>{input('wechat')}</F>
              <F label={t(`${p}.phone`)}>{input('phone', '+86 ')}</F>
              <F label={t(`${p}.email`)} className="sm:col-span-2">{input('email', 'sales@example.cn')}</F>
            </div>
          </Panel>

          <Panel title={t(`${p}.files`)}>
            <p className="-mt-3 mb-4 text-xs text-muted-foreground">{t(`${p}.filesDesc`)}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {FILE_KINDS.map((k) => (
                <label
                  key={k}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed px-3 py-5 text-center hover:bg-muted/50',
                    files[k] && 'border-solid border-primary/40 bg-primary-soft/40',
                  )}
                >
                  <span className="text-sm font-bold">{t(`${p}.fileKinds.${k}`)}</span>
                  <span className="truncate text-xs text-muted-foreground">{files[k] ?? t(`${p}.fileHint`)}</span>
                  {/* TODO(API): 파일 업로드. 지금은 파일 이름만 보여준다 */}
                  <input type="file" className="sr-only" onChange={(e) => { const name = e.target.files?.[0]?.name; if (name) setFiles((f) => ({ ...f, [k]: name })) }} />
                </label>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Panel title={t('adminPages.factories.benManager')}>
            <Pick label={t('adminPages.factories.benManager')} value={manager} onChange={setManager} options={managers.map((m) => ({ value: m.name, label: `${m.name} ${t('adminPages.roles.MANAGER')}` }))} />
            <F label={t(`${p}.memo`)} className="mt-4">
              <Textarea rows={3} value={form.memo} onChange={set('memo')} placeholder={t(`${p}.memoPlaceholder`)} />
            </F>
          </Panel>
          <Panel title={t(`${p}.check`)}>
            <ul className="space-y-2.5 text-sm">
              {(Object.keys(checks) as (keyof typeof checks)[]).map((k) => (
                <li key={k} className="flex items-center gap-2.5">
                  <span className={cn('flex size-5 items-center justify-center rounded-full', checks[k] ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground')}>
                    <Check className="size-3" />
                  </span>
                  {t(`${p}.checks.${k}`)}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 rounded-xl bg-muted/60 p-4 text-[13px]">
              <div className="font-bold">{t(`${p}.preview`)}</div>
              {[
                [t(`${p}.nameKo`), form.nameKo],
                [t(`${p}.region`), form.region],
                [t(`${p}.items`), form.items],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{l}</span>
                  <span className="truncate">{v || '-'}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-11" onClick={() => toast.success(t('adminPages.draftSaved'))}>{t('adminPages.saveDraft')}</Button>
              <Button className="h-11 font-bold" onClick={submit}>{t(`${p}.submit`)}</Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
