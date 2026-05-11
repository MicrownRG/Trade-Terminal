import { defineEventHandler, getQuery } from 'h3'

const cache = new Map<string, { data: any; expires: number }>()

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const binanceUrl = config.binanceApiUrl || 'https://api.binance.com'

    const { symbols: symbolsParam } = query
    let symbols: string[] = ['BTCUSDT', 'ETHUSDT']
    if (symbolsParam) {
        try {
            symbols = typeof symbolsParam === 'string' ? JSON.parse(symbolsParam) : [String(symbolsParam)]
        } catch {
            symbols = [String(symbolsParam)]
        }
    }

    const results = await Promise.all(symbols.map(async (symbol) => {
        const cacheKey = `ticker:${symbol}`
        const cached = cache.get(cacheKey)
        if (cached && Date.now() < cached.expires) return cached.data

        try {
            const url = `${binanceUrl}/api/v3/ticker/24hr?symbol=${symbol}`
            const raw = await $fetch<any>(url, { timeout: 8_000 })
            const tickerData: any = {
                symbol: raw.symbol,
                price: Number(raw.lastPrice),
                change24h: Number(raw.priceChange),
                changePct24h: Number(raw.priceChangePercent),
                high24h: Number(raw.highPrice),
                low24h: Number(raw.lowPrice),
                volume24h: Number(raw.volume),
                quoteVolume24h: Number(raw.quoteVolume),
                updatedAt: Date.now(),
            }
            cache.set(cacheKey, { data: tickerData, expires: Date.now() + 5_000 })
            return tickerData
        } catch {
            return generateMockTicker(symbol)
        }
    }))
    return results
})

function generateMockTicker(symbol: string) {
    const base = symbol.startsWith('BTC') ? 65000 : symbol.startsWith('ETH') ? 3500 : 100
    const change = (Math.random() - 0.5) * base * 0.05
    return {
        symbol,
        price: base + change,
        change24h: change,
        changePct24h: (change / base) * 100,
        high24h: base + Math.abs(change) * 1.5,
        low24h: base - Math.abs(change) * 1.5,
        volume24h: Math.random() * 50000,
        quoteVolume24h: (base + change) * Math.random() * 50000,
        updatedAt: Date.now(),
    }
}
