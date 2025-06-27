<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面未找到</h1>
        <p class="error-message">抱歉，您访问的页面不存在或已被移除</p>

        <div class="error-actions">
          <router-link to="/" class="btn btn-primary">
            <HomeIcon class="icon" />
            返回首页
          </router-link>
          <button class="btn btn-secondary" @click="goBack">
            <ArrowLeftIcon class="icon" />
            返回上页
          </button>
        </div>

        <div class="suggestions">
          <h3>您可能在寻找：</h3>
          <div class="suggestion-links">
            <router-link to="/tools" class="suggestion-item">
              <WrenchIcon class="suggestion-icon" />
              <div>
                <div class="suggestion-title">工具导航</div>
                <div class="suggestion-desc">发现实用工具</div>
              </div>
            </router-link>

            <router-link to="/products" class="suggestion-item">
              <ShoppingBagIcon class="suggestion-icon" />
              <div>
                <div class="suggestion-title">产品展示</div>
                <div class="suggestion-desc">浏览优质产品</div>
              </div>
            </router-link>

            <router-link to="/user/profile" class="suggestion-item">
              <UserIcon class="suggestion-icon" />
              <div>
                <div class="suggestion-title">个人中心</div>
                <div class="suggestion-desc">管理您的账户</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="not-found-illustration">
        <div class="illustration-content">
          <div class="floating-elements">
            <div class="element element-1">🔍</div>
            <div class="element element-2">📄</div>
            <div class="element element-3">❓</div>
            <div class="element element-4">🚀</div>
          </div>
          <div class="main-illustration">
            <div class="search-icon">🔍</div>
            <div class="broken-link">🔗</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  HomeIcon,
  ArrowLeftIcon,
  WrenchIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-vue-next";

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-container {
  max-width: 1000px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.not-found-content {
  color: white;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.error-message {
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.icon {
  width: 20px;
  height: 20px;
}

.suggestions h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.suggestion-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

.suggestion-icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.suggestion-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.suggestion-desc {
  font-size: 0.875rem;
  opacity: 0.8;
}

.not-found-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-content {
  position: relative;
  width: 300px;
  height: 300px;
}

.floating-elements {
  position: absolute;
  inset: 0;
}

.element {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

.element-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  top: 20%;
  right: 10%;
  animation-delay: 0.5s;
}

.element-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 1s;
}

.element-4 {
  bottom: 10%;
  right: 15%;
  animation-delay: 1.5s;
}

.main-illustration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.search-icon {
  font-size: 4rem;
  animation: pulse 2s ease-in-out infinite;
}

.broken-link {
  font-size: 3rem;
  opacity: 0.7;
  animation: shake 1s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .not-found-illustration {
    order: -1;
  }

  .illustration-content {
    width: 200px;
    height: 200px;
  }

  .element {
    font-size: 1.5rem;
  }

  .search-icon {
    font-size: 3rem;
  }

  .broken-link {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .not-found-view {
    padding: 1rem;
  }

  .error-code {
    font-size: 4rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
}
</style>
