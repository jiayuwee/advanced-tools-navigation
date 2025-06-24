<template>
  <div id="app" class="fluent-app">
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
              />
              <div v-if="!searchFocused && !toolsStore.searchQuery" class="search-shortcut">
                <kbd>Ctrl</kbd> + <kbd>K</kbd>
              </div>
            </div>
          </div>

          <div class="header-right">
            <button
              class="header-button"
              :class="{ active: toolsStore.showFavoritesOnly }"
              @click="toolsStore.toggleFavoritesOnly()"
            >
              <StarIcon class="icon" />
              <span>收藏</span>
            </button>
            <div class="user-avatar">
              <UserIcon class="icon" />
            </div>
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <div class="app-main">
        <!-- 侧边栏 -->
        <aside class="sidebar" :class="{ collapsed: toolsStore.sidebarCollapsed }">
          <div class="sidebar-content">
            <!-- 分类导航 -->
            <nav class="category-nav">
              <div class="nav-section">
                <h3 class="nav-title">导航</h3>
                <ul class="nav-list">
                  <li>
                    <button
                      class="nav-item"
                      :class="{
                        active: currentView === 'tools' && toolsStore.selectedCategory === 'all',
                      }"
                      @click="
                        () => {
                          setCurrentView('tools')
                          toolsStore.setSelectedCategory('all')
                        }
                      "
                    >
                      <div class="nav-icon">🏠</div>
                      <span class="nav-text">全部工具</span>
                      <span class="nav-count">{{ toolsStore.tools.length }}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      class="nav-item"
                      :class="{
                        active:
                          currentView === 'tools' && toolsStore.selectedCategory === 'favorites',
                      }"
                      @click="
                        () => {
                          setCurrentView('tools')
                          toolsStore.setSelectedCategory('favorites')
                        }
                      "
                    >
                      <div class="nav-icon">⭐</div>
                      <span class="nav-text">我的收藏</span>
                      <span class="nav-count">{{ toolsStore.favoriteTools.length }}</span>
                    </button>
                  </li>
                  <li>
                    <button
                      class="nav-item"
                      :class="{ active: currentView === 'products' }"
                      @click="setCurrentView('products')"
                    >
                      <div class="nav-icon">📦</div>
                      <span class="nav-text">我的产品</span>
                      <span class="nav-count">{{ products.length }}</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div class="nav-section" v-if="currentView === 'tools'">
                <h3 class="nav-title">分类</h3>
                <ul class="nav-list">
                  <li v-for="category in toolsStore.categories" :key="category.id">
                    <button
                      class="nav-item"
                      :class="{ active: toolsStore.selectedCategory === category.id }"
                      @click="toolsStore.setSelectedCategory(category.id)"
                    >
                      <div class="nav-icon">{{ category.icon }}</div>
                      <span class="nav-text">{{ category.name }}</span>
                      <span class="nav-count">{{ category.count }}</span>
                    </button>
                  </li>
                </ul>
              </div>

              <!-- 产品分类 -->
              <div class="nav-section" v-if="currentView === 'products'">
                <h3 class="nav-title">产品分类</h3>
                <ul class="nav-list">
                  <li v-for="category in productCategories" :key="category.id">
                    <button
                      class="nav-item"
                      :class="{ active: selectedProductCategory === category.id }"
                      @click="setSelectedProductCategory(category.id)"
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
        <main class="content" :class="{ 'sidebar-collapsed': toolsStore.sidebarCollapsed }">
          <!-- 工具视图 -->
          <div v-if="currentView === 'tools'">
            <div class="content-header">
              <div class="content-title">
                <h2>{{ getCurrentCategoryName() }}</h2>
                <span class="content-count">{{ toolsStore.filteredTools.length }} 个工具</span>
              </div>

              <div class="content-actions">
                <div class="view-options">
                  <button class="view-button active">
                    <GripIcon class="icon" />
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
                    <span v-for="tag in tool.tags.slice(0, 3)" :key="tag" class="tag">
                      {{ tag }}
                    </span>
                    <span v-if="tool.tags.length > 3" class="tag more">
                      +{{ tool.tags.length - 3 }}
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
          </div>

          <!-- 产品视图 -->
          <div v-else-if="currentView === 'products'">
            <div class="content-header">
              <div class="content-title">
                <h2>{{ getCurrentProductCategoryName() }}</h2>
                <span class="content-count">{{ filteredProducts.length }} 个产品</span>
              </div>

              <div class="content-actions">
                <button class="add-product-btn" @click="showAddProductModal = true">
                  ➕ 添加产品
                </button>
              </div>
            </div>

            <!-- 产品网格 -->
            <div v-if="filteredProducts.length > 0" class="products-grid">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card"
                @click="handleProductClick(product)"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name" />
                  <div class="product-price">
                    <span class="price">¥{{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price"
                      >¥{{ product.originalPrice }}</span
                    >
                  </div>
                </div>

                <div class="product-content">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description }}</p>

                  <div class="product-tags">
                    <span v-for="tag in product.tags.slice(0, 3)" :key="tag" class="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <div class="product-footer">
                  <button class="buy-btn" @click.stop="handlePurchase(product)">💳 立即购买</button>
                  <button v-if="product.demoUrl" class="demo-btn" @click.stop="openDemo(product)">
                    👁️ 预览
                  </button>
                </div>
              </div>
            </div>

            <!-- 产品空状态 -->
            <div v-else class="empty-state">
              <div class="empty-icon">📦</div>
              <h3>暂无产品</h3>
              <p>还没有添加任何产品，点击上方按钮添加您的第一个产品</p>
              <button class="empty-action" @click="showAddProductModal = true">添加产品</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToolsStore } from './stores/tools'
