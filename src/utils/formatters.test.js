import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatRelativeShort, bucketByDate } from './formatters.js'

const NOW = new Date('2026-05-08T12:00:00.000Z').getTime()
const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

test('formatRelativeShort: under 1 minute → "now"', () => {
  assert.equal(formatRelativeShort(NOW - 30 * 1000, NOW), 'now')
})

test('formatRelativeShort: minutes', () => {
  assert.equal(formatRelativeShort(NOW - 5 * MIN, NOW), '5m')
})

test('formatRelativeShort: hours', () => {
  assert.equal(formatRelativeShort(NOW - 3 * HOUR, NOW), '3h')
})

test('formatRelativeShort: days', () => {
  assert.equal(formatRelativeShort(NOW - 2 * DAY, NOW), '2d')
})

test('formatRelativeShort: weeks', () => {
  assert.equal(formatRelativeShort(NOW - 14 * DAY, NOW), '2w')
})

test('formatRelativeShort: months', () => {
  assert.equal(formatRelativeShort(NOW - 60 * DAY, NOW), '2mo')
})

test('formatRelativeShort: years', () => {
  assert.equal(formatRelativeShort(NOW - 400 * DAY, NOW), '1y')
})

test('formatRelativeShort: missing timestamp → empty string', () => {
  assert.equal(formatRelativeShort(0, NOW), '')
  assert.equal(formatRelativeShort(undefined, NOW), '')
})

test('bucketByDate: groups today, yesterday, week, older', () => {
  const chats = [
    { id: '1', updatedAt: NOW - 30 * MIN },        // today
    { id: '2', updatedAt: NOW - 6 * HOUR },        // today
    { id: '3', updatedAt: NOW - 30 * HOUR },       // yesterday
    { id: '4', updatedAt: NOW - 4 * DAY },         // week
    { id: '5', updatedAt: NOW - 30 * DAY },        // older
  ]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 4)
  assert.deepEqual(out.map((b) => b.label), ['Today', 'Yesterday', 'Last 7 days', 'Older'])
  assert.equal(out[0].chats.length, 2)
  assert.equal(out[1].chats[0].id, '3')
  assert.equal(out[2].chats[0].id, '4')
  assert.equal(out[3].chats[0].id, '5')
})

test('bucketByDate: omits empty buckets', () => {
  const chats = [
    { id: 'a', updatedAt: NOW - 100 * DAY },
  ]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 1)
  assert.equal(out[0].label, 'Older')
})

test('bucketByDate: missing updatedAt → Older bucket (treated as 0)', () => {
  const chats = [{ id: 'x' }]
  const out = bucketByDate(chats, NOW)
  assert.equal(out.length, 1)
  assert.equal(out[0].label, 'Older')
  assert.equal(out[0].chats[0].id, 'x')
})
