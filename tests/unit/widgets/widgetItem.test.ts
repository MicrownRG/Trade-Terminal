// tests/unit/widgets/widgetItem.test.ts
// TDD RED: written before implementation.

import { describe, it, expect } from 'vitest'
import type { WidgetItem, WidgetType } from '~/types'

// Every type that must exist in the WidgetType union
const ALL_WIDGET_TYPES: WidgetType[] = [
  'ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel',
  'Orderbook', 'News', 'Sentiment', 'Watchlist', 'Heatmap',
  'VolumeProfile', 'MarketStats', 'PriceAlert', 'Notes',
  'OnChainMetrics', 'TokenLaunch', 'WhaleAlerts', 'TradePlan',
  'SRLevels', 'SignalDetail', 'MarketContext', 'LivePrices',
  'AnalystSignal', 'EconomicCalendar', 'PortfolioTracker',
  'FundingRate', 'OpenInterest', 'TechnicalSummary',
]

function makeItem(type: WidgetType, overrides: Partial<WidgetItem> = {}): WidgetItem {
  return { i: 'test-1', type, x: 0, y: 0, w: 8, h: 12, props: {}, ...overrides }
}

describe('WidgetItem — type safety', () => {
  it('can be constructed for every WidgetType', () => {
    for (const type of ALL_WIDGET_TYPES) {
      const item = makeItem(type)
      expect(item.type).toBe(type)
    }
  })

  it('new types FundingRate, OpenInterest, TechnicalSummary are assignable', () => {
    const fr: WidgetType = 'FundingRate'
    const oi: WidgetType = 'OpenInterest'
    const ts: WidgetType = 'TechnicalSummary'
    expect(fr).toBe('FundingRate')
    expect(oi).toBe('OpenInterest')
    expect(ts).toBe('TechnicalSummary')
  })
})

describe('WidgetItem — grid validation helper', () => {
  function fitsGrid(item: WidgetItem, cols = 24): boolean {
    return item.x >= 0 && item.y >= 0 && item.w > 0 && item.h > 0 && item.x + item.w <= cols
  }

  it('valid item fits the grid', () => {
    expect(fitsGrid(makeItem('ProChart', { x: 0, w: 12 }))).toBe(true)
  })

  it('item that overflows the grid fails', () => {
    expect(fitsGrid(makeItem('ProChart', { x: 20, w: 5 }))).toBe(false)
  })

  it('item with negative x fails', () => {
    expect(fitsGrid(makeItem('News', { x: -1, w: 4 }))).toBe(false)
  })

  it('item at maximum valid position passes', () => {
    expect(fitsGrid(makeItem('Watchlist', { x: 20, w: 4 }))).toBe(true)
  })

  it('all 27 widget types produce valid default items', () => {
    for (const type of ALL_WIDGET_TYPES) {
      expect(fitsGrid(makeItem(type))).toBe(true)
    }
  })
})
