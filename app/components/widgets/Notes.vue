<!-- components/widgets/Notes.vue -->
<script setup lang="ts">
const chartStore = useChartStore()

interface Note {
  id:        string
  symbol:    string
  content:   string
  createdAt: number
  pinned:    boolean
}

const notes      = ref<Note[]>([])
const newContent = ref('')
const filterSym  = ref(false)

const filteredNotes = computed(() => {
  const list = filterSym.value
    ? notes.value.filter(n => n.symbol === chartStore.symbol)
    : notes.value
  return [...list].sort((a, b) =>
    (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt,
  )
})

function addNote() {
  const content = newContent.value.trim()
  if (!content) return
  notes.value.push({
    id:        Date.now().toString(),
    symbol:    chartStore.symbol,
    content,
    createdAt: Date.now(),
    pinned:    false,
  })
  newContent.value = ''
  saveNotes()
}

function deleteNote(id: string) {
  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
}

function togglePin(id: string) {
  const note = notes.value.find(n => n.id === id)
  if (note) { note.pinned = !note.pinned; saveNotes() }
}

function saveNotes() {
  localStorage.setItem('tt-notes', JSON.stringify(notes.value))
}

onMounted(() => {
  const raw = localStorage.getItem('tt-notes')
  if (raw) notes.value = JSON.parse(raw)
})

function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function noteHover(e: MouseEvent, pinned: boolean) {
  const el = e.currentTarget as HTMLElement | null
  if (el) el.style.background = pinned ? 'rgba(88,166,255,0.08)' : 'var(--bg-hover)'
}
function noteLeave(e: MouseEvent, pinned: boolean) {
  const el = e.currentTarget as HTMLElement | null
  if (el) el.style.background = pinned ? 'rgba(88,166,255,0.05)' : 'transparent'
}
</script>

<template>
  <div class="flex flex-col h-full font-mono text-xs overflow-hidden"
       style="background: var(--chart-bg)">

    <!-- Header -->
    <div class="tt-widget-header">
      <span class="font-bold" style="color: var(--text-primary)">📝 Notes</span>
      <button
        @click="filterSym = !filterSym"
        class="tt-btn text-[10px] px-1.5 ml-auto"
        :class="filterSym ? 'tt-btn-active' : ''"
        :title="filterSym ? 'Show all notes' : 'Filter by symbol'"
      >
        {{ filterSym ? chartStore.symbol : 'All' }}
      </button>
    </div>

    <!-- Input -->
    <div class="p-2 shrink-0"
         style="border-bottom: 1px solid var(--border-color)">
      <div class="flex gap-1">
        <textarea
          v-model="newContent"
          placeholder="Write a note... (Enter to save)"
          rows="2"
          @keydown.enter.prevent="addNote()"
          class="tt-input flex-1 resize-none py-1 leading-relaxed h-auto"
          style="min-height: 44px"
        />
        <button
          @click="addNote()"
          class="tt-btn tt-btn-active w-8 justify-center px-0 self-stretch"
        >+</button>
      </div>
      <div class="text-[10px] mt-1" style="color: var(--text-muted)">
        Enter to save · {{ chartStore.symbol }}
      </div>
    </div>

    <!-- Notes List -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        class="group p-2 transition-colors"
        style="border-bottom: 1px solid var(--border-subtle)"
        :style="{ background: note.pinned ? 'rgba(88,166,255,0.05)' : 'transparent' }"
        @mouseover="noteHover($event, note.pinned)"
        @mouseleave="noteLeave($event, note.pinned)"
      >
        <!-- Meta row -->
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-[10px] px-1 py-0.5 rounded"
                style="background: var(--bg-tertiary); color: var(--text-muted)">
            {{ note.symbol }}
          </span>
          <span class="text-[10px]" style="color: var(--text-muted)">
            {{ formatTime(note.createdAt) }}
          </span>
          <div class="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click="togglePin(note.id)"
              class="tt-btn w-5 h-5 px-0 justify-center text-[11px]"
              :style="note.pinned ? 'color: var(--ind-sma)' : ''"
              title="Pin note"
            >📌</button>
            <button
              @click="deleteNote(note.id)"
              class="tt-btn w-5 h-5 px-0 justify-center"
              style="color: var(--bearish)"
              title="Delete"
            >✕</button>
          </div>
        </div>
        <!-- Content -->
        <div class="leading-relaxed whitespace-pre-wrap break-words"
             style="color: var(--text-primary)">
          {{ note.content }}
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredNotes.length === 0"
           class="flex flex-col items-center justify-center h-32 gap-2"
           style="color: var(--text-muted)">
        <span class="text-2xl">📝</span>
        <span>No notes yet</span>
      </div>
    </div>

  </div>
</template>