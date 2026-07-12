import { useState, useDeferredValue } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/Header'
import { SearchBar } from '@/components/SearchBar'
import { TypeFilter } from '@/components/TypeFilter'
import { AssetCard } from '@/components/AssetCard'
import { AssetModal } from '@/components/AssetModal'
import { EmptyState } from '@/components/EmptyState'
import { api } from '@/lib/api'
import type { Asset, AssetType } from '@/types'

export function HomePage() {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<AssetType | ''>('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const deferredQuery = useDeferredValue(query)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['assets', deferredQuery],
    queryFn: () => api.assets.list({ q: deferredQuery || undefined, limit: 100 }),
    staleTime: 30_000,
  })

  const allAssets = data?.items ?? []
  const filtered = activeType ? allAssets.filter((a) => a.type === activeType) : allAssets

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header totalAssets={data?.total} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-16 text-center">
        {/* bg glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -top-32"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl">
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] leading-[1.1]"
            style={{ color: 'var(--text)' }}
          >
            The AI Workflow{' '}
            <span
              className="bg-gradient-to-br from-violet-400 to-purple-500 bg-clip-text text-transparent"
            >
              Registry
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-dim)' }}>
            Discover, install, and share Agent Forge templates and AI workflows
          </p>

          <div className="mt-8 space-y-4">
            <SearchBar value={query} onChange={setQuery} />
            <TypeFilter active={activeType} onChange={setActiveType} />
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        {/* results label */}
        {!isLoading && !isError && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {filtered.length === 0
              ? 'No results'
              : `${filtered.length} asset${filtered.length !== 1 ? 's' : ''}`}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading && <EmptyState variant="loading" />}
          {isError && <EmptyState variant="error" />}
          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState variant={query || activeType ? 'no-results' : 'empty'} />
          )}
          {!isLoading &&
            !isError &&
            filtered.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onClick={setSelectedAsset} />
            ))}
        </div>
      </main>

      {/* Modal */}
      <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </div>
  )
}
