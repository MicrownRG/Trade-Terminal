// stores/template.ts
import { defineStore } from 'pinia'
import type { LayoutTemplate, WidgetItem, WidgetType } from '~/types'

// Exported for tests
export const VALID_WIDGET_TYPES: WidgetType[] = [
    'ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel',
    'Orderbook', 'News', 'Sentiment', 'Watchlist', 'Heatmap',
    'VolumeProfile', 'MarketStats', 'PriceAlert', 'Notes',
    'OnChainMetrics', 'TokenLaunch', 'WhaleAlerts', 'TradePlan',
    'SRLevels', 'SignalDetail', 'MarketContext', 'LivePrices',
    'AnalystSignal', 'EconomicCalendar', 'PortfolioTracker',
    'FundingRate', 'OpenInterest', 'TechnicalSummary',
]

// ── Default templates ─────────────────────────────────────
export const DEFAULT_TEMPLATES: LayoutTemplate[] = [
    {
        id: 'full-trader',
        name: 'Full Trader',
        description: 'Chart + Orderbook + RSI + MACD + News + Watchlist',
        icon: 'chart-line',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'ft1', type: 'ProChart',   x: 0,  y: 0,  w: 14, h: 20, props: {} },
            { i: 'ft2', type: 'Orderbook',  x: 14, y: 0,  w: 5,  h: 20, props: {} },
            { i: 'ft3', type: 'News',        x: 19, y: 0,  w: 5,  h: 10, props: {} },
            { i: 'ft4', type: 'Sentiment',   x: 19, y: 10, w: 5,  h: 10, props: {} },
            { i: 'ft5', type: 'Watchlist',   x: 0,  y: 20, w: 6,  h: 10, props: {} },
            { i: 'ft6', type: 'RsiPanel',    x: 6,  y: 20, w: 9,  h: 10, props: {} },
            { i: 'ft7', type: 'MacdPanel',   x: 15, y: 20, w: 9,  h: 10, props: {} },
        ],
    },
    {
        id: 'chart-focus',
        name: 'Chart Focus',
        description: 'Chart besar + RSI + Stats',
        icon: 'trending-up',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'cf1', type: 'ProChart',    x: 0,  y: 0,  w: 18, h: 22, props: {} },
            { i: 'cf2', type: 'MarketStats', x: 18, y: 0,  w: 6,  h: 11, props: {} },
            { i: 'cf3', type: 'Watchlist',   x: 18, y: 11, w: 6,  h: 11, props: {} },
            { i: 'cf4', type: 'RsiPanel',    x: 0,  y: 22, w: 12, h: 8,  props: {} },
            { i: 'cf5', type: 'MacdPanel',   x: 12, y: 22, w: 12, h: 8,  props: {} },
        ],
    },
    {
        id: 'news-sentiment',
        name: 'News & Sentiment',
        description: 'Fokus pada berita dan sentimen pasar',
        icon: 'newspaper',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'ns1', type: 'ProChart',    x: 0,  y: 0,  w: 12, h: 18, props: {} },
            { i: 'ns2', type: 'News',        x: 12, y: 0,  w: 6,  h: 18, props: {} },
            { i: 'ns3', type: 'Sentiment',   x: 18, y: 0,  w: 6,  h: 9,  props: {} },
            { i: 'ns4', type: 'Heatmap',     x: 18, y: 9,  w: 6,  h: 9,  props: {} },
            { i: 'ns5', type: 'MarketStats', x: 0,  y: 18, w: 12, h: 8,  props: {} },
            { i: 'ns6', type: 'Watchlist',   x: 12, y: 18, w: 12, h: 8,  props: {} },
        ],
    },
    {
        id: 'scalper',
        name: 'Scalper',
        description: 'Multi chart + Orderbook + Alerts',
        icon: 'zap',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'sc1', type: 'ProChart',    x: 0,  y: 0,  w: 12, h: 16, props: { symbol: 'BTCUSDT' } },
            { i: 'sc2', type: 'ProChart',    x: 12, y: 0,  w: 12, h: 16, props: { symbol: 'ETHUSDT' } },
            { i: 'sc3', type: 'Orderbook',   x: 0,  y: 16, w: 6,  h: 14, props: {} },
            { i: 'sc4', type: 'RsiPanel',    x: 6,  y: 16, w: 9,  h: 7,  props: { symbol: 'BTCUSDT' } },
            { i: 'sc5', type: 'PriceAlert',  x: 6,  y: 23, w: 9,  h: 7,  props: {} },
            { i: 'sc6', type: 'Watchlist',   x: 15, y: 16, w: 9,  h: 14, props: {} },
        ],
    },
    {
        id: 'signal-analyst',
        name: 'Signal Analyst',
        description: '3-column: Live Prices + SR | Chart + Signal Panel | Signal Detail + Micro',
        icon: 'crosshair',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'sa1', type: 'LivePrices',    x: 0,  y: 0,  w: 4,  h: 8,  props: {} },
            { i: 'sa2', type: 'SRLevels',      x: 0,  y: 8,  w: 4,  h: 13, props: {} },
            { i: 'sa3', type: 'Sentiment',     x: 0,  y: 21, w: 4,  h: 9,  props: {} },
            { i: 'sa4', type: 'ProChart',      x: 4,  y: 0,  w: 15, h: 19, props: {} },
            { i: 'sa5', type: 'AnalystSignal', x: 4,  y: 19, w: 15, h: 11, props: {} },
            { i: 'sa6', type: 'SignalDetail',  x: 19, y: 0,  w: 5,  h: 18, props: {} },
            { i: 'sa7', type: 'MarketContext', x: 19, y: 18, w: 5,  h: 12, props: {} },
        ],
    },
    // ── New templates ─────────────────────────────────────
    {
        id: 'futures-trader',
        name: 'Futures Trader',
        description: 'Perp chart + Orderbook + Funding Rate + Open Interest + RSI',
        icon: 'trending-up',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'ftr1', type: 'ProChart',         x: 0,  y: 0,  w: 16, h: 20, props: {} },
            { i: 'ftr2', type: 'Orderbook',        x: 16, y: 0,  w: 8,  h: 20, props: {} },
            { i: 'ftr3', type: 'FundingRate',      x: 0,  y: 20, w: 8,  h: 10, props: {} },
            { i: 'ftr4', type: 'OpenInterest',     x: 8,  y: 20, w: 8,  h: 10, props: {} },
            { i: 'ftr5', type: 'RsiPanel',         x: 16, y: 20, w: 8,  h: 10, props: {} },
        ],
    },
    {
        id: 'on-chain-monitor',
        name: 'On-Chain Monitor',
        description: 'Chart + On-Chain Metrics + Whale Alerts + Token Launches',
        icon: 'link',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'oc1', type: 'ProChart',       x: 0,  y: 0,  w: 12, h: 18, props: {} },
            { i: 'oc2', type: 'OnChainMetrics', x: 12, y: 0,  w: 6,  h: 18, props: {} },
            { i: 'oc3', type: 'WhaleAlerts',    x: 18, y: 0,  w: 6,  h: 9,  props: {} },
            { i: 'oc4', type: 'TokenLaunch',    x: 18, y: 9,  w: 6,  h: 9,  props: {} },
            { i: 'oc5', type: 'News',           x: 0,  y: 18, w: 12, h: 10, props: {} },
            { i: 'oc6', type: 'Sentiment',      x: 12, y: 18, w: 12, h: 10, props: {} },
        ],
    },
    {
        id: 'dca-investor',
        name: 'DCA Investor',
        description: 'Portfolio tracker + Economic calendar + Market stats + Sentiment',
        icon: 'briefcase',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'dca1', type: 'ProChart',          x: 0,  y: 0,  w: 14, h: 20, props: {} },
            { i: 'dca2', type: 'PortfolioTracker',  x: 14, y: 0,  w: 10, h: 20, props: {} },
            { i: 'dca3', type: 'EconomicCalendar',  x: 0,  y: 20, w: 8,  h: 10, props: {} },
            { i: 'dca4', type: 'Sentiment',         x: 8,  y: 20, w: 8,  h: 10, props: {} },
            { i: 'dca5', type: 'MarketStats',       x: 16, y: 20, w: 8,  h: 10, props: {} },
        ],
    },
    {
        id: 'multi-asset',
        name: 'Multi-Asset',
        description: '4 charts side by side: BTC, ETH, SOL, BNB + Watchlist + News',
        icon: 'grid',
        createdAt: 0,
        isDefault: true,
        layout: [
            { i: 'ma1', type: 'ProChart',  x: 0,  y: 0,  w: 12, h: 15, props: { symbol: 'BTCUSDT' } },
            { i: 'ma2', type: 'ProChart',  x: 12, y: 0,  w: 12, h: 15, props: { symbol: 'ETHUSDT' } },
            { i: 'ma3', type: 'ProChart',  x: 0,  y: 15, w: 12, h: 15, props: { symbol: 'SOLUSDT' } },
            { i: 'ma4', type: 'ProChart',  x: 12, y: 15, w: 12, h: 15, props: { symbol: 'BNBUSDT' } },
            { i: 'ma5', type: 'Watchlist', x: 0,  y: 30, w: 8,  h: 10, props: {} },
            { i: 'ma6', type: 'News',      x: 8,  y: 30, w: 16, h: 10, props: {} },
        ],
    },
]

