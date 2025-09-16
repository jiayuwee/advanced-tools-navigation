<template>
  <div id="app">
    <!-- 全局错误处理器 -->
    <GlobalErrorHandler />

    <!-- 全局顶部导航栏 -->
    <AppHeader />

    <!-- 路由视图 -->
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>

    <!-- 全局Footer -->
    <AppFooter />

    <!-- 反馈组件 -->
    <FeedbackWidget />

    <!-- 底部状态栏 -->
    <SimpleStatusBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onErrorCaptured } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import FeedbackWidget from "./components/feedback/FeedbackWidget.vue";
import SimpleStatusBar from "./components/StatusBar.vue";
import GlobalErrorHandler from "./components/error/GlobalErrorHandler.vue";
import { setupGlobalErrorHandler } from "./utils/errorHandler";

// 全局错误处理
onErrorCaptured((err, _vm, info) => {
  console.error("Vue组件错误:", err, info);
  // 错误已由 GlobalErrorHandler 组件处理
  return false; // 阻止错误继续传播
});

// 初始化
onMounted(() => {
  // 设置全局错误处理器
  setupGlobalErrorHandler();
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
