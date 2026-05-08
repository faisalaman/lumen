import { Menu, Moon, Sun, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useTheme } from '../hooks/useTheme.js'
import { MODELS } from '../utils/constants.js'
import { formatTokens } from '../utils/formatters.js'

export default function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { activeChat, model, setModel, clearActiveChat } = useChat()
  const usage = activeChat?.tokenUsage

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="btn-icon md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <ModelSelector value={model} onChange={setModel} />
      </div>

      <div className="flex items-center gap-1">
        {usage?.total > 0 && (
          <span
            className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:inline"
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
    </header>
  )
}

function ModelSelector({ value, onChange }) {
  return (
    <label className="relative">
      <span className="sr-only">Model</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base appearance-none pr-8 text-sm font-medium"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
