<!-- components/dashboard/SaveTemplateModal.vue -->
<script setup lang="ts">
import type { WidgetItem } from '~/types'

const props = defineProps<{ currentLayout: WidgetItem[] }>()
const emit  = defineEmits<{ (e: 'close'): void }>()

const templateStore = useTemplateStore()

const form = reactive({
  name:        '',
  description: '',
  icon:        '📊',
})

const ICONS = ['📊','📈','📉','⚡','🔥','💎','🎯','🛡','🔬','🌊','⭐','🚀']

const isSaving  = ref(false)
const savedId   = ref<string | null>(null)

async function save() {
  if (!form.name.trim()) return
  isSaving.value = true

  await new Promise(r => setTimeout(r, 300)) // UX feedback

  savedId.value = templateStore.saveCurrentAsTemplate(
    form.name.trim(),
    form.description.trim(),
    form.icon,
    props.currentLayout,
  )

  isSaving.value = false
}

function done() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px)"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style="background: var(--bg-secondary);
               border: 1px solid var(--border-color)"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4"
             style="border-bottom: 1px solid var(--border-color)">
          <span class="font-bold font-mono" style="color: var(--text-primary)">
            💾 Save as Template
          </span>
          <button @click="emit('close')" class="tt-btn w-7 px-0 justify-center">✕</button>
        </div>

        <!-- Success state -->
        <div v-if="savedId" class="p-6 text-center flex flex-col items-center gap-3">
          <div class="text-5xl">✅</div>
          <div class="font-bold font-mono" style="color: var(--text-primary)">
            Template saved!
          </div>
          <div class="text-sm" style="color: var(--text-muted)">
            "{{ form.name }}" has been saved to your templates.
          </div>
          <button @click="done()" class="tt-btn tt-btn-active px-6">
            Done
          </button>
        </div>

        <!-- Form state -->
        <div v-else class="p-5 flex flex-col gap-4">

          <!-- Icon picker -->
          <div>
            <label class="text-xs font-mono mb-2 block"
                   style="color: var(--text-muted)">Icon</label>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="ico in ICONS"
                :key="ico"
                @click="form.icon = ico"
                class="w-8 h-8 rounded text-lg flex items-center justify-center
                       transition-all"
                :style="form.icon === ico
                  ? 'background: rgba(88,166,255,0.2); border: 1px solid var(--ind-sma)'
                  : 'background: var(--bg-tertiary); border: 1px solid transparent'"
              >{{ ico }}</button>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="text-xs font-mono mb-1.5 block"
                   style="color: var(--text-muted)">
              Template Name <span style="color: var(--bearish)">*</span>
            </label>
            <input
              v-model="form.name"
              placeholder="e.g. My Trading Setup"
              class="tt-input w-full"
              @keyup.enter="save()"
              maxlength="50"
              autofocus
            />
          </div>

          <!-- Description -->
          <div>
            <label class="text-xs font-mono mb-1.5 block"
                   style="color: var(--text-muted)">Description</label>
            <input
              v-model="form.description"
              placeholder="Optional description..."
              class="tt-input w-full"
              maxlength="100"
            />
          </div>

          <!-- Widget count info -->
          <div class="rounded p-2.5 text-xs"
               style="background: var(--bg-tertiary);
                      border: 1px solid var(--border-subtle)">
            <div class="font-bold mb-1" style="color: var(--text-secondary)">
              Layout Preview
            </div>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="w in currentLayout"
                :key="w.i"
                class="px-1.5 py-0.5 rounded text-[10px]"
                style="background: var(--bg-secondary);
                       color: var(--text-muted);
                       border: 1px solid var(--border-color)"
              >{{ w.type }}</span>
            </div>
            <div class="mt-1.5 text-[10px]" style="color: var(--text-muted)">
              {{ currentLayout.length }} widget(s) will be saved
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
            <button
              @click="save()"
              :disabled="!form.name.trim() || isSaving"
              class="tt-btn tt-btn-active flex-1 justify-center
                     disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isSaving" class="animate-spin inline-block">⟳</span>
              <span v-else>💾 Save Template</span>
            </button>
            <button @click="emit('close')" class="tt-btn w-20 justify-center">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>