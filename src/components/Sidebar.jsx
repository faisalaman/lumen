import { Plus, Settings as SettingsIcon, Sparkles, X } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import ChatHistory from './ChatHistory.jsx'
import { APP_NAME } from '../utils/constants.js'
import { classNames } from '../utils/helpers.js'

export default function Sidebar({ open, onClose, onOpenSettings }) {
  const { newChat } = useChat()

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={classNames(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
      />

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col transition-transform md:static md:translate-x-0',
          'bg-surface-1 border-r border-line-1 backdrop-blur-md',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Conversation history"
      >
        {/* Brand row */}
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-glow-sm"
              style={{ backgroundImage: 'var(--accent-grad)' }}
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-ink-1 tracking-tight">
              {APP_NAME}
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn-icon md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3 pb-3">
          <button
            onClick={() => {
              newChat()
              onClose?.()
            }}
            className="btn-gradient w-full"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <ChatHistory onSelect={onClose} />
        </div>

        {/* Footer */}
        <div className="border-t border-line-1 px-3 py-3">
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-2 transition hover:bg-surface-1 hover:text-ink-1"
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>
    </>
  )
}
