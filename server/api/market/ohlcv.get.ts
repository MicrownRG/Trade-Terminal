// server/api/market/ohlcv.get.ts
// Unified OHLCV endpoint with multiple data sources

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { symbol = 'BTCUSDT', timeframe = '1h', limit = 100, source = 'binance' } = query

  try {
    // For now, return mock data - in production would fetch from actual sources
    const ohlcv = generateMockOHLCV(symbol as string, timeframe as string, limit as number)
    return {
      symbol,
      timeframe,
      source,
      data: ohlcv,
      timestamp: Date.now(),
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch OHLCV data',
      data: { error: (error as Error).message },
    })
  }
})

function generateMockOHLCV(symbol: string, timeframe: string, limit: number) {
  const candles = []
  let currentTime = Math.floor(Date.now() / 1000) - limit * getTimeframeSeconds(timeframe)
  const timeframeMs = getTimeframeSeconds(timeframe) * 1000

  for (let i = 0; i < limit; i++) {
    const open = 40000 + Math.random() * 5000
    const close = open + (Math.random() - 0.5) * 2000
    const high = Math.max(open, close) + Math.random() * 500
    const low = Math.min(open, close) - Math.random() * 500
    const volume = Math.random() * 1000

    candles.push({
      time: Math.floor(currentTime),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(volume * 100) / 100,
    })

    currentTime += getTimeframeSeconds(timeframe)
  }

  return candles
}

function getTimeframeSeconds(timeframe: string): number {
  const map: Record<string, number> = {
    '1m': 60,
    '3m': 180,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '2h': 7200,
    '4h': 14400,
    '1d': 86400,
    '1w': 604800,
  }
  return map[timeframe] || 3600
}
