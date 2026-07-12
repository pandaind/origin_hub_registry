import { Moon, Sun, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/lib/theme'

export function Header({ totalAssets }: { totalAssets?: number }) {
  const { theme, toggle } = useTheme()

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--header-bg)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-400 text-base shadow-lg shadow-violet-500/30">
            ⬡
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Origin Hub
          </span>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              borderColor: 'var(--accent)',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)',
            }}
          >
            Registry
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {totalAssets != null && (
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dim)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {totalAssets.toLocaleString()}
              </span>
              assets
            </div>
          )}

          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-dim)' }}
          >
            API Docs <ExternalLink className="h-3 w-3" />
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-dim)',
            }}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
