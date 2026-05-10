# Features v2 — Design Spec

**Date:** 2026-05-10
**Status:** Approved (user instructed: "don't ask for permission" — proceeding without per-section gates)
**Outcome:** Add four high-impact features to the deployed Lumen app: ⌘K command palette, conversation search in the sidebar, per-conversation system prompts, and image upload (vision input). All four ship as a single combined spec → plan → implementation cycle.

**Spec context:** Built on top of the Glass Dark redesign (spec [2026-05-08-glass-dark-redesign-design.md](./2026-05-08-glass-dark-redesign-design.md)). Token system, theme, motion language, and component patterns from v1 are reused throughout — no new visual language introduced.

---

## 1. Goals & non-goals

**Goals**
1. Add a ⌘K command palette that surfaces actions, model switching, and chat navigation in a single fast keyboard-driven UI.
2. Add a sidebar conversation search that filters the chat list in real time by title and message contents.
3. Add a per-conversation system prompt (custom instructions/persona) editable from the header.
4. Add image upload — drag/drop, paste, and file picker — with multimodal routing to vision-capable models (Gemini 2.5, GPT-4.1, Claude Sonnet 4.6).

**Non-goals**
- File/PDF upload (only images for v2; documents are a separate project).
- Voice input.
- Slash-command library (no prebuilt prompts UI).
- Code-panel popout for long code blocks.
- Multi-model side-by-side comparison.
- Conversation export.
- Pinning / archiving / folders.
- Mobile-specific redesigns (the four features must work on mobile, but no mobile-only re-layout).
- New backend storage — images are forwarded to providers as base64; no persistence layer.

---

## 2. Cross-cutting: message content shape

The biggest architectural change in v2 is that a message's `content` is no longer always a string. To support image attachments, content becomes a **union of `string` (legacy text-only) and an array of typed parts**.

```ts
// New union shape (TypeScript notation for clarity; codebase is JS)
type MessageContent =
  | string                              // legacy text-only (still valid)
  | Array<TextPart | ImagePart>

type TextPart  = { type: 'text';  text: string }
type ImagePart = { type: 'image'; mimeType: string; dataBase64: string }
```

**Backward compatibility:** Everywhere we read `message.content`, we add a tiny normalizer:
```js
function partsOf(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }]
  return content
}
```
Existing chats in localStorage (with string content) keep working without migration.

**Where this is normalized:**
- Frontend: `MessageBubble.jsx` rendering, `chatService.js` request building, `ChatContext.jsx` mutations.
- Backend: `backend/services/providers.js` — each provider's message mapper handles parts.
- Backend zod schema in `backend/routes/chat.js` accepts both shapes.

---

## 3. Feature A — ⌘K Command Palette

### 3.1 UI

A centered modal, ~480 px wide, max ~480 px tall, opened with **Cmd+K (Mac) / Ctrl+K (other)** or by clicking a keyboard-shortcut hint chip in the header. Closed with **Esc**, click outside, or selecting an item.

- **Surface:** Glass surface (`bg-bg-elev` + `border-line-1` + strong `shadow-lift`), positioned at top-25vh.
- **Backdrop:** `bg-black/60` with `backdrop-blur-sm`.
- **Layout:**
  - Top: search input (`input-base` style, autoFocus on open).
  - Below: scrollable result list, max-height ~400px.
  - Sections separated by small gray section labels (`text-ink-3 text-[10px] uppercase`).

### 3.2 Behavior

**Empty input** — three sections, each showing top items:
1. **Actions** — New chat, Toggle theme, Open settings, Clear current chat
2. **Recent chats** — top 5 by `updatedAt`
3. **Switch model** — all models from `MODELS` constant, with the active one marked

**With input** — flat fuzzy-filterable list across all three categories. Simple substring match on the displayed label is sufficient (no fancy fuzzy lib).

**Keyboard:**
- ↑ / ↓ — navigate
- Enter — select
- Esc — close
- Cmd+K while open — also closes

**Mobile fallback:** A small `⌘K` chip in the header (visible at all viewports) opens the same palette. On mobile the modal becomes full-screen (drops `max-w-[480px]`, expands to viewport with safe-area padding).

### 3.3 Files

| File | Status | Responsibility |
|---|---|---|
| `src/components/CommandPalette.jsx` | create | The modal, search input, result list, action handlers |
| `src/hooks/useHotkeys.js` | create | Global keydown listener; registers ⌘K + Esc |
| `src/components/Header.jsx` | edit | Add the small `⌘K` chip trigger |
| `src/App.jsx` | edit | Mount `<CommandPalette />` (sibling of `<ChatPage />`, like `AppBackdrop`) |

