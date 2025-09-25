import type {
  PerformanceMetrics as TypePerformanceMetrics,
  PerformanceConfig as TypePerformanceConfig,
} from "@/types/performance";

/**
 * 性能监控服务
 * 用于收集和分析应用性能数据
 */
class PerformanceService {
  private metrics: (TypePerformanceMetrics & { metadata?: Record<string, unknown> })[] = [];
  private config: TypePerformanceConfig = {
    enableAutoTracking: true,
    sampleRate: 0.1,
    maxMetrics: 1000,
  };

  /**
   * 跟踪基础指标
   * @param metricName 指标名称
   * @param value 指标值
   */
  trackMetric(metricName: string, value: number): void {
    this.recordMetric(metricName, value);
  }

  /**
   * 跟踪自定义指标
   * @param metricName 指标名称
   * @param properties 自定义属性
   */
  trackCustomMetric(metricName: string, properties: Record<string, unknown>): void {
    this.recordMetric(metricName, 0, 'counter');
    // 将属性存储到metadata中
    const metric = this.metrics[this.metrics.length - 1];
    if (metric) {
      metric.metadata = properties;
    }
  }

  /**
   * 初始化性能服务
   */
  init(config?: Partial<TypePerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.enableAutoTracking && typeof window !== "undefined") {
      this.setupAutoTracking();
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(
    name: string,
    value: number,
    type: "timing" | "counter" | "gauge" = "timing",
  ) {
    if (Math.random() > this.config.sampleRate) return;

    const metric: TypePerformanceMetrics = {
      name,
      value,
      type,
      timestamp: Date.now(),
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    this.metrics.push(metric);

    // 保持指标数量在限制范围内
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(filter?: { name?: string; type?: string }) {
    if (!filter) return [...this.metrics];

    return this.metrics.filter((metric) => {
      if (filter.name && !metric.name.includes(filter.name)) return false;
      if (filter.type && metric.type !== filter.type) return false;
      return true;
    });
  }

  /**
   * 清空性能指标
   */
  clear() {
    this.metrics = [];
  }

  /**
   * 设置自动性能追踪
   */
  private setupAutoTracking() {
    // 页面加载性能
    if (window.performance && window.performance.timing) {
      window.addEventListener("load", () => {
        const timing = window.performance.timing;
        this.recordMetric(
          "page-load",
          timing.loadEventEnd - timing.navigationStart,
        );
        this.recordMetric(
          "dom-ready",
          timing.domContentLoadedEventEnd - timing.navigationStart,
        );
        this.recordMetric(
          "first-paint",
          timing.responseEnd - timing.requestStart,
        );
      });
    }

    // 资源加载性能
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "navigation") {
            this.recordMetric("navigation", entry.duration);
          } else if (entry.entryType === "resource") {
            this.recordMetric(`resource-${entry.name}`, entry.duration);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ["navigation", "resource"] });
      } catch (e) {
        console.warn("PerformanceObserver not supported for entryTypes:", e);
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
      summary: this.generateSummary(),
    };

    return report;
  }

  /**
   * 生成性能摘要
   */
  private generateSummary() {
    const timingMetrics = this.getMetrics({ type: "timing" });
    const counterMetrics = this.getMetrics({ type: "counter" });

    return {
      totalMetrics: this.metrics.length,
      avgTiming:
        timingMetrics.reduce((sum, m) => sum + m.value, 0) /
        (timingMetrics.length || 1),
      totalCounts: counterMetrics.reduce((sum, m) => sum + m.value, 0),
      timeRange: {
        start: Math.min(...this.metrics.map((m) => m.timestamp)),
        end: Math.max(...this.metrics.map((m) => m.timestamp)),
      },
    };
  }
}

// 类型定义
export type PerformanceServiceInterface = {
  trackMetric(name: string, value: number): void;
  trackCustomMetric(name: string, properties: Record<string, unknown>): void;
  trackApiCall(name: string, duration: number): void;
  trackUserAction(name: string, properties: Record<string, unknown>): void;
  trackError(name: string, error: Error): void;
  init(config?: Partial<TypePerformanceConfig>): void;
  getMetrics(filter?: { name?: string; type?: string }): TypePerformanceMetrics[];
  clear(): void;
  exportReport(): {
    timestamp: number;
    config: TypePerformanceConfig;
    metrics: TypePerformanceMetrics[];
    summary: {
      totalMetrics: number;
      avgTiming: number;
      totalCounts: number;
      timeRange: { start: number; end: number };
    };
  };
};

export { TypePerformanceMetrics as PerformanceMetrics, TypePerformanceConfig as PerformanceConfig };

// 实现接口方法
const performanceService = new PerformanceService() as PerformanceService & PerformanceServiceInterface;

// 添加接口方法实现
performanceService.trackApiCall = (name: string, duration: number) => {
  performanceService.trackMetric(`api_${name}`, duration);
};

performanceService.trackUserAction = (name: string, properties: Record<string, unknown>) => {
  performanceService.trackCustomMetric(`user_${name}`, properties);
};

performanceService.trackError = (name: string, error: Error) => {
  performanceService.trackCustomMetric(`error_${name}`, {
    message: error.message,
    stack: error.stack
  });
};

export { performanceService };
export default performanceService;
