import { useState } from 'react'
import { Terminal, Copy, Check, CloudUpload, Zap, Globe, Search, Download, Settings, Blocks, FileJson } from 'lucide-react'
import { Header } from '@/components/Header'

function CodeSnippet({ command, output, className = "mb-4" }: { command: string, output?: React.ReactNode, className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-950 p-4 font-mono text-sm shadow-inner group ${className}`}>
      <div className="flex items-center text-gray-300 pr-10">
        <span className="mr-3 select-none text-gray-600">$</span>
        {command}
      </div>
      {output && (
        <div className="mt-3 border-t border-white/10 pt-3 text-gray-400">
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
      
      <main className="mx-auto max-w-4xl px-6 py-12 pb-24">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">Origin CLI Guide</h1>
        <p className="mb-12 text-lg leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          A unified AI Orchestrator CLI that seamlessly integrates Agent Forge and Spec Kit to establish a powerful "Coordinator-Worker" AI pattern directly in your VS Code environment.
        </p>

        {/* 1. Installation */}
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500">
              <Download className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">1. Installation</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-4" style={{ color: 'var(--text-dim)' }}>
              The Origin CLI is distributed via <code className="text-sm font-semibold" style={{ color: 'var(--text)' }}>pipx</code> for isolated environments. Ensure you have Python 3.9+ installed.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>1. Install pipx (e.g., macOS)</p>
                <CodeSnippet command="brew install pipx && pipx ensurepath" className="mb-2" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>2. Install Origin CLI</p>
                <CodeSnippet command="pipx install git+https://github.com/pandaind/origin-cli.git" />
              </div>
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Once published, you will be able to install it directly via <code>pipx install origin-cli</code>.
            </p>
          </div>
        </section>

        {/* 2. Workspace Setup */}
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">2. Local Workspace Setup (Orchestration)</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-6" style={{ color: 'var(--text-dim)' }}>
              Origin bridges the gap between Spec Kit (The Manager) and Agent Forge (The Fleet of Workers). Get your environment up and running instantly.
            </p>

            <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>Global Setup</h3>
            <p className="mb-3 text-sm" style={{ color: 'var(--text-dim)' }}>
              Run this once on your machine to bootstrap necessary underlying tools. It will interactively ask for your preferred Methodology (Spec vs Agent Driven) and Execution Environment (CLI Toolchains vs IDE Native).
            </p>
            <CodeSnippet command="origin setup" className="mb-6" />
            
            <p className="mb-8 text-sm italic" style={{ color: 'var(--text-muted)' }}>
              <strong>Headroom AI:</strong> You can also opt-in to Headroom during setup, which transparently compresses prompt context windows (typically 60-95% reduction).
            </p>

            <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--text)' }}>Project Initialization</h3>
            <p className="mb-3 text-sm" style={{ color: 'var(--text-dim)' }}>
              Run this inside any project directory to initialize the AI workspace based on your setup preferences.
            </p>
            <CodeSnippet command="origin init" />
            <p className="text-sm mt-4 italic" style={{ color: 'var(--text-muted)' }}>
              Tip: Use <code>origin init --ide</code> for IDE-Only mode, or <code>origin init --extension jira</code> to inject specific integration templates!
            </p>
          </div>
        </section>

        {/* 3. Hub Registry */}
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">3. Origin Hub Registry</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-8" style={{ color: 'var(--text-dim)' }}>
              The <code>origin hub</code> command group allows you to discover, install, and publish AI assets (templates, skills, workflows) directly from your terminal.
            </p>
            
            <div className="space-y-8">
              {/* Auth */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  <Terminal className="h-4 w-4 text-purple-400" /> Authentication
                </h3>
                <p className="mb-3 text-sm" style={{ color: 'var(--text-dim)' }}>
                  If your registry is hosted securely, or if you plan to publish assets, you must authenticate.
                </p>
                <CodeSnippet command="origin hub login" className="mb-2" />
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <CodeSnippet command="origin hub set-url <url>" />
                  </div>
                  <div className="flex-1">
                    <CodeSnippet command="origin hub whoami" />
                  </div>
                </div>
              </div>

              {/* Discovery & Install */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  <Search className="h-4 w-4 text-blue-400" /> Discover & Install
                </h3>
                <p className="mb-3 text-sm" style={{ color: 'var(--text-dim)' }}>
                  Auto-discover assets based on your tech stack (Java, Python, React), search manually, or install directly.
                </p>
                <CodeSnippet 
                  command="origin hub discover" 
                  output={
                    <>
                      Scanning project stack... Found <b>React</b> and <b>TypeScript</b>.<br/>
                      Recommended assets:<br/>
                      <span>[1] logicist/react-expert</span><br/>
                      <span>[2] logicist/typescript-skill</span>
                    </>
                  }
                  className="mb-4"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <CodeSnippet command="origin hub search <query>" />
                  </div>
                  <div className="flex-1">
                    <CodeSnippet command="origin hub install <asset>" />
                  </div>
                </div>
              </div>

              {/* Publishing */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                  <CloudUpload className="h-4 w-4 text-amber-400" /> Publishing
                </h3>
                <p className="mb-3 text-sm" style={{ color: 'var(--text-dim)' }}>
                  Scaffold a new asset with <code>origin hub create</code>, which generates your <code>hub-manifest.json</code> automatically, then publish it.
                </p>
                <CodeSnippet command="origin hub create my-database-expert --type agent" className="mb-4" />
                <CodeSnippet command="origin hub publish ./my-database-expert" />
                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                  <strong>Magic Under the Hood:</strong> You do not need to manually list your files in the manifest! The CLI packager will automatically detect all files in your directory and bundle them.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 4. Extensions */}
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
              <Blocks className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">4. Extensions Management</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-6" style={{ color: 'var(--text-dim)' }}>
              Origin acts as an orchestrator to manage vendor-neutral AI workspace extensions (packaging GitHub Copilot, Spec Kit, and MCP assets together).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Scaffold new extension</p>
                <CodeSnippet command="origin extension new <name>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Install extension</p>
                <CodeSnippet command="origin extension add <path>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Enable / Disable</p>
                <CodeSnippet command="origin extension enable <name>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>List / Info / Remove</p>
                <CodeSnippet command="origin extension list" />
              </div>
            </div>
          </div>
        </section>
        
        {/* 5. Presets */}
        <section className="mb-14">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
              <FileJson className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold">5. AI Process Presets</h2>
          </div>
          
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="mb-6" style={{ color: 'var(--text-dim)' }}>
              Origin securely wraps the native Spec Kit CLI to orchestrate the lifecycle of your custom AI process presets, without overriding Spec Kit's core functionality.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Generate preset</p>
                <CodeSnippet command="origin preset new <name>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Install preset</p>
                <CodeSnippet command="origin preset add <path>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Enable / Disable</p>
                <CodeSnippet command="origin preset disable <name>" />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>List / Info / Remove</p>
                <CodeSnippet command="origin preset info <name>" />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
