// server/api/market/ticker.get.ts
// Real-time ticker data endpoint

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { symbol = 'BTCUSDT', source = 'binance' } = query

  try {
    const ticker = {
      symbol: symbol as string,
      price: 40000 + Math.random() * 5000,
      change24h: (Math.random() - 0.5) * 500,
      changePct24h: (Math.random() - 0.5) * 10,
      high24h: 45000,
      low24h: 39000,
      volume24h: 50000,
      marketCap: 1200000000000,
      updatedAt: Date.now(),
    }

    return {
      symbol,
      source,
      data: ticker,
      timestamp: Date.now(),
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch ticker data',
      data: { error: (error as Error).message },
    })
  }
})
