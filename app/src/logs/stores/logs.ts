import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { type LogArchiveStatus, type LogLevel, type LogListFilters, type LogListResponse, type LogStreamHandle } from '@anthos/shared'
import { LogEntry } from '@anthos/shared/logs/classes/LogEntry'
import anthos from '@anthos/shared/anthos'

const PAGE_SIZE = 50
const MAX_ENTRIES = 500

const emptyFilter = () => ''

export const useLogStore = defineStore('logs', () => {
  const entries = ref<LogEntry[]>([])
  const nodeId = ref('')
  const source = ref('')
  const level = ref<LogLevel | ''>('')
  const query = ref('')
  const selectedDay = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const archiveStatus = ref<LogArchiveStatus>('available')
  const hasMore = ref(false)
  const historyCursor = ref<string | null>(null)
  const isLive = ref(false)

  let liveHandle: LogStreamHandle | null = null
  let initialized = false

  const visibleCount = computed(() => entries.value.length)
  const isHistorical = computed(() => selectedDay.value !== null)

  function buildFilters(before?: string | null, limit = PAGE_SIZE): LogListFilters {
    return {
      nodeId: nodeId.value.trim() || undefined,
      source: source.value.trim() || undefined,
      level: level.value || undefined,
      q: query.value.trim() || undefined,
      day: selectedDay.value ?? undefined,
      before: before ?? undefined,
      limit,
    }
  }

  function formatDay(day: string | null): string {
    if (!day) return 'Live'
    return day
  }

  function trimEntries(buffer: LogEntry[]): LogEntry[] {
    return buffer.slice(0, MAX_ENTRIES)
  }

  function hydrateEntry(entry: LogEntry): LogEntry {
    const timestamp = typeof entry.timestamp === 'number'
      ? entry.timestamp
      : new Date(entry.timestamp).getTime()

    return new LogEntry({
      id: entry.id,
      timestamp,
      nodeId: entry.nodeId,
      level: entry.level,
      source: entry.source,
      message: entry.message,
      meta: entry.meta,
    })
  }

  function hydrateEntries(buffer: LogEntry[]): LogEntry[] {
    return buffer.map(hydrateEntry)
  }

  function replaceEntries(response: LogListResponse): void {
    entries.value = trimEntries(hydrateEntries(response.items))
    hasMore.value = response.hasMore
    historyCursor.value = response.nextCursor
    archiveStatus.value = response.archiveStatus ?? 'available'
  }

  function mergeLiveEntry(entry: LogEntry): void {
    const hydrated = hydrateEntry(entry)
    const index = entries.value.findIndex(item => item.id === hydrated.id)
    if (index === -1) {
      entries.value = trimEntries([hydrated, ...entries.value])
      return
    }

    const next = [...entries.value]
    next[index] = hydrated
    entries.value = trimEntries(next)
  }

  function disconnectLive(): void {
    liveHandle?.close()
    liveHandle = null
    isLive.value = false
  }

  async function loadCurrentView(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.logs.list(buildFilters())
      replaceEntries(response)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load logs'
    } finally {
      isLoading.value = false
    }
  }

  function connectLive(): void {
    if (selectedDay.value !== null || isLive.value) return

    disconnectLive()

    try {
      liveHandle = anthos.logs.subscribe(buildFilters(), entry => {
        mergeLiveEntry(entry)
      }, () => {
        isLive.value = false
      })
      isLive.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to connect to log stream'
      isLive.value = false
    }
  }

  async function start(): Promise<void> {
    if (!initialized) {
      initialized = true
      await loadCurrentView()
      connectLive()
      return
    }

    if (!isHistorical.value && !isLive.value) {
      connectLive()
    }
  }

  async function reload(): Promise<void> {
    disconnectLive()
    await loadCurrentView()
    connectLive()
  }

  async function loadOlder(): Promise<void> {
    if (!hasMore.value || !historyCursor.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.logs.list(buildFilters(historyCursor.value))
      entries.value = trimEntries([
        ...entries.value,
        ...hydrateEntries(response.items.filter(item => !entries.value.some(existing => existing.id === item.id))),
      ])
      hasMore.value = response.hasMore
      historyCursor.value = response.nextCursor
      archiveStatus.value = response.archiveStatus ?? archiveStatus.value
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load older logs'
    } finally {
      isLoading.value = false
    }
  }

  async function setDay(day: string | null): Promise<void> {
    selectedDay.value = day
    disconnectLive()
    await loadCurrentView()
    if (!isHistorical.value) connectLive()
  }

  async function applyFilters(): Promise<void> {
    await reload()
  }

  async function clearFilters(): Promise<void> {
    nodeId.value = emptyFilter()
    source.value = emptyFilter()
    level.value = ''
    query.value = emptyFilter()
    selectedDay.value = null
    await reload()
  }

  function stop(): void {
    disconnectLive()
  }

  return {
    entries,
    nodeId,
    source,
    level,
    query,
    selectedDay,
    isLoading,
    error,
    archiveStatus,
    hasMore,
    historyCursor,
    isLive,
    visibleCount,
    isHistorical,
    formatDay,
    loadCurrentView,
    loadOlder,
    setDay,
    applyFilters,
    clearFilters,
    start,
    stop,
    connectLive,
    disconnectLive,
  }
})
