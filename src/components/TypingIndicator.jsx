import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-2 py-3 animate-fadeIn">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-surface-1 px-4 py-3">
        <span className="sr-only">Assistant is typing</span>
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </div>
  )
}

function Dot({ delay }) {
  return (
    <span
      className="block h-2 w-2 animate-bounceDot rounded-full bg-accent-cyan"
      style={{ animationDelay: delay }}
    />
  )
}
