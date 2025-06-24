<template>
  <div class="tools-view">
    <!-- 工具页面头部 -->
    <div class="tools-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">🔧 工具导航</h1>
          <p class="page-subtitle">发现和管理您的常用工具</p>
        </div>
        
        <div class="header-right">
          <div class="search-container">
            <SearchIcon class="search-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索工具..."
              class="search-input"
              @input="handleSearch"
            />
            <button
              v-if="searchQuery"
              class="clear-search"
              @click="clearSearch"
            >
              <XIcon class="icon" />
            </button>
          </div>
          
          <div class="view-options">
            <button
              class="view-button"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <GridIcon class="icon" />
            </button>
            <button
              class="view-button"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <ListIcon class="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 过滤器和排序 -->
    <div class="filters-bar">
      <div class="filters-content">
        <div class="filter-group">
          <label class="filter-label">分类：</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="all">全部分类</option>
            <option
              v-for="category in toolsStore.categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">排序：</label>
          <select v-model="sortBy" class="filter-select">
            <option value="name">名称</option>
            <option value="click_count">热度</option>
            <option value="created_at">最新</option>
          </select>
        </div>
        
        <div class="filter-group">
          <button
            class="filter-button"
            :class="{ active: showFavoritesOnly }"
            @click="showFavoritesOnly = !showFavoritesOnly"
          >
            <StarIcon class="icon" />
            只看收藏
          </button>
        </div>
        
        <div class="results-info">
          <span class="results-count">
            找到 {{ filteredTools.length }} 个工具
          </span>
        </div>
      </div>
    </div>

    <!-- 工具内容区域 -->
    <div class="tools-content">
      <!-- 加载状态 -->
      <div v-if="toolsStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载工具...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="toolsStore.error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>加载失败</h3>
        <p>{{ toolsStore.error }}</p>
        <button class="retry-button" @click="retryLoad">重试</button>
      </div>
      
      <!-- 工具网格视图 -->
      <div
        v-else-if="filteredTools.length > 0 && viewMode === 'grid'"
        class="tools-grid"
      >
        <div
          v-for="tool in filteredTools"
          :key="tool.id"
          class="tool-card"
          @click="handleToolClick(tool)"
        >
          <div class="card-header">
            <div class="tool-icon">{{ tool.icon || '🔧' }}</div>
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
              <span v-for="tag in tool.tags.slice(0, 3)" :key="tag.id" class="tag">
                {{ tag.name }}
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
              <span class="stat">
                <FolderIcon class="stat-icon" />
                {{ tool.category.name }}
              </span>
            </div>
            <ExternalLinkIcon class="external-icon" />
          </div>
        </div>
      </div>
      
      <!-- 工具列表视图 -->
      <div
        v-else-if="filteredTools.length > 0 && viewMode === 'list'"
        class="tools-list"
      >
        <div
          v-for="tool in filteredTools"
          :key="tool.id"
          class="tool-item"
          @click="handleToolClick(tool)"
        >
          <div class="item-left">
            <div class="tool-icon">{{ tool.icon || '🔧' }}</div>
            <div class="tool-info">
              <h3 class="tool-name">{{ tool.name }}</h3>
              <p class="tool-description">{{ tool.description }}</p>
              <div class="tool-meta">
                <span class="category">{{ tool.category.name }}</span>
                <span class="separator">•</span>
                <span class="clicks">{{ tool.clickCount }} 次访问</span>
              </div>
            </div>
          </div>
          
          <div class="item-right">
            <div class="tool-tags">
              <span v-for="tag in tool.tags.slice(0, 2)" :key="tag.id" class="tag">
                {{ tag.name }}
              </span>
            </div>
            <div class="tool-actions">
              <button
                class="favorite-button"
                :class="{ active: tool.isFavorite }"
                @click.stop="toolsStore.toggleFavorite(tool.id)"
              >
                <StarIcon class="icon" />
              </button>
              <ExternalLinkIcon class="external-icon" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到相关工具</h3>
        <p v-if="searchQuery">
          没有找到包含 "{{ searchQuery }}" 的工具，尝试使用其他关键词搜索
        </p>
        <p v-else-if="selectedCategory !== 'all'">
          该分类下暂无工具，请选择其他分类
        </p>
        <p v-else>
          暂无工具数据，请稍后再试
        </p>
        <div class="empty-actions">
          <button v-if="searchQuery" class="btn btn-primary" @click="clearSearch">
            清除搜索条件
          </button>
          <button v-if="selectedCategory !== 'all'" class="btn btn-secondary" @click="selectedCategory = 'all'">
            查看全部分类
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToolsStore } from '../stores/tools'
import {
  SearchIcon,
  XIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  EyeIcon,
  FolderIcon,
  ExternalLinkIcon,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toolsStore = useToolsStore()

// 响应式状态
const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('name')
const showFavoritesOnly = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

// 计算属性
const filteredTools = computed(() => {
  let tools = toolsStore.filteredTools

  // 收藏过滤
  if (showFavoritesOnly.value) {
    tools = tools.filter(tool => tool.isFavorite)
  }

  // 排序
  tools = [...tools].sort((a, b) => {
    switch (sortBy.value) {
      case 'click_count':
        return b.clickCount - a.clickCount
      case 'created_at':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return tools
})

// 方法
const handleSearch = () => {
  toolsStore.setSearchQuery(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  toolsStore.setSearchQuery('')
}

const handleToolClick = async (tool: any) => {
  await toolsStore.incrementClickCount(tool.id)
  window.open(tool.url, '_blank', 'noopener,noreferrer')
}

const retryLoad = async () => {
  toolsStore.clearError()
  await toolsStore.initialize()
}

// 监听路由参数
watch(() => route.query, (newQuery) => {
  if (newQuery.category && typeof newQuery.category === 'string') {
    selectedCategory.value = newQuery.category
  }
  if (newQuery.search && typeof newQuery.search === 'string') {
    searchQuery.value = newQuery.search
    toolsStore.setSearchQuery(newQuery.search)
  }
}, { immediate: true })

// 监听分类变化
watch(selectedCategory, (newCategory) => {
  toolsStore.setSelectedCategory(newCategory)
  // 更新 URL 参数
  const query = { ...route.query }
  if (newCategory === 'all') {
    delete query.category
  } else {
    query.category = newCategory
  }
  router.replace({ query })
})

// 监听搜索变化
watch(searchQuery, (newQuery) => {
  const query = { ...route.query }
  if (newQuery) {
    query.search = newQuery
  } else {
    delete query.search
  }
  router.replace({ query })
})

// 初始化
onMounted(async () => {
  if (!toolsStore.initialized) {
    await toolsStore.initialize()
  }
})
</script>

<style scoped>
.tools-view {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.tools-header {
  background: white;
  border-bottom: 1px solid #e1dfdd;
  padding: 2rem 1.5rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #323130;
}

.page-subtitle {
  margin: 0;
  color: #605e5c;
  font-size: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #605e5c;
}

.search-input {
  width: 300px;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e1dfdd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #605e5c;
}

.clear-search:hover {
  background: #f3f2f1;
}

.view-options {
  display: flex;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  overflow: hidden;
}

.view-button {
  background: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #605e5c;
}

.view-button:hover {
  background: #f3f2f1;
}

.view-button.active {
  background: #0078d4;
  color: white;
}

/* 过滤器栏 */
.filters-bar {
  background: white;
  border-bottom: 1px solid #e1dfdd;
  padding: 1rem 1.5rem;
}

.filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #323130;
  font-size: 0.875rem;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  min-width: 120px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 12px;
  border: 1px solid #e1dfdd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.filter-button:hover {
  background: #f3f2f1;
}

.filter-button.active {
  background: #fff4ce;
  border-color: #ffb900;
  color: #8a6914;
}

.results-info {
  margin-left: auto;
}

.results-count {
  color: #605e5c;
  font-size: 0.875rem;
}

/* 工具内容 */
.tools-content {
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 网格视图 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e1dfdd;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tool-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f2f1;
  border-radius: 8px;
}

.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #605e5c;
}

.favorite-button:hover {
  background: #f3f2f1;
}

.favorite-button.active {
  color: #ffb900;
}

.tool-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #323130;
}

.tool-description {
  color: #605e5c;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: #f3f2f1;
  color: #323130;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #605e5c;
  font-size: 0.875rem;
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.external-icon {
  width: 16px;
  height: 16px;
  color: #605e5c;
}

/* 列表视图 */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e1dfdd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.tool-info {
  flex: 1;
}

.tool-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #605e5c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.separator {
  color: #c8c6c4;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 状态组件 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #605e5c;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f2f1;
  border-top: 4px solid #0078d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #0078d4;
  color: white;
}

.btn-primary:hover {
  background: #106ebe;
}

.btn-secondary {
  background: transparent;
  color: #0078d4;
  border: 1px solid #0078d4;
}

.btn-secondary:hover {
  background: #f3f9fd;
}

.retry-button {
  background: #0078d4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.retry-button:hover {
  background: #106ebe;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .results-info {
    margin-left: 0;
    text-align: center;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .item-left {
    flex-direction: column;
    text-align: center;
  }
  
  .item-right {
    justify-content: center;
  }
}
</style>
