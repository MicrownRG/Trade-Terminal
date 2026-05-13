import type { WidgetItem } from '~/types'

export type TopbarButton = 'lock' | 'reset' | 'templates' | 'widget' | 'theme' | 'search'

// ── Layout scaling ─────────────────────────────────────────

export const LAYOUT_BASE_COLS = 24

/**
 * Scale a 24-column layout to fit `targetCols` while keeping
 * widgets side-by-side (no stacking). Items at the same starting-y
 * are processed left-to-right and each is pushed past its left
 * neighbour so rounding never creates overlaps.
 */
export function scaleLayout(
  src: WidgetItem[],
  targetCols: number,
  minW: number,
): WidgetItem[] {
  if (targetCols === LAYOUT_BASE_COLS) return src
  const factor = targetCols / LAYOUT_BASE_COLS
  const sorted = [...src].sort((a, b) => a.y - b.y || a.x - b.x)
  const rowRight: Record<number, number> = {}
  const result = sorted.map(item => {
    const scaledX = Math.floor(item.x * factor)
    const scaledW = Math.max(minW, Math.ceil(item.w * factor))
    const prevRight = rowRight[item.y] ?? 0
    const x = Math.min(Math.max(scaledX, prevRight), targetCols - minW)
    const w = Math.min(scaledW, targetCols - x)
    rowRight[item.y] = x + w
    return { ...item, x, w }
  })
  return src.map(orig => result.find(r => r.i === orig.i)!)
}

// ── Pure helpers (unit-testable) ───────────────────────────

export function getGridCols(width: number): number {
  if (width >= 1024) return 24
  if (width >= 640)  return 12
  return 6
}

export function getGridMargin(width: number): [number, number] {
  if (width >= 1024) return [4, 4]
  if (width >= 640)  return [3, 3]
  return [2, 2]
}

export function getGridMinW(width: number): number {
  if (width >= 1024) return 3
  if (width >= 640)  return 2
  return 1
}

export function getGridMinH(width: number): number {
  if (width >= 1024) return 4
  return 3
}

export function isTopbarButtonVisible(button: TopbarButton, width: number): boolean {
  if (width >= 1024) return true           // desktop: semua tampil
  if (width >= 640)  return button !== 'reset'  // tablet: hide reset only
  // mobile (<640): hanya lock, widget, theme
  return button === 'lock' || button === 'widget' || button === 'theme'
}

// ── Reactive composable (used in components) ───────────────

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)

  if (typeof window !== 'undefined') {
    const update = () => { width.value = window.innerWidth }
    window.addEventListener('resize', update, { passive: true })
    onUnmounted(() => window.removeEventListener('resize', update))
  }

  const isMobile  = computed(() => width.value < 1024)
  const isTablet  = computed(() => false)   // tablet now treated as mobile (tab UI)
  const isDesktop = computed(() => width.value >= 1024)

  const gridCols   = computed(() => getGridCols(width.value))
  const gridMargin = computed(() => getGridMargin(width.value))
  const gridMinW   = computed(() => getGridMinW(width.value))
  const gridMinH   = computed(() => getGridMinH(width.value))

  const showButton = (btn: TopbarButton) => isTopbarButtonVisible(btn, width.value)

  return { width, isMobile, isTablet, isDesktop, gridCols, gridMargin, gridMinW, gridMinH, showButton }
}
