// composables/useTheme.ts
// Satu composable untuk semua kebutuhan theme — UI + Chart

export function useTheme() {
    const colorMode = useColorMode()

    // ── Reaktif: apakah dark mode aktif ──
    const isDark = computed(() => colorMode.value === 'dark')

    // ── Toggle ──
    function toggle() {
        colorMode.preference = isDark.value ? 'light' : 'dark'
    }

    // ── Chart theme config (untuk lightweight-charts) ──
    const chartTheme = computed(() => ({
        layout: {
            background: { color: isDark.value ? '#0d1117' : '#ffffff' },
            textColor: isDark.value ? '#c9d1d9' : '#24292f',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
            vertLines: { color: isDark.value ? '#21262d' : '#eaeef2' },
            horzLines: { color: isDark.value ? '#21262d' : '#eaeef2' },
        },
        crosshair: {
            mode: 1,
            vertLine: {
                color: isDark.value ? '#58a6ff' : '#0969da',
                width: 1,
                style: 3,
                labelBackgroundColor: isDark.value ? '#1f6feb' : '#0969da',
            },
            horzLine: {
                color: isDark.value ? '#58a6ff' : '#0969da',
                width: 1,
                style: 3,
                labelBackgroundColor: isDark.value ? '#1f6feb' : '#0969da',
            },
        },
        rightPriceScale: {
            borderColor: isDark.value ? '#21262d' : '#eaeef2',
            textColor: isDark.value ? '#8b949e' : '#57606a',
        },
        timeScale: {
            borderColor: isDark.value ? '#21262d' : '#eaeef2',
            textColor: isDark.value ? '#8b949e' : '#57606a',
            timeVisible: true,
            secondsVisible: false,
        },
    }))

    // ── Candle colors (sama dark & light, hanya brightness) ──
    const candleColors = computed(() => ({
        upColor: isDark.value ? '#3fb950' : '#1a7f37',
        downColor: isDark.value ? '#f85149' : '#cf222e',
        borderUpColor: isDark.value ? '#3fb950' : '#1a7f37',
        borderDownColor: isDark.value ? '#f85149' : '#cf222e',
        wickUpColor: isDark.value ? '#3fb950' : '#1a7f37',
        wickDownColor: isDark.value ? '#f85149' : '#cf222e',
    }))

    // ── Volume colors ──
    const volumeColors = computed(() => ({
        up: isDark.value ? 'rgba(63,185,80,0.4)' : 'rgba(26,127,55,0.35)',
        down: isDark.value ? 'rgba(248,81,73,0.4)' : 'rgba(207,34,46,0.35)',
    }))

    // ── Indicator line colors ──
    const indColors = computed(() => ({
        sma20: isDark.value ? '#58a6ff' : '#0969da',
        sma50: isDark.value ? '#f0883e' : '#bc4c00',
        ema9: isDark.value ? '#79c0ff' : '#0550ae',
        bbUpper: isDark.value ? 'rgba(163,113,247,0.9)' : 'rgba(110,64,201,0.9)',
        bbMid: isDark.value ? 'rgba(163,113,247,0.5)' : 'rgba(110,64,201,0.5)',
        bbLower: isDark.value ? 'rgba(163,113,247,0.9)' : 'rgba(110,64,201,0.9)',
        vwap: isDark.value ? '#39d353' : '#1a7f37',
        rsi: isDark.value ? '#d2a8ff' : '#6e40c9',
        macd: isDark.value ? '#79c0ff' : '#0969da',
        signal: isDark.value ? '#ff7b72' : '#cf222e',
        histPos: isDark.value ? '#3fb950' : '#1a7f37',
        histNeg: isDark.value ? '#f85149' : '#cf222e',
    }))

    return {
        isDark,
        toggle,
        chartTheme,
        candleColors,
        volumeColors,
        indColors,
    }
}