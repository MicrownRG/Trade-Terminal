// composables/usePineIndicator.ts
import { PineTS, Provider } from 'pinets'

export async function runPineScript(
    script: string,
    symbol: string,
    timeframe: string,
    candles = 500,
) {
    const pineTS = new PineTS(Provider.Binance as any, symbol, timeframe, candles)
    const result = await pineTS.run(script)
    return result.plots
}

// ─── Preset Pine Scripts ──────────────────────────────────
export const PINE_PRESETS = {
    rsi14: `//@version=5
indicator("RSI 14", overlay=false)
rsi = ta.rsi(close, 14)
plot(rsi, "RSI", color=#d2a8ff)
hline(70, "OB", color=#f85149, linestyle=hline.style_dashed)
hline(50, "Mid", color=#8b949e, linestyle=hline.style_dotted)
hline(30, "OS", color=#3fb950, linestyle=hline.style_dashed)`,

    macd: `//@version=5
indicator("MACD", overlay=false)
[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)
plot(macdLine,   "MACD",   color=#79c0ff)
plot(signalLine, "Signal", color=#ff7b72)
plot(histLine,   "Hist",   style=plot.style_histogram,
  color=histLine >= 0 ? #3fb950 : #f85149)`,

    bbands: `//@version=5
indicator("Bollinger Bands", overlay=true)
[upper, mid, lower] = ta.bb(close, 20, 2)
plot(upper, "Upper", color=#a371f7)
plot(mid,   "Mid",   color=color.new(#a371f7, 50))
plot(lower, "Lower", color=#a371f7)`,

    vwap: `//@version=5
indicator("VWAP", overlay=true)
vwapVal = ta.vwap(hlc3)
plot(vwapVal, "VWAP", color=#39d353, linewidth=2)`,

    stoch: `//@version=5
indicator("Stochastic", overlay=false)
k = ta.stoch(close, high, low, 14)
d = ta.sma(k, 3)
plot(k, "K", color=#58a6ff)
plot(d, "D", color=#f0883e)
hline(80, color=#f85149, linestyle=hline.style_dashed)
hline(20, color=#3fb950, linestyle=hline.style_dashed)`,
}