import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  className?: string
}

export function SearchBar({ value, onChange, className }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input
        ref={inputRef}
        id="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search agents, skills, workflows…"
        autoComplete="off"
        className="w-full rounded-xl py-3 pl-11 pr-10 text-sm outline-none transition-all duration-200"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {!value && (
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px]"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
        >
          ⌘K
        </kbd>
      )}
    </div>
  )
}
