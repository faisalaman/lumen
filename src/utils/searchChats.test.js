import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filterChats, highlight } from './searchChats.js'

const chats = [
  { id: '1', title: 'Quick recipe', messages: [{ role: 'user', content: 'How do I sauté garlic?' }] },
  { id: '2', title: 'Debounce hook', messages: [{ role: 'user', content: 'TypeScript hook with tests' }] },
  { id: '3', title: 'Trip ideas', messages: [{ role: 'user', content: 'Tokyo for 5 days' }] },
  { id: '4', title: 'Untitled', messages: [{ role: 'user', content: [{ type: 'text', text: 'parts shape works' }] }] },
]

test('filterChats: empty query returns all', () => {
  assert.equal(filterChats(chats, '').length, 4)
  assert.equal(filterChats(chats, '   ').length, 4)
  assert.equal(filterChats(chats, undefined).length, 4)
})

test('filterChats: matches title (case insensitive)', () => {
  const out = filterChats(chats, 'TRIP')
  assert.equal(out.length, 1)
  assert.equal(out[0].id, '3')
})

test('filterChats: matches message body', () => {
  const out = filterChats(chats, 'tokyo')
  assert.equal(out.length, 1)
  assert.equal(out[0].id, '3')
})

test('filterChats: handles parts-shape content', () => {
  const out = filterChats(chats, 'parts shape')
  assert.equal(out.length, 1)
  assert.equal(out[0].id, '4')
})

test('filterChats: no matches returns empty', () => {
  assert.equal(filterChats(chats, 'xyzzy').length, 0)
})

test('highlight: empty query returns original wrapped in array', () => {
  assert.deepEqual(highlight('hello', ''), ['hello'])
})

test('highlight: single match in middle', () => {
  assert.deepEqual(highlight('hello world', 'lo'), [
    'hel',
    { match: true, text: 'lo' },
    ' world',
  ])
})

test('highlight: match at start', () => {
  assert.deepEqual(highlight('hello world', 'he'), [
    { match: true, text: 'he' },
    'llo world',
  ])
})

test('highlight: match at end', () => {
  assert.deepEqual(highlight('hello world', 'rld'), [
    'hello wo',
    { match: true, text: 'rld' },
  ])
})

test('highlight: multiple matches', () => {
  assert.deepEqual(highlight('aba aba', 'a'), [
    { match: true, text: 'a' },
    'b',
    { match: true, text: 'a' },
    ' ',
    { match: true, text: 'a' },
    'b',
    { match: true, text: 'a' },
  ])
})

test('highlight: case insensitive matching preserves original case', () => {
  assert.deepEqual(highlight('Hello World', 'hello'), [
    { match: true, text: 'Hello' },
    ' World',
  ])
})

test('highlight: no match returns original', () => {
  assert.deepEqual(highlight('hello world', 'xyz'), ['hello world'])
})
