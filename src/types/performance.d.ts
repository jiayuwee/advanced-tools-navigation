/**
 * Performance monitoring types
 */
export interface PerformanceMetrics {
  name: string;
  value: number;
  type: "timing" | "counter" | "gauge";
  timestamp: number;
  url: string;
}

export interface PerformanceConfig {
  enableAutoTracking: boolean;
  sampleRate: number;
  maxMetrics: number;
}

export interface PerformanceReport {
  timestamp: number;
  config: PerformanceConfig;
  metrics: PerformanceMetrics[];
  summary: PerformanceSummary;
}

export interface PerformanceSummary {
  totalMetrics: number;
  avgTiming: number;
  totalCounts: number;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface PerformanceService {
  /**
   * 跟踪基础指标
   * @param metricName 指标名称
   * @param value 指标值
   */
  trackMetric(metricName: string, value: number): void;

  /**
   * 跟踪自定义指标
   * @param metricName 指标名称
   * @param properties 自定义属性
   */
  trackCustomMetric(metricName: string, properties: Record<string, unknown>): void;
}
