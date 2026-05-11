// app/stores/market.ts
// Market data cache store (runtime only, no persistence)

import { defineStore } from 'pinia'
import type { Bar } from '~/types'

interface TickerData {
  symbol: string
  price: number
  change24h: number
  changePct24h: number
  high24h: number
  low24h: number
  volume24h: number
  marketCap?: number
  updatedAt: number
}

interface OrderBook {
  symbol: string
  bids: [price: number, size: number][]
  asks: [price: number, size: number][]
  spread: number
  spreadPct: number
  updatedAt: number
}

// Ring buffer for fixed-size candle storage (max 5000)
class RingBuffer<T> {
  private buffer: (T | undefined)[] = []
  private head = 0
  private size = 0

  constructor(private maxSize: number) {
    this.buffer = new Array(maxSize)
  }

  push(item: T) {
    this.buffer[this.head] = item
    this.head = (this.head + 1) % this.maxSize
    if (this.size < this.maxSize) this.size++
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.size; i++) {
      const idx = (this.head - this.size + i + this.maxSize) % this.maxSize
      const val = this.buffer[idx]
      if (val !== undefined) result.push(val)
    }
    return result
  }

  last(): T | undefined {
    return this.size > 0 ? this.buffer[(this.head - 1 + this.maxSize) % this.maxSize] : undefined
  }

  clear() {
    this.buffer = new Array(this.maxSize)
    this.head = 0
    this.size = 0
  }

  get length() {
    return this.size
  }
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    candles: new Map<string, RingBuffer<Bar>>(),
    tickers: new Map<string, TickerData>(),
    orderbooks: new Map<string, OrderBook>(),
  }),

  actions: {
    setCandleBuffer(key: string, candles: Bar[]) {
      const buffer = new RingBuffer<Bar>(5000)
      candles.forEach(c => buffer.push(c))
      this.candles.set(key, buffer)
    },

    updateCandle(key: string, candle: Bar) {
      let buffer = this.candles.get(key)
      if (!buffer) {
        buffer = new RingBuffer<Bar>(5000)
        this.candles.set(key, buffer)
      }
      buffer.push(candle)
    },

    setTicker(symbol: string, ticker: TickerData) {
      this.tickers.set(symbol, ticker)
    },

    updateOrderBook(symbol: string, orderbook: OrderBook) {
      this.orderbooks.set(symbol, orderbook)
    },
  },

  getters: {
    getCandles: (state) => (symbol: string, timeframe: string) => {
      const key = `${symbol}:${timeframe}`
      return state.candles.get(key)?.toArray() ?? []
    },

    getTicker: (state) => (symbol: string) => {
      return state.tickers.get(symbol)
    },

    getOrderBook: (state) => (symbol: string) => {
      return state.orderbooks.get(symbol)
    },
  },
})
