import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { STORAGE_KEYS, DEFAULT_MODEL, MESSAGE_ROLES } from '../utils/constants.js'
import { streamChatCompletion } from '../services/chatService.js'

const ChatContext = createContext(null)

const NEW_CHAT_TEMPLATE = () => ({
  id: uuid(),
  title: 'New chat',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  model: DEFAULT_MODEL,
  messages: [],
  tokenUsage: { prompt: 0, completion: 0, total: 0 },
  systemPrompt: null,
})

function loadChats() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CHATS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveChats(chats) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats))
  } catch (err) {
    // Storage may be full or unavailable; we don't want to crash the UI.
    console.warn('Failed to persist chats', err)
  }
}

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(() => loadChats())
  const [activeChatId, setActiveChatId] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT)
    return stored || null
  })
  const [model, setModel] = useState(() => {
    return window.localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULT_MODEL
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  // Persist
  useEffect(() => {
    saveChats(chats)
  }, [chats])

  useEffect(() => {
    if (activeChatId) {
      window.localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, activeChatId)
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT)
    }
  }, [activeChatId])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.MODEL, model)
  }, [model])

  // Ensure there is at least one chat available
  useEffect(() => {
    if (chats.length === 0) {
      const fresh = NEW_CHAT_TEMPLATE()
      setChats([fresh])
      setActiveChatId(fresh.id)
    } else if (!activeChatId || !chats.find((c) => c.id === activeChatId)) {
      setActiveChatId(chats[0].id)
    }
  }, [chats, activeChatId])

  const activeChat = useMemo(
    () => chats.find((c) => c.id === activeChatId) ?? null,
    [chats, activeChatId],
  )

  const updateChat = useCallback((chatId, updater) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...updater(c), updatedAt: Date.now() } : c,
      ),
    )
  }, [])

  const newChat = useCallback(() => {
    const fresh = { ...NEW_CHAT_TEMPLATE(), model }
    setChats((prev) => [fresh, ...prev])
    setActiveChatId(fresh.id)
    setError(null)
  }, [model])

  const deleteChat = useCallback(
    (chatId) => {
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== chatId)
        if (chatId === activeChatId) {
          setActiveChatId(filtered[0]?.id ?? null)
        }
        return filtered
      })
    },
    [activeChatId],
  )

  const renameChat = useCallback(
    (chatId, title) => {
      updateChat(chatId, (c) => ({ ...c, title: title.slice(0, 80) }))
    },
    [updateChat],
  )

  const clearActiveChat = useCallback(() => {
    if (!activeChat) return
    updateChat(activeChat.id, (c) => ({
      ...c,
      messages: [],
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    }))
  }, [activeChat, updateChat])

  const stopGenerating = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setIsStreaming(false)
  }, [])

  /**
   * Send a user message and stream an AI reply.
   * @param {string} content
   * @param {{ regenerate?: boolean }} options
   */
  const sendMessage = useCallback(
    async (content, options = {}) => {
      if (!activeChat) return
      const trimmed = (content ?? '').trim()
      if (!trimmed && !options.regenerate) return

      setError(null)

      // Build the next message list (handle regenerate vs send)
      let baseMessages = activeChat.messages
      if (options.regenerate) {
        // remove last assistant message
        const lastAssistantIdx = [...baseMessages].reverse().findIndex((m) => m.role === MESSAGE_ROLES.ASSISTANT)
        if (lastAssistantIdx !== -1) {
          baseMessages = baseMessages.slice(0, baseMessages.length - 1 - lastAssistantIdx)
        }
      } else {
        const userMsg = {
          id: uuid(),
          role: MESSAGE_ROLES.USER,
          content: trimmed,
          createdAt: Date.now(),
        }
        baseMessages = [...baseMessages, userMsg]
      }

      const assistantMsg = {
        id: uuid(),
        role: MESSAGE_ROLES.ASSISTANT,
        content: '',
        createdAt: Date.now(),
        model: activeChat.model,
        streaming: true,
      }

      const initialMessages = [...baseMessages, assistantMsg]
      const isFirstUserTurn =
        !options.regenerate &&
        baseMessages.filter((m) => m.role === MESSAGE_ROLES.USER).length === 1

      updateChat(activeChat.id, (c) => ({
        ...c,
        messages: initialMessages,
        // Use the first user message as a working title
        title:
          isFirstUserTurn && trimmed && (c.title === 'New chat' || !c.title)
            ? trimmed.slice(0, 60)
            : c.title,
      }))

      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)

      try {
        let aggregated = ''
        let usage = null

        await streamChatCompletion({
          messages: baseMessages.map((m) => ({ role: m.role, content: m.content })),
          model: activeChat.model,
          signal: controller.signal,
          onToken: (token) => {
            aggregated += token
            updateChat(activeChat.id, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: aggregated } : m,
              ),
            }))
          },
          onUsage: (u) => {
            usage = u
          },
        })

        updateChat(activeChat.id, (c) => ({
          ...c,
          tokenUsage: usage
            ? {
                prompt: (c.tokenUsage?.prompt ?? 0) + (usage.prompt_tokens ?? 0),
                completion: (c.tokenUsage?.completion ?? 0) + (usage.completion_tokens ?? 0),
                total: (c.tokenUsage?.total ?? 0) + (usage.total_tokens ?? 0),
              }
            : c.tokenUsage,
          messages: c.messages.map((m) =>
            m.id === assistantMsg.id ? { ...m, streaming: false } : m,
          ),
        }))
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          updateChat(activeChat.id, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, streaming: false, content: m.content || '_(stopped)_' }
                : m,
            ),
          }))
        } else {
          console.error(err)
          setError(err.message || 'Something went wrong while generating a response.')
          updateChat(activeChat.id, (c) => ({
            ...c,
            messages: c.messages.filter((m) => m.id !== assistantMsg.id),
          }))
        }
      } finally {
        abortRef.current = null
        setIsStreaming(false)
      }
    },
    [activeChat, updateChat],
  )

  const regenerate = useCallback(() => {
    if (!activeChat || activeChat.messages.length === 0) return
    return sendMessage('', { regenerate: true })
  }, [activeChat, sendMessage])

  const exportChat = useCallback(
    (chatId) => {
      const chat = chats.find((c) => c.id === chatId) ?? activeChat
      if (!chat) return
      const lines = [
        `# ${chat.title}`,
        '',
        `_Model: ${chat.model} • Created: ${new Date(chat.createdAt).toLocaleString()}_`,
        '',
        ...chat.messages.map((m) => `**${m.role.toUpperCase()}**\n\n${m.content}\n`),
      ]
      const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${chat.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60)}.md`
      a.click()
      URL.revokeObjectURL(url)
    },
    [chats, activeChat],
  )

  const setSystemPrompt = useCallback((chatId, prompt) => {
    const normalized = prompt && prompt.trim() ? prompt : null
    updateChat(chatId, (c) => ({ ...c, systemPrompt: normalized }))
  }, [updateChat])

  const setActiveModel = useCallback(
    (nextModel) => {
      setModel(nextModel)
      if (activeChat) {
        updateChat(activeChat.id, (c) => ({ ...c, model: nextModel }))
      }
    },
    [activeChat, updateChat],
  )

  const value = useMemo(
    () => ({
      chats,
      activeChat,
      activeChatId,
      setActiveChatId,
      newChat,
      deleteChat,
      renameChat,
      sendMessage,
      regenerate,
      stopGenerating,
      isStreaming,
      error,
      clearError: () => setError(null),
      clearActiveChat,
      exportChat,
      model,
      setModel: setActiveModel,
      setSystemPrompt,
    }),
    [
      chats,
      activeChat,
      activeChatId,
      newChat,
      deleteChat,
      renameChat,
      sendMessage,
      regenerate,
      stopGenerating,
      isStreaming,
      error,
      clearActiveChat,
      exportChat,
      model,
      setActiveModel,
      setSystemPrompt,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider')
  return ctx
}
