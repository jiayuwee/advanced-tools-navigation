<template>
  <div id="app" class="fluent-app">
    <!-- 全局导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="app-title">
            <div class="title-icon">🚀</div>
            <div class="title-text">
              <h1>工具导航站</h1>
              <span>让工作更高效</span>
            </div>
          </router-link>
        </div>

        <nav class="header-nav">
          <router-link to="/" class="nav-link" exact-active-class="active">
            <HomeIcon class="icon" />
            首页
          </router-link>
          <router-link to="/tools" class="nav-link" active-class="active">
            <WrenchIcon class="icon" />
            工具
          </router-link>
          <router-link to="/products" class="nav-link" active-class="active">
            <ShoppingBagIcon class="icon" />
            产品
          </router-link>
        </nav>

        <div class="header-right">
          <!-- 快速搜索 -->
          <div class="quick-search">
            <button class="search-trigger" @click="openQuickSearch">
              <SearchIcon class="icon" />
              <span class="search-text">搜索...</span>
              <kbd class="search-shortcut">Ctrl+K</kbd>
            </button>
          </div>

          <!-- 用户菜单 -->
          <div class="user-menu" @click="toggleUserMenu">
            <div class="user-avatar">
              <UserIcon class="icon" />
            </div>
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/user/profile" class="dropdown-item">
                <UserIcon class="icon" />
                个人资料
              </router-link>
              <router-link to="/user/favorites" class="dropdown-item">
                <StarIcon class="icon" />
                我的收藏
              </router-link>
              <router-link to="/user/orders" class="dropdown-item">
                <ShoppingCartIcon class="icon" />
                我的订单
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="handleLogout">
                <LogOutIcon class="icon" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 快速搜索模态框 -->
    <div v-if="showQuickSearch" class="quick-search-modal" @click="closeQuickSearch">
      <div class="search-modal-content" @click.stop>
        <div class="search-modal-header">
          <SearchIcon class="search-icon" />
          <input
            ref="quickSearchInput"
            v-model="quickSearchQuery"
            type="text"
            placeholder="搜索工具和产品..."
            class="search-modal-input"
            @keydown="handleQuickSearchKeydown"
          />
          <button class="close-search" @click="closeQuickSearch">
            <XIcon class="icon" />
          </button>
        </div>

        <div v-if="quickSearchResults.length > 0" class="search-results">
          <div
            v-for="(result, index) in quickSearchResults"
            :key="result.id"
            class="search-result-item"
            :class="{ active: selectedResultIndex === index }"
            @click="selectSearchResult(result)"
            @mouseenter="selectedResultIndex = index"
          >
            <div class="result-icon">{{ result.icon || '🔧' }}</div>
            <div class="result-info">
              <div class="result-name">{{ result.name }}</div>
              <div class="result-description">{{ result.description }}</div>
            </div>
            <div class="result-type">{{ result.type }}</div>
          </div>
        </div>

        <div v-else-if="quickSearchQuery" class="search-empty">
          <div class="empty-icon">🔍</div>
          <p>未找到相关结果</p>
        </div>

        <div v-else class="search-tips">
          <div class="tip-item"><kbd>↑</kbd><kbd>↓</kbd> 导航</div>
          <div class="tip-item"><kbd>Enter</kbd> 选择</div>
          <div class="tip-item"><kbd>Esc</kbd> 关闭</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from './stores/tools'
import {
  HomeIcon,
  WrenchIcon,
  ShoppingBagIcon,
  SearchIcon,
  UserIcon,
  StarIcon,
  ShoppingCartIcon,
  LogOutIcon,
  XIcon,
} from 'lucide-vue-next'

const router = useRouter()
const toolsStore = useToolsStore()

// 响应式状态
const showUserMenu = ref(false)
const showQuickSearch = ref(false)
const quickSearchInput = ref<HTMLInputElement>()
const quickSearchQuery = ref('')
const selectedResultIndex = ref(0)

