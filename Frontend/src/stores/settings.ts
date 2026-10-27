import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'ko' | 'en' | 'zh'

/** 처음 접속하면 브라우저 언어로 고른다 */
function detectLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('en')) return 'en'
  return 'ko'
}

type SettingsState = {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
}

// ponytail: 지금은 브라우저에만 저장. 다른 기기에서도 유지하려면 BE 사용자 설정 API로 옮긴다
// 저장 키 'ben:settings'는 index.html의 테마 선적용 스크립트와 맞춰야 한다
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: detectLanguage(),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'ben:settings', partialize: ({ theme, language }) => ({ theme, language }) },
  ),
)
