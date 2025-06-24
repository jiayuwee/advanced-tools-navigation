<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <router-link to="/" class="logo">
          <div class="logo-icon">🚀</div>
          <div class="logo-text">工具导航站</div>
        </router-link>
      </div>
      
      <div class="auth-content">
        <router-view />
      </div>
      
      <div class="auth-footer">
        <p>&copy; 2024 工具导航站. 保留所有权利.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 认证页面布局组件
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #323130;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.auth-content {
  margin-bottom: 2rem;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #605e5c;
}

.auth-footer p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-view {
    padding: 1rem;
  }
  
  .auth-container {
    padding: 1.5rem;
  }
}
</style>
