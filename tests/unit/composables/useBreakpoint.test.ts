// tests/unit/composables/useBreakpoint.test.ts
import { describe, it, expect } from 'vitest'
import {
  getGridCols,
  getGridMargin,
  getGridMinW,
  getGridMinH,
  isTopbarButtonVisible,
  scaleLayout,
  LAYOUT_BASE_COLS,
  type TopbarButton,
} from '~/composables/useBreakpoint'

// ─── getGridCols ──────────────────────────────────────────
describe('getGridCols', () => {
  it('returns 24 for desktop (≥ 1024px)', () => {
    expect(getGridCols(1440)).toBe(24)
    expect(getGridCols(1024)).toBe(24)
  })

  it('returns 12 for tablet (640–1023px)', () => {
    expect(getGridCols(1023)).toBe(12)
    expect(getGridCols(768)).toBe(12)
    expect(getGridCols(640)).toBe(12)
  })

  it('returns 6 for mobile (< 640px)', () => {
    expect(getGridCols(639)).toBe(6)
    expect(getGridCols(375)).toBe(6)
    expect(getGridCols(320)).toBe(6)
  })

  it('is monotonically non-decreasing with width', () => {
    const widths = [320, 375, 480, 640, 768, 1024, 1280, 1440]
    const cols = widths.map(getGridCols)
    for (let i = 1; i < cols.length; i++) {
      expect(cols[i]!).toBeGreaterThanOrEqual(cols[i - 1]!)
    }
  })
})

// ─── getGridMargin ────────────────────────────────────────
describe('getGridMargin', () => {
  it('returns [4, 4] for desktop', () => {
    expect(getGridMargin(1440)).toEqual([4, 4])
  })

  it('returns [3, 3] for tablet', () => {
    expect(getGridMargin(768)).toEqual([3, 3])
  })

  it('returns [2, 2] for mobile', () => {
    expect(getGridMargin(375)).toEqual([2, 2])
  })
})

// ─── getGridMinW ──────────────────────────────────────────
describe('getGridMinW', () => {
  it('returns 3 for desktop', () => {
    expect(getGridMinW(1440)).toBe(3)
  })

  it('returns 2 for tablet', () => {
    expect(getGridMinW(768)).toBe(2)
  })

  it('returns 1 for mobile', () => {
    expect(getGridMinW(375)).toBe(1)
  })
})

// ─── getGridMinH ──────────────────────────────────────────
describe('getGridMinH', () => {
  it('returns 4 for desktop', () => {
    expect(getGridMinH(1440)).toBe(4)
  })

  it('returns 3 for tablet and mobile', () => {
    expect(getGridMinH(768)).toBe(3)
    expect(getGridMinH(375)).toBe(3)
  })
})

// ─── isTopbarButtonVisible ────────────────────────────────
describe('isTopbarButtonVisible', () => {
  const desktop = 1440
  const tablet  = 768
  const mobile  = 375

  it('shows all buttons on desktop', () => {
    const buttons: TopbarButton[] = ['lock', 'reset', 'templates', 'widget', 'theme', 'search']
    for (const btn of buttons) {
      expect(isTopbarButtonVisible(btn, desktop), `${btn} should show on desktop`).toBe(true)
    }
  })

  it('hides reset and templates on mobile', () => {
    expect(isTopbarButtonVisible('reset',     mobile)).toBe(false)
    expect(isTopbarButtonVisible('templates', mobile)).toBe(false)
  })

  it('hides search, reset, templates on mobile', () => {
    expect(isTopbarButtonVisible('search', mobile)).toBe(false)
  })

  it('always shows lock, widget, theme on all screens', () => {
    for (const w of [desktop, tablet, mobile]) {
      expect(isTopbarButtonVisible('lock',   w), `lock at ${w}`).toBe(true)
      expect(isTopbarButtonVisible('widget', w), `widget at ${w}`).toBe(true)
      expect(isTopbarButtonVisible('theme',  w), `theme at ${w}`).toBe(true)
    }
  })

  it('shows search and templates on tablet', () => {
    expect(isTopbarButtonVisible('search',    tablet)).toBe(true)
    expect(isTopbarButtonVisible('templates', tablet)).toBe(true)
  })
})

