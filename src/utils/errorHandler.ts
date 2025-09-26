/**
 * 错误处理工具类
 */

// 类型定义
interface AxiosErrorResponse {
  status: number;
  data: unknown;
}

interface AxiosError {
  response?: AxiosErrorResponse;
  request?: unknown;
  message: string;
}

interface NetworkError {
  request: unknown;
}

interface DatabaseError {
  code?: string;
  message?: string;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "request" in error)
  );
}

function isNetworkError(error: unknown): error is NetworkError {
  return typeof error === "object" && error !== null && "request" in error;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export class ErrorHandler {
  // 创建应用错误
  static createError(
    code: string,
    message: string,
    details?: unknown,
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  // 处理 API 错误
  static handleApiError(error: unknown): AppError {
    // 处理Axios错误响应
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (!status) {
        return this.createError("UNKNOWN_ERROR", "未知API错误", error);
      }
      switch (status) {
        case 400:
          return this.createError(
            "BAD_REQUEST",
            (data as { message?: string })?.message || "请求参数错误",
            data,
          );
        case 401:
          return this.createError(
            "UNAUTHORIZED",
            "未授权访问，请重新登录",
            data,
          );
        case 403:
          return this.createError("FORBIDDEN", "权限不足，无法访问", data);
        case 404:
          return this.createError("NOT_FOUND", "请求的资源不存在", data);
        case 422:
          return this.createError("VALIDATION_ERROR", "数据验证失败", data);
        case 429:
          return this.createError(
            "RATE_LIMIT",
            "请求过于频繁，请稍后重试",
            data,
          );
        case 500:
          return this.createError("SERVER_ERROR", "服务器内部错误", data);
        case 502:
          return this.createError("BAD_GATEWAY", "网关错误", data);
        case 503:
          return this.createError(
            "SERVICE_UNAVAILABLE",
            "服务暂时不可用",
            data,
          );
        default:
          return this.createError("HTTP_ERROR", `HTTP错误: ${status}`, data);
      }
    } else if (isNetworkError(error)) {
      // 网络错误
      return this.createError(
        "NETWORK_ERROR",
        "网络连接失败，请检查网络设置",
        error.request,
      );
    } else if (error instanceof Error) {
      // 标准错误对象
      return this.createError("UNKNOWN_ERROR", error.message, error);
    } else {
      // 其他未知类型错误
      return this.createError("UNKNOWN_ERROR", "发生未知错误", String(error));
    }
  }

  // 处理数据库错误
  static handleDatabaseError(error: unknown): AppError {
    const dbError = error as DatabaseError;

    if (dbError.code) {
      switch (dbError.code) {
        case "PGRST116":
          return this.createError("NOT_FOUND", "数据不存在", error);
        case "PGRST301":
          return this.createError("PERMISSION_DENIED", "权限不足", error);
        case "23505":
          return this.createError("DUPLICATE_KEY", "数据已存在", error);
        case "23503":
          return this.createError(
            "FOREIGN_KEY_VIOLATION",
            "关联数据不存在",
            error,
          );
        case "23514":
          return this.createError("CHECK_VIOLATION", "数据验证失败", error);
        default:
          return this.createError(
            "DATABASE_ERROR",
            dbError.message || "数据库操作失败",
            error,
          );
      }
    }

    return this.createError(
      "DATABASE_ERROR",
      dbError.message || "数据库操作失败",
      error,
    );
  }

  // 处理验证错误
  static handleValidationError(errors: Record<string, string[]>): AppError {
    const messages = Object.entries(errors)
      .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(", ")}`)
      .join("; ");

    return this.createError(
      "VALIDATION_ERROR",
      `验证失败: ${messages}`,
      errors,
    );
  }

  // 格式化错误消息
  static formatErrorMessage(error: AppError): string {
    switch (error.code) {
      case "NETWORK_ERROR":
        return "网络连接失败，请检查您的网络设置后重试";
      case "UNAUTHORIZED":
        return "登录已过期，请重新登录";
      case "FORBIDDEN":
        return "您没有权限执行此操作";
      case "NOT_FOUND":
        return "请求的内容不存在";
      case "VALIDATION_ERROR":
        return error.message;
      case "RATE_LIMIT":
        return "操作过于频繁，请稍后重试";
      case "SERVER_ERROR":
        return "服务器暂时出现问题，请稍后重试";
      default:
        return error.message || "操作失败，请重试";
    }
  }

  // 记录错误
  static logError(error: AppError, context?: string): void {
    const logData = {
      ...error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error("Application Error:", logData);

    // TODO: 发送错误到监控服务
    // this.sendToMonitoring(logData)
  }

  // 发送错误到监控服务
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async sendToMonitoring(_errorData: unknown): Promise<void> {
    try {
      // TODO: 实现错误监控服务集成
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // })
    } catch (err) {
      console.error("Failed to send error to monitoring service:", err);
    }
  }
}

// 错误边界组件辅助函数
export function createErrorBoundary() {
  return {
    errorCaptured(error: Error, instance: any, info: string) {
      const appError = ErrorHandler.createError("VUE_ERROR", error.message, {
        error,
        instance,
        info,
      });

      ErrorHandler.logError(appError, "Vue Error Boundary");

      // 返回 false 阻止错误继续传播
      return false;
    },
  };
}

// 全局错误处理器
export function setupGlobalErrorHandler() {
  // 处理未捕获的 Promise 错误
  window.addEventListener("unhandledrejection", (event) => {
    const error = ErrorHandler.createError(
      "UNHANDLED_PROMISE",
      event.reason?.message || "Unhandled Promise Rejection",
      event.reason,
    );

    ErrorHandler.logError(error, "Unhandled Promise Rejection");

    // 阻止默认的控制台错误输出
    event.preventDefault();
  });

  // 处理未捕获的 JavaScript 错误
  window.addEventListener("error", (event) => {
    const error = ErrorHandler.createError("UNHANDLED_ERROR", event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    ErrorHandler.logError(error, "Unhandled JavaScript Error");
  });
}

// 重试机制
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // 指数退避延迟
        const retryDelay = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    throw lastError;
  }

  static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        // 指数退避延迟，带抖动
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * exponentialDelay;
        const delay = Math.min(exponentialDelay + jitter, maxDelay);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
