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
