// tests/unit/stores/layout.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayoutStore } from '~/stores/layout'
import { widgetDefaultProps } from '~/composables/useWidgetProps'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('widgetDefaultProps — symbol binding', () => {
  it('returns no symbol prop for ProChart so it follows chartStore', () => {
    expect(widgetDefaultProps('ProChart')).not.toHaveProperty('symbol')
  })

  it('returns no symbol prop for RsiPanel', () => {
    expect(widgetDefaultProps('RsiPanel')).not.toHaveProperty('symbol')
  })

  it('returns no symbol prop for MacdPanel', () => {
    expect(widgetDefaultProps('MacdPanel')).not.toHaveProperty('symbol')
  })

  it('returns no symbol prop for StochPanel', () => {
    expect(widgetDefaultProps('StochPanel')).not.toHaveProperty('symbol')
  })

  it('returns empty object for non-chart widgets', () => {
    expect(widgetDefaultProps('Orderbook')).toEqual({})
    expect(widgetDefaultProps('News')).toEqual({})
    expect(widgetDefaultProps('Watchlist')).toEqual({})
  })

  it('never includes symbol for any widget type', () => {
    const types = [
      'ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel',
      'Orderbook', 'News', 'Sentiment', 'Watchlist', 'Heatmap',
    ] as const
    for (const type of types) {
      expect(widgetDefaultProps(type), `${type} should have no symbol prop`)
        .not.toHaveProperty('symbol')
    }
  })
})

describe('layoutStore — addWidget', () => {
  it('ProChart widget added with no symbol prop has no symbol in props', () => {
    const s = useLayoutStore()
    s.addWidget('ProChart', {})
    const items = s.currentLayout.filter(i => i.type === 'ProChart')
    const added = items[items.length - 1]!
    expect(added.props?.symbol).toBeUndefined()
  })

  it('ProChart widget can be added with explicit symbol for multi-chart', () => {
    const s = useLayoutStore()
    s.addWidget('ProChart', { symbol: 'ETHUSDT' })
    const items = s.currentLayout.filter(i => i.type === 'ProChart')
    const added = items[items.length - 1]!
    expect(added.props?.symbol).toBe('ETHUSDT')
  })

  it('addWidget increments the layout', () => {
    const s = useLayoutStore()
    const before = s.currentLayout.length
    s.addWidget('News', {})
    expect(s.currentLayout.length).toBe(before + 1)
  })

  it('default layout ProChart follows store — no symbol prop', () => {
    const s = useLayoutStore()
    const first = s.currentLayout.find(i => i.type === 'ProChart')
    // Default layout must NOT pin symbol so it reacts to chartStore changes
    expect(first?.props?.symbol).toBeUndefined()
  })

  it('default layout RsiPanel follows store — no symbol prop', () => {
    const s = useLayoutStore()
    const rsi = s.currentLayout.find(i => i.type === 'RsiPanel')
    expect(rsi?.props?.symbol).toBeUndefined()
  })
})
