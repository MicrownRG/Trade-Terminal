// tests/unit/useIndicatorSettings.test.ts
// TDD: Indicator settings — parameterized scripts and config validation
import { describe, it, expect } from 'vitest'
import {
  buildIndicatorScript,
  DEFAULT_INDICATOR_PARAMS,
  type IndicatorParams,
} from '~/composables/useIndicators'

// ─────────────────────────────────────────────────────────
describe('DEFAULT_INDICATOR_PARAMS', () => {
  it('SMA has default periods 20 and 50', () => {
    expect(DEFAULT_INDICATOR_PARAMS.SMA.period1).toBe(20)
    expect(DEFAULT_INDICATOR_PARAMS.SMA.period2).toBe(50)
  })

  it('EMA has default periods 9 and 21', () => {
    expect(DEFAULT_INDICATOR_PARAMS.EMA.period1).toBe(9)
    expect(DEFAULT_INDICATOR_PARAMS.EMA.period2).toBe(21)
  })

  it('RSI has default period 14 and levels 70/30', () => {
    expect(DEFAULT_INDICATOR_PARAMS.RSI.period1).toBe(14)
    expect(DEFAULT_INDICATOR_PARAMS.RSI.overbought).toBe(70)
    expect(DEFAULT_INDICATOR_PARAMS.RSI.oversold).toBe(30)
  })

  it('MACD has default fast=12, slow=26, signal=9', () => {
    expect(DEFAULT_INDICATOR_PARAMS.MACD.fast).toBe(12)
    expect(DEFAULT_INDICATOR_PARAMS.MACD.slow).toBe(26)
    expect(DEFAULT_INDICATOR_PARAMS.MACD.signal).toBe(9)
  })

  it('BB has default period=20 and stdDev=2', () => {
    expect(DEFAULT_INDICATOR_PARAMS.BB.period1).toBe(20)
    expect(DEFAULT_INDICATOR_PARAMS.BB.stdDev).toBe(2)
  })

  it('all indicator IDs have default params defined', () => {
    const ids = ['SMA', 'EMA', 'BB', 'VWAP', 'RSI', 'MACD'] as const
    for (const id of ids) {
      expect(DEFAULT_INDICATOR_PARAMS[id], `${id} missing defaults`).toBeDefined()
    }
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — SMA', () => {
  it('uses default periods when no params given', () => {
    const script = buildIndicatorScript('SMA', {})
    expect(script).toContain('ta.sma(close, 20)')
    expect(script).toContain('ta.sma(close, 50)')
  })

  it('uses custom periods when provided', () => {
    const script = buildIndicatorScript('SMA', { period1: 10, period2: 100 })
    expect(script).toContain('ta.sma(close, 10)')
    expect(script).toContain('ta.sma(close, 100)')
  })

  it('script starts with //@version=5', () => {
    expect(buildIndicatorScript('SMA', {}).trimStart()).toMatch(/^\/\/@version=5/)
  })

  it('plots have correct names for SMA', () => {
    const script = buildIndicatorScript('SMA', {})
    expect(script).toContain('"SMA20"')
    expect(script).toContain('"SMA50"')
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — EMA', () => {
  it('uses default periods', () => {
    const script = buildIndicatorScript('EMA', {})
    expect(script).toContain('ta.ema(close, 9)')
    expect(script).toContain('ta.ema(close, 21)')
  })

  it('uses custom periods', () => {
    const script = buildIndicatorScript('EMA', { period1: 5, period2: 200 })
    expect(script).toContain('ta.ema(close, 5)')
    expect(script).toContain('ta.ema(close, 200)')
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — RSI', () => {
  it('uses default period', () => {
    const script = buildIndicatorScript('RSI', {})
    expect(script).toContain('ta.rsi(close, 14)')
  })

  it('uses custom period', () => {
    const script = buildIndicatorScript('RSI', { period1: 21 })
    expect(script).toContain('ta.rsi(close, 21)')
  })

  it('script contains RSI plot name', () => {
    expect(buildIndicatorScript('RSI', {})).toContain('"RSI"')
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — MACD', () => {
  it('uses default fast/slow/signal', () => {
    const script = buildIndicatorScript('MACD', {})
    expect(script).toContain('12')
    expect(script).toContain('26')
    expect(script).toContain('9')
  })

  it('uses custom fast/slow/signal', () => {
    const script = buildIndicatorScript('MACD', { fast: 5, slow: 13, signal: 3 })
    expect(script).toContain('5')
    expect(script).toContain('13')
    expect(script).toContain('3')
  })

  it('script contains MACD plot names', () => {
    const script = buildIndicatorScript('MACD', {})
    expect(script).toContain('"MACD"')
    expect(script).toContain('"Signal"')
    expect(script).toContain('"Hist"')
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — BB', () => {
  it('uses default period and stdDev', () => {
    const script = buildIndicatorScript('BB', {})
    expect(script).toContain('20')
    expect(script).toContain('2')
  })

  it('uses custom period and stdDev', () => {
    const script = buildIndicatorScript('BB', { period1: 14, stdDev: 2.5 })
    expect(script).toContain('14')
    expect(script).toContain('2.5')
  })

  it('script contains BB plot names', () => {
    const script = buildIndicatorScript('BB', {})
    expect(script).toContain('"BBUpper"')
    expect(script).toContain('"BBMid"')
    expect(script).toContain('"BBLower"')
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — VWAP', () => {
  it('returns a valid script regardless of params', () => {
    const script = buildIndicatorScript('VWAP', {})
    expect(script).toContain('"VWAP"')
    expect(script).toContain('ta.vwap')
    expect(script.trimStart()).toMatch(/^\/\/@version=5/)
  })
})

// ─────────────────────────────────────────────────────────
describe('buildIndicatorScript — edge cases', () => {
  it('returns empty string for unknown indicator id', () => {
    // @ts-expect-error — testing unknown id
    expect(buildIndicatorScript('UNKNOWN', {})).toBe('')
  })

  it('clamps period1 ≤ 0 to 1 for RSI (guards against PineTS crash)', () => {
    const script = buildIndicatorScript('RSI', { period1: 0 })
    expect(script).toContain('ta.rsi(close, 1)')
    expect(script).not.toContain('ta.rsi(close, 0)')
  })

  it('clamps negative period1 to 1 for SMA', () => {
    const script = buildIndicatorScript('SMA', { period1: -5, period2: 50 })
    expect(script).toContain('ta.sma(close, 1)')
    expect(script).not.toContain('ta.sma(close, -5)')
  })

  it('clamps negative period2 to 1 for EMA', () => {
    const script = buildIndicatorScript('EMA', { period1: 9, period2: -1 })
    expect(script).toContain('ta.ema(close, 1)')
    expect(script).not.toContain('ta.ema(close, -1)')
  })

  it('clamps stdDev ≤ 0 to 0.1 for BB', () => {
    const script = buildIndicatorScript('BB', { period1: 20, stdDev: 0 })
    expect(script).not.toContain('* 0\n')
    // stdDev should be at least 0.1
    const match = script.match(/dev = (\S+) \* ta\.stdev/)
    expect(Number(match?.[1])).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────
describe('getRsiLevels', () => {
  // getRsiLevels is a new helper that returns overbought/oversold with defaults
  // This will fail until we export getRsiLevels from useIndicators
  it('returns default overbought=70 and oversold=30 when no params', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({})).toEqual({ overbought: 70, oversold: 30 })
  })

  it('uses custom overbought when provided', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({ overbought: 80 })).toEqual({ overbought: 80, oversold: 30 })
  })

  it('uses custom oversold when provided', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({ oversold: 20 })).toEqual({ overbought: 70, oversold: 20 })
  })

  it('uses both custom values when both provided', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({ overbought: 75, oversold: 25 })).toEqual({ overbought: 75, oversold: 25 })
  })

  it('clamps overbought to range [50, 100]', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({ overbought: 110 }).overbought).toBe(100)
    expect(getRsiLevels({ overbought: 10 }).overbought).toBe(50)
  })

  it('clamps oversold to range [0, 50]', async () => {
    const { getRsiLevels } = await import('~/composables/useIndicators')
    expect(getRsiLevels({ oversold: -5 }).oversold).toBe(0)
    expect(getRsiLevels({ oversold: 60 }).oversold).toBe(50)
  })
})
