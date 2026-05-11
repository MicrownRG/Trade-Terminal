// tests/unit/useMarketData.test.ts
// TDD: covers mock data generation and fetchOHLCV caching behaviour.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateMockBars,
  fetchOHLCV,
} from '~/composables/useMarketData'
import type { Bar } from '~/types'

// ── Mock $fetch (used inside fetchOHLCV) ─────────────────
// In test env there is no Nuxt runtime, so $fetch is undefined.
// We stub it via globalThis.
const fetchMock = vi.fn()

beforeEach(() => {
  // expose $fetch on globalThis as nuxt does at runtime
  vi.stubGlobal('$fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────
describe('generateMockBars', () => {
  it('returns exactly `count` bars', () => {
    expect(generateMockBars(10)).toHaveLength(10)
    expect(generateMockBars(100)).toHaveLength(100)
    expect(generateMockBars(1)).toHaveLength(1)
  })

  it('returns empty array for count=0', () => {
    expect(generateMockBars(0)).toHaveLength(0)
  })

  it('each bar has all required OHLCV fields', () => {
    const bars = generateMockBars(5)
    for (const b of bars) {
      expect(b).toHaveProperty('time')
      expect(b).toHaveProperty('open')
      expect(b).toHaveProperty('high')
      expect(b).toHaveProperty('low')
      expect(b).toHaveProperty('close')
      expect(b).toHaveProperty('volume')
    }
  })

  it('bars have monotonically increasing time values', () => {
    const bars = generateMockBars(20)
    for (let i = 1; i < bars.length; i++) {
      expect(bars[i]!.time).toBeGreaterThan(bars[i - 1]!.time)
    }
  })

  it('no bar has NaN in any numeric field', () => {
    const bars = generateMockBars(50)
    for (const b of bars) {
      expect(isNaN(b.open)).toBe(false)
      expect(isNaN(b.high)).toBe(false)
      expect(isNaN(b.low)).toBe(false)
      expect(isNaN(b.close)).toBe(false)
      expect(isNaN(b.volume)).toBe(false)
    }
  })

  it('high >= max(open, close)', () => {
    const bars = generateMockBars(20)
    for (const b of bars) {
      expect(b.high).toBeGreaterThanOrEqual(Math.max(b.open, b.close))
    }
  })

  it('low <= min(open, close)', () => {
    const bars = generateMockBars(20)
    for (const b of bars) {
      expect(b.low).toBeLessThanOrEqual(Math.min(b.open, b.close))
    }
  })

  it('all prices are positive', () => {
    const bars = generateMockBars(20)
    for (const b of bars) {
      expect(b.open).toBeGreaterThan(0)
      expect(b.high).toBeGreaterThan(0)
      expect(b.low).toBeGreaterThan(0)
      expect(b.close).toBeGreaterThan(0)
      expect(b.volume).toBeGreaterThan(0)
    }
  })

  it('uses realistic BTC base price (>= 50000)', () => {
    // The starting price should be realistic BTC price, not 45000
    const bars = generateMockBars(5)
    // At least the first bar should be near a realistic BTC price
    expect(bars[0]!.open).toBeGreaterThanOrEqual(50000)
  })
})

// ─────────────────────────────────────────────────────────
describe('fetchOHLCV', () => {
  it('returns data from $fetch on success', async () => {
    const mockBars: Bar[] = [
      { time: 1700000000, open: 60000, high: 61000, low: 59000, close: 60500, volume: 100 },
    ]
    fetchMock.mockResolvedValueOnce(mockBars)
    const result = await fetchOHLCV('BTCUSDT', '1h', 1)
    expect(result).toEqual(mockBars)
    expect(fetchMock).toHaveBeenCalledWith('/api/binance/klines', expect.objectContaining({
      params: expect.objectContaining({ symbol: 'BTCUSDT', interval: '1h', limit: 1 }),
    }))
  })

  it('returns mock bars when $fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'))
    const result = await fetchOHLCV('BTCUSDT', '1h', 10)
    expect(result).toHaveLength(10)
    // Should be mock bars, not throw
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns mock bars when $fetch returns empty array', async () => {
    fetchMock.mockResolvedValueOnce([])
    const result = await fetchOHLCV('BTCUSDT', '1h', 10)
    expect(result).toHaveLength(10)
  })
})
