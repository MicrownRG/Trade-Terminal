// tests/unit/useChartHelpers.test.ts
// TDD: these tests are written BEFORE the implementation.
// They will FAIL until useChartHelpers.ts is created.

import { describe, it, expect } from 'vitest'
import {
  toHeikinAshi,
  getSeriesData,
  formatOHLC,
  calcChangeInfo,
} from '~/composables/useChartHelpers'
import type { Bar } from '~/types'

// ── helpers ──────────────────────────────────────────────
function makeBar(overrides: Partial<Bar> = {}): Bar {
  return {
    time:   1700000000,
    open:   100,
    high:   110,
    low:    90,
    close:  105,
    volume: 1234567.89,
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────
describe('toHeikinAshi', () => {
  it('returns same count of bars as input', () => {
    const bars = [makeBar(), makeBar({ time: 1700003600 })]
    expect(toHeikinAshi(bars)).toHaveLength(2)
  })

  it('first bar: haOpen = (open+close)/2', () => {
    const b = makeBar({ open: 100, close: 200 })
    const ha = toHeikinAshi([b])
    expect(ha[0]!.open).toBeCloseTo((100 + 200) / 2)
  })

  it('first bar: haClose = (open+high+low+close)/4', () => {
    const b = makeBar({ open: 100, high: 120, low: 80, close: 110 })
    const ha = toHeikinAshi([b])
    expect(ha[0]!.close).toBeCloseTo((100 + 120 + 80 + 110) / 4)
  })

  it('subsequent bar: haOpen = (prev.open + prev.close) / 2', () => {
    const b1 = makeBar({ open: 100, close: 200, time: 1 })
    const b2 = makeBar({ open: 200, close: 250, time: 2 })
    const ha = toHeikinAshi([b1, b2])
    // ha[1].open should be (ha[0].open + ha[0].close) / 2
    const expectedOpen = (ha[0]!.open + ha[0]!.close) / 2
    expect(ha[1]!.open).toBeCloseTo(expectedOpen)
  })

  it('haHigh = max(high, haOpen, haClose)', () => {
    const b = makeBar({ open: 100, high: 200, low: 80, close: 150 })
    const ha = toHeikinAshi([b])
    expect(ha[0]!.high).toBeGreaterThanOrEqual(ha[0]!.open)
    expect(ha[0]!.high).toBeGreaterThanOrEqual(ha[0]!.close)
    expect(ha[0]!.high).toBeGreaterThanOrEqual(b.high)
  })

  it('haLow = min(low, haOpen, haClose)', () => {
    const b = makeBar({ open: 100, high: 200, low: 50, close: 150 })
    const ha = toHeikinAshi([b])
    expect(ha[0]!.low).toBeLessThanOrEqual(ha[0]!.open)
    expect(ha[0]!.low).toBeLessThanOrEqual(ha[0]!.close)
    expect(ha[0]!.low).toBeLessThanOrEqual(b.low)
  })

  it('preserves time and volume from original bars', () => {
    const b = makeBar({ time: 9999, volume: 42 })
    const ha = toHeikinAshi([b])
    expect(ha[0]!.time).toBe(9999)
    expect(ha[0]!.volume).toBe(42)
  })

  it('returns empty array for empty input', () => {
    expect(toHeikinAshi([])).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────
describe('getSeriesData', () => {
  const bars = [
    makeBar({ time: 1, open: 100, high: 110, low: 90, close: 105 }),
    makeBar({ time: 2, open: 105, high: 115, low: 95, close: 110 }),
  ]

  it('candlestick — returns bars unchanged', () => {
    const result = getSeriesData(bars, 'candlestick')
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('open')
    expect(result[0]).toHaveProperty('high')
    expect(result[0]).toHaveProperty('low')
    expect(result[0]).toHaveProperty('close')
  })

  it('line — returns { time, value } with close as value', () => {
    const result = getSeriesData(bars, 'line')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ time: 1, value: 105 })
    expect(result[1]).toEqual({ time: 2, value: 110 })
  })

  it('area — returns { time, value } with close as value', () => {
    const result = getSeriesData(bars, 'area')
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('value')
    expect(result[0]).not.toHaveProperty('open')
  })

  it('bar type — returns full bar objects', () => {
    const result = getSeriesData(bars, 'bar')
    expect(result[0]).toHaveProperty('open')
  })

  it('heikinashi — returns HA transformed bars', () => {
    const result = getSeriesData(bars, 'heikinashi')
    // HA bars should not have the same open as original
    // (first bar haOpen = (open+close)/2 = 102.5)
    expect(result[0]!.open).toBeCloseTo((100 + 105) / 2)
  })
})

// ─────────────────────────────────────────────────────────
describe('formatOHLC', () => {
  it('formats a complete bar correctly', () => {
    const bar = makeBar({ open: 100.5, high: 110.25, low: 90.75, close: 105.1, volume: 1234567 })
    const r = formatOHLC(bar)
    expect(r.o).toBe('100.50')
    expect(r.h).toBe('110.25')
    expect(r.l).toBe('90.75')
    expect(r.c).toBe('105.10')
    expect(r.v).toBe('1,234,567')
  })

  it('returns -- for missing values', () => {
    const r = formatOHLC({})
    expect(r.o).toBe('--')
    expect(r.h).toBe('--')
    expect(r.l).toBe('--')
    expect(r.c).toBe('--')
    expect(r.v).toBe('--')
  })

  it('returns -- for volume = undefined', () => {
    const r = formatOHLC({ open: 100, high: 110, low: 90, close: 105 })
    expect(r.v).toBe('--')
  })

  it('returns -- for volume = null', () => {
    const r = formatOHLC({ open: 100, high: 110, low: 90, close: 105, volume: null })
    expect(r.v).toBe('--')
  })

  it('does NOT return NaN for missing volume', () => {
    const r = formatOHLC({ close: 50000 })
    expect(r.v).not.toBe('NaN')
    expect(r.v).toBe('--')
  })

  it('handles line/area bar with only { time, value } — no volume', () => {
    // This is the shape returned by crosshair move for line series
    const r = formatOHLC({ time: 1700000000, value: 50000 })
    expect(r.v).toBe('--')
    expect(r.v).not.toBe('NaN')
  })
})

// ─────────────────────────────────────────────────────────
describe('calcChangeInfo', () => {
  it('returns positive change for close > open', () => {
    const r = calcChangeInfo({ open: 100, close: 110 })
    expect(r.positive).toBe(true)
    expect(r.text).toMatch(/^\+10\.00%$/)
  })

  it('returns negative change for close < open', () => {
    const r = calcChangeInfo({ open: 100, close: 90 })
    expect(r.positive).toBe(false)
    expect(r.text).toMatch(/^-10\.00%$/)
  })

  it('returns 0.00% when open and close are equal', () => {
    const r = calcChangeInfo({ open: 100, close: 100 })
    expect(r.text).toBe('+0.00%')
    expect(r.positive).toBe(true)
  })

  it('returns neutral for missing data', () => {
    const r = calcChangeInfo({})
    expect(r.text).toBe('+0.00%')
    expect(r.positive).toBe(true)
  })

  it('handles bar with only value (line/area series crosshair)', () => {
    // line series bar has no open, just value
    const r = calcChangeInfo({ time: 1700000000, value: 50000 })
    expect(r.text).toBe('+0.00%')
  })
})
