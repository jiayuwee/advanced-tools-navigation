<template>
  <div ref="imageContainer" class="lazy-image-container">
    <img
      ref="imageRef"
      :alt="alt"
      :class="[
        'lazy-image',
        {
          'lazy-image--loading': isLoading,
          'lazy-image--loaded': isLoaded,
          'lazy-image--error': error,
        },
      ]"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 加载占位符 -->
    <div
      v-if="showPlaceholder && !isLoaded && !error"
      class="lazy-image-placeholder"
      :style="placeholderStyle"
    >
      <slot name="placeholder">
        <div class="placeholder-skeleton"></div>
      </slot>
    </div>

    <!-- 错误占位符 -->
    <div
      v-if="error && showErrorPlaceholder"
      class="lazy-image-error"
      :style="placeholderStyle"
    >
      <slot name="error" :error="error" :retry="retry">
        <div class="error-content">
          <svg
            class="error-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="error-text">图片加载失败</p>
          <button v-if="enableRetry" class="retry-button" @click="retry">
            重试
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useLazyImage } from "@/composables/useLazyLoading";

interface Props {
  // 图片源
  src: string;
  // 占位图片
  placeholder?: string;
  // 替代文本
  alt?: string;
  // 图片尺寸
  width?: number | string;
  height?: number | string;
  // 是否显示占位符
  showPlaceholder?: boolean;
  // 是否显示错误占位符
  showErrorPlaceholder?: boolean;
  // 是否启用重试
  enableRetry?: boolean;
  // 懒加载的根边距
  rootMargin?: string;
  // 懒加载阈值
  threshold?: number;
  // 图片质量优化
  quality?: "low" | "medium" | "high";
  // 响应式图片源
  srcset?: string;
  // 图片尺寸描述
  sizes?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "",
  showPlaceholder: true,
  showErrorPlaceholder: true,
  enableRetry: true,
  rootMargin: "50px",
  threshold: 0.1,
  quality: "medium",
});

const emit = defineEmits<{
  load: [event: Event];
  error: [error: string];
  visible: [];
}>();

const {
  imageRef,
  isLoaded,
  isLoading,
  error,
  setupIntersectionObserver,
  loadImage,
} = useLazyImage();

const imageContainer = ref<HTMLElement | null>(null);
const retryCount = ref(0);
const maxRetries = 3;

// 计算图片样式
const imageStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width) {
    style.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  }

  if (props.height) {
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  }

  return style;
});

// 计算占位符样式
const placeholderStyle = computed(() => {
  return {
    ...imageStyle.value,
    minHeight: props.height ? undefined : "200px",
  };
});

// 获取优化后的图片 URL
const getOptimizedSrc = (src: string): string => {
  if (!src) return src;

  // 如果是外部 URL，直接返回
  if (src.startsWith("http")) {
    return src;
  }

  // 根据质量设置添加参数（这里是示例，实际需要根据 CDN 支持的参数调整）
  const qualityParams = {
    low: "q_30,f_auto",
    medium: "q_70,f_auto",
    high: "q_90,f_auto",
  };

  const quality = qualityParams[props.quality];

  // 如果支持 WebP，优先使用
  const supportsWebP = checkWebPSupport();
  const format = supportsWebP ? "f_webp" : "f_auto";

  return `${src}?${quality},${format}`;
};

// 检查 WebP 支持
const checkWebPSupport = (): boolean => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

// 处理图片加载成功
const handleLoad = (event: Event) => {
  emit("load", event);
};

// 处理图片加载错误
const handleError = () => {
  emit("error", error.value || "图片加载失败");
};

// 重试加载
const retry = () => {
  if (retryCount.value >= maxRetries) {
    return;
  }

  retryCount.value++;
  error.value = null;

  const optimizedSrc = getOptimizedSrc(props.src);
  loadImage(optimizedSrc, props.placeholder);
};

// 监听 src 变化
watch(
  () => props.src,
  (newSrc) => {
    if (newSrc && imageContainer.value) {
      retryCount.value = 0;
      const optimizedSrc = getOptimizedSrc(newSrc);
      setupIntersectionObserver(optimizedSrc, props.placeholder);
    }
  },
);

onMounted(() => {
  if (props.src && imageContainer.value) {
    const optimizedSrc = getOptimizedSrc(props.src);
    setupIntersectionObserver(optimizedSrc, props.placeholder);
  }
});
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.lazy-image {
  display: block;
  width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}

.lazy-image--loading {
  opacity: 0;
}

.lazy-image--loaded {
  opacity: 1;
}

.lazy-image--error {
  opacity: 0;
}

.lazy-image-placeholder,
.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.placeholder-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.lazy-image-error {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
}

.error-content {
  text-align: center;
  color: #666;
  padding: 20px;
}

.error-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  color: #ccc;
}

.error-text {
  margin: 8px 0;
  font-size: 14px;
}

.retry-button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0056b3;
}

.retry-button:active {
  transform: translateY(1px);
}

/* 响应式图片 */
@media (max-width: 768px) {
  .lazy-image {
    max-width: 100%;
    height: auto;
  }
}

/* 针对高 DPI 屏幕的优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .lazy-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style>
