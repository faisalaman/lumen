import { useMemo, useState } from 'react'
import { Download, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../hooks/useChat.js'
import { classNames } from '../utils/helpers.js'
import { formatRelative } from '../utils/formatters.js'

export default function ChatHistory({ onSelect }) {
  const { chats, activeChatId, setActiveChatId, deleteChat, renameChat, exportChat } = useChat()
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const sorted = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt),
    [chats],
  )

  function startRename(chat) {
    setEditingId(chat.id)
    setDraftTitle(chat.title)
  }

  function commitRename(chatId) {
    const t = draftTitle.trim()
    if (t) renameChat(chatId, t)
    setEditingId(null)
    setDraftTitle('')
  }

  if (sorted.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
        No conversations yet — start by typing below.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1 px-2 py-2">
      <AnimatePresence initial={false}>
        {sorted.map((chat) => {
          const isActive = chat.id === activeChatId
          const isEditing = chat.id === editingId
          return (
            <motion.li
              key={chat.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className={classNames(
                'group flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition',
                isActive
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )}
            >
              <button
                onClick={() => {
                  setActiveChatId(chat.id)
                  onSelect?.()
                }}
                className="flex flex-1 items-center gap-2 truncate text-left"
                aria-current={isActive ? 'page' : undefined}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => commitRename(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(chat.id)
                      if (e.key === 'Escape') {
                        setEditingId(null)
                        setDraftTitle('')
                      }
                    }}
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-sm text-slate-800 outline-none focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                ) : (
                  <span className="flex-1 truncate" title={chat.title}>
                    {chat.title || 'Untitled'}
                  </span>
                )}
                <span className="hidden text-xs text-slate-400 group-hover:inline dark:text-slate-500">
                  {formatRelative(chat.updatedAt)}
                </span>
              </button>
              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button
                  className="btn-icon h-7 w-7"
                  onClick={() => startRename(chat)}
                  title="Rename"
                  aria-label="Rename chat"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  className="btn-icon h-7 w-7"
                  onClick={() => exportChat(chat.id)}
                  title="Export"
                  aria-label="Export chat"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button
                  className="btn-icon h-7 w-7 hover:text-rose-500"
                  onClick={() => {
                    if (window.confirm(`Delete chat "${chat.title}"?`)) deleteChat(chat.id)
                  }}
                  title="Delete"
                  aria-label="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
