// server/api/tradeplans.get.ts — Mock trade signal API
// In production: replace with real signal service (webhook, strategy bot, etc.)

interface SignalPlan {
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
  timeframe: string
  confidence: 'low' | 'medium' | 'high'
  tags: string[]
}

const now = Date.now()
const H = 3_600_000

const PLANS: SignalPlan[] = [
  {
    id: 'sig-001',
    createdAt: now - 0.5 * H,
    symbol: 'BTCUSDT',
    direction: 'long',
    status: 'active',
    entry: 97400,
    sl: 95800,
    tp1: 99200,
    tp2: 101500,
    tp3: 105000,
    timeframe: '4h',
    confidence: 'high',
    tags: ['breakout', 'trend-follow', 'high-vol'],
    reason: 'BTC reclaimed the 97k demand zone after a 3-candle rejection at 95.8k. RSI bouncing from 45 on 4H. Volume profile shows thin supply up to 99.2k. EMA-21 acting as dynamic support. Previous ATH of 99.5k acts as magnet. Risk/Reward exceeds 1:3 at TP3.',
    entryImage: '',
    resultImage: '',
    note: 'Watch for rejection at 99k round number. Partial exit 50% at TP1.',
  },
  {
    id: 'sig-002',
    createdAt: now - 2 * H,
    symbol: 'ETHUSDT',
    direction: 'long',
    status: 'active',
    entry: 3120,
    sl: 3040,
    tp1: 3280,
    tp2: 3450,
    tp3: 3620,
    timeframe: '1h',
    confidence: 'medium',
    tags: ['support-bounce', 'accumulation'],
    reason: 'ETH held the 3100 horizontal support with multiple pin bar rejections on 1H. On-chain data shows large wallets accumulating at this level. MACD bullish cross forming on 4H. Funding rates negative (−0.01%) suggesting room for squeeze.',
    entryImage: '',
    resultImage: '',
    note: 'ETH/BTC ratio bottoming — relative strength setup.',
  },
  {
    id: 'sig-003',
    createdAt: now - 4 * H,
    symbol: 'SOLUSDT',
    direction: 'short',
    status: 'win',
    entry: 182.5,
    sl: 188,
    tp1: 174,
    tp2: 168,
    tp3: 160,
    timeframe: '4h',
    confidence: 'high',
    tags: ['resistance', 'overbought', 'divergence'],
    reason: 'SOL failed 3 times to close above 183 resistance. Bearish RSI divergence on 4H (price higher high, RSI lower high). Whale wallets distributing over past 48h per on-chain data. VWAP rejection on 1H.',
    entryImage: '',
    resultImage: '',
    note: 'Target hit. Exited at 174.2.',
    closedAt: now - 1.5 * H,
    pnlPct: 4.66,
  },
  {
    id: 'sig-004',
    createdAt: now - 6 * H,
    symbol: 'BNBUSDT',
    direction: 'long',
    status: 'win',
    entry: 598,
    sl: 585,
    tp1: 618,
    tp2: 635,
    tp3: 650,
    timeframe: '1h',
    confidence: 'medium',
    tags: ['trend-follow', 'ema-bounce'],
    reason: 'BNB bouncing off EMA-50 on 1H with bullish engulfing candle. Binance listing announcements historically pump BNB 5-10%. Volume spike on the bounce candle confirming buyers. SL just below prior swing low at 585.',
    entryImage: '',
    resultImage: '',
    note: 'Clean TP1 hit. Moved SL to breakeven for runners.',
    closedAt: now - 2 * H,
    pnlPct: 3.35,
  },
  {
    id: 'sig-005',
    createdAt: now - 8 * H,
    symbol: 'XRPUSDT',
    direction: 'short',
    status: 'loss',
    entry: 2.45,
    sl: 2.56,
    tp1: 2.28,
    tp2: 2.15,
    tp3: 2.0,
    timeframe: '1h',
    confidence: 'low',
    tags: ['reversal', 'news-driven'],
    reason: 'XRP tested 2.45 resistance with a shooting star candle on 1H. Expected continuation of the downtrend. However, unexpected SEC news reversed the move.',
    entryImage: '',
    resultImage: '',
    note: 'SL hit. News invalidated the setup — acceptable loss.',
    closedAt: now - 5 * H,
    pnlPct: -4.49,
  },
  {
    id: 'sig-006',
    createdAt: now - 10 * H,
    symbol: 'AVAXUSDT',
    direction: 'long',
    status: 'planning',
    entry: 36.5,
    sl: 35.1,
    tp1: 39.0,
    tp2: 41.5,
    tp3: 44.0,
    timeframe: '4h',
    confidence: 'medium',
    tags: ['consolidation-break', 'cup-handle'],
    reason: 'AVAX forming a cup & handle pattern on 4H. Breakout level at 36.5 — waiting for a confirmed close above with volume. EMA-20 crossed above EMA-50 on daily. Risk-defined setup with tight SL below handle low.',
    entryImage: '',
    resultImage: '',
    note: 'Limit order placed at 36.5. Waiting for confirmation.',
  },
  {
    id: 'sig-007',
    createdAt: now - 14 * H,
    symbol: 'DOGEUSDT',
    direction: 'long',
    status: 'planning',
    entry: 0.1820,
    sl: 0.1760,
    tp1: 0.1960,
    tp2: 0.2100,
    tp3: 0.2400,
    timeframe: '1h',
    confidence: 'low',
    tags: ['sentiment', 'social-spike'],
    reason: 'DOGE social volume spiked 320% in 24h. Price holding above 0.18 key level. Historical pattern: social spikes precede 10-30% moves. Low confidence due to meme-driven nature — position sizing reduced to 0.5R.',
    entryImage: '',
    resultImage: '',
    note: 'Speculative play. Half normal size.',
  },
  {
    id: 'sig-008',
    createdAt: now - 20 * H,
    symbol: 'LINKUSDT',
    direction: 'long',
    status: 'breakeven',
    entry: 17.8,
    sl: 17.8,
    tp1: 19.2,
    tp2: 20.5,
    tp3: 22.0,
    timeframe: '4h',
    confidence: 'high',
    tags: ['breakout', 'trend-follow'],
    reason: 'LINK broke out of a 5-day range at 17.5 on strong volume. Closed above resistance. Moved SL to breakeven after TP1 missed by 8 cents and rejected. Exited at entry.',
    entryImage: '',
    resultImage: '',
    note: 'Moved to B/E — no loss, missed TP1 by a few cents.',
    closedAt: now - 8 * H,
    pnlPct: 0,
  },
]

export default defineEventHandler(() => {
  return PLANS
})