import {
  MenuIcon,
  SearchIcon,
  StarIcon,
  UserIcon,
  GripIcon,
  ExternalLinkIcon,
  EyeIcon,
} from 'lucide-vue-next'

// 产品接口定义
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  tags: string[]
  demoUrl?: string
  downloadUrl?: string
  status: 'active' | 'coming-soon' | 'discontinued'
  createdAt: string
}

interface ProductCategory {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

const toolsStore = useToolsStore()
const searchInput = ref<HTMLInputElement | null>(null)
const searchFocused = ref(false)

// 视图状态
const currentView = ref<'tools' | 'products'>('tools')
const selectedProductCategory = ref('all')
const showAddProductModal = ref(false)

// 产品分类数据
const productCategories = ref<ProductCategory[]>([
  { id: 'app', name: '应用程序', icon: '📱', color: '#0078d4', count: 0 },
  { id: 'template', name: '开发模板', icon: '🎨', color: '#8764b8', count: 0 },
  { id: 'course', name: '在线课程', icon: '📚', color: '#107c10', count: 0 },
  { id: 'service', name: '技术服务', icon: '🔧', color: '#ff8c00', count: 0 },
])

// 产品数据
const products = ref<Product[]>([
  {
    id: '1',
    name: 'Vue 3 管理后台模板',
    description: '基于 Vue 3 + TypeScript + Element Plus 的现代化管理后台模板',
    price: 199,
    originalPrice: 299,
    image: '/placeholder.jpg',
    category: 'template',
    tags: ['Vue 3', 'TypeScript', 'Element Plus', '管理后台'],
    demoUrl: 'https://demo.example.com',
    downloadUrl: 'https://download.example.com',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'React Native 移动应用',
    description: '跨平台移动应用开发解决方案，支持 iOS 和 Android',
    price: 399,
    image: '/placeholder.jpg',
    category: 'app',
    tags: ['React Native', '移动开发', '跨平台'],
    demoUrl: 'https://demo.example.com',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Web 开发实战课程',
    description: '从零到一学习现代 Web 开发技术栈，包含实战项目',
    price: 299,
    image: '/placeholder.jpg',
    category: 'course',
    tags: ['Web开发', '实战教程', '前端'],
    status: 'active',
    createdAt: '2024-02-10',
  },
])

// 处理快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }

  if (event.key === 'Escape') {
    searchInput.value?.blur()
    toolsStore.setSearchQuery('')
  }
}

// 计算属性
const filteredProducts = computed(() => {
  let filtered = products.value

  if (selectedProductCategory.value !== 'all') {
    filtered = filtered.filter(product => product.category === selectedProductCategory.value)
  }

  return filtered
})

// 更新产品分类计数
const updateProductCategoryCounts = () => {
  productCategories.value.forEach(category => {
    category.count = products.value.filter(product => product.category === category.id).length
  })
}

// 获取当前分类名称
const getCurrentCategoryName = () => {
  if (toolsStore.selectedCategory === 'all') return '全部工具'
  if (toolsStore.selectedCategory === 'favorites') return '我的收藏'

  const category = toolsStore.categories.find(c => c.id === toolsStore.selectedCategory)
  return category ? category.name : '未知分类'
}

// 获取当前产品分类名称
const getCurrentProductCategoryName = () => {
  if (selectedProductCategory.value === 'all') return '全部产品'

  const category = productCategories.value.find(c => c.id === selectedProductCategory.value)
  return category ? category.name : '未知分类'
}

// 视图切换
const setCurrentView = (view: 'tools' | 'products') => {
  currentView.value = view
}

// 产品分类切换
const setSelectedProductCategory = (categoryId: string) => {
  selectedProductCategory.value = categoryId
}

// 处理工具点击
const handleToolClick = (tool: any) => {
  toolsStore.incrementClickCount(tool.id)
  window.open(tool.url, '_blank', 'noopener,noreferrer')
}

// 处理产品点击
const handleProductClick = (product: Product) => {
  // 跳转到产品详情页
  console.log('查看产品详情:', product)
}

// 处理购买
const handlePurchase = (product: Product) => {
  // 跳转到支付页面
  console.log('购买产品:', product)
  alert(`即将购买：${product.name} - ¥${product.price}`)
}

// 打开演示
const openDemo = (product: Product) => {
  if (product.demoUrl) {
    window.open(product.demoUrl, '_blank', 'noopener,noreferrer')
  }
}

// 监听全局键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  updateProductCategoryCounts()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Fluent Design 基础样式 */
.fluent-app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #323130;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  outline: none;
}

/* 顶部导航栏 */
.app-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  height: 60px;
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
  border-radius: 50%;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* 主要内容区域 */
.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
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
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.content.sidebar-collapsed {
  margin-left: 0;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
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
}

/* 产品网格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

/* 添加产品按钮 */
.add-product-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-product-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
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

/* 产品卡片 */
.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-price {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  color: #ffb900;
  font-weight: 600;
  font-size: 16px;
}

.original-price {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-decoration: line-through;
}

.product-content {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #323130;
}

.product-description {
  font-size: 14px;
  color: #605e5c;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.product-footer {
  padding: 0 20px 20px;
  display: flex;
  gap: 12px;
}

.buy-btn {
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #0078d4, #106ebe);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.buy-btn:hover {
  background: linear-gradient(135deg, #106ebe, #005a9e);
  transform: translateY(-1px);
}

.demo-btn {
  padding: 10px 16px;
  background: rgba(0, 120, 212, 0.1);
  border: 1px solid rgba(0, 120, 212, 0.2);
  border-radius: 8px;
  color: #0078d4;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:hover {
  background: rgba(0, 120, 212, 0.2);
  border-color: rgba(0, 120, 212, 0.3);
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
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 90;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .content {
    padding: 16px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
}
</style>
