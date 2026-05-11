// tailwind.config.ts — LENGKAP
import type { Config } from 'tailwindcss'

export default {
    darkMode: 'class',
    content: [
        './components/**/*.{vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
    ],
    theme: {
        extend: {
            colors: {
                // ── Semua ref ke CSS variables → otomatis ganti dark/light ──
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    tertiary: 'var(--bg-tertiary)',
                    hover: 'var(--bg-hover)',
                },
                border: {
                    DEFAULT: 'var(--border-color)',
                    subtle: 'var(--border-subtle)',
                },
                txt: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                // Chart
                chart: {
                    bg: 'var(--chart-bg)',
                    surface: 'var(--chart-surface)',
                    border: 'var(--chart-border)',
                    hover: 'var(--chart-hover)',
                    text: 'var(--chart-text)',
                    muted: 'var(--chart-muted)',
                    grid: 'var(--chart-grid)',
                },
                // Trading
                bullish: 'var(--bullish)',
                bearish: 'var(--bearish)',
                // Indicators
                ind: {
                    sma: 'var(--ind-sma)',
                    ema: 'var(--ind-ema)',
                    bb: 'var(--ind-bb)',
                    vwap: 'var(--ind-vwap)',
                    rsi: 'var(--ind-rsi)',
                    macd: 'var(--ind-macd)',
                    signal: 'var(--ind-signal)',
                },
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'flash-up': 'flash-up 0.4s ease-out',
                'flash-down': 'flash-down 0.4s ease-out',
            },
        },
    },
    plugins: [],
} satisfies Config