State lives entirely inside `CommandPalette` (open/closed boolean, search query, selected index). Open state can be in a tiny `useCommandPalette` hook so the header chip can flip it.

---

## 4. Feature B — Conversation search

### 4.1 UI

A search input added to `Sidebar.jsx`, positioned **between the brand row and the "New chat" button**. Style: `input-base`-like with a small leading magnifying-glass icon. Always visible (collapsible later if it gets crowded).

### 4.2 Behavior

Real-time, case-insensitive substring filter on every chat:
- Match against `chat.title`
- Match against `chat.messages.map(m => textOf(m)).join(' ')` (concatenation of all text content; image parts ignored)

Bucketing logic from v1 still runs, but only over the FILTERED chats. Empty buckets are auto-omitted (already handled by `bucketByDate`).

When `query !== ''`:
- Matched substrings in the chat title are wrapped in `<mark>` tags for visual highlight.
- A small "X" / clear button appears in the search input.

### 4.3 Files

| File | Status | Responsibility |
|---|---|---|
| `src/components/Sidebar.jsx` | edit | Search input + state, passes `query` to `ChatHistory` |
| `src/components/ChatHistory.jsx` | edit | Accept `query` prop; filter chats before bucketing; render highlighted titles |
| `src/utils/searchChats.js` | create | `filterChats(chats, query)` + `highlight(text, query)` helpers |
| `src/utils/searchChats.test.js` | create | `node --test` cases |

---

## 5. Feature C — Image upload (vision input)

### 5.1 UI

In the input bar (`ChatInput.jsx`), add a **paperclip icon** (`Paperclip` from lucide) to the LEFT of the textarea. Clicking it opens a file picker filtered to `image/*`. Multiple selection allowed (up to 4 images per send; cap is enforced client-side).

Selected images show as **preview chips** in a row ABOVE the textarea, inside the input wrapper:
- 56×56 px image thumbnails with rounded corners
- Hover shows a small "X" overlay to remove that image
- Filename + size in tiny text below the thumbnail (truncated)

Drag-and-drop onto the input bar OR paste from clipboard (Cmd+V) also work.

### 5.2 Constraints

