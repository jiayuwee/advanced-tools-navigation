<template>
  <div class="admin-view">
    <div class="admin-header">
      <div class="container">
        <h1>管理后台</h1>
        <p>系统管理和数据统计</p>
      </div>
    </div>

    <div class="admin-content">
      <div class="container">
        <div class="admin-layout">
          <!-- 侧边导航 -->
          <nav class="admin-nav">
            <router-link
              to="/admin/dashboard"
              class="nav-item"
              active-class="active"
            >
              <BarChart3Icon class="nav-icon" />
              仪表盘
            </router-link>
            <router-link
              to="/admin/tools"
              class="nav-item"
              active-class="active"
            >
              <WrenchIcon class="nav-icon" />
              工具管理
            </router-link>
            <router-link
              to="/admin/products"
              class="nav-item"
              active-class="active"
            >
              <ShoppingBagIcon class="nav-icon" />
              产品管理
            </router-link>
            <router-link
              to="/admin/users"
              class="nav-item"
              active-class="active"
            >
              <UsersIcon class="nav-icon" />
              用户管理
            </router-link>
            <router-link
              to="/admin/orders"
              class="nav-item"
              active-class="active"
            >
              <FileTextIcon class="nav-icon" />
              订单管理
            </router-link>
            <router-link
              to="/admin/local"
              class="nav-item"
              active-class="active"
            >
              <HardDriveIcon class="nav-icon" />
              本地管理
            </router-link>
            <div class="nav-divider"></div>
            <router-link to="/" class="nav-item">
              <HomeIcon class="nav-icon" />
              返回首页
            </router-link>
            <button class="nav-item logout-btn" @click="handleLogout">
              <LogOutIcon class="nav-icon" />
              退出登录
            </button>
          </nav>

          <!-- 主要内容区域 -->
          <main class="admin-main">
            <router-view />
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  BarChart3Icon,
  WrenchIcon,
  ShoppingBagIcon,
  UsersIcon,
  FileTextIcon,
  HardDriveIcon,
  HomeIcon,
  LogOutIcon,
} from "lucide-vue-next";
import { AuthService } from "../services/authService";
import { UserService } from "../services/userService";

const router = useRouter();

// 方法
const checkAdminAccess = async () => {
  try {
    const user = await UserService.getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/");
      return;
    }
  } catch (error) {
    console.error("检查管理员权限失败:", error);
    router.push("/auth/login");
  }
};

const handleLogout = async () => {
  try {
    await AuthService.logout();
    router.push("/");
  } catch (error) {
    console.error("退出登录失败:", error);
  }
};

// 生命周期
onMounted(() => {
  checkAdminAccess();
});
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-header {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.admin-header p {
  font-size: 1.125rem;
  margin: 0;
  text-align: center;
  opacity: 0.9;
}

.admin-content {
  padding: 2rem 0;
}

.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.admin-nav {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #605e5c;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.nav-item:hover {
  background: #f3f2f1;
  color: #323130;
}

.nav-item.active {
  background: #dc2626;
  color: white;
}

.nav-divider {
  height: 1px;
  background: #e1dfdd;
  margin: 1rem 0;
}

.nav-item.logout-btn {
  margin-top: 0.5rem;
}

.nav-item.logout-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.admin-main {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-header {
    padding: 1.5rem 0;
  }

  .admin-header h1 {
    font-size: 2rem;
  }

  .admin-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .admin-nav {
    position: static;
    order: 2;
    display: flex;
    overflow-x: auto;
    padding: 1rem;
    gap: 0.5rem;
  }

  .nav-item {
    white-space: nowrap;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .nav-divider {
    display: none;
  }

  .admin-main {
    order: 1;
    padding: 1.5rem;
  }
}
</style>
