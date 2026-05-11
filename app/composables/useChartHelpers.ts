// composables/useChartHelpers.ts
// Pure functions extracted from ProChart.vue — no Vue reactivity, fully testable.
import type { Bar } from '~/types'

// ── Heikin-Ashi conversion (recursive, correct TradingView-style) ──────
export function toHeikinAshi(bars: Bar[]): Bar[] {
  let prevHaOpen  = 0
  let prevHaClose = 0

  return bars.map((b, i) => {
    const haClose = (b.open + b.high + b.low + b.close) / 4
    const haOpen  = i === 0 ? (b.open + b.close) / 2 : (prevHaOpen + prevHaClose) / 2
    prevHaOpen  = haOpen
    prevHaClose = haClose
    return {
      time:   b.time,
      open:   +haOpen.toFixed(8),
      high:   +Math.max(b.high, haOpen, haClose).toFixed(8),
      low:    +Math.min(b.low,  haOpen, haClose).toFixed(8),
      close:  +haClose.toFixed(8),
      volume: b.volume,
    }
  })
}

// ── Series data shape by chart type ──────────────────────────────────
export function getSeriesData(bars: Bar[], type: string): any[] {
  const src = type === 'heikinashi' ? toHeikinAshi(bars) : bars
  if (type === 'line' || type === 'area')
    return src.map(b => ({ time: b.time, value: b.close }))
  return src
}

// ── OHLCV bar formatter — guards against undefined/null/NaN volume ──
// Works for both full OHLCV bars and partial line/area crosshair bars.
export function formatOHLC(bar: any): { o: string; h: string; l: string; c: string; v: string } {
  const fmt2 = (n: any) => (n != null && !isNaN(Number(n))) ? (+n).toFixed(2) : '--'
  const fmtV = (n: any) => {
    if (n == null || isNaN(Number(n))) return '--'
    return Number(n).toLocaleString('en-US')
  }
  return {
    o: fmt2(bar?.open),
    h: fmt2(bar?.high),
    l: fmt2(bar?.low),
    c: fmt2(bar?.close),
    v: fmtV(bar?.volume),
  }
}

// ── % change computation, safe for partial bars (line/area crosshair) ─
export function calcChangeInfo(bar: any): { text: string; positive: boolean } {
  if (!bar?.close || !bar?.open) return { text: '+0.00%', positive: true }
  const chg = (((bar.close - bar.open) / bar.open) * 100).toFixed(2)
  const n   = Number(chg)
  return {
    text:     `${n >= 0 ? '+' : ''}${chg}%`,
    positive: n >= 0,
  }
}
