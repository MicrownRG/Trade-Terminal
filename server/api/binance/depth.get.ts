import { defineEventHandler, getQuery } from 'h3'

const cache = new Map<string, { data: any; expires: number }>()

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const binanceUrl = config.binanceApiUrl || 'https://api.binance.com'

    const { symbol = 'BTCUSDT', limit = 20 } = query
    const cacheKey = `depth:${symbol}:${limit}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expires) return cached.data

    try {
        const url = `${binanceUrl}/api/v3/depth?symbol=${symbol}&limit=${limit}`
        const raw = await $fetch<{ bids: string[][]; asks: string[][] }>(url, { timeout: 8_000 })
        const depthData: any = {
            symbol,
            bids: raw.bids.map(([p, q]) => [p, q] as [string, string]),
            asks: raw.asks.map(([p, q]) => [p, q] as [string, string]),
            timestamp: Date.now(),
        }
        cache.set(cacheKey, { data: depthData, expires: Date.now() + 2_000 })
        return depthData
    } catch {
        return generateMockDepth(String(symbol), Number(limit) || 20)
    }
})

function generateMockDepth(symbol: string, count: number) {
    const base = symbol.startsWith('BTC') ? 65000 : symbol.startsWith('ETH') ? 3500 : 100
    const spread = base * 0.0005
    const bids: [string, string][] = []
    const asks: [string, string][] = []

    for (let i = 0; i < count; i++) {
        bids.push([(base - spread - i * base * 0.0002).toFixed(2), (Math.random() * 5).toFixed(4)])
        asks.push([(base + spread + i * base * 0.0002).toFixed(2), (Math.random() * 5).toFixed(4)])
    }
    return { symbol, bids: bids.reverse(), asks, timestamp: Date.now() }
}
