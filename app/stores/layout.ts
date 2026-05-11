// stores/layout.ts
import { defineStore } from 'pinia'
import type { WidgetItem, WidgetType } from '~/types'
import { VALID_WIDGET_TYPES } from '~/stores/template'

const DEFAULT_LAYOUT: WidgetItem[] = [
    { i: '1', type: 'ProChart',  x: 0,  y: 0,  w: 15, h: 20, props: {} },
    { i: '2', type: 'Orderbook', x: 15, y: 0,  w: 5,  h: 20, props: {} },
    { i: '3', type: 'News',      x: 20, y: 0,  w: 4,  h: 10, props: {} },
    { i: '4', type: 'Sentiment', x: 20, y: 10, w: 4,  h: 10, props: {} },
    { i: '5', type: 'Watchlist', x: 0,  y: 20, w: 8,  h: 12, props: {} },
    { i: '6', type: 'RsiPanel',  x: 8,  y: 20, w: 16, h: 12, props: {} },
]

export interface WorkspacePage {
    id: string
    name: string
    layout: WidgetItem[]
}

export const useLayoutStore = defineStore('layout', {
    state: () => ({
        isLocked: false,
        pages: [
            { id: 'main', name: 'Main', layout: JSON.parse(JSON.stringify(DEFAULT_LAYOUT)) },
        ] as WorkspacePage[],
        activePageId: 'main',
    }),

    getters: {
        activePage: (state): WorkspacePage =>
            state.pages.find(p => p.id === state.activePageId) ?? state.pages[0]!,

        currentLayout: (state): WidgetItem[] => {
            const page = state.pages.find(p => p.id === state.activePageId)
            return page?.layout ?? JSON.parse(JSON.stringify(DEFAULT_LAYOUT))
        },
    },

    actions: {
        toggleLock() { this.isLocked = !this.isLocked },

        // ── Page management ───────────────────────────────
        addPage(name?: string) {
            const id = `page-${Date.now()}`
            this.pages.push({
                id,
                name: name ?? `Page ${this.pages.length + 1}`,
                layout: JSON.parse(JSON.stringify(DEFAULT_LAYOUT)),
            })
            this.activePageId = id
            this.saveToLocal()
        },

        removePage(id: string) {
            if (this.pages.length <= 1) return
            const idx = this.pages.findIndex(p => p.id === id)
            this.pages.splice(idx, 1)
            if (this.activePageId === id)
                this.activePageId = (this.pages[Math.max(0, idx - 1)] ?? this.pages[0])!.id
            this.saveToLocal()
        },

        renamePage(id: string, name: string) {
            const page = this.pages.find(p => p.id === id)
            if (page) { page.name = name; this.saveToLocal() }
        },

        setActivePage(id: string) {
            if (this.pages.find(p => p.id === id))
                this.activePageId = id
        },

        // Legacy compat — used by dashboard/[symbol].vue
        setPage(_symbol: string) {
            this.loadFromLocal()
        },

        // ── Layout management ─────────────────────────────
        updateLayout(layout: WidgetItem[]) {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (page) page.layout = layout
            this.saveToLocal()
        },

        addWidget(type: WidgetItem['type'], props: Record<string, any> = {}) {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (!page) return
            // New array reference required — Vue computed uses Object.is() to detect changes
            page.layout = [
                ...page.layout,
                { i: Date.now().toString(), type, x: 0, y: 9999, w: 8, h: 12, props },
            ]
            this.saveToLocal()
        },

        removeWidget(id: string) {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (page) {
                page.layout = page.layout.filter(w => w.i !== id)
                this.saveToLocal()
            }
        },

        resetLayout() {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (page) {
                page.layout = JSON.parse(JSON.stringify(DEFAULT_LAYOUT))
                this.saveToLocal()
            }
        },

        updateWidgetProps(widgetId: string, newProps: Record<string, any>) {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (!page) return
            const widget = page.layout.find(w => w.i === widgetId)
            if (!widget) return
            for (const [k, v] of Object.entries(newProps)) {
                if (v === undefined || v === null) delete widget.props[k]
                else widget.props[k] = v
            }
            this.saveToLocal()
        },

        cloneWidget(id: string) {
            const page = this.pages.find(p => p.id === this.activePageId)
            if (!page) return
            const widget = page.layout.find(w => w.i === id)
            if (!widget) return
            page.layout = [
                ...page.layout,
                {
                    ...JSON.parse(JSON.stringify(widget)),
                    i: Date.now().toString(),
                    x: (widget.x + 1) % 20,
                    y: widget.y + 1,
                },
            ]
            this.saveToLocal()
        },

        // ── Persist ───────────────────────────────────────
        saveToLocal() {
            if (import.meta.client)
                localStorage.setItem('tt-layouts-v2', JSON.stringify({
                    pages: this.pages,
                    activePageId: this.activePageId,
                }))
        },

        loadFromLocal() {
            if (!import.meta.client) return
            const raw = localStorage.getItem('tt-layouts-v2')
            if (raw) {
                try {
                    const saved = JSON.parse(raw)
                    if (saved.pages?.length) {
                        const validTypes = new Set(VALID_WIDGET_TYPES)
                        // Widgets that should follow the global symbol (no pin)
                        const followsStore = new Set(['ProChart', 'RsiPanel', 'MacdPanel', 'StochPanel'])
                        const BASE = 24
                        for (const page of saved.pages) {
                            page.layout = (page.layout ?? [])
                                .filter((w: any) => validTypes.has(w.type))
                                .map((w: any) => {
                                    // Migration: remove legacy pinned symbol from store-following widgets
                                    if (followsStore.has(w.type) && w.props?.symbol) {
                                        const { symbol: _s, ...rest } = w.props
                                        w = { ...w, props: rest }
                                    }
                                    // Clamp positions that got corrupted by breakpoint rounding
                                    const x = Math.max(0, Math.min(Math.round(w.x), BASE - 1))
                                    const w2 = Math.max(1, Math.min(Math.round(w.w), BASE - x))
                                    return { ...w, x, w: w2 }
                                })
                        }
                        this.pages = saved.pages
                        this.activePageId = saved.activePageId ?? saved.pages[0].id
                    }
                } catch {
                    localStorage.removeItem('tt-layouts-v2')
                }
            }
        },
    },
})
