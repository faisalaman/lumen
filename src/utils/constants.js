export const STORAGE_KEYS = {
  THEME: 'aichat.theme',
  CHATS: 'aichat.chats.v1',
  ACTIVE_CHAT: 'aichat.activeChat',
  MODEL: 'aichat.model',
  AUTH_TOKEN: 'aichat.authToken',
}

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
}

export const DEFAULT_MODEL = import.meta.env.VITE_DEFAULT_MODEL || 'gpt-4.1'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Lumen'

/**
 * Available models. Each entry uses an `id` that the backend understands and
 * a `provider` so the backend can route to the right SDK.
 */
export const MODELS = [
  { id: 'gpt-4.1', label: 'GPT-4.1', provider: 'openai', tag: 'OpenAI' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: 'openai', tag: 'OpenAI' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', provider: 'anthropic', tag: 'Anthropic' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', provider: 'anthropic', tag: 'Anthropic' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'google', tag: 'Google' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'google', tag: 'Google' },
  // Local Llama via Ollama / llama.cpp / LM Studio. Edit the id to match the
  // model name your local runner advertises (e.g. `ollama list`).
  { id: 'llama3.2', label: 'Llama 3.2 (local)', provider: 'llama', tag: 'Local' },
  { id: 'llama3.1:8b', label: 'Llama 3.1 8B (local)', provider: 'llama', tag: 'Local' },
  { id: 'qwen2.5:7b', label: 'Qwen 2.5 7B (local)', provider: 'llama', tag: 'Local' },
  { id: 'mistral', label: 'Mistral (local)', provider: 'llama', tag: 'Local' },
]
