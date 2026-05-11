<!-- components/widgets/TokenLaunch.vue -->
<template>
  <div class="token-launch-widget">
    <div class="header">
      <h3>Token Launches</h3>
      <div class="filters">
        <select v-model="chainFilter" class="filter-select">
          <option value="">All Chains</option>
          <option value="ETH">Ethereum</option>
          <option value="BSC">BSC</option>
          <option value="SOL">Solana</option>
        </select>
      </div>
    </div>

    <div class="tokens-table">
      <div class="table-header">
        <div class="col-name">Token</div>
        <div class="col-symbol">Symbol</div>
        <div class="col-chain">Chain</div>
        <div class="col-date">Launch Date</div>
        <div class="col-price">Price</div>
        <div class="col-change">24h Change</div>
      </div>

      <div class="table-body">
        <div v-for="token in filteredTokens" :key="token.id" class="table-row">
          <div class="col-name">
            <div class="token-name">{{ token.name }}</div>
            <div class="new-badge" v-if="token.isNew">🆕 NEW</div>
          </div>
          <div class="col-symbol">{{ token.symbol }}</div>
          <div class="col-chain">{{ token.chain }}</div>
          <div class="col-date">{{ formatDate(token.launchDate) }}</div>
          <div class="col-price">${{ token.price.toFixed(6) }}</div>
          <div :class="['col-change', token.change > 0 ? 'positive' : 'negative']">
            {{ token.change > 0 ? '+' : '' }}{{ token.change.toFixed(2) }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Token {
  id: string
  name: string
  symbol: string
  chain: string
  launchDate: number
  price: number
  change: number
  isNew: boolean
}

const chainFilter = ref('')

const tokens = ref<Token[]>([
  {
    id: '1',
    name: 'Alpha Token',
    symbol: 'ALPHA',
    chain: 'ETH',
    launchDate: Date.now() - 12 * 60 * 60 * 1000,
    price: 0.000234,
    change: 156.8,
    isNew: true,
  },
  {
    id: '2',
    name: 'Beta Coin',
    symbol: 'BETA',
    chain: 'BSC',
    launchDate: Date.now() - 48 * 60 * 60 * 1000,
    price: 0.00567,
    change: -12.5,
    isNew: false,
  },
  {
    id: '3',
    name: 'Gamma Protocol',
    symbol: 'GAMMA',
    chain: 'SOL',
    launchDate: Date.now() - 120 * 60 * 60 * 1000,
    price: 0.0234,
    change: 45.3,
    isNew: false,
  },
  {
    id: '4',
    name: 'Delta Finance',
    symbol: 'DELTA',
    chain: 'ETH',
    launchDate: Date.now() - 240 * 60 * 60 * 1000,
    price: 0.1234,
    change: -8.7,
    isNew: false,
  },
])

const filteredTokens = computed(() => {
  if (!chainFilter.value) return tokens.value
  return tokens.value.filter(t => t.chain === chainFilter.value)
})

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffHours < 24) {
    return Math.floor(diffHours) + 'h ago'
  }
  if (diffHours < 168) {
    return Math.floor(diffHours / 24) + 'd ago'
  }
  return date.toLocaleDateString()
}
</script>

<style scoped>
.token-launch-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.filters {
  display: flex;
  gap: 8px;
}

.filter-select {
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 11px;
  cursor: pointer;
}

.tokens-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  font-size: 12px;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 80px 80px 100px 80px 80px;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  font-weight: 600;
  color: var(--text-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 80px 80px 100px 80px 80px;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-subtle);
  align-items: center;
  transition: background-color 150ms;
}

.table-row:hover {
  background: var(--bg-secondary);
}

.col-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-name {
  color: var(--text-primary);
  font-weight: 500;
}

.new-badge {
  font-size: 10px;
  background: rgba(38, 166, 154, 0.2);
  color: var(--bullish);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.col-symbol,
.col-chain,
.col-date,
.col-price {
  color: var(--text-secondary);
}

.col-change {
  font-weight: 500;
}

.col-change.positive {
  color: var(--bullish);
}

.col-change.negative {
  color: var(--bearish);
}
</style>
