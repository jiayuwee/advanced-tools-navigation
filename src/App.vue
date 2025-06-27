<template>
  <div id="app">
    <!-- 全局错误提示 -->
    <div v-if="error" class="global-error">
      <div class="error-content">
        <span class="error-message">{{ error }}</span>
        <button class="error-close" @click="clearError">×</button>
      </div>
    </div>

    <!-- 路由视图 -->
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>

    <!-- 全局Footer -->
    <AppFooter />

    <!-- 开发环境状态栏 -->
    <SimpleStatusBar v-if="isDev" />

    <!-- 反馈组件 -->
    <FeedbackWidget />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from "vue";
// import { useRouter } from "vue-router"; // 已移除未使用
import AppFooter from "./components/AppFooter.vue";
import SimpleStatusBar from "./components/SimpleStatusBar.vue";
import FeedbackWidget from "./components/feedback/FeedbackWidget.vue";

// 开发环境判断
const isDev = import.meta.env.DEV;

// 全局错误处理
const error = ref<string | null>(null);
// const router = useRouter(); // 已移除未使用

const clearError = () => {
  error.value = null;
};

onErrorCaptured((err, _vm, info) => {
  console.error("全局错误:", err, info);
  error.value = err instanceof Error ? err.message : "发生未知错误";
  return false; // 阻止错误继续传播
});

// 初始化
onMounted(() => {
  // 设置全局错误处理器
  window.addEventListener("error", (e) => {
    console.error("页面加载错误:", e.error);
    error.value = e.error?.message || "页面加载失败";
  });

  // 监听离线状态
  window.addEventListener("offline", () => {
    error.value = "网络连接已断开";
  });
});
</script>

<style scoped>
/* 基础样式 */
#app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 32px; /* 为状态栏留出空间 */
}

/* 全局错误提示 */
.global-error {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: #dc3545;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-message {
  font-size: 0.875rem;
}

.error-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.error-close:hover {
  opacity: 1;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
