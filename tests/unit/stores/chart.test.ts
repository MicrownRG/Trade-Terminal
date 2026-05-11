// tests/unit/stores/chart.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChartStore } from '~/stores/chart'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('chart store — isDrawingInProgress', () => {
  it('defaults to false', () => {
    expect(useChartStore().isDrawingInProgress).toBe(false)
  })

  it('setDrawingInProgress(true) sets flag to true', () => {
    const s = useChartStore()
    s.setDrawingInProgress(true)
    expect(s.isDrawingInProgress).toBe(true)
  })

  it('setDrawingInProgress(false) clears flag', () => {
    const s = useChartStore()
    s.setDrawingInProgress(true)
    s.setDrawingInProgress(false)
    expect(s.isDrawingInProgress).toBe(false)
  })

  it('clearActiveTool also resets isDrawingInProgress', () => {
    const s = useChartStore()
    s.setDrawingInProgress(true)
    s.clearActiveTool()
    expect(s.isDrawingInProgress).toBe(false)
  })
})

describe('chart store — chartType', () => {
  it('accepts heikinashi as chart type', () => {
    const s = useChartStore()
    s.setChartType('heikinashi')
    expect(s.chartType).toBe('heikinashi')
  })

  it('setChartType rejects unknown types', () => {
    const s = useChartStore()
    s.setChartType('invalid_type' as any)
    expect(['candlestick', 'heikinashi', 'bar', 'line', 'area']).toContain(s.chartType)
  })

  it('defaults to candlestick', () => {
    expect(useChartStore().chartType).toBe('candlestick')
  })
})

describe('chart store — toggleIndicator', () => {
  it('adds indicator when not active', () => {
    const s = useChartStore()
    s.toggleIndicator('RSI')
    expect(s.activeIndicators).toContain('RSI')
  })

  it('removes indicator when already active', () => {
    const s = useChartStore()
    s.toggleIndicator('RSI')
    s.toggleIndicator('RSI')
    expect(s.activeIndicators).not.toContain('RSI')
  })

  it('initializes default settings when activating indicator for the first time', () => {
    const s = useChartStore()
    s.toggleIndicator('SMA')
    // settings entry exists (even if empty object — will merge with defaults)
    expect(s.indicatorSettings['SMA']).toBeDefined()
  })
})

describe('chart store — setIndicatorParam', () => {
  it('stores a custom param for an indicator', () => {
    const s = useChartStore()
    s.setIndicatorParam('RSI', 'period1', 21)
    expect(s.indicatorSettings['RSI']['period1']).toBe(21)
  })

  it('stores overbought/oversold params for RSI', () => {
    const s = useChartStore()
    s.setIndicatorParam('RSI', 'overbought', 80)
    s.setIndicatorParam('RSI', 'oversold', 20)
    expect(s.indicatorSettings['RSI']['overbought']).toBe(80)
    expect(s.indicatorSettings['RSI']['oversold']).toBe(20)
  })

  it('getIndicatorParams returns defaults when nothing stored', () => {
    const s = useChartStore()
    const params = s.getIndicatorParams('RSI')
    expect(params.period1).toBe(14)
    expect(params.overbought).toBe(70)
    expect(params.oversold).toBe(30)
  })

  it('getIndicatorParams merges stored params over defaults', () => {
    const s = useChartStore()
    s.setIndicatorParam('RSI', 'period1', 21)
    const params = s.getIndicatorParams('RSI')
    expect(params.period1).toBe(21)
    // overbought/oversold should still come from defaults
    expect(params.overbought).toBe(70)
    expect(params.oversold).toBe(30)
  })

  it('getIndicatorParams returns SMA defaults period1=20 period2=50', () => {
    const s = useChartStore()
    const params = s.getIndicatorParams('SMA')
    expect(params.period1).toBe(20)
    expect(params.period2).toBe(50)
  })
})

describe('chart store — fibonacci', () => {
  it('activeFibLevels returns only enabled levels', () => {
    const s = useChartStore()
    s.fibLevels[0]!.enabled = false
    expect(s.activeFibLevels).not.toContain(0)
    expect(s.activeFibLevels).toContain(0.236)
  })

  it('addFibLevel inserts and sorts levels', () => {
    const s = useChartStore()
    s.addFibLevel(0.3)
    const values = s.fibLevels.map(l => l.value)
    const idx = values.indexOf(0.3)
    expect(idx).toBeGreaterThan(values.indexOf(0.236))
    expect(idx).toBeLessThan(values.indexOf(0.382))
  })

  it('addFibLevel ignores duplicate values', () => {
    const s = useChartStore()
    const before = s.fibLevels.length
    s.addFibLevel(0.5) // already in defaults
    expect(s.fibLevels.length).toBe(before)
  })

  it('removeFibLevel removes by index', () => {
    const s = useChartStore()
    const before = s.fibLevels.length
    s.removeFibLevel(0)
    expect(s.fibLevels.length).toBe(before - 1)
  })
})
