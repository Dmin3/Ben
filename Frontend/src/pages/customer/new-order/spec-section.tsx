import { useTranslation } from 'react-i18next'
import { FileSpreadsheet, FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Field } from '@/components/form/field'
import { Section } from './form-parts'
import type { NewOrderForm } from './schema'

const ACCEPT = 'image/*,.pdf,.xls,.xlsx,.csv'
const ALLOWED = /\.(png|jpe?g|gif|webp|heic|bmp|pdf|xlsx?|csv)$/i
// ponytail: 파일당 20MB는 임시값. BE 업로드 제한과 맞춘다
const MAX_SIZE = 20 * 1024 * 1024

/** 허용 형식과 크기를 통과한 파일만 돌려주고, 나머지는 알림으로 안내 */
function pickValid(list: FileList | null): File[] {
  const files = Array.from(list ?? [])
  const valid = files.filter((f) => ALLOWED.test(f.name) && f.size <= MAX_SIZE)
  const rejected = files.length - valid.length
  if (rejected > 0) toast.error(i18n.t('newOrder.toast.filesRejected', { count: rejected }))
  return valid
}

/** 첨부 파일 타일. 이미지는 썸네일, 그 외(PDF, 엑셀)와 미리보기 불가 이미지(HEIC 등)는 아이콘 */
function FileTile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const { t } = useTranslation()
  const [broken, setBroken] = useState(false)

  // 미리보기용 임시 URL. 이미지가 화면에서 빠지면 해제해서 메모리 누수를 막는다 (React 19 ref 정리 함수)
  const previewRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return
      const url = URL.createObjectURL(file)
      img.src = url
      return () => URL.revokeObjectURL(url)
    },
    [file],
  )

  const Icon = /\.(xlsx?|csv)$/i.test(file.name) ? FileSpreadsheet : FileText

  return (
    <li className="w-24">
      <div className="relative size-24 overflow-hidden rounded-lg border bg-muted">
        {file.type.startsWith('image/') && !broken ? (
          <img ref={previewRef} alt={file.name} onError={() => setBroken(true)} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-primary">
            <Icon className="size-8" />
          </div>
        )}
        <button
          type="button"
          aria-label={t('newOrder.fields.deleteFile', { name: file.name })}
          onClick={onRemove}
          className="absolute top-1 right-1 rounded-full bg-black/55 p-1 text-white hover:bg-black/75"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground" title={file.name}>
        {file.name}
      </div>
    </li>
  )
}

export function SpecSection() {
  const { t } = useTranslation()
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewOrderForm>()
  const [dragging, setDragging] = useState(false)

  return (
    <Section step={2} title={t('newOrder.sections.spec.title')} description={t('newOrder.sections.spec.description')}>
      <Controller
        control={control}
        name="files"
        render={({ field }) => {
          const add = (list: FileList | null) => field.onChange([...field.value, ...pickValid(list)])
          return (
            <Field label={t('newOrder.fields.files')} required error={errors.files?.message}>
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  add(e.dataTransfer.files)
                }}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-xl border border-dashed bg-muted/60 px-5 py-4 transition-colors hover:bg-accent',
                  dragging && 'border-primary bg-accent',
                  errors.files && 'border-destructive',
                )}
              >
                <Upload className="size-6 text-primary" />
                <div>
                  <div className="text-sm font-semibold">{t('newOrder.fields.uploadTitle')}</div>
                  <div className="text-xs text-muted-foreground">{t('newOrder.fields.uploadDescription')}</div>
                </div>
                <input
                  ref={field.ref}
                  aria-label={t('newOrder.fields.uploadAria')}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    add(e.target.files)
                    e.target.value = '' // 같은 파일을 다시 고를 수 있게 초기화
                  }}
                />
              </label>

              {field.value.length > 0 && (
                <ul className="flex flex-wrap gap-3 pt-1">
                  {field.value.map((file, i) => (
                    <FileTile
                      key={`${file.name}-${file.lastModified}-${i}`}
                      file={file}
                      onRemove={() => field.onChange(field.value.filter((_, j) => j !== i))}
                    />
                  ))}
                </ul>
              )}
            </Field>
          )
        }}
      />

      <Field
        label={t('newOrder.fields.memo')}
        htmlFor="memo"
        hint={<span className="ml-1 font-normal text-destructive">{t('newOrder.fields.memoHint')}</span>}
      >
        <Textarea
          id="memo"
          rows={6}
          placeholder={t('newOrder.fields.memoPlaceholder')}
          className="bg-card"
          {...register('memo')}
        />
      </Field>
    </Section>
  )
}
