import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { tasks } from '@/mocks/tasks'
import { TaskCard } from './task-card'

const TABS = ['active', 'done', 'all'] as const
type Tab = (typeof TABS)[number]

export default function Tasks() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('active')

  const activeCount = tasks.filter((x) => x.stage !== 'completed').length
  const rows =
    tab === 'all' ? tasks : tasks.filter((x) => (tab === 'done' ? x.stage === 'completed' : x.stage !== 'completed'))

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-bold">{t('nav.tasks')}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          {t('tasks.summaryTitle')}{' '}
          <span className="text-[13px] font-normal text-muted-foreground">{t('tasks.inProgressCount', { count: activeCount })}</span>
        </h2>
        {/* 진행 중 / 완료 / 전체 */}
        <div className="flex rounded-xl bg-card p-1 ring-1 ring-border">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                'h-8 rounded-lg px-4 text-[13px] font-semibold transition-colors',
                tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`tasks.tabs.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-border">{t('tasks.empty')}</p>
      ) : (
        <div className="space-y-4">
          {rows.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
