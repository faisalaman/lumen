import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { classNames } from '../utils/helpers.js'

export default function ChatInput() {
  const { sendMessage, isStreaming, stopGenerating } = useChat()
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 pb-3 pt-2 sm:px-6"
      style={{
        background: 'color-mix(in srgb, var(--bg-deep) 70%, transparent)',
        borderTop: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl px-3 py-2 transition"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Send a message…  (Shift+Enter for new line)"
          className="max-h-48 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink-1 outline-none placeholder:text-ink-3"
          aria-label="Message input"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={stopGenerating}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-1 transition"
            style={{ background: 'var(--surface-2)' }}
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
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition disabled:cursor-not-allowed',
              value.trim() ? '' : 'opacity-40',
            )}
            style={{
              backgroundImage: 'var(--accent-grad)',
              boxShadow: value.trim() ? 'var(--glow-sm)' : 'none',
            }}
            aria-label="Send message"
            title="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-center text-xs text-ink-3">
        AI may produce inaccurate information. Verify important answers.
      </p>
    </form>
  )
}