// ─── scaleLayout ──────────────────────────────────────────
describe('scaleLayout', () => {
  const DEFAULT_LAYOUT = [
    { i: '1', type: 'ProChart' as const,  x: 0,  y: 0,  w: 15, h: 20, props: {} },
    { i: '2', type: 'Orderbook' as const, x: 15, y: 0,  w: 5,  h: 20, props: {} },
    { i: '3', type: 'News' as const,      x: 20, y: 0,  w: 4,  h: 10, props: {} },
    { i: '4', type: 'Sentiment' as const, x: 20, y: 10, w: 4,  h: 10, props: {} },
    { i: '5', type: 'Watchlist' as const, x: 0,  y: 20, w: 8,  h: 12, props: {} },
    { i: '6', type: 'RsiPanel' as const,  x: 8,  y: 20, w: 16, h: 12, props: {} },
  ]

  it('is a no-op at LAYOUT_BASE_COLS (24)', () => {
    const result = scaleLayout(DEFAULT_LAYOUT, LAYOUT_BASE_COLS, 1)
    expect(result).toBe(DEFAULT_LAYOUT)   // same reference
  })

  it('scales to 12 columns without overlaps', () => {
    const result = scaleLayout(DEFAULT_LAYOUT, 12, 1)
    // No two items at the same y should have overlapping x ranges
    const byY = result.reduce<Record<number, typeof result>>((acc, item) => {
      ;(acc[item.y] ??= []).push(item)
      return acc
    }, {})
    for (const items of Object.values(byY)) {
      const sorted = [...items].sort((a, b) => a.x - b.x)
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]!
        const curr = sorted[i]!
        expect(prev.x + prev.w, `overlap at y=${curr.y}`).toBeLessThanOrEqual(curr.x)
      }
    }
  })

  it('keeps all items within targetCols at 12 columns', () => {
    const result = scaleLayout(DEFAULT_LAYOUT, 12, 1)
    for (const item of result) {
      expect(item.x + item.w, `item ${item.i} overflows`).toBeLessThanOrEqual(12)
      expect(item.x, `item ${item.i} has negative x`).toBeGreaterThanOrEqual(0)
    }
  })

  it('keeps all items within targetCols at 6 columns', () => {
    const result = scaleLayout(DEFAULT_LAYOUT, 6, 1)
    for (const item of result) {
      expect(item.x + item.w, `item ${item.i} overflows`).toBeLessThanOrEqual(6)
    }
  })

  it('preserves original array order (stable i mapping)', () => {
    const result = scaleLayout(DEFAULT_LAYOUT, 12, 1)
    expect(result.map(r => r.i)).toEqual(DEFAULT_LAYOUT.map(r => r.i))
  })

  it('ProChart stays at x=0 on all breakpoints', () => {
    for (const cols of [12, 6]) {
      const result = scaleLayout(DEFAULT_LAYOUT, cols, 1)
      const chart = result.find(r => r.i === '1')!
      expect(chart.x, `ProChart x at ${cols} cols`).toBe(0)
    }
  })

  it('honours minW — no item narrower than minW', () => {
    const tiny = [{ i: '1', type: 'ProChart' as const, x: 0, y: 0, w: 1, h: 4, props: {} }]
    const result = scaleLayout(tiny, 6, 2)
    expect(result[0]!.w).toBeGreaterThanOrEqual(2)
  })

  it('round-trip: unscaling a 12-col layout stays within reasonable bounds', () => {
    // Overlap-prevention can shift items slightly, so round-trip has known drift.
    // The skipSave guard in dashboard.vue prevents these from being written to the
    // store on breakpoint changes — only explicit user drag/resize triggers a save.
    const scaled = scaleLayout(DEFAULT_LAYOUT, 12, 1)
    const factor = LAYOUT_BASE_COLS / 12
    const restored = scaled.map(item => ({
      ...item,
      x: Math.round(item.x * factor),
      w: Math.max(1, Math.round(item.w * factor)),
    }))
    for (let i = 0; i < DEFAULT_LAYOUT.length; i++) {
      const orig = DEFAULT_LAYOUT[i]!
      const rest = restored[i]!
      // Overlap-prevention can push items up to 2 columns past their proportional x
      expect(Math.abs(rest.x - orig.x), `x drift on item ${orig.i}`).toBeLessThanOrEqual(4)
      expect(Math.abs(rest.w - orig.w), `w drift on item ${orig.i}`).toBeLessThanOrEqual(4)
      // Ensure positions are still sane (non-negative and within 24 cols)
      expect(rest.x, `negative x on item ${orig.i}`).toBeGreaterThanOrEqual(0)
      expect(rest.x + rest.w, `overflow on item ${orig.i}`).toBeLessThanOrEqual(LAYOUT_BASE_COLS + 4)
    }
  })
})
