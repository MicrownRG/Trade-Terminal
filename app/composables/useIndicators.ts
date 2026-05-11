import { PineTS } from '@vibetrader/pinets'
import type { Bar } from '~/types'

export interface LwcPoint { time: number; value: number }

export function barsToKlines(bars: Bar[]): any[] {
  const periodMs = bars.length >= 2 ? (bars[1]!.time - bars[0]!.time) * 1000 : 3_600_000
  return bars.map(b => ({
    openTime: b.time * 1000,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    closeTime: b.time * 1000 + periodMs - 1,
    quoteAssetVolume: 0,
    numberOfTrades: 0,
    takerBuyBaseAssetVolume: 0,
    takerBuyQuoteAssetVolume: 0,
    ignore: 0,
  }))
}

export function plotsToLwcData(plots: Record<string, any>): Record<string, LwcPoint[]> {
  const result: Record<string, LwcPoint[]> = {}
  for (const [title, plot] of Object.entries(plots)) {
    result[title] = (plot.data ?? [])
      .filter((p: any) => p.value !== null && p.value !== undefined && !isNaN(p.value))
      .map((p: any) => ({ time: Math.floor(p.time / 1000), value: p.value }))
  }
  return result
}

export async function runIndicator(
  script: string,
  bars: Bar[],
): Promise<Record<string, LwcPoint[]>> {
  if (!bars.length) return {}
  try {
    const pine = new PineTS(barsToKlines(bars))
    const ctx = await pine.run(script)
    return plotsToLwcData((ctx as any).plots ?? {})
  } catch (e) {
    console.error('[useIndicators]', e)
    return {}
  }
}

import type { IndicatorId, IndicatorParams } from '~/types'

export const DEFAULT_INDICATOR_PARAMS: Record<IndicatorId, IndicatorParams> = {
  SMA:  { period1: 20, period2: 50 },
  EMA:  { period1: 9, period2: 21 },
  RSI:  { period1: 14, overbought: 70, oversold: 30 },
  MACD: { fast: 12, slow: 26, signal: 9 },
  BB:   { period1: 20, stdDev: 2 },
  VWAP: {},
}

function clampPeriod(v: number | undefined, fallback: number): number {
  const n = v ?? fallback
  return Math.max(1, n)
}

export function getRsiLevels(params: IndicatorParams): { overbought: number; oversold: number } {
  const ob = params.overbought ?? DEFAULT_INDICATOR_PARAMS.RSI.overbought ?? 70
  const os = params.oversold   ?? DEFAULT_INDICATOR_PARAMS.RSI.oversold   ?? 30
  return {
    overbought: Math.min(100, Math.max(50, ob as number)),
    oversold:   Math.min(50,  Math.max(0,  os as number)),
  }
}

export function buildIndicatorScript(id: IndicatorId, params: IndicatorParams): string {
  const d = DEFAULT_INDICATOR_PARAMS[id]
  const p = { ...d, ...params }

  switch (id) {
    case 'SMA': {
      const p1 = clampPeriod(p.period1, 20)
      const p2 = clampPeriod(p.period2, 50)
      return `//@version=5
plot(ta.sma(close, ${p1}), "SMA${p1}")
plot(ta.sma(close, ${p2}), "SMA${p2}")`
    }
    case 'EMA': {
      const p1 = clampPeriod(p.period1, 9)
      const p2 = clampPeriod(p.period2, 21)
      return `//@version=5
plot(ta.ema(close, ${p1}), "EMA${p1}")
plot(ta.ema(close, ${p2}), "EMA${p2}")`
    }
    case 'RSI': {
      const p1 = clampPeriod(p.period1, 14)
      return `//@version=5
plot(ta.rsi(close, ${p1}), "RSI")`
    }
    case 'MACD': {
      const fast   = Math.max(1, (p.fast   ?? 12) as number)
      const slow   = Math.max(1, (p.slow   ?? 26) as number)
      const signal = Math.max(1, (p.signal ?? 9)  as number)
      return `//@version=5
fast_ma = ta.ema(close, ${fast})
slow_ma = ta.ema(close, ${slow})
macdLine = fast_ma - slow_ma
signalLine = ta.ema(macdLine, ${signal})
hist = macdLine - signalLine
plot(macdLine, "MACD")
plot(signalLine, "Signal")
plot(hist, "Hist")`
    }
    case 'BB': {
      const p1  = clampPeriod(p.period1, 20)
      const dev = Math.max(0.1, (p.stdDev ?? 2) as number)
      return `//@version=5
basis = ta.sma(close, ${p1})
dev = ${dev} * ta.stdev(close, ${p1})
upper = basis + dev
lower = basis - dev
plot(upper, "BBUpper")
plot(basis, "BBMid")
plot(lower, "BBLower")`
    }
    case 'VWAP': return `//@version=5
plot(ta.vwap(hlc3), "VWAP")`
  }
  return ''
}
