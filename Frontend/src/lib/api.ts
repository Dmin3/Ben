/** BE 응답. 실패면 code에 BE 에러 코드 (예: EMAIL_EXISTS), 네트워크 오류는 'default' */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string }

async function request<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await res.json().catch(() => null)
    if (res.ok) return { ok: true, data: data as T }
    return { ok: false, status: res.status, code: data?.error?.code ?? 'default' }
  } catch {
    return { ok: false, status: 0, code: 'default' }
  }
}

export const getJson = <T>(url: string) => request<T>('GET', url)
export const postJson = <T = unknown>(url: string, body: unknown) => request<T>('POST', url, body)
export const patchJson = <T = unknown>(url: string, body: unknown) => request<T>('PATCH', url, body)
export const putJson = <T = unknown>(url: string, body?: unknown) => request<T>('PUT', url, body)
export const deleteJson = (url: string) => request<null>('DELETE', url)
