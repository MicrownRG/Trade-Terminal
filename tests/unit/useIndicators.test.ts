// tests/unit/useIndicators.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  barsToKlines,
  plotsToLwcData,
  runIndicator,
  buildIndicatorScript,
  type LwcPoint,
} from '~/composables/useIndicators'
import type { Bar } from '~/types'
import { PineTS } from '@vibetrader/pinets'

// ── Mock @vibetrader/pinets ───────────────────────────────
vi.mock('@vibetrader/pinets', () => {
  return {
    PineTS: vi.fn().mockImplementation(function(_klines: any[]) {
      return {
        run: vi.fn().mockResolvedValue({
          plots: {
            SMA20: {
              data: [
                { time: 1700000000000, value: 42000, options: {} },
                { time: 1700003600000, value: NaN,   options: {} },
                { time: 1700007200000, value: 43000, options: {} },
              ],
              options: {},
              title: 'SMA20',
            },
            SMA50: {
              data: [
                { time: 1700000000000, value: null,  options: {} },
                { time: 1700003600000, value: 41500, options: {} },
              ],
              options: {},
              title: 'SMA50',
            },
          },
        }),
      }
    }),
  }
})

// ── Helpers ───────────────────────────────────────────────
function makeBars(count = 5, startTime = 1700000000, stepSec = 3600): Bar[] {
  return Array.from({ length: count }, (_, i) => ({
    time:   startTime + i * stepSec,
    open:   40000 + i * 100,
    high:   40500 + i * 100,
    low:    39500 + i * 100,
    close:  40200 + i * 100,
    volume: 1000 + i,
  }))
}

