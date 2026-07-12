import { Download } from 'lucide-react'
import type { Asset } from '@/types'
import { TypeBadge } from './TypeBadge'

interface AssetCardProps {
  asset: Asset
  onClick: (asset: Asset) => void
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const version = asset.latest_version ? `v${asset.latest_version.version}` : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(asset)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(asset)}
      className="group relative cursor-pointer rounded-2xl p-5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border-hover)'
        el.style.backgroundColor = 'var(--card-hover)'
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = '0 8px 32px var(--shadow)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--border)'
        el.style.backgroundColor = 'var(--card-bg)'
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* glow on hover (dark only) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_80%_20%,rgba(124,108,241,0.1),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3">
        {/* header row */}
        <div className="flex items-start justify-between gap-2">
          <TypeBadge type={asset.type} />
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-dim)' }}>
            <Download className="h-3 w-3" />
            {asset.download_count.toLocaleString()}
          </span>
        </div>

        {/* name */}
        <div>
          <p className="font-mono text-sm font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {asset.name}
          </p>
          {version && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{version}</p>
          )}
        </div>

        {/* description */}
        <p className="line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {asset.description ?? 'No description provided.'}
        </p>

        {/* tags */}
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {asset.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[11px]"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-dim)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {asset.author ?? 'anonymous'}
          </span>
          {version && (
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{version}</span>
          )}
        </div>
      </div>
    </div>
  )
}
