// composables/useNewsData.ts — shared news data source
// In production: replace with real API (Cryptopanic, NewsAPI, etc.)

export interface FullNewsItem {
  id: string
  title: string
  summary: string
  body: string[]        // paragraphs
  image: string
  source: string
  author?: string
  time: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  tags: string[]
}

const NEWS: FullNewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin breaks $70K resistance level with strong volume surge',
    summary: 'Bitcoin surged past the $70,000 mark on Tuesday, driven by a significant spike in trading volume across major exchanges.',
    body: [
      'Bitcoin surged past the $70,000 mark on Tuesday in what analysts are calling one of the most technically significant breakouts of the current bull cycle. The move was accompanied by a 340% spike in spot trading volume on Coinbase, Binance, and OKX combined, suggesting broad-based institutional participation rather than purely retail-driven momentum.',
      'The $70,000 level had acted as a formidable resistance zone for nearly six weeks, with five prior rejections all occurring within $500 of the level. Each failed attempt created a ceiling of supply that market makers had been monitoring closely. Tuesday\'s breakout consumed all of that overhead supply in a single four-hour candle.',
      'On-chain analytics firm Glassnode reported that the number of Bitcoin addresses holding more than 100 BTC increased by 1,200 in the 48 hours preceding the breakout — the largest single two-day accumulation event since November 2023. This suggests significant "smart money" positioning before the public move.',
      '"The confluence of technical signals here is extraordinary," said CryptoQuant senior analyst Min Jung. "We\'re seeing positive divergences on the weekly RSI, a bullish MACD cross on the monthly chart, and miner outflows at their lowest level in 18 months. Historically, when all three align, Bitcoin has gone on to make new all-time highs within 60 days."',
      'Macro headwinds appear to be easing as well. The Federal Reserve\'s latest FOMC minutes suggested a September rate cut remains on the table, reducing the opportunity cost of holding non-yielding assets like Bitcoin. Additionally, the U.S. dollar index (DXY) dropped 0.8% on the day, providing further tailwind for risk assets globally.',
      'Technical targets on the upside include the prior all-time high of $73,777, followed by the psychological round number of $80,000. The weekly closing price will be critical — a close above $70,500 would confirm the breakout and invalidate the bearish scenario of a false breakout and mean reversion.',
    ],
    image: 'https://picsum.photos/seed/1/800/400',
    source: 'CoinDesk',
    author: 'Omkar Godbole',
    time: '2m ago',
    url: '#',
    sentiment: 'positive',
    tags: ['bitcoin', 'breakout', 'institutional', 'on-chain'],
  },
  {
    id: '2',
    title: 'Fed signals potential rate cut in September meeting minutes',
    summary: 'The Federal Reserve released minutes from its latest meeting indicating that members are increasingly open to a rate cut as early as September.',
    body: [
      'Minutes from the Federal Reserve\'s July Federal Open Market Committee (FOMC) meeting, released Wednesday afternoon, revealed that "several members" now believe conditions for a rate cut could materialize as early as the September meeting. The shift in language represents a notable dovish pivot compared to the June minutes, which made no mention of near-term rate reductions.',
      'The core Personal Consumption Expenditures (PCE) price index, the Fed\'s preferred inflation gauge, rose just 2.5% year-over-year in June, down from a peak of 5.6% in 2022 and approaching the Fed\'s 2% target. The labor market, while still resilient, showed signs of cooling with the unemployment rate ticking up to 4.1% in July.',
      '"Inflation is clearly on a downward path and the labor market is coming into better balance," said Fed Governor Christopher Waller in a speech following the minutes release. "I believe the time is approaching when a cut in the policy rate is warranted."',
      'Risk assets responded immediately and positively. The S&P 500 gained 1.2%, the Nasdaq composite surged 1.8%, and Bitcoin jumped 3.4% within the hour of the release. Gold also benefited, reaching a new all-time high of $2,531 per ounce.',
      'Market pricing, reflected in CME FedWatch futures, now assigns a 78% probability to a 25 basis point cut at the September 18 meeting, up from 62% the prior day. A small contingent — approximately 15% — is pricing in a more aggressive 50 basis point cut.',
      'Crypto analysts note that the prior Bitcoin bull cycle was partially fueled by near-zero interest rates, and any return to a more accommodative monetary policy environment could act as a substantial structural tailwind for digital assets. "Rate cuts reduce the discount rate applied to future cash flows, which benefits high-growth and speculative assets most," said Bernstein crypto analyst Gautam Chhugani.',
    ],
    image: 'https://picsum.photos/seed/2/800/400',
    source: 'Reuters',
    author: 'Ann Saphir',
    time: '15m ago',
    url: '#',
    sentiment: 'positive',
    tags: ['macro', 'fed', 'rate-cut', 'risk-on'],
  },
  {
    id: '3',
    title: 'Ethereum gas fees spike amid high network congestion',
    summary: 'Ethereum network congestion reached a six-month high as NFT activity and DeFi bots flooded the mempool.',
    body: [
      'Ethereum\'s mainnet experienced its most severe congestion event in six months on Wednesday, with average gas prices surging to 85 Gwei — equivalent to roughly $12 for a standard token transfer and over $60 for complex DeFi interactions. The congestion was triggered by the simultaneous launch of three high-profile NFT collections and a surge in MEV bot activity.',
      'The primary catalyst was the "Celestial Genesis" NFT drop by artist Beeple, which attracted over 400,000 mint attempts within the first ten minutes. Competing transactions flooded the mempool, with users engaging in priority fee bidding wars that drove gas costs to levels not seen since the 2021 NFT mania.',
      'Layered on top of the NFT activity, MEV (maximal extractable value) bots detected arbitrage opportunities arising from the price dislocations caused by the congestion itself, creating a self-reinforcing feedback loop. On-chain data from Flashbots showed MEV bot revenue exceeding $8 million in a single hour — a record for 2024.',
      'The event highlighted the persistent scalability challenges on Ethereum\'s Layer 1, despite the network\'s transition to proof-of-stake and various optimization upgrades. "EIP-4844 (proto-danksharding) has dramatically reduced L2 fees, but L1 is still vulnerable to congestion during demand spikes," noted Ethereum Foundation researcher Dankrad Feist on X.',
      'Layer-2 networks provided a refuge for users seeking affordable transactions. Arbitrum processed a record 2.1 million transactions during the peak congestion period, while Base and Optimism also saw volume spikes. Average transaction costs on these networks remained below $0.05 throughout.',
      'The episode is likely to strengthen arguments for more aggressive Layer-1 throughput improvements in the upcoming Ethereum roadmap, including full danksharding, which would increase data availability capacity by several orders of magnitude. However, full implementation remains years away.',
    ],
    image: 'https://picsum.photos/seed/3/800/400',
    source: 'The Block',
    author: 'Eden Au',
    time: '32m ago',
    url: '#',
    sentiment: 'negative',
    tags: ['ethereum', 'gas', 'nft', 'layer2'],
  },
  {
    id: '4',
    title: 'SEC approves spot ETH ETF applications from multiple issuers',
    summary: 'The SEC granted approval to several asset managers seeking to launch spot Ethereum ETFs, a historic milestone for the crypto industry.',
    body: [
      'The U.S. Securities and Exchange Commission granted final approval on Thursday to spot Ethereum exchange-traded funds filed by BlackRock, Fidelity, Franklin Templeton, and three other asset managers, clearing the final regulatory hurdle for trading to commence. The ETFs are expected to begin trading on U.S. exchanges as early as next Monday.',
      'The approval follows a similar landmark decision for spot Bitcoin ETFs in January 2024, which attracted over $50 billion in net inflows within six months of launch. Industry participants expect spot Ethereum ETFs to follow a similar trajectory, though with some nuances — most notably the initial absence of staking yields, which represent a meaningful component of Ethereum\'s total return.',
      'BlackRock\'s iShares Ethereum Trust (ETHA) is expected to be the market leader based on pre-launch investor interest. The fund charges a 0.25% annual management fee — slightly higher than its Bitcoin counterpart due to the additional complexity of Ethereum custody. BlackRock has waived the fee entirely for the first 12 months and on the first $2.5 billion in assets.',
      '"This approval validates Ethereum as a mature, institutionally-acceptable asset class," said Coinbase CEO Brian Armstrong in a statement. "We\'re proud to be the custodian for multiple of these funds and look forward to supporting the growth of this market."',
      'Ethereum\'s price surged 8.2% on the news, outperforming Bitcoin on the day. The ETH/BTC ratio, which had been declining for much of 2024, rose sharply and broke a six-month downtrend. Options traders rushed to buy short-term call options, pushing implied volatility to its highest level since March.',
      'Some analysts caution that the staking exclusion may limit appeal for certain investors who had been attracted to Ethereum\'s "productive asset" narrative. The SEC has thus far declined to approve any ETF structure that includes on-chain staking, citing concerns about the regulatory classification of staking rewards. This is likely to be a key battleground in future product filings.',
    ],
    image: 'https://picsum.photos/seed/4/800/400',
    source: 'Bloomberg',
    author: 'Olga Kharif',
    time: '1h ago',
    url: '#',
    sentiment: 'positive',
    tags: ['ethereum', 'etf', 'sec', 'institutional'],
  },
  {
    id: '5',
    title: 'Crypto market sees $200M in liquidations over 24 hours',
    summary: 'A sharp intraday correction wiped out over $200 million in leveraged positions across crypto derivatives markets.',
    body: [
      'Cryptocurrency derivatives markets experienced a violent deleveraging event over the past 24 hours, with Coinglass data showing total liquidations exceeding $200 million across centralized exchanges. The cascade began when Bitcoin dropped 4.2% in under 15 minutes during Asian trading hours, triggering a chain reaction of forced selling in overleveraged long positions.',
      'Long positions accounted for approximately 68% of total liquidations, or roughly $136 million, while short liquidations made up the remaining $68 million. The largest single liquidation event was a $14.2 million Bitcoin long position on Binance, followed by a $9.8 million ETH long on OKX.',
      'Prior to the move, the funding rate on Binance BTCUSDT perpetual futures had reached 0.03% per 8 hours — equivalent to an annualized rate of 32.8%. Such elevated funding rates typically indicate excessive leveraged long positioning and are historically associated with elevated correction risk.',
      '"High funding rates are a classic setup for a long squeeze," said crypto trader and analyst Josh Olszewicz. "When perpetual futures longs are paying that much to shorts, it creates a mechanical pressure point. One significant sell order can trigger a cascade of liquidations that amplify the move far beyond what the fundamental news would justify."',
      'The correction was not driven by any specific bearish catalyst — on-chain fundamentals remain constructive and exchange reserves continue to decline. Analysts characterize the event as a "healthy reset" that reduces speculative excess and creates a more sustainable foundation for the next leg higher.',
      'Order book analysis shows significant buy walls between $94,000 and $95,500 on Bitcoin, which held during the correction and absorbed the selling pressure. The ability to defend this zone will be critical for determining whether the bull market structure remains intact in the near term.',
    ],
    image: 'https://picsum.photos/seed/5/800/400',
    source: 'Coinglass',
    author: 'Staff Writer',
    time: '2h ago',
    url: '#',
    sentiment: 'negative',
    tags: ['liquidations', 'leverage', 'derivatives', 'bitcoin'],
  },
  {
    id: '6',
    title: 'Altcoin season index rises to 72, highest in 3 months',
    summary: 'The Altcoin Season Index climbed to 72 out of 100, signaling broad-based strength in the altcoin market.',
    body: [
      'The CoinMarketCap Altcoin Season Index reached 72 on Thursday, its highest reading since early February and well above the threshold of 75 that defines a full "altcoin season." The index measures the percentage of the top 100 cryptocurrencies (excluding stablecoins and wrapped tokens) that have outperformed Bitcoin over the past 90 days.',
      'At a reading of 72, approximately 72% of major altcoins have beaten Bitcoin\'s performance over the past three months. This represents a significant rotation from earlier in the year, when Bitcoin dominated returns and the index languished below 25 — deep in "Bitcoin Season" territory.',
      'Leading the altcoin surge are sectors with strong narrative momentum. AI-themed tokens including Render (RNDR), Fetch.ai (FET), and Worldcoin (WLD) have each posted gains exceeding 40% over the past 30 days. DeFi protocols benefiting from renewed interest in yield-bearing products — Aave, Uniswap, and Curve — have also significantly outperformed.',
      '"We\'re seeing a classic altcoin rotation pattern," said Messari analyst Ryan Selkis. "Bitcoin breaks out and makes new highs, retail capital flows in, and then those participants seek leverage and higher returns by rotating into altcoins. We saw the same pattern play out in 2017, 2019, and 2021."',
      'However, historical precedent offers a caution: altcoin seasons tend to be short and violent in both directions. When Bitcoin corrects, altcoins typically fall twice as hard. Analysts recommend maintaining Bitcoin as a core position and treating altcoin exposure as a satellite allocation with strict risk management.',
      'The index would need to reach 75 to officially declare altcoin season. Given the current momentum, several analysts believe that threshold could be crossed within the next two to three weeks, particularly if Bitcoin can consolidate above $70,000 and provide a stable base for capital rotation.',
    ],
    image: 'https://picsum.photos/seed/6/800/400',
    source: 'CryptoQuant',
    author: 'Julio Moreno',
    time: '3h ago',
    url: '#',
    sentiment: 'positive',
    tags: ['altcoin', 'rotation', 'market-cycle', 'defi'],
  },
  {
    id: '7',
    title: 'Tether USDT supply surpasses $110B milestone',
    summary: 'Tether\'s USDT stablecoin crossed the $110 billion supply milestone, cementing its dominance as the largest stablecoin.',
    body: [
      'Tether\'s USDT stablecoin supply officially crossed $110 billion on Thursday, according to on-chain data aggregated by The Block. The milestone represents a 28% increase from the $86 billion supply recorded at the start of 2024 and underscores the continued growth in stablecoin adoption as the preferred medium for crypto market participants.',
      'The growth in USDT supply is widely regarded as a leading indicator of crypto market inflows, as new USDT is typically minted when institutions and retail investors wire fiat currency to Tether in exchange for digital dollars. A rising USDT supply therefore suggests fresh capital is entering the ecosystem.',
      'Tether simultaneously published its Q2 2024 attestation report, conducted by accounting firm BDO Italia. The report confirms that Tether\'s reserves exceed its outstanding liabilities by approximately $5.2 billion — a record surplus. Reserves are primarily held in U.S. Treasury bills ($97 billion), with smaller allocations to money market funds, gold, and Bitcoin.',
      '"The attestation provides a meaningful level of assurance about Tether\'s backing," said Georgetown University law professor Rohan Grey, though he added that a full audit from a major accounting firm would provide even greater confidence. Tether has historically resisted calls for a traditional audit, citing operational and legal concerns.',
      'Competitors Circle (USDC) and PayPal (PYUSD) continue to grow but remain significantly smaller. USDC supply stands at approximately $34 billion, while PYUSD has reached $700 million. Tether controls roughly 68% of the total stablecoin market by supply, a share that has been remarkably stable despite regulatory uncertainty in previous years.',
      'The milestone arrives as U.S. stablecoin legislation appears to be making progress in Congress. The bipartisan "GENIUS Act," which would establish a federal regulatory framework for payment stablecoins, passed the Senate Banking Committee in March and is awaiting a floor vote. Clear regulation is expected to accelerate stablecoin adoption by traditional financial institutions.',
    ],
    image: 'https://picsum.photos/seed/7/800/400',
    source: 'CoinGecko',
    author: 'Liam Kelly',
    time: '4h ago',
    url: '#',
    sentiment: 'neutral',
    tags: ['tether', 'usdt', 'stablecoin', 'regulation'],
  },
]

export function useNewsData() {
  function getAll() { return NEWS }
  function getById(id: string) { return NEWS.find(n => n.id === id) ?? null }
  function getCategories() {
    const tags = new Set<string>()
    NEWS.forEach(n => n.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }
  return { getAll, getById, getCategories }
}
