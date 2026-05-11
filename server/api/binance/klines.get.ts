import { defineEventHandler, getQuery } from 'h3'

const cache = new Map<string, { data: any; expires: number }>()

const KLINE_TTL: Record<string, number> = {
    '1m': 5_000, '3m': 10_000, '5m': 15_000, '15m': 30_000,
    '30m': 60_000, '1h': 120_000, '2h': 180_000, '4h': 300_000,
    '6h': 300_000, '12h': 600_000, '1d': 600_000, '3d': 1_800_000,
    '1w': 1_800_000, '1M': 3_600_000,
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const binanceUrl = config.binanceApiUrl || 'https://api.binance.com'

    const { symbol = 'BTCUSDT', interval = '1h', limit = 500 } = query
    const cacheKey = `klines:${symbol}:${interval}:${limit}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expires) return cached.data

    try {
        const url = `${binanceUrl}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        const raw = await $fetch<any[][]>(url, { timeout: 10_000 })
        const bars: any[] = raw.map(k => ({
            time: Math.floor(Number(k[0]) / 1000),
            open: Number(k[1]),
            high: Number(k[2]),
            low: Number(k[3]),
            close: Number(k[4]),
            volume: Number(k[5]),
        }))
        const ttl = KLINE_TTL[interval as string] ?? 120_000
        cache.set(cacheKey, { data: bars, expires: Date.now() + ttl })
        return bars
    } catch {
        return generateMockKlines(String(symbol), String(interval), Number(limit) || 500)
    }
})

function generateMockKlines(symbol: string, interval: string, limit: number) {
    const intervalSecs: Record<string, number> = {
        '1m': 60, '3m': 180, '5m': 300, '15m': 900, '30m': 1800,
        '1h': 3600, '2h': 7200, '4h': 14400, '6h': 21600, '12h': 43200,
        '1d': 86400, '3d': 259200, '1w': 604800, '1M': 2592000,
    }
    const secs = intervalSecs[interval] ?? 3600
    const basePrice = symbol.startsWith('BTC') ? 65000 : symbol.startsWith('ETH') ? 3500 : 100
    let time = Math.floor(Date.now() / 1000) - limit * secs
    let price = basePrice

    return Array.from({ length: limit }, () => {
        price += (Math.random() - 0.5) * basePrice * 0.02
        const open = price
        const close = price + (Math.random() - 0.5) * basePrice * 0.01
        const high = Math.max(open, close) + Math.random() * basePrice * 0.005
        const low = Math.min(open, close) - Math.random() * basePrice * 0.005
        const bar = { time, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume: +(Math.random() * 1000).toFixed(2) }
        time += secs
        return bar
    })
}
