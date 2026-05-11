// composables/useKeyboard.ts — global keyboard shortcuts
export function useKeyboard() {
  const chartStore  = useChartStore()
  const layoutStore = useLayoutStore()

  // Tool hotkeys: key → DrawingTool
  const toolKeys: Record<string, any> = {
    a: 'TrendLine',
    h: 'HorizontalLine',
    v: 'VerticalLine',
    r: 'Rectangle',
    t: 'TextAnnotation',
    f: 'FibRetracement',
    Escape: 'select',
  }

  // Timeframe hotkeys: 1-9
  const tfKeys: Record<string, string> = {
    '1': '1m', '2': '5m', '3': '15m', '4': '30m',
    '5': '1h', '6': '4h', '7': '1d', '8': '1w',
  }

  function onKeyDown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement)?.tagName
    // Don't capture when typing in inputs
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    // Ctrl combos
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') { e.preventDefault(); layoutStore.saveToLocal() }
      if (e.key === 'l') { e.preventDefault(); layoutStore.toggleLock() }
      return
    }

    // Tool hotkeys
    if (toolKeys[e.key]) {
      e.preventDefault()
      chartStore.setActiveTool(toolKeys[e.key])
      return
    }

    // Timeframe hotkeys
    if (tfKeys[e.key]) {
      e.preventDefault()
      chartStore.setTimeframe(tfKeys[e.key]!)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}
