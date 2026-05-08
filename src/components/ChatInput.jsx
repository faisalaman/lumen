import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { classNames } from '../utils/helpers.js'

export default function ChatInput() {
  const { sendMessage, isStreaming, stopGenerating } = useChat()
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }, [value])

  function handleSubmit(e) {
    e?.preventDefault()
    if (isStreaming) return
    const text = value.trim()
    if (!text) return
    setValue('')
    sendMessage(text)
  }

  function onKeyDown(e) {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white/70 px-3 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-soft transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-brand-500 dark:focus-within:ring-brand-900">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Send a message…  (Shift+Enter for new line)"
          className="max-h-48 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          aria-label="Message input"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopGenerating}
            className="btn-icon h-10 w-10 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Stop generating"
            title="Stop"
          >
            <Square className="h-4 w-4" fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className={classNames(
              'inline-flex h-10 w-10 items-center justify-center rounded-xl transition',
              value.trim()
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
            )}
            aria-label="Send message"
            title="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-center text-xs text-slate-400 dark:text-slate-500">
        AI may produce inaccurate information. Verify important answers.
      </p>
    </form>
  )
}
