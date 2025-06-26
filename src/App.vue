<template>
  <div id="app">
    <!-- 路由视图 -->
    <RouterView />
    <!-- 全局Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from "./components/AppFooter.vue";
</script>

<style scoped>
/* 基础样式 */
#app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 确保路由视图占据剩余空间 */
#app > :first-child {
  flex: 1;
}
</style>
