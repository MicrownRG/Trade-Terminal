// tests/unit/stores/template.test.ts
// TDD RED: written before implementation — will fail until stores are updated.

import { describe, it, expect } from 'vitest'
import { DEFAULT_TEMPLATES, VALID_WIDGET_TYPES } from '~/stores/template'

// ── Structural integrity ──────────────────────────────────
describe('DEFAULT_TEMPLATES — structural integrity', () => {
  it('all template IDs are unique', () => {
    const ids = DEFAULT_TEMPLATES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every template has at least one widget', () => {
    for (const t of DEFAULT_TEMPLATES) {
      expect(t.layout.length, `template "${t.id}" has no widgets`).toBeGreaterThan(0)
    }
  })

  it('every template has a non-empty name and description', () => {
    for (const t of DEFAULT_TEMPLATES) {
      expect(t.name.trim().length, `template "${t.id}" missing name`).toBeGreaterThan(0)
      expect(t.description.trim().length, `template "${t.id}" missing description`).toBeGreaterThan(0)
    }
  })
})

// ── Grid constraints ──────────────────────────────────────
describe('DEFAULT_TEMPLATES — grid constraints (24 columns)', () => {
  it('all widgets fit within the 24-column grid (x + w <= 24)', () => {
    for (const t of DEFAULT_TEMPLATES) {
      for (const w of t.layout) {
        expect(
          w.x + w.w,
          `"${t.id}" widget "${w.i}" overflows: x=${w.x} w=${w.w}`
        ).toBeLessThanOrEqual(24)
      }
    }
  })

  it('all widgets have non-negative coordinates', () => {
    for (const t of DEFAULT_TEMPLATES) {
      for (const w of t.layout) {
        expect(w.x, `"${t.id}" widget "${w.i}" x<0`).toBeGreaterThanOrEqual(0)
        expect(w.y, `"${t.id}" widget "${w.i}" y<0`).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('all widgets have positive dimensions (w > 0, h > 0)', () => {
    for (const t of DEFAULT_TEMPLATES) {
      for (const w of t.layout) {
        expect(w.w, `"${t.id}" widget "${w.i}" w<=0`).toBeGreaterThan(0)
        expect(w.h, `"${t.id}" widget "${w.i}" h<=0`).toBeGreaterThan(0)
      }
    }
  })

  it('widget IDs are unique within each template', () => {
    for (const t of DEFAULT_TEMPLATES) {
      const ids = t.layout.map(w => w.i)
      expect(new Set(ids).size, `"${t.id}" has duplicate widget IDs`).toBe(ids.length)
    }
  })
})

// ── Widget type validity ──────────────────────────────────
describe('DEFAULT_TEMPLATES — widget type validity', () => {
  it('all widget types are in VALID_WIDGET_TYPES', () => {
    const validSet = new Set(VALID_WIDGET_TYPES)
    for (const t of DEFAULT_TEMPLATES) {
      for (const w of t.layout) {
        expect(
          validSet.has(w.type),
          `"${t.id}" uses unknown type "${w.type}"`
        ).toBe(true)
      }
    }
  })
})

// ── New templates exist ───────────────────────────────────
describe('DEFAULT_TEMPLATES — new templates', () => {
  it('includes futures-trader', () => {
    expect(DEFAULT_TEMPLATES.find(t => t.id === 'futures-trader')).toBeDefined()
  })

  it('includes on-chain-monitor', () => {
    expect(DEFAULT_TEMPLATES.find(t => t.id === 'on-chain-monitor')).toBeDefined()
  })

  it('includes dca-investor', () => {
    expect(DEFAULT_TEMPLATES.find(t => t.id === 'dca-investor')).toBeDefined()
  })

  it('includes multi-asset', () => {
    expect(DEFAULT_TEMPLATES.find(t => t.id === 'multi-asset')).toBeDefined()
  })
})

// ── Symbol pinning — single-chart templates ───────────────
// Chart-following widgets (ProChart, RsiPanel, MacdPanel, StochPanel) must NOT
// have a pinned symbol in single-chart templates so they react to chartStore.symbol.
// Multi-chart templates (scalper, multi-asset) intentionally pin different symbols.
describe('DEFAULT_TEMPLATES — symbol pinning', () => {
  const chartFollowing = new Set(['ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel'])
  const singleChartIds = [
    'full-trader', 'chart-focus', 'news-sentiment',
    'signal-analyst', 'futures-trader', 'on-chain-monitor',
    'dca-investor',
  ]

  it('single-chart templates have no pinned symbol on chart-following widgets', () => {
    for (const id of singleChartIds) {
      const tpl = DEFAULT_TEMPLATES.find(t => t.id === id)!
      for (const w of tpl.layout) {
        if (chartFollowing.has(w.type)) {
          expect(
            (w.props as any)?.symbol,
            `"${id}" widget "${w.i}" (${w.type}) should not pin a symbol`
          ).toBeUndefined()
        }
      }
    }
  })

  it('scalper template pins different symbols on each ProChart', () => {
    const scalper = DEFAULT_TEMPLATES.find(t => t.id === 'scalper')!
    const charts = scalper.layout.filter(w => w.type === 'ProChart')
    const symbols = charts.map(w => (w.props as any)?.symbol).filter(Boolean)
    expect(symbols.length).toBeGreaterThanOrEqual(2)
    expect(new Set(symbols).size).toBeGreaterThan(1) // at least 2 different symbols
  })

  it('multi-asset template pins a distinct symbol on each ProChart', () => {
    const ma = DEFAULT_TEMPLATES.find(t => t.id === 'multi-asset')!
    const charts = ma.layout.filter(w => w.type === 'ProChart')
    const symbols = charts.map(w => (w.props as any)?.symbol)
    expect(symbols.length).toBeGreaterThanOrEqual(4)
    expect(new Set(symbols).size).toBe(symbols.length) // all unique
  })
})

// ── VALID_WIDGET_TYPES coverage ───────────────────────────
describe('VALID_WIDGET_TYPES', () => {
  const required = [
    'ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel',
    'Orderbook', 'News', 'Sentiment', 'Watchlist', 'Heatmap',
    'VolumeProfile', 'MarketStats', 'PriceAlert', 'Notes',
    'OnChainMetrics', 'TokenLaunch', 'WhaleAlerts', 'TradePlan',
    'SRLevels', 'SignalDetail', 'MarketContext', 'LivePrices',
    'AnalystSignal', 'EconomicCalendar', 'PortfolioTracker',
    'FundingRate', 'OpenInterest', 'TechnicalSummary',
  ]

  for (const type of required) {
    it(`includes "${type}"`, () => {
      expect(VALID_WIDGET_TYPES).toContain(type)
    })
  }
})
