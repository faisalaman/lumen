import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateImage, modelSupportsVision, MAX_IMAGE_BYTES, MAX_IMAGES_PER_MESSAGE } from './images.js'

test('validateImage: missing file', () => {
  assert.equal(validateImage(null), 'No file')
})

test('validateImage: accepts png/jpeg/webp', () => {
  assert.equal(validateImage({ type: 'image/png', size: 1024 }), null)
  assert.equal(validateImage({ type: 'image/jpeg', size: 1024 }), null)
  assert.equal(validateImage({ type: 'image/webp', size: 1024 }), null)
})

test('validateImage: rejects non-image types', () => {
  const result = validateImage({ type: 'application/pdf', size: 1024 })
  assert.match(result, /Unsupported/)
})

test('validateImage: rejects oversize', () => {
  const result = validateImage({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })
  assert.match(result, /too large/)
})

test('validateImage: accepts at exactly the cap', () => {
  assert.equal(validateImage({ type: 'image/png', size: MAX_IMAGE_BYTES }), null)
})

test('modelSupportsVision: known cloud models', () => {
  assert.equal(modelSupportsVision('gpt-4.1'), true)
  assert.equal(modelSupportsVision('claude-sonnet-4-6'), true)
  assert.equal(modelSupportsVision('gemini-2.5-flash'), true)
})

test('modelSupportsVision: text-only model returns false', () => {
  assert.equal(modelSupportsVision('llama3.2'), false)
})

test('modelSupportsVision: local vision model heuristic (qwen3-vl)', () => {
  assert.equal(modelSupportsVision('qwen3-vl:30b'), true)
  assert.equal(modelSupportsVision('llava-vl'), true)
})

test('modelSupportsVision: ignores partial matches not at boundary', () => {
  assert.equal(modelSupportsVision('volvo'), false) // contains "vl" but not at boundary
})

test('constants exported', () => {
  assert.equal(MAX_IMAGE_BYTES, 5 * 1024 * 1024)
  assert.equal(MAX_IMAGES_PER_MESSAGE, 4)
})
