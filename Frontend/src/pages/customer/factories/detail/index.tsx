import { ArrowLeft, File, FileText, MapPin, NotebookPen, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { FactoryGradeBadge } from '@/components/factory/grade-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { yuan } from '@/lib/format'
import { cn } from '@/lib/utils'
import { findFactory, type Factory } from '@/mocks/factories'
import { DialogForm } from '../../my-info/info-parts'
import { FilesTab, HistoryTab, IssuesTab, ProductsTab } from './record-tabs'
import { SummaryTab } from './summary-tab'

const TABS = ['summary', 'history', 'products', 'issues', 'files'] as const
type Tab = (typeof TABS)[number]

function TabContent({ tab, factory }: { tab: Tab; factory: Factory }) {
  switch (tab) {
    case 'summary':
      return <SummaryTab factory={factory} />
    case 'history':
      return <HistoryTab factory={factory} />
    case 'products':
      return <ProductsTab factory={factory} />
    case 'issues':
      return <IssuesTab factory={factory} />
    case 'files':
      return <FilesTab factory={factory} />
  }
}

const TAG_LIMIT = 4

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link to="/factories" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />
      {t('factories.backToList')}
    </Link>
  )
}

/** 공장 메모. ponytail: 지금은 화면 안에서만 유지. 메모 API가 생기면 저장 연동 */
function MemoDialog({ open, onOpenChange, memo, onSave }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  memo: string
  onSave: (memo: string) => void
}) {
  const { t } = useTranslation()
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave(String(new FormData(e.currentTarget).get('memo') ?? ''))
    onOpenChange(false)
    toast.success(t('factories.memoSaved'))
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogForm title={t('factories.memoTitle')} description={t('factories.memoDescription')} onSubmit={submit}>
          <Textarea
            name="memo"
            defaultValue={memo}
            rows={6}
            placeholder={t('factories.memoPlaceholder')}
            aria-label={t('factories.memoTitle')}
          />
        </DialogForm>
      </DialogContent>
    </Dialog>
  )
}

function Stat({ value, label, good }: { value: string; label: string; good?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border lg:p-5">
      <div className={cn('text-xl font-extrabold tabular-nums lg:text-[26px]', good && 'text-success')}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground lg:text-[13px]">{label}</div>
    </div>
  )
}

export default function FactoryDetail() {
  const { t } = useTranslation()
  const factory = findFactory(useParams().id)
  const [tab, setTab] = useState<Tab>('summary')
  const [memoOpen, setMemoOpen] = useState(false)
  const [memo, setMemo] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)

  if (!factory) {
    return (
      <div className="space-y-5">
        <BackLink />
        <p className="rounded-2xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-border">{t('factories.notFound')}</p>
      </div>
    )
  }

  const tags = showAllTags ? factory.tags : factory.tags.slice(0, TAG_LIMIT)
  const hiddenTags = factory.tags.length - TAG_LIMIT

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('nav.factories')}</h1>
      <BackLink />

      {/* 공장 기본 정보 */}
      <section className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-border sm:flex-row lg:p-6">
        <div className="flex aspect-[4/3] shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-muted text-xs text-subtle-foreground sm:w-56">
          <FileText className="size-5" />
          {t('factories.photo')}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold">{factory.name}</h2>
              <FactoryGradeBadge grade={factory.grade} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-9" onClick={() => setMemoOpen(true)}>
                <NotebookPen /> {t('factories.memo')}
              </Button>
              <Button variant="outline" className="h-9" onClick={() => setTab('files')}>
                <File /> {t('factories.files', { count: factory.files.length })}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{factory.legalName}</div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 shrink-0 text-muted-foreground" />
            {factory.address}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserRound className="size-4 shrink-0 text-muted-foreground" />
            {t('factories.manager', { name: factory.manager })}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span key={tag} className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground">
                {tag}
              </span>
            ))}
            {!showAllTags && hiddenTags > 0 && (
              <button
                type="button"
                onClick={() => setShowAllTags(true)}
                className="rounded-md bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                +{hiddenTags}
              </button>
            )}
          </div>
          {memo && <p className="rounded-lg bg-warning-subtle px-3 py-2 text-[13px] whitespace-pre-line">{memo}</p>}
        </div>
      </section>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        <Stat value={t('units.cases', { count: factory.deals })} label={t('factories.stats.deals')} />
        <Stat value={yuan(factory.totalAmount)} label={t('factories.stats.amount')} />
        <Stat value={`${factory.onTimeRate}%`} label={t('factories.stats.onTime')} good={factory.onTimeRate >= 90} />
        <Stat value={`${factory.defectRate}%`} label={t('factories.stats.defect')} good={factory.defectRate <= 2} />
        <Stat value={t('units.days', { count: factory.avgLeadDays })} label={t('factories.stats.lead')} />
      </div>

      {/* 탭 */}
      <div role="tablist" className="flex overflow-x-auto overflow-y-hidden border-b">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-5 py-3 text-sm whitespace-nowrap transition-colors',
              tab === key ? 'border-primary font-bold text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`factories.tabs.${key}`)}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        <TabContent tab={tab} factory={factory} />
      </div>

      <MemoDialog open={memoOpen} onOpenChange={setMemoOpen} memo={memo} onSave={setMemo} />
    </div>
  )
}
