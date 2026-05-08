import { useMemo } from 'react'
import { AlertTriangle, ArrowDown } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useAutoScroll } from '../hooks/useAutoScroll.js'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import EmptyState from './EmptyState.jsx'
import { MESSAGE_ROLES } from '../utils/constants.js'

export default function ChatWindow() {
  const { activeChat, isStreaming, regenerate, sendMessage, error, clearError } = useChat()
  const messages = activeChat?.messages ?? []
  const lastTokenLen = messages[messages.length - 1]?.content?.length ?? 0
  const { containerRef, bottomRef, isPinned, scrollToBottom } = useAutoScroll(
    `${messages.length}:${lastTokenLen}`,
  )

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === MESSAGE_ROLES.ASSISTANT) return messages[i].id
    }
    return null
  }, [messages])

  const showTyping =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === MESSAGE_ROLES.ASSISTANT &&
    messages[messages.length - 1].content.length === 0

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-6"
        role="log"
        aria-live="polite"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
          {messages.length === 0 ? (
            <EmptyState onPick={(text) => sendMessage(text)} />
          ) : (
            messages
              // Hide the empty streaming placeholder — the typing indicator
              // takes its place until the first token arrives.
              .filter(
                (m) =>
                  !(m.role === MESSAGE_ROLES.ASSISTANT && m.streaming && !m.content),
              )
              .map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isLastAssistant={m.id === lastAssistantId && !isStreaming}
                  onRegenerate={regenerate}
                />
              ))
          )}
          {showTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {!isPinned && (
        <button
          onClick={() => scrollToBottom()}
          className="chip absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transition hover:-translate-y-0.5"
          style={{ boxShadow: 'var(--lift)' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <ArrowDown className="h-3.5 w-3.5" /> Jump to latest
          </span>
        </button>
      )}

      {error && (
        <div className="mx-3 mb-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 sm:mx-6">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={clearError} className="font-medium underline-offset-2 hover:underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
