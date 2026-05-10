import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Bot, Moon, Plus, Search, Settings as SettingsIcon, Sun, Trash2 } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useTheme } from '../hooks/useTheme.js'
import { useHotkeys, modLabel } from '../hooks/useHotkeys.js'
import { MODELS } from '../utils/constants.js'
import { classNames } from '../utils/helpers.js'

// Singleton open-state hook (so the header chip + palette share the same toggle)
let externalSetOpen = null
export function useCommandPalette() {
  return {
    open: () => externalSetOpen?.(true),
    toggle: () => externalSetOpen?.((v) => !v),
  }
}

export default function CommandPalette({ onOpenSettings }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Expose setOpen to the singleton hook
  useEffect(() => {
    externalSetOpen = setOpen
    return () => { externalSetOpen = null }
  }, [])

  const { chats, model, setModel, newChat, setActiveChatId, clearActiveChat, activeChat } = useChat()
  const { theme, toggleTheme } = useTheme()

  // ⌘K toggles, Esc closes
  useHotkeys('mod+k', () => setOpen((v) => !v))
  useHotkeys('escape', () => setOpen(false), { when: open })

  // Reset query + selection on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      // Defer focus so the modal has rendered
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Build the unified item list
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (label) => !q || label.toLowerCase().includes(q)

    const actions = [
      { id: 'a-new', icon: Plus, label: 'New chat', section: 'Actions', run: () => { newChat(); setOpen(false) } },
      { id: 'a-theme', icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', section: 'Actions', run: () => { toggleTheme(); setOpen(false) } },
      { id: 'a-settings', icon: SettingsIcon, label: 'Open settings', section: 'Actions', run: () => { onOpenSettings?.(); setOpen(false) } },
      ...(activeChat?.messages?.length ? [{ id: 'a-clear', icon: Trash2, label: 'Clear current chat', section: 'Actions', run: () => { if (window.confirm('Clear all messages from this conversation?')) clearActiveChat(); setOpen(false) } }] : []),
    ].filter((it) => matches(it.label))

    const sortedChats = [...(chats ?? [])].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    const chatItems = sortedChats
      .filter((c) => matches(c.title || 'New chat'))
      .slice(0, q ? 12 : 5)
      .map((c) => ({
        id: `c-${c.id}`,
        icon: ArrowRight,
        label: c.title || 'New chat',
        section: 'Recent chats',
        run: () => { setActiveChatId(c.id); setOpen(false) },
      }))

    const modelItems = MODELS
      .filter((m) => matches(m.label))
      .map((m) => ({
        id: `m-${m.id}`,
        icon: Bot,
        label: m.label + (m.id === model ? '  · current' : ''),
        section: 'Switch model',
        run: () => { setModel(m.id); setOpen(false) },
      }))

    return [...actions, ...chatItems, ...modelItems]
  }, [query, chats, model, activeChat, theme, newChat, setActiveChatId, setModel, toggleTheme, clearActiveChat, onOpenSettings])

  // Clamp selection when items change
  useEffect(() => {
    if (selected >= items.length) setSelected(Math.max(0, items.length - 1))
  }, [items.length, selected])

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(items.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[selected]?.run()
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const node = listRef.current?.querySelector(`[data-index="${selected}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  // Render with section headers
  let lastSection = null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-[20vh] z-50 w-[92%] max-w-[480px] -translate-x-1/2 overflow-hidden rounded-xl border border-line-1 bg-bg-elev shadow-lift"
      >
        <div className="flex items-center gap-2 border-b border-line-1 px-3">
          <Search className="h-4 w-4 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={onKeyDown}
            placeholder="Type a command, chat, or model…"
            className="flex-1 bg-transparent py-3 text-sm text-ink-1 outline-none placeholder:text-ink-3"
            aria-label="Command palette search"
          />
          <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-3">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-ink-3">No matches</p>
          )}
          {items.map((item, i) => {
            const showHeader = item.section !== lastSection
            lastSection = item.section
            return (
              <div key={item.id}>
                {showHeader && (
                  <p className="mx-3 mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                    {item.section}
                  </p>
                )}
                <button
                  type="button"
                  data-index={i}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelected(i)}
                  className={classNames(
                    'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition',
                    i === selected ? 'text-ink-1' : 'text-ink-2 hover:bg-surface-1',
                  )}
                  style={i === selected ? { backgroundImage: 'var(--accent-grad-soft)' } : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-ink-3" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {i === selected && <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-3">↵</kbd>}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between border-t border-line-1 px-3 py-2 text-[10px] text-ink-3">
          <span>{modLabel()}+K to toggle</span>
          <span>↑↓ navigate · ↵ select · esc close</span>
        </div>
      </div>
    </>
  )
}
