import { Building2, ChevronRight, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AuthShell } from '../auth-shell'
import { SocialButtons } from '../login/social-buttons'

/** 가입 첫 화면: 회사 대표(메인) / 직원(서브) 선택 + 간편 가입 */
export default function Signup() {
  const { t } = useTranslation()
  const options = [
    { to: '/signup/main', icon: Building2, title: t('signup.mainTitle'), desc: t('signup.mainDesc') },
    { to: '/signup/sub', icon: Users, title: t('signup.subTitle'), desc: t('signup.subDesc') },
  ]

  return (
    <AuthShell title={t('auth.signup')} compact>
      <div className="space-y-6">
        <ul className="space-y-3">
          {options.map((o) => (
            <li key={o.to}>
              <Link
                to={o.to}
                className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-primary hover:bg-primary-soft/40"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <o.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{o.title}</span>
                  <span className="block text-[13px] text-muted-foreground">{o.desc}</span>
                </span>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 text-xs text-subtle-foreground">
          <span className="h-px flex-1 bg-border" />
          {t('signup.orSocial')}
          <span className="h-px flex-1 bg-border" />
        </div>
        {/* 간편 가입은 로그인과 같은 입구. 처음 온 사람은 /onboarding 에서 회사를 만들거나 합류한다 */}
        <SocialButtons mode="signup" />

        <p className="text-center text-[13px] text-muted-foreground">
          {t('signup.hasAccount')}
          <Link to="/login" className="ml-2 font-bold text-primary hover:underline">
            {t('auth.submit')}
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
