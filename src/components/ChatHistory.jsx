import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { bucketByDate, formatRelativeShort } from '../utils/formatters.js'
import { classNames } from '../utils/helpers.js'

export default function ChatHistory({ onSelect }) {
  const { chats, activeChatId, setActiveChatId, renameChat, deleteChat } = useChat()
  const [editingId, setEditingId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')

  const buckets = bucketByDate(chats)

  if (!chats.length) {
    return (
      <p className="px-4 py-6 text-center text-xs text-ink-3">
        No conversations yet
      </p>
    )
  }

  function startEdit(chat) {
    setEditingId(chat.id)
    setDraftTitle(chat.title || '')
  }
  function commitEdit() {
    if (editingId) {
      renameChat(editingId, draftTitle.trim() || 'Untitled')
    }
    setEditingId(null)
    setDraftTitle('')
  }
  function cancelEdit() {
    setEditingId(null)
    setDraftTitle('')
  }

  return (
    <div className="space-y-3 pb-3">
      {buckets.map((bucket) => (
        <div key={bucket.label}>
          <p className="mx-3 mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
            {bucket.label}
          </p>
          <ul className="px-1">
            {bucket.chats.map((chat) => {
              const isActive = chat.id === activeChatId
              const isEditing = chat.id === editingId
              return (
                <li key={chat.id}>
                  <div
                    className={classNames(
                      'group/row flex items-center gap-1 rounded-md px-2 py-1.5 transition',
                      isActive
                        ? 'border border-transparent text-ink-1'
                        : 'border border-transparent text-ink-2 hover:bg-surface-1 hover:text-ink-1',
                    )}
                    style={
                      isActive
                        ? {
                            backgroundImage: 'var(--accent-grad-soft)',
                            borderColor: 'rgba(168,85,247,0.2)',
                          }
                        : undefined
                    }
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className="flex-1 bg-transparent px-1 text-xs text-ink-1 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setActiveChatId(chat.id)
                          onSelect?.()
                        }}
                        className="flex-1 truncate text-left text-xs"
                      >
                        {chat.title || 'New chat'}
                      </button>
                    )}

                    <span className="ml-1 shrink-0 text-[10px] text-ink-3">
                      {formatRelativeShort(chat.updatedAt)}
                    </span>

                    {!isEditing && (
                      <span className="ml-1 hidden shrink-0 items-center gap-0.5 group-hover/row:flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startEdit(chat)
                          }}
                          className="rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-ink-1"
                          aria-label="Rename"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Delete this conversation?')) {
                              deleteChat(chat.id)
                            }
                          }}
                          className="rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-err"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
