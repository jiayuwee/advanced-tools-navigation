<template>
  <div class="fluent-app">
    <!-- 搜索快捷键监听 -->
    <div tabindex="-1" class="app-container" @keydown="handleKeydown">
      <!-- 顶部导航栏 -->
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
            <div class="app-title">
              <div class="title-icon">🚀</div>
              <div class="title-text">
                <h1>工具导航站</h1>
                <span>让工作更高效</span>
              </div>
            </div>
          </div>

          <div class="header-center">
            <div class="search-container">
              <SearchIcon class="search-icon" />
              <input
                ref="searchInput"
                v-model="toolsStore.searchQuery"
                type="text"
                placeholder="搜索工具... (Ctrl+K)"
                class="search-input"
                @focus="searchFocused = true"
                @blur="searchFocused = false"
                @keydown.enter="handleSearchEnter"
              />
              <div
                v-if="!searchFocused && !toolsStore.searchQuery"
                class="search-shortcut"
              >
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </div>

              <!-- 外部搜索按钮 -->
              <button
                v-if="toolsStore.searchQuery.trim()"
                class="external-search-btn"
                title="在Google中搜索"
                @click="searchExternal"
              >
                🌐
              </button>
            </div>
          </div>

          <div class="header-right">
            <button
              class="header-button"
              :class="{ active: toolsStore.showFavoritesOnly }"
              @click="handleFavoritesClick"
            >
              <StarIcon class="icon" />
              <span>收藏</span>
            </button>
            <button class="user-avatar" @click="handleUserClick">
              <UserIcon class="icon" />
            </button>
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <div class="app-main">
        <!-- 侧边栏 -->
        <aside
          class="sidebar"
          :class="{ collapsed: toolsStore.sidebarCollapsed }"
        >
          <div class="sidebar-content">
            <!-- 分类导航 -->
            <nav class="category-nav">
              <div class="nav-section">
                <h3 class="nav-title">导航</h3>
                <ul class="nav-list">
                  <li>
                    <button
                      class="nav-item"
                      :class="{ active: toolsStore.selectedCategory === 'all' }"
                      @click="toolsStore.setSelectedCategory('all')"
                    >
                      <div class="nav-icon">🏠</div>
                      <span class="nav-text">全部工具</span>
                      <span class="nav-count">{{
                        toolsStore.tools.length
                      }}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      class="nav-item"
                      :class="{
                        active: toolsStore.selectedCategory === 'favorites',
                      }"
                      @click="toolsStore.setSelectedCategory('favorites')"
                    >
                      <div class="nav-icon">⭐</div>
                      <span class="nav-text">我的收藏</span>
                      <span class="nav-count">{{
                        toolsStore.favoriteTools.length
                      }}</span>
                    </button>
                  </li>
                  <li>
                    <button class="nav-item" @click="handleProductsClick">
                      <div class="nav-icon">🛍️</div>
                      <span class="nav-text">产品展示</span>
                      <span class="nav-count">12</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div class="nav-section">
                <h3 class="nav-title">分类</h3>
                <ul class="nav-list">
                  <li
                    v-for="category in toolsStore.categories"
                    :key="category.id"
                  >
                    <button
                      class="nav-item"
                      :class="{
                        active: toolsStore.selectedCategory === category.id,
                      }"
                      @click="toolsStore.setSelectedCategory(category.id)"
                    >
                      <div class="nav-icon">{{ category.icon }}</div>
                      <span class="nav-text">{{ category.name }}</span>
                      <span class="nav-count">{{ category.count }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </aside>

        <!-- 内容区域 -->
        <main
          class="content"
          :class="{ 'sidebar-collapsed': toolsStore.sidebarCollapsed }"
        >
          <!-- Hero区域 - 只在首页显示 -->
          <div
            v-if="toolsStore.selectedCategory === 'all'"
            class="hero-section"
          >
            <div class="hero-content">
              <h1 class="hero-title">发现优质工具</h1>
              <p class="hero-subtitle">精选高效工具，提升工作效率</p>
              <div class="hero-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ toolsStore.tools.length }}</span>
                  <span class="stat-label">精选工具</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{
                    toolsStore.categories.length
                  }}</span>
                  <span class="stat-label">工具分类</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{
                    toolsStore.favoriteTools.length
                  }}</span>
                  <span class="stat-label">我的收藏</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-header">
            <div class="content-title">
              <h2>{{ getCurrentCategoryName() }}</h2>
              <span class="content-count"
                >{{ toolsStore.filteredTools.length }} 个工具</span
              >
            </div>

            <div class="content-actions">
              <div class="view-options">
                <button class="view-button active">
                  <GridIcon class="icon" />
                </button>
              </div>
            </div>
          </div>

          <!-- 工具网格 -->
          <div v-if="toolsStore.filteredTools.length > 0" class="tools-grid">
            <div
              v-for="tool in toolsStore.filteredTools"
              :key="tool.id"
              class="tool-card"
              @click="handleToolClick(tool)"
            >
              <div class="card-header">
                <div class="tool-icon">{{ tool.icon }}</div>
                <button
                  class="favorite-button"
                  :class="{ active: tool.isFavorite }"
                  @click.stop="toolsStore.toggleFavorite(tool.id)"
                >
                  <StarIcon class="icon" />
                </button>
              </div>

              <div class="card-content">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-description">{{ tool.description }}</p>

                <div class="tool-tags">
                  <span
                    v-for="tag in (tool.tags || []).slice(0, 3)"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="(tool.tags || []).length > 3" class="tag more">
                    +{{ (tool.tags || []).length - 3 }}
                  </span>
                </div>
              </div>

              <div class="card-footer">
                <div class="tool-stats">
                  <span class="stat">
                    <EyeIcon class="stat-icon" />
                    {{ tool.clickCount }}
                  </span>
                </div>
                <ExternalLinkIcon class="external-icon" />
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>未找到相关工具</h3>
            <p>尝试使用其他关键词搜索，或浏览其他分类</p>
            <button class="empty-action" @click="toolsStore.setSearchQuery('')">
              清除搜索条件
            </button>
          </div>

          <!-- 底部空间 -->
          <div class="bottom-spacer"></div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useToolsStore } from "../stores/tools";
