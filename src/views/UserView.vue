<template>
  <div class="user-view">
    <div class="container">
      <h1>个人中心</h1>
      <p>用户功能正在开发中...</p>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
// 用户中心页面占位符
</script>

<style scoped>
.user-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #323130;
  margin-bottom: 1rem;
}

p {
  color: #605e5c;
}
</style>
