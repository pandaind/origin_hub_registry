import type { Asset, AssetListOut, AssetVersion } from '@/types'

const BASE = ''  // same origin via Vite proxy

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail?.detail ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// ── Assets ────────────────────────────────────────────────────────────────────

export const api = {
  assets: {
    list(params?: { q?: string; limit?: number; offset?: number }): Promise<AssetListOut> {
      const search = new URLSearchParams()
      if (params?.q) search.set('q', params.q)
      if (params?.limit != null) search.set('limit', String(params.limit))
      if (params?.offset != null) search.set('offset', String(params.offset))
      return request<AssetListOut>(`/assets?${search}`)
    },

    get(name: string): Promise<Asset> {
      return request<Asset>(`/assets/${name}`)
    },

    versions(name: string): Promise<AssetVersion[]> {
      return request<AssetVersion[]>(`/assets/${name}/versions`)
    },
  },
}
