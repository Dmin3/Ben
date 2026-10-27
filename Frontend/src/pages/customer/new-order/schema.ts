import { z } from 'zod'

// 에러 메시지는 번역 키. Field 컴포넌트가 화면 언어로 바꿔 보여준다

export const PROCESS_TYPES = ['sample', 'reorder'] as const
export const SHIPPING_METHODS = ['sea', 'air', 'express', 'recommend'] as const

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const newOrderSchema = z.object({
  // 1. 기본 정보
  productName: z.string().trim().min(1, 'validation.productName'),
  category: z.string().min(1, 'validation.category'),
  dueDate: z
    .string()
    .min(1, 'validation.dueDate')
    .refine((v) => new Date(v) >= today(), 'validation.dueDateFuture'),
  internalCode: z.string(),

  // 2. 제품 사양
  files: z.array(z.instanceof(File)).min(1, 'validation.files'),
  memo: z.string(),

  // 3. 수량
  quantities: z
    .array(
      z.object({
        color: z.string().trim().min(1, 'validation.color'),
        size: z.string().trim().min(1, 'validation.size'),
        qty: z.number({ error: 'validation.qty' }).int('validation.qtyInt').min(1, 'validation.qtyMin'),
      }),
    )
    .min(1, 'validation.quantities'),

  // 4. 진행 범위
  process: z.enum(PROCESS_TYPES, { error: 'validation.process' }),
  inspection: z.string(),
  factory: z.string(),

  // 5. 배송 · 통관
  shipping: z.enum(SHIPPING_METHODS, { error: 'validation.shipping' }),
  destination: z.string().min(1, 'validation.destination'),
})

export type NewOrderForm = z.infer<typeof newOrderSchema>
