import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'

/**
 * Modal for editing the active chat's system prompt.
 * Pattern matches SettingsModal: backdrop + centered dialog body.
 */
export default function SystemPromptModal({ open, onClose }) {
  const { activeChat, setSystemPrompt } = useChat()
  const [draft, setDraft] = useState('')

  // Sync the draft to the chat's stored prompt whenever the modal opens
  // or the active chat changes underneath us.
  useEffect(() => {
    if (open) setDraft(activeChat?.systemPrompt ?? '')
  }, [open, activeChat?.systemPrompt, activeChat?.id])

  if (!open) return null

  function handleSave() {
    if (activeChat) setSystemPrompt(activeChat.id, draft)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-prompt-title"
        className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line-1 bg-bg-elev shadow-lift"
      >
        <div className="flex items-center justify-between border-b border-line-1 px-5 py-3">
          <h2 id="system-prompt-title" className="flex items-center gap-2 text-sm font-semibold text-ink-1">
            <Sparkles className="h-4 w-4 text-accent-violet" />
            Instructions for this chat
          </h2>
          <button onClick={onClose} className="btn-icon h-8 w-8" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="mb-3 text-xs text-ink-2">
            Set a persona, tone, or persistent context. Sent as a system message at the start of every reply.
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            placeholder='You are a senior staff engineer reviewing my code. Be terse and direct.'
            className="input-base font-sans"
            aria-label="System prompt"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line-1 px-5 py-3">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-gradient">
            Save
          </button>
        </div>
      </div>
    </>
  )
}
