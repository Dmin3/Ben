import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { OrderProgress } from '@/components/order/order-progress'
import { OrderStatusBadge } from '@/components/order/order-status-badge'
import { ORDER_STEPS } from '@/components/order/steps'
import { cn } from '@/lib/utils'
import type { Task } from '@/mocks/tasks'
import { TaskActions } from './task-actions'

const qty = (n: number) => n.toLocaleString('ko-KR')

/** 공장 | 제품 | 수량 처럼 세로 구분선으로 잇는 한 줄 */
function MetaLine({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="h-3 w-px bg-border" />}
          {item}
        </span>
      ))}
    </div>
  )
}

export function TaskCard({ task }: { task: Task }) {
  const { t } = useTranslation()
  const reviewing = task.stage === 'reviewing'
  const delayed = task.stage === 'active' && task.delayed

  const stageTitle =
    task.stage === 'active' ? t(`tasks.stage.${ORDER_STEPS[task.step]}`) : t(`tasks.stage.${task.stage}`)

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl bg-card ring-1 ring-border lg:grid lg:grid-cols-[minmax(0,1fr)_330px]',
        reviewing && 'ring-primary', // 확인 중인 오더는 강조
      )}
    >
      <div className="space-y-5 p-5">
        {/* 상단: 이미지 + 기본 정보 + 현재 단계 */}
        <div className="flex gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-[10px] text-subtle-foreground">
            {task.imageUrl ? <img src={task.imageUrl} alt="" className="size-full object-cover" /> : t('tasks.productImage')}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold">{task.id}</span>
              <OrderStatusBadge status={task.status} />
            </div>
            <MetaLine
              items={[
                reviewing ? t('order.unassignedFactory') : task.factory,
                task.productName,
                t('units.pcs', { qty: qty(task.quantity) }),
              ]}
            />
            <div className="text-[13px] text-muted-foreground">
              {reviewing ? t('tasks.requestedArrival', { date: task.requestedArrival }) : t('tasks.due', { date: task.dueDate })}
            </div>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <div className={cn('text-[15px] font-bold', delayed ? 'text-destructive' : 'text-primary')}>{stageTitle}</div>
            {reviewing && <div className="mt-1 text-xs text-muted-foreground">{t('tasks.received', { date: task.receivedAt })}</div>}
            {task.stage === 'active' && (
              <>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t('tasks.progress')} <span className="text-lg font-bold text-foreground tabular-nums">{task.progress}%</span>
                </div>
                <div className="mt-1.5 ml-auto h-1 w-40 overflow-hidden rounded-full bg-border">
                  <div className={cn('h-full rounded-full', delayed ? 'bg-destructive' : 'bg-primary')} style={{ width: `${task.progress}%` }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 모바일: 현재 단계를 정보 아래에 */}
        <div className={cn('text-sm font-bold sm:hidden', delayed ? 'text-destructive' : 'text-primary')}>
          {stageTitle}
          {task.stage === 'active' && <span className="ml-2 text-xs font-medium text-muted-foreground tabular-nums">{task.progress}%</span>}
        </div>

        {/* 하단: 진행 단계 또는 확인 중 안내 */}
        {task.stage === 'active' && (
          <div className="overflow-x-auto pb-1">
            <OrderProgress current={task.step} size="lg" />
          </div>
        )}

        {task.stage === 'reviewing' && (
          <>
            <div className="flex items-center gap-3.5 rounded-xl bg-accent px-4 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
                <Clock className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold">{t('tasks.reviewing.title')}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t('tasks.reviewing.description')}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
              <span>
                <span className="text-muted-foreground">{t('tasks.reviewing.manager')}</span>{' '}
                <b className="font-semibold">{task.manager}</b>
              </span>
              <span>
                <span className="text-muted-foreground">{t('tasks.reviewing.eta')}</span>{' '}
                <b className="font-semibold">{t('tasks.reviewing.etaValue', { days: task.replyDays })}</b>
              </span>
            </div>
          </>
        )}
      </div>

      {/* 오른쪽(모바일은 아래): 서류/동작 버튼 */}
      <div className="border-t p-5 lg:border-t-0 lg:border-l">
        <TaskActions task={task} />
      </div>
    </article>
  )
}
