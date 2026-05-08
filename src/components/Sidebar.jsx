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
          'fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
      />

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Conversation history"
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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

        <div className="px-3 py-2">
          <button
            onClick={() => {
              newChat()
              onClose?.()
            }}
            className="btn-primary w-full"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChatHistory onSelect={onClose} />
        </div>

        <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
          <button onClick={onOpenSettings} className="btn-ghost w-full justify-start">
            <SettingsIcon className="h-4 w-4" />
            Settings
          </button>
        </div>
      </aside>
    </>
  )
}
