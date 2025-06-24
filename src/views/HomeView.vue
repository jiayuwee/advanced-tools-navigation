<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">🚀 工具导航站</h1>
        <p class="hero-subtitle">发现和管理您的常用工具，让工作更高效</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ toolsStore.tools.length }}</span>
            <span class="stat-label">精选工具</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ toolsStore.categories.length }}</span>
            <span class="stat-label">工具分类</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalClicks }}</span>
            <span class="stat-label">总访问量</span>
          </div>
        </div>
        <div class="hero-actions">
          <router-link to="/tools" class="btn btn-primary">
            <SearchIcon class="icon" />
            浏览工具
          </router-link>
          <router-link to="/products" class="btn btn-secondary">
            <ShoppingBagIcon class="icon" />
            查看产品
          </router-link>
        </div>
      </div>
    </section>

    <!-- 推荐工具 -->
    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-title">🌟 推荐工具</h2>
        <p class="section-subtitle">精心挑选的优质工具，助力您的工作效率</p>
      </div>
      
      <div v-if="toolsStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载推荐工具...</p>
      </div>
      
      <div v-else-if="toolsStore.featuredTools.length > 0" class="tools-grid">
        <div
          v-for="tool in toolsStore.featuredTools"
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
            </div>
            <ExternalLinkIcon class="external-icon" />
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">🌟</div>
        <h3>暂无推荐工具</h3>
        <p>管理员还没有设置推荐工具</p>
      </div>
    </section>

    <!-- 热门工具 -->
    <section class="popular-section">
      <div class="section-header">
        <h2 class="section-title">🔥 热门工具</h2>
        <p class="section-subtitle">最受欢迎的工具，基于用户访问量排序</p>
      </div>
      
      <div v-if="toolsStore.popularTools.length > 0" class="popular-list">
        <div
          v-for="(tool, index) in toolsStore.popularTools"
          :key="tool.id"
          class="popular-item"
          @click="handleToolClick(tool)"
        >
          <div class="rank-badge">{{ index + 1 }}</div>
          <div class="tool-info">
            <div class="tool-icon">{{ tool.icon || '🔧' }}</div>
            <div class="tool-details">
              <h4 class="tool-name">{{ tool.name }}</h4>
              <p class="tool-category">{{ tool.category.name }}</p>
            </div>
          </div>
          <div class="tool-stats">
            <span class="click-count">{{ tool.clickCount }} 次访问</span>
            <ExternalLinkIcon class="external-icon" />
          </div>
        </div>
      </div>
    </section>

    <!-- 分类概览 -->
    <section class="categories-section">
      <div class="section-header">
        <h2 class="section-title">📂 工具分类</h2>
        <p class="section-subtitle">按分类浏览工具，快速找到您需要的</p>
      </div>
      
      <div class="categories-grid">
        <router-link
          v-for="category in toolsStore.categories"
          :key="category.id"
          :to="`/tools?category=${category.id}`"
          class="category-card"
          :style="{ '--category-color': category.color }"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <h3 class="category-name">{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
          <div class="category-count">{{ category.count }} 个工具</div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from '../stores/tools'
import {
  SearchIcon,
  ShoppingBagIcon,
  StarIcon,
  EyeIcon,
  ExternalLinkIcon,
} from 'lucide-vue-next'

const router = useRouter()
const toolsStore = useToolsStore()

// 计算属性
const totalClicks = computed(() => {
  return toolsStore.tools.reduce((total, tool) => total + tool.clickCount, 0)
})

// 处理工具点击
const handleToolClick = async (tool: any) => {
  await toolsStore.incrementClickCount(tool.id)
  window.open(tool.url, '_blank', 'noopener,noreferrer')
}

// 初始化
onMounted(async () => {
  if (!toolsStore.initialized) {
    await toolsStore.initialize()
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 英雄区域 */
.hero-section {
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
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

/* 内容区域 */
.featured-section,
.popular-section,
.categories-section {
  padding: 60px 20px;
  background: white;
}

.featured-section {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), white);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #323130;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #605e5c;
  max-width: 600px;
  margin: 0 auto;
}

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e1dfdd;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  gap: 0.5rem;
  color: #605e5c;
  font-size: 0.875rem;
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.external-icon {
  width: 16px;
  height: 16px;
  color: #605e5c;
}

/* 热门工具列表 */
.popular-list {
  max-width: 800px;
  margin: 0 auto;
}

.popular-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rank-badge {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 1rem;
}

.tool-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 1rem;
}

.tool-details h4 {
  margin: 0;
  font-weight: 600;
  color: #323130;
}

.tool-category {
  margin: 0;
  color: #605e5c;
  font-size: 0.875rem;
}

.click-count {
  color: #605e5c;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

/* 分类网格 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid #e1dfdd;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--category-color);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #323130;
}

.category-description {
  color: #605e5c;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.category-count {
  color: var(--category-color);
  font-weight: 600;
  font-size: 0.875rem;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 3rem;
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

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #605e5c;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .tools-grid,
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .popular-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .tool-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
