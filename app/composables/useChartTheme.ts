// composables/useChartTheme.ts
export function useChartTheme() {
    const colorMode  = useColorMode()
    const chartStore = useChartStore()

    // ── Color palettes ────────────────────────────────────────
    const CANDLE_COLOR_DARK  = { upColor:'#26a69a', downColor:'#ef5350', borderUpColor:'#26a69a', borderDownColor:'#ef5350', wickUpColor:'#26a69a', wickDownColor:'#ef5350' }
    const CANDLE_COLOR_LIGHT = { upColor:'#089981', downColor:'#f23645', borderUpColor:'#089981', borderDownColor:'#f23645', wickUpColor:'#089981', wickDownColor:'#f23645' }

    // ── Monochrome palette (blue-gray, like B&W trading screens) ─
    const CANDLE_MONO_DARK  = { upColor:'#c8d8e8', downColor:'#2e3f50', borderUpColor:'#d8e8f4', borderDownColor:'#1e2e3e', wickUpColor:'#8aaabf', wickDownColor:'#4a5e70' }
    const CANDLE_MONO_LIGHT = { upColor:'#e8eef4', downColor:'#4a6070', borderUpColor:'#c0d0de', borderDownColor:'#2a3a48', wickUpColor:'#8aA0b4', wickDownColor:'#6a808e' }

    const candleColors = computed(() => {
        const mono = chartStore.candleColorMode === 'mono'
        if (mono) return colorMode.value === 'light' ? CANDLE_MONO_LIGHT : CANDLE_MONO_DARK
        return colorMode.value === 'light' ? CANDLE_COLOR_LIGHT : CANDLE_COLOR_DARK
    })

    // ── Volume bar alpha colours ───────────────────────────────
    const volumeColors = computed(() =>
        colorMode.value === 'light'
            ? { up: 'rgba(8,153,129,0.3)',   down: 'rgba(242,54,69,0.3)' }
            : { up: 'rgba(38,166,154,0.3)',  down: 'rgba(239,83,80,0.3)' },
    )

    const themes = {
        dark: {
            layout: {
                background: { color: '#0d1117' },
                textColor: '#c9d1d9',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
            },
            grid: {
                vertLines: { color: '#1c2128' },
                horzLines: { color: '#1c2128' },
            },
            crosshair: {
                mode: 1,
                vertLine: { color: '#58a6ff', width: 1 as const, style: 3, labelBackgroundColor: '#1f6feb' },
                horzLine: { color: '#58a6ff', width: 1 as const, style: 3, labelBackgroundColor: '#1f6feb' },
            },
            rightPriceScale: { borderColor: '#21262d', textColor: '#8b949e' },
            timeScale: {
                borderColor: '#21262d',
                textColor: '#8b949e',
                timeVisible: true,
                secondsVisible: false,
            },
        },
        light: {
            layout: {
                background: { color: '#ffffff' },
                textColor: '#24292f',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
            },
            crosshair: {
                mode: 1,
                vertLine: { color: '#0969da', width: 1 as const, style: 3, labelBackgroundColor: '#0969da' },
                horzLine: { color: '#0969da', width: 1 as const, style: 3, labelBackgroundColor: '#0969da' },
            },
            rightPriceScale: { borderColor: '#e0e0e0', textColor: '#57606a' },
            timeScale: {
                borderColor: '#e0e0e0',
                textColor: '#57606a',
                timeVisible: true,
                secondsVisible: false,
            },
        },
    }

    const current = computed(() =>
        themes[colorMode.value as 'dark' | 'light'] ?? themes.dark,
    )

    // Indicator colours — same for both modes (they show on chart canvas)
    const indicatorColors = {
        sma20:   '#2962ff',
        sma50:   '#ff9800',
        ema9:    '#00bcd4',
        bbUpper: 'rgba(156,39,176,0.8)',
        bbMid:   'rgba(156,39,176,0.5)',
        bbLower: 'rgba(156,39,176,0.8)',
        bbFill:  'rgba(156,39,176,0.05)',
        vwap:    '#00e676',
        rsi:     '#ce93d8',
        macd:    '#42a5f5',
        signal:  '#ef9a9a',
        histPos: '#26a69a',
        histNeg: '#ef5350',
    }

    return { current, themes, candleColors, volumeColors, indicatorColors }
}
