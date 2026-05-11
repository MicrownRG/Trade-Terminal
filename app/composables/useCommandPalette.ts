// composables/useCommandPalette.ts — shared palette state
const _open = ref(false)

export function useCommandPalette() {
  return {
    isOpen:  _open,
    open:    () => { _open.value = true },
    close:   () => { _open.value = false },
    toggle:  () => { _open.value = !_open.value },
  }
}
