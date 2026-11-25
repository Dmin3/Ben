import { FileSpreadsheet, X } from 'lucide-react'
import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

/**
 * 엑셀로 일괄 등록: 고객사 자체 양식 파일을 그대로 올리고 메모를 남긴다.
 * BEN 담당자가 관리자 "신규 오더 확인"에서 파일을 보고 품목별로 옮겨 적는다 (기획 시안 기준)
 */
export function BulkUploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])
  const [memo, setMemo] = useState('')

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = [...(e.target.files ?? [])]
    e.target.value = ''
    setFiles((l) => [...l, ...picked.filter((f) => !l.some((x) => x.name === f.name))])
  }
  const close = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      setFiles([])
      setMemo('')
    }
  }
  // TODO(API): 파일 업로드 + 신규 오더(고객 양식 파일) 접수
  const submit = () => {
    toast.success(t('bulkUpload.submitted'))
    close(false)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('home.excelUpload')}</DialogTitle>
          <DialogDescription>{t('bulkUpload.description')}</DialogDescription>
        </DialogHeader>

        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed py-6 text-center text-[13px] text-muted-foreground hover:bg-muted/50">
          <FileSpreadsheet className="size-6" />
          <span className="font-semibold text-foreground">{t('bulkUpload.choose')}</span>
          {t('bulkUpload.chooseHint')}
          <input type="file" multiple accept=".xlsx,.xls,.csv,.pdf,image/*" className="sr-only" onChange={onFiles} />
        </label>

        {files.length > 0 && (
          <ul className="space-y-1.5">
            {files.map((f) => (
              <li key={f.name} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{Math.ceil(f.size / 1024).toLocaleString('ko-KR')} KB</span>
                <button
                  type="button"
                  aria-label={t('newOrder.fields.deleteFile', { name: f.name })}
                  onClick={() => setFiles((l) => l.filter((x) => x !== f))}
                  className="rounded p-0.5 text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="block space-y-1.5 text-[13px] font-semibold">
          {t('bulkUpload.memo')}
          <Textarea rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t('bulkUpload.memoPlaceholder')} />
        </label>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" className="h-10 px-4" />}>{t('common.cancel')}</DialogClose>
          <Button className="h-10 px-5 font-semibold" disabled={!files.length} onClick={submit}>
            {t('bulkUpload.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
