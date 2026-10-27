import { ArrowDown, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/mocks/tasks'

type Action = {
  key: 'viewRequest' | 'editRequest' | 'quote' | 'schedule' | 'sampleImages' | 'qcImages' | 'customsInvoice' | 'closingDocs'
  ready: boolean
  download?: boolean
}

// ponytail: 버튼 활성 조건을 진행 단계로 추정함 (샘플 이후 샘플 이미지, 검품부터 QC 이미지, 통관부터 인보이스, 배송부터 마감서류).
// 실제로는 서류가 올라왔는지를 서버가 알려줘야 한다
function actionsFor(task: Task): Action[] {
  if (task.stage === 'reviewing') {
    return [
      { key: 'viewRequest', ready: true },
      { key: 'editRequest', ready: true },
      { key: 'quote', ready: false },
      { key: 'schedule', ready: false },
    ]
  }
  const step = task.stage === 'completed' ? 99 : task.step
  return [
    { key: 'sampleImages', ready: step >= 1 },
    { key: 'qcImages', ready: step >= 3 },
    { key: 'customsInvoice', ready: step >= 5 },
    { key: 'closingDocs', ready: step >= 6, download: true },
  ]
}

/** 업무 카드 오른쪽 서류/동작 버튼 목록. 아직 준비 안 된 항목은 "준비 전"으로 비활성 */
export function TaskActions({ task }: { task: Task }) {
  const { t } = useTranslation()

  return (
    <ul className="space-y-2">
      {actionsFor(task).map((a) => {
        const label = t(`tasks.actions.${a.key}`)
        return (
          <li key={a.key}>
            {a.ready ? (
              <button
                type="button"
                className="flex h-11 w-full items-center justify-between rounded-lg border border-primary/50 bg-card px-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-accent"
              >
                {label}
                {a.download ? <ArrowDown className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            ) : (
              <div
                aria-disabled
                className="flex h-11 w-full items-center justify-between rounded-lg border border-dashed px-3.5 text-[13px] text-subtle-foreground"
              >
                {label}
                <span className="text-[11px]">{t('tasks.notReady')}</span>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
