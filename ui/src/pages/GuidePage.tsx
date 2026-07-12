import { useState } from 'react'
import { Terminal, Copy, Check, Package, Download, CloudUpload, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'

function CodeSnippet({ command, output, className = "mb-4" }: { command: string, output?: React.ReactNode, className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black/50 p-4 font-mono text-sm shadow-inner group ${className}`}>
      <div className="flex items-center text-gray-300 pr-10">
        <span className="mr-3 select-none text-gray-600">$</span>
        {command}
      </div>
      {output && (
        <div className="mt-2 pl-6 text-gray-400">
          {output}
        </div>
      )}
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
        title="Copy to clipboard"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function GuidePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      
      <main className="mx-auto max-w-3xl px-6 py-12 pb-24">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Origin CLI Guide</h1>
        <p className="mb-10 text-lg" style={{ color: 'var(--text-dim)' }}>
          Learn how to install the Origin CLI and use it to discover, install, and publish AI assets.
        </p>

        {/* 1. Installation */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
              <Download className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">1. Installation</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-4" style={{ color: 'var(--text-dim)' }}>
              The Origin CLI is distributed as a standalone binary. Install it via our installation script:
            </p>
            <CodeSnippet command="curl -sSL https://install.logic.ist/cli | bash" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Requires macOS or Linux. Windows users can use WSL2.
            </p>
          </div>
        </section>

        {/* 2. Authentication */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">2. Authentication</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-4" style={{ color: 'var(--text-dim)' }}>
              Before downloading private assets or publishing your own, you need to log in to the registry.
            </p>
            <CodeSnippet command="origin auth login" className="" />
          </div>
        </section>

        {/* 3. Finding and Installing Assets */}
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">3. Finding & Installing</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-4" style={{ color: 'var(--text-dim)' }}>
              Search for assets in the registry and install them into your local project.
            </p>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded bg-black/30 px-2 py-1 font-mono text-xs text-gray-300">
                  origin search &lt;query&gt;
                </div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Search for assets by name or tag</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded bg-black/30 px-2 py-1 font-mono text-xs text-gray-300">
                  origin install &lt;namespace&gt;/&lt;name&gt;
                </div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Install an asset and add it to your project config</p>
              </div>
            </div>

            <CodeSnippet command="origin install logicist/weather-agent" className="" />
          </div>
        </section>

        {/* 4. Publishing */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <CloudUpload className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">4. Publishing</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-4" style={{ color: 'var(--text-dim)' }}>
              Share your AI agents, skills, and workflows with the community or your organization.
            </p>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded bg-black/30 px-2 py-1 font-mono text-xs text-gray-300">
                  origin init
                </div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Create a new hub-manifest.json for your asset</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 rounded bg-black/30 px-2 py-1 font-mono text-xs text-gray-300">
                  origin publish
                </div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Bundle and upload your asset to the registry</p>
              </div>
            </div>

            <CodeSnippet 
              command="origin publish" 
              className=""
              output={
                <>
                  Packaging bundle (1.2MB)...<br/>
                  Uploading logicist/data-analyzer@1.0.0...<br/>
                  <span className="text-emerald-400">Successfully published!</span>
                </>
              }
            />
          </div>
        </section>

      </main>
    </div>
  )
}
