import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Plus } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm, type DefaultValues } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BasicInfoSection } from './basic-info-section'
import { NextSteps, OrderSummary } from './order-summary'
import { QuantitySection } from './quantity-section'
import { newOrderSchema, type NewOrderForm } from './schema'
import { ScopeSection } from './scope-section'
import { ShippingSection } from './shipping-section'
import { SpecSection } from './spec-section'

// ponytail: 임시저장은 브라우저 localStorage. 첨부파일은 저장 불가. API가 생기면 서버 임시저장으로 교체
const DRAFT_KEY = 'ben:new-order-draft:v2'

const EMPTY: DefaultValues<NewOrderForm> = {
  productName: '',
  category: '',
  dueDate: '',
  internalCode: '',
  files: [],
  memo: '',
  quantities: [{ color: '', size: '', qty: NaN }],
  inspection: '',
  factory: 'ben',
  destination: '',
}

function loadDraft(): DefaultValues<NewOrderForm> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw), files: [] } : EMPTY
  } catch {
    return EMPTY
  }
}

export default function NewOrder() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [defaultValues] = useState(loadDraft)
  const form = useForm<NewOrderForm>({ resolver: zodResolver(newOrderSchema), defaultValues })

  const onValid = (values: NewOrderForm) => {
    // TODO(API): 오더 요청 API로 전송
    console.log('[new order]', values)
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // 저장소를 못 쓰는 환경이면 무시
    }
    toast.success(t('newOrder.toast.submitted'))
    navigate('/')
  }

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form.getValues(), files: [] }))
      toast.success(t('newOrder.toast.draftSaved'), { description: t('newOrder.toast.draftSavedDescription') })
    } catch {
      toast.error(t('newOrder.toast.draftUnavailable'))
    }
  }

  const submit = form.handleSubmit(onValid, () => toast.error(t('newOrder.toast.checkRequired')))

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <header className="mb-5">
          <Link to="/" className="mb-3 flex w-fit items-center gap-0.5 text-sm text-muted-foreground lg:hidden">
            <ChevronLeft className="size-4" />
            {t('nav.home')}
          </Link>
          <h1 className="text-[22px] font-bold">{t('newOrder.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Trans i18nKey="newOrder.subtitle" components={{ req: <span className="text-destructive" /> }} />
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="space-y-4">
            <BasicInfoSection />
            <SpecSection />
            <QuantitySection />
            <ScopeSection />
            <ShippingSection />
          </div>

          <aside className="space-y-3 lg:sticky lg:top-7">
            <OrderSummary />
            <NextSteps />
            {/* 데스크톱 버튼. 모바일은 아래 고정 바 사용 */}
            <div className="hidden space-y-2 lg:block">
              <Button type="submit" className="h-12 w-full text-[15px] font-semibold">
                <Plus /> {t('newOrder.submit')}
              </Button>
              <Button type="button" variant="outline" className="h-12 w-full text-[15px] font-semibold" onClick={saveDraft}>
                {t('newOrder.saveDraft')}
              </Button>
            </div>
          </aside>
        </div>

        {/* 모바일 하단 고정 버튼 바 */}
        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
          <Button type="button" variant="outline" className="h-11 flex-1 font-semibold" onClick={saveDraft}>
            {t('newOrder.saveDraft')}
          </Button>
          <Button type="submit" className="h-11 flex-[2] font-semibold">
            <Plus /> {t('newOrder.submit')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