import {
  MenuIcon,
  SearchIcon,
  StarIcon,
  UserIcon,
  GripIcon as GridIcon,
  ExternalLinkIcon,
  EyeIcon,
} from "lucide-vue-next";

const toolsStore = useToolsStore();
const searchInput = ref(null);
const searchFocused = ref(false);

// 获取当前分类名称
const getCurrentCategoryName = () => {
  if (toolsStore.selectedCategory === "all") return "全部工具";
  if (toolsStore.selectedCategory === "favorites") return "我的收藏";

  const category = toolsStore.categories.find(
    (c) => c.id === toolsStore.selectedCategory
  );
  return category ? category.name : "未知分类";
};

// 处理工具点击
const handleToolClick = (tool) => {
  toolsStore.incrementClickCount(tool.id);
  window.open(tool.url, "_blank", "noopener,noreferrer");
};

// 处理搜索回车
const handleSearchEnter = () => {
  if (toolsStore.searchQuery.trim()) {
    searchExternal();
  }
};

// 外部搜索
const searchExternal = () => {
  const query = toolsStore.searchQuery.trim();
  if (query) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " 工具")}`;
    window.open(searchUrl, "_blank", "noopener,noreferrer");
  }
};

// 处理收藏按钮点击
const handleFavoritesClick = () => {
  // 直接跳转到收藏页面
  toolsStore.setSelectedCategory("favorites");
};

// 处理用户头像点击
const handleUserClick = () => {
  // 跳转到用户中心
  window.open("/user/profile", "_blank");
};

// 处理产品模块点击
const handleProductsClick = () => {
  // 跳转到产品页面
  window.open("/products", "_blank");
};

// 处理快捷键
const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    searchInput.value?.focus();
  }

  if (event.key === "Escape") {
    searchInput.value?.blur();
    toolsStore.setSearchQuery("");
  }
};

// 初始化
onMounted(async () => {
  if (!toolsStore.initialized) {
    await toolsStore.initialize();
  }
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* Fluent Design 基础样式 */
.fluent-app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: calc(100vh - 200px); /* 为Footer留出空间 */
  color: #323130;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 200px); /* 改为min-height，为Footer留出空间 */
  outline: none;
}

/* 顶部导航栏 */
.app-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 50px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
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
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar-toggle.active {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
}

.title-text h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #323130;
}

.title-text span {
  font-size: 12px;
  color: #605e5c;
}

/* 搜索区域 */
.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 40px 0 36px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #605e5c;
  pointer-events: none;
}

.search-shortcut {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #8a8886;
  pointer-events: none;
}

.search-shortcut kbd {
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  font-size: 10px;
}

.external-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0, 120, 212, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  z-index: 2;
}

.external-search-btn:hover {
  background: rgba(0, 120, 212, 0.2);
  transform: translateY(-50%) scale(1.1);
}

/* 右侧操作区 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.header-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-button.active {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  background: linear-gradient(135deg, #106ebe, #005a9e);
  transform: scale(1.05);
}

/* 主要内容区域 */
.app-main {
  display: flex;
  flex: 1;
  overflow: visible; /* 改为 visible 以确保状态栏可见 */
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow-y: auto;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-content {
  padding: 20px;
}

.sidebar.collapsed .sidebar-content {
  padding: 20px 8px;
}

/* 分类导航 */
.nav-section {
  margin-bottom: 32px;
}

.nav-title {
  font-size: 12px;
  font-weight: 600;
  color: #8a8886;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  padding: 0 12px;
}

.sidebar.collapsed .nav-title {
  display: none;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-item.active {
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
  font-weight: 500;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.nav-count {
  font-size: 12px;
  color: #8a8886;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.sidebar.collapsed .nav-count {
  display: none;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* Hero区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 0;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  font-weight: 400;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #fff;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
}

.content.sidebar-collapsed {
  margin-left: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 20px 20px 0 20px;
}

.content-title h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.content-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12px;
}

.content-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-button {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
}

.view-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.view-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 20px 40px 20px;
}

.tool-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tool-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.favorite-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8a8886;
}

.favorite-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.favorite-button.active {
  color: #ffb900;
}

.card-content {
  margin-bottom: 16px;
}

.tool-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #323130;
}

.tool-description {
  font-size: 14px;
  color: #605e5c;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 8px;
  background: rgba(0, 120, 212, 0.1);
  color: #0078d4;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.more {
  background: rgba(0, 0, 0, 0.05);
  color: #8a8886;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tool-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8a8886;
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.external-icon {
  width: 16px;
  height: 16px;
  color: #8a8886;
  transition: all 0.2s ease;
}

.tool-card:hover .external-icon {
  color: #0078d4;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.7);
}

.empty-action {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 底部空间 - 为Footer和StatusBar留出空间 */
.bottom-spacer {
  height: 60px; /* 增加高度为状态栏留出空间 */
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .header-center {
    margin: 0 16px;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 50px;
    height: calc(100vh - 250px); /* 为Footer留出空间 */
    z-index: 90;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .hero-section {
    padding: 40px 16px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-stats {
    gap: 30px;
    flex-wrap: wrap;
  }

  .stat-number {
    font-size: 28px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px 40px 16px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 16px 0 16px;
  }
}

@media (max-width: 480px) {
  .app-title .title-text span {
    display: none;
  }

  .header-button span {
    display: none;
  }

  .search-shortcut {
    display: none;
  }

  .hero-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 24px;
  }

  .bottom-spacer {
    height: 60px;
  }
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
}
</style>
