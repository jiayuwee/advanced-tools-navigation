<template>
  <div class="search-results-view">
    <div class="container">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-info">
          <h1>搜索结果</h1>
          <p v-if="searchQuery">
            关于 "<strong>{{ searchQuery }}</strong
            >" 的搜索结果
            <span v-if="searchResult">({{ searchResult.total }} 个结果)</span>
          </p>
        </div>

        <!-- 重新搜索 -->
        <div class="search-box">
          <EnhancedSearchBox
            :initial-query="searchQuery"
            placeholder="重新搜索..."
            @search="handleNewSearch"
          />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在搜索...</p>
      </div>

      <!-- 搜索结果 -->
      <div v-else-if="searchResult" class="search-results">
        <!-- 搜索统计 -->
        <div class="search-stats">
          <p>
            找到 {{ searchResult.total }} 个结果，用时
            {{ searchResult.searchTime }}ms
          </p>
          <div class="search-filters">
            <select v-model="currentType" @change="filterResults">
              <option value="all">全部类型</option>
              <option value="tools">工具</option>
              <option value="products">产品</option>
              <option value="categories">分类</option>
            </select>
          </div>
        </div>

        <!-- 搜索建议 -->
        <div
          v-if="searchResult.suggestions.length > 0"
          class="search-suggestions"
        >
          <h3>相关建议</h3>
          <div class="suggestions-list">
            <button
              v-for="suggestion in searchResult.suggestions"
              :key="suggestion"
              class="suggestion-tag"
              @click="searchSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- 结果列表 -->
        <div class="results-content">
          <!-- 工具结果 -->
          <div v-if="toolResults.length > 0" class="results-section">
            <h2>工具 ({{ toolResults.length }})</h2>
            <div class="tools-grid">
              <div
                v-for="tool in toolResults"
                :key="tool.id"
                class="tool-card"
                @click="openTool(tool)"
              >
                <div class="tool-icon">{{ tool.icon }}</div>
                <div class="tool-info">
                  <h3>{{ tool.name }}</h3>
                  <p>{{ tool.description }}</p>
                  <div class="tool-meta">
                    <span class="category">{{ tool.category?.name }}</span>
                    <span class="clicks">{{ tool.clickCount }} 次使用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 产品结果 -->
          <div v-if="productResults.length > 0" class="results-section">
            <h2>产品 ({{ productResults.length }})</h2>
            <div class="products-grid">
              <div
                v-for="product in productResults"
                :key="product.id"
                class="product-card"
                @click="openProduct(product)"
              >
                <div class="product-image">
                  <img :src="product.imageUrl" :alt="product.name" />
                </div>
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p>{{ product.description }}</p>
                  <div class="product-meta">
                    <span class="price">¥{{ product.price }}</span>
                    <span class="rating">★ {{ product.rating }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无结果 -->
          <div v-if="searchResult.total === 0" class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>未找到相关结果</h3>
            <p>尝试使用不同的关键词或检查拼写</p>
            <div class="search-tips">
              <h4>搜索建议：</h4>
              <ul>
                <li>使用更通用的关键词</li>
                <li>检查拼写是否正确</li>
                <li>尝试使用同义词</li>
                <li>减少搜索词的数量</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>搜索出错</h3>
        <p>{{ error }}</p>
        <button class="retry-button" @click="performSearch">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { searchService } from "@/services/searchService";
import EnhancedSearchBox from "@/components/search/EnhancedSearchBox.vue";
import type { SearchResult } from "@/services/searchService";

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const error = ref<string | null>(null);
const searchResult = ref<SearchResult<any> | null>(null);
const searchQuery = ref("");
const currentType = ref("all");

// 计算属性
const toolResults = computed(() => {
  if (!searchResult.value) return [];
  // 搜索服务返回的工具数据
  return searchResult.value.items.filter(
    (item) =>
      item.type === "tool" ||
      !item.type ||
      item.hasOwnProperty("clickCount") ||
      item.hasOwnProperty("category_id")
  );
});

const productResults = computed(() => {
  if (!searchResult.value) return [];
  // 搜索服务返回的产品数据
  return searchResult.value.items.filter(
    (item) =>
      item.type === "product" ||
      item.hasOwnProperty("price") ||
      item.hasOwnProperty("rating")
  );
});

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;

  try {
    loading.value = true;
    error.value = null;

    const result = await searchService.search({
      query: searchQuery.value,
      type: currentType.value as any,
      limit: 50,
    });

    searchResult.value = result;
  } catch (err) {
    error.value = "搜索失败，请稍后重试";
    console.error("搜索错误:", err);
  } finally {
    loading.value = false;
  }
};

const handleNewSearch = (result: SearchResult<any>) => {
  searchResult.value = result;
  searchQuery.value = result.query;

  // 更新URL
  router.push({
    name: "SearchResults",
    query: { q: result.query, type: currentType.value },
  });
};

const searchSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  performSearch();
};

const filterResults = () => {
  performSearch();
};

const openTool = (tool: any) => {
  // 增加点击计数
  if (tool.url) {
    window.open(tool.url, "_blank");
  } else {
    router.push(`/tools/${tool.id}`);
  }
};

const openProduct = (product: any) => {
  router.push(`/product/${product.id}`);
};

// 生命周期
onMounted(() => {
  searchQuery.value = (route.query.q as string) || "";
  currentType.value = (route.query.type as string) || "all";

  if (searchQuery.value) {
    performSearch();
  }
});

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = (newQuery.q as string) || "";
    currentType.value = (newQuery.type as string) || "all";

    if (searchQuery.value) {
      performSearch();
    }
  }
);
</script>

<style scoped>
.search-results-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-header {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-info h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 10px 0;
}

.search-info p {
  color: #64748b;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-filters select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 14px;
}

.search-suggestions {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.suggestion-tag {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-tag:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.results-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.results-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 20px 0;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.tool-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
}

.tool-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 5px 0;
}

.tool-info p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.tool-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #94a3b8;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.product-image {
  height: 150px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 5px 0;
}

.product-info p {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.price {
  color: #dc2626;
  font-weight: 600;
}

.rating {
  color: #f59e0b;
}

.loading-state,
.error-state,
.no-results {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-results-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.search-tips {
  text-align: left;
  max-width: 400px;
  margin: 20px auto 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.search-tips h4 {
  margin: 0 0 10px 0;
  color: #374151;
}

.search-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.retry-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
}

.retry-button:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .search-header {
    padding: 20px;
  }

  .search-stats {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
