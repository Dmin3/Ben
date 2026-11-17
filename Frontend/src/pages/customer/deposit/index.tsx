import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { depositAlerts, depositSummary, transactions, ttAccount } from '@/mocks/deposit'
import { InfoRow } from '../my-info/info-parts'
import { AlertsCard } from './alerts-card'
import { BalanceCard } from './balance-card'
import { HistoryCard } from './history-card'

function TtGuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const rows = ['bank', 'swift', 'account', 'holder', 'address'] as const
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deposit.tt.title')}</DialogTitle>
          <DialogDescription>{t('deposit.tt.description')}</DialogDescription>
        </DialogHeader>
        <dl className="mt-2">
          {rows.map((key) => (
            <InfoRow key={key} label={t(`deposit.tt.${key}`)}>
              {ttAccount[key]}
            </InfoRow>
          ))}
        </dl>
        <p className="mt-3 rounded-lg bg-warning-subtle px-3 py-2.5 text-[13px]">{t('deposit.tt.note')}</p>
        <DialogFooter>
          <DialogClose render={<Button className="h-10 px-5" />}>{t('common.close')}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Deposit() {
  const { t } = useTranslation()
  const [ttOpen, setTtOpen] = useState(false)

  // TODO(API): 송금 인보이스 PDF 다운로드
  const downloadInvoice = () => toast(t('common.comingSoon'))

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-bold">{t('nav.deposit')}</h1>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <BalanceCard summary={depositSummary} onInvoice={downloadInvoice} onTtGuide={() => setTtOpen(true)} />
        <AlertsCard
          alerts={depositAlerts}
          onLink={(link) =>
            link === 'invoice'
              ? downloadInvoice()
              : document.getElementById('deposit-history')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
      </div>

      <HistoryCard transactions={transactions} asOf={depositSummary.asOf} />

      <TtGuideDialog open={ttOpen} onOpenChange={setTtOpen} />
    </div>
  )
}
