import { supabase, TABLES, REALTIME_CHANNELS } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  searchFields?: string[]
}

export interface QueryResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export interface CacheOptions {
  ttl?: number // 缓存时间（毫秒）
  key?: string // 自定义缓存键
}

class DatabaseService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private realtimeChannels = new Map<string, RealtimeChannel>()

  // 通用查询方法
  async query<T>(
    table: string,
    options: QueryOptions = {},
    cacheOptions?: CacheOptions
  ): Promise<QueryResult<T>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {},
      search,
      searchFields = []
    } = options

    // 生成缓存键
    const cacheKey = cacheOptions?.key || this.generateCacheKey(table, options)
    
    // 检查缓存
    if (cacheOptions?.ttl) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    try {
      let query = supabase.from(table).select('*', { count: 'exact' })

      // 应用过滤器
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // 应用搜索
      if (search && searchFields.length > 0) {
        const searchConditions = searchFields
          .map(field => `${field}.ilike.%${search}%`)
          .join(',')
        query = query.or(searchConditions)
      }

      // 应用排序
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // 应用分页
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      const result: QueryResult<T> = {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > page * limit
      }

      // 缓存结果
      if (cacheOptions?.ttl) {
        this.setCache(cacheKey, result, cacheOptions.ttl)
      }

      return result
    } catch (error) {
      console.error(`查询 ${table} 失败:`, error)
      throw error
    }
  }

  // 创建记录
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error

      // 清除相关缓存
      this.clearCacheByPattern(table)

      return result
    } catch (error) {
      console.error(`创建 ${table} 记录失败:`, error)
      throw error
    }
  }

  // 更新记录
  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // 清除相关缓存
      this.clearCacheByPattern(table)

      return result
    } catch (error) {
      console.error(`更新 ${table} 记录失败:`, error)
      throw error
    }
  }

  // 删除记录
  async delete(table: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error

      // 清除相关缓存
      this.clearCacheByPattern(table)
    } catch (error) {
      console.error(`删除 ${table} 记录失败:`, error)
      throw error
    }
  }

  // 批量操作
  async batchCreate<T>(table: string, data: Partial<T>[]): Promise<T[]> {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()

      if (error) throw error

      // 清除相关缓存
      this.clearCacheByPattern(table)

      return result || []
    } catch (error) {
      console.error(`批量创建 ${table} 记录失败:`, error)
      throw error
    }
  }

  async batchUpdate<T>(table: string, updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    try {
      const results = await Promise.all(
        updates.map(({ id, data }) => this.update<T>(table, id, data))
      )

      return results
    } catch (error) {
      console.error(`批量更新 ${table} 记录失败:`, error)
      throw error
    }
  }

  async batchDelete(table: string, ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids)

      if (error) throw error

      // 清除相关缓存
      this.clearCacheByPattern(table)
    } catch (error) {
      console.error(`批量删除 ${table} 记录失败:`, error)
      throw error
    }
  }

  // 实时订阅
  subscribeToTable(
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ): RealtimeChannel {
    const channelName = `${table}-${Date.now()}`
    
    let channel = supabase.channel(channelName)
    
    if (filter) {
      channel = channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter
      }, callback)
    } else {
      channel = channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table
      }, callback)
    }

    channel.subscribe()
    this.realtimeChannels.set(channelName, channel)

    return channel
  }

  // 取消订阅
  unsubscribe(channel: RealtimeChannel | string): void {
    if (typeof channel === 'string') {
      const ch = this.realtimeChannels.get(channel)
      if (ch) {
        ch.unsubscribe()
        this.realtimeChannels.delete(channel)
      }
    } else {
      channel.unsubscribe()
    }
  }

  // 取消所有订阅
  unsubscribeAll(): void {
    this.realtimeChannels.forEach(channel => {
      channel.unsubscribe()
    })
    this.realtimeChannels.clear()
  }

  // 缓存管理
  private generateCacheKey(table: string, options: QueryOptions): string {
    return `${table}:${JSON.stringify(options)}`
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private clearCacheByPattern(pattern: string): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.cache.delete(key)
    })
  }

  // 清除所有缓存
  clearAllCache(): void {
    this.cache.clear()
  }

  // 获取缓存统计
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // 健康检查
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const start = Date.now()
    
    try {
      await supabase.from(TABLES.CATEGORIES).select('id').limit(1)
      const latency = Date.now() - start
      
      return {
        status: 'healthy',
        latency
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start
      }
    }
  }

  // 获取表统计信息
  async getTableStats(table: string): Promise<{
    totalCount: number
    recentCount: number
    lastUpdated: string | null
  }> {
    try {
      // 总数
      const { count: totalCount } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      // 最近24小时的数量
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const { count: recentCount } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

      // 最后更新时间
      const { data: lastRecord } = await supabase
        .from(table)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      return {
        totalCount: totalCount || 0,
        recentCount: recentCount || 0,
        lastUpdated: lastRecord?.updated_at || null
      }
    } catch (error) {
      console.error(`获取 ${table} 统计信息失败:`, error)
      throw error
    }
  }
}

// 导出单例实例
export const databaseService = new DatabaseService()
export default databaseService
