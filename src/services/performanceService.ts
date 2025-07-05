import { supabase } from "@/lib/supabase";

export interface PerformanceMetric {
  id: string;
  metric_type:
    | "page_load"
    | "api_call"
    | "user_action"
    | "error"
    | "navigation";
  metric_name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "percentage";
  page_url: string;
  user_agent: string;
  user_id?: string;
  session_id: string;
  additional_data?: Record<string, any>;
  created_at: string;
}

export interface PagePerformance {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface APIPerformance {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  size: number;
  success: boolean;
}

export interface UserAction {
  action: string;
  element: string;
  page: string;
  timestamp: number;
  duration?: number;
}

export interface ErrorInfo {
  message: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
  userAgent: string;
  url: string;
}

export interface PerformanceReport {
  timeRange: string;
  pageMetrics: {
    averageLoadTime: number;
    averageFCP: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    totalPageViews: number;
  };
  apiMetrics: {
    averageResponseTime: number;
    successRate: number;
    totalRequests: number;
    slowestEndpoints: Array<{
      endpoint: string;
      averageTime: number;
      count: number;
    }>;
  };
  errorMetrics: {
    totalErrors: number;
    errorRate: number;
    topErrors: Array<{
      message: string;
      count: number;
      lastOccurred: string;
    }>;
  };
  userMetrics: {
    totalUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
    topPages: Array<{
      url: string;
      views: number;
      averageTime: number;
    }>;
  };
}

class PerformanceService {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private batchSize: number = 10;
  private batchTimeout: number = 5000;
  private metricsQueue: PerformanceMetric[] = [];
  private batchTimer?: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceObserver();
    this.setupErrorHandling();
    this.setupNavigationTracking();

