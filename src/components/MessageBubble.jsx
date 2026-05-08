import { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { motion } from 'framer-motion'
import { Bot, Check, Copy, RefreshCw, User } from 'lucide-react'
import { copyToClipboard, classNames } from '../utils/helpers.js'
import { MESSAGE_ROLES } from '../utils/constants.js'

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
      transition={{ duration: 0.2 }}
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
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition',
            isUser
              ? 'rounded-tr-sm bg-brand-600 text-white'
              : 'prose-chat rounded-tl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
          )}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          ) : (
            <Markdown content={message.content} />
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
                <Check className="h-4 w-4 text-emerald-500" />
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
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
        isUser
          ? 'bg-brand-600 text-white'
          : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
      )}
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
        // react-markdown v9 no longer passes `inline`; we infer it from the
        // presence of a language class (fenced blocks set `language-*`).
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
    <div className="group/code relative my-2">
      <div className="flex items-center justify-between rounded-t-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
        <span className="font-mono uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-300 transition hover:bg-slate-700"
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
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.75rem',
          borderBottomRightRadius: '0.75rem',
          padding: '0.85rem 1rem',
          fontSize: '0.85rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default memo(MessageBubble)
