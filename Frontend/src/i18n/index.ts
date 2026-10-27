import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useSettings, type Language } from '@/stores/settings'
import en from './locales/en'
import ko from './locales/ko'
import zh from './locales/zh'

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
]

// <html lang>: 스크린리더 발음과 중국어 폰트 선택(:lang(zh))에 쓰인다
const HTML_LANG: Record<Language, string> = { ko: 'ko', en: 'en', zh: 'zh-CN' }

const initial = useSettings.getState().language
document.documentElement.lang = HTML_LANG[initial]

void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en }, zh: { translation: zh } },
  lng: initial,
  fallbackLng: 'ko',
  interpolation: { escapeValue: false }, // React가 이미 이스케이프한다
})

// 설정에서 언어를 바꾸면 바로 반영
useSettings.subscribe(({ language }) => {
  if (language === i18n.language) return
  void i18n.changeLanguage(language)
  document.documentElement.lang = HTML_LANG[language]
})

export default i18n
