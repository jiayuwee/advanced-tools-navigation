/**
 * 懒加载相关功能
 * 用于优化图片加载、组件懒加载等
 */

import { ref, onMounted, onUnmounted, computed } from "vue";

// 图片懒加载
export function useLazyImage() {
  const imageRef = ref<HTMLImageElement | null>(null);
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  let observer: IntersectionObserver | null = null;

  const loadImage = (src: string, placeholder?: string) => {
    if (!imageRef.value) return;

    isLoading.value = true;
    error.value = null;

    const img = new Image();

    img.onload = () => {
      if (imageRef.value) {
        imageRef.value.src = src;
        isLoaded.value = true;
        isLoading.value = false;
      }
    };

    img.onerror = () => {
      error.value = "图片加载失败";
      isLoading.value = false;

      // 设置占位图片
      if (placeholder && imageRef.value) {
        imageRef.value.src = placeholder;
      }
    };

    img.src = src;
  };

  const setupIntersectionObserver = (src: string, placeholder?: string) => {
    if (!imageRef.value || !("IntersectionObserver" in window)) {
      // 不支持 IntersectionObserver，直接加载
      loadImage(src, placeholder);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src, placeholder);
            observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    );

    observer.observe(imageRef.value);
  };

  onUnmounted(() => {
    if (observer && imageRef.value) {
      observer.unobserve(imageRef.value);
    }
  });

  return {
    imageRef,
    isLoaded,
    isLoading,
    error,
    setupIntersectionObserver,
    loadImage,
  };
}

// 组件懒加载
export function useLazyComponent() {
  const componentRef = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  const shouldLoad = ref(false);

  let observer: IntersectionObserver | null = null;

  const setupObserver = (options?: IntersectionObserverInit) => {
    if (!componentRef.value || !("IntersectionObserver" in window)) {
      shouldLoad.value = true;
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.value = entry.isIntersecting;

          if (entry.isIntersecting && !shouldLoad.value) {
            shouldLoad.value = true;
            observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
        ...options,
      },
    );

    observer.observe(componentRef.value);
  };

  onMounted(() => {
    setupObserver();
  });

  onUnmounted(() => {
    if (observer && componentRef.value) {
      observer.unobserve(componentRef.value);
    }
  });

  return {
    componentRef,
    isVisible,
    shouldLoad,
    setupObserver,
  };
}

// 内容预加载
export function usePreloader() {
  const preloadedData = ref<Map<string, any>>(new Map());
  const loadingState = ref<Map<string, boolean>>(new Map());

  const preloadData = async (
    key: string,
    fetcher: () => Promise<any>,
    priority: "high" | "normal" | "low" = "normal",
  ) => {
    if (preloadedData.value.has(key)) {
      return preloadedData.value.get(key);
    }

    if (loadingState.value.get(key)) {
      // 已在加载中，等待完成
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!loadingState.value.get(key)) {
            resolve(preloadedData.value.get(key));
          } else {
            setTimeout(checkLoading, 50);
          }
        };
        checkLoading();
      });
    }

    loadingState.value.set(key, true);

    try {
      let data;

      if (priority === "low") {
        // 低优先级在 requestIdleCallback 中执行
        data = await new Promise((resolve, reject) => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(async () => {
              try {
                const result = await fetcher();
                resolve(result);
              } catch (error) {
                reject(error);
              }
            });
          } else {
            // 降级方案
            setTimeout(async () => {
              try {
                const result = await fetcher();
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, 0);
          }
        });
      } else {
        data = await fetcher();
      }

      preloadedData.value.set(key, data);
      return data;
    } catch (error) {
      console.error(`预加载数据失败: ${key}`, error);
      throw error;
    } finally {
      loadingState.value.set(key, false);
    }
  };

  const getPreloadedData = (key: string) => {
    return preloadedData.value.get(key);
  };

  const clearPreloadedData = (key?: string) => {
    if (key) {
      preloadedData.value.delete(key);
      loadingState.value.delete(key);
    } else {
      preloadedData.value.clear();
      loadingState.value.clear();
    }
  };

  return {
    preloadData,
    getPreloadedData,
    clearPreloadedData,
    preloadedData: preloadedData.value,
    loadingState: loadingState.value,
  };
}

// 资源预载
export function useResourcePreloader() {
  const preloadLink = (href: string, as: string = "script") => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  };

  const preloadImage = (src: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = src;
    link.as = "image";
    document.head.appendChild(link);
  };

  const preloadFont = (href: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  };

  const prefetchResource = (href: string) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    document.head.appendChild(link);
  };

  return {
    preloadLink,
    preloadImage,
    preloadFont,
    prefetchResource,
  };
}

// 虚拟滚动（大列表优化）
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
) {
  const scrollTop = ref(0);
  const containerRef = ref<HTMLElement | null>(null);

  const visibleRange = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 5, items.length); // 多渲染5个作为缓冲

    return {
      start: Math.max(0, start - 5), // 前面也多渲染5个作为缓冲
      end,
    };
  });

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value;
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  });

  const totalHeight = computed(() => items.length * itemHeight);

  const offsetY = computed(() => visibleRange.value.start * itemHeight);

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}
