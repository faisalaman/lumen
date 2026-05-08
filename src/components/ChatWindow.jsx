import { useMemo } from 'react'
import { AlertTriangle, ArrowDown, Bot, Sparkles } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useAutoScroll } from '../hooks/useAutoScroll.js'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { MESSAGE_ROLES } from '../utils/constants.js'

const SUGGESTIONS = [
  { title: 'Explain a concept', subtitle: 'Explain quantum entanglement like I’m 12.' },
  { title: 'Brainstorm ideas', subtitle: 'Give me 10 unusual mobile app ideas for runners.' },
  { title: 'Code with me', subtitle: 'Write a debounce hook in TypeScript with tests.' },
  { title: 'Summarize text', subtitle: 'Summarize the key risks of large language models.' },
]

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
          className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-card ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800"
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

function EmptyState({ onPick }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
        <Sparkles className="h-7 w-7" />
      </span>
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          How can I help today?
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ask anything — coding, writing, research, or just to brainstorm.
        </p>
      </div>
      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <li key={s.title}>
            <button
              onClick={() => onPick(s.subtitle)}
              className="card flex w-full flex-col items-start gap-1 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Bot className="h-4 w-4 text-brand-600 dark:text-brand-300" />
                {s.title}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{s.subtitle}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
