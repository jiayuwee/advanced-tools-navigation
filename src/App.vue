<template>
  <div id="app">
    <!-- 路由视图 -->
    <RouterView />
    <!-- 全局Footer -->
    <AppFooter />
    <!-- 底部状态栏 -->
    <SimpleStatusBar />
  </div>
</template>

<script setup lang="ts">
import AppFooter from "./components/AppFooter.vue";
import SimpleStatusBar from "./components/SimpleStatusBar.vue";
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

/* 确保路由视图占据剩余空间，但不会隐藏Footer */
#app > :first-child {
  flex: 1 0 auto;
  min-height: 0;
}

/* 确保Footer始终可见 */
#app > :nth-child(2) {
  flex-shrink: 0;
}

/* 状态栏固定在底部 - 移除这个样式，让组件自己控制 */
</style>
