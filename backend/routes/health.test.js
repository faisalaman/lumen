import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkLlama } from './health.js'

test('checkLlama: returns false when baseUrl is empty', async () => {
  const result = await checkLlama('')
  assert.equal(result, false)
})

test('checkLlama: returns false when baseUrl is undefined', async () => {
  const result = await checkLlama(undefined)
  assert.equal(result, false)
})

test('checkLlama: returns false on connection refused', async () => {
  // Port 1 is reserved and not listening — fetch will fail fast.
  const result = await checkLlama('http://127.0.0.1:1/v1')
  assert.equal(result, false)
})

test('checkLlama: returns false on bad URL', async () => {
  const result = await checkLlama('http://nonexistent.invalid:1/v1')
  assert.equal(result, false)
})
