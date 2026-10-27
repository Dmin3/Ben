import 'i18next'
import type { Messages } from './locales/ko'

// t('키')에 없는 키를 쓰면 타입 에러가 나게 한다
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: Messages }
  }
}
