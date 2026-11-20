import { z } from 'zod'

// 에러 메시지는 번역 키. Field 컴포넌트가 화면 언어로 바꿔 보여준다

/** 새 비밀번호: BE 최소 10자에 맞추고 영문·숫자를 섞게 한다 */
export const newPassword = z
  .string()
  .min(10, 'validation.passwordMin')
  .max(128, 'validation.passwordMax')
  .regex(/[A-Za-z]/, 'validation.passwordLetter')
  .regex(/\d/, 'validation.passwordDigit')