// ─────────────────────────────────────────────────────────
describe('barsToKlines', () => {
  it('converts Bar time (seconds) → openTime (milliseconds)', () => {
    const bars = makeBars(2)
    const klines = barsToKlines(bars)
    expect(klines[0]!.openTime).toBe(bars[0]!.time * 1000)
    expect(klines[1]!.openTime).toBe(bars[1]!.time * 1000)
  })

  it('derives closeTime from bar interval (openTime + periodMs - 1)', () => {
    const bars = makeBars(3, 1700000000, 3600)   // 1h bars
    const klines = barsToKlines(bars)
    const expectedPeriod = 3600 * 1000
    expect(klines[0]!.closeTime).toBe(klines[0]!.openTime + expectedPeriod - 1)
  })

  it('falls back to 1h period when only 1 bar provided', () => {
    const klines = barsToKlines(makeBars(1))
    expect(klines[0]!.closeTime).toBe(klines[0]!.openTime + 3600_000 - 1)
  })

  it('preserves OHLCV values exactly', () => {
    const bars = makeBars(1)
    const k = barsToKlines(bars)[0]!
    expect(k.open).toBe(bars[0]!.open)
    expect(k.high).toBe(bars[0]!.high)
    expect(k.low).toBe(bars[0]!.low)
    expect(k.close).toBe(bars[0]!.close)
    expect(k.volume).toBe(bars[0]!.volume)
  })

  it('pads Binance-specific fields with 0', () => {
    const k = barsToKlines(makeBars(1))[0]!
    expect(k.quoteAssetVolume).toBe(0)
    expect(k.numberOfTrades).toBe(0)
    expect(k.takerBuyBaseAssetVolume).toBe(0)
    expect(k.takerBuyQuoteAssetVolume).toBe(0)
  })

  it('returns empty array for empty input', () => {
    expect(barsToKlines([])).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────
describe('plotsToLwcData', () => {
  const rawPlots = {
    MyLine: {
      data: [
        { time: 1700000000000, value: 100,  options: {} },
        { time: 1700003600000, value: NaN,  options: {} },
        { time: 1700007200000, value: null, options: {} },
        { time: 1700010800000, value: 200,  options: {} },
      ],
      options: {},
      title: 'MyLine',
    },
  }

  it('converts openTime ms → time seconds (floor)', () => {
    const result = plotsToLwcData(rawPlots)
    expect(result['MyLine']![0]!.time).toBe(1700000000)
    expect(result['MyLine']![1]!.time).toBe(1700010800)
  })

  it('filters NaN values', () => {
    const result = plotsToLwcData(rawPlots)
    const values = result['MyLine']!.map(p => p.value)
    expect(values).not.toContain(NaN)
  })

  it('filters null values', () => {
    const result = plotsToLwcData(rawPlots)
    const values = result['MyLine']!.map(p => p.value)
    expect(values).not.toContain(null)
  })

  it('keeps finite values', () => {
    const result = plotsToLwcData(rawPlots)
    expect(result['MyLine']).toHaveLength(2)
    expect(result['MyLine']![0]!.value).toBe(100)
    expect(result['MyLine']![1]!.value).toBe(200)
  })

  it('handles multiple plot keys', () => {
    const plots = {
      A: { data: [{ time: 1000, value: 1 }], options: {} },
      B: { data: [{ time: 2000, value: 2 }], options: {} },
    }
    const result = plotsToLwcData(plots)
    expect(Object.keys(result)).toEqual(['A', 'B'])
  })

  it('returns empty object for empty plots', () => {
    expect(plotsToLwcData({})).toEqual({})
  })

  it('handles missing data array gracefully', () => {
    const plots = { X: { options: {} } }
    expect(() => plotsToLwcData(plots)).not.toThrow()
    expect(plotsToLwcData(plots)['X']).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────
describe('runIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty object for empty bars', async () => {
    const result = await runIndicator('//@version=5\nplot(close, "X")', [])
    expect(result).toEqual({})
  })

  it('returns named LwcPoint arrays from plots', async () => {
    const script = buildIndicatorScript('SMA', { period1: 20, period2: 50 })
    const result = await runIndicator(script, makeBars(10))
    // mock returns SMA20 and SMA50 (with null/NaN filtered)
    expect(result).toHaveProperty('SMA20')
    expect(result).toHaveProperty('SMA50')
    expect(Array.isArray(result['SMA20'])).toBe(true)
  })

  it('filters NaN from returned plots', async () => {
    const script = buildIndicatorScript('SMA', { period1: 20, period2: 50 })
    const result = await runIndicator(script, makeBars(10))
    const sma20 = result['SMA20']!
    const hasNaN = sma20.some(p => isNaN(p.value))
    expect(hasNaN).toBe(false)
  })

  it('converts times from ms to seconds', async () => {
    const script = buildIndicatorScript('SMA', { period1: 20, period2: 50 })
    const result = await runIndicator(script, makeBars(10))
    const sma20 = result['SMA20']!
    // 1700000000000 ms → 1700000000 s
    expect(sma20[0]!.time).toBe(1700000000)
  })

  it('returns empty object and does not throw on PineTS error', async () => {
    const { PineTS } = await import('@vibetrader/pinets')
    vi.mocked(PineTS).mockImplementationOnce(function() {
      return { run: vi.fn().mockRejectedValue(new Error('script error')) }
    } as any)
    const result = await runIndicator('bad script', makeBars(5))
    expect(result).toEqual({})
  })
})

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript', () => {
  it('SMA script plots SMA', () => {
    const script = buildIndicatorScript('SMA', { period1: 20, period2: 50 })
    expect(script).toContain('"SMA20"')
    expect(script).toContain('"SMA50"')
    expect(script).toContain('ta.sma')
  })

  it('EMA script plots EMA', () => {
    const script = buildIndicatorScript('EMA', { period1: 9, period2: 21 })
    expect(script).toContain('"EMA9"')
    expect(script).toContain('"EMA21"')
    expect(script).toContain('ta.ema')
  })

  it('BB script plots BBUpper, BBMid, BBLower', () => {
    const script = buildIndicatorScript('BB', { period1: 20, stdDev: 2 })
    expect(script).toContain('"BBUpper"')
    expect(script).toContain('"BBMid"')
    expect(script).toContain('"BBLower"')
    expect(script).toContain('ta.stdev')
  })

  it('VWAP script plots VWAP', () => {
    const script = buildIndicatorScript('VWAP', {})
    expect(script).toContain('"VWAP"')
    expect(script).toContain('ta.vwap')
  })

  it('RSI script plots RSI', () => {
    const script = buildIndicatorScript('RSI', { period1: 14 })
    expect(script).toContain('"RSI"')
    expect(script).toContain('ta.rsi')
  })

  it('MACD script plots MACD, Signal, Hist', () => {
    const script = buildIndicatorScript('MACD', { fast: 12, slow: 26, signal: 9 })
    expect(script).toContain('"MACD"')
    expect(script).toContain('"Signal"')
    expect(script).toContain('"Hist"')
    expect(script).toContain('ta.ema')
  })

  it('all scripts start with //@version=5', () => {
    const ids: any[] = ['SMA', 'EMA', 'BB', 'VWAP', 'RSI', 'MACD']
    for (const id of ids) {
      const script = buildIndicatorScript(id, { period1: 14, period2: 28, stdDev: 2, fast: 12, slow: 26, signal: 9 })
      expect(script?.trimStart(), `${id} script`).toMatch(/^\/\/@version=5/)
    }
  })
})