    // 定期发送批量数据
    this.startBatchTimer();
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 设置用户ID
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // 启用/禁用监控
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 初始化性能观察器
  private initializePerformanceObserver(): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    try {
      // 观察导航性能
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            this.trackPagePerformance(entry as PerformanceNavigationTiming);
          }
        }
      });
      navObserver.observe({ entryTypes: ["navigation"] });

      // 观察资源加载性能
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource") {
            this.trackResourcePerformance(entry as PerformanceResourceTiming);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ["resource"] });

      // 观察用户交互性能
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "measure") {
            this.trackCustomMetric(entry.name, entry.duration, "ms");
          }
        }
      });
      measureObserver.observe({ entryTypes: ["measure"] });

      // 观察 Web Vitals
      this.observeWebVitals();
    } catch (error) {
      console.warn("Performance Observer 初始化失败:", error);
    }
  }

  // 观察 Web Vitals
  private observeWebVitals(): void {
    // FCP (First Contentful Paint)
    this.observeMetric("first-contentful-paint", (value) => {
      this.trackMetric("web_vitals", "first_contentful_paint", value, "ms");
    });

    // LCP (Largest Contentful Paint)
    this.observeMetric("largest-contentful-paint", (value) => {
      this.trackMetric("web_vitals", "largest_contentful_paint", value, "ms");
    });

    // FID (First Input Delay)
    this.observeMetric("first-input", (value) => {
      this.trackMetric("web_vitals", "first_input_delay", value, "ms");
    });

    // CLS (Cumulative Layout Shift)
    this.observeMetric("layout-shift", (value) => {
      this.trackMetric("web_vitals", "cumulative_layout_shift", value, "count");
    });
  }

  // 观察特定性能指标
  private observeMetric(type: string, callback: (value: number) => void): void {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          let value = 0;

          if (type === "layout-shift") {
            value = (entry as any).value;
          } else {
            value = entry.startTime;
          }

          callback(value);
        }
      });

      observer.observe({ entryTypes: [type] });
    } catch (error) {
      console.warn(`观察 ${type} 指标失败:`, error);
    }
  }

  // 跟踪页面性能
  private trackPagePerformance(entry: PerformanceNavigationTiming): void {
    const metrics = {
      loadTime: entry.loadEventEnd - entry.navigationStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
      firstByte: entry.responseStart - entry.navigationStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      domComplete: entry.domComplete - entry.navigationStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.trackMetric("page_load", name, value, "ms");
    });
  }

  // 跟踪资源性能
  private trackResourcePerformance(entry: PerformanceResourceTiming): void {
    // 只跟踪重要资源
    if (this.isImportantResource(entry.name)) {
      this.trackMetric("resource_load", entry.name, entry.duration, "ms", {
        size: entry.transferSize,
        type: this.getResourceType(entry.name),
      });
    }
  }

  // 判断是否为重要资源
  private isImportantResource(url: string): boolean {
    const importantExtensions = [".js", ".css", ".woff", ".woff2", ".ttf"];
    return (
      importantExtensions.some((ext) => url.includes(ext)) ||
      url.includes("/api/") ||
      url.includes("supabase.co")
    );
  }

  // 获取资源类型
  private getResourceType(url: string): string {
    if (url.includes(".js")) return "javascript";
    if (url.includes(".css")) return "stylesheet";
    if (url.includes(".woff") || url.includes(".ttf")) return "font";
    if (url.includes("/api/")) return "api";
    return "other";
  }

  // 设置错误处理
  private setupErrorHandling(): void {
    if (typeof window === "undefined") return;

    // 捕获 JavaScript 错误
    window.addEventListener("error", (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack || "",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });

    // 捕获 Promise 拒绝
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || "",
        filename: window.location.href,
        lineno: 0,
        colno: 0,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  // 设置导航跟踪
  private setupNavigationTracking(): void {
    if (typeof window === "undefined") return;

    let startTime = Date.now();

    // 跟踪页面停留时间
    const trackPageTime = () => {
      const timeOnPage = Date.now() - startTime;
      this.trackMetric("user_action", "page_time", timeOnPage, "ms", {
        url: window.location.href,
      });
    };

    // 页面卸载时记录停留时间
    window.addEventListener("beforeunload", trackPageTime);

    // 页面可见性变化时记录
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        trackPageTime();
      } else {
        startTime = Date.now();
      }
    });
  }

  // 跟踪指标
  trackMetric(
    type: PerformanceMetric["metric_type"],
    name: string,
    value: number,
    unit: PerformanceMetric["unit"],
    additionalData?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metric_type: type,
      metric_name: name,
      value,
      unit,
      page_url: typeof window !== "undefined" ? window.location.href : "",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      user_id: this.userId,
      session_id: this.sessionId,
      additional_data: additionalData,
      created_at: new Date().toISOString(),
    };

    this.addToQueue(metric);
  }

  // 跟踪自定义指标
  trackCustomMetric(
    name: string,
    value: number,
    unit: PerformanceMetric["unit"],
  ): void {
    this.trackMetric("user_action", name, value, unit);
  }

  // 跟踪 API 调用性能
  trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    size: number,
  ): void {
    this.trackMetric("api_call", `${method} ${endpoint}`, duration, "ms", {
      status,
      size,
      success: status >= 200 && status < 400,
    });
  }

  // 跟踪用户操作
  trackUserAction(action: string, element: string, duration?: number): void {
    this.trackMetric("user_action", action, duration || 0, "ms", {
      element,
      timestamp: Date.now(),
    });
  }

  // 跟踪错误
  trackError(errorInfo: ErrorInfo): void {
    this.trackMetric("error", "javascript_error", 1, "count", errorInfo);
  }

  // 添加到队列
  private addToQueue(metric: PerformanceMetric): void {
    this.metricsQueue.push(metric);

    if (this.metricsQueue.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  // 开始批量计时器
  private startBatchTimer(): void {
    this.batchTimer = window.setInterval(() => {
      if (this.metricsQueue.length > 0) {
        this.sendBatch();
      }
    }, this.batchTimeout);
  }

  // 发送批量数据
  private async sendBatch(): void {
    if (this.metricsQueue.length === 0) return;

    const batch = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      const { error } = await supabase
        .from("performance_metrics")
        .insert(batch);

      if (error) {
        console.error("发送性能数据失败:", error);
        // 重新加入队列
        this.metricsQueue.unshift(...batch);
      }
    } catch (error) {
      console.error("发送性能数据异常:", error);
      // 重新加入队列
      this.metricsQueue.unshift(...batch);
    }
  }

  // 获取性能报告
  async getPerformanceReport(
    startDate: string,
    endDate: string,
  ): Promise<PerformanceReport> {
    try {
      // 调用 Supabase 函数来生成报告
      const { data, error } = await supabase.rpc("get_performance_report", {
        start_date: startDate,
        end_date: endDate,
      });

      if (error) throw error;

      return (
        data || {
          timeRange: `${startDate} - ${endDate}`,
          pageMetrics: {
            averageLoadTime: 0,
            averageFCP: 0,
            averageLCP: 0,
            averageFID: 0,
            averageCLS: 0,
            totalPageViews: 0,
          },
          apiMetrics: {
            averageResponseTime: 0,
            successRate: 0,
            totalRequests: 0,
            slowestEndpoints: [],
          },
          errorMetrics: {
            totalErrors: 0,
            errorRate: 0,
            topErrors: [],
          },
          userMetrics: {
            totalUsers: 0,
            averageSessionDuration: 0,
            bounceRate: 0,
            topPages: [],
          },
        }
      );
    } catch (error) {
      console.error("获取性能报告失败:", error);
      throw error;
    }
  }

  // 清理资源
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    // 发送剩余数据
    if (this.metricsQueue.length > 0) {
      this.sendBatch();
    }
  }
}

// 导出单例实例
export const performanceService = new PerformanceService();
export default performanceService;
