// stores/chart.ts
import { defineStore } from 'pinia'
import type { DrawingTool, IndicatorId } from '~/types'
import { DEFAULT_INDICATOR_PARAMS } from '~/composables/useIndicators'

export const useChartStore = defineStore('chart', {
    state: () => ({
        symbol: 'BTCUSDT',
        timeframe: '1h',
        activeTool: null as DrawingTool,
        isDrawingInProgress: false,
        activeIndicators: [] as IndicatorId[],
        chartType: 'candlestick' as 'candlestick' | 'heikinashi' | 'bar' | 'line' | 'area',
        candleColorMode: 'color' as 'color' | 'mono',
        drawings: {} as Record<string, any[]>,
        // Fibonacci settings (persisted, apply to all new fib drawings)
        fibLevels: [
            { value: 0, enabled: true },
            { value: 0.236, enabled: true },
            { value: 0.382, enabled: true },
            { value: 0.5, enabled: true },
            { value: 0.618, enabled: true },
            { value: 0.786, enabled: true },
            { value: 1.0, enabled: true },
        ] as { value: number, enabled: boolean }[],
        fibShowPrices: true as boolean,
        fibShowPercentages: true as boolean,
        fibExtendLines: false as boolean,
        indicatorSettings: {} as Record<IndicatorId, any>,
    }),

    getters: {
        activeFibLevels: (state) => state.fibLevels.filter(l => l.enabled).map(l => l.value),
        getIndicatorParams: (state) => (id: IndicatorId) => {
            return { ...DEFAULT_INDICATOR_PARAMS[id], ...(state.indicatorSettings[id] ?? {}) }
        }
    },

    actions: {
        setSymbol(s: string) { this.symbol = s },
        setTimeframe(t: string) { this.timeframe = t },
        setChartType(t: string) {
            const valid = ['candlestick', 'heikinashi', 'bar', 'line', 'area']
            if (valid.includes(t)) this.chartType = t as any
        },
        setActiveTool(t: DrawingTool) { this.activeTool = t },
        clearActiveTool() { this.activeTool = null; this.isDrawingInProgress = false },
        setDrawingInProgress(v: boolean) { this.isDrawingInProgress = v },
        toggleCandleColorMode() {
            this.candleColorMode = this.candleColorMode === 'color' ? 'mono' : 'color'
        },

        toggleIndicator(id: IndicatorId) {
            const idx = this.activeIndicators.indexOf(id)
            if (idx >= 0) this.activeIndicators.splice(idx, 1)
            else {
                this.activeIndicators.push(id)
                // ensure we have default settings initialized
                if (!this.indicatorSettings[id]) {
                    this.indicatorSettings[id] = {}
                }
            }
        },

        setIndicatorParam(id: IndicatorId, key: string, value: any) {
            if (!this.indicatorSettings[id]) {
                this.indicatorSettings[id] = {}
            }
            this.indicatorSettings[id][key] = value
            this.saveIndicatorSettings()
        },

        saveIndicatorSettings() {
            if (import.meta.client)
                localStorage.setItem('tt-indicator-settings', JSON.stringify(this.indicatorSettings))
        },

        loadIndicatorSettings() {
            if (!import.meta.client) return
            try {
                const raw = localStorage.getItem('tt-indicator-settings')
                if (raw) this.indicatorSettings = JSON.parse(raw)
            } catch {}
        },

        saveDrawings(symbol: string, json: any[]) {
            this.drawings[symbol] = json
            if (import.meta.client)
                localStorage.setItem('tt-drawings', JSON.stringify(this.drawings))
        },

        loadDrawings() {
            if (!import.meta.client) return
            const raw = localStorage.getItem('tt-drawings')
            if (raw) this.drawings = JSON.parse(raw)
        },

        // ── Fibonacci settings ──────────────────────────────
        saveFibSettings() {
            if (!import.meta.client) return
            localStorage.setItem('tt-fib-settings', JSON.stringify({
                levels: this.fibLevels,
                showPrices: this.fibShowPrices,
                showPercentages: this.fibShowPercentages,
                extendLines: this.fibExtendLines,
            }))
        },

        loadFibSettings() {
            if (!import.meta.client) return
            try {
                const raw = localStorage.getItem('tt-fib-settings')
                if (!raw) return
                const s = JSON.parse(raw)
                if (Array.isArray(s.levels)) {
                    if (typeof s.levels[0] === 'number') {
                        this.fibLevels = s.levels.map((v: number) => ({ value: v, enabled: true }))
                    } else {
                        this.fibLevels = s.levels
                    }
                }
                if (s.showPrices !== undefined)      this.fibShowPrices = s.showPrices
                if (s.showPercentages !== undefined) this.fibShowPercentages = s.showPercentages
                if (s.extendLines !== undefined)     this.fibExtendLines = s.extendLines
            } catch {}
        },

        setFibLevel(index: number, value: number, enabled: boolean = true) {
            this.fibLevels[index] = { value, enabled }
            this.saveFibSettings()
        },

        addFibLevel(value: number) {
            if (this.fibLevels.some(l => l.value === value)) return
            this.fibLevels.push({ value, enabled: true })
            this.fibLevels.sort((a, b) => a.value - b.value)
            this.saveFibSettings()
        },

        removeFibLevel(index: number) {
            this.fibLevels.splice(index, 1)
            this.saveFibSettings()
        },

        setFibOptions(opts: { showPrices?: boolean; showPercentages?: boolean; extendLines?: boolean }) {
            if (opts.showPrices      !== undefined) this.fibShowPrices      = opts.showPrices
            if (opts.showPercentages !== undefined) this.fibShowPercentages = opts.showPercentages
            if (opts.extendLines     !== undefined) this.fibExtendLines     = opts.extendLines
            this.saveFibSettings()
        },
    },
})