import type { PerformanceMetrics, PerformanceConfig } from '@/types/performance'

/**
 * 性能监控服务
 * 用于收集和分析应用性能数据
 */
class PerformanceService {
  private metrics: PerformanceMetrics[] = []
  private config: PerformanceConfig = {
    enableAutoTracking: true,
    sampleRate: 0.1,
    maxMetrics: 1000
  }

  /**
   * 初始化性能服务
   */
  init(config?: Partial<PerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    if (this.config.enableAutoTracking && typeof window !== 'undefined') {
      this.setupAutoTracking()
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, type: 'timing' | 'counter' | 'gauge' = 'timing') {
    if (Math.random() > this.config.sampleRate) return

    const metric: PerformanceMetrics = {
      name,
      value,
      type,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    }

    this.metrics.push(metric)

    // 保持指标数量在限制范围内
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift()
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(filter?: { name?: string; type?: string }) {
    if (!filter) return [...this.metrics]

    return this.metrics.filter(metric => {
      if (filter.name && !metric.name.includes(filter.name)) return false
      if (filter.type && metric.type !== filter.type) return false
      return true
    })
  }

  /**
   * 清空性能指标
   */
  clear() {
    this.metrics = []
  }

  /**
   * 设置自动性能追踪
   */
  private setupAutoTracking() {
    // 页面加载性能
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        const timing = window.performance.timing
        this.recordMetric('page-load', timing.loadEventEnd - timing.navigationStart)
        this.recordMetric('dom-ready', timing.domContentLoadedEventEnd - timing.navigationStart)
        this.recordMetric('first-paint', timing.responseEnd - timing.requestStart)
      })
    }

    // 资源加载性能
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('navigation', entry.duration)
          } else if (entry.entryType === 'resource') {
            this.recordMetric(`resource-${entry.name}`, entry.duration)
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['navigation', 'resource'] })
      } catch (e) {
        console.warn('PerformanceObserver not supported for entryTypes:', e)
      }
    }
  }

  /**
   * 导出性能报告
   */
  exportReport() {
    const report = {
      timestamp: Date.now(),
      config: this.config,
      metrics: this.getMetrics(),
      summary: this.generateSummary()
    }

    return report
  }

  /**
   * 生成性能摘要
   */
  private generateSummary() {
    const timingMetrics = this.getMetrics({ type: 'timing' })
    const counterMetrics = this.getMetrics({ type: 'counter' })

    return {
      totalMetrics: this.metrics.length,
      avgTiming: timingMetrics.reduce((sum, m) => sum + m.value, 0) / (timingMetrics.length || 1),
      totalCounts: counterMetrics.reduce((sum, m) => sum + m.value, 0),
      timeRange: {
        start: Math.min(...this.metrics.map(m => m.timestamp)),
        end: Math.max(...this.metrics.map(m => m.timestamp))
      }
    }
  }
}

// 类型定义
export interface PerformanceMetrics {
  name: string
  value: number
  type: 'timing' | 'counter' | 'gauge'
  timestamp: number
  url: string
}

export interface PerformanceConfig {
  enableAutoTracking: boolean
  sampleRate: number
  maxMetrics: number
}

// 导出单例实例
export const performanceService = new PerformanceService()
export default performanceService
