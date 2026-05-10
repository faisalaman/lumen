import { test } from 'node:test'
import assert from 'node:assert/strict'
import { partsOf, textOf, imageCount } from './content.js'

test('partsOf: string content becomes a single text part', () => {
  assert.deepEqual(partsOf('hello'), [{ type: 'text', text: 'hello' }])
})

test('partsOf: empty string becomes empty array', () => {
  assert.deepEqual(partsOf(''), [])
})

test('partsOf: null/undefined becomes empty array', () => {
  assert.deepEqual(partsOf(null), [])
  assert.deepEqual(partsOf(undefined), [])
})

test('partsOf: array content passes through unchanged', () => {
  const parts = [
    { type: 'text', text: 'see this:' },
    { type: 'image', mimeType: 'image/png', dataBase64: 'AAA' },
  ]
  assert.deepEqual(partsOf(parts), parts)
})

test('partsOf: unrecognized shape becomes empty array', () => {
  assert.deepEqual(partsOf(42), [])
  assert.deepEqual(partsOf({}), [])
})

test('textOf: returns concatenated text from parts', () => {
  const parts = [
    { type: 'text', text: 'hello ' },
    { type: 'image', mimeType: 'image/png', dataBase64: 'AAA' },
    { type: 'text', text: 'world' },
  ]
  assert.equal(textOf(parts), 'hello world')
})

test('textOf: works on string content directly', () => {
  assert.equal(textOf('plain'), 'plain')
})

test('textOf: image-only message returns empty string', () => {
  const parts = [{ type: 'image', mimeType: 'image/png', dataBase64: 'AAA' }]
  assert.equal(textOf(parts), '')
})

test('imageCount: counts image parts', () => {
  const parts = [
    { type: 'text', text: 'caption' },
    { type: 'image', mimeType: 'image/png', dataBase64: 'AAA' },
    { type: 'image', mimeType: 'image/jpeg', dataBase64: 'BBB' },
  ]
  assert.equal(imageCount(parts), 2)
})

test('imageCount: 0 for string content', () => {
  assert.equal(imageCount('hello'), 0)
})
