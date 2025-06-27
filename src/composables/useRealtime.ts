import { ref, onUnmounted, watch } from 'vue'
import { databaseService } from '@/services/databaseService'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeOptions {
  table: string
  filter?: string
  autoSubscribe?: boolean
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onChange?: (payload: any) => void
}

export function useRealtime(options: RealtimeOptions) {
  const {
    table,
    filter,
    autoSubscribe = true,
    onInsert,
    onUpdate,
    onDelete,
    onChange
  } = options

  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const lastEvent = ref<any>(null)
  const channel = ref<RealtimeChannel | null>(null)

  // 订阅实时更新
  const subscribe = () => {
    try {
      error.value = null
      
      const realtimeChannel = databaseService.subscribeToTable(
        table,
        (payload) => {
          lastEvent.value = payload
          
          // 根据事件类型调用相应的回调
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload)
              break
            case 'UPDATE':
              onUpdate?.(payload)
              break
            case 'DELETE':
              onDelete?.(payload)
              break
          }
          
          // 通用回调
          onChange?.(payload)
        },
        filter
      )

      channel.value = realtimeChannel
      isConnected.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '订阅失败'
      isConnected.value = false
    }
  }

  // 取消订阅
  const unsubscribe = () => {
    if (channel.value) {
      databaseService.unsubscribe(channel.value)
      channel.value = null
      isConnected.value = false
    }
  }

  // 重新订阅
  const resubscribe = () => {
    unsubscribe()
    subscribe()
  }

  // 自动订阅
  if (autoSubscribe) {
    subscribe()
  }

  // 组件卸载时自动取消订阅
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    isConnected,
    error,
    lastEvent,
    subscribe,
    unsubscribe,
    resubscribe
  }
}

// 专门用于数据列表的实时同步
export function useRealtimeList<T>(
  table: string,
  initialData: T[] = [],
  options: {
    filter?: string
    keyField?: string
    autoSync?: boolean
  } = {}
) {
  const { filter, keyField = 'id', autoSync = true } = options
  
  const data = ref<T[]>([...initialData])
  const isConnected = ref(false)
  const error = ref<string | null>(null)

  // 添加项目
  const addItem = (item: T) => {
    data.value.unshift(item)
  }

  // 更新项目
  const updateItem = (updatedItem: T) => {
    const index = data.value.findIndex(
      item => (item as any)[keyField] === (updatedItem as any)[keyField]
    )
    if (index !== -1) {
      data.value[index] = updatedItem
    }
  }

  // 删除项目
  const removeItem = (itemId: string) => {
    const index = data.value.findIndex(
      item => (item as any)[keyField] === itemId
    )
    if (index !== -1) {
      data.value.splice(index, 1)
    }
  }

  // 设置数据
  const setData = (newData: T[]) => {
    data.value = [...newData]
  }

  // 清空数据
  const clearData = () => {
    data.value = []
  }

  // 实时同步
  const { subscribe, unsubscribe, resubscribe } = useRealtime({
    table,
    filter,
    autoSubscribe: autoSync,
    onInsert: (payload) => {
      addItem(payload.new)
    },
    onUpdate: (payload) => {
      updateItem(payload.new)
    },
    onDelete: (payload) => {
      removeItem(payload.old[keyField])
    }
  })

  // 监听连接状态
  watch(isConnected, (connected) => {
    isConnected.value = connected
  })

  return {
    data,
    isConnected,
    error,
    addItem,
    updateItem,
    removeItem,
    setData,
    clearData,
    subscribe,
    unsubscribe,
    resubscribe
  }
}

// 用于单个记录的实时同步
export function useRealtimeRecord<T>(
  table: string,
  recordId: string,
  initialData?: T
) {
  const data = ref<T | null>(initialData || null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // 加载数据
  const loadData = async () => {
    try {
      loading.value = true
      error.value = null
      
      const result = await databaseService.query<T>(
        table,
        { filters: { id: recordId }, limit: 1 }
      )
      
      if (result.data.length > 0) {
        data.value = result.data[0]
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载数据失败'
    } finally {
      loading.value = false
    }
  }

  // 更新数据
  const updateData = (newData: Partial<T>) => {
    if (data.value) {
      data.value = { ...data.value, ...newData }
    }
  }

  // 实时同步
  const { subscribe, unsubscribe, resubscribe } = useRealtime({
    table,
    filter: `id=eq.${recordId}`,
    autoSubscribe: true,
    onUpdate: (payload) => {
      data.value = payload.new
    },
    onDelete: () => {
      data.value = null
    }
  })

  // 监听连接状态
  watch(isConnected, (connected) => {
    isConnected.value = connected
  })

  return {
    data,
    isConnected,
    error,
    loading,
    loadData,
    updateData,
    subscribe,
    unsubscribe,
    resubscribe
  }
}

// 用于统计数据的实时同步
export function useRealtimeStats(tables: string[]) {
  const stats = ref<Record<string, any>>({})
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const loading = ref(false)

  // 加载统计数据
  const loadStats = async () => {
    try {
      loading.value = true
      error.value = null
      
      const results = await Promise.all(
        tables.map(async (table) => {
          const tableStats = await databaseService.getTableStats(table)
          return { table, stats: tableStats }
        })
      )

      const newStats: Record<string, any> = {}
      results.forEach(({ table, stats: tableStats }) => {
        newStats[table] = tableStats
      })
      
      stats.value = newStats
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载统计数据失败'
    } finally {
      loading.value = false
    }
  }

  // 更新单个表的统计
  const updateTableStats = async (table: string) => {
    try {
      const tableStats = await databaseService.getTableStats(table)
      stats.value[table] = tableStats
    } catch (err) {
      console.error(`更新 ${table} 统计失败:`, err)
    }
  }

  // 为每个表设置实时监听
  const channels = tables.map(table => {
    return useRealtime({
      table,
      autoSubscribe: true,
      onChange: () => {
        // 延迟更新统计，避免频繁查询
        setTimeout(() => updateTableStats(table), 1000)
      }
    })
  })

  // 初始加载
  loadStats()

  // 清理
  onUnmounted(() => {
    channels.forEach(channel => {
      channel.unsubscribe()
    })
  })

  return {
    stats,
    isConnected,
    error,
    loading,
    loadStats,
    updateTableStats
  }
}

// 连接状态管理
export function useRealtimeConnection() {
  const isOnline = ref(navigator.onLine)
  const connectionQuality = ref<'good' | 'poor' | 'offline'>('good')
  const lastPing = ref<number | null>(null)

  // 检查连接质量
  const checkConnection = async () => {
    try {
      const start = Date.now()
      const { latency } = await databaseService.healthCheck()
      lastPing.value = latency
      
      if (latency < 200) {
        connectionQuality.value = 'good'
      } else if (latency < 1000) {
        connectionQuality.value = 'poor'
      } else {
        connectionQuality.value = 'offline'
      }
    } catch (error) {
      connectionQuality.value = 'offline'
      lastPing.value = null
    }
  }

  // 监听在线状态
  const handleOnline = () => {
    isOnline.value = true
    checkConnection()
  }

  const handleOffline = () => {
    isOnline.value = false
    connectionQuality.value = 'offline'
  }

  // 添加事件监听
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 定期检查连接
  const interval = setInterval(checkConnection, 30000) // 每30秒检查一次

  // 清理
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    clearInterval(interval)
  })

  // 初始检查
  checkConnection()

  return {
    isOnline,
    connectionQuality,
    lastPing,
    checkConnection
  }
}
