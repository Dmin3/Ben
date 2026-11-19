import { useTranslation } from 'react-i18next'
import ComingSoon from '@/pages/coming-soon'
import { AuthShell } from './auth-shell'

// ponytail: 계정 찾기는 BE API(휴대폰 인증으로 이메일 찾기·비밀번호 재설정)가 생기면 만든다
export default function FindAccount() {
  const { t } = useTranslation()
  return (
    <AuthShell title={t('auth.findAccount')} compact>
      <ComingSoon backTo="/login" />
    </AuthShell>
  )
}
