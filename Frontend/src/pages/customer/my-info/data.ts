import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getJson, type ApiResult } from '@/lib/api'

// GET /api/my-info 응답 (BE src/lib/my-info.ts getMyInfo)
export type MyAddress = { id: string; name: string; address: string; recipient: string; phone: string; isDefault: boolean }
export type MyInfo = {
  profile: { userId: string; name: string; email: string | null; companyName: string; customerNo: string; joinedAt: string; memberType: 'MAIN' | 'SUB'; role: string }
  company: { name: string; nameEn: string | null; businessNo: string | null; ceoName: string | null; businessType: string | null; address: string | null; certificate: string | null }
  contact: { name: string; title: string; phone: string; email: string } | null
  addresses: MyAddress[]
  benManager: { name: string; email: string | null; title: string | null; phone: string | null; description: string | null } | null
  account: { loginId: string | null; authMethod: string; linkedProviders: { provider: string; email: string | null }[]; canChangePassword: boolean }
  capabilities: { canEditCompany: boolean; canEditContact: boolean; canManageAddresses: boolean; canChangePassword: boolean }
}

export const MY_INFO_KEY = ['my-info']

export const useMyInfo = () =>
  useQuery({
    queryKey: MY_INFO_KEY,
    queryFn: async () => {
      const res = await getJson<MyInfo>('/api/my-info')
      if (!res.ok) throw Object.assign(new Error(res.code), { status: res.status })
      return res.data
    },
    retry: false,
  })

/** 저장 요청을 보내고, 성공하면 내 정보를 다시 읽는다. 실패하면 BE 에러 코드에 맞는 문구를 띄우고 false */
export function useSaveMyInfo() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  return async (call: Promise<ApiResult<unknown>>) => {
    const res = await call
    if (!res.ok) {
      const key = `myInfo.errors.${res.code}`
      toast.error(t(i18n.exists(key) ? (key as ParseKeys) : 'myInfo.errors.default'))
      return false
    }
    await queryClient.invalidateQueries({ queryKey: MY_INFO_KEY })
    return true
  }
}
