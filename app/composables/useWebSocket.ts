// app/composables/useWebSocket.ts
// WebSocket manager with auto-reconnect, ping/pong, and topic-based pub/sub

import { ref, computed } from 'vue'

interface WsMessage {
  type: string
  topic: string
  data: any
}

interface WsOptions {
  url: string
  pingInterval?: number
  reconnectAttempts?: number
  reconnectDelay?: number
}

const wsInstance = ref<WebSocket | null>(null)
const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
const subscriptions = ref<Map<string, Set<(data: any) => void>>>(new Map())
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const baseReconnectDelay = 1000
const pingIntervalId = ref<NodeJS.Timeout | null>(null)

export const useWebSocket = (options: WsOptions) => {
  const { url, pingInterval = 25000, reconnectAttempts: maxAttempts = 5 } = options

  const connect = () => {
    if (typeof window === 'undefined') return

    connectionStatus.value = 'connecting'

    try {
      wsInstance.value = new WebSocket(url)

      wsInstance.value.onopen = () => {
        connectionStatus.value = 'connected'
        reconnectAttempts.value = 0
        console.log('WebSocket connected:', url)
        startPing(pingInterval)
      }

      wsInstance.value.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data)
          const handlers = subscriptions.value.get(message.topic)
          if (handlers) {
            handlers.forEach(handler => handler(message.data))
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      wsInstance.value.onerror = (error) => {
        connectionStatus.value = 'error'
        console.error('WebSocket error:', error)
      }

      wsInstance.value.onclose = () => {
        connectionStatus.value = 'disconnected'
        stopPing()
        attemptReconnect()
      }
    } catch (error) {
      connectionStatus.value = 'error'
      console.error('WebSocket connection error:', error)
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts.value - 1), 30000)
      console.log(`Attempting reconnect (${reconnectAttempts.value}/${maxReconnectAttempts}) in ${delay}ms`)
      setTimeout(connect, delay)
    }
  }

  const startPing = (interval: number) => {
    pingIntervalId.value = setInterval(() => {
      if (wsInstance.value?.readyState === WebSocket.OPEN) {
        wsInstance.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, interval)
  }

  const stopPing = () => {
    if (pingIntervalId.value) {
      clearInterval(pingIntervalId.value)
      pingIntervalId.value = null
    }
  }

  const subscribe = (topic: string, handler: (data: any) => void) => {
    if (!subscriptions.value.has(topic)) {
      subscriptions.value.set(topic, new Set())
    }
    subscriptions.value.get(topic)!.add(handler)

    return () => {
      const handlers = subscriptions.value.get(topic)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          subscriptions.value.delete(topic)
        }
      }
    }
  }

  const send = (message: WsMessage) => {
    if (wsInstance.value?.readyState === WebSocket.OPEN) {
      wsInstance.value.send(JSON.stringify(message))
    }
  }

  const disconnect = () => {
    stopPing()
    if (wsInstance.value) {
      wsInstance.value.close()
      wsInstance.value = null
    }
    connectionStatus.value = 'disconnected'
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    subscribe,
    send,
    status: computed(() => connectionStatus.value),
    isConnected: computed(() => connectionStatus.value === 'connected'),
  }
}
