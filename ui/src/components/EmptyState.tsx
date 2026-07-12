import { AlertTriangle, SearchX, PackageOpen } from 'lucide-react'

type EmptyStateVariant = 'loading' | 'empty' | 'error' | 'no-results'

interface EmptyStateProps {
  variant: EmptyStateVariant
  message?: string
}

export function EmptyState({ variant, message }: EmptyStateProps) {
  if (variant === 'loading') {
    return (
      <div className="col-span-full py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 w-full animate-pulse rounded-2xl"
              style={{ backgroundColor: 'var(--surface-2)', animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  const config = {
    empty: {
      Icon: PackageOpen,
      title: 'No assets yet',
      sub: message ?? 'Be the first to publish a package.',
    },
    error: {
      Icon: AlertTriangle,
      title: 'Could not reach the Hub API',
      sub: message ?? 'Make sure the registry server is running at :8000.',
    },
    'no-results': {
      Icon: SearchX,
      title: 'No results',
      sub: message ?? 'Try a different search term or filter.',
    },
  } as const

  const { Icon, title, sub } = config[variant as Exclude<EmptyStateVariant, 'loading'>]

  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)' }}
      >
        <Icon className="h-6 w-6" style={{ color: 'var(--text-dim)' }} />
      </div>
      <p className="text-base font-medium" style={{ color: 'var(--text-dim)' }}>{title}</p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}
