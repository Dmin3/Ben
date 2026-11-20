import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { postJson } from '@/lib/api'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/i18n'
import { useSettings, type Theme } from '@/stores/settings'

const THEMES: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

const optionClass =
  'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted has-data-checked:border-primary has-data-checked:bg-accent'

/** 로그아웃: BE가 세션과 쿠키를 지운다. 실패해도(이미 만료 등) 로그인 화면으로 보낸다 */
function LogoutButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)

  const logout = async () => {
    setBusy(true)
    await postJson('/api/auth/logout', {})
    queryClient.clear() // 이전 사용자의 화면 데이터가 남지 않게
    navigate('/login', { replace: true })
  }

  return (
    <Button variant="ghost" className="h-10 px-3 text-muted-foreground sm:mr-auto" onClick={logout} disabled={busy}>
      <LogOut className="size-4" />
      {t('settings.logout')}
    </Button>
  )
}

/** 웹사이트 설정: 언어, 테마. 고르는 즉시 적용되고 브라우저에 저장된다. 로그인 뒤 화면에서는 로그아웃도 둔다 */
export function SettingsDialog({
  open,
  onOpenChange,
  showLogout,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  showLogout?: boolean
}) {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = useSettings()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-[13px] font-semibold">{t('settings.language')}</h3>
          <RadioGroup value={language} onValueChange={(v) => setLanguage(v as typeof language)} aria-label={t('settings.language')}>
            {LANGUAGES.map((l) => (
              <label key={l.code} lang={l.code} className={optionClass}>
                <span className="flex-1 text-sm font-medium">{l.label}</span>
                <RadioGroupItem value={l.code} />
              </label>
            ))}
          </RadioGroup>
        </section>

        <section className="space-y-2">
          <h3 className="text-[13px] font-semibold">{t('settings.theme')}</h3>
          <RadioGroup
            value={theme}
            onValueChange={(v) => setTheme(v as Theme)}
            aria-label={t('settings.theme')}
            className="grid-cols-3"
          >
            {THEMES.map(({ value, icon: Icon }) => (
              <label key={value} className={`${optionClass} flex-col justify-center gap-2 py-4`}>
                <Icon className="size-5 text-primary" />
                <span className="text-[13px] font-medium">{t(`settings.themes.${value}`)}</span>
                <RadioGroupItem value={value} className="sr-only" />
              </label>
            ))}
          </RadioGroup>
          {/* 테마를 바꿀 때 모달 높이가 출렁이지 않도록 자리는 항상 차지하고 보이기만 바꾼다 */}
          <p className={cn('text-xs text-muted-foreground', theme !== 'system' && 'invisible')} aria-hidden={theme !== 'system'}>
            {t('settings.systemHint')}
          </p>
        </section>

        <DialogFooter>
          {showLogout && <LogoutButton />}
          <DialogClose render={<Button className="h-10 px-5 font-semibold" />}>{t('common.close')}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
