// composables/useMarketData.ts
import type { Bar } from '~/types'

// ── Cache sederhana di memory ──────────────────────────────
const cache = new Map<string, { data: Bar[]; ts: number }>()
const CACHE_TTL = 30_000

// ── Fetch OHLCV via Nuxt proxy ─────────────────────────────
export async function fetchOHLCV(
    symbol: string,
    interval: string,
    limit = 500,
): Promise<Bar[]> {
    const cacheKey = `${symbol}-${interval}-${limit}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data
    }

    try {
        const data = await $fetch<Bar[]>('/api/binance/klines', {
            params: { symbol, interval, limit },
            timeout: 15000,
        })

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Empty response from API')
        }

        cache.set(cacheKey, { data, ts: Date.now() })
        return data
    }
    catch (err: any) {
        console.error(`[fetchOHLCV] ${symbol} ${interval}:`, err?.message)

        // Stale fallback first
        if (cached) {
            console.warn('[fetchOHLCV] Using stale cache')
            return cached.data
        }

        // Fallback: mock data so chart always has something to display
        return generateMockBars(limit)
    }
}

// ── Mock data fallback — exported so tests can use it ─────
// basePrice defaults to a realistic BTC spot price.
export function generateMockBars(count: number, basePrice = 67000): Bar[] {
    if (count <= 0) return []
    const now = Math.floor(Date.now() / 1000)
    const bars: Bar[] = []
    let price = basePrice

    for (let i = count; i > 0; i--) {
        const change = (Math.random() - 0.48) * basePrice * 0.01
        const open   = price
        const close  = price + change
        const high   = Math.max(open, close) + Math.random() * basePrice * 0.005
        const low    = Math.min(open, close) - Math.random() * basePrice * 0.005
        price = Math.max(close, 1)

        bars.push({
            time:   now - i * 3600,
            open:   +Math.max(open,  1).toFixed(2),
            high:   +Math.max(high,  1).toFixed(2),
            low:    +Math.max(low,   1).toFixed(2),
            close:  +Math.max(close, 1).toFixed(2),
            volume: +(Math.random() * 1000 + 100).toFixed(2),
        })
    }

    return bars
}

// ── Orderbook via proxy ────────────────────────────────────
export async function fetchOrderbook(symbol: string) {
    try {
        return await $fetch<any>('/api/binance/depth', {
            params: { symbol, limit: 20 },
            timeout: 8000,
        })
    }
    catch (err: any) {
        console.error('[fetchOrderbook]', err?.message)
        return { bids: [], asks: [] }
    }
}

// ── Tickers via proxy ──────────────────────────────────────
export async function fetchTickers(symbols: string[]) {
    try {
        const data = await $fetch<any[]>('/api/binance/ticker', {
            params: { symbols: JSON.stringify(symbols) },
            timeout: 8000,
        })
        return Array.isArray(data) ? data : []
    }
    catch (err: any) {
        console.error('[fetchTickers]', err?.message)
        return []
    }
}

// ── Exchange Info ──────────────────────────────────────────
export async function fetchExchangeInfo(): Promise<string[]> {
    try {
        const data = await $fetch<string[]>('/api/binance/exchangeInfo', {
            timeout: 15000,
        })
        return Array.isArray(data) ? data : []
    }
    catch (err: any) {
        console.error('[fetchExchangeInfo]', err?.message)
        return ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT']
    }
}

// ── WebSocket realtime tick ────────────────────────────────
// Returns { close } for manual lifecycle control.
// DOES NOT register onUnmounted — callers must call close() themselves.
export function useRealtimeTick(
    symbol: string,
    interval: string,
    onUpdate: (bar: Bar) => void,
): { close: () => void } {
    let ws: WebSocket | null = null
    let retryCount = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    const MAX_RETRY = 5

    function connect() {
        const config = useRuntimeConfig()
        const wsUrl = config.public.binanceWsUrl || 'wss://stream.binance.com:9443'
        const stream = `${symbol.toLowerCase()}@kline_${interval}`
        const url = `${wsUrl}/ws/${stream}`

        try {
            ws = new WebSocket(url)

            ws.onopen = () => {
                retryCount = 0
                console.log(`[WS] Connected: ${stream}`)
            }

            ws.onmessage = (e) => {
                try {
                    const { k } = JSON.parse(e.data)
                    onUpdate({
                        time:   Math.floor(k.t / 1000),
                        open:   parseFloat(k.o),
                        high:   parseFloat(k.h),
                        low:    parseFloat(k.l),
                        close:  parseFloat(k.c),
                        volume: parseFloat(k.v),
                    })
                }
                catch { }
            }

            ws.onerror = (err) => {
                console.warn('[WS] Error, will retry...', err)
            }

            ws.onclose = () => {
                if (retryCount < MAX_RETRY) {
                    retryCount++
                    const delay = Math.min(1000 * 2 ** retryCount, 30000)
                    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retryCount})`)
                    retryTimer = setTimeout(connect, delay)
                }
            }
        }
        catch (err) {
            console.error('[WS] Failed to create WebSocket:', err)
        }
    }

    connect()

    return {
        close() {
            if (retryTimer) clearTimeout(retryTimer)
            ws?.close()
            ws = null
        },
    }
}