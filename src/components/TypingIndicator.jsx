import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-2 py-3 animate-fadeIn">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
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
      className="block h-2 w-2 animate-bounceDot rounded-full bg-slate-400 dark:bg-slate-500"
      style={{ animationDelay: delay }}
    />
  )
}
