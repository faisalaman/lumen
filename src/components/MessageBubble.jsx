import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { Bot, Check, Copy, RefreshCw, User } from 'lucide-react'
import { copyToClipboard, classNames } from '../utils/helpers.js'
import { MESSAGE_ROLES } from '../utils/constants.js'
import { partsOf, textOf } from '../utils/content.js'

function MessageBubble({ message, isLastAssistant, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === MESSAGE_ROLES.USER

  async function handleCopy() {
    const ok = await copyToClipboard(message.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={classNames(
        'group flex items-start gap-3 px-2 py-3',
        isUser && 'flex-row-reverse',
      )}
    >
      <Avatar role={message.role} />
      <div
        className={classNames(
          'flex max-w-[88%] flex-col gap-1.5 sm:max-w-[78%] md:max-w-[70%]',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={classNames(
            'px-4 py-3 text-sm leading-relaxed transition',
            isUser
              ? 'text-white'
              : 'prose-chat text-ink-1 border border-line-1',
          )}
          style={
            isUser
              ? {
                  borderRadius: '12px 12px 4px 12px',
                  backgroundImage: 'var(--accent-grad)',
                  boxShadow: 'var(--glow-sm)',
                }
              : {
                  borderRadius: '12px 12px 12px 4px',
                  background: 'var(--surface-1)',
                }
          }
        >
          {isUser ? (
            <UserContent content={message.content} />
          ) : (
            <div
              className={classNames(
                'streaming-md',
                message.streaming && 'is-streaming',
              )}
            >
              <Markdown content={textOf(message.content)} />
              {message.streaming && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-3 w-[2px] align-[-2px] animate-cursorBlink"
                  style={{ background: 'var(--accent-2)' }}
                />
              )}
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={handleCopy}
              className="btn-icon h-8 w-8"
              aria-label="Copy message"
              title="Copy"
            >
              {copied ? (
                <Check className="h-4 w-4 text-ok" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            {isLastAssistant && (
              <button
                onClick={onRegenerate}
                className="btn-icon h-8 w-8"
                aria-label="Regenerate response"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Avatar({ role }) {
  const isUser = role === MESSAGE_ROLES.USER
  return (
    <div
      className={classNames(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
        isUser ? 'bg-surface-2 text-ink-1' : 'text-white',
      )}
      style={isUser ? undefined : { backgroundImage: 'var(--accent-grad)', boxShadow: 'var(--glow-sm)' }}
      aria-hidden="true"
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  )
}

function Markdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const codeString = String(children).replace(/\n$/, '')
          if (match) {
            return <CodeBlock language={match[1]} code={codeString} />
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content || ''}
    </ReactMarkdown>
  )
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    const ok = await copyToClipboard(code)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }
  return (
    <div className="group/code relative my-2 overflow-hidden rounded-lg border border-line-2">
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs"
        style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
      >
        <span className="font-mono uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 transition hover:bg-surface-2 hover:text-ink-1"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
          background: 'rgba(0,0,0,0.45)',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function UserContent({ content }) {
  const parts = partsOf(content)
  const images = parts.filter((p) => p.type === 'image')
  const text = parts.filter((p) => p.type === 'text').map((p) => p.text).join('')
  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {images.map((img, i) => (
            <img
              key={i}
              src={`data:${img.mimeType};base64,${img.dataBase64}`}
              alt=""
              className="max-h-40 max-w-[160px] rounded-md border border-white/10 object-cover"
            />
          ))}
        </div>
      )}
      {text && <span className="whitespace-pre-wrap break-words">{text}</span>}
    </div>
  )
}

export default memo(MessageBubble)