- **Per-image cap:** 5 MB (client-side validation — bigger images show a toast-style error and are rejected).
- **Per-message cap:** 4 images (UI disables the paperclip when 4 are queued).
- **Total request size:** ~25 MB (Express body-parser limit raised to 32 MB to allow headroom).
- **Provider compatibility:** A small badge in the input bar warns when an image is queued AND the active model lacks vision support. Vision-capable models in our list:
  - `gpt-4.1`, `gpt-4.1-mini`
  - `claude-sonnet-4-6`, `claude-opus-4-6`
  - `gemini-2.5-pro`, `gemini-2.5-flash`
  - Local: `qwen3-vl:30b` if user has it pulled (we don't enumerate local vision models — assume none are vision unless the model id contains `vl`)
- Sending an image with a non-vision model is BLOCKED — the send button is disabled with a tooltip ("Switch to a vision-capable model: GPT-4.1, Claude Sonnet, Gemini 2.5").

### 5.3 Storage / data flow

- Images are read with `FileReader.readAsDataURL`, producing base64 data-URIs.
- Each image is stored in the message object as `{ type: 'image', mimeType, dataBase64 }` (the bare base64, not the full data URI).
- The whole user message lands in localStorage as part of the chat. Yes — this means localStorage size grows with image volume. We accept this tradeoff for v2; if storage pressure becomes real, we'll move to IndexedDB. The per-image (5 MB) and per-message (4 images) caps are the only enforcement; no separate chat-size warning in v2.
- The user bubble in `MessageBubble.jsx` renders inline image previews above the text part (160 px max width, rounded corners).
- The assistant response is text only (no provider currently returns images that we'd render — image generation is a separate feature).

### 5.4 Backend changes

`backend/routes/chat.js`:
- Increase `express.json({ limit: '32mb' })` (or whatever the existing parser config is).
- Update zod schema:
  ```js
  const ContentPart = z.union([
    z.object({ type: z.literal('text'), text: z.string() }),
    z.object({ type: z.literal('image'), mimeType: z.string().regex(/^image\//), dataBase64: z.string() }),
  ])
  const Message = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.union([z.string(), z.array(ContentPart).min(1)]),
  })
  ```

`backend/services/providers.js`:
- Each provider's message-mapper learns to handle parts:
  - **OpenAI**: `{ role, content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: 'data:<mime>;base64,<b64>' } }] }`
  - **Anthropic**: `{ role, content: [{ type: 'text', text }, { type: 'image', source: { type: 'base64', media_type: <mime>, data: <b64> } }] }`
  - **Google (Gemini)**: `{ role, parts: [{ text }, { inlineData: { mimeType, data: <b64> } }] }`
  - **Llama (OpenAI-compatible local)**: same as OpenAI shape; vision-capable models like qwen3-vl will accept it.

A small helper `partsOf(content)` (per §2) is added to the providers file to normalize string content into a single text part before the per-provider mapping.

### 5.5 Files

| File | Status | Responsibility |
|---|---|---|
| `src/components/ChatInput.jsx` | edit | Paperclip button, image preview chips, drag-drop, paste, send-disabled logic |
| `src/components/MessageBubble.jsx` | edit | Render image parts in user bubbles |
| `src/utils/images.js` | create | `readAsBase64(file)` (FileReader wrapper); `validateImage(file)` (size/type checks; mime taken from `file.type`) |
| `src/utils/content.js` | create | `partsOf`, `textOnly` (frontend mirror of backend helper) |
| `src/services/chatService.js` | edit | Build the union-shape `messages` payload |
| `src/context/ChatContext.jsx` | edit | Accept image parts in `sendMessage` |
| `backend/routes/chat.js` | edit | Body-size cap + zod schema for parts |
| `backend/services/providers.js` | edit | Per-provider parts mapping |

---

## 6. Feature D — System prompt per conversation

### 6.1 UI

A small **`✨ Instructions`** button in the header, right after the model chip. When the active chat has a non-empty system prompt, the button gets a filled state (gradient background) and a small dot indicator.

Clicking opens a centered modal (same overlay + body pattern as `SettingsModal.jsx` — `bg-bg-elev` + `border-line-1` + `shadow-lift`, 92% width up to `max-w-md`):
- Heading: "Instructions for this chat"
- Subtitle: "Set a persona, tone, or persistent context. Sent as a system message at the start of every reply."
- A 6-row textarea (`input-base`) — placeholder example: *"You are a senior staff engineer reviewing my code. Be terse and direct."*
- Footer: Cancel button (btn-ghost) + Save button (btn-gradient). Save closes; Cancel closes without persisting.

### 6.2 Storage

Each chat gains `systemPrompt: string | null` in its object. Stored in localStorage with the chat. When sending, the chat's `systemPrompt` is prepended as a `{ role: 'system', content: <prompt> }` message before the user/assistant messages — but only if non-empty.

### 6.3 Files

| File | Status | Responsibility |
|---|---|---|
| `src/components/Header.jsx` | edit | Instructions button + filled-state styling |
| `src/components/SystemPromptModal.jsx` | create | The popover with textarea + save logic |
| `src/context/ChatContext.jsx` | edit | New action `setSystemPrompt(chatId, prompt)`; chat shape gains the field |
| `src/services/chatService.js` | edit | Prepend system message if `chat.systemPrompt` is set |

---

## 7. Implementation order

To minimize integration risk and let us ship in slices:

1. **Cross-cutting message-shape normalizer** (`src/utils/content.js` + `backend/services/providers.js` `partsOf`) — used by features C and D.
2. **Feature D — System prompt** (smallest, exercises the shape change).
3. **Feature B — Conversation search** (sidebar-only, no shape impact).
4. **Feature A — ⌘K palette** (largest frontend addition, no backend impact).
5. **Feature C — Image upload** (most complex; touches frontend + backend; benefits from shape change being already proven by D).

Each feature is independently mergeable — if any one runs into trouble, the others still ship.

---

## 8. Acceptance criteria

The v2 features are "done" when:

- [ ] **⌘K palette** opens with Cmd/Ctrl+K, lists actions/chats/models, supports keyboard nav, closes on Esc; mobile chip in header opens it.
- [ ] **Sidebar search** filters chats in real time by title + message body; matched titles show highlighted text; bucket headers auto-collapse.
- [ ] **System prompt** can be set/cleared per chat via a header button; persists in localStorage; is sent as a `{role:'system'}` message; UI shows a filled state when active.
- [ ] **Image upload** — paperclip + drag-drop + paste all work; previews show in input; user bubble renders images; multimodal request reaches Gemini 2.5 / GPT-4.1 / Claude Sonnet correctly; non-vision model + image attached → send disabled with explainer.
- [ ] No regressions: existing text-only chats still work; theme switching works; auto-scroll works; deploy still succeeds end-to-end on Vercel + Render.

---

## 9. Out of scope (deliberately deferred)

- Persistent image storage (current: live in localStorage as base64).
- Image generation / display in assistant responses.
- File / PDF upload.
- Slash commands.
- Voice input.
- Multi-image grid layouts beyond a simple horizontal row.
- Server-side image processing / resizing.
- Per-message system prompts (only per-conversation in v2).
- A "library" of saved system prompts (one per chat, no library yet).

If any of these come up later, they get their own spec.
