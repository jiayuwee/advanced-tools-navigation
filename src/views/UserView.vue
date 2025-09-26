<template>
  <div class="user-view">
    <div class="container">
      <h1>个人中心</h1>
      
      <div class="user-content">
        <!-- 用户信息侧边栏 -->
        <aside class="user-sidebar">
          <div class="user-profile">
            <div class="avatar-section">
              <img 
                :src="user?.avatar_url || '/default-avatar.png'" 
                :alt="user?.full_name"
                class="user-avatar"
              />
              <div class="user-info">
                <h2>{{ user?.full_name || '用户' }}</h2>
                <p class="user-email">{{ user?.email }}</p>
                <span class="user-role">{{ formatRole(user?.role) }}</span>
              </div>
            </div>
            
            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-value">{{ favoritesCount }}</div>
                <div class="stat-label">收藏</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ ordersCount }}</div>
                <div class="stat-label">订单</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ reviewsCount }}</div>
                <div class="stat-label">评价</div>
              </div>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav class="user-nav">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path"
              :class="['nav-item', { active: $route.path === item.path }]"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </nav>
        </aside>

        <!-- 主要内容区域 -->
        <main class="user-main">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const favoritesCount = ref(0)
const ordersCount = ref(0)
const reviewsCount = ref(0)

const user = computed(() => authStore.user)

const navItems = [
  { path: '/user/profile', label: '个人资料', icon: '👤' },
  { path: '/user/favorites', label: '我的收藏', icon: '❤️' },
  { path: '/user/orders', label: '我的订单', icon: '📦' }
]

onMounted(async () => {
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  // 加载用户统计数据
  await loadUserStats()
})

function formatRole(role: string | undefined): string {
  const roleMap: Record<string, string> = {
    'user': '普通用户',
    'admin': '管理员',
    'super_admin': '超级管理员'
  }
  return roleMap[role || 'user'] || '用户'
}

async function loadUserStats() {
  // 这里应该调用API获取用户统计数据
  // 暂时使用模拟数据
  favoritesCount.value = 12
  ordersCount.value = 5
  reviewsCount.value = 8
}
</script>

<style scoped>
.user-view {
  min-height: 100vh;
  padding: 2rem;
  background: hsl(var(--background));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: hsl(var(--foreground));
  margin-bottom: 2rem;
  text-align: center;
}

.user-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.user-sidebar {
  background: hsl(var(--card));
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid hsl(var(--border));
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.user-profile {
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid hsl(var(--primary));
}

.user-info h2 {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: 1.3rem;
}

.user-email {
  margin: 0.25rem 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
}

.user-role {
  display: inline-block;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid hsl(var(--border));
  padding-top: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: hsl(var(--primary));
}

.stat-label {
  font-size: 0.8rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.25rem;
}

.user-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  text-decoration: none;
  color: hsl(var(--muted-foreground));
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-item:hover {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.nav-item.active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-label {
  font-weight: 500;
}

.user-main {
  background: hsl(var(--card));
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid hsl(var(--border));
  min-height: 500px;
}

@media (max-width: 768px) {
  .user-content {
    grid-template-columns: 1fr;
  }
  
  .user-sidebar {
    position: static;
  }
  
  .user-view {
    padding: 1rem;
  }
}
</style>
