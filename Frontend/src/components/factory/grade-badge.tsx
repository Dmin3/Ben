import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { FactoryGrade } from '@/mocks/factories'

/** 공장 등급: 우수(파랑) / 양호(초록) */
export function FactoryGradeBadge({ grade }: { grade: FactoryGrade }) {
  const { t } = useTranslation()
  return <Badge variant={grade === 'excellent' ? 'info' : 'success'}>{t(`factories.grades.${grade}`)}</Badge>
}
