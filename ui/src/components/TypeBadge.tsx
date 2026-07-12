import type { AssetType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<AssetType, { label: string; classes: string }> = {
  skill:       { label: 'Skill',       classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30' },
  agent:       { label: 'Agent',       classes: 'bg-violet-500/15 text-violet-400 ring-violet-500/30' },
  instruction: { label: 'Instruction', classes: 'bg-amber-500/15  text-amber-400  ring-amber-500/30' },
  workflow:    { label: 'Workflow',    classes: 'bg-rose-500/15   text-rose-400   ring-rose-500/30' },
  extension:   { label: 'Extension',  classes: 'bg-sky-500/15    text-sky-400    ring-sky-500/30' },
}

interface TypeBadgeProps {
  type: AssetType
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.skill
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ring-1',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
