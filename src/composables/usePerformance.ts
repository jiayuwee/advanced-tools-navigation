import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { performanceService } from "@/services/performanceService";
import type { PerformanceReport } from "@/services/performanceService";

// 页面性能监控
export function usePagePerformance() {
  const route = useRoute();
  const pageLoadTime = ref<number>(0);
  const isLoading = ref(true);
  const performanceData = ref<Record<string, number>>({});

  const startTime = ref(Date.now());

  // 记录页面开始加载时间
  const markPageStart = () => {
    startTime.value = Date.now();
    isLoading.value = true;
    performanceService.trackCustomMetric("page_start", startTime.value, "ms");
  };

  // 记录页面加载完成
  const markPageEnd = () => {
    const endTime = Date.now();
    const loadTime = endTime - startTime.value;

    pageLoadTime.value = loadTime;
    isLoading.value = false;

    performanceService.trackCustomMetric("page_load_complete", loadTime, "ms");
    performanceService.trackMetric(
      "page_load",
      "total_load_time",
      loadTime,
      "ms",
      {
        route: route.path,
        query: route.query,
      },
    );
  };

  // 记录组件渲染时间
  const measureComponentRender = (
    componentName: string,
    renderFn: () => void,
  ) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    const duration = end - start;

    performanceService.trackCustomMetric(
      `component_render_${componentName}`,
      duration,
      "ms",
    );
    performanceData.value[`${componentName}_render`] = duration;
  };

  // 记录异步操作时间
  const measureAsyncOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    const start = performance.now();

    try {
      const result = await operation();
      const end = performance.now();
      const duration = end - start;

      performanceService.trackCustomMetric(
        `async_${operationName}`,
        duration,
        "ms",
      );
      performanceData.value[`${operationName}_duration`] = duration;

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      performanceService.trackCustomMetric(
        `async_${operationName}_error`,
        duration,
        "ms",
      );
      performanceService.trackError({
        message: `Async operation failed: ${operationName}`,
        stack: error instanceof Error ? error.stack || "" : "",
        filename: window.location.href,
        lineno: 0,
        colno: 0,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });

      throw error;
    }
  };

  // 监听路由变化
  watch(
    () => route.path,
    () => {
      markPageStart();
    },
  );

  onMounted(() => {
    markPageStart();

    // 页面加载完成后记录
    if (document.readyState === "complete") {
      markPageEnd();
    } else {
      window.addEventListener("load", markPageEnd);
    }
  });

  onUnmounted(() => {
    window.removeEventListener("load", markPageEnd);
  });

  return {
    pageLoadTime,
    isLoading,
    performanceData,
    markPageStart,
    markPageEnd,
    measureComponentRender,
    measureAsyncOperation,
  };
}

// API 性能监控
export function useAPIPerformance() {
  const apiMetrics = ref<Record<string, any>>({});
  const activeRequests = ref<Map<string, number>>(new Map());

  // 开始 API 调用监控
  const startAPICall = (endpoint: string, method: string = "GET"): string => {
    const requestId = `${method}-${endpoint}-${Date.now()}`;
    activeRequests.value.set(requestId, Date.now());
    return requestId;
  };

  // 结束 API 调用监控
  const endAPICall = (
    requestId: string,
    endpoint: string,
    method: string,
    status: number,
    responseSize: number = 0,
  ) => {
    const startTime = activeRequests.value.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    activeRequests.value.delete(requestId);

    // 记录性能数据
    performanceService.trackAPICall(
      endpoint,
      method,
      duration,
      status,
      responseSize,
    );

    // 更新本地指标
    const key = `${method}_${endpoint}`;
    if (!apiMetrics.value[key]) {
      apiMetrics.value[key] = {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        successCount: 0,
        errorCount: 0,
      };
    }

    const metric = apiMetrics.value[key];
    metric.count++;
    metric.totalDuration += duration;
    metric.averageDuration = metric.totalDuration / metric.count;

    if (status >= 200 && status < 400) {
      metric.successCount++;
    } else {
      metric.errorCount++;
    }
  };

  // 包装 fetch 请求
  const monitoredFetch = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    const method = options.method || "GET";
    const requestId = startAPICall(url, method);

    try {
      const response = await fetch(url, options);
      const responseSize = parseInt(
        response.headers.get("content-length") || "0",
      );

      endAPICall(requestId, url, method, response.status, responseSize);

      return response;
    } catch (error) {
      endAPICall(requestId, url, method, 0, 0);
      throw error;
    }
  };

  return {
    apiMetrics,
    activeRequests,
    startAPICall,
    endAPICall,
    monitoredFetch,
  };
}

