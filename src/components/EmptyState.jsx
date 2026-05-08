import { Bot, Code2, FileText, Lightbulb, Sparkles } from 'lucide-react'
import { APP_NAME } from '../utils/constants.js'

const SUGGESTIONS = [
  {
    Icon: Code2,
    title: 'Code with me',
    sub: "Write a debounce hook in TypeScript with tests",
    prompt: 'Write a debounce hook in TypeScript with tests.',
  },
  {
    Icon: Lightbulb,
    title: 'Explain a concept',
    sub: "Quantum entanglement, like I'm 12",
    prompt: "Explain quantum entanglement like I'm 12.",
  },
  {
    Icon: Bot,
    title: 'Brainstorm ideas',
    sub: '10 unusual mobile-app ideas for runners',
    prompt: 'Give me 10 unusual mobile-app ideas for runners.',
  },
  {
    Icon: FileText,
    title: 'Summarize text',
    sub: 'Key risks of large language models',
    prompt: 'Summarize the key risks of large language models.',
  },
]

export default function EmptyState({ onPick }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-5 py-12 text-center">
      <div className="relative">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{
            backgroundImage: 'var(--accent-grad)',
            boxShadow: 'var(--glow-md)',
          }}
          aria-hidden="true"
        >
          <Sparkles className="h-7 w-7" />
        </span>
        {/* Pulsing halo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-[22px] border border-line-2 animate-haloPulse"
        />
      </div>

      <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-ink-1">
        What can <span className="text-gradient">{APP_NAME}</span> help with today?
      </h2>

      <p className="max-w-md text-sm leading-relaxed text-ink-2">
        Ask anything — coding, writing, research, or brainstorming. Local
        models stay on your machine; cloud models stream from your provider.
      </p>

      <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ Icon, title, sub, prompt }) => (
          <li key={title}>
            <button
              onClick={() => onPick(prompt)}
              className="group/sug relative w-full overflow-hidden rounded-xl border border-line-1 px-4 py-3 text-left transition hover:-translate-y-0.5"
              style={{ background: 'var(--surface-1)' }}
            >
              {/* Soft gradient overlay on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover/sug:opacity-100"
                style={{ backgroundImage: 'var(--accent-grad-soft)' }}
              />
              <span
                className="relative z-10 mb-2 flex h-7 w-7 items-center justify-center rounded-md text-accent-cyan"
                style={{ background: 'var(--surface-2)' }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="relative z-10 block text-sm font-medium text-ink-1">
                {title}
              </span>
              <span className="relative z-10 mt-0.5 block text-xs text-ink-3">
                {sub}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
