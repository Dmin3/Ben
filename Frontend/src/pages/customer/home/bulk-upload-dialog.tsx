import { Download, FileSpreadsheet } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { downloadCsv, readCsvFile } from '@/lib/csv'
import { num } from '@/lib/format'
import { cn } from '@/lib/utils'

// 양식 칸 순서. 한 줄 = 제품 하나의 색상·사이즈 한 줄. 같은 제품명은 한 오더로 묶인다
const COLUMNS = ['productName', 'category', 'color', 'size', 'qty', 'dueDate', 'memo'] as const

type Row = { line: number; values: Record<(typeof COLUMNS)[number], string>; errors: string[] }

/** 새 오더 화면과 같은 기준: 제품명·색상·사이즈·수량(1 이상 정수)·희망 입고일(오늘 이후). 한 줄의 오류를 모두 모은다 */
function check(v: Row['values']): string[] {
  const errors: string[] = []
  if (!v.productName.trim()) errors.push('validation.productName')
  if (!v.color.trim()) errors.push('validation.color')
  if (!v.size.trim()) errors.push('validation.size')
  const qty = v.qty.replaceAll(',', '').trim()
  if (!/^\d+$/.test(qty) || Number(qty) < 1) errors.push('validation.qtyMin')
  const date = v.dueDate.trim().replaceAll('.', '-').replaceAll('/', '-')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.push('bulkUpload.errors.date')
  else if (new Date(date) < today) errors.push('validation.dueDateFuture')
  return errors
}

export function BulkUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const [file, setFile] = useState<string>()
  const [rows, setRows] = useState<Row[]>([])
  const [fileError, setFileError] = useState<string>()

  const headers = COLUMNS.map((c) => t(`bulkUpload.cols.${c}`))
  const template = () =>
    downloadCsv('ben-order-template.csv', [headers, ['울 블렌드 롱코트', '의류 · 아우터', '블랙', 'M', 100, '2026-12-20', '왼쪽 가슴 자수']])

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setFile(f.name)
    const [head, ...body] = await readCsvFile(f)
    // 첫 줄은 양식의 제목 줄이어야 한다 (칸 순서가 바뀌면 잘못 읽으므로 막는다)
    if (!head || head.slice(0, COLUMNS.length).map((h) => h.replace('*', '').trim()).join() !== headers.join()) {
      setRows([])
      setFileError('bulkUpload.errors.columns')
      return
    }
    setFileError(body.length ? undefined : 'bulkUpload.errors.empty')
    setRows(
      body.map((cells, i) => {
        const values = Object.fromEntries(COLUMNS.map((c, j) => [c, cells[j] ?? ''])) as Row['values']
        return { line: i + 2, values, errors: check(values) }
      }),
    )
  }

  const errors = rows.filter((r) => r.errors.length).length
  const orders = new Set(rows.map((r) => r.values.productName.trim())).size
  const canSubmit = rows.length > 0 && errors === 0

  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setFile(undefined)
      setRows([])
      setFileError(undefined)
    }
  }
  const submit = () => {
    // TODO(API): 일괄 오더 요청 API
    toast.success(t('bulkUpload.submitted', { count: orders }))
    close(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('home.excelUpload')}</DialogTitle>
          <DialogDescription>{t('bulkUpload.description')}</DialogDescription>
        </DialogHeader>

        <ol className="space-y-3">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
            <div className="text-sm">
              <b className="mr-1.5 text-primary">1</b>
              {t('bulkUpload.step1')}
            </div>
            <Button variant="outline" size="sm" onClick={template}>
              <Download /> {t('bulkUpload.template')}
            </Button>
          </li>
          <li className="space-y-2 rounded-xl border px-4 py-3">
            <div className="text-sm">
              <b className="mr-1.5 text-primary">2</b>
              {t('bulkUpload.step2')}
            </div>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed py-5 text-center text-[13px] text-muted-foreground hover:bg-muted/50">
              <FileSpreadsheet className="size-5" />
              <span className="font-semibold text-foreground">{file ?? t('bulkUpload.choose')}</span>
              {t('bulkUpload.chooseHint')}
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
            </label>
          </li>
        </ol>

        {fileError && <p className="rounded-lg bg-danger-subtle px-3 py-2.5 text-[13px] text-destructive">{t(fileError as 'bulkUpload.errors.columns')}</p>}

        {rows.length > 0 && (
          <div className="space-y-2">
            <p className="text-[13px]">
              {t('bulkUpload.summary', { orders, lines: rows.length })}
              {errors > 0 && <b className="ml-2 text-destructive">{t('bulkUpload.errorCount', { count: errors })}</b>}
            </p>
            <div className="max-h-64 overflow-auto rounded-xl border">
              <table className="w-full text-[13px] whitespace-nowrap">
                <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-normal">#</th>
                    <th className="px-3 py-2 text-left font-normal">{t('bulkUpload.result')}</th>
                    {(['productName', 'color', 'size', 'qty', 'dueDate'] as const).map((c) => (
                      <th key={c} className="px-3 py-2 text-left font-normal">
                        {t(`bulkUpload.cols.${c}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.line} className={cn('border-t align-top', r.errors.length && 'bg-danger-subtle/60')}>
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{r.line}</td>
                      <td className={cn('px-3 py-2', r.errors.length ? 'font-semibold whitespace-normal text-destructive' : 'text-success')}>
                        {r.errors.length ? r.errors.map((e) => <div key={e}>{t(e as 'validation.qtyMin')}</div>) : t('bulkUpload.ok')}
                      </td>
                      <td className="px-3 py-2">{r.values.productName}</td>
                      <td className="px-3 py-2">{r.values.color}</td>
                      <td className="px-3 py-2">{r.values.size}</td>
                      <td className="px-3 py-2 tabular-nums">{/^\d+$/.test(r.values.qty) ? num(Number(r.values.qty)) : r.values.qty}</td>
                      <td className="px-3 py-2 tabular-nums">{r.values.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {errors > 0 && <p className="text-xs text-muted-foreground">{t('bulkUpload.fixHint')}</p>}
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" className="h-10 px-4" />}>{t('common.cancel')}</DialogClose>
          <Button className="h-10 px-5 font-semibold" disabled={!canSubmit} onClick={submit}>
            {canSubmit ? t('bulkUpload.submit', { count: orders }) : t('bulkUpload.submitIdle')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
