import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Paperclip, Square, X } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { classNames } from '../utils/helpers.js'
import {
  MAX_IMAGES_PER_MESSAGE,
  modelSupportsVision,
  readAsBase64,
  validateImage,
} from '../utils/images.js'

export default function ChatInput() {
  const { sendMessage, isStreaming, stopGenerating, model } = useChat()
  const [text, setText] = useState('')
  const [images, setImages] = useState([]) // Array<{mimeType, dataBase64, previewUrl, name, size}>
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const visionOk = modelSupportsVision(model)
  const hasImages = images.length > 0
  const blocked = hasImages && !visionOk
  const canSend = !isStreaming && !blocked && (text.trim().length > 0 || hasImages)

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
  }, [text])

  // Cleanup blob URLs when images change/unmount
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
  }, [images])

  async function addFiles(fileList) {
    setError(null)
    const incoming = Array.from(fileList || [])
    const room = MAX_IMAGES_PER_MESSAGE - images.length
    if (room <= 0) {
      setError(`Up to ${MAX_IMAGES_PER_MESSAGE} images per message`)
      return
    }
    const accepted = []
    for (const file of incoming.slice(0, room)) {
      const err = validateImage(file)
      if (err) { setError(err); continue }
      try {
        const { mimeType, dataBase64 } = await readAsBase64(file)
        accepted.push({
          mimeType,
          dataBase64,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })
      } catch (e) {
        setError(e.message || 'Failed to read image')
      }
    }
    if (accepted.length) setImages((prev) => [...prev, ...accepted])
  }

  function removeImage(idx) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx]?.previewUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  function handleSubmit(e) {
    e?.preventDefault()
    if (!canSend) return
    const parts = []
    for (const img of images) {
      parts.push({ type: 'image', mimeType: img.mimeType, dataBase64: img.dataBase64 })
    }
    const trimmed = text.trim()
    if (trimmed) parts.push({ type: 'text', text: trimmed })
    // If only text and no images, send as plain string for backward-compat readability
    const content = images.length === 0 ? trimmed : parts
    sendMessage(content)
    setText('')
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setImages([])
    setError(null)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function onPaste(e) {
    const files = []
    for (const item of e.clipboardData?.items ?? []) {
      if (item.kind === 'file') {
        const f = item.getAsFile()
        if (f && f.type.startsWith('image/')) files.push(f)
      }
    }
    if (files.length) {
      e.preventDefault()
      addFiles(files)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
    if (files.length) addFiles(files)
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
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {error && (
        <div className="mx-auto mb-2 max-w-3xl rounded-lg border border-line-1 bg-surface-1 px-3 py-2 text-xs text-err">
          {error}
        </div>
      )}
      {blocked && !error && (
        <div className="mx-auto mb-2 max-w-3xl rounded-lg border border-line-1 bg-surface-1 px-3 py-2 text-xs text-warn">
          Selected model doesn't support image input. Switch to GPT-4.1, Claude Sonnet, or Gemini 2.5 to send images.
        </div>
      )}

      <div
        className="mx-auto flex max-w-3xl flex-col gap-2 rounded-xl px-3 py-2 transition"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {hasImages && (
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((img, i) => (
              <div key={i} className="group/chip relative h-14 w-14 overflow-hidden rounded-md border border-line-2">
                <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0.5 top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover/chip:opacity-100"
                  aria-label="Remove image"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES_PER_MESSAGE}
            className="btn-icon h-9 w-9 disabled:cursor-not-allowed disabled:opacity-40"
            title={images.length >= MAX_IMAGES_PER_MESSAGE ? `Max ${MAX_IMAGES_PER_MESSAGE} images per message` : 'Attach image'}
            aria-label="Attach image"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
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
              disabled={!canSend}
              className={classNames(
                'inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition disabled:cursor-not-allowed',
                canSend ? '' : 'opacity-40',
              )}
              style={{
                backgroundImage: 'var(--accent-grad)',
                boxShadow: canSend ? 'var(--glow-sm)' : 'none',
              }}
              aria-label="Send message"
              title={blocked ? 'Switch to a vision-capable model first' : 'Send'}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-3xl px-1 text-center text-xs text-ink-3">
        AI may produce inaccurate information. Verify important answers.
      </p>
    </form>
  )
}
