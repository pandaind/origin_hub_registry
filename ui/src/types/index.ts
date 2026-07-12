export type AssetType = 'skill' | 'agent' | 'instruction' | 'workflow' | 'extension'

export interface AssetVersion {
  version: string
  published_at: string
  bundle_size?: number
  yanked?: boolean
  manifest?: Record<string, unknown>
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  description: string | null
  tags: string[]
  author: string | null
  download_count: number
  latest_version: AssetVersion | null
  versions: AssetVersion[]
}

export interface AssetListOut {
  items: Asset[]
  total: number
  limit: number
  offset: number
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  username: string
  api_key: string
}

export interface UserOut {
  id: number
  username: string
  email: string
}
