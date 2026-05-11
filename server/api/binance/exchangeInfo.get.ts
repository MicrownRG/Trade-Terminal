import { defineEventHandler } from 'h3'

const cache = new Map<string, { data: any; expires: number }>()

export default defineEventHandler(async () => {
    const config = useRuntimeConfig()
    const binanceUrl = config.binanceApiUrl || 'https://api.binance.com'
    const cacheKey = 'exchangeInfo'
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() < cached.expires) return cached.data

    try {
        const url = `${binanceUrl}/api/v3/exchangeInfo`
        const raw = await $fetch<any>(url, { timeout: 15_000 })
        // Only keep trading pairs
        const symbols: string[] = raw.symbols
            .filter((s: any) => s.status === 'TRADING')
            .map((s: any) => s.symbol)
        
        cache.set(cacheKey, { data: symbols, expires: Date.now() + 3600_000 }) // 1 hour cache
        return symbols
    } catch {
        return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT']
    }
})
