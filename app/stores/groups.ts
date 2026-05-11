// stores/groups.ts — Symbol sync groups for multi-chart layouts
// Group 0 = no group (each chart follows global store or its own pinned symbol)
// Groups 1-5 = linked: changing symbol on one chart updates all charts in same group

import { defineStore } from 'pinia'

export type GroupId = 0 | 1 | 2 | 3 | 4 | 5

export const GROUP_COLORS: Record<GroupId, string> = {
  0: 'var(--text-muted)',
  1: '#4fc3f7',
  2: '#ff9800',
  3: '#4caf50',
  4: '#ce93d8',
  5: '#f48fb1',
}

export const GROUP_LABELS: Record<GroupId, string> = {
  0: '—',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
}

export const useGroupStore = defineStore('groups', {
  state: () => ({
    symbols: {
      1: 'BTCUSDT',
      2: 'BTCUSDT',
      3: 'BTCUSDT',
      4: 'BTCUSDT',
      5: 'BTCUSDT',
    } as Record<number, string>,
  }),

  actions: {
    setGroupSymbol(group: GroupId, symbol: string) {
      if (group < 1 || group > 5) return
      this.symbols[group] = symbol.toUpperCase().trim()
    },

    getGroupSymbol(group: GroupId): string {
      return this.symbols[group] ?? 'BTCUSDT'
    },
  },
})
