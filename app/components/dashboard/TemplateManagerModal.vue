<!-- components/dashboard/TemplateManagerModal.vue -->
<script setup lang="ts">
const emit          = defineEmits<{ (e: 'close'): void }>()
const templateStore = useTemplateStore()
const layoutStore   = useLayoutStore()
const showSave      = ref(false)
const confirmDelete = ref<string | null>(null)

function applyTemplate(id: string) {
  const layout = templateStore.applyTemplate(id)
  if (layout) {
    // Regen IDs to avoid key conflicts
    const fresh = layout.map(w => ({ ...w, i: `${w.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }))
    layoutStore.updateLayout(fresh)
    emit('close')
  }
}

function deleteTemplate(id: string) {
  templateStore.deleteTemplate(id)
  confirmDelete.value = null
}

function formatDate(ts: number) {
  if (!ts) return 'Built-in'
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px)"
    @click.self="emit('close')"
    >
      <div
        class="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style="background: var(--bg-secondary);
               border: 1px solid var(--border-color);
               max-height: 90vh"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 shrink-0"
             style="border-bottom: 1px solid var(--border-color)">
          <span class="font-bold font-mono" style="color: var(--text-primary)">
            🗂 Layout Templates
          </span>
          <div class="flex gap-2">
            <button
              @click="showSave = true"
              class="tt-btn tt-btn-active"
            >💾 Save Current</button>
            <button @click="emit('close')" class="tt-btn w-7 px-0 justify-center">✕</button>
          </div>
        </div>

        <!-- Template Grid -->
        <div class="overflow-y-auto p-4" style="max-height: calc(90vh - 64px)">

          <!-- Section: Default templates -->
          <div class="text-xs font-bold font-mono uppercase tracking-wide mb-3"
               style="color: var(--text-muted)">
            Built-in Templates
          </div>
          <div class="grid grid-cols-2 gap-2 mb-5">
            <div
              v-for="tpl in templateStore.allTemplates.filter(t => t.isDefault)"
              :key="tpl.id"
              class="relative rounded-lg p-3 cursor-pointer transition-all group"
              :style="templateStore.activeTemplateId === tpl.id
                ? 'background: rgba(88,166,255,0.1); border: 1px solid var(--ind-sma)'
                : 'background: var(--bg-tertiary); border: 1px solid var(--border-subtle)'"
              @click="applyTemplate(tpl.id)"
            >
              <!-- Active badge -->
              <div
                v-if="templateStore.activeTemplateId === tpl.id"
                class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style="background: rgba(88,166,255,0.2); color: var(--ind-sma)"
              >Active</div>

              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-xl">{{ tpl.icon }}</span>
                <span class="font-bold text-sm font-mono"
                      style="color: var(--text-primary)">
                  {{ tpl.name }}
                </span>
              </div>
              <div class="text-xs mb-2" style="color: var(--text-muted)">
                {{ tpl.description }}
              </div>
              <!-- Widget list -->
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="w in tpl.layout"
                  :key="w.i"
                  class="text-[10px] px-1 py-0.5 rounded"
                  style="background: var(--bg-secondary);
                         color: var(--text-muted)"
                >{{ w.type }}</span>
              </div>
              <!-- Apply button on hover -->
              <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="text-[11px] font-bold text-center py-1 rounded"
                     style="background: rgba(88,166,255,0.15);
                            color: var(--ind-sma)">
                  Click to Apply →
                </div>
              </div>
            </div>
          </div>

          <!-- Section: User templates -->
          <div v-if="templateStore.userTemplates.length">
            <div class="text-xs font-bold font-mono uppercase tracking-wide mb-3"
                 style="color: var(--text-muted)">
              My Templates ({{ templateStore.userTemplates.length }})
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="tpl in templateStore.userTemplates"
                :key="tpl.id"
                class="relative rounded-lg p-3 transition-all group"
                :style="templateStore.activeTemplateId === tpl.id
                  ? 'background: rgba(88,166,255,0.1); border: 1px solid var(--ind-sma)'
                  : 'background: var(--bg-tertiary); border: 1px solid var(--border-subtle)'"
              >
                <!-- Delete confirm -->
                <div
                  v-if="confirmDelete === tpl.id"
                  class="absolute inset-0 z-20 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5"
                  style="background: rgba(0,0,0,0.8)"
                >
                  <span class="text-xs font-mono mb-0.5" style="color: var(--text-muted)">
                    Are you sure?
                  </span>
                  <button
                    @click.stop="deleteTemplate(tpl.id)"
                    class="text-xs font-bold px-2 py-1 rounded"
                    style="background: var(--bearish); color: white"
                  >Yes, delete</button>
                  <button
                    @click.stop="confirmDelete = null"
                    class="text-xs px-2 py-1 rounded"
                    style="background: var(--bg-secondary); color: var(--text-secondary)"
                  >Cancel</button>
                </div>

                <div @click.stop="applyTemplate(tpl.id)" class="cursor-pointer">
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-xl">{{ tpl.icon }}</span>
                    <span class="font-bold text-sm font-mono"
                          style="color: var(--text-primary)">
                      {{ tpl.name }}
                    </span>
                  </div>
                  <div class="text-xs mb-2" style="color: var(--text-muted)">
                    {{ tpl.description }}
                  </div>
                  <!-- Widget list -->
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="w in tpl.layout"
                      :key="w.i"
                      class="text-[10px] px-1 py-0.5 rounded"
                      style="background: var(--bg-secondary);
                             color: var(--text-muted)"
                    >{{ w.type }}</span>
                  </div>
                </div>

                <!-- Actions on hover -->
                <div class="mt-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="applyTemplate(tpl.id)"
                    class="flex-1 text-[10px] font-bold py-1 rounded transition-colors"
                    :style="templateStore.activeTemplateId === tpl.id
                      ? 'background: rgba(88,166,255,0.2); color: var(--ind-sma)'
                      : 'background: var(--bg-secondary); color: var(--text-secondary)'"
                  >
                    {{ templateStore.activeTemplateId === tpl.id ? 'Active' : 'Apply' }}
                  </button>
                  <button
                    @click.stop="confirmDelete = tpl.id"
                    class="w-6 h-6 justify-center text-[11px]"
                    style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
                    title="Delete"
                  >🗑</button>
                </div>

              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="templateStore.allTemplates.length === 0" class="p-4 text-center">
            <div class="text-3xl mb-2">🗄</div>
            <div class="text-sm" style="color: var(--text-muted)">
              No templates yet. Save your first layout to start!
            </div>
          </div>

        </div>

      </div>
    

    <!-- Save Modal -->
    <Teleport to="body">
      <DashboardSaveTemplateModal
        v-if="showSave"
        :current-layout="layoutStore.currentLayout"
        @close="showSave = false"
      />
    </Teleport>

  </div>
</template>