import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, X } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'
import { useChat } from '../hooks/useChat.js'
import { MODELS, STORAGE_KEYS } from '../utils/constants.js'
import { setAuthToken } from '../services/api.js'

export default function SettingsModal({ open, onClose }) {
  const { theme, setTheme } = useTheme()
  const { model, setModel } = useChat()
  const [token, setTokenState] = useState('')
  const [revealToken, setRevealToken] = useState(false)

  useEffect(() => {
    if (open) {
      setTokenState(window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '')
      setRevealToken(false)
    }
  }, [open])

  function handleSave() {
    setAuthToken(token.trim() || null)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <motion.div
            className="card w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="settings-title"
                className="text-lg font-semibold text-ink-1"
              >
                Settings
              </h2>
              <button onClick={onClose} className="btn-icon" aria-label="Close settings">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <Field label="Theme">
                <div className="flex gap-2">
                  {['light', 'dark', 'system'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        if (opt === 'system') {
                          setTheme(
                            window.matchMedia('(prefers-color-scheme: dark)').matches
                              ? 'dark'
                              : 'light',
                          )
                        } else {
                          setTheme(opt)
                        }
                      }}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition ${
                        theme === opt
                          ? 'border-line-2 bg-surface-2 text-ink-1'
                          : 'border-line-1 text-ink-2 hover:bg-surface-1'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Default model">
                <select
                  className="input-base"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} — {m.tag}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="API token"
                hint="Bearer token sent with each request to your backend. Stored locally in your browser."
              >
                <div className="relative">
                  <input
                    type={revealToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setTokenState(e.target.value)}
                    placeholder="Paste your JWT here"
                    className="input-base pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealToken((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-3 hover:bg-surface-1"
                    aria-label={revealToken ? 'Hide token' : 'Show token'}
                  >
                    {revealToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onClose} className="btn-ghost">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-gradient">
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  )
}
