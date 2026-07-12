import { useEffect, useRef, useState } from 'react'
import { X, Download, Copy, Check, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Asset } from '@/types'
import { TypeBadge } from './TypeBadge'
import { api } from '@/lib/api'

interface AssetModalProps {
  asset: Asset | null
  onClose: () => void
}

export function AssetModal({ asset, onClose }: AssetModalProps) {
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const { data: versions = [], refetch } = useQuery({
    queryKey: ['asset-versions', asset?.name],
    queryFn: () => api.assets.versions(asset!.name),
    enabled: !!asset,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (asset) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [asset])

  function handleCopy() {
    if (!asset) return
    navigator.clipboard.writeText(`origin hub install ${asset.name}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!asset) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${asset.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--modal-bg)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 transition-colors"
          style={{ color: 'var(--text-dim)', backgroundColor: 'transparent' }}
          aria-label="Close modal"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* type + name */}
          <TypeBadge type={asset.type} className="mb-3" />
          <h2 className="font-mono text-xl font-bold" style={{ color: 'var(--text)' }}>{asset.name}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
            <span>by {asset.author ?? 'anonymous'}</span>
            <span>·</span>
            <Download className="h-3.5 w-3.5" />
            <span>{asset.download_count.toLocaleString()} downloads</span>
          </p>

          {/* description */}
          <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {asset.description ?? 'No description provided.'}
          </p>

          {/* tags */}
          {asset.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {asset.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-xs"
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

          {/* install command */}
          {(!versions[0] || !versions[0].yanked) ? (
            <div
              className="mt-5 flex items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: 'var(--code-bg)', border: '1px solid var(--border)' }}
            >
              <code className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                origin hub install {asset.name}
              </code>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={copied
                  ? { backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399' }
                  : { backgroundColor: 'var(--accent)', color: '#fff' }
                }
              >
                {copied
                  ? <><Check className="h-3.5 w-3.5" /> Copied!</>
                  : <><Copy className="h-3.5 w-3.5" /> Copy</>
                }
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl px-4 py-3 text-center text-sm font-medium text-red-400" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              This version has been yanked and is no longer available for installation.
            </div>
          )}

          {/* version history */}
          <div className="mt-6">
            <h3
              className="mb-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Version History
            </h3>
            {versions.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No versions published yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {versions.slice(0, 6).map((v, i) => (
                  <div
                    key={v.version}
                    className="flex flex-col gap-2 rounded-lg px-3 py-2"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-2 font-mono text-sm ${v.yanked ? 'text-red-400 line-through' : 'text-emerald-500'}`}>
                        {i === 0 && !v.yanked && (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                            latest
                          </span>
                        )}
                        {v.yanked && (
                          <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                            yanked
                          </span>
                        )}
                        v{v.version}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                          <Calendar className="h-3 w-3" />
                          {new Date(v.published_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await api.assets.yank(asset.name, v.version)
                              refetch()
                            } catch (e: any) {
                              alert(e.message)
                            }
                          }}
                          className="text-[10px] uppercase font-bold tracking-wider hover:opacity-70 transition-opacity"
                          style={{ color: v.yanked ? '#34d399' : '#ef4444' }}
                        >
                          {v.yanked ? 'Restore' : 'Yank'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
