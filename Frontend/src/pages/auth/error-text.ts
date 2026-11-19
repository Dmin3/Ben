import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'

/** BE 에러 코드를 화면 문구로. 모르는 코드는 기본 문구 */
export function useErrorText() {
  const { t, i18n } = useTranslation()
  return (code: string | null) => {
    if (!code) return null
    const key = `auth.errors.${code}`
    return t(i18n.exists(key) ? (key as ParseKeys) : 'auth.errors.default')
  }
}
