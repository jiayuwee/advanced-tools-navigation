<template>
  <teleport to="body">
    <!-- 错误提示弹窗 -->
    <transition-group name="error-toast" tag="div" class="error-container">
      <div
        v-for="error in errors"
        :key="error.id"
        class="error-toast"
        :class="error.type"
        @click="dismissError(error.id)"
      >
        <div class="error-icon">
          <AlertCircleIcon v-if="error.type === 'error'" />
          <AlertTriangleIcon v-else-if="error.type === 'warning'" />
          <InfoIcon v-else-if="error.type === 'info'" />
          <CheckCircleIcon v-else />
        </div>
        <div class="error-content">
          <h4 class="error-title">{{ error.title }}</h4>
          <p class="error-message">{{ error.message }}</p>
          <div v-if="error.actions" class="error-actions">
            <button
              v-for="action in error.actions"
              :key="action.label"
              class="error-action-btn"
              @click.stop="action.handler"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        <button class="error-close" @click.stop="dismissError(error.id)">
          <XIcon />
        </button>
      </div>
    </transition-group>

    <!-- 网络状态提示 -->
    <transition name="network-status">
      <div v-if="!isOnline" class="network-status offline">
        <WifiOffIcon class="network-icon" />
        <span>网络连接已断开</span>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  XIcon,
  WifiOffIcon
} from 'lucide-vue-next';

interface ErrorItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    handler: () => void;
  }>;
}

// 响应式状态
const errors = ref<ErrorItem[]>([]);
const isOnline = ref(navigator.onLine);

// 添加错误
const addError = (error: Omit<ErrorItem, 'id'>) => {
  const id = Date.now().toString();
  const errorItem: ErrorItem = {
    ...error,
    id,
    duration: error.duration || 5000
  };
  
  errors.value.push(errorItem);
  
  // 自动移除
  if (errorItem.duration > 0) {
    setTimeout(() => {
      dismissError(id);
    }, errorItem.duration);
  }
};

// 移除错误
const dismissError = (id: string) => {
  const index = errors.value.findIndex(error => error.id === id);
  if (index > -1) {
    errors.value.splice(index, 1);
  }
};

// 清除所有错误
const clearAllErrors = () => {
  errors.value = [];
};

// 网络状态监听
const handleOnline = () => {
  isOnline.value = true;
  addError({
    type: 'success',
    title: '网络已连接',
    message: '网络连接已恢复',
    duration: 3000
  });
};

const handleOffline = () => {
  isOnline.value = false;
};

// 全局错误监听
const handleUnhandledError = (event: ErrorEvent) => {
  addError({
    type: 'error',
    title: '应用程序错误',
    message: event.error?.message || '发生未知错误',
    actions: [
      {
        label: '刷新页面',
        handler: () => window.location.reload()
      }
    ]
  });
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  addError({
    type: 'error',
    title: '网络请求失败',
    message: event.reason?.message || '请求处理失败',
    actions: [
      {
        label: '重试',
        handler: () => window.location.reload()
      }
    ]
  });
};

// 生命周期
onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('error', handleUnhandledError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('error', handleUnhandledError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});

// 暴露方法给全局使用
defineExpose({
  addError,
  dismissError,
  clearAllErrors
});
</script>

<style scoped>
.error-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

.error-toast {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.error-toast.warning {
  border-left-color: #f59e0b;
}

.error-toast.info {
  border-left-color: #3b82f6;
}

.error-toast.success {
  border-left-color: #10b981;
}

.error-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: #ef4444;
}

.error-toast.warning .error-icon {
  color: #f59e0b;
}

.error-toast.info .error-icon {
  color: #3b82f6;
}

.error-toast.success .error-icon {
  color: #10b981;
}

.error-content {
  flex: 1;
}

.error-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.error-message {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.error-action-btn {
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.error-action-btn:hover {
  background: #e5e7eb;
}

.error-close {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s ease;
}

.error-close:hover {
  color: #6b7280;
}

.network-status {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #ef4444;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.network-icon {
  width: 1rem;
  height: 1rem;
}

/* 动画 */
.error-toast-enter-active,
.error-toast-leave-active {
  transition: all 0.3s ease;
}

.error-toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.network-status-enter-active,
.network-status-leave-active {
  transition: transform 0.3s ease;
}

.network-status-enter-from,
.network-status-leave-to {
  transform: translateY(-100%);
}
</style>