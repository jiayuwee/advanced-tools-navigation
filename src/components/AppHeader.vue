<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <button
          class="sidebar-toggle"
          :class="{ active: !toolsStore.sidebarCollapsed }"
          @click="toolsStore.toggleSidebar()"
        >
          <MenuIcon class="icon" />
        </button>
        <router-link to="/" class="app-title">
          <div class="title-icon">🚀</div>
          <div class="title-text">
            <h1>工具导航站</h1>
            <span>让工作更高效</span>
          </div>
        </router-link>
      </div>

      <div class="header-center">
        <div class="search-container">
          <SearchIcon class="search-icon" />
          <input
            ref="searchInput"
            v-model="toolsStore.searchQuery"
            type="text"
            placeholder="搜索工具、分类或功能..."
            class="search-input"
            @keydown.enter="handleSearch"
            @keydown.esc="clearSearch"
          />
          <div class="search-actions">
            <button
              v-if="toolsStore.searchQuery"
              class="clear-search"
              @click="clearSearch"
            >
              <XIcon class="icon" />
            </button>
            <div class="search-shortcut">Ctrl+K</div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- 主题切换 -->
        <ThemeSelector />

        <!-- 通知中心 -->
        <NotificationCenter />

        <!-- 用户菜单 -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <button class="user-avatar" @click="toggleUserMenu">
            <img
              v-if="authStore.user?.avatarUrl"
              :src="authStore.user.avatarUrl"
              :alt="authStore.user.username"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ authStore.user?.username?.charAt(0).toUpperCase() }}
            </div>
          </button>

          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-info">
              <div class="user-name">{{ authStore.user?.username }}</div>
              <div class="user-email">{{ authStore.user?.email }}</div>
            </div>
            <div class="menu-divider"></div>
            <router-link
              to="/user/profile"
              class="menu-item"
              @click="closeUserMenu"
            >
              <UserIcon class="icon" />
              个人资料
            </router-link>
            <router-link
              to="/user/favorites"
              class="menu-item"
              @click="closeUserMenu"
            >
              <StarIcon class="icon" />
              我的收藏
            </router-link>
            <router-link
              to="/user/orders"
              class="menu-item"
              @click="closeUserMenu"
            >
              <PackageIcon class="icon" />
              我的订单
            </router-link>
            <div class="menu-divider"></div>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="menu-item"
              @click="closeUserMenu"
            >
              <SettingsIcon class="icon" />
              管理后台
            </router-link>
            <button class="menu-item logout" @click="handleLogout">
              <LogOutIcon class="icon" />
              退出登录
            </button>
          </div>
        </div>

        <!-- 登录按钮 -->
        <router-link v-else to="/auth/login" class="login-btn">
          <UserIcon class="icon" />
          登录
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useToolsStore } from "@/stores/tools";
import { useAuthStore } from "@/stores/auth";
import ThemeSelector from "@/components/theme/ThemeSelector.vue";
import NotificationCenter from "@/components/notifications/NotificationCenter.vue";

// Icons
import {
  MenuIcon,
  SearchIcon,
  XIcon,
  UserIcon,
  StarIcon,
  PackageIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-vue-next";

const router = useRouter();
const toolsStore = useToolsStore();
const authStore = useAuthStore();

const searchInput = ref<HTMLInputElement>();
const showUserMenu = ref(false);

// 搜索功能
const handleSearch = () => {
  if (toolsStore.searchQuery.trim()) {
    router.push({
      name: "Tools",
      query: { search: toolsStore.searchQuery.trim() },
    });
  }
};

const clearSearch = () => {
  toolsStore.searchQuery = "";
  searchInput.value?.focus();
};

// 用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    closeUserMenu();
    router.push("/");
  } catch (error) {
    console.error("退出登录失败:", error);
  }
};

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+K 聚焦搜索框
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    searchInput.value?.focus();
  }

  // ESC 关闭用户菜单
  if (event.key === "Escape") {
    showUserMenu.value = false;
  }
};

// 点击外部关闭用户菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar-toggle.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.app-title:hover {
  opacity: 0.8;
}

.title-icon {
  font-size: 32px;
}

.title-text h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.title-text span {
  font-size: 12px;
  color: #6b7280;
  margin-top: -2px;
}

.header-center {
  flex: 1;
  max-width: 600px;
  margin: 0 32px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 14px;
  outline: none;
  color: #1f2937;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-search {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.search-shortcut {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 50%;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  z-index: 1001;
}

.user-info {
  padding: 16px;
  background: #f9fafb;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.logout {
  color: #dc2626;
}

.menu-item.logout:hover {
  background: #fef2f2;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.icon {
  width: 16px;
  height: 16px;
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .app-header {
    background: rgba(17, 24, 39, 0.95);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .title-text h1 {
    color: #f9fafb;
  }

  .title-text span {
    color: #9ca3af;
  }

  .search-container {
    background: #374151;
    border-color: #4b5563;
  }

  .search-input {
    color: #f9fafb;
  }

  .search-input::placeholder {
    color: #6b7280;
  }

  .search-shortcut {
    background: #4b5563;
    color: #d1d5db;
  }

  .user-dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .user-info {
    background: #111827;
  }

  .user-name {
    color: #f9fafb;
  }

  .menu-divider {
    background: #374151;
  }

  .menu-item {
    color: #d1d5db;
  }

  .menu-item:hover {
    background: #374151;
  }

  .menu-item.logout:hover {
    background: #7f1d1d;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .header-center {
    margin: 0 16px;
  }

  .title-text h1 {
    font-size: 18px;
  }

  .title-text span {
    display: none;
  }

  .search-shortcut {
    display: none;
  }
}
</style>
