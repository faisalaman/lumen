import { useEffect, useState } from 'react'
import { Menu, Moon, Sparkles, Sun, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useTheme } from '../hooks/useTheme.js'
import { MODELS } from '../utils/constants.js'
import { formatTokens } from '../utils/formatters.js'
import { getHealth, providerForModel } from '../services/healthService.js'
import SystemPromptModal from './SystemPromptModal.jsx'
import { useCommandPalette } from './CommandPalette.jsx'
import { modLabel } from '../hooks/useHotkeys.js'

export default function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { activeChat, model, setModel, clearActiveChat } = useChat()
  const usage = activeChat?.tokenUsage

  const [providers, setProviders] = useState(null)
  useEffect(() => {
    let alive = true
    getHealth().then((h) => {
      if (alive) setProviders(h.providers)
    })
    return () => { alive = false }
  }, [])

  const provider = providerForModel(model)
  const isOnline = providers ? Boolean(providers[provider]) : null

  const [systemPromptOpen, setSystemPromptOpen] = useState(false)
  const hasSystemPrompt = Boolean(activeChat?.systemPrompt)

  const cmdK = useCommandPalette()

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-2 px-3 py-2 sm:px-6"
      style={{
        background: 'color-mix(in srgb, var(--bg-deep) 70%, transparent)',
        borderBottom: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="btn-icon md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={cmdK.open}
          className="chip hidden cursor-pointer hover:border-line-2 sm:inline-flex"
          title="Command palette"
          aria-label="Open command palette"
        >
          <kbd className="font-mono">{modLabel()}K</kbd>
        </button>
        <ModelSelector value={model} onChange={setModel} status={isOnline} />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSystemPromptOpen(true)}
          className="btn-icon"
          title={hasSystemPrompt ? 'Instructions active — click to edit' : 'Add instructions for this chat'}
          aria-label="Edit chat instructions"
          style={
            hasSystemPrompt
              ? { backgroundImage: 'var(--accent-grad)', color: 'white', boxShadow: 'var(--glow-sm)' }
              : undefined
          }
        >
          <Sparkles className="h-4 w-4" />
        </button>
        {usage?.total > 0 && (
          <span
            className="chip hidden sm:inline-flex"
            title={`Prompt ${usage.prompt} / Completion ${usage.completion}`}
          >
            {formatTokens(usage.total)} tokens
          </span>
        )}
        <button
          onClick={() => {
            if (window.confirm('Clear all messages from this conversation?')) {
              clearActiveChat()
            }
          }}
          className="btn-icon"
          title="Clear conversation"
          aria-label="Clear conversation"
          disabled={!activeChat?.messages?.length}
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
      <SystemPromptModal open={systemPromptOpen} onClose={() => setSystemPromptOpen(false)} />
    </header>
  )
}

function ModelSelector({ value, onChange, status }) {
  const dotColor =
    status === true ? 'var(--ok)' :
    status === false ? 'var(--text-3)' :
    'var(--text-3)' // unknown / loading — gray
  const glow = status === true ? '0 0 6px rgba(34,197,94,.6)' : 'none'
  return (
    <label
      className="chip relative cursor-pointer pl-2 pr-7"
      style={{ paddingTop: 0, paddingBottom: 0, height: '32px' }}
      title={status === true ? 'Provider reachable' : status === false ? 'Provider unreachable' : 'Checking…'}
    >
      <span className="sr-only">Model</span>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: dotColor, boxShadow: glow }}
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 text-xs font-medium text-ink-1 outline-none"
        style={{ background: 'transparent' }}
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  )
}
