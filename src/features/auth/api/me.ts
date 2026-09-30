import { useQuery } from '@tanstack/react-query'
import type { MeData } from '../types'
import type { ApiEnvelope } from '@/types/api'

export const authKeys = { me: ['auth', 'me'] as const }
let loginInFlight: Promise<void> | null = null

function telegramInitData(): string {
  const app = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
  return app?.initData || new URLSearchParams(window.location.hash.slice(1)).get('tgWebAppData') || ''
}

async function fetchMe(): Promise<MeData | null> {
  const res = await fetch('/api/v1/auth/me', { cache: 'no-store' })
  const body = (await res.json()) as ApiEnvelope<MeData>
  if (body.ok) return body.data
  if (res.status !== 401) throw new Error('Auth endpoint error: ' + body.error.code)
  const initData = telegramInitData()
  if (!initData) return null
  loginInFlight ??= fetch('/api/v1/auth/telegram', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ initData }),
  }).then(async (response) => {
    if (!response.ok) {
      const result = await response.json() as { error?: { code?: string } }
      throw new Error('Telegram login failed: ' + (result.error?.code ?? response.status))
    }
  }).finally(() => { loginInFlight = null })
  await loginInFlight
  const verified = await fetch('/api/v1/auth/me', { cache: 'no-store' })
  const result = await verified.json() as ApiEnvelope<MeData>
  if (result.ok) return result.data
  throw new Error('Session unavailable: ' + result.error.code)
}

export function useMeQuery(options?: { enabled?: boolean }) {
  return useQuery({ queryKey: authKeys.me, queryFn: fetchMe, retry: false,
    staleTime: 30_000, refetchOnWindowFocus: false, enabled: options?.enabled })
}