// 用户行为监控
export function useUserBehavior() {
  const userActions = ref<
    Array<{ action: string; timestamp: number; element?: string }>
  >([]);
  const sessionStartTime = ref(Date.now());

  // 记录用户操作
  const trackUserAction = (
    action: string,
    element?: string,
    duration?: number,
  ) => {
    const timestamp = Date.now();

    userActions.value.push({
      action,
      timestamp,
      element,
    });

    performanceService.trackUserAction(action, element || "", duration);
  };

  // 自动跟踪点击事件
  const setupClickTracking = () => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;

      let elementDescription = tagName;
      if (id) elementDescription += `#${id}`;
      if (className) elementDescription += `.${className.split(" ")[0]}`;

      trackUserAction("click", elementDescription);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  };

  // 跟踪表单交互
  const trackFormInteraction = (
    formName: string,
    fieldName: string,
    action: "focus" | "blur" | "change",
  ) => {
    trackUserAction(`form_${action}`, `${formName}.${fieldName}`);
  };

  // 跟踪滚动行为
  const setupScrollTracking = () => {
    let scrollTimeout: number;
    let maxScrollDepth = 0;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100,
      );

      if (scrollPercentage > maxScrollDepth) {
        maxScrollDepth = scrollPercentage;
        performanceService.trackCustomMetric(
          "scroll_depth",
          scrollPercentage,
          "percentage",
        );
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        trackUserAction("scroll_stop", "", scrollTop);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  };

  // 计算会话时长
  const getSessionDuration = (): number => {
    return Date.now() - sessionStartTime.value;
  };

  onMounted(() => {
    const cleanupClick = setupClickTracking();
    const cleanupScroll = setupScrollTracking();

    onUnmounted(() => {
      cleanupClick();
      cleanupScroll();

      // 记录会话结束
      const sessionDuration = getSessionDuration();
      performanceService.trackCustomMetric(
        "session_duration",
        sessionDuration,
        "ms",
      );
    });
  });

  return {
    userActions,
    trackUserAction,
    trackFormInteraction,
    getSessionDuration,
  };
}

// 错误监控
export function useErrorTracking() {
  const errors = ref<
    Array<{ message: string; timestamp: number; stack?: string }>
  >([]);

  // 记录错误
  const trackError = (error: Error, context?: string) => {
    const errorInfo = {
      message: error.message,
      timestamp: Date.now(),
      stack: error.stack,
    };

    errors.value.push(errorInfo);

    performanceService.trackError({
      message: context ? `${context}: ${error.message}` : error.message,
      stack: error.stack || "",
      filename: window.location.href,
      lineno: 0,
      colno: 0,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  // 包装异步函数以捕获错误
  const withErrorTracking = <T extends (...args: any[]) => any>(
    fn: T,
    context?: string,
  ): T => {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);

        // 如果返回 Promise，捕获异步错误
        if (result && typeof result.catch === "function") {
          return result.catch((error: Error) => {
            trackError(error, context);
            throw error;
          });
        }

        return result;
      } catch (error) {
        trackError(error as Error, context);
        throw error;
      }
    }) as T;
  };

  return {
    errors,
    trackError,
    withErrorTracking,
  };
}

// 性能报告
export function usePerformanceReport() {
  const report = ref<PerformanceReport | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取性能报告
  const fetchReport = async (startDate: string, endDate: string) => {
    try {
      loading.value = true;
      error.value = null;

      report.value = await performanceService.getPerformanceReport(
        startDate,
        endDate,
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取性能报告失败";
    } finally {
      loading.value = false;
    }
  };

  // 获取实时性能指标
  const getRealTimeMetrics = () => {
    if (typeof window === "undefined") return {};

    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");

    return {
      loadTime: navigation
        ? navigation.loadEventEnd - navigation.fetchStart
        : 0,
      domContentLoaded: navigation
        ? navigation.domContentLoadedEventEnd - navigation.fetchStart
        : 0,
      firstPaint: paint.find((p) => p.name === "first-paint")?.startTime || 0,
      firstContentfulPaint:
        paint.find((p) => p.name === "first-contentful-paint")?.startTime || 0,
      memoryUsage: (performance as any).memory
        ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit,
          }
        : null,
    };
  };

  return {
    report,
    loading,
    error,
    fetchReport,
    getRealTimeMetrics,
  };
}

// 综合性能监控 Hook
export function usePerformanceMonitoring() {
  const pagePerf = usePagePerformance();
  const apiPerf = useAPIPerformance();
  const userBehavior = useUserBehavior();
  const errorTracking = useErrorTracking();
  const performanceReport = usePerformanceReport();

  return {
    ...pagePerf,
    ...apiPerf,
    ...userBehavior,
    ...errorTracking,
    ...performanceReport,
  };
}