// 搜索结果
const quickSearchResults = computed(() => {
  if (!quickSearchQuery.value.trim()) return []

  const query = quickSearchQuery.value.toLowerCase()
  const results: any[] = []

  // 搜索工具
  toolsStore.tools.forEach(tool => {
    if (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.name.toLowerCase().includes(query))
    ) {
      results.push({
        ...tool,
        type: '工具',
      })
    }
  })

  return results.slice(0, 8) // 限制结果数量
})

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const openQuickSearch = () => {
  showQuickSearch.value = true
  setTimeout(() => {
    quickSearchInput.value?.focus()
  }, 100)
}

const closeQuickSearch = () => {
  showQuickSearch.value = false
  quickSearchQuery.value = ''
  selectedResultIndex.value = 0
}

const handleQuickSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeQuickSearch()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedResultIndex.value = Math.min(
      selectedResultIndex.value + 1,
      quickSearchResults.value.length - 1
    )
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedResultIndex.value = Math.max(selectedResultIndex.value - 1, 0)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const selectedResult = quickSearchResults.value[selectedResultIndex.value]
    if (selectedResult) {
      selectSearchResult(selectedResult)
    }
  }
}

const selectSearchResult = (result: any) => {
  if (result.type === '工具') {
    router.push(`/tools?search=${encodeURIComponent(result.name)}`)
    toolsStore.incrementClickCount(result.id)
    window.open(result.url, '_blank', 'noopener,noreferrer')
  } else if (result.type === '产品') {
    router.push(`/product/${result.id}`)
  }
  closeQuickSearch()
}

const handleLogout = () => {
  // TODO: 实现登出逻辑
  console.log('用户登出')
  showUserMenu.value = false
}

// 全局键盘事件
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    openQuickSearch()
  }
}

// 点击外部关闭用户菜单
const handleClickOutside = (event: Event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 初始化工具数据
  if (!toolsStore.initialized) {
    await toolsStore.initialize()
  }

  // 添加全局事件监听
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fluent-app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  background: #f8f9fa;
  color: #323130;
}

/* 全局导航栏 */
.app-header {
  background: white;
  border-bottom: 1px solid #e1dfdd;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.app-title:hover {
  transform: scale(1.02);
}

.title-icon {
  font-size: 24px;
}

.title-text h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #323130;
}

.title-text span {
  font-size: 12px;
  color: #605e5c;
  display: block;
  margin-top: -2px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  text-decoration: none;
  color: #605e5c;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #f3f2f1;
  color: #323130;
}

.nav-link.active {
  background: #e3f2fd;
  color: #0078d4;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quick-search {
  position: relative;
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  background: #f3f2f1;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #605e5c;
  min-width: 200px;
  justify-content: space-between;
}

.search-trigger:hover {
  background: #e1dfdd;
}

.search-text {
  font-size: 14px;
}

.search-shortcut {
  background: white;
  border: 1px solid #c8c6c4;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 11px;
  color: #8a8886;
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #0078d4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
}

.user-avatar:hover {
  background: #106ebe;
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e1dfdd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 16px;
  text-decoration: none;
  color: #323130;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f3f2f1;
}

.dropdown-divider {
  height: 1px;
  background: #e1dfdd;
  margin: 4px 0;
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  min-height: calc(100vh - 64px);
}

/* 快速搜索模态框 */
.quick-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  overflow: hidden;
  margin: 0 20px;
}

.search-modal-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e1dfdd;
  gap: 12px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #605e5c;
}

.search-modal-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #323130;
}

.search-modal-input::placeholder {
  color: #8a8886;
}

.close-search {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #605e5c;
  transition: all 0.2s ease;
}

.close-search:hover {
  background: #f3f2f1;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
}

.search-result-item:hover,
.search-result-item.active {
  background: #f3f2f1;
}

.result-icon {
  font-size: 20px;
  width: 32px;
  text-align: center;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 14px;
  font-weight: 500;
  color: #323130;
  margin-bottom: 2px;
}

.result-description {
  font-size: 12px;
  color: #605e5c;
  line-height: 1.4;
}

.result-type {
  font-size: 12px;
  color: #8a8886;
  background: #f3f2f1;
  padding: 2px 8px;
  border-radius: 10px;
}

.search-empty {
  text-align: center;
  padding: 40px 20px;
  color: #8a8886;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.search-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  color: #8a8886;
  font-size: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tip-item kbd {
  background: #f3f2f1;
  border: 1px solid #e1dfdd;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 10px;
  color: #605e5c;
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
