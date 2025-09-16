<template>
  <div class="tools-view">
    <!-- 过滤器和排序 -->
    <div class="filters-bar">
      <div class="filters-content">
        <div class="filter-group search-group">
          <div class="search-container">
            <SearchIcon class="search-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索工具..."
              class="search-input"
              @input="handleSearch"
              @focus="showAdvancedSearch = false"
            />
            <button
              v-if="searchQuery"
              class="clear-search"
              @click="clearSearch"
            >
              <XIcon class="icon" />
            </button>
            <button
              class="advanced-search-button"
              :class="{ active: showAdvancedSearch }"
              title="高级搜索"
              @click="showAdvancedSearch = !showAdvancedSearch"
            >
              <FilterIcon class="icon" />
            </button>

            <!-- 高级搜索面板 -->
            <AdvancedSearchPanel
              :is-open="showAdvancedSearch"
              :filters="filters"
              :search-history="searchHistory"
              :popular-searches="popularSearches"
              @close="showAdvancedSearch = false"
              @update:filters="updateFilters"
              @search="handleAdvancedSearch"
            />
          </div>
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

        <div class="filter-group">
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
        <div v-for="tool in filteredTools" :key="tool.id" class="tool-card">
          <div class="card-header">
            <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
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
                {{ tool.click_count || 0 }}
              </span>
              <span class="stat">
                <FolderIcon class="stat-icon" />
                {{ tool.categories?.name || "未分类" }}
              </span>
            </div>
            <div class="tool-actions">
              <button
                class="detail-button"
                title="查看详情"
                @click.stop="goToToolDetail(tool.id)"
              >
                <InfoIcon class="icon" />
              </button>
              <button
                class="visit-button"
                title="访问工具"
                @click.stop="handleToolClick(tool)"
              >
                <ExternalLinkIcon class="icon" />
              </button>
            </div>
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
            <div class="tool-icon">{{ tool.icon || "🔧" }}</div>
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
              <span
                v-for="tag in (tool.tags || []).slice(0, 2)"
                :key="tag"
                class="tag"
              >
                {{ tag }}
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
        <p v-else>暂无工具数据，请稍后再试</p>
        <div class="empty-actions">
          <button
            v-if="searchQuery"
            class="btn btn-primary"
            @click="clearSearch"
          >
            清除搜索条件
          </button>
          <button
            v-if="selectedCategory !== 'all'"
            class="btn btn-secondary"
            @click="selectedCategory = 'all'"
          >
            查看全部分类
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToolsStore } from "../stores/tools";
import { useAdvancedSearch } from "@/composables/useAdvancedSearch";
import AdvancedSearchPanel from "@/components/search/AdvancedSearchPanel.vue";
import {
  SearchIcon,
  XIcon,
  GripIcon as GridIcon,
  ListIcon,
  StarIcon,
  EyeIcon,
  FolderIcon,
  ExternalLinkIcon,
  InfoIcon,
  FilterIcon,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const toolsStore = useToolsStore();

// 高级搜索功能
const {
  searchQuery,
  filters,
  searchResults,
  searchSuggestions,
  popularSearches,
  searchHistory,
  isSearching,
  search,
  clearSearch,
  resetFilters,
} = useAdvancedSearch();

// 响应式状态
const searchInput = ref<HTMLInputElement>();
const selectedCategory = ref("all");
const sortBy = ref("name");
const showAdvancedSearch = ref(false);
const showFavoritesOnly = ref(false);
const viewMode = ref<"grid" | "list">("grid");

// 计算属性
const filteredTools = computed(() => {
  // 如果有搜索查询，使用高级搜索结果
  if (searchQuery.value.trim()) {
    return searchResults.value.map((result) => result.item);
  }

  let tools = toolsStore.filteredTools;

  // 收藏过滤
  if (showFavoritesOnly.value) {
    // TODO: 实际应用中需要从收藏服务获取用户收藏的工具ID列表
    // 这里作为示例，显示所有工具
    console.warn('收藏功能尚未完全实现');
    // tools = tools.filter((tool) => tool.is_favorite);
  }

  // 排序
  tools = [...tools].sort((a, b) => {
    switch (sortBy.value) {
      case "click_count":
        return b.click_count - a.click_count;
      case "created_at":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return tools;
});

// 方法
const handleSearch = () => {
  toolsStore.setSearchQuery(searchQuery.value);
};

const updateFilters = (newFilters: typeof filters) => {
  Object.assign(filters, newFilters);
};

const handleAdvancedSearch = (query: string) => {
  search(query);
  showAdvancedSearch.value = false;
};

const goToToolDetail = (toolId: string) => {
  router.push(`/tools/${toolId}`);
};

const handleToolClick = async (tool: any) => {
  console.log("点击工具:", tool.name, "URL:", tool.url);

  if (!tool.url || tool.url.trim() === "") {
    console.warn("工具URL为空:", tool);
    alert("该工具暂无可用链接");
    return;
  }

  try {
    // 确保URL格式正确
    let url = tool.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    await toolsStore.incrementClickCount(tool.id);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("打开链接失败:", error);
    alert("无法打开该链接，请检查URL是否正确");
  }
};

const retryLoad = async () => {
  toolsStore.clearError();
  await toolsStore.initialize();
};

// 监听路由参数
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.category && typeof newQuery.category === "string") {
      selectedCategory.value = newQuery.category;
    }
    if (newQuery.search && typeof newQuery.search === "string") {
      searchQuery.value = newQuery.search;
      toolsStore.setSearchQuery(newQuery.search);
    }
  },
  { immediate: true },
);

// 监听分类变化
watch(selectedCategory, (newCategory) => {
  toolsStore.setSelectedCategory(newCategory);
  // 更新 URL 参数
  const query = { ...route.query };
  if (newCategory === "all") {
    delete query.category;
  } else {
    query.category = newCategory;
  }
  router.replace({ query });
});

// 监听搜索变化
watch(searchQuery, (newQuery) => {
  const query = { ...route.query };
  if (newQuery) {
    query.search = newQuery;
  } else {
    delete query.search;
  }
  router.replace({ query });
});

// 初始化
onMounted(async () => {
  if (!toolsStore.initialized) {
    await toolsStore.initialize();
  }
});
</script>

<style scoped>
.tools-view {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 过滤器栏 */
.filters-bar {
  background: white;
  border-bottom: 1px solid #e1dfdd;
  padding: 1rem 2rem;
}

.filters-content {
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

.search-group {
  flex: 1;
  max-width: 400px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #605e5c;
}

.search-input {
  width: 100%;
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
  right: 40px;
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

.advanced-search-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #666;
}

.advanced-search-button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.advanced-search-button.active {
  background: #667eea;
  color: white;
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

.results-info {
  margin-left: auto;
}

.results-count {
  color: #605e5c;
  font-size: 0.875rem;
}

/* 工具内容 */
.tools-content {
  padding: 2rem;
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

.tool-actions {
  display: flex;
  gap: 8px;
}

.detail-button,
.visit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-button {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.detail-button:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.visit-button {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.visit-button:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: translateY(-1px);
}

.detail-button .icon,
.visit-button .icon {
  width: 16px;
  height: 16px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  .filters-bar {
    padding: 1rem;
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-group {
    max-width: none;
  }

  .filter-group {
    justify-content: space-between;
  }

  .results-info {
    margin-left: 0;
    text-align: center;
  }

  .tools-content {
    padding: 1rem;
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
