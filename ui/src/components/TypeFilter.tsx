import type { AssetType } from '@/types'
import { cn } from '@/lib/utils'

const FILTERS: { type: AssetType | ''; label: string }[] = [
  { type: '',            label: 'All' },
  { type: 'skill',       label: 'Skill' },
  { type: 'agent',       label: 'Agent' },
  { type: 'instruction', label: 'Instruction' },
  { type: 'workflow',    label: 'Workflow' },
  { type: 'extension',  label: 'Extension' },
]

interface TypeFilterProps {
  active: AssetType | ''
  onChange: (type: AssetType | '') => void
}

export function TypeFilter({ active, onChange }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter by asset type">
      {FILTERS.map(({ type, label }) => {
        const isActive = active === type
        return (
          <button
            key={type || 'all'}
            onClick={() => onChange(type)}
            aria-pressed={isActive}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150',
            )}
            style={isActive ? {
              borderColor: 'var(--accent)',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent-glow)',
            } : {
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-dim)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
