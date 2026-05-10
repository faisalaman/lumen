import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const PROVIDER_BY_MODEL_PREFIX = [
  { match: /^gpt[-_]/i, provider: 'openai' },
  { match: /^o[1-9]/i, provider: 'openai' },
  { match: /^claude[-_]/i, provider: 'anthropic' },
  { match: /^gemini[-_]/i, provider: 'google' },
  // Local Llama runners (Ollama, llama.cpp, LM Studio). Match common prefixes
  // and tag suffixes like "llama3.1:8b", "qwen2.5:7b", "mistral", "phi3".
  { match: /^(llama|qwen|mistral|mixtral|phi|gemma|deepseek|codellama)/i, provider: 'llama' },
]

export function resolveProvider(model) {
  for (const { match, provider } of PROVIDER_BY_MODEL_PREFIX) {
    if (match.test(model)) return provider
  }
  throw httpError(400, `Unsupported model: ${model}`)
}

let _openai
let _anthropic
let _google
let _llama

function openai() {
  if (!process.env.OPENAI_API_KEY) throw httpError(500, 'OPENAI_API_KEY is not set')
  return (_openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
}
function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw httpError(500, 'ANTHROPIC_API_KEY is not set')
  return (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
}
function google() {
  if (!process.env.GOOGLE_API_KEY) throw httpError(500, 'GOOGLE_API_KEY is not set')
  return (_google ??= new GoogleGenerativeAI(process.env.GOOGLE_API_KEY))
}
function llama() {
  // Local Llama runners speak the OpenAI Chat Completions wire format. We
  // reuse the OpenAI SDK with a custom baseURL.
  const baseURL = process.env.LLAMA_BASE_URL || 'http://localhost:11434/v1'
  // Most local runners ignore the key but the SDK requires a non-empty value.
  const apiKey = process.env.LLAMA_API_KEY || 'local'
  return (_llama ??= new OpenAI({ baseURL, apiKey }))
}

/* ------------------------- Non-streaming completion ------------------------ */

export async function callProvider(provider, { messages, model, temperature }) {
  if (provider === 'openai') {
    const r = await openai().chat.completions.create({
      model,
      messages,
      temperature: temperature ?? 0.7,
    })
    return {
      content: r.choices?.[0]?.message?.content ?? '',
      usage: r.usage,
      model: r.model,
    }
  }
  if (provider === 'anthropic') {
    const { system, msgs } = splitSystem(messages)
    const r = await anthropic().messages.create({
      model,
      max_tokens: 4096,
      temperature: temperature ?? 0.7,
      system,
      messages: msgs.map((m) => ({ role: m.role, content: m.content })),
    })
    return {
      content: r.content?.map((c) => c.text || '').join('') ?? '',
      usage: {
        prompt_tokens: r.usage?.input_tokens,
        completion_tokens: r.usage?.output_tokens,
        total_tokens: (r.usage?.input_tokens ?? 0) + (r.usage?.output_tokens ?? 0),
      },
      model: r.model,
    }
  }
  if (provider === 'google') {
    const m = google().getGenerativeModel({ model })
    const { system, msgs } = splitSystem(messages)
    const r = await m.generateContent({
      systemInstruction: system,
      contents: msgs.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { temperature: temperature ?? 0.7 },
    })
    return {
      content: r.response.text(),
      usage: r.response.usageMetadata
        ? {
            prompt_tokens: r.response.usageMetadata.promptTokenCount,
            completion_tokens: r.response.usageMetadata.candidatesTokenCount,
            total_tokens: r.response.usageMetadata.totalTokenCount,
          }
        : undefined,
      model,
    }
  }
  if (provider === 'llama') {
    const r = await llama().chat.completions.create({
      model,
      messages,
      temperature: temperature ?? 0.7,
    })
    return {
      content: r.choices?.[0]?.message?.content ?? '',
      usage: r.usage,
      model: r.model,
    }
  }
  throw httpError(400, `Unknown provider: ${provider}`)
}

/* ----------------------------- Streaming variant --------------------------- */

export async function streamProvider(provider, { messages, model, temperature }, { signal, onToken, onUsage }) {
  if (provider === 'openai') {
    const stream = await openai().chat.completions.create(
      { model, messages, temperature: temperature ?? 0.7, stream: true, stream_options: { include_usage: true } },
      { signal },
    )
    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content
      if (delta) onToken?.(delta)
      if (part.usage) onUsage?.(part.usage)
    }
    return
  }
  if (provider === 'anthropic') {
    const { system, msgs } = splitSystem(messages)
    const stream = anthropic().messages.stream(
      {
        model,
        max_tokens: 4096,
        temperature: temperature ?? 0.7,
        system,
        messages: msgs.map((m) => ({ role: m.role, content: m.content })),
      },
      { signal },
    )
    stream.on('text', (delta) => onToken?.(delta))
    const final = await stream.finalMessage()
    if (final?.usage) {
      onUsage?.({
        prompt_tokens: final.usage.input_tokens,
        completion_tokens: final.usage.output_tokens,
        total_tokens: (final.usage.input_tokens ?? 0) + (final.usage.output_tokens ?? 0),
      })
    }
    return
  }
  if (provider === 'google') {
    const m = google().getGenerativeModel({ model })
    const { system, msgs } = splitSystem(messages)
    const r = await m.generateContentStream({
      systemInstruction: system,
      contents: msgs.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { temperature: temperature ?? 0.7 },
    })
    for await (const chunk of r.stream) {
      if (signal?.aborted) break
      const text = chunk.text?.()
      if (text) onToken?.(text)
    }
    const final = await r.response
    if (final?.usageMetadata) {
      onUsage?.({
        prompt_tokens: final.usageMetadata.promptTokenCount,
        completion_tokens: final.usageMetadata.candidatesTokenCount,
        total_tokens: final.usageMetadata.totalTokenCount,
      })
    }
    return
  }
  if (provider === 'llama') {
    const stream = await llama().chat.completions.create(
      { model, messages, temperature: temperature ?? 0.7, stream: true },
      { signal },
    )
    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content
      if (delta) onToken?.(delta)
      if (part.usage) onUsage?.(part.usage)
    }
    return
  }
  throw httpError(400, `Unknown provider: ${provider}`)
}

/* --------------------------------- Helpers -------------------------------- */

/**
 * Normalize a message's `content` to an array of parts.
 * Strings become a single text part. Used by every provider mapper
 * to handle the union shape uniformly.
 */
function partsOf(content) {
  if (content == null) return []
  if (typeof content === 'string') {
    return content === '' ? [] : [{ type: 'text', text: content }]
  }
  if (Array.isArray(content)) return content
  return []
}

function splitSystem(messages) {
  const systems = messages.filter((m) => m.role === 'system').map((m) => m.content)
  const msgs = messages.filter((m) => m.role !== 'system')
  return { system: systems.join('\n\n') || undefined, msgs }
}

function httpError(status, message) {
  const e = new Error(message)
  e.status = status
  return e
}