export const useTemplateStore = defineStore('template', {
    state: () => {
        let userTemplates: LayoutTemplate[] = []
        if (import.meta.client) {
            try {
                const raw = localStorage.getItem('tt-templates')
                if (raw) userTemplates = JSON.parse(raw)
            } catch {}
        }
        return {
            templates: [...DEFAULT_TEMPLATES, ...userTemplates] as LayoutTemplate[],
            activeTemplateId: null as string | null,
        }
    },

    getters: {
        userTemplates: (state) => state.templates.filter(t => !t.isDefault),
        allTemplates:  (state) => state.templates,
    },

    actions: {
        saveCurrentAsTemplate(name: string, description: string, icon: string, layout: WidgetItem[]) {
            const tpl: LayoutTemplate = {
                id: `user-${Date.now()}`,
                name, description, icon,
                createdAt: Date.now(),
                isDefault: false,
                layout: JSON.parse(JSON.stringify(layout)),
            }
            this.templates.push(tpl)
            this.saveToLocal()
            return tpl.id
        },

        updateTemplate(id: string, layout: WidgetItem[]) {
            const idx = this.templates.findIndex(t => t.id === id)
            const tpl = this.templates[idx]
            if (idx >= 0 && tpl && !tpl.isDefault) {
                tpl.layout = JSON.parse(JSON.stringify(layout))
                this.saveToLocal()
            }
        },

        deleteTemplate(id: string) {
            const tpl = this.templates.find(t => t.id === id)
            if (tpl && !tpl.isDefault) {
                this.templates = this.templates.filter(t => t.id !== id)
                this.saveToLocal()
            }
        },

        applyTemplate(id: string): WidgetItem[] | null {
            const tpl = this.templates.find(t => t.id === id)
            if (!tpl) return null
            this.activeTemplateId = id
            return JSON.parse(JSON.stringify(tpl.layout))
        },

        saveToLocal() {
            if (!import.meta.client) return
            const userOnly = this.templates.filter(t => !t.isDefault)
            localStorage.setItem('tt-templates', JSON.stringify(userOnly))
        },

        loadFromLocal() {
            if (!import.meta.client) return
            const raw = localStorage.getItem('tt-templates')
            if (raw) {
                const userTemplates: LayoutTemplate[] = JSON.parse(raw)
                this.templates = [...DEFAULT_TEMPLATES, ...userTemplates]
            }
        },
    },
})
