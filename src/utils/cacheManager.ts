/**
 * 智能缓存管理器
 * 用于优化数据加载和减少不必要的 API 调用
 */

import { ref, reactive } from "vue";

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
  hits: number;
  lastAccessed: number;
}

export interface CacheOptions {
  maxAge?: number; // 缓存最大生存时间（毫秒）
  maxSize?: number; // 最大缓存项数量
  version?: string; // 缓存版本
  serialize?: boolean; // 是否序列化存储到 localStorage
  prefix?: string; // localStorage 前缀
}

class CacheManager {
  private cache = reactive<Map<string, CacheItem>>(new Map());
  private options: Required<CacheOptions>;
  private readonly defaultOptions: Required<CacheOptions> = {
    maxAge: 5 * 60 * 1000, // 5分钟
    maxSize: 100,
    version: "1.0.0",
    serialize: false,
    prefix: "app_cache_",
  };

  constructor(options: CacheOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };

    if (this.options.serialize) {
      this.loadFromStorage();
    }

    // 定期清理过期缓存
    this.startCleanupTimer();
  }

  // 设置缓存
  set<T>(key: string, data: T, customMaxAge?: number): void {
    const now = Date.now();
    const maxAge = customMaxAge || this.options.maxAge;

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + maxAge,
      version: this.options.version,
      hits: 0,
      lastAccessed: now,
    };

    // 检查缓存大小限制
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, item);

    if (this.options.serialize) {
      this.saveToStorage(key, item);
    }
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const now = Date.now();

    // 检查是否过期
    if (now > item.expiry) {
      this.delete(key);
      return null;
    }

    // 检查版本
    if (item.version !== this.options.version) {
      this.delete(key);
      return null;
    }

    // 更新访问统计
    item.hits++;
    item.lastAccessed = now;

    return item.data as T;
  }

  // 删除缓存
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted && this.options.serialize) {
      this.removeFromStorage(key);
    }

    return deleted;
  }

  // 检查缓存是否存在且有效
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();

    if (this.options.serialize) {
      this.clearStorage();
    }
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now();
    let totalHits = 0;
    let validCount = 0;
    let expiredCount = 0;

    for (const [, item] of this.cache) {
      totalHits += item.hits;

      if (now > item.expiry) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems: validCount,
      expiredItems: expiredCount,
      totalHits,
      hitRate: totalHits > 0 ? totalHits / this.cache.size : 0,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // 刷新缓存版本（清空所有缓存）
  refreshVersion(newVersion: string): void {
    this.options.version = newVersion;
    this.clear();
  }

  // 淘汰最少使用的缓存项
  private evictLeastRecentlyUsed(): void {
    let lruKey = "";
    let lruTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiry || item.version !== this.options.version) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
  }

  // 启动清理定时器
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  // 估算内存使用量
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    for (const [key, item] of this.cache) {
      totalSize += key.length * 2; // Unicode 字符串
      totalSize += JSON.stringify(item).length * 2;
    }

    return totalSize; // 字节数
  }

  // 保存到 localStorage
  private saveToStorage(key: string, item: CacheItem): void {
    try {
      const storageKey = this.options.prefix + key;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn("保存缓存到 localStorage 失败:", error);
    }
  }

  // 从 localStorage 加载
  private loadFromStorage(): void {
    try {
      const prefix = this.options.prefix;

      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);

        if (storageKey?.startsWith(prefix)) {
          const key = storageKey.slice(prefix.length);
          const itemStr = localStorage.getItem(storageKey);

          if (itemStr) {
            const item: CacheItem = JSON.parse(itemStr);

            // 检查是否过期
            if (
              Date.now() <= item.expiry &&
              item.version === this.options.version
            ) {
              this.cache.set(key, item);
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        }
      }
    } catch (error) {
      console.warn("从 localStorage 加载缓存失败:", error);
    }
  }

  // 从 localStorage 删除
  private removeFromStorage(key: string): void {
    try {
      const storageKey = this.options.prefix + key;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("从 localStorage 删除缓存失败:", error);
    }
  }

  // 清空 localStorage 中的缓存
  private clearStorage(): void {
    try {
      const prefix = this.options.prefix;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("清空 localStorage 缓存失败:", error);
    }
  }
}

// 创建默认缓存实例
export const defaultCache = new CacheManager({
  maxAge: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
  serialize: true,
  prefix: "advanced_tools_",
});

// 创建图片缓存实例
export const imageCache = new CacheManager({
  maxAge: 30 * 60 * 1000, // 30分钟
  maxSize: 50,
  serialize: false, // 图片数据不适合序列化
  prefix: "img_cache_",
});

// 创建 API 数据缓存实例
export const apiCache = new CacheManager({
  maxAge: 3 * 60 * 1000, // 3分钟
  maxSize: 200,
  serialize: true,
  prefix: "api_cache_",
});

// 缓存装饰器函数
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: ((...args: Parameters<T>) => string) | string,
  cacheInstance: CacheManager = defaultCache,
  maxAge?: number,
): T {
  return (async (...args: Parameters<T>) => {
    const key = typeof cacheKey === "function" ? cacheKey(...args) : cacheKey;

    // 尝试从缓存获取
    const cachedResult = cacheInstance.get(key);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // 执行原函数
    const result = await fn(...args);

    // 缓存结果
    cacheInstance.set(key, result, maxAge);

    return result;
  }) as T;
}

// Vue Composition API
export function useCache(cacheInstance: CacheManager = defaultCache) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getCachedData = <T>(key: string): T | null => {
    return cacheInstance.get<T>(key);
  };

  const setCachedData = <T>(key: string, data: T, maxAge?: number): void => {
    cacheInstance.set(key, data, maxAge);
  };

  const loadWithCache = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    maxAge?: number,
    forceRefresh = false,
  ): Promise<T> => {
    try {
      isLoading.value = true;
      error.value = null;

      // 如果不强制刷新，先检查缓存
      if (!forceRefresh) {
        const cached = getCachedData<T>(key);
        if (cached !== null) {
          return cached;
        }
      }

      // 从 fetcher 获取数据
      const data = await fetcher();

      // 缓存数据
      setCachedData(key, data, maxAge);

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "加载数据失败";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearCache = (key?: string): void => {
    if (key) {
      cacheInstance.delete(key);
    } else {
      cacheInstance.clear();
    }
  };

  const getCacheStats = () => {
    return cacheInstance.getStats();
  };

  return {
    isLoading,
    error,
    getCachedData,
    setCachedData,
    loadWithCache,
    clearCache,
    getCacheStats,
  };
}
