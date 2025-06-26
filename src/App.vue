<template>
  <div id="app">
    <!-- 路由视图 -->
    <RouterView />
    <!-- 全局Footer -->
    <AppFooter />
    <!-- 底部状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import AppFooter from "./components/AppFooter.vue";
import StatusBar from "./components/StatusBar.vue";
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

/* 状态栏固定在底部 */
#app > :last-child {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
