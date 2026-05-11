// types/index.ts

export interface Bar {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface WidgetItem {
    i: string
    type: WidgetType
    x: number
    y: number
    w: number
    h: number
    props: Record<string, any>
}

// ── Widget types ──────────────────────────────────────────
export type WidgetType =
    | 'ProChart'
    | 'RsiPanel'
    | 'MacdPanel'
    | 'StochPanel'
    | 'Orderbook'
    | 'News'
    | 'Sentiment'
    | 'Watchlist'
    | 'Heatmap'
    | 'VolumeProfile'
    | 'MarketStats'
    | 'PriceAlert'
    | 'Notes'
    | 'OnChainMetrics'
    | 'TokenLaunch'
    | 'WhaleAlerts'
    | 'TradePlan'
    | 'SRLevels'
    | 'SignalDetail'
    | 'MarketContext'
    | 'LivePrices'
    | 'AnalystSignal'
    | 'EconomicCalendar'
    | 'PortfolioTracker'
    | 'FundingRate'
    | 'OpenInterest'
    | 'TechnicalSummary'

export interface NewsItem {
    id: string
    title: string
    source: string
    time: string
    url: string
    sentiment: 'positive' | 'negative' | 'neutral'
    summary?: string
    image?: string
}

export type DrawingTool =
    | null
    | 'TrendLine'
    | 'HorizontalLine'
    | 'VerticalLine'
    | 'FibRetracement'
    | 'Rectangle'
    | 'TextAnnotation'
    | 'select'

export interface DrawingToolDef {
    id: DrawingTool
    label: string
    shortcut?: string
    group: 'cursor' | 'lines' | 'shapes' | 'fibonacci' | 'annotations' | 'actions'
    svgPath: string
}

export type DrawingInteractionState = 'idle' | 'placing-first' | 'placing-second'

export type IndicatorId = 'SMA' | 'EMA' | 'BB' | 'VWAP' | 'RSI' | 'MACD'

export interface IndicatorParams {
    period1?: number
    period2?: number
    fast?: number
    slow?: number
    signal?: number
    stdDev?: number
    overbought?: number
    oversold?: number
}

export interface TradePlan {
    id: string
    createdAt: number
    symbol: string
    direction: 'long' | 'short'
    status: 'planning' | 'active' | 'win' | 'loss' | 'breakeven'
    entry: number
    sl: number
    tp1: number
    tp2: number
    tp3: number
    reason: string
    entryImage: string
    resultImage: string
    note: string
    closedAt?: number
    pnlPct?: number
}

export interface LayoutTemplate {
    id: string
    name: string
    description: string
    icon: string
    createdAt: number
    layout: WidgetItem[]
    isDefault?: boolean
}
