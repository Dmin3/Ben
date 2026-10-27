import { useSettings, type Theme } from '@/stores/settings'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

/** <html>에 dark 클래스를 붙이거나 뗀다. 첫 화면은 index.html 스크립트가 미리 적용한다 */
function apply(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && darkQuery.matches)
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light' // 스크롤바, 날짜 선택기 같은 브라우저 기본 UI도 맞춘다
}

apply(useSettings.getState().theme)
useSettings.subscribe(({ theme }) => apply(theme))
// "시스템 설정"일 때 기기 테마가 바뀌면 따라간다
darkQuery.addEventListener('change', () => apply(useSettings.getState().theme))
