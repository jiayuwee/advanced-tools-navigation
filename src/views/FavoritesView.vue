<template>
  <div class="favorites-view">
    <div class="container">
      <div class="page-header">
        <h1>我的收藏</h1>
        <p class="subtitle">您收藏的工具和资源</p>
      </div>

      <div v-if="favorites.length === 0" class="empty-state">
        <div class="empty-icon">❤️</div>
        <h2>暂无收藏</h2>
        <p>您还没有收藏任何工具</p>
        <router-link to="/tools" class="browse-btn">
          浏览工具
        </router-link>
      </div>

      <div v-else class="favorites-content">
        <div class="filters-section">
          <div class="filter-group">
            <label for="category-filter">按分类筛选:</label>
            <select 
              v-model="selectedCategory" 
              id="category-filter"
              class="filter-select"
            >
              <option value="">全部</option>
              <option 
                v-for="category in categories" 
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-filter">排序方式:</label>
            <select 
              v-model="sortBy" 
              id="sort-filter"
              class="filter-select"
            >
              <option value="added">添加时间</option>
              <option value="name">名称</option>
              <option value="rating">评分</option>
            </select>
          </div>

          <div class="stats">
            共 {{ filteredFavorites.length }} 个收藏
          </div>
        </div>

        <div class="favorites-grid">
          <div 
            v-for="favorite in filteredFavorites" 
            :key="favorite.id"
            class="favorite-card"
          >
            <div class="card-header">
              <div class="tool-icon">
                <img 
                  :src="favorite.tool.icon || '/default-tool-icon.png'" 
                  :alt="favorite.tool.name"
                />
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ favorite.tool.name }}</h3>
                <p class="tool-category">{{ getCategoryName(favorite.tool.category_id) }}</p>
              </div>
              <button 
                class="remove-btn"
                @click="removeFavorite(favorite.id)"
                title="移除收藏"
              >
                ❌
              </button>
            </div>

            <div class="card-body">
              <p class="tool-description">{{ favorite.tool.description }}</p>
              
              <div class="tool-meta">
                <span class="rating">
                  ⭐ {{ favorite.tool.average_rating?.toFixed(1) || '0.0' }}
                </span>
                <span class="clicks">
                  👁️ {{ favorite.tool.click_count || 0 }}
                </span>
                <span class="featured" v-if="favorite.tool.is_featured">
                  🔥 推荐
                </span>
              </div>
            </div>

            <div class="card-footer">
              <div class="added-date">
                收藏于 {{ formatDate(favorite.created_at) }}
              </div>
              <div class="actions">
                <router-link 
                  :to="`/tool/${favorite.tool.id}`"
                  class="view-btn"
                >
                  查看详情
                </router-link>
                <a 
                  :href="favorite.tool.url" 
                  target="_blank"
                  class="visit-btn"
                  @click="trackVisit(favorite.tool.id)"
                >
                  访问网站
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="page-btn"
          >
            上一页
          </button>
          
          <span class="page-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </span>
          
          <button 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="page-btn"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useCategoriesStore } from '@/stores/categories'
import type { Favorite, Tool } from '@/types'

const favoritesStore = useFavoritesStore()
const categoriesStore = useCategoriesStore()

const favorites = ref<Favorite[]>([])
const selectedCategory = ref('')
const sortBy = ref('added')
const currentPage = ref(1)
const itemsPerPage = ref(12)

const categories = computed(() => categoriesStore.categories)

const filteredFavorites = computed(() => {
  let filtered = favorites.value.filter(favorite => favorite.tool)

  // 按分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(favorite => 
      favorite.tool?.category_id === selectedCategory.value
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'name':
      filtered.sort((a, b) => (a.tool?.name || '').localeCompare(b.tool?.name || ''))
      break
    case 'rating':
      filtered.sort((a, b) => (b.tool?.average_rating || 0) - (a.tool?.average_rating || 0))
      break
    case 'added':
    default:
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
  }

  return filtered
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFavorites.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredFavorites.value.length / itemsPerPage.value)
)

onMounted(async () => {
  await loadFavorites()
})

async function loadFavorites() {
  try {
    await favoritesStore.fetchFavorites()
    favorites.value = favoritesStore.favorites
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

function getCategoryName(categoryId: string): string {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category?.name || '未分类'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

async function removeFavorite(favoriteId: string) {
  if (confirm('确定要移除这个收藏吗？')) {
    try {
      await favoritesStore.removeFavorite(favoriteId)
      favorites.value = favorites.value.filter(fav => fav.id !== favoriteId)
    } catch (error) {
      console.error('移除收藏失败:', error)
      alert('移除收藏失败，请重试')
    }
  }
}

function trackVisit(toolId: string) {
  // 这里可以添加访问统计逻辑
  console.log('访问工具:', toolId)
}
</script>

<style scoped>
.favorites-view {
  min-height: 100vh;
  padding: 2rem;
  background: hsl(var(--background));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  color: hsl(var(--foreground));
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: hsl(var(--muted-foreground));
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: hsl(var(--card));
  border-radius: 1rem;
  border: 1px solid hsl(var(--border));
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: hsl(var(--foreground));
  margin-bottom: 1rem;
}

.empty-state p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.browse-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-btn:hover {
  background: hsl(var(--primary) / 0.9);
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: hsl(var(--card));
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border));
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.stats {
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.favorite-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon img {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  object-fit: cover;
}

.tool-info {
  flex: 1;
}

.tool-name {
  margin: 0;
  color: hsl(var(--foreground));
  font-size: 1.2rem;
  font-weight: 600;
}

.tool-category {
  margin: 0.25rem 0 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: hsl(var(--destructive) / 0.1);
}

.card-body {
  margin-bottom: 1.5rem;
}

.tool-description {
  color: hsl(var(--foreground));
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.rating, .clicks, .featured {
  color: hsl(var(--muted-foreground));
}

.featured {
  color: hsl(var(--destructive));
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.added-date {
  color: hsl(var(--muted-foreground));
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn, .visit-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.view-btn {
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
}

.view-btn:hover {
  background: hsl(var(--secondary) / 0.8);
}

.visit-btn {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
}

.visit-btn:hover {
  background: hsl(var(--primary) / 0.9);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: hsl(var(--secondary));
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: hsl(var(--muted-foreground));
}

@media (max-width: 768px) {
  .favorites-view {
    padding: 1rem;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    justify-content: center;
  }
}
</style>
