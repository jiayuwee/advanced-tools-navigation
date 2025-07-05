<template>
  <div class="advanced-search-panel" :class="{ 'is-open': isOpen }">
    <div class="panel-header">
      <h3>高级搜索</h3>
      <button class="close-button" @click="$emit('close')">
        <XIcon class="icon" />
      </button>
    </div>

    <div class="panel-content">
      <!-- 分类筛选 -->
      <div class="filter-group">
        <label class="filter-label">分类</label>
        <select v-model="localFilters.category" class="filter-select">
          <option value="">所有分类</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- 标签筛选 -->
      <div class="filter-group">
        <label class="filter-label">标签</label>
        <div class="tags-container">
          <div class="popular-tags">
            <span class="tags-subtitle">热门标签:</span>
            <button
              v-for="tag in popularTags"
              :key="tag"
              class="tag-button"
              :class="{ active: localFilters.tags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
          <input
            v-model="tagInput"
            placeholder="输入自定义标签..."
            class="tag-input"
            @keydown.enter="addCustomTag"
          />
          <div v-if="localFilters.tags.length > 0" class="selected-tags">
            <span class="tags-subtitle">已选标签:</span>
            <span
              v-for="tag in localFilters.tags"
              :key="tag"
              class="selected-tag"
            >
              {{ tag }}
              <button class="tag-remove" @click="removeTag(tag)">×</button>
            </span>
          </div>
        </div>
      </div>

      <!-- 评分筛选 -->
      <div class="filter-group">
        <label class="filter-label">最低评分</label>
        <div class="rating-filter">
          <div class="rating-stars">
            <StarIcon
              v-for="i in 5"
              :key="i"
              :class="{ filled: i <= localFilters.rating }"
              class="star"
              @click="setRating(i)"
            />
          </div>
          <span class="rating-text">{{
            getRatingText(localFilters.rating)
          }}</span>
          <button
            v-if="localFilters.rating > 0"
            class="clear-rating"
            @click="setRating(0)"
          >
            清除
          </button>
        </div>
      </div>

      <!-- 特殊筛选 -->
      <div class="filter-group">
        <label class="filter-label">特殊筛选</label>
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input v-model="localFilters.isFeatured" type="checkbox" />
            <span class="checkbox-label">仅显示特色工具</span>
          </label>
          <label class="checkbox-item">
            <input v-model="localFilters.hasUrl" type="checkbox" />
            <span class="checkbox-label">仅显示可访问工具</span>
          </label>
        </div>
      </div>

      <!-- 排序选项 -->
      <div class="filter-group">
        <label class="filter-label">排序方式</label>
        <div class="sort-options">
          <select v-model="localFilters.sortBy" class="sort-select">
            <option value="name">名称</option>
            <option value="rating">评分</option>
            <option value="clicks">使用次数</option>
            <option value="created_at">创建时间</option>
          </select>
          <button
            class="sort-order-button"
            :title="localFilters.sortOrder === 'asc' ? '升序' : '降序'"
            @click="toggleSortOrder"
          >
            <ArrowUpIcon v-if="localFilters.sortOrder === 'asc'" class="icon" />
            <ArrowDownIcon v-else class="icon" />
          </button>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="filter-group">
        <label class="filter-label">搜索历史</label>
        <div class="search-history">
          <button
            v-for="(search, index) in searchHistory.slice(0, 5)"
            :key="index"
            class="history-item"
            @click="$emit('search', search)"
          >
            <ClockIcon class="icon" />
            {{ search }}
          </button>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="popularSearches.length > 0" class="filter-group">
        <label class="filter-label">热门搜索</label>
        <div class="popular-searches">
          <button
            v-for="search in popularSearches.slice(0, 5)"
            :key="search"
            class="popular-item"
            @click="$emit('search', search)"
          >
            <TrendingUpIcon class="icon" />
            {{ search }}
          </button>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <button class="reset-button" @click="resetFilters">
        <RotateCcwIcon class="icon" />
        重置筛选
      </button>
      <button class="apply-button" @click="applyFilters">
        <SearchIcon class="icon" />
        应用筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  XIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  TrendingUpIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-vue-next";
import { useToolsStore } from "@/stores/tools";
import type { SearchFilters } from "@/composables/useAdvancedSearch";

interface Props {
  isOpen: boolean;
  filters: SearchFilters;
  searchHistory: string[];
  popularSearches: string[];
}

interface Emits {
  (e: "close"): void;
  (e: "update:filters", filters: SearchFilters): void;
  (e: "search", query: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toolsStore = useToolsStore();
const tagInput = ref("");

const localFilters = ref<SearchFilters>({ ...props.filters });

// 监听外部筛选器变化
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true },
);

const categories = computed(() => toolsStore.categories);

const popularTags = computed(() => {
  const tagCounts = new Map<string, number>();

  toolsStore.tools.forEach((tool) => {
    if (tool.tags) {
      tool.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  return Array.from(tagCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
});

const toggleTag = (tag: string) => {
  const index = localFilters.value.tags.indexOf(tag);
  if (index > -1) {
    localFilters.value.tags.splice(index, 1);
  } else {
    localFilters.value.tags.push(tag);
  }
};

const addCustomTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !localFilters.value.tags.includes(tag)) {
    localFilters.value.tags.push(tag);
    tagInput.value = "";
  }
};

const removeTag = (tag: string) => {
  const index = localFilters.value.tags.indexOf(tag);
  if (index > -1) {
    localFilters.value.tags.splice(index, 1);
  }
};

const setRating = (rating: number) => {
  localFilters.value.rating = rating;
};

const getRatingText = (rating: number) => {
  const texts = ["不限", "1星以上", "2星以上", "3星以上", "4星以上", "5星"];
  return texts[rating] || "不限";
};

const toggleSortOrder = () => {
  localFilters.value.sortOrder =
    localFilters.value.sortOrder === "asc" ? "desc" : "asc";
};

const resetFilters = () => {
  localFilters.value = {
    category: "",
    tags: [],
    rating: 0,
    isFeatured: false,
    hasUrl: false,
    sortBy: "name",
    sortOrder: "asc",
  };
  applyFilters();
};

const applyFilters = () => {
  emit("update:filters", { ...localFilters.value });
};

// 实时应用筛选器
watch(
  localFilters,
  () => {
    applyFilters();
  },
  { deep: true },
);
</script>

<style scoped>
.advanced-search-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 600px;
  overflow-y: auto;
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.advanced-search-panel.is-open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-button:hover {
  background: #f0f0f0;
}

.panel-content {
  padding: 20px;
}

.filter-group {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.filter-select,
.sort-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.tags-container {
  space-y: 12px;
}

.tags-subtitle {
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.popular-tags,
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.tag-button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tag-button:hover {
  border-color: #667eea;
}

.tag-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.tag-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.rating-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  width: 16px;
  height: 16px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star.filled {
  color: #ffc107;
}

.star:hover {
  color: #ffeb3b;
}

.rating-text {
  font-size: 14px;
  color: #666;
}

.clear-rating {
  padding: 2px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-select {
  flex: 1;
}

.sort-order-button {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-order-button:hover {
  border-color: #667eea;
}

.search-history,
.popular-searches {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item,
.popular-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
  transition: background 0.2s ease;
}

.history-item:hover,
.popular-item:hover {
  background: #e9ecef;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.reset-button,
.apply-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.reset-button {
  background: #f0f0f0;
  color: #666;
}

.reset-button:hover {
  background: #e0e0e0;
}

.apply-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.apply-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.icon {
  width: 14px;
  height: 14px;
}
</style>
