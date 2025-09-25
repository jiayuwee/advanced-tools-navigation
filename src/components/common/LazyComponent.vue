<template>
  <div ref="containerRef" class="lazy-component">
    <!-- 加载占位符 -->
    <div
      v-if="!shouldLoad && showPlaceholder"
      class="lazy-placeholder"
      :style="placeholderStyle"
    >
      <slot name="placeholder">
        <div class="placeholder-content">
          <div class="placeholder-skeleton"></div>
          <p v-if="placeholderText">{{ placeholderText }}</p>
        </div>
      </slot>
    </div>

    <!-- 实际组件 -->
    <div v-if="shouldLoad" class="lazy-content">
      <component
        :is="component"
        v-bind="componentProps"
        @loaded="handleLoaded"
        @error="handleError"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="lazy-loading">
      <slot name="loading">
        <div class="loading-spinner"></div>
      </slot>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="lazy-error">
      <slot name="error" :error="error" :retry="retry">
        <div class="error-content">
          <p>{{ error }}</p>
          <button class="retry-button" @click="retry">重试</button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  defineAsyncComponent,
} from "vue";
import { useLazyComponent } from "@/composables/useLazyLoading";

interface Props {
  // 组件导入函数
  componentLoader: () => Promise<Record<string, unknown>>;
  // 组件属性
  componentProps?: Record<string, unknown>;
  // 是否显示占位符
  showPlaceholder?: boolean;
  // 占位符文本
  placeholderText?: string;
  // 占位符样式
  placeholderStyle?: Record<string, string>;
  // 预加载距离（px）
  preloadDistance?: number;
  // 是否启用错误重试
  enableRetry?: boolean;
  // 最大重试次数
  maxRetries?: number;
}

const props = withDefaults(defineProps<Props>(), {
  componentProps: () => ({}),
  showPlaceholder: true,
  placeholderText: "正在加载...",
  placeholderStyle: () => ({ minHeight: "200px" }),
  preloadDistance: 100,
  enableRetry: true,
  maxRetries: 3,
});

const emit = defineEmits<{
  loaded: [];
  error: [error: string];
  visible: [];
}>();

const { componentRef, isVisible, shouldLoad } = useLazyComponent();
const isLoading = ref(false);
const error = ref<string | null>(null);
const retryCount = ref(0);
const component = ref<Record<string, unknown> | null>(null);

// 设置容器引用
const containerRef = componentRef;

// 创建异步组件
const createAsyncComponent = () => {
  return defineAsyncComponent({
    loader: props.componentLoader,
    loadingComponent: undefined, // 我们自己处理加载状态
    errorComponent: undefined, // 我们自己处理错误状态
    delay: 0,
    timeout: 10000,
  });
};

// 加载组件
const loadComponent = async () => {
  if (component.value || isLoading.value) return;

  try {
    isLoading.value = true;
    error.value = null;

    component.value = createAsyncComponent();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "组件加载失败";
    emit("error", error.value);
  } finally {
    isLoading.value = false;
  }
};

// 处理组件加载完成
const handleLoaded = () => {
  isLoading.value = false;
  emit("loaded");
};

// 处理加载错误
const handleError = (err: Error | unknown) => {
  error.value = err instanceof Error ? err.message : "组件运行错误";
  isLoading.value = false;
  emit("error", error.value);
};

// 重试加载
const retry = () => {
  if (retryCount.value >= props.maxRetries) {
    error.value = `已达到最大重试次数 (${props.maxRetries})`;
    return;
  }

  retryCount.value++;
  component.value = null;
  loadComponent();
};

// 监听组件是否应该加载
watch(
  () => shouldLoad.value,
  (should) => {
    if (should) {
      loadComponent();
    }
  },
);

// 监听可见性变化
watch(
  () => isVisible.value,
  (visible) => {
    if (visible) {
      emit("visible");
    }
  },
);

onMounted(() => {
  // 设置自定义的观察器选项
  if (containerRef.value) {
    const { setupObserver } = useLazyComponent();
    setupObserver({
      threshold: 0.1,
      rootMargin: `${props.preloadDistance}px`,
    });
  }
});
</script>

<style scoped>
.lazy-component {
  position: relative;
  width: 100%;
}

.lazy-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-skeleton {
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 2s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.lazy-content {
  transition: opacity 0.3s ease;
}

.lazy-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.lazy-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
}

.error-content {
  text-align: center;
  color: #c33;
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.retry-button:active {
  transform: translateY(1px);
}
</style>
