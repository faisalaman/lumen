import { useChatContext } from '../context/ChatContext.jsx'

/**
 * Thin alias around the ChatContext hook so consumers don't need to import the
 * provider path directly. Keeps the public hook surface stable if we ever swap
 * the underlying implementation.
 */
export function useChat() {
  return useChatContext()
}
